# Anti-Leak Forensics

**Authority:** Constitution SO-22 (AI Plagiarism Public Benchmark + 24h Anti-Leak SLA) + Article VII (auto-fail if SLA breached) + CTO Architecture §6
**Owner:** CDO (CTO Office Y1 → I/O Psych FTE Y2+)
**SLO:** `<24 hours since last full corpus scan` per `cto/sli-slo.md` Content Engine section
**Operationalizes:** SO-22 — daily anti-leak rotation + AI plagiarism public benchmark

---

## What "anti-leak rotation" actually means at QOrium

The phrase shows up in marketing copy across the industry. Most of the time it means "we have a content team that ships new questions sometimes." That is NOT what we mean.

A real anti-leak engine is **continuous monitoring + semantic similarity match + automated regeneration**:

1. **Continuous monitoring** — every shipped question has a fingerprint. Fingerprint is checked daily against public sources (Glassdoor, LeetCode, Reddit, GeeksforGeeks, public github gists, indexed PDFs, prep blogs).
2. **Match → regenerate** — when a fingerprint matches, the AI generates a semantic variant (same skill, same difficulty band, different surface). SME validates within hours.
3. **Release → retire** — the new variant releases as v2 with fresh IRT calibration. The original retires from the live library. Customers get a webhook with the rotation event.

The 24-hour SLA from SO-22 means: fingerprint scan runs every 24 hours, regenerate-and-retire cycles complete within the same window, customer dashboard surfaces the rotation event with audit trail.

**Why we beat 24h** (per `cto/sli-slo.md` Content Engine action threshold): Adaface ships a 24-hour anti-leak guarantee on its enterprise tier. To stay strictly better than the published benchmark, our SLO is `<24h` — we strictly beat 24h, not equal it.

---

## Fingerprint methodology

Each question's fingerprint is a **semantic embedding + lexical signature** stored alongside the question:

```yaml
fingerprint:
  question_uuid: rb_q_01HXY8M2P5R
  embedding: [...] # 1536-dim vector (text-embedding-3-large)
  lexical_signature_hash: sha256(...) # exact-string hash for fast pre-filter
  ngram_set: ['spring transactional', 'propagation REQUIRES_NEW', ...]
  generated_at: 2026-04-22T07:40:11Z
  last_scan_at: 2026-05-06T03:00:00Z
```

Why both embeddings AND lexical: lexical catches exact reposts (someone copied the question wholesale to a prep blog); embeddings catch paraphrases (someone reworded the question slightly).

---

## Scan sources (public surfaces we monitor)

Daily scan runs against:

| Source              | Method                                                                                                       | Rate                 | Notes                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------- | --------------------------------------- |
| Reddit              | Reddit API search; targeted subreddits (r/cscareerquestions, r/IndianITcareers, r/cscareerquestionsEU, etc.) | Daily                | Highest-leakage source historically     |
| Glassdoor           | Web scraper; respects robots.txt; targeted at company-specific pages                                         | Daily (rate-limited) | Interview reviews are leakage source #2 |
| GeeksforGeeks       | Search API; "company name" + "stack" queries                                                                 | Daily                | Indexed answer-writeups                 |
| LeetCode            | Search API for premium questions                                                                             | Daily                | Coding-format leakage                   |
| Public github gists | GitHub search API; "interview questions" + tags                                                              | Daily                | Personal-leak channel                   |
| Indexed PDFs        | Google search dorks; "filetype:pdf" + "interview"                                                            | Weekly               | Lower-velocity but persistent           |
| Prep blogs          | Manually curated list (~20 sites) + RSS where available                                                      | Weekly               | High-noise, lower-priority              |

Scan budget: ~1000 fingerprint checks/hour against ~5000 active library questions = full corpus scan in 5 hours, comfortably inside 24h SLA.

---

## Match → regenerate → retire procedure

When a fingerprint match is found:

### Step 1 — Confirm match (anti-false-positive)

- Cosine similarity threshold: ≥0.85 between question embedding and matched-source embedding
- Lexical n-gram overlap: ≥40% (after stopword removal)
- Match must be on a **public** surface (not a private QOrium-internal page; sometimes our own docs surface in scans — these are filtered)

If thresholds met → confirmed leak. Otherwise → log as sub-threshold, no action.

### Step 2 — Regenerate variant

Trigger AI generation:

- **Input:** the original question + the role-graph leaf + the difficulty band
- **Constraint:** generate a variant with the SAME skill / SAME concept / SAME difficulty intent but DIFFERENT surface
- **Output:** N candidate variants (default N=5)

The 5 candidates pass through Self-Critique (Stage 3) → SME Review (Stage 4) → fresh IRT calibration (Stage 5). The first variant that survives all 3 stages becomes the v2.

### Step 3 — Release v2; retire v1

- **v2 ships** with a fresh fingerprint + fresh IRT calibration
- **v1 retires:** marked `retired: true` in DB; no longer appears in API responses, JD-Forge output, or Stack-Vault delivery
- **Webhook fires** to customers who consumed v1: `{"event": "question_retired", "uuid": "rb_q_01HXY8M2P5R", "replaced_by": "rb_q_01HZK4Q9X2N", "reason": "leak_detected"}` — customers integrate to update their automation

### Step 4 — Watermark forensics (Stack-Vault only)

If v1 was a Stack-Vault question (per `cdo/watermark-forensics.md`), the leak is a contractual concern:

- Identify which candidate(s) the watermark embeds
- Notify the Stack-Vault customer's security team
- Provide forensic timeline (when issued, when leaked, on which surface)

### Step 5 — Log

Every match + regenerate-and-retire cycle logs to `cdo/anti-leak-events/YYYY-MM-DD-INC-NNN.md` (created folder on first leak):

```markdown
# Anti-Leak Event YYYY-MM-DD-INC-NNN

**Detected:** <timestamp UTC>
**Question UUID:** <original v1>
**Replacement UUID:** <v2>
**Source:** <Reddit/Glassdoor/etc.>
**Source URL:** <if available; redacted if surface auto-removed>
**Stack-Vault customer affected:** yes/no (and which, if yes)
**Time-to-retire:** <duration from match to v1 retirement>
**Time-to-replace:** <duration from match to v2 release>
**Customer webhook fired:** yes/no
```

---

## SLA enforcement (auto-fail per Article VII)

Per Constitution Article VII and SO-22:

- **Fingerprint freshness >24h** → P0 incident per `cto/runbooks/incident-response.md`. The constitutional claim ("daily anti-leak rotation") becomes false; site copy must be updated OR the engine restored within the incident window.
- **Time-from-match-to-retire >48h** → P1 incident; investigation log required
- **Quarterly AI plagiarism public benchmark missed** → P1; Constitutional violation logged in `cto/tech-debt.md`

---

## AI plagiarism public benchmark (SO-22 second half)

Per `governance/AI-Plagiarism-Benchmark-Protocol-v1.md` (existing governance doc), CDO runs a public benchmark every quarter:

- Sample 100 questions from the current library
- Submit to AI-detection tools (GPTZero, Originality, Adaface's anti-leak SLA endpoint)
- Publish results to a public-facing surface (TBD: blog post per quarter on `qorium.online/blog`)
- Compare against industry benchmarks

The benchmark is **public** by design — it's how QOrium proves the daily-rotation claim isn't marketing.

---

## What this protocol does NOT cover

- ❌ Watermark forensics for Stack-Vault — that's `cdo/watermark-forensics.md`
- ❌ The reference panel that calibrates v2 variants — that's `cdo/reference-panel-governance.md`
- ❌ Bias detection on regenerated variants — that's `governance/Bias-Detection-Methodology-v1.md` (still applies to every variant; SME Stage 4 enforces)

---

## Y1 reality

The full automated engine is M2 deliverable per Blueprint trajectory. Until M2:

- Talpro India runs daily anti-leak rotation **manually** as part of Customer Zero discipline (per Constitution SO-1)
- The website's "daily rotation" claim is honest at the rotation cadence; the AUTOMATION is what's deferred
- This protocol IS the spec the M2 engine implements

Tracked as TD-003 in `cto/tech-debt.md` with severity High (constitutional claim) and ETA M2.

---

_Cross-references: Constitution SO-22, Article VII, §2.5 (CDO charter), CTO Architecture §6 (Anti-Leak Engine architecture), `governance/AI-Plagiarism-Benchmark-Protocol-v1.md` (existing protocol authority), `cdo/irt-calibration-protocol.md` (variants get fresh IRT calibration), `cdo/watermark-forensics.md` (Stack-Vault leak handling), `cto/sli-slo.md` Content Engine SLOs._
