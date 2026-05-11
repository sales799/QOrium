# Wave 3 — Pre-Flight Doc

**Wave target:** M3 (~July 2026 per Blueprint trajectory)
**Owner:** COM (CTO Office Y1) + CDO (calibration) + GATEKEEPER (gate)
**Pre-flight authored:** 2026-05-06
**Source-of-truth plan:** [`customer-zero/Wave-3-Plan-M9-Plus-Kickoff.md`](./Wave-3-Plan-M9-Plus-Kickoff.md) (already in repo)
**Operating reference:** [`customer-zero/ops/wave-readiness-checklist.md`](./ops/wave-readiness-checklist.md)
**Authority:** Constitution SO-1 (Customer Zero), SO-3 (Quality Gate), SO-21 (IRT), SO-22 (anti-leak), Article IX-M3 milestone criteria

---

## Why this doc exists

Wave 1 + Wave 2 shipped pre-protocol — informally, with CTO + COM coordinating ad-hoc. Wave 3 is the FIRST wave to ship under the formal operating cadence:

- Pre-wave checklist completed (per `customer-zero/ops/wave-readiness-checklist.md`)
- Per-question 7-stage pipeline tracked in the validation spreadsheet
- Post-wave GATEKEEPER quality-gate scoring (per `gatekeeper/quality-gate-operationalization.md`)
- Constitutional auto-fail criteria enforced (Article VII)

This pre-flight doc captures Wave 3's specifics + the readiness state as of 2026-05-06.

---

## Wave 3 scope target

Per `customer-zero/Wave-3-Plan-M9-Plus-Kickoff.md` (the canonical Wave 3 plan; this pre-flight is the operational layer):

**Cumulative target at end of Wave 3:** ~5,000 validated questions (per Article IX M3 milestone — the Phase Gate criterion). Wave 1 + Wave 2 shipped 530 questions; Wave 3 ships +1,500-2,000 to bring cumulative toward 2,500-3,000 (intermediate point on the M3 trajectory). M3 closes with one more wave.

**Coverage priorities (from Wave 3 plan):**

- India-stack expansion (Salesforce CPQ depth, SAP ABAP coverage, Finacle/Flexcube extension, Oracle HCM Cloud depth)
- AI-era assessment formats (AIPE — AI Platform Engineering — extended depth)
- Embedded automotive expansion (AUTOSAR + MISRA-C + functional safety)
- General tech depth (Java backend extensions, Python data extensions, React frontend extensions)

---

## Pre-wave readiness check (as of 2026-05-06)

Per `customer-zero/ops/wave-readiness-checklist.md` pre-wave section:

- ✅ Scope locked (per Wave 3 plan)
- 🟡 SME contractors confirmed — IN PROGRESS. Pool composition (per `customer-zero/ops/sme-onboarding-protocol.md` Y1 reality):
  - ~3 Java backend SMEs (active)
  - ~3 Salesforce SMEs (Apex + LWC + CPQ)
  - ~2 SAP ABAP SMEs
  - ~2 Embedded / Automotive SMEs
  - ~2 AWS / DevOps / SRE SMEs
  - **GAP:** AIPE depth requires 1-2 more specialized SMEs; sourcing in progress per `customer-zero/ops/sme-onboarding-protocol.md`
  - **GAP:** Finacle/Flexcube extension needs 1 more SME; sourcing in progress
- ⏸️ Reference Panel sessions scheduled — PENDING. Y1 reality: panel is still internal-only (Talpro India + Wave-N SME cross-validation). External paid panel scaling at M9-M12 per Constitutional Amendment v2.1 (Article IX-M9 psychometric milestone).
- ⏸️ Anti-leak fingerprint baseline — PENDING. The anti-leak engine is M2 deliverable per TD-003 in `cto/tech-debt.md`; until then, baseline is the Talpro India daily-rotation discipline.
- ✅ Quality Gate criteria reviewed — Article IX M3 phase-specific criteria documented per `gatekeeper/quality-gate-operationalization.md` Phase Gate Milestones table.
- ✅ Bias detection sample plan — per `governance/Bias-Detection-Methodology-v1.md` standard (10% sample at Stage 4 + 10% post-IRT re-check).

---

## Wave 3 risks (logged for the wave-retro)

| Risk | Probability | Mitigation |
|---|---|---|
| Two SME-coverage gaps not filled before wave start (AIPE, Finacle/Flexcube) | Medium | Sourcing in progress; if not filled by wave start, scope-cut those role families to Wave 4 |
| External Reference Panel not yet operational; calibration stays Y1-internal | High (constitutional reality M0-M9) | Calibration ships with `panel_segments: ["internal-talpro"]` flag; questions are SO-21 compliant but provisionally calibrated; M9+ refines |
| Anti-leak engine still manual (Talpro India daily rotation; no automation) | High (TD-003 timeline) | Manual rotation cadence honored; SO-22 claim is true at the cadence level; automation lands M2 |
| Wave size larger than Wave 1+2 combined; SME throughput is the bottleneck | Medium | Batch SMEs per role family; parallelize batches; pay within 5-day SLA to keep contractors engaged |
| GATEKEEPER quality-gate scoring is novel for this wave (first formal run) | Low | Walk through the scorecard with CDO + GATEKEEPER ahead of post-wave scoring; no surprises |

---

## Wave 3 success criteria

The wave is "done well" when:

- [ ] +1,500-2,000 questions shipped (cumulative ~2,000-2,500 toward M3 5K target)
- [ ] All shipped questions have IRT metadata (SO-21 — auto-fail otherwise)
- [ ] No questions ship that the anti-leak baseline matched on a public surface (SO-22)
- [ ] GATEKEEPER scorecard ≥70/92 (per `gatekeeper/quality-gate-operationalization.md` pass threshold)
- [ ] No SO-24 violations (no fabricated content; every claim sourced)
- [ ] All SMEs paid within 5 business days of validation
- [ ] Customer Zero (Talpro India) hiring drives consume the new questions in their next cycle (SO-1 feedback loop closed)
- [ ] Wave 3 retro filed in `customer-zero/Wave-3-Retro-<date>.md` per `customer-zero/ops/wave-readiness-checklist.md` post-wave section

---

## Wave 3 timing

| Phase | Target dates |
|---|---|
| Pre-wave (sourcing + scheduling) | Now → Wave 3 Day 0 |
| Wave 3 active shipping | Wave 3 Day 0 → +21 days |
| Post-wave QA + retro + GATEKEEPER scoring | +21 days → +28 days |

Wave 3 Day 0 is set when:
- All pre-wave readiness items are ✅
- COM, CDO, GATEKEEPER all signal go-ahead
- No constitutional auto-fail criterion is at-risk

Realistic Wave 3 Day 0: **2026-06-15 to 2026-06-30** depending on SME-sourcing throughput.

---

## What this pre-flight does NOT do

- ❌ NOT replace `customer-zero/Wave-3-Plan-M9-Plus-Kickoff.md` — that's the canonical scope plan
- ❌ NOT lock the wave start date — start is gated on pre-wave readiness, not calendar
- ❌ NOT include question-level content — that lives in the wave's eventual `customer-zero/Wave-3-*.md` batch files (one per role family)
- ❌ NOT pre-run the GATEKEEPER scorecard — that runs POST-wave per `gatekeeper/quality-gate-operationalization.md`

---

## Cross-references

| Topic | Lives at |
|---|---|
| **Wave 3 canonical plan** | [`customer-zero/Wave-3-Plan-M9-Plus-Kickoff.md`](./Wave-3-Plan-M9-Plus-Kickoff.md) |
| **Wave readiness checklist (operational)** | [`customer-zero/ops/wave-readiness-checklist.md`](./ops/wave-readiness-checklist.md) |
| **SME onboarding (sourcing the gap-fillers)** | [`customer-zero/ops/sme-onboarding-protocol.md`](./ops/sme-onboarding-protocol.md) |
| **Wave 1 (shipped) batch plan** | [`customer-zero/Wave-1-Question-Batch-Plan.md`](./Wave-1-Question-Batch-Plan.md) |
| **CDO wave cadence (deeper)** | [`cdo/wave-cadence.md`](../cdo/wave-cadence.md) |
| **GATEKEEPER quality-gate operationalization** | [`gatekeeper/quality-gate-operationalization.md`](../gatekeeper/quality-gate-operationalization.md) |
| **M3 Phase Gate criteria** | [`09-QOrium-Constitution-v2.0.md`](../09-QOrium-Constitution-v2.0.md) Article IX |
| **Tech debt items affecting this wave** | [`cto/tech-debt.md`](../cto/tech-debt.md) (TD-003 anti-leak, TD-005 unit tests, etc.) |

---

*Maintained by COM (CTO Office Y1). Authority: Constitution SO-1, SO-3, SO-21, SO-22, Article IX. This pre-flight gets superseded by `Wave-3-Retro-<date>.md` once the wave ships.*
