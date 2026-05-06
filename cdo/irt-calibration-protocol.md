# IRT Calibration Protocol

**Authority:** Constitution SO-21 (IRT Mandate) + Article VII (Quality Gate auto-fail if missing) + CTO Architecture §6
**Owner:** CDO (CTO Office Y1 → I/O Psych FTE Y2+)
**Operationalizes:** SO-21 — "Every shipped question has IRT calibration metadata"

---

## What IRT is, briefly

**Item Response Theory** models the probability that a candidate of a given ability θ answers a question correctly, as a function of question parameters: difficulty (b), discrimination (a), and (in 3PL models) guessing (c).

For QOrium, IRT means:

- Every question has a measured **difficulty band** (1-5 in our scale; mapped to b-parameter ranges)
- Every question has a measured **discrimination** (how well it separates high-ability from low-ability candidates — the a-parameter)
- These come from candidate responses on the **Reference Panel** (see `cdo/reference-panel-governance.md`)

Without IRT calibration, "difficulty" is a guess. With IRT, "Spring `@Transactional` propagation at band 4" is a measured claim.

---

## The mandate (SO-21 verbatim implication)

Constitution SO-21 says: every shipped question has IRT calibration metadata. The Quality Gate Article VII makes this an **auto-fail criterion** — a release that ships a question without IRT metadata fails the gate regardless of point score.

This protocol is the operational pathway: how do questions GET their IRT metadata before they ship.

---

## The 7-stage pipeline (where IRT enters)

Per CTO Architecture §6 + Blueprint §3.1, the content engine has 7 stages:

```
1. Spec        → role-graph leaf identified, format-mix targeted, difficulty-band set
2. AI Draft    → generate variants (LLM)
3. Self-Crit   → AI critique pass (anti-bias, anti-trivia)
4. SME Review  → I/O psychologist + domain SME validation
5. Calibrate   → ← IRT happens HERE: deploy to Reference Panel; collect responses; fit IRT model; assign metadata
6. Release     → push to ReadyBank / JD-Forge output / Stack-Vault library
7. Post-Deploy → ongoing IRT refinement from real candidate response data
```

A question without Stage 5 metadata cannot proceed to Stage 6. Hard gate.

---

## Calibration data captured

Each calibrated question carries this metadata in its database record:

```yaml
question:
  uuid: rb_q_01HXY8M2P5R
  ...
  irt:
    calibrated_at: 2026-04-22T07:40:11Z       # ISO timestamp
    model: 2PL                                 # 2PL or 3PL
    difficulty_b: 0.42                         # b-parameter (logit scale)
    difficulty_band: 4                         # 1-5 mapping
    discrimination_a: 1.85                     # a-parameter
    panel_response_count: 47                   # how many panel responses fitted
    panel_segments: ["india-stack-senior", "general-tech-mid"]
    correlation_to_predicted: 0.91             # IRT b vs SME-predicted band
    last_recalibrated_at: 2026-04-22T07:40:11Z
    recalibration_trigger: initial             # initial | post-deploy-drift | reference-panel-refresh
```

---

## Calibration procedure

### Step 1 — Pre-calibration (during SME review, Stage 4)

The SME assigns a **predicted difficulty band** (1-5) to the question. This is the SME's expert judgement before any candidate data exists.

The predicted band is the comparator against which IRT measurement validates: a question SMEs predicted at band 4 that calibrates to b-parameter equivalent to band 2 reveals either a bad SME prediction OR a flawed question design.

### Step 2 — Reference Panel deployment (Stage 5)

The question deploys to the Reference Panel — a controlled set of paid-candidate respondents (per `cdo/reference-panel-governance.md`).

Y1 reality: Reference Panel is internal (Talpro India hires + Wave-1 SMEs in cross-validation mode). M9-M12 trajectory: external paid-candidate network.

### Step 3 — Response collection

Target: minimum 30 panel responses per question before IRT fit. Below 30, the calibration is provisional and the question ships with `panel_response_count < 30` flag visible to Bali (so they can flag to API customers if asked).

Target window: 14 days from deployment to first calibration.

### Step 4 — IRT model fit

Use a 2PL (or 3PL if guessing matters for the format) IRT model. Open-source library: `mirt` (R) or `pyirt`/`girth` (Python). The fit produces b and a parameters.

### Step 5 — Metadata write + Quality Gate check

Write the IRT metadata to the question record. Check correlation_to_predicted:

| Correlation | Action                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------- |
| ≥0.85       | Calibration accepted; question proceeds to Stage 6 (Release)                                      |
| 0.70 - 0.85 | Calibration accepted with `provisional` flag; CDO reviews monthly                                 |
| <0.70       | **Reject calibration**; send back to SME for question redesign OR re-evaluate the band assignment |

### Step 6 — Release to live library

Stage 6 of the pipeline. Question now appears in ReadyBank API responses, JD-Forge output, or Stack-Vault delivery (depending on routing).

### Step 7 — Post-deploy IRT refinement

Real candidate responses (not just Reference Panel) augment the calibration. Recalibration happens automatically when:

- 100 new real-candidate responses since last fit
- 30 days since last recalibration
- Anti-leak rotation retires the question (final IRT snapshot taken before retirement)

---

## Audit (monthly CDO review)

Once per month, CDO samples 100 questions from the live library and verifies:

1. Every sampled question has IRT metadata (SO-21 compliance check)
2. Predicted-vs-observed correlation across sample is ≥0.85 (per `cto/sli-slo.md` Content Engine SLO)
3. No question has stale calibration (>90 days old without refinement)

Findings logged in monthly business review (`bali/templates/monthly-business-review.md` §6 AI Agent / SEO Performance section — extended to include CDO metrics).

---

## What this protocol does NOT do

- ❌ **Replace SME judgment.** The SME predicts; IRT measures. Both inform the difficulty band.
- ❌ **Run on raw GPT output.** A question must pass Stage 4 (SME Review) before calibration. Skipping SME → calibrating raw AI output → SO-3 violation.
- ❌ **Make difficulty subjective.** "Hard" is not a band. b=0.42 is a band-4 anchor.
- ❌ **Apply to non-question content.** Marketing copy, blog posts, ADRs, etc. — not under SO-21.

---

## Anti-patterns

- ❌ Releasing without calibration "because we're in a hurry" — SO-21 is auto-fail; constitutional violation
- ❌ Calibrating against tiny panel (<30 responses) and not flagging provisional status
- ❌ Hiding low correlation_to_predicted to avoid re-doing SME review
- ❌ Hand-tweaking IRT parameters to match SME predictions (defeats the purpose)

---

## Tools (Y1 reality)

- **Statistical fitting:** Python `pyirt` package (free, BSD-licensed, supports 2PL + 3PL)
- **Reference Panel orchestration:** Customer-Zero internal Talpro India + Wave-N SMEs (Y1) → paid candidate platform (M9+ per Article IX-M9 amendment)
- **Storage:** PostgreSQL `questions` table with JSONB `irt` column
- **Audit dashboard:** TBD M2+ (currently manual SQL queries by CDO)

---

_Cross-references: Constitution SO-21, Article VII, §2.5 (CDO charter), CTO Architecture §6 (Anti-Leak Engine — IRT is its calibration input), `cdo/reference-panel-governance.md`, `cdo/wave-cadence.md`, `cto/sli-slo.md` Content Engine SLOs section._
