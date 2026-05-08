# Cohort Balance Spec — Reference Panel

**Goal:** ensure the Reference Panel is statistically + ethically
balanced enough that IRT calibration + DIF detection produce
defensible results.

The Charter (Tier-A2 D2) finalises these numbers; this spec is the
v0 anchor.

---

## Two layers of balance

### Layer 1 — Skill × Experience cohort grid (calibration balance)

For each (skill, experience-band) pair, target ≥ 3 respondents at
v0; ramp to ≥ 10 in Y1 close (n=500).

Why ≥ 3: minimum to detect outliers per cell.
Why ≥ 10 by Y1: enables per-cell DIF analysis at adequate power.

13 skills × 5 experience bands = 65 cells.
At ≥ 3 per cell: minimum 195 respondents. We round up to 200 for
margin.
At ≥ 10 per cell: 650 respondents. Conservative target by Y1 close
is 500 (≈ 7-8 per cell average; some cells will be deeper than
others based on natural distribution).

### Layer 2 — Demographic balance (DIF / fairness)

For each protected category, ensure adequate representation per skill
cohort to compute meaningful DIF. The categories tracked:

- **Gender:** female / male / non-binary / prefer-not-to-say
- **Age band:** 18-24 / 25-34 / 35-44 / 45-54 / 55+
- **Region:** North India / South India / East / West / Northeast /
  outside India
- **Educational background:** Tier-1 institution / Tier-2 / Tier-3 /
  self-taught + bootcamp / international degree

Note: caste, religion, marital status are NOT collected — these are
illegal to collect or track for DIF in employment testing in India,
and ethically outside our scope.

**Targets per protected category (per skill cohort, at n=200):**
- ≥ 30% representation of any binary-significant group (e.g., gender
  cut: at minimum 30% female respondents in each skill cohort)
- ≥ 15% representation of any 4-or-more-group cut (e.g., age band)

If a cohort drops below these thresholds, calibration is run BUT
the DIF report explicitly flags the cell as under-powered for that
cut. Not a hard block; a transparency flag.

---

## Recruitment intake target distribution

To hit the target distribution, channel allocation needs to be
deliberate:

| Cohort gap | Channel that fills it |
|---|---|
| Junior (0-1 yr) Java/Python/React | Campus partnerships |
| Senior (15+ yrs) any skill | LinkedIn + community |
| SAP-ABAP / Oracle HCM / CPQ / Finacle / Embedded Automotive | Professional outreach (paid LinkedIn + Naukri) — these are scarce in campus |
| Female respondents in tech roles | Targeted partnerships (Anita-B / Stree.ai / Women Who Code chapters / SheLeadsTech) |
| Northeast + tier-3 region representation | Faculty-channel outreach to north-east engineering colleges + community channels |
| Returning professionals after career break | Relauncher India / Mom Society partnerships |
| Self-taught / bootcamp respondents | Discord communities + Stack Overflow targeted |

Each gap above gets a named owner in the recruitment plan, with a
weekly check-in.

---

## What "complete" means for cohort balance

| Status | Definition |
|---|---|
| **MVP complete** | ≥ 200 sessions; ≥ 65 cells filled (3+ each); no protected-category cut below 15% in any skill cohort |
| **Y1 complete** | ≥ 500 sessions; ≥ 65 cells filled (≥ 7 each); protected cuts ≥ 30% binary, ≥ 20% multigroup |
| **Y2 complete** | ≥ 1,000 sessions; ≥ 65 cells filled (≥ 15 each); per-cohort DIF reports adequately powered |

Master Meter implications:
- MVP complete unblocks Wave-3 v0.1 release + first IRT calibration
  cycle (Tier-A2 D4 deliverable)
- Y1 complete unblocks Wave-3 v1.0 release + bias-detection report
  (Tier-A2 D5 deliverable)
- Y2 complete unblocks per-region tenant rollout in Y2-Y3 international
  expansion

---

## Anti-pattern: WEIRD-skewed panel

The most common failure of a tech-assessment Reference Panel is
recruiting only from a narrow demographic — typically: urban
elite-institution male engineers in the 25-34 band — and then
calibrating against that biased baseline.

**Defense:** explicit recruitment quotas published in the Charter
(Tier-A2 D2). Channels are owned to fill specific cohort cells,
not just "any respondents."

**Detection:** at week 4 (n=50 milestone), run a cohort-balance
audit. If demographic skew is forming, escalate channel mix
immediately:

- Hire targeted-recruitment consultant for under-represented cells
- Adjust honorarium per cell (e.g., +₹500 for under-filled
  demographic cuts — published transparently as targeted incentive,
  not "discrimination")
- Slow general intake until cohorts fill

**Transparency:** the Charter publishes a quarterly "panel
composition" report; demographic skew is named in the report with a
rationale. Customer + investor Trust pages reference this.

---

## Compensation parity across cohorts

All cohorts: **₹2,000 per session (90 minutes)**.

We do NOT discount honorarium for junior respondents; we do NOT
inflate for senior respondents. This is calibration data, not
employment screening. Equal honorarium = equal weight in our model
+ equal respect for time.

If a senior respondent declines because ₹2,000 isn't worth their
time: that's fine. Our calibration math is strongest when
respondents opt in voluntarily, not when we buy them above market.

---

## Cohort review cadence

| When | What |
|---|---|
| Daily (week 1-8) | New applications + approvals reviewed by CDO Office Y1 |
| Weekly (week 1-8) | Cohort-balance dashboard published to CEO + I/O Psych contractor |
| Bi-weekly (week 1-8) | Channel attribution analysis (which channel filled which cells) |
| Monthly (post-MVP) | Charter-required quarterly composition report |

---

## Charter-bound items (Tier-A2 D2 dependency)

The following items are SPECIFICALLY co-authored with the I/O Psych
contractor and may shift this v0 spec:

- Final cell-target numbers
- Final protected-category list (Charter may add or remove based on
  DIF-power requirements)
- Honorarium structure (₹2,000 may be adjusted ±25%)
- Compensation parity policy
- Quarterly composition report format

This v0 spec is the **engineering scaffolding** for the Charter, not
a replacement for it.

---

_Spec is a draft. Cohort numbers refined in Reference Panel Charter
(Tier-A2 D2 deliverable). All values gated on CEO approval + I/O
Psych contractor signoff._
