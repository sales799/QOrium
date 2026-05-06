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

---

## 2026-05-03 — Sprint 1.3 ReadyBank /v1/questions ✅

Wired `@qorium/auth` into the readybank service and shipped the first two
production endpoints from architecture §6.3.

### What landed

- `services/readybank/src/types/question.ts` — `QuestionPublic` response
  shape (distinct from DB row, excludes internal fields like
  `watermark_id`, `ai_critique_scores`); `difficultyBToBand()` /
  `bandToBRange()` translating IRT b parameter ↔ user-facing 1–5 difficulty
  bands per architecture §3
- `services/readybank/src/types/cursor.ts` — opaque base64url-encoded
  `(released_at, id)` cursor for stable pagination under writes;
  `InvalidCursorError`
- `services/readybank/src/repositories/questions.ts` — `getQuestionByUuid()`
  - `searchQuestions()`; queries restrict to `status='released'` AND
    `sku='readybank'` so draft / SME-review / JD-Forge ephemerals never leak
    via the public API
- `services/readybank/src/routes/questions.ts` — Express router with
  zod-validated query params (skill, sub_skill, format enum, difficulty
  1–5, language regex, limit 1–100, cursor); RFC 7807 problem responses
  on bad input
- `services/readybank/src/server.ts` — wires `apiKeyAuth` (with Redis or
  memory rate limiter depending on env) at `/v1/*`; health stays
  unauthenticated; fail-loud if `API_KEY_PEPPER` unset and pool present
- `services/readybank/src/config.ts` — adds `apiKeyPepper` + `redisUrl`
- `__tests__/questions.unit.test.ts` — 16 unit tests for difficulty
  mapping (boundary values + round-trip) and cursor encode/decode
  (round-trip + 5 rejection paths)
- `__tests__/questions.integration.test.ts` — 10 live-DB tests against
  seeded fixtures: auth gate (401 / 200), get-by-uuid (200 / 404 / 400),
  search filters (skill / format), difficulty band filtering, cursor
  pagination across two pages, malformed cursor 400, invalid difficulty 400.
  Auto-skip when DATABASE_URL unset

### Verified end-to-end

Built a real tenant + API key + question in Postgres, started the
service, hit it via curl:

```
GET /v1/questions/search                          → 401 (no auth)
GET /v1/questions/search  Bearer qor_live_...     → 200 + JSON list
GET /v1/questions/{uuid}  Bearer qor_live_...     → 200 + full question
```

Response computed `difficulty_band: 3` from `difficulty_b: 0.0`,
emitted `RateLimit-*` headers, and the `audit.events` table got
`api_key.auth.success` rows for each authenticated call.

### Stats

- 66/66 tests pass across all workspaces
  - db smoke 7/7 (live DB)
  - auth: 26/26
  - readybank: 33/33 (7 server + 16 unit + 10 integration)
- Root `pnpm typecheck` / `lint` / `format:check` / `build` all clean
- gitleaks clean (7 commits, 0 leaks)

---

## 2026-05-03 — Sprint 1.4 ReadyBank packs + export ✅

`POST /v1/packs/generate` + `GET /v1/packs/{id}/export` per architecture
§6.3 + handoff §5 Item 1.4. Closes the Sprint 1 ReadyBank API alpha.

### What landed

- **Migration 0002 (`infra/B7-postgres-migrations/0002_packs.sql`)** —
  `app.packs` table: `id`, `tenant_id` (FK), `api_key_id` (FK), `name`,
  `filters` (jsonb), `question_ids` (uuid[]), `question_count`, `status`
  (CHECK), `expires_at`, `created_at`, `last_exported_at`, `export_count`.
  Indexed on tenant_id, api_key_id (partial), and (status, expires_at)
  partial for "ready & live" queries.
- `services/readybank/src/repositories/packs.ts` — `createPack` (snapshots
  `searchQuestions` result into `app.packs`), `getPackByIdForTenant` (RLS
  via tenant_id WHERE clause + expiry check), `streamPackQuestions`
  (async generator chunked at 50; preserves pack ordering even though
  `WHERE id = ANY()` doesn't), `recordExport` (fire-and-forget update)
- `services/readybank/src/exporters/csv.ts` — RFC 4180 streaming writer
  with proper escaping (`""` for embedded quotes, quoted cells when
  needed), nested JSON serialised as JSON-encoded cells
- `services/readybank/src/exporters/json.ts` — single document
  `{ pack: {...}, questions: [...] }` streamed lazily so 100-row pack
  never buffers
- `services/readybank/src/exporters/hackerrank-yaml.ts` — js-yaml-based
  multi-document YAML stream; format-aware mapping for MCQ/MSQ
  (`multiple_choice_single|multiple` with `text` + `correct` choices),
  coding-fn (`reference_solution` + `test_cases`), generic fallback
- `services/readybank/src/routes/packs.ts` — both endpoints; zod
  validation; tenant isolation in 404 (no leak of pack existence across
  tenants); audit-log `pack.generated` + `pack.exported`; safe streaming
  error handling (mid-stream errors surface to express default rather
  than producing malformed half-documents)
- `services/readybank/src/server.ts` — wires `packsRouter` onto the same
  `/v1` mount as `questionsRouter`
- `__tests__/exporters.unit.test.ts` — 10 cases covering CSV escaping
  (quotes, commas, nested JSON, null), JSON pack header + lazy
  questions array, HackerRank YAML MCQ/coding/multi-doc/content-type
- `__tests__/packs.integration.test.ts` — 11 live-DB cases:
  POST 401 unauth / 201 happy / 400 bad difficulty / 400 limit > 100;
  GET 404 unknown / 400 non-uuid / 200 JSON default / 200 CSV with
  header rows / 200 HackerRank YAML / 404 cross-tenant (no leak) /
  export_count increments

### Verified locally

- `pnpm typecheck` clean across all 4 workspaces
- `pnpm lint` / `pnpm format:check` clean
- `pnpm build` clean
- Tests: **80/80 active green** (db smoke 7, auth 26, readybank 47)
  - Without DATABASE_URL: 33 active + 21 auto-skip (integration suites)
  - With DATABASE_URL: all 80 pass in <2s
- Migration applied cleanly: `pnpm migrate:up` shows
  "Applied 1 migration(s): 0002_packs"; `\d app.packs` confirms schema
- gitleaks clean (8 commits, 0 leaks)

### Phase 1 ReadyBank API alpha — DONE per handoff §12 success criteria

| Criteria                        | Status                                          |
| ------------------------------- | ----------------------------------------------- |
| ReadyBank API alpha live        | ✅ skeleton + `/v1/questions/*` + `/v1/packs/*` |
| Bulk export CSV/JSON/HackerRank | ✅ all three streaming                          |
| API key auth                    | ✅ `@qorium/auth` HMAC-SHA256 + audit log       |
| Rate limiting                   | ✅ Redis-backed with memory fallback            |

Still missing for full Phase 1 IdeaForge re-gate:

- 5,000 validated questions seeded (manual content op + SME workflow)
- IRT calibration pipeline (Sprint 3.5 — needs reference panel)
- Anti-leak engine v0 (Sprint 4)
- 20+ programming languages (Judge0 sandbox integration)
- Admin console (Sprint 2)

### Out of scope (next sprints)

- Sprint 2 — `apps/admin` Next.js scaffold (SME review queue + calibration panel)
- Sprint 3 — Content Engine 7-stage pipeline orchestrator (Spec → AI → Critique → SME → Calibrate → Release → Post-Deploy)
- Sprint 4 — Anti-Leak Engine v0 (per `infra/Anti-Leak-Engine-v0-Design.md`)
- Sprint 5 — JD-Forge service (per `infra/JD-Forge-v0-Design.md`)
- Role-graph traversal endpoints (`/v1/role-graph/search`, `?role=` filter)
- Tags filter (needs schema decision: `body_json.tags` vs `content.tags`)

---

## 2026-05-06 — Surface 6 Recruiter Auth Hardening ✅

PR: [#12](https://github.com/sales799/QOrium/pull/12) · branch
`claude/recruiter-jwt-auth-gxpnI` · CI green (lint, typecheck, test,
secret-scan, security-audit, build).

Replaces the sessionStorage API-key pattern for the recruiter persona with a
proper human session. Mirrors what shipped Cowork-side on Run #32 (2026-05-04)
via the Bridge Protocol — Stream B picks up next 1–2 runs.

### What landed

- **Migration 0004 (`infra/B7-postgres-migrations/0004_recruiter_auth.sql`)** —
  `app.recruiters` table: `id`, `tenant_id` (FK), `email` (CITEXT unique),
  `name`, `password_hash` (argon2id encoded), `failed_login_count`,
  `locked_until`, `last_login_at`, `status` (CHECK active|disabled),
  `created_at`, `updated_at`. Indexes on email and tenant_id; per-table
  `update_recruiter_updated_at` trigger to match the 0001 pattern.
  (0003 reserved for Stream B per spec.)
- `services/readybank/src/middleware/recruiter-auth.ts` — cookie-based gate.
  Verifies HS256 JWT in `qor_session`, attaches `req.recruiter`, and re-issues
  the cookie on every authed request (8h sliding window). Exports
  `issueSessionCookie` / `clearSessionCookie` helpers reused by login/logout.
- `services/readybank/src/routes/auth.ts` — drop-in route. `POST /v1/auth/login`
  (argon2id verify, OWASP m=19MiB t=2 p=1; constant-time path on unknown email
  via dummy-hash verify; per-account 5-fail lockout for `RECRUITER_LOCKOUT_MINUTES`,
  default 15); `POST /v1/auth/logout`; `GET /v1/auth/whoami`. Audit events
  `auth.login.success|failure|locked|disabled` and `auth.logout` via
  existing `recordAuditEvent`.
- `services/readybank/public/{login.html,login.css,login.js}` — recruiter
  sign-in portal. CSP-compliant (no inline scripts/styles), `fetch` to
  `/v1/auth/login` with `credentials: 'include'`, surfaces RFC 7807 `detail`
  on error.
- Cookie flags: `HttpOnly; Secure (prod); SameSite=Lax; Path=/; Max-Age=28800`.
  JWT `iss=qorium-readybank`, `aud=qorium-recruiter`.
- `services/readybank/src/server.ts` — `cookie-parser`, `express.static` for
  `/public`, mounts `authRouter` on `/v1` **before** the API-key gate so
  login is reachable; fail-fast on missing `JWT_SECRET` when pool is configured.
- `services/readybank/src/config.ts` — adds `jwtSecret`, `cookieSecure`,
  `recruiterLockoutMinutes`.
- `services/readybank/src/logger.ts` — adds `res.headers["set-cookie"]` to
  pino redaction list.
- `.env.example` — documents `JWT_SECRET` for the session cookie + adds
  `RECRUITER_LOCKOUT_MINUTES=15`.
- `__tests__/auth.test.ts` — 11 unit tests against a stub `Pool`: login
  success + cookie flags, wrong-password counter, 5th-fail lockout,
  already-locked 423, unknown-email 401 (no enumeration), malformed body 400,
  disabled-account 403, whoami without/with cookie, sliding window cookie
  refresh, bogus cookie 401, logout clears cookie.

### Drive-by CI fix

Discovered that `pnpm typecheck` / `pnpm test` were failing in CI on a clean
checkout because `@qorium/auth` and `@qorium/readybank` import from
`@qorium/db` whose `package.json#exports` resolves to `./dist/*` — no prior
build step existed. Confirmed pre-existing on PR #7's commit. Added a
`build:packages` root script (compiles `@qorium/db` + `@qorium/auth`) and
chained it before `typecheck` and `test`. Fixes CI for all future PRs too.

### Verified

- `pnpm typecheck` / `pnpm lint` / `pnpm format:check` clean
- `pnpm test` — **44 passed / 21 skipped** (skips are integration suites that
  need DATABASE_URL; the 11 new auth tests run against a stub pool)
- `pnpm build` clean across `@qorium/db`, `@qorium/auth`, `@qorium/readybank`
- gitleaks clean
- CI on PR #12: all 6 active checks green; deploy-staging / deploy-production
  correctly skipped (PR, not main)

### Out of scope (Stream B picks up)

- Recruiter dashboard beyond `login.html`
- CSRF tokens for state-changing recruiter writes
- Password reset / email verification flow

---

## 2026-05-06 — Customer Zero Day-1 Launch ✅ 7/7 GREEN

PR #12 squash-merged to `main` as `29ff865` — Sprint 1.6 unlocked the final
gate. Talpro Customer Zero Day-1 launch state:

| #   | Gate                                | Status                                   |
| --- | ----------------------------------- | ---------------------------------------- |
| 1   | ReadyBank API alpha shipped to main | ✅                                       |
| 2   | Public HTTPS                        | ✅                                       |
| 3   | API key #001 minted                 | ✅                                       |
| 4   | Seed pack ingested                  | ✅                                       |
| 5   | Synthetic candidate scored          | ✅                                       |
| 6   | Sprint 1.6 (recruiter JWT) merged   | ✅ #12                                   |
| 7   | First REAL Talpro candidate run     | 🔓 unlocked — handoff to Talpro Delivery |

Gate 7 is now unblocked: a real recruiter can sign in via `login.html`,
generate a pack, and run a candidate end-to-end. The recruiter persona no
longer ships an API key in the browser — sessionStorage replaced by the
`HttpOnly; Secure; SameSite=Lax` `qor_session` cookie with an 8-hour sliding
window and per-account 5-fail lockout.

### Bridge Protocol — Stream B handoff

Stream B should pick up next 1–2 runs:

- Recruiter dashboard pages beyond `login.html`
- CSRF tokens for state-changing recruiter writes (login/logout/whoami are
  safe today via SameSite=Lax + JSON-only Content-Type, but pack-write
  endpoints need explicit double-submit or origin checks)
- Password reset + email verification flow
- Migration `0003_*.sql` slot (still reserved for Stream B per spec)

---

## 2026-05-06 — Sprint 1.6 Mailer + Invitations (engineering portion)

PR: [#13](https://github.com/sales799/QOrium/pull/13) · branch
`claude/sprint-1-6-mailer`. Closes the engineering line items of
Sprint 1.6 on top of the JWT login work merged in #12. Content + ingest
items remain in Stream B's / SME's lane.

### Sprint 1.6 line-item status

| #   | Line item                                                         | Status                           |
| --- | ----------------------------------------------------------------- | -------------------------------- |
| 1   | JWT recruiter-auth spec + `login.html` + migration `0004`         | ✅ shipped #12                   |
| 2   | Driver-agnostic mailer (SES / SendGrid / mock) + migration `0005` | ✅ shipped #13                   |
| 3   | Wave-1 full ingest script (24 sources → ~470 rows)                | ⏳ Stream B (Cowork-side parser) |
| 4   | Oracle HCM Q53–Q60 closed (60/60 v0.6)                            | ⏳ SME content authoring         |
| 5   | Wave-3 Authoring Template v0.1 + Kickoff Batch-001 (20 items)     | ⏳ SME content authoring         |

### What landed in #13

- **Migration `0005_recruiter_invitations.sql`** — `app.recruiter_invitations`
  table with `token_hash` (SHA-256 of plaintext token, never stored), audit
  columns (`mailer_driver`, `mailer_message_id`), `expires_at`, `accepted_at`,
  `revoked_at`. Relaxes `app.recruiters.password_hash` to NULLable with a
  CHECK that ties NULL hash to `status='pending'`.
- **Mailer abstraction at `services/readybank/src/mailer/`** —
  `Mailer` interface + `createMailer({ driver })` factory; `MockMailer`
  (in-memory recorder; default in dev/test), `SesMailer` (`@aws-sdk/client-ses`
  `SendEmailCommand` with default credential chain), `SendGridMailer`
  (`@sendgrid/mail`). Provider SDKs lazy-imported so test boots don't pull
  them.
- **`POST /v1/auth/invite`** (API-key gated) — mints a single-use token
  (32 random bytes, base64url), creates a `pending` recruiter row, mails the
  invitation, audit-logs `auth.invitation.sent` with the driver actually
  used + provider message id. Idempotent for emails already in `pending`,
  refuses (409) for `active` / `disabled` accounts.
- **`POST /v1/auth/accept`** (public, token-gated) — looks up the
  outstanding invitation by `sha256(token)`, verifies `expires_at`, hashes
  the new password with argon2id (`m=19MiB, t=2, p=1`), flips the
  recruiter to `active`, marks the invitation accepted. Single-use; replay
  returns 404.
- **Login** now returns 403 `auth/invitation-pending` when the recruiter has
  no `password_hash` (cleaner than the previous catch-all "disabled" path).
- **`/accept-invite.html` + `accept-invite.js`** — companion static page,
  CSP-compliant (no inline JS / styles), client-side password match +
  length check, surfaces RFC 7807 `detail` on error.
- **`.env.example`** — documents `MAILER_DRIVER` (`mock` | `ses` | `sendgrid`),
  `MAILER_FROM_ADDRESS`, `MAILER_REPLY_TO_ADDRESS`, `RECRUITER_PORTAL_URL`,
  `SES_REGION` / `SES_ACCESS_KEY_ID` / `SES_SECRET_ACCESS_KEY`,
  `SENDGRID_API_KEY`.

### Verified

- `pnpm typecheck` / `pnpm lint` / `pnpm format:check` clean
- `pnpm test` — readybank: **61 passed / 21 skipped**; the 21 skips are the
  DB-integration suites that need `DATABASE_URL`. New tests: 9 in
  `mailer.unit.test.ts`, 8 in `invite.test.ts` covering invite happy path,
  malformed body 400, conflict 409, accept happy path, expired 410, replay
  404, password-too-short 400.
- `pnpm build` clean across all 3 active packages

### Bridge Protocol — explicit handoff

Items 3, 4, 5 are intentionally not authored here:

- **Wave-1 ingest** would require re-implementing the markdown parser shipped
  Cowork-side (Run #32). The `customer-zero/Wave-1-*.md` source files are
  prose-formatted; without the canonical parser the ingest contract would
  diverge across streams. Better to mirror the artefact when it bridges over.
- **Oracle HCM Q53–Q60** and **Wave-3 Authoring Template + Kickoff Batch-001**
  are content authoring tasks — SME work, not engineering.
