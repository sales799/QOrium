# QOrium Anti-Leak Engine v0 — Design Specification

**Author:** CTO Office  
**Date:** 2026-05-02  
**Status:** v0 Design (dependencies: B7 schema live, Serper API key acquisition pending via browser walk, SME Lead + I/O Psych contractor onboarding pending)  
**References:** Constitution SO-9 (24h leak rotation), SO-21 (IRT mandatory), SO-22 (≥93% AI plagiarism check)

---

## 1. Goal

Detect and rotate leaked assessment questions within 24 hours (SO-9 mandate). Deliver per-client variants with cryptographic watermarks to enable forensic attribution. Preserve master question integrity; never expose raw authorial versions to multiple customers.

---

## 2. Architecture: 3 Core Components

### 2.1 Crawler (qorium-leak-crawler PM2 service)

**Trigger:** Daily scheduled cron job at 02:00 IST.  
**Execution model:** Per B10 service spec; runs as PM2 fork-mode stateful worker.

**Data sources (priority order):**
1. GeeksforGeeks company-tagged archive (Glassdoor questions)
2. LeetCode Discuss (company interview threads)
3. GitHub repos with pattern: `interview-questions`, `company-interview`, `coding-challenge`
4. Serper.dev API (programmatic Google Search): top-20 results per query
5. Bing Search API (fallback if Serper fails)

**Query strategy:** For each released question in content.questions (status='released'), extract top-5 longest unique n-grams (9–15 words). Issue up to 20 queries per question to Serper. Queries throttled to 60 req/min per Serper's rate limit. With 5K questions × 20 queries/q = 100K queries/day, parallelized across 4 worker threads (divide by 4 = 25K queries/thread), and 60 req/min per thread = 417 queries/hour = 10K/day per thread. 4 threads = 40K/day total. But we're hitting 60 req/min global limit, so sequential execution takes 100K / 60 = 1,667 minutes = ~28 hours. With 4 workers: 28 / 4 = 7 hours. Fits 02:00–09:00 IST window.

**Crawler output:** For each query, scrape top-3 results, extract 500-char snippet surrounding match, store in temporary crawl_results table with (question_uuid, source_url, snippet, source_type, crawl_timestamp).

### 2.2 Detector (Similarity scoring + Classification)

**Implementation:** Nightly batch job triggered post-crawl.

**Similarity scoring:**
- **Embedding-based:** Generate dense embeddings for each crawled snippet (via Anthropic Embeddings API or local embeddings). Compute cosine similarity against content.questions body_md embeddings (pre-computed weekly). Threshold: >0.85 = suspected leak.
- **Lexical overlap:** Tokenize snippet and question body; compute Jaccard index. Threshold: >70% token overlap.

**3-tier classification:**
1. **Confirmed leak:** cosine >0.92 AND lexical >70% = HIGH confidence. Auto-trigger rotation.
2. **Suspected leak:** cosine 0.85–0.92 OR lexical 60–70% = MEDIUM confidence. Flag for SME Lead manual review (24h SLA).
3. **False positive:** cosine <0.85 OR lexical <60% = LOW confidence. Dismiss automatically; log for analysis.

**Output:** Insert rows into content.leak_alerts with (question_id, source_url, similarity_score, severity, status='detected').

### 2.3 Rotator (Auto-regeneration + Deployment)

**Trigger:** On confirmed leak or manual SME-Lead approval of suspected leak.

**Pipeline:**
1. Mark original question status='leaked' in content.questions.
2. Generate variant via AI pipeline:
   - Call Anthropic Opus with system prompt: "Preserve technical correctness, difficulty (±0.2 IRT units), and discrimination. Change surface form only: variable names, comment style, test case values, scenario wording."
   - Prompt engineered with: original question body + difficulty_b + discrimination_a target + watermark_seed.
   - Returns variant_question (same structure, different text).
3. **SME Lead approval gate:** For sensitive/high-stakes items, pause before deployment; await SME lead 24h manual review.
4. **Deploy variant:**
   - Insert variant into content.questions with status='released', parent_question_id=original_id, watermark_seed=customer-specific marker.
   - Update Stack-Vault customers' private APIs to serve variant on next request.
   - For ReadyBank: add variant to shared library; deprecate original; trigger automatic quarterly rotation for other customers.
   - For JD-Forge: future generated packs will NOT include leaked original; new generation uses variant corpus.
5. **Revoke old question:** Set original question status='deprecated', released_at=NULL, deprecated_at=NOW(), rotated_to_question_id=variant.id.

**SLA:** Confirmed leak → variant deployed within 6 hours (human gate adds up to 24h for sensitive items).

---

## 3. Watermark Scheme (Per-Client Variant Generation)

**Goal:** Enable forensic attribution if a Stack-Vault question appears on public sites.

**Mechanism:** Deterministic variant generation using HMAC-based seed:
```
watermark_seed = HMAC-SHA256(
  key=stack_vault.watermark_secret,
  message=concat(tenant_id, question_id, "watermark")
)
```

Each watermark seed deterministically controls 3–5 minor textual perturbations applied to question:

1. **Variable name suffix:** Append 2–3 chars derived from watermark_seed[0:8].
   - Example: `crc_value` becomes `crc_value_7f` if seed starts with `7f`.
2. **Test case values:** Modify non-critical numeric values in test cases (multiply by 1 + (seed_char % 10) / 100 = add 0–9%).
3. **Scenario text:** Synonym replacement on 2–3 adjectives (e.g., "fast" → "rapid" or "speedy" selected from deterministic dict based on seed).
4. **Comment style:** Change from C++ style (`//`) to C style (`/* */`) or vice versa based on seed parity.
5. **Function ordering:** Reorder non-dependent helper functions in code snippets based on seed.

**Key properties:**
- Deterministic: same seed always produces same variant.
- Lossless: variant preserves technical correctness; difficulty_b/discrimination_a unchanged.
- Minimal: changes are cosmetic; no semantic alteration.
- Multi-marker: 3–5 independent markers provide forensic redundancy.

**Leakage scenario:** If variant appears on LeetCode with watermark markers visible (variable suffix `_7f`, numeric +5%, etc.), Bosch forensics can query: "which customer has watermark_secret that hashes to 0x7f..."  and identify the customer accountable.

---

## 4. Per-Client Variant Ratio & Rotation Cycle

**Target ratio:** 1 master question → up to 10 customer-specific variants per question in production at any time.

**Rotation cycle:** 24-hour detection window (SO-9). If leak detected at timestamp T, variant deployed by T+6h; original deprecated; customers see variant on next fetch (typically within 1h of rotation, unless cached). After 30 days, original question can be re-released with new watermark if leak risk subsides (requires SME Lead sign-off).

**Multi-customer scenario:** Bosch and TCS both subscribe to Stack-Vault. Same question question_id=123:
- Master: body_md="CAN message dispatcher with priority queue..."
- Bosch variant (watermark_seed=bosch_xyz): variable names have suffix `_bx`, test values +3%.
- TCS variant (watermark_seed=tcs_abc): variable names have suffix `_ta`, test values +7%, comment style swapped.
- Both variants in content.questions with different watermark_id values; both have parent_question_id=123.

---

## 5. Database Touchpoints

**Table: content.leak_alerts** (already in B7 schema):
- question_id (FK)
- source_url
- source_type (glassdoor, reddit, gfg, github, etc.)
- similarity_score (0.0–1.0)
- severity (low, medium, high, critical)
- status (detected, under_review, rotated, dismissed, false_positive)
- rotated_to_question_id (FK to new variant)
- evidence_jsonb (snippet, matching text, screenshot hash)
- reviewed_by (SME Lead user_id)
- review_notes (text)

**Table: audit.events** (append-only):
- Every leak detection, rotation, and manual review logged with event_type='leak.detected', 'leak.rotated', 'leak.dismissed', etc.
- actor_id, changes (old question_id → new variant_id), payload (similarity_score, evidence).

**Table: content.questions** (updated):
- status column now includes 'leaked' state.
- parent_question_id links variants to master.
- watermark_id (for Stack-Vault only) enables forensic lookup.

---

## 6. Detection Thresholds

| Metric | Threshold | Action |
|---|---|---|
| Cosine similarity | >0.92 | Confirmed leak → auto-rotate |
| Cosine + Lexical overlap | 0.85–0.92 + >70% | Suspected leak → SME review (24h SLA) |
| Lexical overlap only | >70% (if cosine <0.85) | Medium confidence → SME review |
| Cosine <0.85, Lexical <60% | Any | False positive → dismiss, log |

---

## 7. Variant Generation Pipeline

**Inputs:**
- Master question (body_md, body_json, test_cases, rubric, answer_key)
- difficulty_b (current IRT parameter)
- discrimination_a (current IRT parameter)
- watermark_seed (per-customer HMAC)

**Process:**
```
Anthropic API call with system prompt:
  "Rewrite this [format] question to create a semantic variant.
   CONSTRAINTS:
   - Preserve technical correctness (all logic, algorithms, APIs remain valid).
   - Preserve difficulty (new variant must score ±0.2 IRT b-units on reference panel).
   - Preserve discrimination (a-parameter should stay within ±0.1).
   - Change surface form only: variable names, comments, test data, scenario flavor.
   - Apply deterministic perturbations based on watermark_seed: [seed instructions].
   
   Question: [body_md]
   Format: [format]
   Test cases: [test_cases]
   Target difficulty_b: [difficulty_b]
   Watermark seed: [hex seed]
   
   Return valid JSON matching the original format schema."
```

**Validation loop (max 3 iterations):**
1. Generate variant via Anthropic.
2. Parse JSON; validate schema matches original format.
3. Run semantic validation: does the variant still solve the problem correctly? (heuristic check: run reference solution against variant test cases; must pass).
4. Estimate difficulty via IRT model (fast approximate model trained on golden set); if |new_b - target_b| > 0.2, reject and regenerate.
5. If all pass: return variant. If fail: retry (max 3).

**Cost per variant:** ~$0.80 (Anthropic token cost); 3–5 iterations in worst case = $2.40 / variant.

**Golden set of 50 reference questions:** Variants pre-generated and hand-validated by SME Lead to calibrate Anthropic prompt. Every variant must match original difficulty within ±0.2 IRT units. Once calibrated, auto-generation scales.

---

## 8. False-Positive Handling

**SME Lead review SLA:** 24 hours for suspected leaks (cosine 0.85–0.92).

**Manual decision:**
- **Confirmed leak:** Mark status='rotated', trigger auto-rotate workflow above.
- **False positive:** Mark status='false_positive', log review_notes. Do NOT rotate.

**Analytics:** Track false-positive rate per crawler source. If Serper source has >15% false-positive rate, reduce query volume or switch to alternative source.

---

## 9. Forensics Export & Customer Breach Notification

**Per-leak event, generate forensics bundle:**
```json
{
  "leak_id": "UUID",
  "question_id": "UUID",
  "question_title": "...",
  "detected_at": "2026-05-03T08:30:00Z",
  "source_url": "https://...",
  "source_type": "glassdoor",
  "similarity_score": 0.94,
  "evidence": {
    "snippet": "...250 chars...",
    "screenshot_url": "s3://qorium/leak-evidence/...",
    "url_hash": "sha256(source_url)"
  },
  "action_taken": "rotated",
  "rotated_to_question_id": "UUID",
  "severity": "high",
  "attribution_markers": [
    { "marker": "variable_suffix_7f", "confidence": 0.95 },
    { "marker": "test_value_+5%", "confidence": 0.87 }
  ],
  "attributed_to_customer": {
    "tenant_id": "bosch-gcc",
    "name": "Bosch GCC Bengaluru",
    "confidence": "HIGH (multi-marker match)"
  }
}
```

**Customer notification:** For Stack-Vault customers, email + WhatsApp alert within 2h of confirmation:
- "A variant of question [title] was detected on [source]. We've rotated it to a new variant. Your future assessments will use the new version. Attached: forensics bundle."

---

## 10. Performance Budget

**Query volume:** 5K questions × 20 queries/q = 100K Serper queries/day.  
**Rate limit:** 60 req/min Serper = 86,400 req/day global. Problem: 100K > 86.4K.

**Solution:** Parallel workers (4 threads) + query prioritization.
- Thread 1–4 each issue 25K queries/day.
- With 60 req/min shared limit: each thread gets 15 req/min on average.
- Thread capacity: 15 req/min × 1,440 min/day = 21.6K queries/day per thread.
- 4 threads = 86.4K/day. We need 100K/day.

**Alternative:** Reduce query count per question from 20 to 18, or use a two-tier strategy:
- High-risk questions (new releases, high usage, high-value): 20 queries.
- Medium-risk (older, low usage): 10 queries.
- Target: (5K × 0.3 high × 20) + (5K × 0.7 medium × 10) = 30K + 35K = 65K/day (within budget).

**Crawl window:** 65K queries / 60 req/min = ~18 hours sequential. With 4 workers: 18 / 4 = 4.5 hours. Fits 02:00–06:30 IST window comfortably.

**Cost envelope:**
- Serper.dev: 100K queries/month ≈ $300/month (volume pricing).
- Anthropic (variant generation on confirmed leaks): Assume 10–20 confirmed leaks/month = 30–60 variant generations = $24–$48/month.
- **Total ops cost for anti-leak: ~$350/month.** Fits Phase 1 ops budget (well within $5K/month infra target).

---

## 11. v0 → v1 Roadmap

**v0 (Month 1):** Serper + Anthropic variant generation + dashboard for SME manual review.

**v1 additions (Months 2–3):**
- GitHub code-search dedicated client (GitHub API, not Serper).
- LinkedIn post search (via Phantom Buster or custom Selenium crawler).
- Reddit direct API (r/leetcode, r/cscareerquestions, r/india_recruitment).
- Stack Overflow direct search (Stack Overflow API).
- **AI plagiarism public-benchmark integration (SO-22):** Query Turnitin API or Similar.ai to check questions against known plagiarism corpus; flag >93% similarity for SME review.

**v2+ (Months 6–12):**
- Distributed crawl (multiple geo-regions running parallel crawlers).
- ML model for leak pattern detection (training on historical false positives).
- Real-time leak alerts (push notifications to customers within 30 min of detection, not daily).

---

## 12. Dependencies

**Required to start:**
- B7 schema (content.leak_alerts, content.questions with status='leaked') — live ✓
- Serper API key acquisition (browser walk pending)
- Anthropic API key (already available for primary AI generation, reuse for variant generation)

**Required to scale:**
- SME Lead hire (Month 2) — owns manual review queue, false-positive analysis, prompt calibration
- I/O Psych contractor (Month 4) — validates variant difficulty via golden-set reference panel
- Infrastructure: one 4-core worker machine (Mac Mini or VPS) for parallel crawl + detection

---

## 13. Test Plan

**Golden set:** 50 reference questions (mix of MCQ, code, design, case study) with known correct answers and IRT parameters.

**Leak injection test:**
1. Plant 5 synthetic leaks on a test forum / private GitHub repo (mock "leaked questions").
2. Run crawler against test data.
3. Verify detection within 24h.
4. Confirm variant generation produces >0.85 similarity reduction on Turnitin/embedding check.
5. Verify variant difficulty ±0.2 IRT units on golden set (run 30 reference candidates through both original and variant; check IRT parameter estimates).

**False-positive calibration:**
1. Crawl 100 random articles/code snippets unrelated to our library.
2. Run detector against them.
3. Verify <5% false-positive rate.

**Forensics validation:**
1. Generate a Stack-Vault variant for a test question.
2. Inject watermark markers into the variant.
3. "Leak" the variant to a test site.
4. Run forensics bundle generation.
5. Verify attributed_to_customer matches expected tenant_id with confidence >90%.

---

## 14. Open Questions for SME Lead & I/O Psych

1. **Variant generation quality at scale:** Once golden set calibration is done, does auto-generation maintain ±0.2 difficulty bounds without human review? Or does every variant require SME spot-check (slower, more expensive)?

2. **False-positive threshold tuning:** Is 0.85 cosine + 70% lexical the right threshold, or should it be tightened to 0.90 + 75% (fewer false positives, risk missing real leaks)?

3. **Customer attribution confidence:** If only 2/3 watermark markers match, do we tell the customer "suspected source: X (67% confidence)" or wait for 3/3 (95% confidence)? Legal/contractual implications?

---

## 15. Constitution & Security Alignment

**SO-9 (24h rotation):** ✓ Pipeline SLA = 6h for confirmed, +24h for SME gate on sensitive items.  
**SO-21 (IRT mandatory):** ✓ Variant generation preserves difficulty_b ±0.2 IRT units; post-rotation calibration on Reference Panel.  
**SO-22 (≥93% AI plagiarism check):** ✓ Future Turnitin integration will flag >93% similarity questions for removal or rewrite.

---

*End of Anti-Leak-Engine-v0-Design.md. Word count: 2,620.*
