# Customer Zero — COM (Content Ops Manager) Operating Folder

**Function:** COM — Content Operations Manager. NOT a Constitutional Office (those are codified in §2 — Manthan, CEO, CTO, IdeaForge, CDO, Gatekeeper, Bali). COM is a function under CTO Office (Y1) → its own role (Y2+).
**Y1 reality:** CTO Office wears the COM hat alongside Manthan + IdeaForge + CDO + Gatekeeper.
**Source-of-truth strategy:** [`04-QOrium-Blueprint-v1.md`](../../04-QOrium-Blueprint-v1.md) §3.1 (7-stage Content Engine), §3 (SME network)
**Constitutional authority:** SO-1 (Talpro Customer Zero Mandate), SO-3 (Quality Gate), SO-21 (IRT mandate), SO-22 (anti-leak SLA)

---

## What COM owns

The Content Operations Manager runs the day-to-day execution of the 7-stage content engine:

```
Spec → AI Draft → Self-Critique → SME Review → Calibrate → Release → Post-Deploy
  ↑                                  ↑              ↑          ↑
  COM owns flow                   COM coordinates SMEs  CDO    GATEKEEPER
                                                    operates  approves
```

CDO owns calibration mechanics (per `cdo/wave-cadence.md` + `cdo/irt-calibration-protocol.md`). GATEKEEPER owns release-gate scoring (per `gatekeeper/quality-gate-operationalization.md`). COM is the operational glue between them — sourcing SME contractors, scheduling Reference Panel sessions, batching waves, processing SME validation passes, paying contractors on time.

---

## Folder structure

```
customer-zero/ops/
├── README.md                              ← you are here
├── sme-onboarding-protocol.md             ← how COM onboards a new SME contractor
└── wave-readiness-checklist.md            ← single-page checklist used per-wave
```

The `customer-zero/` parent folder (where this nests) holds the actual content artifacts: Wave 1/2/3 batch plans, SME validation trackers (`.xlsx`), CEO Sniff Test verdicts, India-Stack Content Roadmap, etc. This `ops/` subfolder is the OPERATING layer for COM's function.

---

## What COM does NOT do

- ❌ NOT IRT calibration (CDO owns — `cdo/irt-calibration-protocol.md`)
- ❌ NOT bias detection methodology (CTO + governance doc — `governance/Bias-Detection-Methodology-v1.md`)
- ❌ NOT Quality Gate scoring (GATEKEEPER — `gatekeeper/quality-gate-operationalization.md`)
- ❌ NOT customer onboarding (Bali + CTO — `services/readybank/ops/runbooks/customer-onboarding.md`)
- ❌ NOT marketing copy authoring (CTO/Bali joint — `apps/marketing/src/content/copy/`)

COM authors the QUESTIONS through the SME network. Everything else is downstream.

---

## Cadence

| Cadence | Activity | Owner |
|---|---|---|
| **Daily** | Triage AI drafts that need SME review; assign to contractors | COM (CTO Y1) |
| **Per-wave (~2-3 weeks)** | Plan + execute a wave per `cdo/wave-cadence.md` | COM + CDO |
| **Weekly** | SME contractor payment processing (within 5 business days of validation per `customer-zero/SME-Lead-Onboarding-Day-1.md`) | COM |
| **Monthly** | Wave-N retrospective (what slowed it down, what to fix in next wave) | COM + CTO |
| **Per-leak** | Coordinate regenerate-and-retire per `cdo/anti-leak-forensics.md` | COM + CDO |
| **Quarterly** | SME contractor pool review (who's churned, who needs more work, who needs to upskill) | COM + Bali (referrals via Talpro Network) |

---

## Constitutional anchors

- **SO-1** Talpro Customer Zero Mandate — Talpro India runs every internal hiring drive on QOrium output. COM ensures the Talpro feedback loop closes weekly.
- **SO-3** Quality Gate — every wave passes through `gatekeeper/quality-gate-operationalization.md` before release; COM provides the wave inputs.
- **SO-21** IRT Mandate — every shipped question has IRT calibration; COM coordinates with CDO + Reference Panel to make this mechanical.
- **SO-22** AI Plagiarism Public Benchmark + 24h Anti-Leak SLA — COM coordinates the wave-pre-release fingerprint baseline + post-release leak scan results.
- **SO-24** Recursive No-Fiction Rule — COM enforces "no question ships without an SME signature" + "no SME validation passes without explicit walkthrough notes."

---

## Cross-references

| Topic | Lives at |
|---|---|
| **7-stage Content Engine spec** | [`04-QOrium-Blueprint-v1.md`](../../04-QOrium-Blueprint-v1.md) §3.1 |
| **Wave cadence (per-wave operational procedure)** | [`cdo/wave-cadence.md`](../../cdo/wave-cadence.md) |
| **SME Lead Onboarding** | [`customer-zero/SME-Lead-Onboarding-Day-1.md`](../SME-Lead-Onboarding-Day-1.md) |
| **Wave 1 batch plan** | [`customer-zero/Wave-1-Question-Batch-Plan.md`](../Wave-1-Question-Batch-Plan.md) |
| **Wave 3 prep (M9+ kickoff)** | [`customer-zero/Wave-3-Plan-M9-Plus-Kickoff.md`](../Wave-3-Plan-M9-Plus-Kickoff.md) |
| **Customer Zero (Talpro India) feedback charter** | [`customer-zero/D4-Customer-Zero-Feedback-Charter.md`](../D4-Customer-Zero-Feedback-Charter.md) |
| **Reference Panel governance** | [`cdo/reference-panel-governance.md`](../../cdo/reference-panel-governance.md) |
| **Bias detection methodology** | [`governance/Bias-Detection-Methodology-v1.md`](../../governance/Bias-Detection-Methodology-v1.md) |
| **AI Plagiarism Benchmark protocol** | [`governance/AI-Plagiarism-Benchmark-Protocol-v1.md`](../../governance/AI-Plagiarism-Benchmark-Protocol-v1.md) |
| **India Stack Content Roadmap** | [`customer-zero/India-Stack-Content-Roadmap-M3-M6.md`](../India-Stack-Content-Roadmap-M3-M6.md) |
| **Quality Gate scorecard** | [`governance/Quality-Gate-92pt-Scorecard.md`](../../governance/Quality-Gate-92pt-Scorecard.md) |

---

*Maintained by CTO Office (operating the COM function in Y1). When dedicated COM operator hires (Y2+ per CTO Architecture §15), this folder transfers to that operator. Authority: Constitution SO-1 + §2.5 (CDO charter — COM is the operational hand of CDO's content-engine ownership).*
