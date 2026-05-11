# GATEKEEPER — Quality + Security Release Gating Operating Folder

**Office:** GATEKEEPER · Office 6 of 7 (Constitution §2.6)
**Y1 reality:** CTO Office wears the GATEKEEPER hat per Constitution §2 introduction
**Source-of-truth docs:** Constitution §2.6 + Article VII (Quality Gate) · `governance/Quality-Gate-92pt-Scorecard.md` · `governance/AI-Plagiarism-Benchmark-Protocol-v1.md` · `cto/runbooks/incident-response.md`
**Constitutional authority:** §2.6 + SO-3 (Quality Gate Discipline), SO-15 (Zero Secrets in Git), SO-22 (AI plagiarism public benchmark), SO-24 (no-fiction rule)

---

## Charter

GATEKEEPER owns **release gating** — the explicit decision to ship (or not ship) each release. Two substantive domains:

1. **Quality release gating** — does this release pass the Quality Gate (Article VII)?
2. **Security release gating** — does this release pass security review (SO-15 + threat-model check)?

GATEKEEPER does NOT:

- Make architectural decisions (CTO Office #3 owns ADRs)
- Score blueprints upstream (IdeaForge Office #4 — bundled in `manthan/ideaforge-rubric.md`)
- Create content (CDO #5 + COM)
- Sell to customers (Bali #7)

GATEKEEPER is the FINAL gate before code or content reaches production. Pass = ship. Fail = back to the contributing Office.

---

## Folder Structure

```
gatekeeper/
├── README.md                              ← you are here
├── release-gate-protocol.md               ← canonical pre-release checklist + sign-off
├── security-review-protocol.md            ← security gating: secrets + audit + threat model
├── ci-gate-maintenance.md                 ← what each CI workflow gates; how to interpret pass/fail
├── quality-gate-operationalization.md     ← 92-point scorecard runs in practice
└── ai-plagiarism-benchmark-procedure.md   ← SO-22 quarterly benchmark (CDO co-owned)
```

---

## GATEKEEPER cadence

| Cadence                                   | Activity                                                                                 | Owner                                | Folder reference                                                                       |
| ----------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------- |
| **Per release / merge to main**           | Run release-gate sign-off                                                                | GATEKEEPER (CTO Y1)                  | `release-gate-protocol.md`                                                             |
| **Per PR with security-relevant changes** | Run security review                                                                      | GATEKEEPER                           | `security-review-protocol.md`                                                          |
| **Continuous**                            | CI gates always green on main                                                            | CTO Office (CI) + GATEKEEPER (audit) | `ci-gate-maintenance.md`                                                               |
| **Per content wave**                      | Run Quality Gate scoring against the wave                                                | GATEKEEPER + CDO                     | `quality-gate-operationalization.md`                                                   |
| **Quarterly**                             | AI plagiarism public benchmark + publish results                                         | GATEKEEPER + CDO                     | `ai-plagiarism-benchmark-procedure.md`                                                 |
| **Per Phase Gate milestone**              | M0/M3/M9/M12/M21 — full GATEKEEPER pass against milestone-specific Quality Gate criteria | GATEKEEPER + IdeaForge bundle        | `manthan/ideaforge-rubric.md` (upstream) + `quality-gate-operationalization.md` (here) |

---

## GATEKEEPER vs IdeaForge — what's the difference?

This is a common source of confusion (and one Y1 hides because CTO Office wears both hats):

| Office                    | Domain                     | Acts on                                               | Inputs                                             | Outputs                                         |
| ------------------------- | -------------------------- | ----------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------- |
| **IdeaForge** (Office 4)  | Strategic gate scoring     | MANTHAN blueprints (planned work)                     | A blueprint that hasn't shipped yet                | PASS/FAIL/CONDITIONAL → MANTHAN handoff         |
| **GATEKEEPER** (Office 6) | Operational release gating | Code + content + security review (work about to ship) | A release candidate (PR ready, content wave ready) | PASS/HOLD → ship to prod or back to contributor |

IdeaForge gates plans. GATEKEEPER gates execution. Both use the 92-point Quality Gate scorecard but apply it at different lifecycle stages.

---

## Constitutional Standing Orders active in this folder

| SO        | Subject                        | Where it lives in this folder                                                                            |
| --------- | ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| **SO-3**  | Quality Gate Discipline        | `quality-gate-operationalization.md` — operationalization of `governance/Quality-Gate-92pt-Scorecard.md` |
| **SO-15** | Zero Secrets in Git            | `security-review-protocol.md` — gitleaks gate                                                            |
| **SO-16** | Documentation as Code          | `release-gate-protocol.md` — every release sign-off recorded                                             |
| **SO-22** | AI Plagiarism Public Benchmark | `ai-plagiarism-benchmark-procedure.md`                                                                   |
| **SO-24** | Recursive No-Fiction Rule      | `quality-gate-operationalization.md` auto-fail criteria                                                  |

---

## Release-gating architecture (relationship to CI workflows)

The CI workflows in `.github/workflows/` are the **automated layer** of GATEKEEPER. The runbook layer in this folder is the **human-decision layer**. Together they cover:

```
Automated CI gates (.github/workflows/)
├── ci.yml: lint · typecheck · test · secret-scan · security-audit · build
├── marketing-quality.yml: Lighthouse · axe-core · Playwright E2E
├── deploy-marketing.yml: SSH deploy + smoke test
└── uptime.yml: continuous external probe (5-min cron)

GATEKEEPER human-decision gates (this folder)
├── release-gate-protocol.md: human sign-off after CI green
├── security-review-protocol.md: human review for security-sensitive PRs
├── quality-gate-operationalization.md: 92-point scorecard for content + arch
└── ai-plagiarism-benchmark-procedure.md: quarterly public benchmark
```

CI green is necessary but NOT sufficient for release. The GATEKEEPER human gate is the final say. Why two layers: CI catches automatable failures (lint, secrets, typecheck); humans catch judgement issues (architectural fit, customer-facing impact, brand-consistency).

---

## Y1 reality: GATEKEEPER is CTO

Per Constitution §2 introduction, in Y1 the CTO Office wears the GATEKEEPER hat. The two-layer architecture (CI + human) means:

- CTO defines the CI gates (per ADR 0001-0006 in `cto/adrs/`)
- CTO operates the human gate (release sign-off + security review)
- CTO escalates to CEO when judgement is reserved (per Constitution §2.2)

By Y2+, GATEKEEPER may have a dedicated operator (per CTO Architecture §15 hiring plan). The folder structure stays constant; only the named operator changes.

---

## What GATEKEEPER does NOT do

- ❌ **Make decisions reserved to CEO.** Pricing, customer commitments, hiring — CEO authority per §2.2.
- ❌ **Score MANTHAN classifications.** That's the upstream Decision Framework (Article VI). GATEKEEPER comes later, on execution.
- ❌ **Author content or code.** GATEKEEPER reviews; CDO + CTO + Bali execute.
- ❌ **Enforce SO-10 watermark forensics.** That's CDO domain (`cdo/watermark-forensics.md`).
- ❌ **Auto-merge.** Even on a clean release-gate pass, merge requires explicit human action (no auto-merge enabled on PR #10 per the launch sprint).

---

## Cross-reference map

| Topic                                                                | Lives at                                                               |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Quality Gate scorecard (canonical)**                               | `governance/Quality-Gate-92pt-Scorecard.md`                            |
| **Quality Gate operationalization (this folder)**                    | `gatekeeper/quality-gate-operationalization.md`                        |
| **AI plagiarism benchmark protocol (canonical)**                     | `governance/AI-Plagiarism-Benchmark-Protocol-v1.md`                    |
| **AI plagiarism benchmark procedure (this folder, operationalized)** | `gatekeeper/ai-plagiarism-benchmark-procedure.md`                      |
| **Bias detection methodology**                                       | `governance/Bias-Detection-Methodology-v1.md`                          |
| **Incident response (release-gate-failure case)**                    | `cto/runbooks/incident-response.md`                                    |
| **CI workflow definitions**                                          | `.github/workflows/{ci,marketing-quality,deploy-marketing,uptime}.yml` |
| **Tech debt register**                                               | `cto/tech-debt.md` (any release deferral logged here)                  |

---

## What's NOT here yet

- ❌ **Per-release sign-off log** — first formal sign-off entry lands when the next material PR ships post-this commit
- ❌ **Quarterly AI plagiarism benchmark first run** — Q3 2026 (target 2026-08-05 alongside Bali quarterly competitive scan per SO-25)
- ❌ **Live security review log** — first entry when next security-sensitive PR ships

---

_Maintained by CTO Office (operating the GATEKEEPER hat in Y1). Authority: Constitution §2.6._
