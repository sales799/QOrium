# QOrium Question Bank — Completion vs Constitution v2.0 (live DB scorecard)
**Date:** 2026-06-03 · **Author:** Claude (CTO) · **Method:** live `psql` on `qorium` DB (schema `content`) vs Constitution v2.0 Article IX phase gates + CDO Standing Orders (SO-8, SO-20, SO-21, SO-9).

## Verdict
**No — the Question Bank is NOT 100% of the Constitution's defined plan. It is at roughly Phase-1 ~20% by volume,** with the taxonomy ahead of schedule but **two hard Constitutional gaps** (SME validation 0%, empirical IRT calibration 0%) and one compliance flag.

> The Constitution's *venture* "100% complete" = strategic exit ($300M acquisition / ₹3,000Cr IPO / $50M-ARR anchor) — not the question here. The relevant plan-of-action is the **phased content build (Article IX) + content-engine Standing Orders.** Scored below.

## Live DB ground truth (qorium.content.questions, 2026-06-03)
| Metric | Live value |
|---|---|
| Questions (status=released) | **986** |
| SKU split | readybank=986 (JD-Forge/Stack-Vault content: 0 stored — by design, generated/per-customer) |
| Formats | mcq 676, code 98, casestudy 69, design 53, coding 40, + ~15 inconsistent variants |
| Distinct programming languages | **1** |
| **SME-validated (`sme_validated_by`)** | **0 / 986** |
| AI authorship recorded (`authored_by`) | 986 / 986 ✅ |
| IRT difficulty param present (`difficulty_b`) | 986 / 986 (priors) |
| **Empirically IRT-calibrated (`calibration_n>0`)** | **0 / 986** |
| Skills / sub-skills | 511 / **881** |
| Reference-Panel responses logged | **1** |
| India-stack: SAP/ABAP · Oracle · Salesforce · Finacle · Embedded | 60 · 80 · 97 · 56 · 56 |

## Scorecard vs Constitution Phase 1 (the current M3 gate, Article IX)
| Phase-1 criterion | Target | Live | Status |
|---|---|---|---|
| Validated questions (Wave 1 Tech Core) | 5,000 | 986 | 🔴 ~20% |
| Programming languages live | 20+ | 1 | 🔴 ~5% |
| ReadyBank API alpha + bulk export 3+ formats | live | API live; export formats unverified | 🟡 |
| **IRT scoring active on all released items** (SO-21) | all | params=priors on 986; **0 calibrated** | 🟡 letter-not-spirit |
| **SME validation on every released question** (SO-8) | 100% | **0%** | 🔴 **violation** |
| 100 candidates through QOrium (Customer Zero) | 100 | 1 | 🔴 ~1% |
| 6 hires (Eng/SME/AE/BD/I-O psych/FE) | 6 | (people — CEO-owned, not in DB) | ⚪ unverified |

## Scorecard vs Phase 2 content (partly pulled forward)
| Phase-2 criterion | Target | Live | Status |
|---|---|---|---|
| Validated questions (Wave 2) | 12,000 | 986 | 🔴 ~8% |
| Sub-skill coverage | 600+ of 1,229 | **881** | 🟢 **exceeds** |
| SAP ABAP | 200+ | 60 | 🟡 30% |
| Oracle HCM/EBS | 150+ | 80 | 🟡 53% |
| Salesforce | 100+ | 97 | 🟢 ~97% |
| Finacle/Flexcube | 100+ | 56 | 🟡 56% |
| Embedded automotive | 50+ | 56 | 🟢 exceeds |
| Anti-leak engine v0 in production | live | `qorium-leak-crawler` live but **mock (no Serper key)** | 🟡 |

## The two Constitutional gaps that matter most
1. **SO-8 violation — 986 questions are `status='released'` but 0 are SME-validated.** The Constitution is explicit: *"No question reaches a customer without passing the CDO's quality-bar SLA… SME validation mandatory for ReadyBank"* (SO-8, §2.5 SO-1), and the 92-pt Quality Gate auto-fails a content release lacking it (Art. VII §7.2). **If any of these 986 are actually served to a customer, that is a release-gate breach, not just unfinished work.** → Action: either (a) run the SME-validation pass before any are customer-exposed, or (b) re-flag them `status='draft'/'candidate'` until validated.
2. **IRT is populated but not *calibrated*.** Every question has a `difficulty_b` (a prior/AI estimate) — so the marketing "IRT-calibrated" claim is *letter*-true but **0/986 are empirically calibrated** (`calibration_n=0`) because calibration needs real candidate responses and only **1** is logged. SO-21 + Phase-3 "IRT calibration pipeline live, 1,000+ Reference Panel" are not yet producing.

## What's left to hit 100% of the defined plan (in dependency order)
1. **Fix the SO-8 compliance flag now** (validate-or-reclassify the 986). Cheapest, highest-integrity move.
2. **Volume:** 986 → 5,000 (Phase 1), then 12,000 (Phase 2), 25,000 (P3), 40,000 (P4). ~4,000 more questions just to clear Phase 1.
3. **Language breadth:** 1 → 20+ programming languages (Phase 1).
4. **Run candidates (Customer Zero):** 1 → 100 responses → this is what *unlocks* empirical IRT calibration (chicken-and-egg; Talpro dogfooding per SO-1).
5. **Build the Reference Panel:** 1 → 1,000 candidates (Phase 3) for calibration at scale.
6. **India-stack top-ups:** SAP ABAP +140, Oracle +70, Finacle +44 to clear Phase-2 floors.
7. **Anti-leak live:** Serper key → crawler off mock (SO-9 24-h rotation real).
8. **Taxonomy hygiene:** normalize `format` values (`code`/`coding`/`code (apex)` → one controlled vocab; `casestudy`/`case study`/`case-study` → one).
9. **Hiring (CEO):** SME Lead + I/O-psych contractor — the bodies that do SME validation + calibration governance.

## Bottom line
Taxonomy/role-graph: **ahead** (881 sub-skills > 600 target). Raw content: **~Phase-1 20%.** Quality pipeline: **the weakest link** — 0% SME-validated and 0 empirically calibrated, with SO-8 currently in breach for anything customer-exposed. "100% of the plan" is not close; the *fastest credibility win* is fixing the SME-validation gate and running Customer-Zero candidates to start the calibration flywheel — neither needs new founder credentials.
