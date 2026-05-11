# Reference Panel Governance

**Authority:** Constitution §2.5 (CDO charter) + SO-21 (IRT mandate — calibration source) + governance/Reference-Panel-Governance-v0.md (existing v0 doc)
**Owner:** CDO (CTO Office Y1) + COM (Content Ops Manager — operates panel sessions)
**Operationalizes:** the calibration data source for `cdo/irt-calibration-protocol.md`

---

## What the Reference Panel is

A controlled set of paid-candidate respondents whose responses to QOrium questions produce the candidate-response data that fits IRT models. Without the Reference Panel, IRT calibration has no inputs — it's the upstream of SO-21 compliance.

Three roles the panel plays:

1. **Initial calibration** (Stage 5 of the 7-stage pipeline) — newly authored questions deploy here first
2. **Recalibration** — every 90 days, a sampled subset of live-library questions re-runs through the panel
3. **Anti-leak variant validation** — when a leak triggers regeneration, the v2 variant calibrates here before replacing v1

---

## Panel composition (Y1 → M12 trajectory)

### Y1 (M0-M3): Internal panel

- **Members:** Talpro India internal team + Wave-1 SMEs operating in cross-validation mode
- **Size:** ~30-50 active respondents
- **Compensation:** Talpro India team unpaid (already employed); Wave-N SMEs paid per validation pass per `customer-zero/SME-Lead-Onboarding-Day-1.md`
- **Limitation:** Internal-only → IRT estimates have selection-bias risk; flagged as `provisional` in metadata until external panel scales

### M3-M9: Hybrid panel

- **Members:** Internal Y1 panel + 50-100 paid external respondents recruited via Talpro Network alumni
- **Size:** ~100-150 active
- **Compensation:** External respondents paid ₹500-2000 per session (rate per skill complexity)
- **Onboarding cycle:** 2 weeks per cohort

### M9+ (per Constitution Article IX-M9 amendment): Production panel

- **Members:** Paid-candidate calibration network at scale (target M12: 500+ active respondents)
- **Compensation budget:** ~₹5L/quarter (per Investor Brief §3 cost line)
- **Diverse segmentation:** by stack, by experience level, by geography, by language

---

## Panel session structure

A "session" is a calibration data-gathering event. Standard structure:

- **Duration:** 30-90 minutes per respondent (varies by question count)
- **Question count:** 10-30 per session (mix of new + recalibration)
- **Format mix:** matches the live library distribution (proportional to ReadyBank-released question counts per format)
- **Anti-collusion:** respondents complete sessions independently; results compared post-hoc; outliers flagged

---

## Consent + data ethics (DPDPA-aligned)

Every panel respondent signs a consent agreement that covers:

1. **Data use** — responses are used solely to calibrate question difficulty + discrimination; not used to evaluate the respondent themselves
2. **PII handling** — respondent identity is hashed; only the segment metadata (stack, experience band, geography) is retained alongside responses
3. **Right to withdraw** — respondent can request deletion of their response data within 30 days post-session; honored within 5 business days
4. **Compensation** — respondents paid within 5 business days of session completion (Y1+); payment receipt proves contract performance
5. **No assessment outcome** — respondent's answer correctness does NOT affect any hiring decision; sessions are research, not screening

The consent agreement template lives at `governance/Reference-Panel-Governance-v0.md` (existing). This folder operationalizes the workflow.

---

## Panel session orchestration (operational procedure)

### Step 1 — Session planning (weekly)

COM (Content Ops Manager) plans the next week's sessions:

- Which questions need calibration (newly authored OR overdue for recalibration)
- Which respondent segments to target
- Number of sessions to schedule

CDO reviews the plan; signs off on session count + question selection.

### Step 2 — Respondent invitation

For external respondents (M3+):

- Email invitation with session purpose + duration + compensation
- 14-day RSVP window
- Honor opt-out at any time

### Step 3 — Session execution

- Respondent receives a session link (web-based test environment)
- Completes questions independently
- Submits; data lands in calibration database with respondent-segment metadata (no PII)

### Step 4 — Data quality check

CDO automated check before fitting IRT:

- Response count per question ≥30 (per `cdo/irt-calibration-protocol.md` minimum)
- Response time distribution looks plausible (no all-correct-in-2-min flags)
- Inter-respondent correlation reasonable (no copy-paste collusion patterns)

If quality check fails → exclude session from fit; flag for review; rerun if needed.

### Step 5 — IRT fit

Per `cdo/irt-calibration-protocol.md` Step 4. Fit produces the b/a parameters for each question.

### Step 6 — Compensation processing

Within 5 business days of session completion, COM disburses payment per the consent agreement. Tracked in finance ledger.

### Step 7 — Audit log

Each session recorded in `cdo/panel-sessions/YYYY-MM-DD-session-NNN.md` with:

- Session date + duration
- Respondent count + segments
- Questions calibrated
- Quality check result
- Compensation disbursed (aggregate; no PII)

---

## What the panel does NOT do

- ❌ **Replace the SME network.** SMEs author + validate questions (Stage 4); the panel calibrates difficulty (Stage 5). Different roles.
- ❌ **Provide bias detection.** Bias is detected in Stage 3 (Self-Critique) + Stage 4 (SME) per `governance/Bias-Detection-Methodology-v1.md`. The panel measures difficulty, not fairness.
- ❌ **Evaluate AI generation quality.** The panel can't tell you if an AI-generated question is "good." It can tell you if calibrated-difficulty matches predicted-difficulty. Quality judgements stay with SMEs + Quality Gate.
- ❌ **Score individual respondents.** Sessions are research; respondents are not being assessed for hiring.

---

## Anti-patterns

- ❌ **Skipping consent.** Even for internal respondents, the consent agreement runs. SO-15 spirit (no shortcuts on data ethics).
- ❌ **Hiding low session counts.** A question calibrated on <30 responses ships with `provisional` flag — never silently treated as fully calibrated.
- ❌ **Compensation delays >5 business days.** Reputational; respondents talk to other respondents.
- ❌ **Reusing respondents within 14 days for the same question.** Familiarity bias contaminates IRT estimates.
- ❌ **Panel members on the SME network simultaneously.** Wave-N SMEs CAN cross over only in tightly-controlled cross-validation sessions; never both for the same question.

---

## Performance metrics

CDO tracks monthly:

- Active respondents in panel (target M12: 500+)
- Sessions per week (Y1: 5-10 sessions/week; M9+: 25+/week)
- Median session count per question (target: ≥30 before IRT fit)
- Time from question authored → calibrated (target ≤14 days; per `cto/sli-slo.md` Content Engine SLO)
- Predicted-vs-observed correlation (target ≥0.85; per same SLO)
- Compensation processed within 5 business days (target 100%)
- Withdraw requests honored within 5 business days (target 100%; legal compliance)

Reported in monthly business review (`bali/templates/monthly-business-review.md` §6 extension for CDO metrics).

---

## Y1 reality

Y1 panel is internal-only. The IRT calibration produced is provisional — IRT estimates may have selection bias because the panel doesn't reflect the full external candidate distribution. This is an honest limitation; IRT metadata ships with the `panel_segments` field showing "internal-talpro-india" rather than a diverse external segment list.

External panel scaling is M9-M12 work per Article IX-M9 amendment. Until then, the Y1 calibration is "directionally correct" rather than "production-grade." The SO-21 mandate is met (every question HAS IRT metadata); the panel governance maturity is what scales over time.

Tracked indirectly via `cto/sli-slo.md` Content Engine "calibration accuracy ≥0.85 correlation" SLO and TD-003 (anti-leak engine) timeline.

---

_Cross-references: Constitution §2.5 (CDO charter), SO-21 (IRT mandate), Article IX-M9 amendment (psychometric validation milestone). Companion docs: `governance/Reference-Panel-Governance-v0.md` (governance-level — consent agreements, legal framework), `cdo/irt-calibration-protocol.md` (downstream consumer of panel data), `customer-zero/SME-Lead-Onboarding-Day-1.md` (parallel SME network)._
