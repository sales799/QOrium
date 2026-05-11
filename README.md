# QOrium

> **The world's first enterprise-grade Question-Bank-as-a-Service.** We deliver an IRT-calibrated, anti-leak-rotated, watermark-per-candidate library — across general tech, India-stack, and AI-era assessment formats — to assessment platforms (API), enterprise hiring teams (Stack-Vault), and recruiters (subscription).
>
> _— Constitution §1.1 (verbatim, locked per SO-2)_

**Live at:** [qorium.online](https://qorium.online) · `qorium.in` 301-redirects · 30 routes
**Status:** Marketing site live; Bali sales-office operational; CDO + CTO + GATEKEEPER + MANTHAN constitutional offices documented
**Active branch:** `claude/qorium-marketing-site-Z4gdI` · [PR #10](https://github.com/sales799/QOrium/pull/10) ready-for-review

---

## What's in this repo

QOrium is a **constitutional organization** — every Office has codified authority and a parallel operating folder. The repo mirrors that organization 1:1.

### Strategy docs (top-level)

The "what + why" — read these first.

| Doc                                                                                                | Purpose                                                                                                         |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [`09-QOrium-Constitution-v2.0.md`](./09-QOrium-Constitution-v2.0.md)                               | The supreme document. 25 Standing Orders, 7 Offices, Quality Gate, Phase Gate milestones, Amendment procedure.  |
| [`04-QOrium-Blueprint-v1.md`](./04-QOrium-Blueprint-v1.md)                                         | Mission, vision, 7-stage content engine, 3 sales motions, M0 → M21 trajectory.                                  |
| [`05-QOrium-Three-Use-Cases-SKU-Architecture.md`](./05-QOrium-Three-Use-Cases-SKU-Architecture.md) | The 3 SKUs: ReadyBank · JD-Forge · Stack-Vault. Pricing ranges + competitive positioning.                       |
| [`07-CTO-Architecture-v1.md`](./07-CTO-Architecture-v1.md)                                         | Engineering architecture: 7-stage pipeline, anti-leak engine, security posture, hiring plan.                    |
| [`08-Bali-Sales-Playbook-v1.md`](./08-Bali-Sales-Playbook-v1.md)                                   | 16-section sales operating manual: mission, motions, ICP, pricing, objection handling, AI Agent + human hybrid. |
| [`governance/Investor-Brief-Pre-A-v1.md`](./governance/Investor-Brief-Pre-A-v1.md)                 | Pre-A revenue model, ICP segmentation, $1M ARR target trajectory.                                               |

### The 7 Constitutional Offices (operating folders)

The "how" — each Office has authority + cadence + templates + audit trail.

| #   | Office         | Charter                                          | Operating folder                                                                                                                                                 |
| --- | -------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **MANTHAN**    | Research & Blueprint Engine                      | [`manthan/`](./manthan/) — research-classification protocol · blueprint template · IdeaForge rubric (Office 4 bundled) · re-validation triggers (SO-25)          |
| 2   | **CEO**        | Strategic Authority                              | (no folder; Constitution + Investor Brief are the operating surface)                                                                                             |
| 3   | **CTO**        | Engineering & Architecture                       | [`cto/`](./cto/) — 6 ADRs · 3 runbooks (incident-response · deploy-rollback · secret-rotation) · sli-slo.md · tech-debt.md                                       |
| 4   | **IDEAFORGE**  | Gate Scoring                                     | bundled in [`manthan/ideaforge-rubric.md`](./manthan/ideaforge-rubric.md) per Y1 reality                                                                         |
| 5   | **CDO**        | Data Integrity, Calibration, Anti-Leak Forensics | [`cdo/`](./cdo/) — IRT calibration protocol · anti-leak forensics · reference panel governance · wave cadence · watermark forensics                              |
| 6   | **GATEKEEPER** | Quality + Security Release Gating                | [`gatekeeper/`](./gatekeeper/) — release-gate protocol · security review · CI gate maintenance · Quality Gate operationalization · AI plagiarism benchmark       |
| 7   | **BALI**       | Sales Motion & Customer Acquisition              | [`bali/`](./bali/) — Sales Playbook · ai-agent (SO-18 executable layer) · 3 outreach scripts · 6 templates · Y1 leads · onboarding · competitive_research_log.md |

In Year 1, the CTO Office wears 4 hats (CTO + Manthan + IdeaForge + CDO + Gatekeeper). Each operating folder stays constant; the named operator changes as dedicated hires land Y2+.

### Constitutional artifacts (top-level)

| File                                                           | Purpose                                                                                                                         |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`competitive_research_log.md`](./competitive_research_log.md) | Canonical scratchpad for Bali's quarterly competitive scan (SO-25). Append-only. 3 initial entries (WeCP, Byteboard, baseline). |

### Apps + services + packages

| Path                                           | What lives here                                                                                                                        |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| [`apps/marketing/`](./apps/marketing/)         | The marketing website. Next.js 15 + Tailwind v4 + Motion 12. 30 routes live at qorium.online.                                          |
| [`services/readybank/`](./services/readybank/) | The Question-Bank-as-a-Service API (`/v1/packs/generate`, `/v1/questions/{uuid}`, `/v1/questions/search`, bulk export). Express + PM2. |
| [`packages/auth/`](./packages/auth/)           | API key validation + rate limiting + audit logging. Used by ReadyBank.                                                                 |
| [`packages/db/`](./packages/db/)               | PostgreSQL connection pool + custom migration runner.                                                                                  |

The marketing app is **deliberately decoupled** from `@qorium/auth` and `@qorium/db` (per [ADR 0006](./cto/adrs/0006-marketing-decoupled-from-monorepo-packages.md)) — it's a public surface; security context separation matters.

### Governance + customer-zero

| Path                                 | Purpose                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`governance/`](./governance/)       | Decision Framework template, Bias Detection methodology, AI Plagiarism Benchmark protocol, 92-point Quality Gate scorecard, Reference Panel governance v0, Investor Brief, Operating Rituals, Incident Response Runbook (governance level), Constitutional Amendment v2.1 (Article IX-M9 psychometric milestone), launch announce copy (LinkedIn + Twitter + Bosch GCC follow-up). |
| [`customer-zero/`](./customer-zero/) | Talpro India dogfood operations (per Constitution SO-1): SME validation tracker, Wave 1/2/3 question batch plans, Customer Zero feedback charter, India-Stack content roadmap, 60+ files of operational content.                                                                                                                                                                   |

### Infra + CI

| Path                                         | Purpose                                                                                                                                                                                                                                                                                                |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`infra/`](./infra/)                         | VPS deploy script (`marketing-deploy.sh`), CTO-deltas (B-series spec adaptations), SEO submission helper, ecosystem config.                                                                                                                                                                            |
| [`.github/workflows/`](./.github/workflows/) | 4 workflows: `ci.yml` (lint/typecheck/test/secret-scan/build), `marketing-quality.yml` (Lighthouse + axe + Playwright E2E), `deploy-marketing.yml` (zero-touch VPS deploy with stdin-fed env injection per [ADR 0005](./cto/adrs/0005-stdin-fed-env-injection.md)), `uptime.yml` (5-min cron monitor). |

---

## Live state

|                          |                                                                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Marketing site**       | `qorium.online` live · 30 routes · 6 critical-route smoke `200` · qorium.in 301 redirect · all 6 security headers · sitemap (21 URLs) · OG / favicons / RSS / breadcrumbs                              |
| **CI**                   | 4 workflows; 3 always run, 1 cron-scheduled. PR #10 has CI green on all gates.                                                                                                                         |
| **Tech debt register**   | 13 entries; 2 resolved (TD-001 partial via uptime workflow, TD-009 full via bundle baseline). 11 open with severity + owner + ETA.                                                                     |
| **Bundle baseline**      | Captured at [`apps/marketing/BUNDLE-BASELINE.md`](./apps/marketing/BUNDLE-BASELINE.md). Shared 102 kB · home `/` 177 kB · heaviest `/styleguide` 181 kB · lightest legal pages 103 kB.                 |
| **Pre-launch checklist** | [`apps/marketing/PRE-LAUNCH-CHECKLIST.md`](./apps/marketing/PRE-LAUNCH-CHECKLIST.md) — A live ✅ · B quality gates ✅ · G Phase 1 ops ✅ · C in flight (user-action) · D Bucket 4 (post-launch async). |

---

## Prerequisites

- **Node.js 20 LTS** (`>=20`)
- **pnpm 10** (`corepack enable && corepack prepare pnpm@10.33.0 --activate`)
- **gitleaks** for pre-commit secret scanning
  - macOS: `brew install gitleaks`
  - Linux: download from <https://github.com/gitleaks/gitleaks/releases>
- **Docker** with Compose v2 (only needed for `services/*` local dev)

## Quickstart

```bash
# Clone + install
git clone https://github.com/sales799/QOrium.git && cd QOrium
pnpm install

# Verify quality bars
pnpm typecheck
pnpm lint
pnpm test
pnpm secrets:scan       # gitleaks against full history

# Run the marketing site locally
pnpm dev:marketing      # → http://localhost:3000

# Run the ReadyBank API locally (needs postgres + redis from Docker)
make dev-up
pnpm --filter @qorium/readybank dev
```

## Quality bars (non-negotiable)

Per Constitution Article VII:

- Zero TypeScript errors (`tsc --noEmit` must pass)
- Zero ESLint errors / warnings
- gitleaks clean on pre-commit + in CI
- All security headers on every HTTP response (HSTS · CSP · X-Frame-Options · X-Content-Type-Options · Referrer-Policy · Permissions-Policy)
- Every shipped question has IRT calibration metadata (SO-21 — auto-fail if missing)
- Anti-leak rotation <24h (SO-22 — auto-fail if breached)
- No SOC 2 false claims; status accurately reflected on `qorium.online/security`
- No fabricated customer logos / metrics (SO-24 recursive No-Fiction Rule)

CI enforces the automatable subset; GATEKEEPER human review (per [`gatekeeper/release-gate-protocol.md`](./gatekeeper/release-gate-protocol.md)) enforces the rest.

## Contributing

- All work happens on feature branches; main is protected (no direct push)
- Active branch: `claude/qorium-marketing-site-Z4gdI`
- PRs require GATEKEEPER sign-off per [`gatekeeper/release-gate-protocol.md`](./gatekeeper/release-gate-protocol.md)
- Material architectural decisions require an ADR in [`cto/adrs/`](./cto/adrs/) (per [ADR 0001-0006](./cto/adrs/) precedent)
- Pre-commit hooks run Prettier, ESLint, gitleaks. Don't bypass with `--no-verify` (Constitution SO-15)

## Where to find things (quick reference)

| I want to…                              | Look in                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------ |
| Understand the SKUs / pricing / motions | [`08-Bali-Sales-Playbook-v1.md`](./08-Bali-Sales-Playbook-v1.md) + `bali/`     |
| Understand the engineering architecture | [`07-CTO-Architecture-v1.md`](./07-CTO-Architecture-v1.md) + `cto/`            |
| Find a specific architectural decision  | [`cto/adrs/`](./cto/adrs/)                                                     |
| Run a sales motion                      | [`bali/outreach/`](./bali/outreach/)                                           |
| Run a content wave                      | [`cdo/wave-cadence.md`](./cdo/wave-cadence.md)                                 |
| Respond to an incident                  | [`cto/runbooks/incident-response.md`](./cto/runbooks/incident-response.md)     |
| Deploy / rollback                       | [`cto/runbooks/deploy-rollback.md`](./cto/runbooks/deploy-rollback.md)         |
| Rotate a secret                         | [`cto/runbooks/secret-rotation.md`](./cto/runbooks/secret-rotation.md)         |
| Run a release gate                      | [`gatekeeper/release-gate-protocol.md`](./gatekeeper/release-gate-protocol.md) |
| Track tech debt                         | [`cto/tech-debt.md`](./cto/tech-debt.md)                                       |
| Onboard as a new Bali AE                | [`bali/onboarding/Day-0-to-30.md`](./bali/onboarding/Day-0-to-30.md)           |
| Trigger MANTHAN re-validation           | [`manthan/revalidation-triggers.md`](./manthan/revalidation-triggers.md)       |
| Track competitive landscape             | [`competitive_research_log.md`](./competitive_research_log.md)                 |
| Submit sitemap to GSC                   | [`infra/seo-submission-helper.md`](./infra/seo-submission-helper.md)           |
| Read launch announce copy               | [`governance/launch/`](./governance/launch/)                                   |

---

## Constitutional anchors active in every contribution

These are the "always-on" rules. Every PR must respect them; gitleaks + CI + GATEKEEPER enforce.

- **SO-1** Customer Zero (Talpro India dogfoods every internal hiring drive on QOrium)
- **SO-2** Locked USP §1.1 verbatim across all external materials
- **SO-3** Quality Gate Discipline (92-point scorecard; auto-fail criteria)
- **SO-10** Stack-Vault Exclusivity is Absolute
- **SO-11** Pricing Anchor Discipline (₹40L Stack-Vault floor; never below ₹35L without CEO)
- **SO-13** Talpro Universe Tech Stack (Next.js + Express + PostgreSQL + Redis)
- **SO-15** Zero Secrets in Git
- **SO-16** Documentation as Code
- **SO-21** IRT Mandate (every question calibrated)
- **SO-22** AI Plagiarism Public Benchmark + 24h Anti-Leak SLA
- **SO-23** Platform API pricing band $5K-25K/yr
- **SO-24** Recursive No-Fiction Rule
- **SO-25** Quarterly competitive scan + acquisition trigger

Full SO list in [`09-QOrium-Constitution-v2.0.md`](./09-QOrium-Constitution-v2.0.md) Article V.

---

## License + governance

This is a private commercial repository. Constitutional governance applies; see Article XI (Amendment Procedure) for how this README itself can change.

_— CTO Office, Talpro Universe._
