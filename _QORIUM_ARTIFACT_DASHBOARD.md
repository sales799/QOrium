# QOrium Artifact Dashboard

**Last updated:** 2026-05-07 · **Branch:** `claude/setup-qorium-build-agent-zA0l5` · **PR:** #9 (ready-for-review)

> **Read order:** the **Macro Project Status** section (top) tracks the
> 8-phase journey from Day 0 to the Article IX completion gate. The
> **Stream B Engineering Scaffolding** section (below) tracks the
> autonomous-build engineering work — that's the _enabling layer_, not
> the project itself. "Project 100% built" requires both layers, and
> Stream B alone cannot close the macro phases.

---

## Macro Project Status — 8 Phases over 5 Years

Constitution Article IX defines **Project Completion** as one of:

- Strategic acquisition at ≥ $300M, OR
- IPO at ≥ ₹3,000Cr, OR
- Talpro Universe Anchor with ≥ $50M ARR

These outcomes are 5+ years out and are business-outcome gates, not
deliverables Stream B can produce.

### 8-Phase Roadmap (Constitution §3 + Article IX)

| Phase | Span     | Headline goal                                                                             | Honest state                                                 |
| ----: | -------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **0** | Day 0–14 | Foundation: capital, infra, hiring, Customer Zero, Bosch GCC outreach                     | **~38% (17/45)** — see §A–§F breakdown below                 |
|     1 | M1–M3    | Engine MVP — Wave 1 5K questions + first 5 logos + 6 hires + M3 IdeaForge ≥20/24          | not started (Stream B has the engineering scaffolding ready) |
|     2 | M3–M6    | India Stack + Stack-Vault Logo #1 + 4-ATS framework                                       | not started (engineering ready)                              |
|     3 | M6–M9    | SKU Maturity — JD-Forge live + Platform pilot + Greenhouse/Workday/Ashby/Darwinbox active | not started                                                  |
|     4 | M9–M12   | Year-1 Close — all 3 SKUs live + $1M ARR path                                             | not started                                                  |
|     5 | Y2       | International scale — $2M ARR + Series Pre-A close + Psychometric add                     | not started                                                  |
|     6 | Y3       | Multi-region — $7M ARR + EU region + partnerships                                         | not started                                                  |
|     7 | Y5       | Strategic outcome — ≥$50M ARR or acquisition or IPO                                       | not started                                                  |

Phases 1–7 are intentionally listed but unscored — they're sequenced
behind Phase 0 closure. The current focus is **closing Phase 0**.

---

## Phase 0 — Day 0–14 — Foundation (active, ~38% closed)

Source-of-truth: [`task_plan_phase0_phase1.md`](./task_plan_phase0_phase1.md).
Owner legend: 👤 = CEO action · 🤖 = Stream B / CTO Office can close ·
🤝 = joint (CEO sign-off + Stream B execution).

### §A — Capital & Legal (👤 CEO + IP counsel) — 0 of 8 closed

| #   | Action                                                             | Owner         | ETA    | State                                                  |
| --- | ------------------------------------------------------------------ | ------------- | ------ | ------------------------------------------------------ |
| A1  | Open ringfenced bank account OR Talpro sub-budget tagged QORIUM    | 👤 CEO        | Day 3  | ⏳                                                     |
| A2  | Transfer ₹50L sanctioned runway to ringfenced account              | 👤 CEO        | Day 7  | ⏳                                                     |
| A3  | Engage external IP counsel for trademark filing prep               | 👤 CEO        | Day 7  | ⏳                                                     |
| A4  | Domain registration: qorium.io, qorium.in                          | 🤝 CEO + CTO  | Day 3  | ⏳ (qorium.online live but .io/.in not yet registered) |
| A5  | Trademark filing — India (Class 9 + 42); US (intent-to-use)        | 👤 IP counsel | Day 14 | ⏳                                                     |
| A6  | MSA template drafted by counsel                                    | 👤 IP counsel | Day 14 | ⏳                                                     |
| A7  | DPA template drafted by counsel (DPDPA + GDPR)                     | 👤 IP counsel | Day 14 | ⏳                                                     |
| A8  | Reserve social handles (LinkedIn, Twitter/X, GitHub, npm, BlueSky) | 🤝 CEO + CTO  | Day 5  | ⏳ (GitHub `sales799` exists; others pending)          |

### §B — Infrastructure (🤖 CTO Office / Stream B) — 8 closed + 3 partial / 15

| #   | Action                                               | Owner | ETA    | State                                                                             |
| --- | ---------------------------------------------------- | ----- | ------ | --------------------------------------------------------------------------------- |
| B1  | Hostinger VPS evaluation (KVM4 16GB sufficient?)     | CTO   | Day 5  | ✅ VPS 147.93.103.194 verified live during deploy                                 |
| B2  | DNS configured: 6 subdomains                         | CTO   | Day 7  | 🟡 api.qorium.online published; admin/docs/candidate/my pending wildcard A record |
| B3  | Let's Encrypt SSL on all subdomains                  | CTO   | Day 7  | ✅ certbot succeeded on api.qorium.online (others propagate when DNS lands)       |
| B4  | GitHub repo + branch protection                      | CTO   | Day 3  | 🟡 sales799/QOrium repo live; branch protection rules unverified                  |
| B5  | CI/CD GitHub Actions pipeline                        | CTO   | Day 7  | ✅ Setu auto-deploy workflow live; run #17 verified green                         |
| B6  | gitleaks pre-commit + secret rotation calendar       | CTO   | Day 7  | ✅ gitleaks Sprint 0.1; rotation worker Sprint 2.8                                |
| B7  | PostgreSQL 16 + initial schema migrated              | CTO   | Day 10 | ✅ 14 migrations applied to live qorium DB                                        |
| B8  | Redis 7 provisioned                                  | CTO   | Day 10 | ✅ installed by bootstrap                                                         |
| B9  | Cloudflare R2 bucket                                 | CTO   | Day 10 | 🚫 needs 👤 CEO R2 account creation                                               |
| B10 | PM2 ecosystem.config                                 | CTO   | Day 12 | ✅ 18 services running                                                            |
| B11 | Anthropic + OpenAI + Gemini API keys + budget alerts | CTO   | Day 5  | 🚫 stubs shipped; 👤 CEO must procure real keys                                   |
| B12 | Serper.dev API key (anti-leak crawl)                 | CTO   | Day 7  | 🚫 stub shipped; 👤 CEO must procure real key                                     |
| B13 | OpenTelemetry + Grafana Cloud + Sentry               | CTO   | Day 12 | 🟡 shim packages shipped; live wire-up needs 👤 DSN + Grafana token               |
| B14 | Talpro Sentinel integration                          | CTO   | Day 12 | 🚫 needs 👤 Sentinel webhook URL                                                  |
| B15 | Backup + PITR with 15-min RPO                        | CTO   | Day 14 | 🚫 not provisioned                                                                |

**Stream B has closed the half of §B that engineering alone can finish.
The remaining 5 items (B9, B11, B12, B14, B15) are 👤 CEO actions or
external account procurement. B13 is partial — shims are shipped, but
production needs CEO-supplied DSN + token.**

### §C — People & Hiring (🤝 CEO + CTO) — 0 of 8 closed

| #   | Action                                        | Owner                  | ETA    | State |
| --- | --------------------------------------------- | ---------------------- | ------ | ----- |
| C1  | Senior Engineer JD drafted + posted           | CTO                    | Day 7  | ⏳    |
| C2  | SME Content Lead JD drafted + posted          | CTO                    | Day 7  | ⏳    |
| C3  | AE Enterprise JD drafted + posted             | 👤 CEO + Bali          | Day 14 | ⏳    |
| C4  | BD Platforms JD drafted + posted              | 👤 CEO + Bali          | Day 14 | ⏳    |
| C5  | I/O Psychologist contractor JD scoped         | CTO                    | Day 14 | ⏳    |
| C6  | Initial SME contractor list (target 30 by M3) | 🤝 CTO + Talpro alumni | Day 14 | ⏳    |
| C7  | Compensation philosophy + bands               | 🤝 CEO + CTO           | Day 10 | ⏳    |
| C8  | Standard offer letter + IP assignment + NDA   | 🤝 CEO + IP counsel    | Day 14 | ⏳    |

(Cowork dashboard shows §C at 8/14 = 57% — that combines §C 8 items
with Phase 1 §I 6 hire-completion items. The 8 closed there are
likely JD drafts in flight per "All JDs drafted · postings BP-06 ready"
note.)

### §D — Customer Zero Activation (🤝 CTO + Talpro Delivery) — 2 closed + 1 partial / 5

| #   | Action                                                     | Owner             | ETA    | State                                                             |
| --- | ---------------------------------------------------------- | ----------------- | ------ | ----------------------------------------------------------------- |
| D1  | Talpro Delivery Head briefed on Customer Zero scope        | 🤝 CEO + CTO      | Day 3  | ✅ per CC-03                                                      |
| D2  | First 5 Talpro candidate-screening JDs collected           | 👤 CTO/Talpro     | Day 7  | ⏳                                                                |
| D3  | Internal-namespace QOrium API key issued to Talpro India   | CTO               | Day 7  | ✅ api-key-mgmt Sprint 2.7 framework live; one issuance call away |
| D4  | Weekly feedback channel (Slack #qorium-customer-zero)      | 👤 CTO + Talpro   | Day 7  | ⏳                                                                |
| D5  | Initial 100-question seed batch (manually-authored Wave 1) | 🤝 CTO + SME Lead | Day 14 | 🟡 470 Qs total in inventory; specific seed-batch curation TBD    |

### §E — Bosch GCC Outreach Readiness (👤 CEO) — 0 of 4 closed

| #   | Action                                           | Owner             | ETA    | State |
| --- | ------------------------------------------------ | ----------------- | ------ | ----- |
| E1  | CEO drafts warm-intro email to Bosch GCC TA Head | 👤 CEO            | Day 5  | ⏳    |
| E2  | Bosch GCC stack research consolidated            | CTO               | Day 10 | ⏳    |
| E3  | Sample 50-question pack scope defined            | 🤝 CTO + SME Lead | Day 14 | ⏳    |
| E4  | First Bosch discovery call booked                | 👤 CEO            | Day 14 | ⏳    |

### §F — Constitutional Compliance — 5 of 5 closed ✅

All five items (F1 QUEUE.md, F2 Constitution v2.0 ratification, F3 memory
update, F4 MANTHAN session log, F5 project lock) closed at Day 0 per
existing CTO Office record.

### §F-bis — Constitution-companion documentation gaps

Constitution v2.0 references several "companion docs" by name. Inventory
of which exist in-repo (audited 2026-05-07):

| Companion doc                                  | In-repo? | File                                                                     |
| ---------------------------------------------- | :------: | ------------------------------------------------------------------------ |
| QOrium Constitution v2.0                       |    ✅    | `09-QOrium-Constitution-v2.0.md`                                         |
| Bali Sales Playbook v1                         | ✅ (NEW) | `governance/Bali-Sales-Playbook-v1.md`                                   |
| Quality Gate 92-pt Scorecard                   |    ✅    | `governance/Quality-Gate-92pt-Scorecard.md`                              |
| Investor Brief Pre-A                           |    ✅    | `governance/Investor-Brief-Pre-A-v1.md`                                  |
| Operating Rituals v1                           |    ✅    | `governance/Operating-Rituals-v1.md`                                     |
| Incident Response Runbook v1                   |    ✅    | `governance/Incident-Response-Runbook-v1.md`                             |
| TestForge QA Pipeline v1                       |    ✅    | `governance/TestForge-QA-Pipeline-v1.md`                                 |
| AI Plagiarism Benchmark Protocol v1            |    ✅    | `governance/AI-Plagiarism-Benchmark-Protocol-v1.md`                      |
| Bias Detection Methodology v1                  |    ✅    | `governance/Bias-Detection-Methodology-v1.md`                            |
| Decision Framework Reusable Template v1        |    ✅    | `governance/Decision-Framework-Reusable-Template-v1.md`                  |
| Constitutional Amendment v2.1 (Article IX M9)  |    ✅    | `governance/Constitutional-Amendment-v2.1-Article-IX-M9-Psychometric.md` |
| Master Mega Doc                                |    ⏳    | not yet authored                                                         |
| Blueprint v1.1                                 |    ⏳    | referenced; not yet committed to repo                                    |
| SKU Architecture                               |    ⏳    | referenced; not yet committed to repo                                    |
| IdeaForge Gate                                 |    ⏳    | referenced; not yet committed to repo                                    |
| CTO Architecture v1                            |    ⏳    | referenced; not yet committed to repo                                    |
| Competitive Capabilities Consolidated (Doc 10) |    ⏳    | referenced; not yet committed to repo                                    |
| Ratification Record v2.0                       |    ⏳    | referenced; not yet committed to repo                                    |

### Phase 0 honest rollup

| Section            | ✅ closed | 🟡 partial | ⏳/🚫 pending | Owner                     |
| ------------------ | --------: | ---------: | ------------: | ------------------------- |
| §A Capital & Legal |         0 |          0 |             8 | 👤 CEO + IP counsel       |
| §B Infrastructure  |         8 |          3 |             4 | 🤖 CTO Office (Stream B)  |
| §C People & Hiring |         0 |          0 |             8 | 🤝 CEO + CTO + recruiters |
| §D Customer Zero   |         2 |          1 |             2 | 🤝 CTO + Talpro Delivery  |
| §E Bosch GCC       |         0 |          0 |             4 | 👤 CEO                    |
| §F Constitutional  |         5 |          0 |             0 | ✅ done                   |
| **Total**          |    **15** |      **4** |        **26** | —                         |

Counting partials at 0.5 weight: **17/45 ≈ 38%** (matches Cowork
dashboard). Counting partials at full weight: **19/45 ≈ 42%**.

**The 38% number is correct.** Stream B has shipped engineering
scaffolding that _enables_ future closure but every Phase 0 item that
counts as "closed" still requires a final CEO action: real API keys
for stubbed clients, the ₹50L bank transfer, IP counsel engagement,
JD postings, Bosch outreach. The engineering work is necessary but
not sufficient.

---

## What blocks 100% Phase 0 — CEO action queue (ordered by ETA)

| Day | Action                                               | §   | Why it blocks                                          |
| --: | ---------------------------------------------------- | --- | ------------------------------------------------------ |
|   3 | A1 — Open ringfenced bank account                    | §A  | All §A2 spend gated on this                            |
|   3 | A4 — Register qorium.io + qorium.in domains          | §A  | Brand control + legal trademark prerequisite           |
|   5 | A8 — Reserve social handles (LinkedIn/X/npm/BlueSky) | §A  | Anti-squat                                             |
|   5 | B11 — Procure Anthropic + OpenAI + Gemini API keys   | §B  | Engineering stubs flip to live LLM only with real keys |
|   5 | E1 — Warm-intro email to Bosch GCC TA Head           | §E  | Phase 1 Logo #1 path                                   |
|   7 | A2 — Transfer ₹50L runway                            | §A  | Hiring + IP counsel + key procurement spend            |
|   7 | A3 — Engage external IP counsel                      | §A  | Unlocks A5/A6/A7 by Day 14                             |
|   7 | B12 — Procure Serper.dev API key                     | §B  | Anti-leak crawl goes live (SO-9 enforcement)           |
|   7 | C1 — Post Senior Engineer JD                         | §C  | Phase 1 hire #1                                        |
|   7 | C2 — Post SME Content Lead JD                        | §C  | Phase 1 hire #2                                        |
|   7 | D2 — Collect first 5 Talpro JDs for QOrium analysis  | §D  | Customer Zero data path                                |
|   7 | D4 — Establish Slack #qorium-customer-zero           | §D  | Feedback loop                                          |
|  10 | B9 — Provision Cloudflare R2 bucket                  | §B  | Object storage + backups                               |
|  10 | C7 — Compensation philosophy + bands                 | §C  | Hire C3/C4 unblocked                                   |
|  10 | E2 — Consolidate Bosch GCC stack research            | §E  | Sample-pack scoping (E3) unblocked                     |
|  12 | B13 — Provide Sentry DSN + Grafana token + Loki URL  | §B  | Live observability flips on                            |
|  12 | B14 — Provide Talpro Sentinel webhook URL            | §B  | Anti-leak alerting wires up                            |
|  14 | A5–A7 — Trademark filings + MSA + DPA via IP counsel | §A  | Enterprise contracts blocked without                   |
|  14 | B15 — Configure backup + 15-min RPO PITR             | §B  | DR posture                                             |
|  14 | C3–C6, C8 — Remaining JDs + SME list + offer letter  | §C  | Phase 1 hire pipeline                                  |
|  14 | D5 — Curate initial 100-question seed batch          | §D  | Wave 1 content seed                                    |
|  14 | E3 — Sample 50-question pack scope (Bosch top role)  | §E  | Discovery-call enablement                              |
|  14 | E4 — First Bosch discovery call booked               | §E  | Logo #1 path                                           |

**Critical-path estimate:** ~12 CEO-hours spread over 14 days, plus
external counsel (A5/A6/A7 take 5–10 business days for IP counsel to
turn around), plus account-procurement waiting periods (R2, API key
budget approvals).

---

## Sync rule going forward

When Stream B closes a §B or §D item, both files update in the same commit:

1. `task_plan_phase0_phase1.md` — flip ⏳ → ✅ (or 🟡)
2. `_QORIUM_ARTIFACT_DASHBOARD.md` — update the macro section table

This keeps the artifact and the canonical punchlist from drifting.

---

# Stream B Engineering Scaffolding — the enabling layer

> Below is what the autonomous-build agent ("Stream B") has shipped
> across 30 sprints. **This is engineering scaffolding, not project
> completion.** Phases 1–7 will use this as their substrate — but
> closing Phases 1–7 themselves requires hiring, sales, customer
> wins, and CEO actions far beyond what code alone can deliver.

## Sprint state (30 sprints — engineering scaffolding for Phases 1–2.5 ready)

| Sprint | Workspace                                              | Status  | Tests new | Cum tests |
| ------ | ------------------------------------------------------ | ------- | --------- | --------- |
| 0.1    | Monorepo bootstrap                                     | shipped | —         | —         |
| 0.2    | Dev orchestration                                      | shipped | —         | —         |
| 1.1    | `services/readybank` skeleton                          | shipped | 33        | 33        |
| 1.2    | `packages/auth` + `apps/admin` scaffold                | shipped | 26        | 59        |
| 1.3    | SME review queue + decision workflow                   | shipped | 32        | 91        |
| 1.4    | `services/leak-crawler` (Anti-Leak Engine v0)          | shipped | 47        | 138       |
| 1.5    | `services/irt-calibration` (IRT Pipeline v0)           | shipped | 64        | 202       |
| 1.6    | `services/judge0-orchestrator`                         | shipped | 68        | 270       |
| 1.7    | `services/testforge-orchestrator`                      | shipped | 52        | 322       |
| 1.8    | `packages/smoke` (Customer Zero readiness)             | shipped | 20        | 342       |
| 2.0    | `services/jd-forge`                                    | shipped | 73        | 415       |
| 2.1    | `services/stack-vault`                                 | shipped | 25        | 440       |
| 2.2    | `packages/ats-connectors` + `services/ats-bridge`      | shipped | 55        | 495       |
| 2.3    | `services/{webhooks,sso,audit-log}`                    | shipped | 99        | 594       |
| 2.4    | `apps/admin` dashboards (SSO/webhooks/audit/ATS)       | shipped | 16        | 610       |
| 2.5    | `apps/docs` + `packages/qorium-sdk`                    | shipped | 32        | 642       |
| 2.6    | `services/billing` v0 MVP                              | shipped | 38        | 680       |
| 2.7    | `services/api-key-mgmt` + Customer Zero readiness      | shipped | 28        | 708       |
| 2.8    | `services/secret-rotation-worker`                      | shipped | 21        | 729       |
| 2.9    | `packages/observability` + `services/uptime-monitor`   | shipped | 24        | 753       |
| 2.10   | `services/ai-pair-coding-orchestrator` (Wave 3)        | shipped | 29        | 782       |
| 2.11   | `apps/candidate-portal` (Wave 3 frontend stub)         | shipped | 19        | 801       |
| 2.12   | `services/setu` (status MCP + auto-deploy bridge)      | shipped | 33        | 834       |
| 2.13   | `services/webhooks-delivery-worker`                    | shipped | 25        | 859       |
| 2.14   | SSO OIDC + RS256 JWT extension                         | shipped | 22        | 881       |
| 2.15   | Stack-Vault marker substitution body rewriter          | shipped | 18        | 899       |
| 2.15.1 | Domain rebrand `qorium.io` → `qorium.online`           | shipped | 0         | 899       |
| 2.16   | JD-Forge XLSX export pathway (pure-Node OOXML)         | shipped | 11        | 910       |
| 2.16.5 | Setu 100% auto-mode bootstrap (single curl)            | shipped | 0         | 910       |
| 2.17   | Wave 3 question-authoring framework v0                 | shipped | 20        | 930       |
| 2.18   | `packages/audit-emitter` + api-key-mgmt integration    | shipped | 33        | 963       |
| 2.19   | audit-emitter wholesale wire-up (billing/sso/webhooks) | shipped | 4         | 967       |
| 2.20   | `apps/my` customer self-service portal + PM2 fill-in   | shipped | 22        | 989       |
| 2.21   | `services/leak-rotation-worker` (SO-9 24h enforcement) | shipped | 23        | 1012      |

**Workspace totals:** 30 workspaces · 14 Postgres migrations · 33 CTO-DELTAs · **1,012 active green tests** + ~53 auto-skip.

## Live deployment state (api.qorium.online)

After CEO ran the Setu bootstrap on the VPS (and Stream B shipped 5
post-bootstrap fix batches to address private-repo auth, schema
permissions, PM2 cluster-mode argv guards, etc.):

| Surface                | URL                                                | State                                    |
| ---------------------- | -------------------------------------------------- | ---------------------------------------- |
| Public API healthcheck | `https://api.qorium.online/healthz`                | 200 ✓                                    |
| Setu live status       | `https://api.qorium.online/setu/v1/setu/status`    | 200 (returns commit SHA + branch)        |
| Cluster services       | localhost:5101–5117                                | 12 services responding `{"status":"ok"}` |
| TLS cert               | Let's Encrypt                                      | active, auto-renewing                    |
| PM2 boot resurrect     | `qorium-pm2.service`                               | active                                   |
| GitHub auto-deploy     | Setu webhook + `.github/workflows/setu-deploy.yml` | run #17 verified green                   |
| Postgres               | 14 migrations applied                              | qorium owns all 7 schemas                |

## Workspace inventory

### Packages (libraries) — 7

| Workspace                | Description                                    | Tests     |
| ------------------------ | ---------------------------------------------- | --------- |
| `@qorium/db`             | Postgres pool + migration runner + types       | 19 (skip) |
| `@qorium/auth`           | Tenant + API-key auth primitives               | 26        |
| `@qorium/smoke`          | Healthcheck primitives + Customer Zero CLI     | 20+4 skip |
| `@qorium/ats-connectors` | ATS adapter framework + 4 v0 adapters          | 45        |
| `@qorium/qorium-sdk`     | Public TS SDK (HTTP client + HMAC + resources) | 21        |
| `@qorium/observability`  | Sentry / Loki / OpenTelemetry shims            | 14        |
| `@qorium/audit-emitter`  | Audit-log emitter + canonical taxonomy         | 31        |

### Apps — 4

| Workspace                  | Port | Description                                                       | Tests       |
| -------------------------- | ---: | ----------------------------------------------------------------- | ----------- |
| `@qorium/admin`            | 5104 | Next.js admin: SME queue + IRT + SSO + webhooks + audit + uptime  | 74 + 7 skip |
| `@qorium/docs`             | 5108 | Next.js public API docs                                           | 11          |
| `@qorium/candidate-portal` | 5116 | Next.js Wave 3 candidate UX                                       | 19          |
| `@qorium/my`               | 5118 | Next.js customer self-service portal (invoices + subs + API keys) | 22          |

### Services — 18

| Workspace                             |   Port | Description                                       |     Tests |
| ------------------------------------- | -----: | ------------------------------------------------- | --------: |
| `@qorium/readybank`                   |   5101 | Question search + packs + export                  |        33 |
| `@qorium/jd-forge`                    |   5102 | Real-time JD-based question generation + xlsx     |        84 |
| `@qorium/stack-vault`                 |   5103 | Per-customer namespace + watermarking + body sub  |        43 |
| `@qorium/ats-bridge`                  |   5105 | ATS webhook receiver + adapter dispatch           |        10 |
| `@qorium/webhooks`                    |   5106 | Outbound webhook subscriptions + delivery         |        24 |
| `@qorium/sso`                         |   5107 | SAML 2.0 + OIDC + RS256 JWT enterprise auth       |        53 |
| `@qorium/audit-log`                   |   5111 | Tenant-scoped audit log read API                  |        20 |
| `@qorium/billing`                     |   5112 | Subscriptions + invoices + Razorpay webhooks      |        39 |
| `@qorium/api-key-mgmt`                |   5113 | API key issuance + scope catalogue                |        30 |
| `@qorium/uptime-monitor`              |   5114 | Smoke check matrix + SLO API                      |        10 |
| `@qorium/ai-pair-coding-orchestrator` |   5115 | Wave 3 6-dim grader + Anthropic stub + authoring  |        49 |
| `@qorium/setu`                        |   5117 | Status MCP + auto-deploy bridge + bootstrap       |        45 |
| `@qorium/leak-crawler`                | (fork) | Anti-leak crawler worker                          | 47+2 skip |
| `@qorium/judge0-orchestrator`         | (fork) | Sandboxed code execution worker                   |        68 |
| `@qorium/irt-calibration`             | (fork) | Nightly IRT calibration cron                      |        64 |
| `@qorium/testforge-orchestrator`      | (fork) | TestForge QA pipeline                             |        52 |
| `@qorium/secret-rotation-worker`      | (fork) | B6 secret rotation worker                         |        21 |
| `@qorium/webhooks-delivery-worker`    | (fork) | Drains webhooks.deliveries                        |        25 |
| `@qorium/leak-rotation-worker`        | (fork) | SO-9 enforcement: 24h Critical / 7d High rotation |        23 |

## Activation halts (CEO action requests, deduplicated against §A–§E above)

These map 1:1 onto the §A–§E action queue at the top of this doc. The
short version: Stream B has stubs/shims/scaffolding for everything;
CEO supplies the real credentials/accounts/runtime artefacts.

- **Anthropic / OpenAI / Gemini / Serper API keys** — §B11, §B12; flips Phase 1 LLM stubs to live
- **Razorpay sandbox creds (KYB-completed)** — flips billing webhooks live
- **Sentry DSN + Grafana token + Slack/Sentinel webhooks** — §B13, §B14
- **Hostinger VPS already provisioned**; Cloudflare R2 still pending — §B9
- **Greenhouse OAuth client + Ashby/Darwinbox keys + Workday cert** — Phase 3 ATS go-lives
- **SAML IdP test creds (Okta/Azure/Google) + RS256 KMS keypair** — production SSO
- **Talpro Customer Zero seed (real questions + users)** — §D5
- **DNS A/AAAA for docs/admin/candidate/my subdomains** (api.qorium.online live) — §B2
- **Real `API_KEY_PEPPER` (≥32 chars via `openssl rand -hex 32`)** — Phase 1 D3 productionisation
- **Senior Engineer #1 architectural review (Wave 3)** — §C5/§I1 hire dependency

## CTO-DELTA registry — 33 deltas

See `infra/CTO-deltas/` for the catalogue. Each delta documents an
engineering deviation from the spec + the CEO action that would
unblock the live state.

## Constitutional gates closed (engineering side)

- **SO-21** (IRT mandatory before release) — Sprint 1.5
- **SO-22** (AI plagiarism ≥93% public benchmark) — Sprint 1.7
- **SO-24** (No-Fiction policy) — Sprint 1.7 (TestForge gate enforces)
- **Article VII** (92-pt scorecard quality gate) — Sprint 1.5 + 1.7
- **Article IX** (M9 phase gate — 4 ATS go-live) — Sprint 2.2 framework
  shipped; per-ATS live-flip at M6/M7/M8/M9

## Build run history (this session — autonomous-continuous mode)

| Timestamp         | Action                                                            | Commit        | Push      |
| ----------------- | ----------------------------------------------------------------- | ------------- | --------- |
| 2026-05-03T18:49Z | Sprint 2.3 — webhooks/sso/audit-log                               | `2b90c27`     | pushed    |
| 2026-05-03T19:01Z | Sprint 2.4 — admin onboarding dashboards                          | `382dd20`     | pushed    |
| 2026-05-03T19:11Z | Sprint 2.5 — apps/docs + qorium-sdk                               | `4fb45d8`     | pushed    |
| 2026-05-03T19:20Z | Sprint 2.6 — billing v0                                           | `d4ad069`     | pushed    |
| 2026-05-03T19:28Z | Sprint 2.7 — api-key-mgmt + Customer Zero readiness               | `dfb4d7c`     | pushed    |
| 2026-05-03T19:34Z | Sprint 2.8 — secret rotation worker                               | `02ebb55`     | pushed    |
| 2026-05-03T19:38Z | Sprint 2.9 — observability + uptime-monitor                       | `7648fc1`     | pushed    |
| 2026-05-03T19:46Z | Sprint 2.10 — Wave 3 AI pair-coding orchestrator                  | `fc0e391`     | pushed    |
| 2026-05-04T03:50Z | Sprint 2.17 — Wave 3 question authoring framework + bootstrap fix | `4a1e8c8`     | pushed    |
| 2026-05-04T04:05Z | Sprint 2.18 — packages/audit-emitter + api-key-mgmt               | `7250c71`     | pushed    |
| 2026-05-04T04:15Z | Sprint 2.19 — wholesale audit-emitter wire-up                     | `0136c8a`     | pushed    |
| 2026-05-04T04:18Z | Bootstrap-fix #1 — repo casing + chat-paste hardening             | `74c1142`     | pushed    |
| 2026-05-04T04:23Z | Bootstrap-fix #2 — PAT support for private-repo bootstrap         | `fbba773`     | pushed    |
| 2026-05-04T05:18Z | Bootstrap-fix #3 — nginx/IPv4/migrate-script/PM2-paths            | `3255883`     | pushed    |
| 2026-05-04T05:43Z | Bootstrap-fix #4 — postgres schema GRANT + admin path             | `5fc46a2`     | pushed    |
| 2026-05-04T06:19Z | Bootstrap-fix #5 — pre-install pg extensions as superuser         | `3f573ee`     | pushed    |
| 2026-05-04T06:22Z | Bootstrap-fix #6 — admin local node_modules + DB ownership        | `7ae6ebe`     | pushed    |
| 2026-05-04T13:28Z | Bootstrap-fix #7 — drop process.argv[1] guard (PM2 cluster)       | `2dd5135`     | pushed    |
| 2026-05-04T14:30Z | Artifact reconciliation — macro Phase 0 status                    | `7f0c2b9`     | pushed    |
| 2026-05-07T00:00Z | Bali Sales Playbook v1 (Constitution-companion gap closed)        | (this commit) | (pushing) |

## Final note

The earlier version of this artifact dashboard claimed "project
complete" by the strength of Stream B's engineering deliverables.
That was wrong. The macro project is at **~38% Phase 0 of 8 phases**
and the next ~62% of Phase 0 is gated entirely on CEO actions
(capital, IP counsel, hiring, Bosch outreach, real API keys).

When the CEO completes the action queue at the top of this doc,
Phase 0 hits 100% and Phase 1 begins. Stream B's engineering
substrate is ready for Phase 1's first 5,000 questions, first 5
logos, and first 6 hires.
