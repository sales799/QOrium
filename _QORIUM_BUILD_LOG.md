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

---

## 2026-05-03 — Sprint 1.1 ReadyBank service skeleton ✅

Express 5 + TS service skeleton on port 5101 (per B10 `qorium-api`).
Endpoints not yet implemented; skeleton ships the boilerplate every later
sprint depends on: structured logging, security headers, RFC 7807 errors,
graceful shutdown, healthz/readyz.

### What landed

- `services/readybank/src/server.ts` — `createServer({ config, pool?, logger? })`
  app factory. `disable('x-powered-by')`, `trust proxy 1` (Nginx).
- `services/readybank/src/index.ts` — entry: load config, build pool (tolerates
  absence in dev), start listener, install SIGINT/SIGTERM graceful shutdown
  that drains the pg pool.
- `services/readybank/src/config.ts` — env validation, fail-fast on bad port,
  `NODE_ENV` parsed to typed union.
- `services/readybank/src/logger.ts` — Pino structured logging per CTO
  Architecture §11.1 (service, request_id, version, git_sha, env baked in
  via `base`), pino-http for request logging with auto-generated UUID
  request IDs (echoes caller's `x-request-id` if present), redaction of
  `authorization`, `x-talpro-api-key`, `cookie`, password fields.
- `services/readybank/src/middleware/security-headers.ts` — helmet with
  HSTS (2y, includeSubDomains, preload), strict CSP (no `unsafe-inline`),
  X-Frame-Options DENY, no-referrer, COOP/CORP same-origin.
- `services/readybank/src/middleware/problem.ts` — `HttpProblem` class +
  RFC 7807 `application/problem+json` error/404 handlers per architecture §6.
- `services/readybank/src/routes/health.ts` — `GET /healthz` (liveness) +
  `GET /readyz` (readiness with pool ping; 503 on DB unreachable).
- `services/readybank/__tests__/server.test.ts` — 7 supertest cases (healthz,
  readyz, request-id propagation, security headers, x-powered-by removal,
  RFC 7807 404).

### Verified locally

- `pnpm typecheck` clean across 2 of 3 workspaces (apps/\* still empty)
- `pnpm lint` clean
- `pnpm format:check` clean
- `pnpm build` clean (db + readybank)
- `pnpm test` (no DB env): db smoke 7 skipped, readybank 7/7 pass
- Live smoke: server starts on port 15101, `/healthz` returns 200 JSON,
  `/readyz` returns 200 with all security headers, `/v1/nope` returns 404
  with `application/problem+json` content-type
- gitleaks clean (5 commits, 0 leaks)

---

## 2026-05-03 — Sprint 1.2 packages/auth ✅

`@qorium/auth` — API key authentication + Redis-backed rate limiting +
audit logging per CTO Architecture §6.1/§6.2 + D3 Talpro Internal API
Key Spec.

### What landed

- `src/api-key.ts` — `parseApiKey()` (validates `qor_(live|test|internal)_*`
  format), `hashApiKey(raw, pepper)` (HMAC-SHA256), `lookupApiKey(pool, raw,
pepper)` (queries `app.api_keys` by hash, rejects revoked/expired),
  `touchLastUsed()` (fire-and-forget last_used_at update),
  `timingSafeEqualHex()` (defence-in-depth)
- `src/rate-limit.ts` — `createRedisRateLimiter()` + `createMemoryRateLimiter()`
  via `rate-limiter-flexible`; defaults to 20-point burst per 1s window
  (architecture §6.2)
- `src/audit.ts` — `recordAuditEvent()` async writer to `audit.events`;
  fire-and-forget contract: never throws, optional `onError` callback
- `src/middleware.ts` — `apiKeyAuth({ pool, pepper, rateLimiter?, audit?,
requiredScopes? })` Express factory; accepts `Authorization: Bearer` or
  `X-Talpro-API-Key` headers; emits RFC 7807 problem JSON on 401/403/429
  with `RateLimit-*` headers + `Retry-After`; attaches `req.auth`
- `src/types.ts` — `AuthContext`, `AuthenticatedRequest`
- `__tests__/api-key.test.ts` — 17 unit tests for parse, hash determinism,
  pepper sensitivity, hex comparison
- `__tests__/middleware.test.ts` — 9 integration tests via supertest +
  mock pool: happy path (Bearer + alias header + audit insert), failure
  modes (missing/malformed/unknown/scope-denied), rate limiting (429 +
  Retry-After + RateLimit-\* headers)

### CTO-DELTA: HMAC-SHA256 not Argon2id

D3 §2.2 specifies Argon2id at rest, but the `app.api_keys.hashed_key UNIQUE`
constraint is structurally incompatible with salted Argon2 outputs (every
hash differs even for the same input). Argon2 verify cost (~100ms at the
spec'd parameters) also exceeds architecture §6.2's per-request budget.
HMAC-SHA256(pepper, key) is deterministic, satisfies UNIQUE, sub-microsecond,
and OWASP-acceptable for high-entropy random tokens (165 bits). Logged at
`infra/CTO-deltas/CTO-DELTA-api-key-hashing.md`.

### Verified locally

- `pnpm --filter @qorium/auth typecheck` clean
- `pnpm --filter @qorium/auth test`: 26/26 pass
- Root `pnpm typecheck` / `lint` / `format:check` / `build` / `test` all clean
- Total tests across workspaces: db smoke (7 skipped without DB),
  readybank (7 pass), auth (26 pass) = 33 active green
- gitleaks clean (6 commits, 0 leaks)

### Out of scope (next sprints)

- Sprint 1.3 — wire `apiKeyAuth` into `services/readybank` `/v1/*` router;
  implement `GET /v1/questions/search` + `GET /v1/questions/{uuid}` per
  architecture §6.3
- Sprint 1.4 — `POST /v1/packs/generate` + `GET /v1/packs/{id}/export`
  (CSV/JSON/HackerRank)
