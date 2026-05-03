# QOrium Artifact Dashboard

**Last updated:** 2026-05-03 · **Branch:** `claude/setup-qorium-build-agent-zA0l5` · **PR:** #9

This dashboard is the **single source of truth** for the QOrium build state.
It is updated at the end of every sprint by the autonomous build agent.

## Sprint state (16-sprint plan)

| Sprint | Workspace                                            | Status  | Tests new | Cum tests |
| ------ | ---------------------------------------------------- | ------- | --------- | --------- |
| 0.1    | Monorepo bootstrap                                   | shipped | —         | —         |
| 0.2    | Dev orchestration                                    | shipped | —         | —         |
| 1.1    | `services/readybank` skeleton                        | shipped | 33        | 33        |
| 1.2    | `packages/auth` + `apps/admin` scaffold              | shipped | 26        | 59        |
| 1.3    | SME review queue + decision workflow                 | shipped | 32        | 91        |
| 1.4    | `services/leak-crawler` (Anti-Leak Engine v0)        | shipped | 47        | 138       |
| 1.5    | `services/irt-calibration` (IRT Pipeline v0)         | shipped | 64        | 202       |
| 1.6    | `services/judge0-orchestrator`                       | shipped | 68        | 270       |
| 1.7    | `services/testforge-orchestrator`                    | shipped | 52        | 322       |
| 1.8    | `packages/smoke` (Customer Zero readiness)           | shipped | 20        | 342       |
| 2.0    | `services/jd-forge`                                  | shipped | 73        | 415       |
| 2.1    | `services/stack-vault`                               | shipped | 25        | 440       |
| 2.2    | `packages/ats-connectors` + `services/ats-bridge`    | shipped | 55        | 495       |
| 2.3    | `services/{webhooks,sso,audit-log}`                  | shipped | 99        | 594       |
| 2.4    | `apps/admin` dashboards (SSO/webhooks/audit/ATS)     | shipped | 16        | 610       |
| 2.5    | `apps/docs` + `packages/qorium-sdk`                  | shipped | 32        | 642       |
| 2.6    | `services/billing` v0 MVP                            | shipped | 38        | 680       |
| 2.7    | `services/api-key-mgmt` + Customer Zero readiness    | shipped | 28        | 708       |
| 2.8    | `services/secret-rotation-worker`                    | shipped | 21        | 729       |
| 2.9    | `packages/observability` + `services/uptime-monitor` | shipped | 24        | 753       |
| 2.10   | `services/ai-pair-coding-orchestrator` (Wave 3)      | pending | —         | —         |

## Workspace inventory

### Packages (libraries)

| Workspace                | Description                                | Tests     |
| ------------------------ | ------------------------------------------ | --------- |
| `@qorium/db`             | Postgres pool + migration runner + types   | 14 (skip) |
| `@qorium/auth`           | Tenant + API-key auth primitives           | 26        |
| `@qorium/smoke`          | Healthcheck primitives + Customer Zero CLI | 20+4 skip |
| `@qorium/ats-connectors` | ATS adapter framework + 4 v0 adapters      | 45        |

### Services (Express servers + workers)

| Workspace                        | Port   | Description                               |
| -------------------------------- | ------ | ----------------------------------------- |
| `@qorium/readybank`              | 5101   | Question search + packs + export          |
| `@qorium/jd-forge`               | 5102   | Real-time JD-based question generation    |
| `@qorium/stack-vault`            | 5103   | Per-customer namespace + watermarking     |
| `@qorium/admin` (Next.js)        | 5104   | SME review queue + admin dashboards       |
| `@qorium/leak-crawler`           | (fork) | Anti-leak crawler worker                  |
| `@qorium/ats-bridge`             | 5105   | ATS webhook receiver + adapter dispatch   |
| `@qorium/webhooks`               | 5106   | Outbound webhook subscriptions + delivery |
| `@qorium/sso`                    | 5107   | SAML 2.0 + OIDC enterprise auth           |
| `@qorium/judge0-orchestrator`    | (fork) | Sandboxed code execution worker           |
| `@qorium/irt-calibration`        | (fork) | Nightly IRT calibration cron              |
| `@qorium/testforge-orchestrator` | (fork) | TestForge QA pipeline coordinator         |
| `@qorium/audit-log`              | 5111   | Tenant-scoped audit log read API          |

## Activation halts (REQUEST list for CEO)

This is the running list of halt-conditions that require human action to flip
from Stub → Real. The agent has shipped the v0 surface for all of them.

### Phase 1 halts (sprints 1.1–1.8)

- Real Postgres URL (`DATABASE_URL`) for live schema migrations + integration tests
- Real Redis URL for BullMQ queues + session stores
- Real Judge0 host (`JUDGE0_URL` + `JUDGE0_AUTH_TOKEN`) for code execution
- `ANTHROPIC_API_KEY` for live LLM calls (TestForge plagiarism + JD-Forge)
- `SERPER_API_KEY` for live anti-leak crawls
- `MSG91_API_KEY` for SMS/OTP
- Salesforce dev-org for Apex sandbox (Wave 2)
- GPT-Zero / Pangram API keys for SO-22 plagiarism benchmark
- Tailscale credentials for VPS access
- Talpro Customer Zero seed (real questions + real users)
- Embedding API + pgvector for JD-Forge similarity search
- Spreadsheet library license (xlsx export)
- Stack-Vault marker substitution body rewrite (pre-Logo #1)

### Phase 2 halts

#### Sprint 2.2 (ATS)

- Greenhouse OAuth client id + secret + return URL allowlisting (M6)
- Ashby per-tenant API keys (M7)
- Darwinbox per-tenant API keys + tenant domain (M8)
- Workday certification + signing keys + tenant client credentials (M9)

#### Sprint 2.3 (SSO/Webhooks/Audit-Log)

- SAML IdP test tenant credentials (Okta / Azure AD / Google Workspace)
- QOrium SP signing keypair (2048-bit RSA, KMS-managed) for RS256
- Redis URL for SSO refresh tokens + SAML state cache
- Redis URL + BullMQ for webhooks delivery worker

## CTO-DELTA registry

22 deltas filed across 14 sprints. Each documents a deviation from spec
that requires CTO Office reconciliation. See `infra/CTO-deltas/` for the
full catalogue.

| #     | Sprint | File                                                          |
| ----- | ------ | ------------------------------------------------------------- |
| 1–4   | 1.1    | (4 deltas: migration runner, gitleaks v8, api-key hashing, …) |
| 5     | 1.2    | admin auth provider                                           |
| 6–8   | 1.5    | IRT 2PL with format C, IRT fitter, B10 IRT calibration entry  |
| 9–10  | 1.6    | Judge0 BullMQ deferred, Judge0 Apex deferred                  |
| 11–13 | 1.7    | TestForge plagiarism (3 deltas)                               |
| 14–16 | 2.0    | JD-Forge (Anthropic, embeddings, xlsx)                        |
| 17    | 2.1    | Stack-Vault marker substitution                               |
| 18–19 | 2.2    | ATS real OAuth, Workday certification                         |
| 20    | 2.3    | Webhooks BullMQ deferred                                      |
| 21    | 2.3    | SSO IdP credentials deferred                                  |
| 22    | 2.3    | Audit-log naming (storage→spec mapping)                       |

(Deltas 23+ will be added as Sprints 2.4–2.10 land.)

## Constitutional gates closed

- **SO-21** (IRT mandatory before release) — Sprint 1.5
- **SO-22** (AI plagiarism ≥93% public benchmark) — Sprint 1.7
- **SO-24** (No-Fiction policy) — Sprint 1.7 (TestForge gate enforces)
- **Article VII** (92-pt scorecard quality gate) — Sprint 1.5 + 1.7
- **Article IX** (M9 phase gate — 4 ATS go-live) — Sprint 2.2 framework
  shipped; per-ATS live-flip at M6/M7/M8/M9

## Deployment readiness

| Component                 | State                                                                  |
| ------------------------- | ---------------------------------------------------------------------- |
| Monorepo bootstrap        | ready                                                                  |
| Workspace builds          | clean across 16 workspaces                                             |
| Test suite                | 594 active green + 48 auto-skip                                        |
| Lint / format             | clean                                                                  |
| Postgres migrations       | 0001 → 0010 (10 migrations)                                            |
| PM2 ecosystem             | 12 services registered                                                 |
| `.env` templates          | not yet written (Sprint 2.7 deliverable)                               |
| Sentry / Loki integration | not yet wired (Sprint 2.9 deliverable)                                 |
| Customer Zero deploy      | runbook exists in `customer-zero/`; tooling not yet wired (Sprint 2.7) |
| VPS provisioning          | **CEO action — not in agent scope**                                    |
| DNS records               | **CEO action — not in agent scope**                                    |
| TLS certificates          | **CEO action — not in agent scope**                                    |

## Build run history (this session)

| Timestamp         | Action                              | Commit    | Push state |
| ----------------- | ----------------------------------- | --------- | ---------- |
| 2026-05-03T18:49Z | Sprint 2.3 — webhooks/sso/audit-log | `2b90c27` | pushed     |

(New rows appended after each sprint commit.)
