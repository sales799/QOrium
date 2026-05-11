# CTO — Engineering & Architecture Operating Folder

**Office:** CTO · Office 3 of 7 (Constitution §2.3)
**Y1 hats also worn (per §2 introduction):** Manthan operator (#1), IdeaForge operator (#4), CDO (#5), Gatekeeper (#6) — bundled until dedicated hires Y2+
**Source-of-truth doc:** `07-CTO-Architecture-v1.md`
**Constitutional authority:** Constitution §2.3 + Standing Orders SO-3 (Quality Gate), SO-13 (Tech Stack), SO-14 (No Ollama on VPS), SO-15 (Zero Secrets in Git), SO-16 (Documentation as Code), SO-21 (IRT mandate), SO-22 (AI Plagiarism Benchmark)

---

## Purpose

This folder holds the **operating artifacts** for the CTO Office that the Constitution + CTO Architecture v1 reference but don't ship inline. Templates here are tooling — the Architecture doc is the strategy.

Three categories:

1. **ADRs** (`adrs/`) — Architecture Decision Records. Every material technical decision lives here, numbered and immutable once accepted. New decisions append; old decisions get superseded markers, not deleted.
2. **Runbooks** (`runbooks/`) — operational procedures for incidents, deploys, secret rotation, etc. The "what to do when X happens" reference for on-call.
3. **Service objectives + tech debt** (`sli-slo.md`, `tech-debt.md`) — measurable SLOs against which we operate; honest accounting of shortcuts that need follow-up.

---

## Folder Structure

```
cto/
├── README.md                              ← you are here
├── adrs/
│   ├── README.md                          ← ADR template + index
│   ├── 0001-marketing-tsconfig-standalone.md
│   ├── 0002-tailwind-v4-css-first-theme.md
│   ├── 0003-mailer-fallback-chain.md
│   ├── 0004-vps-pm2-nginx-letsencrypt.md
│   ├── 0005-stdin-fed-env-injection.md
│   └── 0006-marketing-decoupled-from-monorepo-packages.md
├── runbooks/
│   ├── incident-response.md               ← P0/P1/P2 triage + paging
│   ├── deploy-rollback.md                 ← marketing site rollback procedure
│   └── secret-rotation.md                 ← all 3rd-party API keys + DPDPA quarterly rotation
├── sli-slo.md                             ← service-level objectives across all surfaces
└── tech-debt.md                           ← honest register of shortcuts taken
```

---

## CTO Office cadence (where this folder fits in)

Inherits from Constitution §671-687 generic cadence + adds CTO-specific items:

| Cadence             | Activity                                                                                           | Owner                   | Folder reference                       |
| ------------------- | -------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------------------- |
| **On-incident**     | P0/P1/P2 triage + customer notification                                                            | CTO (on-call Y1)        | `runbooks/incident-response.md`        |
| **On-deploy**       | Pre-deploy checklist + post-deploy smoke                                                           | CTO + deploy script     | `runbooks/deploy-rollback.md`          |
| **Daily**           | CI green-check; dependency CVE scan results                                                        | CTO                     | (`pnpm audit` in CI workflow)          |
| **Weekly Mon**      | Pipeline review (Bali primary; CTO listens for tech-blocker escalations)                           | CTO + Bali              | (Bali template)                        |
| **Weekly Fri**      | Tech debt review (10 min in Bali debrief)                                                          | CTO                     | `tech-debt.md`                         |
| **Monthly**         | SLO review against `sli-slo.md`                                                                    | CTO                     | `sli-slo.md`                           |
| **Quarterly**       | ADR audit (any decisions made ad-hoc need backfill) + secret rotation per SO-15 + dependency audit | CTO                     | `adrs/`, `runbooks/secret-rotation.md` |
| **Per-arch-change** | New ADR drafted, reviewed, accepted before code merges                                             | CTO + (CEO if material) | `adrs/`                                |

---

## When to write an ADR

Write an ADR for ANY decision that is:

- **Architectural** (changes how systems fit together — not just code style)
- **Material** (cost >₹3L OR strategic impact OR cross-team) — same threshold as Constitution Article VI
- **Reversal-cost > 1 day** (something we couldn't easily back out of)

Don't write an ADR for:

- Linting rules (use ESLint config)
- Naming conventions (use STYLE.md if needed)
- Dependency bumps within a major version
- Bug fixes (use commit message + PR description)

---

## When to write a runbook

Write a runbook when:

- An on-call engineer would need 5+ minutes to figure out from scratch what to do
- The procedure has steps that must be done in order (e.g., rollback before redeploy)
- The procedure has variant paths based on observed state (e.g., "if logs show X, do A; else do B")

A runbook is NOT a decision doc. It's the muscle memory.

---

## CTO Office Standing Orders (constitutional anchors active in this folder)

| SO        | Subject                                                             | Where it lives in this folder                                                                             |
| --------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **SO-3**  | Quality Gate Discipline (92-point)                                  | `adrs/` — every ADR scored against Quality Gate; `runbooks/` — every runbook tested against Gate criteria |
| **SO-13** | Talpro Universe Tech Stack (Next.js + Express + PostgreSQL + Redis) | `adrs/0001` (tsconfig standalone), `adrs/0002` (Tailwind v4) — deviations require ADR                     |
| **SO-14** | No Ollama on VPS                                                    | `runbooks/incident-response.md` — covers the April 16 incident's lessons                                  |
| **SO-15** | Zero Secrets in Git                                                 | `runbooks/secret-rotation.md` — quarterly rotation procedure; `adrs/0005` (stdin-fed env injection)       |
| **SO-16** | Documentation as Code                                               | This entire folder; ADRs are the formal mechanism                                                         |
| **SO-21** | IRT Mandate                                                         | `sli-slo.md` — IRT calibration latency SLO                                                                |
| **SO-22** | AI Plagiarism Public Benchmark                                      | `sli-slo.md` — anti-leak fingerprint freshness SLO                                                        |

---

## Y1 reality: CTO wears multiple hats

Per Constitution §2 introduction, in Year 1 CTO Office operates Manthan (research/blueprint engine), IdeaForge (gate scoring), CDO (data integrity + anti-leak forensics), and Gatekeeper (release gating) in addition to the engineering charter. That's a lot.

**This folder addresses ONLY the CTO-specific (Office 3) charter.** The other hats get their own folders progressively as dedicated hires land:

- Manthan (Office 1) — its own folder when MANTHAN execution-permissions evolve (Y2+)
- IdeaForge (Office 4) — currently runs from `governance/Quality-Gate-92pt-Scorecard.md` + Constitution Article VI
- CDO (Office 5) — currently runs from `customer-zero/SME-Validation-Tracker-Wave1.xlsx` and the Bali competitive log
- Gatekeeper (Office 6) — currently runs from `.github/workflows/ci.yml` + `marketing-quality.yml`

When you (CTO, Y1 = Bhaskar's CTO doubling for QOrium per Blueprint) make a decision in any of these hats, the deliverable goes into the appropriate existing folder; this `cto/` folder stays focused on Office-3 engineering work.

---

## Cross-reference map

| Topic                                      | Lives at                                                        |
| ------------------------------------------ | --------------------------------------------------------------- |
| **Architecture (strategic)**               | `07-CTO-Architecture-v1.md`                                     |
| **Architecture (decisions)**               | `cto/adrs/` (this folder)                                       |
| **CI/CD workflows**                        | `.github/workflows/{ci,marketing-quality,deploy-marketing}.yml` |
| **VPS deploy script**                      | `infra/marketing-deploy.sh`                                     |
| **Incident response (governance level)**   | `governance/Incident-Response-Runbook-v1.md`                    |
| **Incident response (operational level)**  | `cto/runbooks/incident-response.md` (this folder)               |
| **Quality Gate scoring**                   | `governance/Quality-Gate-92pt-Scorecard.md`                     |
| **Bias detection methodology**             | `governance/Bias-Detection-Methodology-v1.md`                   |
| **AI plagiarism benchmark protocol**       | `governance/AI-Plagiarism-Benchmark-Protocol-v1.md`             |
| **Operating rituals (cadence calendar)**   | `governance/Operating-Rituals-v1.md`                            |
| **CTO deltas (delta from B-series specs)** | `infra/CTO-deltas/`                                             |

---

_Maintained by CTO Office. Authority: Constitution §2.3. ADRs are immutable once accepted (status changes via supersession). Runbooks are living docs (PR review with at-least-one-other-reviewer mandate at Y2+; CTO sole-author Y1 with audit-log discipline)._
