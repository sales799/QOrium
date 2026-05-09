# I/O Psychologist Contractor — Hiring Pack

**Owner:** CEO + CTO Office (CDO Year-1 wear)
**Anchor:** QOrium Constitution v2.0 Article IX M9 phase-gate · CDO Office
**Tile:** `human-prep.io-psych-contractor.sow-and-outreach` (auto-eligible: true)
**Linked human tile:** `human.io-psych-contractor` (blocked-on-CEO+CTO)
**Status:** ready-for-CEO-review

This folder is the complete recruiting + onboarding pack for the I/O
Psychologist contractor (~10-15 hrs/week, 6-month renewable engagement)
who unblocks Wave-3 (Psychometric) ratification, Reference Panel ≥200
calibration runs, and the SO-21 quality gate.

The contractor does **not** build software. They sign off on
psychometric methodology, Wave-3 authored questions, IRT calibration
outputs, DIF (Differential Item Functioning) findings, and the
Reference Panel Governance Charter.

## What this pack contains

| File | Purpose |
|---|---|
| `SOW.md` | Statement of Work — scope, deliverables, IP, confidentiality, termination |
| `outreach-templates.md` | 4 outreach emails (cold, warm intro, LinkedIn DM, follow-up) |
| `reference-check-rubric.md` | 12-question reference check + scoring guide |
| `compensation-benchmark.md` | India + global market rates; recommended offer band |
| `deliverable-schedule.md` | 6-month milestone schedule + payment triggers |

## Why we need this contractor (one-pager)

QOrium's Master Meter caps at 0.78 until human-bound items close
(Constitution Article IX). One of those items is Wave-3 (200
psychometric questions: aptitude · personality · situational
judgement). We have the **engineering rails** for psychometrics
(`@qorium/irt` package — 2PL/3PL Birnbaum, JMLE calibration with
mean-0/sd-1 anchor, Mantel-Haenszel DIF, SO-21 quality gate, 18 tests
green) but we cannot **release** Wave-3 questions to live tenants
until a credentialed I/O Psychologist:

1. Reviews and signs off on the Wave-3 Authoring Template
2. Approves the Reference Panel recruitment plan + cohort balance
3. Reviews calibration outputs once Panel ≥200 responses arrive
4. Signs the Bias-Detection report per
   `governance/Bias-Detection-Methodology-v1.md`
5. Co-authors Reference Panel Governance Charter

Without this credential, every psychometric claim QOrium makes is
unsupported. With it, Wave-3 ships and the Master Meter unlocks past
0.78 (Constitution Article IX m9 phase-gate).

## Why a contractor and not a full-time hire

- **Scope is bounded.** 6 months covers Wave-3 v1 ship + first
  calibration cycle + Reference Panel Charter. Beyond that the cadence
  drops to "validate next wave" — not full-time work.
- **Year-1 budget discipline.** Per CTO Constitution, Y1 wears CDO
  hat; full-time CDO hire is a Year-2 decision.
- **Specialized skill.** Senior I/O psychologists with industrial
  testing experience are scarce; a senior contractor on retainer beats
  a junior FTE on cost + signal.
- **Optionality.** If the contractor proves a perfect match, the SOW
  has a "convert to FTE" amendment clause (see SOW §11).

## Decision required from CEO

| # | Decision | Recommendation |
|---|---|---|
| 1 | Approve SOW shape (scope, IP, confidentiality, termination) | YES — 6-month, ~10-15 hrs/wk, deliverable-tied milestone payments |
| 2 | Approve compensation band | India: ₹2.5L–₹4L/month retainer · Global: $4-6K/month retainer (see `compensation-benchmark.md`) |
| 3 | Approve outreach to ≥10 candidate psychologists | YES — `outreach-templates.md` ready to send |
| 4 | Designate signing authority on the SOW | Recommended: CEO signs, CTO co-signs as project sponsor |

## What happens when the human tile flips

When the contractor is signed:

- `human.io-psych-contractor` flips `blocked-on-human` → `complete`
- Wave-3 work in `governance/wave3/` unblocks (currently engineering-complete-cred-bound)
- Reference Panel recruitment can begin in earnest (panel ≥200 still
  human-bound, but the contractor co-authors the recruitment charter
  with CDO Office)
- Sprint 1.8.irt calibration cycle gets a credentialed signoff path
- Bias-Detection report signoff cycle becomes operable
- Master Meter remains at 0.78 cap; the human-lane denominator drops by 1

---

_Prepared by CTO Office under MANTHAN human-lane acceleration plan, 2026-05-08._
_No outbound message has been sent. Contractor outreach is gated on CEO approval._
