# QOrium IRT Calibration Pipeline v0 — Specification

**Author:** CTO Office  
**Date:** 2026-05-02  
**Status:** v0 Spec (pending I/O Psychologist contractor hire M4; full implementation M6+)  
**References:** Constitution SO-21 (IRT scoring Day-1 mandatory), Constitution Article VII (phase gate dependencies)

---

## 1. Purpose

Implement mandatory 3-Parameter Logistic (3PL) Item Response Theory (IRT) scoring per SO-21. Every released question is calibrated with difficulty (b), discrimination (a), and guessing (c) parameters before customers see it. These parameters enable:

- **Adaptive testing:** Select next question based on candidate ability estimate.
- **Equated scoring:** Compare performance across different question variants.
- **Difficulty validation:** Flag questions that are too easy (everyone passes) or too hard (nobody passes).
- **Bias detection:** Differential Item Functioning (DIF) tests reveal unfair questions.

---

## 2. IRT Model: 3PL

**Formula:**
```
P(θ) = c + (1 - c) / (1 + exp(-a(θ - b)))
```

Where:
- **θ** = candidate ability (latent variable; mean 0, sd 1)
- **a** = discrimination parameter (0.0–3.0; how well question separates strong from weak)
- **b** = difficulty parameter (-4 to +4 on logit scale; where 50% of ability-matched candidates pass)
- **c** = guessing/pseudo-guessing parameter (0.0–0.3; floor probability even if ability = -∞)

**Interpretation:**
- **a > 1.5:** Excellent discrimination (ideal)
- **a 0.7–1.5:** Good discrimination
- **a < 0.5:** Poor discrimination (question doesn't separate ability levels)
- **b = -2:** Easy (90%+ pass rate at mean ability)
- **b = 0:** Medium (50% pass rate at mean ability)
- **b = +2:** Hard (10% pass rate at mean ability)

---

## 3. Calibration Corpus & Reference Panel

**Minimum N per item:** 30 candidate responses (industry standard for 3PL parameter estimation stability).  
**Target N by M3:** 100 responses per question (more data = more stable estimates).

**Reference Panel composition:**
- **Phase 1 (M1–M3):** Talpro Customer Zero (Talpro India hiring). Estimated 50–100 senior embedded engineers, backend engineers, etc. answering Wave 1 questions.
- **M4–M6:** Paid calibration panel (TopCoder-style developers, college coding clubs, Talpro candidate database with explicit consent). Target 200–300 paid candidates.
- **Later:** Each customer can opt-in to contribute their candidate responses to calibration corpus (privacy-preserving aggregation; no PII leaked).

**Compensation:** Candidates paid ₹50–200 per question attempted (varies by difficulty + effort).

---

## 4. Five-Stage Pipeline

### Stage 1: Pre-Calibration (Before Release)

**Timeline:** When question status='sme_review' or just before 'released'.

**AI-assigned priors:**
- Based on similar historical questions in library, AI suggests target parameters:
  - For a "Medium difficulty, good discrimination" coding question: `b_prior = 0.0, a_prior = 1.3, c_prior = 0.1`
  - For a "Hard design question": `b_prior = 1.2, a_prior = 1.5, c_prior = 0.0` (no guessing on design questions)

**Question released as:** status='calibrating' (not yet 'released' for broad customer use; available only to Reference Panel).

**Duration:** 2–4 weeks to collect N=30 responses.

### Stage 2: Field Calibration (Responses Logged)

**During 'calibrating' status:**
- Reference Panel candidates answer the question.
- Each response logged in content.responses table with (question_id, candidate_id, response_body, score, time_taken_ms, submitted_at).
- Suspicious_signals logged: is the candidate's response suspiciously fast? Copy-paste detected?

**Expected rate:** Assuming 100 Reference Panel members, ~3–5 members attempt each new question/week = 3–5 responses/week = 6–10 weeks to reach N=30.

### Stage 3: Parameter Estimation (Weekly Batch Run)

**Trigger:** Nightly cron job at 03:00 IST (post-anti-leak crawler at 02:00).

**Process:**
1. **Fetch data:** Query content.responses for all questions with status='calibrating' and N ≥ 30.
2. **Ability estimation:** Estimate candidate ability θ for each reference panelist (can use sum of correct answers as proxy; refine later with IRT-based ability estimation).
3. **3PL fitting:** For each question with N ≥ 30 responses, fit 3PL parameters using:
   - **Python library:** `girth` (open-source, MIT license) or `mirt` (R package).
   - **Algorithm:** Expectation-Maximization (EM) or Maximum Likelihood Estimation (MLE).
   - **Constraints:** a ∈ [0.0, 3.0], b ∈ [-4, 4], c ∈ [0.0, 0.3].
4. **Convergence check:** If fitting fails to converge or produces unrealistic params (e.g., a < 0.1), flag question and skip update.
5. **Update database:** `UPDATE content.questions SET difficulty_b = b_est, discrimination_a = a_est, guessing_c = c_est WHERE id = ?`
6. **Log event:** audit.events with event_type='question.calibrated', old values, new values.

**Cost:** ~$10–20 per batch run (Anthropic for ability estimation if using AI, or free if using proxy).

### Stage 4: Drift Detection (Post-Calibration)

**Flagging criteria:**
- **|Δb| > 0.5:** Difficulty estimate moved >0.5 units (e.g., was expected Easy, turned out Medium). Flag for SME review.
- **|Δa| > 0.3:** Discrimination changed significantly. Flag for SME review.
- **Pass rate outlier:** Empirical pass rate is >20% away from expected (e.g., expected 60% based on b, observed 40%).

**Action:** Generate alert for SME Lead: "Question QOR-EMBA-042 difficulty drifted from b=-0.5 to b=+0.8. Recommend review."

### Stage 5: Status Transition (Release or Retry)

**Transition rules:**
- **If no flags:** status='calibrating' → status='released'. Question can now be served to all customer segments (ReadyBank API, Stack-Vault, JD-Forge output).
- **If flags:** status='calibrating' → status='sme_review' (move back to human review). SME Lead investigates; may reject or reclassify.
- **If N < 30 after 8 weeks:** status remains 'calibrating'; escalate to acquisition manager to recruit more Reference Panel members.

---

## 5. Performance Constraints

**Goal:** 1,000 questions calibrated by M3.

**Math:**
- 1K questions × 30 min avg responses needed = 30K responses total.
- Talpro Customer Zero alone: 100 people × 3–5 questions each = 300–500 responses (insufficient).
- Need paid calibration panel: hire 200–300 panel members by M3.
- Each member attempts ~100 questions = 200–300 panel × 100 = 20K–30K responses (meets target).

**Capacity:**
- Reference Panel recruitment: hire contractor (M2) to manage panel recruitment.
- Cost: ₹50–200 per question × 30K responses = ₹15L–60L (~$18K–$72K) by M3.
- Feasible within Phase 1 budget.

---

## 6. Bias Detection: Differential Item Functioning (DIF)

**Purpose:** Detect questions that are unfairly harder for certain demographic groups.

**Method:** Mantel-Haenszel test (non-parametric DIF detection).

**Privacy-preserving aggregation:**
- Collect responses grouped by demographic (gender, age cohort, geography) WITHOUT collecting PII.
- Candidates optionally provide (gender, age) at panel signup; use as aggregate signal only.
- Never store name + demographic pairing.

**Procedure (quarterly):**
1. Aggregate responses by demographic group (e.g., Female, Male, Non-binary).
2. For each question, compute Mantel-Haenszel statistic across groups.
3. Flag questions with DIF > threshold (e.g., Mantel-Haenszel |D_MH| > 0.5 = moderate DIF).
4. SME Lead reviews flagged questions; may: (a) keep as-is if context justifies (e.g., "SAP ABAP for Indians" may have different baseline familiarity), (b) retire if bias is unfair, (c) rephrase to reduce bias.

**Example:**
- Question: "Implement a recursive quicksort in C"
- Mantel-Haenszel result: |D_MH| = 0.7 (high DIF)
- Finding: Female candidates with same ability as male candidates score 0.7 units lower on this question.
- Possible cause: gendered example (e.g., "sort student names: Alice, Bob...") or cultural assumption (e.g., interview style biased toward competitive coding culture more common in some regions).
- Action: Rephrase with neutral examples; re-calibrate.

---

## 7. Pipeline Orchestration: Nightly Batch

**Cron job @ 03:00 IST (after anti-leak crawler @ 02:00):**

```
1. Query: SELECT * FROM content.questions WHERE status='calibrating' AND calibration_n >= 30
2. For each question:
   a. Fetch responses from content.responses WHERE question_id = ?
   b. Run girth.fit_3pl() or mirt R bridge
   c. Check convergence; if fail, log error and skip
   d. Get b_est, a_est, c_est
   e. Compare to prior (if |Δb| > 0.5, flag for SME review)
   f. Update content.questions; log audit event
3. Run Mantel-Haenszel DIF test (quarterly, not nightly)
4. Generate calibration report: CSV of updated questions, JSON of flagged items
5. Email SME Lead + I/O Psych: "20 questions calibrated this week; 2 flagged for review"
```

**Latency:** ~1–2 hours for 1K questions (parallelizable; girth fitting is CPU-bound but can use 8 cores).

---

## 8. Library & Tooling

**Primary tool:** `girth` Python library (MIT licensed, well-maintained, supports 3PL).

**Fallback:** R `mirt` package (more mature, more options, but requires R runtime).

**Data pipeline:** Postgres → pandas DataFrame → girth.fit_3pl() → update Postgres.

**Deployment:** Python worker service (PM2 fork mode) that runs nightly, handles locking, retry logic.

---

## 9. Visualization & Reporting

**Monthly J5 close (CEO finance review):**
- **Calibration coverage chart:** Stacked bar showing questions by status:
  - draft (not yet released)
  - calibrating (collecting responses)
  - released (ready for customer use)
  - deprecated (rotated due to leak)
- **Difficulty distribution histogram:** x-axis = difficulty_b (-2 to +2), y-axis = count. Should show normal distribution centered at 0.
- **Discrimination distribution:** x-axis = discrimination_a (0 to 2), y-axis = count. Should show that >80% have a > 1.0.
- **Pass rate vs b-parameter scatter:** Verify empirical pass rates match IRT model predictions.

**I/O Psychologist responsibility:** Monthly calibration QA report; flag <1% outliers; recommend retirements.

---

## 10. Failure Modes & Mitigations

| Failure Mode | Symptom | Mitigation |
|---|---|---|
| **Cold-start:** Insufficient response data N < 30 | Questions stuck in 'calibrating' for weeks | Dedicated Reference Panel recruitment (M2 hire); batch onboard 50+ panel members at launch |
| **Non-convergence:** girth fails to fit 3PL | NaN or invalid parameters | Log error; skip update; flag for SME review; may indicate question is pathological (everyone gets it right/wrong) |
| **Biased corpus:** Reference Panel skews toward one demographic (e.g., all male, all India-based) | Calibration parameters don't generalize to diverse customer base | Track panel demographics; ensure gender/geo balance; use stratified sampling |
| **Model drift:** Able to estimate θ poorly (candidates improve over time, or panel is not representative of customers) | Parameter estimates become unstable | Recalibrate quarterly; compare to historical estimates; refit with updated data |

---

## 11. Phase Gate Dependency

**Constitution Article VII:** IRT auto-fail criterion for any release.

**Requirement:** Before any question is marked status='released' for general use (ReadyBank API, Stack-Vault customer access), it MUST have passed IRT calibration with N ≥ 30 and parameter estimates within reasonable bounds.

**J5 monthly close must verify:** "IRT coverage: X% of all released questions have N ≥ 30 responses and valid parameter estimates."

**Enforcement:** Automated gate in release pipeline; a question cannot transition from 'calibrating' to 'released' without passing this check.

---

## 12. v1 → v2 Roadmap (Beyond M3)

**v1 (M0–M6):** 3PL fixed-parameter for all questions.

**v2 (M9+):** Cognitive Diagnostic Model (CDM) — each question probes multiple cognitive skills (not just overall ability). Provides richer diagnostic feedback ("candidate mastered Recursion but struggles with Dynamic Programming").

**v3 (M12+):** Adaptive testing engine — use calibrated parameters to select next question in real-time based on candidate's estimated ability.

---

## 13. Open Questions for I/O Psychologist Contractor & CTO

1. **Reference Panel composition:** Should we use TopCoder developers (strong coding bias) or mix in college students (broader demographic)? Trade-off: TopCoder = better for discriminating strong engineers; students = broader representation.

2. **Ability estimation method:** Use sum-score (quick, biased for low-discrimination questions) or IRT ability estimate (slower, more accurate)? Tradeoff between batch speed and accuracy.

3. **Guessing parameter c:** For MCQ, typical c ≈ 0.25 (random chance on 4 options). For coding, c ≈ 0.0 (can't guess). Should we pre-set c per format, or estimate from data?

4. **Quarterly DIF testing:** Labor-intensive. Should we do it for all 1K+ questions, or sample high-stakes questions only?

---

## 14. Constitution & SLA Alignment

**SO-21 (IRT mandatory):** ✓ Every released question has 3PL parameters estimated on N ≥ 30.  
**Article VII phase gates:** ✓ IRT calibration is a blocking requirement before release.  
**Customer transparency:** Document per-question IRT parameters in API response (optional customer-facing field; helps them understand difficulty scale).

---

*End of IRT-Calibration-Pipeline-v0-Spec.md. Word count: 2,280.*
