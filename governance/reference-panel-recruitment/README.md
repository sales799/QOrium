# Reference Panel ≥200 — Recruitment Funnel

**Owner:** CDO Office (CTO Office Y1 wear) + I/O Psych contractor (when signed)
**Anchor:** QOrium Constitution Article IX M9; Sprint 1.8 IRT calibration; SO-21 quality gate
**Tile:** `human-prep.reference-panel-200.recruitment-funnel` (auto-eligible: true)
**Linked human tile:** `human.reference-panel-200` (blocked-on-CDO/IOPsych)
**Status:** ready-for-CEO-review

The Reference Panel is the canonical respondent pool against which
QOrium calibrates IRT parameters (discrimination · difficulty ·
guessing) for every question that ever ships to a paying customer.
Without ≥200 calibrated respondents per sub-skill cohort, the IRT
engine cannot anchor item parameters reliably, and Wave-3
psychometric items cannot ship at all.

## Why ≥200

The 200 number is not arbitrary. It is the minimum cohort size at
which:
- 2PL Birnbaum estimates of discrimination + difficulty stabilise
  (≤ ±0.15 SE on b parameters) for Wave-1 sub-skills
- Mantel-Haenszel DIF detection has acceptable power for protected-
  category cuts (gender, age band, region)
- The mean-0/sd-1 location/scale anchor is empirically defensible

Below 200, calibration is noisy enough that the SO-21 quality gate
should reject the run, regardless of Sprint 1.8 IRT package
correctness.

## What this folder contains

| File | Purpose |
|---|---|
| `landing-page-spec.md` | Spec for `panel.qorium.online` landing page |
| `intake-form.md` | Typeform-style intake schema + privacy notice |
| `outreach-channels.md` | 3 channels (campus, professional, organic) + budget |
| `cohort-balance-spec.md` | Demographic + skill-level targets + dashboards |
| `compensation-and-ethics.md` | Honorarium structure + IRB-equivalent ethics |

## Decision required from CEO

| # | Decision | Recommendation |
|---|---|---|
| 1 | Approve panel size target ≥200 (MVP) → ramp to ≥500 over Y1 | YES — 200 hits IRT statistical floor; 500 enables sub-skill cohort cuts |
| 2 | Approve compensation per respondent | ₹2,000 per session (≈90 minutes); pay only after attention-checks pass |
| 3 | Approve total recruitment budget | ₹4-6 lakh for first 200 (₹4L honorariums + ₹1-2L outreach + ops) |
| 4 | Approve campus channel cost vs. Naukri / professional outreach | YES — campus mix accelerates breadth; professional channel pulls senior bands |
| 5 | Designate panel governance signatory | Recommended: CDO Office (CTO Office Y1) + I/O Psych contractor co-sign on Charter |

## Timeline

- **Week 1-2:** Charter co-authored; landing page + intake live
  (`panel.qorium.online` cred-bound — uses staging URL until cred-drop)
- **Week 3-4:** First-cohort outreach (Wave-1 Tech Core: 50 respondents)
- **Week 5-8:** Wave-2 + Wave-3 cohorts (50 each); ≥200 by week 8
- **Week 9-10:** First IRT calibration cycle runs against the ≥200
  baseline; I/O Psych signoff (Tier-A2 D4 deliverable)
- **Week 11-16:** Ramp to ≥500 for finer cohort cuts

If first 50 respondents don't materialise by week 4 → escalate channel mix.

## What changes when complete

- `human.reference-panel-200` flips `blocked-on-human` → `complete`
- Sprint 1.8 IRT calibration runs receive real responses (today
  it's awaiting cred-bound recruitment)
- Wave-3 items get a path from `status='draft'` to `status='released'`
- Bias-Detection report (governance/Bias-Detection-Methodology-v1)
  becomes operable
- Master Meter denominator drops by 1 in human lane
- Constitutional Amendment v2.1 ratification path (Wave-3 AUTHORED)
  becomes unblocked

---

_Prepared by CTO Office under MANTHAN human-lane acceleration plan, 2026-05-08._
_NO outreach has been sent. Recruitment is gated on CEO approval + I/O Psych contractor signoff (Tier-A2)._
