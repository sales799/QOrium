# QOrium — Phase 0 + Phase 1 Punchlist

**Owner of this document:** CTO Office
**Status:** ACTIVE — execution-of-record
**Created:** May 2026 (immediately after Constitution v2.0 ratification)
**Phase 0 ETA:** Day 0 → Day 14 (target)
**Phase 1 ETA:** Month 1 → Month 3 (target)
**Next Phase Gate:** Month 3 — IdeaForge re-gate per Constitution Article IX

This punchlist tracks every concrete action required to move QOrium from "ratified Constitution" to "operating engineering team shipping Wave 1 questions to first 5 paying logos."

---

## Phase 0 — Day-0 to Day-14 — "Foundation"

Phase 0 transition criteria are partially complete (documentation events ✅; physical actions ⏳). This punchlist tracks every physical action.

### §A. Capital & Legal (CEO-owned)

| # | Action | Owner | ETA | Status |
|---|---|---|---|---|
| A1 | Open QOrium-ringfenced bank account OR Talpro Universe sub-budget tagged QORIUM | CEO | Day 3 | ⏳ |
| A2 | Transfer ₹50L sanctioned runway to ringfenced account | CEO | Day 7 | ⏳ |
| A3 | Engage external IP counsel for trademark filing prep (India + US) | CEO | Day 7 | ⏳ |
| A4 | Domain registration: `qorium.online`, `qorium.in` | CEO + CTO | Day 3 | ⏳ |
| A5 | Trademark filing: India (Class 9 + 42); US (intent-to-use Class 9 + 42) | IP counsel | Day 14 | ⏳ |
| A6 | MSA template drafted by counsel (for enterprise + platform contracts) | IP counsel | Day 14 | ⏳ |
| A7 | DPA template drafted by counsel (DPDPA + GDPR) | IP counsel | Day 14 | ⏳ |
| A8 | Reserve social handles: LinkedIn, Twitter/X, GitHub, npm, BlueSky | CEO + CTO | Day 5 | ⏳ |

### §B. Infrastructure (CTO-owned)

| # | Action | Owner | ETA | Status |
|---|---|---|---|---|
| B1 | Hostinger VPS upgrade evaluation (KVM4 16GB sufficient for Phase 1?) | CTO | Day 5 | ⏳ |
| B2 | DNS configured: `qorium.online`, `app.qorium.online`, `api.qorium.online`, `admin.qorium.online`, `partners.qorium.online`, `staging.qorium.online` | CTO | Day 7 | ⏳ |
| B3 | Let's Encrypt SSL on all subdomains | CTO | Day 7 | ⏳ |
| B4 | GitHub organization or repo provisioned with branch protection | CTO | Day 3 | ⏳ |
| B5 | CI/CD pipeline (GitHub Actions) configured per CTO Architecture §12 | CTO | Day 7 | ⏳ |
| B6 | gitleaks pre-commit hook + secret rotation calendar | CTO | Day 7 | ⏳ |
| B7 | PostgreSQL 16 provisioned + initial schema migrated (per CTO Architecture §5.1) | CTO | Day 10 | ⏳ |
| B8 | Redis 7 provisioned (sessions + queue + cache) | CTO | Day 10 | ⏳ |
| B9 | Cloudflare R2 bucket provisioned for object storage + backups | CTO | Day 10 | ⏳ |
| B10 | PM2 ecosystem.config.js scaffolded for ReadyBank + JD-Forge + Stack-Vault services | CTO | Day 12 | ⏳ |
| B11 | Anthropic + OpenAI + Gemini API keys procured + budget alerts configured | CTO | Day 5 | ⏳ |
| B12 | Serper.dev API key procured (anti-leak crawl) | CTO | Day 7 | ⏳ |
| B13 | OpenTelemetry + Grafana Cloud + Sentry instrumentation set up | CTO | Day 12 | ⏳ |
| B14 | Talpro Sentinel integration configured | CTO | Day 12 | ⏳ |
| B15 | Backup + PITR enabled on PostgreSQL with 15-min RPO target | CTO | Day 14 | ⏳ |

### §C. People & Hiring (CEO + CTO joint)

| # | Action | Owner | ETA | Status |
|---|---|---|---|---|
| C1 | Senior Engineer JD drafted + posted (NIT/IIT alumni + Naukri + LinkedIn) | CTO | Day 7 | ⏳ |
| C2 | SME Content Lead JD drafted + posted | CTO | Day 7 | ⏳ |
| C3 | AE Enterprise JD drafted + posted | CEO + Bali | Day 14 | ⏳ |
| C4 | BD Platforms JD drafted + posted | CEO + Bali | Day 14 | ⏳ |
| C5 | I/O Psychologist contractor JD scoped (search begins Month 3) | CTO | Day 14 | ⏳ |
| C6 | Initial SME contractor list compiled (target: 30 by Month 3, 100 by Month 6) | CTO + Talpro alumni network | Day 14 | ⏳ |
| C7 | Compensation philosophy + bands documented per role | CEO + CTO | Day 10 | ⏳ |
| C8 | Standard offer letter template + IP assignment + NDA finalized | CEO + IP counsel | Day 14 | ⏳ |

### §D. Customer Zero Activation (CTO + Talpro Delivery)

| # | Action | Owner | ETA | Status |
|---|---|---|---|---|
| D1 | Talpro India Delivery Head briefed on Customer Zero scope (top 5 roles) | CEO + CTO | Day 3 | ⏳ |
| D2 | First 5 Talpro candidate-screening JDs collected for QOrium analysis | CTO | Day 7 | ⏳ |
| D3 | Internal-namespace QOrium API key issued to Talpro India | CTO | Day 7 | ⏳ |
| D4 | Weekly feedback channel established (Slack #qorium-customer-zero or equivalent) | CTO + Talpro Delivery | Day 7 | ⏳ |
| D5 | Initial 100-question seed batch ready (manually-authored to seed Wave 1) | CTO + SME Lead | Day 14 | ⏳ |

### §E. Bosch GCC Outreach Readiness (CEO + CTO)

| # | Action | Owner | ETA | Status |
|---|---|---|---|---|
| E1 | Bhaskar drafts warm-intro email to Bosch GCC TA Head | CEO | Day 5 | ⏳ |
| E2 | Bosch GCC stack research consolidated (which roles, which tech, hiring volume) | CTO | Day 10 | ⏳ |
| E3 | Sample 50-question pack scope defined (top role at Bosch — likely Senior Embedded Eng or Senior Salesforce Dev) | CTO + SME Lead | Day 14 | ⏳ |
| E4 | First Bosch discovery call booked (target: Week 2 of execution) | CEO | Day 14 | ⏳ |

### §F. Constitutional Compliance Checks

| # | Action | Owner | ETA | Status |
|---|---|---|---|---|
| F1 | `_shared/QUEUE.md` initialized with QOrium kickoff entries | CTO Office | Day 0 | ✅ |
| F2 | Constitution v2.0 ratification record filed | CTO Office | Day 0 | ✅ |
| F3 | Memory updated (`qorium_constitution.md`, `qorium_project.md`, `qorium_deliverables.md`) | CTO Office | Day 0 | ✅ |
| F4 | MANTHAN session c17a48c2 logged as ratification trigger | CTO Office | Day 0 | ✅ |
| F5 | Project_work_lock established (this session) | CTO Office | Day 0 | ✅ |

---

## Phase 1 — Month 1 to Month 3 — "Engine MVP + First Logos"

**Pass criteria for Phase 1 (per Constitution Article IX):**
- 5,000 validated questions in ReadyBank (Wave 1 Tech Core)
- 20+ programming languages live
- ReadyBank API alpha live; bulk export working in 3+ formats
- IRT scoring active on all released items (per SO-21)
- 5 customer logos signed
- Talpro Customer Zero operating; first 100 candidates run through QOrium
- 6 hires made (Senior Eng + SME Lead + AE + BD + I/O Psych contractor + Frontend)

**M3 IdeaForge re-gate threshold: ≥20/24** to continue Phase 2.

### §G. Engineering — Content Engine + ReadyBank Service

| # | Milestone | Owner | ETA | Status |
|---|---|---|---|---|
| G1 | Content Engine 7-stage pipeline scaffolded (Spec → AI Draft → Critique → SME → Calibrate → Release → Post-Deploy) | Senior Eng | Month 1 | ⏳ |
| G2 | Role-Graph schema implemented per CTO Architecture §5.1 | Senior Eng | Month 1 | ⏳ |
| G3 | First 1,000 questions authored + SME-validated (Wave 1 batch 1) | SME Lead | Month 1 | ⏳ |
| G4 | ReadyBank Service: search + retrieval REST API alpha | Senior Eng | Month 2 | ⏳ |
| G5 | Bulk Export module: CSV + JSON + HackerRank format | Frontend Eng | Month 2 | ⏳ |
| G6 | First 5,000 questions validated (Wave 1 complete) | SME Lead | Month 3 | ⏳ |
| G7 | IRT calibration pipeline live (SO-21 enforcement) | I/O Psych contractor | Month 3 | ⏳ |
| G8 | 20+ programming languages active (verified via Judge0 sandbox) | Senior Eng | Month 3 | ⏳ |
| G9 | Anti-leak engine v0 (weekly crawl + manual review) | Senior Eng | Month 3 | ⏳ |
| G10 | Admin web app for SME workflow (Next.js) | Frontend Eng | Month 2 | ⏳ |

### §H. Sales & Customer Success — First 5 Logos

| # | Milestone | Owner | ETA | Status |
|---|---|---|---|---|
| H1 | Talpro India Customer Zero live (first 100 candidates run) | CTO + Talpro Delivery | Month 3 | ⏳ |
| H2 | First 3 Recruiter Subscription logos signed (Solo or Team tier) | Bali (CEO + AE) | Month 3 | ⏳ |
| H3 | First Stack-Vault discovery call (Bosch GCC) completed | CEO | Month 1 | ⏳ |
| H4 | Sample 50-question pack delivered to Bosch GCC for engineering panel review | CTO + SME Lead | Month 2 | ⏳ |
| H5 | First Stack-Vault scoping conversation (Phase 3 of sales cycle per Bali Playbook §3.8) | CEO + AE | Month 3 | ⏳ |
| H6 | 5 total logos signed by end of Phase 1 | Bali | Month 3 | ⏳ |

### §I. Hiring — First 6 Hires

| # | Milestone | Owner | ETA | Status |
|---|---|---|---|---|
| I1 | Senior Engineer #1 hired + onboarded | CEO + CTO | Month 2 | ⏳ |
| I2 | SME Content Lead hired + onboarded | CEO + CTO | Month 2 | ⏳ |
| I3 | AE Enterprise hired + onboarded | CEO | Month 3 | ⏳ |
| I4 | BD Platforms hired + onboarded | CEO | Month 3 | ⏳ |
| I5 | I/O Psychologist contractor engaged | CTO | Month 3 | ⏳ |
| I6 | Frontend Engineer hired (per CTO Architecture §15 — Month 5 nominal but accelerated to support Phase 1 admin app) | CEO + CTO | Month 3 | ⏳ |

### §J. Quality Gate + Constitutional Compliance

| # | Milestone | Owner | ETA | Status |
|---|---|---|---|---|
| J1 | First Gatekeeper run on internal staging (target: ≥72/80 internal threshold) | Gatekeeper (CTO Office) | Month 1 | ⏳ |
| J2 | First customer-facing release passes Gatekeeper 92-pt gate (≥88/92) | Gatekeeper | Month 2 | ⏳ |
| J3 | IRT scoring auto-fail check passes (per SO-21) | Gatekeeper | Month 3 | ⏳ |
| J4 | 24-hour anti-leak rotation cycle operational (SO-9) | Gatekeeper | Month 3 | ⏳ |
| J5 | Monthly metrics close ritual established (ARR + content throughput + library size + leak detection rate) | CTO Office | Month 1 | ⏳ |
| J6 | Weekly Friday engineering review ritual established | CTO | Month 1 | ⏳ |
| J7 | Weekly Monday strategic 1:1 (CEO + CTO) | CEO + CTO | Month 1 | ⏳ |
| J8 | M3 IdeaForge re-gate scheduled + scored (target ≥20/24 PROCEED) | CTO Office | Month 3 | ⏳ |

---

## Risks Watched (Phase 0 + Phase 1)

Per Constitution Article X §10.1, the following Phase 0 + Phase 1 specific risks are actively monitored:

| Risk | Watching | Mitigation if triggered |
|---|---|---|
| ₹50L envelope insufficient (cost overrun) | CTO + finance | Pause Wave 2 questions; defer Frontend hire to Month 4 |
| First 2 hires take >Month 2 to close | CEO + CTO | CTO temporarily covers Senior Eng tasks; SME Lead partially via contractor |
| Bosch GCC procurement timeline >6 months | CEO + AE | Bridge with JD-Forge Reviewed subscription per Bali Playbook §3.7 |
| Talpro Customer Zero conversion lower than expected | CTO + Talpro Delivery | First 10 candidates reveal it; pivot ICP if needed |
| AI generation quality regresses | CTO + CDO | Multi-model fallback (Claude→GPT→Gemini); SME validation mandatory |
| Anti-leak crawl breaks (Serper.dev API change) | Senior Eng | Secondary scraping fallback documented; alerts set up |

---

## How This Punchlist Is Used

1. **Updated daily** — owners check off items; new items appended; blockers escalated to QUEUE.md
2. **Reviewed Mondays** — CEO + CTO Monday strategic 1:1
3. **Closed at M3** — when Phase 1 IdeaForge re-gate passes, this punchlist is archived; replaced with Phase 2 punchlist
4. **Authoritative for Phase 0/1 status** — if any office reports a status not in this punchlist, that status is unverified

---

**Filed in:** `/Users/bhaskar_universe/Documents/Claude/Projects/QOrium/task_plan_phase0_phase1.md`
**Effective:** May 2026 (Day 0 of QOrium)
**Reviewed by CTO Office before each weekly Monday strategic 1:1**

---

*End of Phase 0 + Phase 1 punchlist. The work has begun.*

---

## Codex Closeout Addendum — Marketing Redesign Phase 1 — 2026-06-04

| Item | Status | Evidence |
|---|---|---|
| Tailwind v4 A+B+C token system | DONE | Commit `75eae8ea7eb5e3f50c5e6b2c0f8519a56e19b69f`; `apps/marketing/src/app/globals.css` now exposes shell, product, and India zone tokens/utilities. |
| Full mega-menu + mobile accordion | DONE | Commit `75eae8ea7eb5e3f50c5e6b2c0f8519a56e19b69f`; header covers Platform, Solutions, Why QOrium, Resources, Pricing, Book a demo, and Sign in; mobile sheet has screen-reader title/description. |
| Evidence-gated navigation | DONE | Commit `75eae8ea7eb5e3f50c5e6b2c0f8519a56e19b69f`; public proof flags resolve from explicit `NEXT_PUBLIC_QORIUM_EVIDENCE_FLAG_*` values; hidden proof links stay absent by default. |
| Footer sitemap + missing destinations | DONE | Commit `75eae8ea7eb5e3f50c5e6b2c0f8519a56e19b69f`; `/resources/docs`, `/glossary`, and `/benchmarks` now build so visible nav/footer links do not point to missing pages. |
| Verification | DONE | `pnpm run build:packages` PASS; `pnpm --filter @qorium/marketing test` PASS `63/63`; `typecheck` PASS; `lint` PASS; `build` PASS with `252` routes; `test:e2e` PASS `11/11`; `pnpm secrets:scan` PASS after exact historical fingerprint ignore for pre-existing dev DB URL. |

Archive note: Phase 1 code is PR-ready at `https://github.com/sales799/QOrium/pull/117`. Production deploy still requires cross-account review, merge, approved active-origin deploy, live CWV/security/Rakshak recheck, and BHISHMA root PM2 control-plane repair before full archive certification.
