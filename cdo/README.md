# CDO — Chief Data Officer Operating Folder

**Office:** CDO · Office 5 of 7 (Constitution §2.5)
**Y1 reality:** CTO Office wears the CDO hat per Constitution §2 introduction → I/O Psych FTE assumes ownership Y2+
**Source-of-truth:** Constitution §2.5 + CTO Architecture v1 §6 (Anti-Leak Engine) · `governance/Bias-Detection-Methodology-v1.md` · `governance/AI-Plagiarism-Benchmark-Protocol-v1.md` · `governance/Reference-Panel-Governance-v0.md`
**Constitutional authority:** §2.5 + SO-21 (IRT mandate), SO-22 (AI plagiarism public benchmark + 24h anti-leak SLA)

---

## Charter

CDO owns **data integrity, calibration, and anti-leak forensics** for QOrium. Three substantive domains:

1. **Calibration** — every shipped question has IRT metadata (SO-21); the calibration is anchored to a Reference Panel; the panel is governed.
2. **Anti-leak** — daily fingerprint scans against public sources; semantic-similarity match; regenerate-and-retire when matched. SO-22 bounds: 24-hour SLA strictly beat (we operate to <24h).
3. **Watermarking** — Stack-Vault customers get per-candidate watermarking with forensic-attribution dashboard.

CDO does NOT:

- Author content (that's the SME network — operated by COM, not CDO directly)
- Operate the AI generation pipeline (that's CTO Office #3 engineering territory)
- Sell to customers (Bali #7) or set pricing (CEO authority)

CDO certifies that what ships is calibrated, leak-checked, and watermarkable.

---

## Folder Structure

```
cdo/
├── README.md                              ← you are here
├── irt-calibration-protocol.md            ← SO-21 operationalized
├── anti-leak-forensics.md                 ← SO-22 operationalized; fingerprint methodology
├── reference-panel-governance.md          ← paid-candidate calibration network ops
├── wave-cadence.md                        ← content engine wave releases (Wave 1/2/3+)
└── watermark-forensics.md                 ← Stack-Vault per-candidate forensic-attribution
```

---

## CDO cadence (where this folder fits in)

| Cadence                            | Activity                                                                                       | Owner                                                    | Folder reference                                               |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------- |
| **Daily**                          | Anti-leak fingerprint scan run (cron job M2+)                                                  | CDO (CTO Y1)                                             | `anti-leak-forensics.md`                                       |
| **Per question authored**          | IRT calibration metadata captured + validated against Reference Panel                          | CDO (CTO Y1)                                             | `irt-calibration-protocol.md`                                  |
| **Per Stack-Vault customer issue** | Watermark generation + dashboard registration                                                  | CDO (CTO Y1)                                             | `watermark-forensics.md`                                       |
| **Weekly**                         | Reference Panel session orchestration (Y1 = monthly until panel scales)                        | COM + CDO                                                | `reference-panel-governance.md`                                |
| **Per content wave**               | Wave release: Spec → AI Draft → Self-Critique → SME Review → Calibrate → Release → Post-Deploy | COM (operates) + CDO (validates calibration + anti-leak) | `wave-cadence.md`                                              |
| **Monthly**                        | IRT correlation audit (predicted vs observed difficulty on a 100-question sample)              | CDO                                                      | `irt-calibration-protocol.md` §Audit                           |
| **Quarterly**                      | AI plagiarism public benchmark run (SO-22)                                                     | CDO                                                      | `governance/AI-Plagiarism-Benchmark-Protocol-v1.md` (existing) |
| **Per leak detection**             | Investigate, regenerate variant, retire original, notify watermark holder if Stack-Vault       | CDO                                                      | `anti-leak-forensics.md` + `watermark-forensics.md`            |

---

## CDO Standing Orders (constitutional anchors active in this folder)

| SO        | Subject                                            | Where it lives in this folder                                                                                           |
| --------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **SO-3**  | Quality Gate Discipline                            | Every wave release scored against Quality Gate (Article VII) — `wave-cadence.md` references the gate                    |
| **SO-21** | IRT Mandate                                        | `irt-calibration-protocol.md` operationalizes; auto-fail per Article VII if missing                                     |
| **SO-22** | AI Plagiarism Public Benchmark + 24h Anti-Leak SLA | `anti-leak-forensics.md` + governance/AI-Plagiarism-Benchmark-Protocol-v1.md; auto-fail per Article VII if SLA breached |
| **SO-24** | Recursive No-Fiction Rule                          | Bias-detection methodology + IRT calibration sources — every claim sourced                                              |

---

## Y1 reality

The CTO Office wears the CDO hat in Y1. By Y2+, an I/O Psychology FTE assumes operational ownership per CTO Architecture §15 hiring plan. The folder structure stays constant; only the named operator changes.

For Y1 the workflow is:

- **Daily:** anti-leak fingerprint scan (M2+ when engine ships) runs unattended; CDO reviews flagged matches
- **Weekly:** CDO reviews IRT correlation drift in last 7 days
- **Monthly:** CDO writes a 1-page CDO update for the monthly business review (`bali/templates/monthly-business-review.md`)
- **Quarterly:** CDO operates the AI plagiarism benchmark + publishes results

---

## Cross-reference map

| Topic                                | Lives at                                                                                      |
| ------------------------------------ | --------------------------------------------------------------------------------------------- |
| **Anti-leak engine architecture**    | `07-CTO-Architecture-v1.md` §6                                                                |
| **Quality Gate scorecard**           | `governance/Quality-Gate-92pt-Scorecard.md`                                                   |
| **Bias detection methodology**       | `governance/Bias-Detection-Methodology-v1.md`                                                 |
| **AI plagiarism benchmark protocol** | `governance/AI-Plagiarism-Benchmark-Protocol-v1.md`                                           |
| **Reference Panel governance v0**    | `governance/Reference-Panel-Governance-v0.md`                                                 |
| **Customer Zero feedback charter**   | `customer-zero/D4-Customer-Zero-Feedback-Charter.md`                                          |
| **SME validation tracker**           | `customer-zero/SME-Validation-Tracker-Wave1.xlsx`                                             |
| **Wave plans**                       | `customer-zero/Wave-1-Question-Batch-Plan.md`, `customer-zero/Wave-3-Plan-M9-Plus-Kickoff.md` |
| **CDO SLOs**                         | `cto/sli-slo.md` Content Engine SLOs section                                                  |
| **Constitutional mandate**           | Constitution §2.5 + Article VII (auto-fail criteria) + SO-21, SO-22                           |

---

## What's NOT here yet

- ❌ Live anti-leak engine — M2 deliverable per Blueprint trajectory; this folder defines the protocol the engine implements
- ❌ Reference Panel paid-candidate network — referenced as M12 milestone in Investor Brief; Y1 uses internal Talpro India + Wave-1 SMEs
- ❌ Live IRT correlation data — Wave-1 calibration is proxy-only Y1; real correlation lands at M9 (psychometric milestone per Constitution Article IX-M9 amendment)
- ❌ Production watermark forensic dashboard — UI for Stack-Vault customer security teams; M2-M4 deliverable

These are tracked as TD-003 and adjacent items in `cto/tech-debt.md`.

---

_Maintained by CTO Office (operating the CDO hat in Y1). Authority: Constitution §2.5._
