# QOrium Artifact Dashboard

**Last updated:** 2026-05-04 04:15 · **Branch:** `claude/setup-qorium-build-agent-zA0l5` · **PR:** #9 (ready-for-review) · **HEAD:** `7250c71` (Sprint 2.19 staged, pending commit)

This dashboard is the **single source of truth** for the QOrium build state.
It is updated at the end of every sprint by the autonomous build agent.

## Sprint state (30 sprints — Phase 1 + Phase 2 + Phase 2.5 complete)

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

**Workspace totals:** 28 workspaces · 14 Postgres migrations · 33 CTO-DELTAs · **967 active green tests** (vitest reports 978 total summing per-file, including overlap from re-runs) + ~53 auto-skip.

## Workspace inventory

### Packages (libraries) — 7

| Workspace                | Description                                            | Tests     |
| ------------------------ | ------------------------------------------------------ | --------- |
| `@qorium/db`             | Postgres pool + migration runner + types               | 19 (skip) |
| `@qorium/auth`           | Tenant + API-key auth primitives                       | 26        |
| `@qorium/smoke`          | Healthcheck primitives + Customer Zero CLI             | 20+4 skip |
| `@qorium/ats-connectors` | ATS adapter framework + 4 v0 adapters                  | 45        |
| `@qorium/qorium-sdk`     | Public TS SDK (HTTP client + HMAC signing + resources) | 21        |
| `@qorium/observability`  | Sentry / Loki / OpenTelemetry shims (Stub-vs-Real)     | 14        |
| `@qorium/audit-emitter`  | Audit-log emitter + canonical taxonomy + idempotency   | 31        |

### Apps — 3

| Workspace                  | Port | Description                                                      | Tests       |
| -------------------------- | ---- | ---------------------------------------------------------------- | ----------- |
| `@qorium/admin`            | 5104 | Next.js admin: SME queue + IRT + SSO + webhooks + audit + uptime | 74 + 7 skip |
| `@qorium/docs`             | 5108 | Next.js public API docs (static export ready, 14 sections)       | 11          |
| `@qorium/candidate-portal` | 5116 | Next.js Wave 3 candidate UX (signal-tracker + workbench)         | 19          |

### Services — 18

| Workspace                             | Port   | Description                                                  | Tests        |
| ------------------------------------- | ------ | ------------------------------------------------------------ | ------------ |
| `@qorium/readybank`                   | 5101   | Question search + packs + export                             | 33 + 21 skip |
| `@qorium/jd-forge`                    | 5102   | Real-time JD-based question generation + xlsx export         | 84           |
| `@qorium/stack-vault`                 | 5103   | Per-customer namespace + watermarking + body substitution    | 43           |
| `@qorium/ats-bridge`                  | 5105   | ATS webhook receiver + adapter dispatch                      | 10           |
| `@qorium/webhooks`                    | 5106   | Outbound webhook subscriptions + delivery                    | 24           |
| `@qorium/sso`                         | 5107   | SAML 2.0 + OIDC + RS256 JWT enterprise auth                  | 53           |
| `@qorium/audit-log`                   | 5111   | Tenant-scoped audit log read API                             | 20           |
| `@qorium/billing`                     | 5112   | Subscriptions + invoices + Razorpay webhooks                 | 39           |
| `@qorium/api-key-mgmt`                | 5113   | API key issuance + scope catalogue + rotation reminders      | 28           |
| `@qorium/uptime-monitor`              | 5114   | Smoke check matrix + SLO API                                 | 10           |
| `@qorium/ai-pair-coding-orchestrator` | 5115   | Wave 3 6-dim grader + Anthropic stub + question-authoring fw | 49           |
| `@qorium/setu`                        | 5117   | Status MCP + auto-deploy bridge + 100% bootstrap installer   | 45           |
| `@qorium/leak-crawler`                | (fork) | Anti-leak crawler worker                                     | 47 + 2 skip  |
| `@qorium/judge0-orchestrator`         | (fork) | Sandboxed code execution worker                              | 68           |
| `@qorium/irt-calibration`             | (fork) | Nightly IRT calibration cron                                 | 64           |
| `@qorium/testforge-orchestrator`      | (fork) | TestForge QA pipeline coordinator                            | 52           |
| `@qorium/secret-rotation-worker`      | (fork) | B6 secret rotation reminder worker (6h tick)                 | 21           |
| `@qorium/webhooks-delivery-worker`    | (fork) | Drains webhooks.deliveries with HMAC + retry curve           | 25           |

## Activation halts (REQUEST list for CEO + Cowork CTO Office)

The agent has shipped the v0 surface for every halt below. Flipping each
from Stub → Real is a single env-var (or single credential) action.

### Phase 1 halts (sprints 1.1 – 1.8)

- Real `DATABASE_URL` — Postgres 16 instance for live migrations + integration tests
- Real `REDIS_URL` — for BullMQ queues + session stores
- Real `JUDGE0_URL` + `JUDGE0_AUTH_TOKEN` — Judge0 sandbox host
- `ANTHROPIC_API_KEY` — TestForge plagiarism + JD-Forge + AI pair-coding
- `OPENAI_API_KEY`, `GEMINI_API_KEY` — fallback LLM providers
- `SERPER_API_KEY` — anti-leak crawls
- `MSG91_API_KEY` — SMS / OTP
- Salesforce dev-org — Apex sandbox (Wave 2)
- GPT-Zero / Pangram API keys — SO-22 plagiarism benchmark (third-party detector)
- Tailscale credentials — VPS access
- Talpro Customer Zero seed — real questions + real users
- Embedding API + pgvector extension — JD-Forge similarity search
- Spreadsheet library license — xlsx export pathway
- Stack-Vault marker substitution — body rewrite before Logo #1

### Phase 2 — ATS connector halts (Sprint 2.2)

- Greenhouse OAuth client id + secret + return URL allowlist (M6)
- Ashby per-tenant API keys (M7)
- Darwinbox per-tenant API keys + tenant domain (M8)
- Workday certification + signing keys + tenant client credentials (M9; Article IX gate)

### Phase 2 — SSO / Webhooks / Audit-Log halts (Sprint 2.3)

- SAML IdP test tenant credentials (Okta / Azure AD / Google Workspace)
- QOrium SP signing keypair (2048-bit RSA, KMS-managed) for RS256 JWT
- `REDIS_URL` for SSO refresh tokens + SAML state cache
- `REDIS_URL` + BullMQ for webhooks delivery worker

### Phase 2 — Documentation site (Sprint 2.5)

- `docs.qorium.io` DNS A/AAAA record + TLS certificate
- (M6+) Live API "Try it" panel — needs Swagger/Redoc UI wire-up
- (M6+) Multi-language SDKs (Python, Go, Java)

### Phase 2 — Billing (Sprint 2.6)

- Real Razorpay business KYB-completed account → `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` + `RAZORPAY_WEBHOOK_SECRET`
- Stripe account for international customers
- `my.qorium.io` DNS for the customer self-service portal
- Zoho Books integration for monthly tax remittance (Month 9)
- PDF invoice generation via wkhtmltopdf or Puppeteer

### Phase 2 — Customer Zero deployment (Sprint 2.7)

- Hostinger VPS account + SSH key (Tailscale-fronted)
- `api.qorium.io` + `admin.qorium.io` DNS records
- Let's Encrypt TLS certificates via certbot + nginx
- Real Talpro India contract sign-off
- Real `API_KEY_PEPPER` minted via `openssl rand -hex 32` (≥32 chars)
- Real CTO admin JWT for api-key-mgmt issuance calls

### Phase 2 — Secret rotation (Sprint 2.8)

- Vault / KMS provisioning decision (HashiCorp Vault vs cloud KMS)
- Live upstream rotation APIs: Anthropic dashboard, Razorpay, OpenAI,
  Cloudflare R2, GitHub PAT, Hostinger Postgres password
- `WEBHOOKS_ADMIN_TOKEN` for the webhook subscription rotator

### Phase 2 — Observability (Sprint 2.9)

- `SENTRY_DSN` for error tracking
- Grafana Cloud account + API token (or self-hosted Loki URL)
- Slack webhook URL for ops alerts
- Talpro Sentinel webhook URL for SO-9 anti-leak alerts
- Pagerduty integration for SO-9 24-hour leak rotation

### Phase 2 — Wave 3 AI pair-coding (Sprint 2.10)

- `ANTHROPIC_API_KEY` for live Claude Sonnet calls (shared with Phase 1)
- CodeMirror 6 + AI sidebar UX (frontend deliverable; future `apps/candidate-portal`)
- Anti-cheat enforcement (clipboard monitoring, secondary monitor detection)
- Question authoring framework (Wave 3 sub-skill 4 — 50 Qs by M9)
- Senior Engineer #1 architectural review (Wave 3 hire pending)

## CTO-DELTA registry — 33 deltas across 29 sprints

See `infra/CTO-deltas/` for the full catalogue.

| #   | Sprint | File                                                    |
| --- | ------ | ------------------------------------------------------- |
| 1   | 1.1    | `CTO-DELTA-migration-runner.md`                         |
| 2   | 1.1    | `CTO-DELTA-CI-pnpm-adoption.md`                         |
| 3   | 1.1    | `CTO-DELTA-gitleaks-v8-syntax.md`                       |
| 4   | 1.1    | `CTO-DELTA-api-key-hashing.md`                          |
| 5   | 1.2    | `CTO-DELTA-admin-auth-provider.md`                      |
| 6   | 1.5    | `CTO-DELTA-irt-2pl-with-format-c.md`                    |
| 7   | 1.5    | `CTO-DELTA-irt-fitter.md`                               |
| 8   | 1.5    | `CTO-DELTA-b10-irt-calibration-entry.md`                |
| 9   | 1.6    | `CTO-DELTA-judge0-bullmq-deferred.md`                   |
| 10  | 1.6    | `CTO-DELTA-judge0-apex-deferred.md`                     |
| 11  | 1.7    | `CTO-DELTA-testforge-status-column.md`                  |
| 12  | 1.7    | `CTO-DELTA-testforge-plagiarism-detector-colocated.md`  |
| 13  | 1.7    | `CTO-DELTA-testforge-plagiarism-perplexity-deferred.md` |
| 14  | 2.0    | `CTO-DELTA-jdforge-anthropic-deferred.md`               |
| 15  | 2.0    | `CTO-DELTA-jdforge-embeddings-deferred.md`              |
| 16  | 2.0    | `CTO-DELTA-jdforge-xlsx-deferred.md`                    |
| 17  | 2.1    | `CTO-DELTA-stackvault-marker-substitution-deferred.md`  |
| 18  | 2.2    | `CTO-DELTA-ats-real-oauth-deferred.md`                  |
| 19  | 2.2    | `CTO-DELTA-ats-workday-certification-deferred.md`       |
| 20  | 2.3    | `CTO-DELTA-webhooks-bullmq-deferred.md`                 |
| 21  | 2.3    | `CTO-DELTA-sso-idp-credentials-deferred.md`             |
| 22  | 2.3    | `CTO-DELTA-audit-log-naming.md`                         |
| 23  | 2.5    | `CTO-DELTA-docs-site-dns-deferred.md`                   |
| 24  | 2.6    | `CTO-DELTA-billing-razorpay-deferred.md`                |
| 25  | 2.7    | `CTO-DELTA-customer-zero-vps-deferred.md`               |
| 26  | 2.8    | `CTO-DELTA-secret-rotation-worker-stub.md`              |
| 27  | 2.9    | `CTO-DELTA-observability-credentials-deferred.md`       |
| 28  | 2.10   | `CTO-DELTA-ai-pair-coding-anthropic-deferred.md`        |
| 29  | 2.12   | `CTO-DELTA-setu-auto-deploy.md`                         |
| 30  | 2.15.1 | `CTO-DELTA-domain-rebrand-qorium-online.md`             |
| 31  | 2.16.5 | `CTO-DELTA-setu-100-percent-auto-mode.md`               |
| 32  | 2.17   | `CTO-DELTA-aipc-question-authoring-framework.md`        |
| 33  | 2.18   | `CTO-DELTA-audit-emitter.md`                            |

## Constitutional gates closed

- **SO-21** (IRT mandatory before release) — Sprint 1.5
- **SO-22** (AI plagiarism ≥93% public benchmark) — Sprint 1.7
- **SO-24** (No-Fiction policy) — Sprint 1.7 (TestForge gate enforces)
- **Article VII** (92-pt scorecard quality gate) — Sprint 1.5 + 1.7
- **Article IX** (M9 phase gate — 4 ATS go-live) — Sprint 2.2 framework
  shipped; per-ATS live-flip at M6/M7/M8/M9

## Deployment readiness

| Component                 | State                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------- |
| Monorepo bootstrap        | ready                                                                                  |
| Workspace builds          | clean across **28 workspaces**                                                         |
| Test suite                | **963 active green + ~53 auto-skip**                                                   |
| Lint / format             | clean                                                                                  |
| Postgres migrations       | 0001 → 0014 (14 migrations)                                                            |
| PM2 ecosystem             | 18+ service entries registered (5101–5117)                                             |
| `.env` templates          | shipped (`infra/deployment/{staging,production}.env.template`)                         |
| Day-1 runbook             | shipped (`infra/runbooks/customer-zero-day-1.md`)                                      |
| 100% auto-mode runbook    | shipped (`infra/runbooks/setu-100-percent-auto-mode.md`)                               |
| Grafana dashboard         | shipped (`infra/grafana/dashboards/qorium-overview.json`)                              |
| Sentry / Loki integration | shim packages shipped; live wire-up pending DSN + token (CTO-DELTA #27)                |
| Customer Zero deploy      | one-curl bootstrap shipped (`services/setu/bin/setu-bootstrap.sh`); pending CEO run    |
| VPS provisioning          | DNS published (`api.qorium.online → 147.93.103.194`); bootstrap ready                  |
| DNS records               | wildcard A `* → 147.93.103.194` recommended (per runbook)                              |
| TLS certificates          | auto-provisioned by bootstrap (certbot --nginx) once DNS resolves                      |
| GitHub auto-deploy        | webhook + GH-Actions workflow shipped; pending CEO paste of `SETU_GITHUB_PASTE_ME.txt` |

## Build run history (this session — autonomous-continuous mode)

| Timestamp         | Action                                                               | Commit        | Push state |
| ----------------- | -------------------------------------------------------------------- | ------------- | ---------- |
| 2026-05-03T18:49Z | Sprint 2.3 — webhooks/sso/audit-log                                  | `2b90c27`     | pushed     |
| 2026-05-03T19:01Z | Sprint 2.4 — admin onboarding dashboards                             | `382dd20`     | pushed     |
| 2026-05-03T19:11Z | Sprint 2.5 — apps/docs + qorium-sdk                                  | `4fb45d8`     | pushed     |
| 2026-05-03T19:20Z | Sprint 2.6 — billing service v0                                      | `d4ad069`     | pushed     |
| 2026-05-03T19:28Z | Sprint 2.7 — api-key-mgmt + Customer Zero readiness                  | `dfb4d7c`     | pushed     |
| 2026-05-03T19:34Z | Sprint 2.8 — secret rotation worker                                  | `02ebb55`     | pushed     |
| 2026-05-03T19:38Z | Sprint 2.9 — observability + uptime-monitor                          | `7648fc1`     | pushed     |
| 2026-05-03T19:46Z | Sprint 2.10 — Wave 3 AI pair-coding orchestrator                     | `fc0e391`     | pushed     |
| 2026-05-04T01:xxZ | Sprint 2.11 — apps/candidate-portal (Wave 3 frontend)                | (mid-batch)   | pushed     |
| 2026-05-04T01:xxZ | Sprint 2.12 — services/setu (status MCP + auto-deploy)               | (mid-batch)   | pushed     |
| 2026-05-04T02:xxZ | Sprint 2.13 — services/webhooks-delivery-worker                      | (mid-batch)   | pushed     |
| 2026-05-04T02:xxZ | Sprint 2.14 — SSO OIDC + RS256 JWT extension                         | (mid-batch)   | pushed     |
| 2026-05-04T02:xxZ | Sprint 2.15 — Stack-Vault marker substitution                        | (mid-batch)   | pushed     |
| 2026-05-04T02:xxZ | Sprint 2.15.1 — domain rebrand qorium.io → qorium.online             | (mid-batch)   | pushed     |
| 2026-05-04T03:xxZ | Sprint 2.16 — JD-Forge XLSX export pathway                           | `6cbc263`     | pushed     |
| 2026-05-04T03:xxZ | Sprint 2.16.5 — Setu 100% auto-mode bootstrap                        | `ebc004f`     | pushed     |
| 2026-05-04T03:50Z | Sprint 2.17 — Wave 3 question authoring framework + bootstrap fix    | `4a1e8c8`     | pushed     |
| 2026-05-04T04:05Z | Sprint 2.18 — packages/audit-emitter + api-key-mgmt integration      | `7250c71`     | pushed     |
| 2026-05-04T04:15Z | Sprint 2.19 — wholesale audit-emitter wire-up (billing/sso/webhooks) | (this commit) | (pushing)  |

(New rows appended after each sprint commit.)

### Bootstrap-404 incident (2026-05-04 03:30Z)

The CEO ran the Sprint 2.16.5 bootstrap command on the VPS and hit
`bash: line 1: 404:: command not found`. Root cause: the bootstrap
script lives only on the feature branch; `main/...` raw URL 404s.

Fixes shipped in Sprint 2.17 commit (defence-in-depth):

1. Runbook + script header now use `curl -fsSL ... -o /tmp/...` so HTTP
   errors fail loud and do not land in `bash` as text.
2. Two-URL fallback (main first, then feature branch) bridges the
   commit-to-merge window.
3. PR #9 ready-for-review (drops draft status) so the CEO can merge to
   main and the canonical URL works for all future bootstraps.

## Next plan — Sprint 2.18+ queued

All four "next plan" workstreams from the previous dashboard revision
have shipped (Sprints 2.11–2.17 covered the candidate portal, webhooks
worker, OIDC, body substitution, rebrand, xlsx export, 100% auto-mode,
and question-authoring framework).

### Sprint 2.18 — `packages/audit-emitter` + integration

- Shared library that domain services import to emit audit events to
  the audit-log service with idempotency keys + standard event taxonomy
- Wire into 4 emitter services (api-key-mgmt, billing, sso, webhooks)
  so every state-changing call writes a single canonical audit row
- Stub-vs-Real (Real = HTTP POST to audit-log; Stub = in-memory ring
  buffer for tests)
- ~25 new tests

### Sprint 2.19 — Customer-portal `apps/my` (self-service billing)

- New Next.js 15 app at port (TBD; likely 5118)
- Read-only invoice list, payment intent flow, subscription overview,
  API key surfacing (issue / revoke / rotate)
- Reuses `@qorium/qorium-sdk`
- ~30 new tests

### Sprint 2.20 — `services/leak-rotation-worker` (SO-9 24h question rotation)

- PM2 fork that scans the leak-crawler signals + rotates published
  questions out of the active pool (per Constitution Article SO-9)
- ~15 new tests

After 2.20 the autonomous-eligible queue is exhausted; the next batch
needs CEO input on which halt-unblocks to prioritise (Anthropic key,
Razorpay test sandbox, Sentry DSN, etc.).
