# AI Plagiarism Benchmark Protocol v1

**For:** QOrium Gatekeeper, CTO Office  
**Authority:** Constitution SO-22 (AI plagiarism detection public benchmark ≥93%), Article VII Quality Gate (auto-fail criterion), Article IX Phase Gates  
**Owner:** CTO Office (Y1); CDO (M4+)  
**Status:** v1 Protocol (pending implementation M2–M3)  
**Effective:** May 2026  

---

## Purpose

Operationalize SO-22 mandate: "Public benchmark for AI plagiarism detection ≥93%." This is an **auto-fail criterion in Quality Gate Article VII** — if benchmark falls below 93%, all new question releases halt until remediated. The protocol defines detection methodology, corpus design, public reporting cadence, and failure modes.

---

## §1 What We Benchmark

### 1.1 Detection Rate Definition

**Metric:** Percentage of AI-generated response submissions correctly flagged as synthesized.

**Formula:**
```
Detection Rate = (True Positives) / (True Positives + False Negatives) × 100%
where:
  True Positive = AI-generated response correctly flagged
  False Negative = AI-generated response NOT flagged (missed detection)
```

**Target:** ≥93% detection rate across test corpus.

### 1.2 Public Benchmark Reference

**Why 93%?** Adaface (backed by YC, acquired Byteboard team) publicly claims 93%+ detection. HackerRank cites similar numbers. QOrium must match or exceed to credibly claim "enterprise-grade AI detection."

**Corpus:** Our test corpus is independent; results may vary based on:
- Diversity of LLM models used (Claude, GPT-4, Gemini, Llama, Mistral).
- Prompt engineering diversity (simple requests vs. complex system prompts).
- Response domain (coding, design, narrative).

**Transparency:** Public reporting includes corpus composition, detection signals used, and false-positive rate so competitors/customers can assess validity.

---

## §2 Test Corpus Design

### 2.1 Balanced Composition

**Size:** 1,000 response samples (minimum for statistical significance; 95% CI ±3%).

**Split:** 50% human-written, 50% AI-generated (balanced binary classification test).

### 2.2 AI-Generated Samples (500 responses)

**Model diversity:**
- **Claude (Opus, Sonnet):** 30% of AI samples (~150 responses).
- **GPT-4 / GPT-4o:** 30% (~150 responses).
- **Gemini 1.5:** 20% (~100 responses).
- **Llama 3.1 / Mistral:** 20% (~100 responses).

**Prompt style diversity:**
- Simple instruction: "Write code to solve LeetCode problem X."
- System prompt + instruction: "You are a senior engineer. Write a design doc for X."
- Few-shot prompting: "Here are examples. Now solve Y."
- Adversarial: "Make this output look like human code; avoid AI signatures."

**Domain coverage:**
- **Coding:** 60% (Python, JavaScript, SQL, C++).
- **Design/Reasoning:** 20% (system design, architecture decisions).
- **Narrative:** 20% (technical writeups, explanations).

### 2.3 Human-Written Samples (500 responses)

**Source 1: Customer Zero (Talpro India hiring):** Actual responses from Talpro India's tech hiring assessments (anonymized, with candidate consent). ~200 responses.

**Source 2: Paid contractors:** Hire 50–100 external developers (via TopCoder, CodeSignal, college coding clubs) to solve the same problems as AI. Provide compensation (₹100–300 per response depending on difficulty). ~300 responses.

**Goal:** Mix of senior (experienced), mid-level, and junior developers to capture realistic human variance.

### 2.4 Corpus Refresh Cadence

**Quarterly refresh:** Replace 20–30% of test corpus each quarter (300–400 samples) to account for:
- New LLM model releases (GPT-5, Claude 4, etc.).
- Improved prompt engineering tactics.
- Detection signal drift.

**Versioning:** Keep historical corpuses (v1-Q1-2026, v1-Q2-2026, etc.) for trend tracking.

---

## §3 Detection Signals (Multi-Signal Ensemble)

No single signal is sufficient. Use ensemble approach: combine multiple detection types, score each, produce final confidence.

### 3.1 Statistical Signals

**Perplexity:** Measure how "expected" a sequence of tokens is under a language model.
- **AI text:** Often lower perplexity (more predictable; LLM-generated).
- **Human text:** Often higher perplexity (more variable, creative, typos).
- **Threshold:** Perplexity < 50 = AI-signal; >80 = human-signal.

**Burstiness:** Ratio of shortest token sequences to longest within a response.
- **AI text:** More uniform; smoother transitions (less "bursty").
- **Human text:** Uneven pacing; sudden shifts in complexity.
- **Threshold:** Burstiness > 0.7 = human-signal.

**N-gram entropy:** Measure of unique token patterns.
- **AI text:** Lower entropy (repetitive patterns; LLM favors common n-grams).
- **Human text:** Higher entropy (more unique phrasings).
- **Threshold:** Entropy < 4.5 bits = AI-signal.

**Implementation:** Python `textstat`, `transformers` (Hugging Face), scipy for statistical measures.

### 3.2 Behavioral Signals

**Typing pattern analysis (if keystroke data captured):**
- **Paste-only:** Entire response pasted in one go = AI-generated.
- **Incremental typing:** Human-like typing speed variance.

**Time-to-submit anomaly:**
- **Too fast:** Response submitted in <30% of expected time (likely copy-pasted AI output).
- **Reasonable:** Time aligns with problem complexity.

**Data source:** If QOrium captures keystroke events (future feature), integrate into detection. Y1: skip this signal.

### 3.3 Stylometric Signals

**Lexical diversity:** Type-token ratio (unique words / total words).
- **AI text:** Often more repetitive; lower TTR.
- **Human text:** More varied vocabulary; higher TTR.

**Sentence length variance:** Standard deviation of sentence lengths.
- **AI text:** More uniform sentence lengths (LLM trains to balance).
- **Human text:** High variance (short punchy sentences mixed with complex ones).

**Unusual term use:** Presence of technical terms that don't align with problem domain.
- **AI red flag:** "Leveraging synergies" in a Python code question = unlikely AI hallucination.
- **Human red flag:** Inconsistent terminology (switches between "thread" and "process" without context).

### 3.4 Direct Detection Models

**GPT-Zero API:** OpenAI's own detection service (limited public availability; explore partnership).

**Pangram (pangram-ai.com):** Specialized AI-text detection tool; API available.

**Proprietary models:** Use Claude or GPT-4 embeddings to detect statistical outliers in embedding space (AI responses cluster differently than human).

**Self-check (weak signal only):** Prompt the response: "Did you write this? Yes or No. Explain." Known to be unreliable but included for ensemble diversity.

### 3.5 Ensemble Scoring

**Method:** Weighted average of all signals; thresholds calibrated on training corpus.

**Scoring formula:**
```
ensemble_score = (
  0.3 × statistical_score +
  0.2 × behavioral_score +
  0.2 × stylometric_score +
  0.15 × direct_model_score +
  0.15 × self_check_score
)
```

**Threshold:** ensemble_score ≥ 0.6 = flag as AI-generated.

**Output:** For each response:
```json
{
  "response_id": "resp_12345",
  "ai_likelihood": 0.78,
  "signal_breakdown": {
    "perplexity_score": 0.65,
    "burstiness_score": 0.72,
    "entropy_score": 0.80,
    "gpt_zero_score": 0.85,
    "pangram_score": 0.75,
    "self_check_score": 0.40
  },
  "decision": "AI-GENERATED",
  "confidence": "HIGH"
}
```

---

## §4 Methodology

### 4.1 Pre-Deployment: Model-Update Benchmark

**Trigger:** Every model update (new version of Claude, GPT-4, Gemini, etc.).

**Procedure:**
1. Run ensemble detector against latest test corpus (1,000 samples).
2. Compute detection rate, false-positive rate, false-negative rate.
3. Decision gate: If detection_rate ≥ 93% AND false_positive_rate ≤ 5%, proceed. Else: debug, tune thresholds, retest.

**Timeline:** Benchmark must complete before any production deploy.

### 4.2 Continuous Monitoring: Production Audit

**Cadence:** Weekly, every Monday.

**Procedure:**
1. Sample 1% of production submissions (across all customers, all question types).
2. Manually verify 50–100 submissions: is flagged submission truly AI-generated? (Manual review by CDO or I/O Psych FTE.)
3. Compute weekly true-positive / false-positive rates.
4. Alert if drift detected: TP rate drops <92% in a week or FP rate spikes >6%.

**Data captured (no PII):** submission_id, model_flagged, manual_verification, false_pos_or_true_pos, signal_scores.

### 4.3 Quarterly Refresh: Full Corpus Re-Benchmark

**Cadence:** Quarterly (M3, M6, M9, M12 close).

**Procedure:**
1. Generate new test corpus: 20–30% new samples (300–400 samples). Replace old samples. Keep 70% overlap for trend tracking.
2. Test all current AI models (latest Claude, GPT-5 if released, etc.) + new models (e.g., Llama 4 announced).
3. Recompute ensemble weights; tune thresholds if drift detected.
4. Publish updated public benchmark report.

**Report structure:**
```
Q2 2026 AI Plagiarism Benchmark Report
- Detection Rate: 94.2% (1,000-sample corpus)
- False Positive Rate: 4.1%
- False Negative Rate: 5.8%
- Models tested: Claude Opus, GPT-4, Gemini 1.5, Llama 3.1
- Signals used: perplexity, burstiness, entropy, GPT-Zero, Pangram, self-check
- Key findings: (narrative)
- Recommendations: (signal weights adjustments, etc.)
```

---

## §5 Public Reporting

### 5.1 Quarterly Blog Post

**Audience:** Customers, prospects, industry.

**Format:** ~1,500-word blog post, published on qorium.io/blog within 5 days of M3/M6/M9/M12 close.

**Sections:**
1. **Executive summary:** Detection rate, key finding (e.g., "GPT-4 responses harder to detect than Claude").
2. **Methodology:** Corpus size, model diversity, signals used.
3. **Results table:** Detection rate per model, per domain.
4. **False-positive analysis:** Edge cases where human code was flagged; insights.
5. **Future improvements:** Planned signal additions, 3PL DIF + plagiarism research.

**Title examples:**
- "QOrium Q2 2026 AI Plagiarism Benchmark: 94.2% Detection Rate"
- "How We Detect AI-Generated Code in Real-Time Assessments"

### 5.2 Customer-Facing Metrics

**Monthly dashboard (J5 close):** 
- Aggregate detection rate across QOrium customer base (anonymized).
- % of submissions flagged as AI-generated per customer.
- Trends (is AI prevalence rising?).

**Customer QBRs:** Present benchmark findings; use as credibility asset.

### 5.3 Methodology Transparency

**Public documentation:**
- `/governance/ai-plagiarism-detection.md` — public-facing overview.
- `/governance/signal-weights.json` — current ensemble weights (updated quarterly).
- `/research/ai-plagiarism-v1-report.pdf` — annual comprehensive research report.

**No proprietary hiding:** Share methodology openly (exception: GPT-Zero API details if non-disclosure agreement prevents).

---

## §6 Failure Modes & Escalation

### 6.1 Benchmark Falls Below 93%

**Trigger:** Quarterly benchmark shows detection_rate < 93%.

**Immediate action (within 24 hours):**
1. Halt all new question releases (freeze 'calibrating' → 'released' transitions).
2. CTO + CDO emergency debug session: which signals degraded? Why?
3. Root cause analysis: new LLM model capabilities? Prompt engineering tricks? Signal drift?

**Remediation options:**
1. Retune ensemble weights (e.g., increase GPT-Zero weight if it's most stable).
2. Add new signals (e.g., integrate Claude's internal detection API).
3. Expand test corpus (rebalance AI models; add adversarial samples).
4. Escalate to CEO: if benchmark cannot be restored to ≥93% within 1 week, CEO + CTO joint waiver required to resume releases (document waiver in QUEUE.md).

**Timeline:** Must restore ≥93% within 1 week or production-blocking.

### 6.2 False-Positive Rate Spikes Above 5%

**Scenario:** Legitimate human code is flagged as AI-generated; customer unhappy.

**Trigger:** Weekly audit detects FP rate > 5.5% (1σ above target).

**Action:**
1. Investigate: which signal caused false positives? (e.g., high entropy mistaken for AI? No, entropy is human-signal.)
2. Gather examples: 5–10 FP cases; analyze common patterns.
3. Adjust thresholds or signal weights to reduce false-positives.
4. Test on historical corpus; confirm improvement; deploy.

**Max tolerance:** FP rate must stay ≤ 5.5%. If persistent, escalate to CDO + external ML consultant.

### 6.3 Drift Detection Quarter-over-Quarter

**Scenario:** Q1 detection = 94.2%; Q2 detection = 88.8% (5.4% drop).

**Action:**
1. Investigate: did AI models improve? Did test corpus change? Did signals degrade?
2. If models improved (GPT-5 released), upgrade test corpus + reoptimize signals.
3. If test corpus changed inappropriately, revert to controlled refresh (20–30% replacement only).
4. Report findings in public blog post; explain drift + mitigation.
5. Escalate to CEO if drift is >10% (indicates potential systemic issue).

---

## §7 Implementation: qorium-plagiarism-detector Service

### 7.1 Service Architecture

**Service name:** `qorium-plagiarism-detector`  
**Type:** PM2 fork-mode stateful worker (per B10 service spec).  
**Port:** 5106 (follows qorium-ats-bridge at 5105).  
**Code repo:** `/opt/qorium/services/plagiarism-detector/`.

### 7.2 API Surface

**Endpoint:** `POST /detect`

**Request:**
```json
{
  "response_body": "def fibonacci(n):\n  if n <= 1: return n\n  return fibonacci(n-1) + fibonacci(n-2)",
  "response_metadata": {
    "question_id": "qor_emba_042",
    "submission_time_seconds": 120,
    "submission_type": "code",
    "customer_id": "cust_123"
  }
}
```

**Response:**
```json
{
  "ai_likelihood": 0.78,
  "decision": "AI-GENERATED",
  "confidence": "HIGH",
  "signal_breakdown": {
    "perplexity": 0.65,
    "entropy": 0.82,
    "burstiness": 0.71,
    "gpt_zero": 0.85,
    "pangram": 0.75
  },
  "recommended_action": "Flag for review",
  "audit_logged": true
}
```

### 7.3 Technology Stack

**Language:** Python 3.11.

**Libraries:**
- `textstat` — readability, perplexity, entropy.
- `transformers` (Hugging Face) — embeddings, language model features.
- `scikit-learn` — ensemble scoring, threshold calibration.
- `gpt-zero-api` (if available) / `pangram-client` (HTTP API).
- `pydantic` — request/response validation.
- `fastapi` — HTTP server.
- `pino-logger` — structured logging.

**External APIs:**
- Anthropic Embeddings (for semantic detection).
- OpenAI GPT-Zero (partnership pending).
- Pangram API ($$).

### 7.4 Cost Envelope

**Estimate:** ~$200/month at Phase 1 volume (Y1).

**Breakdown:**
- Anthropic Embeddings API: ~$50/mo (10M embedding tokens/mo at Phase 1).
- Pangram API: ~$100/mo (pay-as-you-go for detection calls).
- GPT-Zero: ~$50/mo (if partnership secured; else $0 if unavailable).
- Self-hosted compute (CPU time for ensemble): marginal, included in VPS.

**Y2+ projection:** $500/mo as volume scales (1M submissions/mo).

---

## §8 Audit & Logging

### 8.1 Every Detection Logged

**Table:** `audit.events`

**Event schema:**
```json
{
  "event_id": "evt_uuid",
  "event_type": "response.ai_plagiarism_check",
  "timestamp": "2026-05-15T10:32:42Z",
  "response_id": "resp_12345",
  "customer_id": "cust_123",
  "question_id": "qor_emba_042",
  "ai_likelihood": 0.78,
  "decision": "AI-GENERATED",
  "signal_breakdown": { ... },
  "flagged": true,
  "actor": "plagiarism-detector-v1"
}
```

**No PII:** Logs contain no candidate name, email, or personal data; only anonymized IDs.

### 8.2 Customer-Visible Metrics

**Per-batch aggregation (not per-submission):**
```json
{
  "assessment_batch_id": "batch_001",
  "total_submissions": 50,
  "ai_flagged_count": 3,
  "ai_flag_rate": 0.06,
  "confidence_breakdown": {
    "HIGH": 2,
    "MEDIUM": 1,
    "LOW": 0
  }
}
```

**Per-candidate flag (shown to hiring manager only):**
```json
{
  "candidate_id": "cand_xyz",
  "submission_id": "resp_12345",
  "ai_flagged": true,
  "confidence": "HIGH",
  "recommendation": "Review manually before hiring decision"
}
```

---

## §9 Customer Policy: Non-Binding Flag

### 9.1 What QOrium Does

- Detects and surfaces AI-likelihood score + confidence for each submission.
- Logs decision; provides audit trail.
- Does NOT auto-fail candidates.

### 9.2 What Customers Decide

- QOrium surfaces signal + confidence + reasoning.
- **Customer policy:** Customers decide their own policy.
  - Option A: "Auto-reject if AI-flagged."
  - Option B: "Flag high confidence; review medium/low manually."
  - Option C: "No AI policy; accept all."

### 9.3 Liability Disclaimer

**Contract language (A7 DPA addendum):**
> QOrium's AI plagiarism detection is a signal, not a guarantee. AI likelihood ≥0.70 indicates the submission likely involved AI generation but is not 100% accurate. Customers are responsible for their own hiring policies and final candidate decisions. QOrium disclaims liability for hiring errors resulting from reliance on this signal alone.

---

## §10 Reference Panel Integration

### 10.1 AI-Prompted Samples in Reference Panel Rotations

**Goal:** Keep detection benchmark calibrated as customer hiring practices evolve.

**Method:** Periodically (quarterly), generate 10–20 AI-prompted responses using identical problem statements as Reference Panel members solve. Add to training corpus; retune signals.

**Example:** Reference Panel member solves "Design a distributed cache system." Simultaneously, prompt Claude + GPT-4 to solve the same. Compare responses; retrain ensemble.

---

## §11 Implementation Timeline

| Phase | Milestone | Owner | Target Date |
|---|---|---|---|
| **M2** | Service skeleton + API spec | CTO Office | May 30, 2026 |
| **M2–M3** | Integration with Pangram + GPT-Zero (partnership negotiation) | CTO Office | June 15, 2026 |
| **M3** | v0 detector live in staging; Q1 benchmark run | CTO Office | June 30, 2026 |
| **M3** | Public Q1 report published | CDO / Marketing | July 5, 2026 |
| **M4–M5** | Continuous monitoring active; weekly audits | CTO Office / CDO | August 2026 |
| **M6** | Q2 benchmark report + corpus refresh | CTO Office / CDO | September 30, 2026 |

---

## Drafting Notes & Risk Flags

1. **Corpus refresh validity:** Quarterly 20–30% replacement maintains statistical validity (95% CI ±3%) but requires careful validation that new samples don't introduce bias (e.g., all new AI samples from GPT-4 might skew results). Plan sensitivity analysis.

2. **API cost scaling:** Pangram + GPT-Zero will scale to $500/mo–$2K/mo at Y2 volumes. Budget accordingly; consider building in-house detection if costs spike.

3. **Adversarial attacks:** As AI models improve, prompt engineering will become more sophisticated (e.g., "write code that looks human"). Ensemble robustness is critical; plan red-team exercises (M6+).

4. **Legal disclaimers:** AI detection is probabilistic. Customers must understand false-positive risk. Ensure A7 DPA addendum + contract language are airtight before launch.

5. **Benchmark publicity risk:** If public benchmark drops below 93% (e.g., after GPT-6 release), this becomes visible to market and competitors. Plan narrative + remediation communication strategy.

---

**Version:** v1  
**Ratified:** May 2026  
**Next review:** M3 (September 2026) Phase Gate
