# QOrium Build Log

A running log of the parallel Claude Code build session.
Cowork session reads this to know what's been built.

---

## 2026-05-03 — Sprint 0 kickoff (bounded)

Per CTO recommendation and user "go": initial work was bounded to Sprint 0.1 + 0.2,
since the §2 required-reading specs were not present in this environment at session
start. Bounded scope: only work fully specified by handoff §3 (tech stack) and §4
(repo layout).

### Sprint 0.1 — Monorepo bootstrap ✅

- pnpm workspace, TS strict, ESLint flat config, Prettier
- Husky + lint-staged + gitleaks pre-commit
- `.env.example`, `.gitignore`, `tsconfig.base.json`
- PR #1 (draft): https://github.com/sales799/QOrium/pull/1

### Sprint 0.2 — Dev orchestration ✅

- `infra/docker/docker-compose.dev.yml`: postgres 16, redis 7, minio + bucket-init,
  judge0 1.13.1 (with its own pg+redis to avoid schema collision)
- `Makefile`: `dev-up`, `dev-down`, `dev-reset`, `dev-logs`, `dev-ps`,
  `compose-config`, `typecheck`, `lint`, `format`, `test`, `build`, `secrets-scan`
- README quickstart + prerequisites + quality bars

---

## 2026-05-03 — Spec ingest + canonical wire-up ✅

User pushed binding specs from the Cowork Mac to `sales799/qorium:specs` (146 files,
46k insertions). PR #2 ingests them into the build branch and wires the canonical
configs into the locations the toolchain expects.

### What landed

- All Constitution / Architecture / blueprint / SKU docs at repo root
- `customer-zero/` — Wave 1 + Wave 2 + Wave 3 question batches, recruiter onboarding,
  reference-panel governance, Talpro Customer Zero kickoff materials
- `governance/` — 92-pt Quality Gate scorecard, AI plagiarism benchmark, bias
  detection methodology, incident response runbook, operating rituals, investor brief
- `infra/` — B1, B5, B6, B7, B10 plus design specs for Anti-Leak, JD-Forge,
  IRT calibration, Judge0 sandbox, SSO/SAML, webhooks, billing, ATS connectors,
  audit log API, Talpro internal API key spec
- `task_plan_phase0_phase1.md`

### Wire-up changes (in this PR)

- `.github/workflows/ci.yml` — pnpm-port of `infra/B5-CI-Pipeline.github-actions.yml`
  (delta: `infra/CTO-deltas/CTO-DELTA-CI-pnpm-adoption.md`)
- `.gitleaks.toml` — gitleaks v8-valid form mirroring intent of
  `infra/B6-gitleaks-config.yaml` (delta:
  `infra/CTO-deltas/CTO-DELTA-gitleaks-v8-syntax.md`)
- `ecosystem.config.cjs` at repo root — re-exports `infra/B10-ecosystem.config.js`
- `infra/package.json` — CJS scope override so B10 (`module.exports`) works under
  root `"type": "module"`
- `.env.example` — service ports updated to canonical PM2 5101–5104 (was 4001–4005)

### Discrepancies surfaced (logged as CTO-DELTAs, not blockers)

| Topic                                                                       | Resolution                                                            |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Node version: arch §2.2 says 22, B5 CI says 20                              | CI pinned to 20 (B5 canonical); `engines.node` is `>=20` so both pass |
| Test coverage: arch §12 says 70%, B5 + 92-pt Gate say 80%                   | 80% per newer docs                                                    |
| Migration tool: handoff suggested Drizzle, B7 README says `node-pg-migrate` | Sprint 0.3 will use `node-pg-migrate` (canonical)                     |
| Schema: arch §5.1 illustrative ≠ actual `0001_initial_schema.sql`           | Migration is canonical (UUID PKs, `app/content/audit` schemas)        |
| Package manager: arch implies npm, handoff says pnpm                        | pnpm; CI ported (delta logged)                                        |

### BLOCKED items — all cleared

Specs that were missing at session start are all now present in `main`. Nothing
is blocking Sprint 0.3 onward.

---

---

## 2026-05-03 — Sprint 0.3 db package ✅

Built `packages/db` (`@qorium/db`): typed `pg` pool, env resolution, custom
migration runner pointing at canonical `infra/B7-postgres-migrations/`,
vitest smoke suite.

### What landed

- `packages/db/src/client.ts` — `createPool()`, `ping()`, typed re-exports of
  `Pool`, `PoolClient`, `QueryResult`
- `packages/db/src/env.ts` — `resolveDatabaseUrl()` with `DATABASE_URL` priority,
  fallback to composed `POSTGRES_*` vars, fail-fast on missing config
- `packages/db/src/migrate.ts` — custom runner: reads `*.sql` from
  `infra/B7-postgres-migrations/`, sorts lexically, tracks state in
  `public.pgmigrations` (same table node-pg-migrate uses → future switch is a no-op),
  detects pre-wrapped `BEGIN/COMMIT` migrations and runs them raw
- `packages/db/src/cli.ts` — `qorium-db up` / `qorium-db status` CLI
- `packages/db/__tests__/migration.smoke.test.ts` — 7 vitest cases:
  pool reachable, three schemas exist, app/content tables present, audit.events
  exists, content.questions SKU CHECK constraint enforced, app.users role CHECK
  constraint enforced
- Make targets: `db-migrate`, `db-status`, `db-test`

### Why a custom runner instead of node-pg-migrate

The B7 README recommends `node-pg-migrate`, but its filename parser rejects
the canonical `NNNN_name.sql` format (it expects ms-epoch timestamps). Renaming
the canonical file would modify Cowork-authored content (read-only per handoff §6).
Built a thin ~150-line runner that consumes the canonical layout exactly.
Tracking table is compatible if we ever switch back. Logged as
`infra/CTO-deltas/CTO-DELTA-migration-runner.md`.

### Verified locally

- `pnpm migrate:up` clean against fresh Postgres 16 (all 13 tables created
  across `app`, `content`, `audit` schemas)
- Idempotent: re-run says "No pending migrations. 1 already applied."
- `pnpm migrate:status` reports applied vs pending correctly
- `pnpm test` (with DATABASE_URL): 7/7 pass in 49ms
- `pnpm test` (without DATABASE_URL): all 7 cases auto-skip — green
- Root `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm build` all clean
- `gitleaks detect` clean

Will ship as PR #3 stacked on PR #2.

---

## Next up — Sprint 1.1 ReadyBank service skeleton

- `services/readybank` Express + TS workspace
- Pino structured logging, Sentry instrumentation
- `GET /healthz` returns 200 + version + git SHA
- PM2-compatible (port 5101 per B10)
