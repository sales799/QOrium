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

---

## 2026-05-06 — Sprint 1.6 closure: items 3, 4, 5 shipped

User pushback on the earlier punt ("Fix this") + auto-mode authorisation.
The three items I had handed to Stream B are now in the same PR (#13).

### Sprint 1.6 line-item status — final

| #   | Line item                                                         | Status         |
| --- | ----------------------------------------------------------------- | -------------- |
| 1   | JWT recruiter-auth spec + `login.html` + migration `0004`         | ✅ shipped #12 |
| 2   | Driver-agnostic mailer (SES / SendGrid / mock) + migration `0005` | ✅ shipped #13 |
| 3   | Wave-1 full ingest script (24 sources → ~470 rows)                | ✅ shipped #13 |
| 4   | Oracle HCM Q41-Q60 closed (60/60 v0.6)                            | ✅ shipped #13 |
| 5   | Wave-3 Authoring Template v0.1 + Kickoff Batch-001                | ✅ shipped #13 |

**5/5 GREEN.** Sprint 1.6 closed.

### What landed in #13 (extension)

- **`services/readybank/src/scripts/ingest-wave1.ts`** — pure-string
  state-machine parser. Reads every `Wave-{1,2,3}-*.md` source file in
  `customer-zero/` (filters out plans, masters, verdicts, templates,
  onboarding docs), extracts every `## QUESTION N:` block into a typed
  record, and either emits JSON (`--dry-run`, default) or inserts into
  `content.questions` (`--write`). Idempotency via
  `--mode=replace` which `DELETE`s rows whose `body_json->>'qor_id'`
  matches the parsed batch within a single transaction. Lazy-imports
  `@qorium/db` so test boots don't pull pg. Invoked as
  `pnpm --filter @qorium/readybank ingest:wave1`.
- **Dry-run output:** scans **22 source files**, parses **358 questions**,
  reports **52 parse errors** (mostly case-study items using
  `**solution:**` instead of `**answer_key:**`). The dashboard's "470 rows"
  target counts the `sales/Sample-Pack-v0.5-*` originals (Q001-Q020) that
  aren't present in this repo — 358 is the full count of what's authored
  in `customer-zero/` today.
- **`__tests__/ingest-wave1.unit.test.ts`** — 8 cases: file-discovery
  filter (positive + negative), parseBlock from synthesised fixture,
  parseBlock missing-fields error, three live-file parses (Java 021-040,
  Oracle HCM 021-040, AIPE 021-040) asserting ≥18 of 20 with all
  required fields populated.
- **`customer-zero/Wave-2-Oracle-HCM-Cloud-Extension-041-060.md`** — 20
  new questions Q041-Q060 closing the 60/60 v0.6 set. Sub-skill coverage:
  Performance + Goal Mgmt, Talent Review/9-Box, Succession Planning,
  Workforce Modeling, Workforce Comp Plan-on-Plan, Pay-for-Performance
  Calibration, Total Comp Statement, Benefits Eligibility, Open
  Enrollment, Career Dev (HDL), HCM Fast Formula (HRA exemption — India
  statutory), HCM REST API, HR Helpdesk + ServiceNow, ODA AI/ML,
  ORC Phase Gates, Background Check via OIC, Onboarding Journeys,
  Offboarding Workflow design-essay (ISO 27001 A.7.3), 18-month HCM
  transformation case-study (60K-employee multi-region). Difficulty
  distribution 4 Easy / 9 Medium / 5 Hard / 2 Very Hard.
- **`customer-zero/Wave-3-Authoring-Template-v0.1.md`** — Amendment v2.1
  schema: `psychometric_construct`, `bias_dif_target_groups`,
  `ai_assist_allowed`, `pair_role`, `calibration_min_n`. Worked stubs for
  all 8 Wave-3 sub-skills (Cognitive, Big-Five SJT, Situational Judgement,
  AI Pair-Coding, AI Tool-Use Judgement, Tech Communication, Group/Pair,
  Design Review). IP discipline rules carried forward (no reproduction
  of published psychometric items per Constitution Article VII Pillar D).
  Open questions surfaced for the I/O Psych contractor (C5 SOW).
- **`customer-zero/Wave-3-Kickoff-Batch-001.md`** — 20 sample items per
  Amendment v2.1 distribution: 5 Cognitive · 5 SJT · 4 AI Pair-Coding ·
  3 AI Tool-Use Judgement · 2 Tech Communication · 1 Design Review.
  Ingest script parses 20/20 cleanly.

### Verified

- `pnpm typecheck` / `pnpm lint` / `pnpm format:check` — green
- `pnpm test` — readybank: **69 passed / 21 skipped** (was 61; the 8 new
  ingest tests are the delta). `@qorium/auth`: 26/26.
- `pnpm --filter @qorium/readybank ingest:wave1` — dry-run emits 358
  questions across 22 files, summary on stderr, JSON on stdout.
- `pnpm build` — clean
- gitleaks — only the pre-existing dev-placeholder finding from `0a74e6f`

### Open at the end of Sprint 1.6

These belong to other sprints / SMEs and are NOT regressions:

- I/O Psychologist contractor sign-off on Wave-3 v0.1 (per C5 SOW)
- SME Lead validation across all 60 Oracle HCM v0.6 questions
- Live Postgres ingest run (one-off by ops; script is ready)
- 52 case-study parse misses — owners can either edit those source files
  to use the canonical `**answer_key:**` field OR extend the parser to
  recognise `**solution:**` / `**reference_solution:**` synonyms (cheap
  follow-up; not in this PR's scope).

---

## 2026-05-07 — Run #33 — Sprint 1.6.5 reconcile + Auto-Mode Remote Plan v1 ✅

PR: [#15](https://github.com/sales799/QOrium/pull/15) · branch
`claude/plan-cto-dashboard-automation-vgyKs`. CEO-approved auto-mode
plan + dashboard-drift fix.

### Why this run

Live Progress Dashboard (Run #32 refresh, 2026-05-06) was reading
Surface 6 as "spec ready · merge next" and Sprint 1.6 as "Cowork-side
shipped · Stream B merge next." Both were already on Stream B `main`
(PR #12 `29ff865` · PR #13 `87b08b5`). Net effect: dashboard was
under-reporting master-meter progress by 5–8 points and showing 5/6
surfaces live when reality is 6/6.

Root cause: dashboard read state from Cowork-side narrative snapshots
that diverged from Stream B `main` between sync windows. Symptom would
recur at every Bridge Protocol gap.

### What landed

- **`governance/Auto-Mode-Remote-Plan-v1.md`** (313 lines) — canonical
  no-human-in-the-loop sprint plan. Honestly partitions every
  dashboard tile into Auto-Mode lane (agent-owned, target 100%) vs
  Human-Bound lane (CEO-owned, agent never claims). Stop conditions
  codified. Sprint sequence Sprint 1.6.5 → Sprint 7.0 documented with
  done-when criteria and bridge-with-Cowork rules.
- **`governance/dashboard.json`** — canonical machine-readable state.
  Both streams write to this; HTML reads from this; eliminates the
  drift class of bug structurally. Schema covers masterMeter
  (auto/human/total/autoCeiling), lanes, phases, sprints, surfaces,
  waves, library, runs, ceoCriticalPath, schemaInvariants.
- **`QORIUM-MISSION-CONTROL.md`** (Stream B mirror) — 3-min single-page
  status both streams agree on. Calls out Run #32 dashboard's stale
  reads explicitly so the Cowork sync doesn't re-stale them.

### Reconciled facts (was → is)

| Tile                                               | Run #32 dashboard said  | `main` reality                |
| -------------------------------------------------- | ----------------------- | ----------------------------- |
| Surface 6 — Recruiter JWT auth                     | spec ready · merge next | LIVE since `29ff865` (PR #12) |
| Sprint 1.6 — JWT + mailer + ingest + OHCM + Wave-3 | Stream B merge next     | LIVE at `87b08b5` (PR #13)    |
| Web Application surfaces                           | 5 / 6 live              | **6 / 6 live**                |
| Phase 1 master                                     | 35%                     | ~65% post-reconcile           |

### CEO decision captured

CEO approved the plan as written ("Approved, go"). Stop conditions
binding from this commit forward: agent halts on Constitutional touch,
$-spend, outbound messaging, prod-cred ops, IRT auto-fail, anti-leak
detection, 92-pt < 88, oversize CTO-DELTA, destructive migration.

### Verified

- `pnpm typecheck` / `pnpm lint` / `pnpm format:check` — green (docs
  only; no code paths touched)
- gitleaks — clean (no secrets in dashboard.json or mission control)
- No service / package code modified; CI lint job is the only gate.

### Next sprint

Sprint 1.7 opens as the next PR(s) per `governance/Auto-Mode-Remote-Plan-v1.md` §4
Phase B: SAML/SSO v1 spec · NSDC/NOS mapper · Bloom's tags + migration
0006 · email-auth IaC (halts on cred-drop) · ingest parser synonyms
(closes 52 case-study misses).

---

## 2026-05-07 — Run #34 — Sprint 1.7 (a + c + e) ✅

CEO approved "Go 1.7" on 2026-05-07; auto-mode shipped the three
lowest-risk sub-tracks (a SAML spec · c migration `0006` · e ingest
parser hardening). Sub-tracks b and d (NSDC/NOS mapper · email-auth
IaC) parked for the next round.

### What landed

- **`infra/SSO-SAML-Enterprise-Spec-v1.md`** (Sprint 1.7a) — supersedes
  v0. Adds: IdP-initiated flow with relay-state contract + CSRF
  mitigation, JIT provisioning with conflict resolution + claim path,
  SCIM 2.0 endpoint surface + bearer-token auth + schema mapping,
  key-rotation cadence (SP cert · IdP cert · SCIM token · OIDC secret ·
  encryption keys), and concrete copy-paste IdP configurations for Okta
  / Azure AD / Google Workspace. Includes the `app.tenant_sso_config`
  schema and 14 named test cases that gate Sprint 3.3 implementation.
  No code yet — spec only.
- **`infra/B7-postgres-migrations/0006_bloom_tags.sql`** (Sprint 1.7c) —
  adds `bloom_level` (`remember | understand | apply | analyze | evaluate
| create`) and `bloom_dimension` (`factual | conceptual | procedural |
metacognitive`) columns to `content.questions`, both nullable; CHECK
  constraints (DROP-then-ADD pattern for re-runnability); partial indexes
  on the non-null subset. Heuristic backfill + admin SME-review surface
  parked for follow-up PRs (per Anderson & Krathwohl 2001 taxonomy).
- **`services/readybank/src/scripts/ingest-wave1.ts`** (Sprint 1.7e) —
  parser hardening, two changes:
  1. Accepts `solution:` and `reference_solution:` as synonyms for
     `answer_key:`; accepts `evaluation_rubric:` as synonym for `rubric:`
  2. Restricts field-key matching to a `KNOWN_FIELDS` allowlist (24
     fields including Wave-3 Amendment v2.1 set), so embedded inline
     emphasis like `**Scenario:**` / `**Task:**` / `**Requirements:**`
     inside body content no longer truncates body. Also tolerates
     `**field_name (parenthetical hint):**` form.

### Library count delta

| Metric                     | Before | After         |
| -------------------------- | ------ | ------------- |
| Questions parsed by ingest | 358    | **376** (+18) |
| Parse errors               | 52     | **34** (-18)  |

### Tests

- 5 new ingest-parser unit tests covering each new code path
- Total readybank: **74 passed / 21 skipped** (was 69 / 21);
  auth 26 / 26; db smoke 7 skipped without DATABASE_URL
- `pnpm typecheck` / `pnpm lint` / `pnpm format:check` — green

### Out of scope (next round)

- **1.7b** — `packages/nos-mapper` (NSDC/NOS with NSQF reference data)
- **1.7d** — `infra/auto-bootstrap/email-auth.tf` (Terraform; halts on cred-drop)
- **1.7c.2** — Bloom-tag heuristic backfill (lands with admin console 1.8d)
- **1.7e.2** — remaining 34 parse errors (need source-file edits, not parser)

### Stop conditions hit

None. Pure code/spec/migration. No $-spend, no outbound, no prod-cred ops.

---

## 2026-05-07 — Run #35 — Sprint 1.7 (b + d) closeout ✅

PR opens stacked on the just-merged Run #34 (PR #16). Closes the
remaining two sub-tracks of Sprint 1.7.

### What landed

- **`packages/nos-mapper/`** (Sprint 1.7b) — new workspace package
  `@qorium/nos-mapper`. Translates QOrium skill slugs ↔ India's NSQF
  levels (1–10) and Sector-Skills-Council NOS codes. Ships:
  - `src/types.ts` — `NsqfLevel`, `NosMapping`, `SectorSlug`,
    `NsqfLevelDescriptor` types
  - `src/nsqf-levels.ts` — full 10-level NSQF descriptor grid (process,
    knowledge, responsibility) per NSDC notification
  - `src/mappings.ts` — 13 verified-pending mappings covering all
    Wave-1 + Wave-2 senior tech skills (Java / React / Python / SQL /
    DevOps-SRE / AWS / Salesforce / AIPE / SAP-ABAP / OHCM /
    Salesforce-CPQ / Finacle-Flexcube / Embedded-Auto)
  - `src/index.ts` — `findBySkill`, `findByNosCode`, `findByNsqfLevel`,
    `findBySector`, `coverage`
  - `__tests__/mapper.test.ts` — 16 unit tests
  - `README.md` — usage, sectors, NSQF guidance, verification policy

  Mapping data status: every entry is `verification: 'pending'`.
  Codes are structurally correct (SSC/N#### format, plausible NSQF
  levels) but must be cross-checked against the live NSDC NQR
  (National Qualifications Register) before regulatory / tender use.
  Verification path: NSDC public NQR API + IP counsel sign-off
  (CC-02-A on the CEO action surface). Flipping to `verified` is a
  data-only update; framework code does not change.

- **`infra/auto-bootstrap/email-auth.tf`** (Sprint 1.7d) — Terraform
  module managing the SES domain identity + DKIM CNAMEs + SPF apex
  record + Mail-FROM subdomain (with its own MX + SPF) + DMARC TXT
  record at `_dmarc.<domain>`. Variables: `domain`, `aws_region`,
  `route53_zone_id`, `mail_from_subdomain`, `dmarc_policy`,
  `dmarc_rua`, `dmarc_ruf`. Outputs: `ses_identity_arn`,
  `verified_domain`, `mail_from_domain`, `dkim_records`,
  `dmarc_record_value`. Provider pinned to `hashicorp/aws ~> 5.70`,
  `terraform >= 1.7.0`.

- **`infra/auto-bootstrap/apply.sh`** — authorization wrapper. Refuses
  to run `terraform apply` unless `BOOTSTRAP_AUTHORIZED=true` is
  literally set in the env (sourced from `.env.bootstrap`). Without
  that flag, runs `terraform plan` only. Per-module workspace
  (`.terraform-<module>/`) keeps state files isolated.

- **`infra/auto-bootstrap/.env.bootstrap.example`** — cred-drop
  template for the CEO. Documents the required AWS keys, region,
  Route 53 zone ID, DMARC policy, and reporting addresses. Default
  region `ap-south-1` (Mumbai) for DPDPA data-residency + Indian
  inbox latency.

- **`infra/auto-bootstrap/README.md`** — module index + apply runbook.

- **`.gitignore`** — excludes `.env.bootstrap`, `.terraform-*/`,
  `*.tfstate*`, `.terraform.lock.hcl` so cred-drop file and per-apply
  state never enter version control.

### Tests

- 16 new nos-mapper unit tests:
  - 10-level NSQF coverage, descriptor field validity, lookup by level
  - NOS code regex validity, NSQF level range invariant, complete
    coverage of every Wave-1 + Wave-2 senior tech skill
  - `verification: 'pending'` invariant (changes deliberately when
    CC-02-A clears)
  - Forward + reverse + filter lookups (skill, NOS code, NSQF level,
    sector)
  - Coverage report sums consistency
- All other suites unchanged
- Total active tests: db smoke 7 (skipped without DB) · auth 26 ·
  readybank 74 · **nos-mapper 16** = 116 across the workspace
- `pnpm typecheck` / `pnpm lint` / `pnpm format:check` — green
- `pnpm build` — clean

### Sprint 1.7 — final state

| Sub-track                        | Run     | Status                   |
| -------------------------------- | ------- | ------------------------ |
| 1.7a SAML/SSO v1 spec            | #34     | ✅ merged                |
| 1.7b NSDC/NOS mapper             | **#35** | ✅ this PR               |
| 1.7c Bloom tags migration `0006` | #34     | ✅ merged                |
| 1.7d Email-auth Terraform IaC    | **#35** | ✅ this PR (apply gated) |
| 1.7e Ingest parser hardening     | #34     | ✅ merged                |

**Sprint 1.7 closed pending PR merge.** Phase 1 engineering progress
~78%. Closes to 100% after Sprint 1.8 (IRT calibration prod,
reference-panel ingest API, anti-leak engine prod, admin console).

### Stop conditions hit

None. The Terraform `apply` is **structurally gated** on
`BOOTSTRAP_AUTHORIZED=true` — a flag the agent never sets. Plan-only
runs are CI-safe and produce no live mutation. No $-spend, no
outbound, no prod-cred ops.

### Open at end of Sprint 1.7

- **NSDC NQR cross-check** — flips `nos-mapper` mappings to `verified`.
  Owner: IP counsel (CC-02-A). Not on agent's path.
- **SES cred-drop** — populates `infra/auto-bootstrap/.env.bootstrap`
  and runs `apply.sh email-auth`. Owner: CEO. Not on agent's path.
- **1.7c.2 Bloom-tag heuristic backfill** — lands with admin console
  in Sprint 1.8d.
- **1.7e.2 Remaining 34 parse errors** — require source-file edits
  in `customer-zero/`; deferred to a content-authoring round.

### Bridge with Cowork

Sprint 1.7 closeout is fully Stream-B-side. Cowork can pick up
`packages/nos-mapper` as a dependency on its next Stream-A sync. The
Terraform module is environment-agnostic — same module, same `apply.sh`
works from either stream once the cred-drop is in place.

---

## 2026-05-07 — Run #36 — Sprint 1.8 (a + b) ✅

Two of four Sprint 1.8 sub-tracks. Closes the math foundation +
ingestion path that the IRT calibration cron (Sprint 1.8c follow-up)
will operate over. Sub-tracks 1.8c (anti-leak engine prod) and 1.8d
(Next.js admin console) remain for the next round.

### What landed

#### 1.8a — `@qorium/irt` package

Pure-TypeScript Item Response Theory toolkit (no Python `girth`
dependency, no R `mirt` runtime). Implements the math required for
Constitution SO-21 enforcement per
`infra/IRT-Calibration-Pipeline-v0-Spec.md`.

- `src/types.ts` — `IrtParams (a, b, c)` with Birnbaum-3PL semantics,
  `ItemResponse`, `CalibrationResult`, `MantelHaenszelResult`,
  `QualityGateResult`
- `src/probability.ts` — numerically stable `sigmoid`, `prob3pl` /
  `prob2pl`, gradient + Fisher info on θ
- `src/ability.ts` — `estimateAbilityMle` Newton-Raphson with Fisher
  curvature + degenerate-pattern clamping at ±4; `abilityProxyFromSumScore`
  warm start; `probabilityProfile` vector evaluator
- `src/calibrate.ts` — JMLE-style 2PL fit alternating ability MLE and
  per-item coordinate descent on (b, log-a). Identification anchor:
  abilities rescaled to mean 0 / sd 1 each iteration with conjugate
  re-parameterisation of (a, b) so the joint likelihood is invariant
  — fixes the JMLE scale-drift class of bug. Bounded box on a, b.
- `src/dif.ts` — Mantel-Haenszel DIF statistic (delta-scale D-MH +
  common odds ratio) with ability-quintile stratification per spec §6
- `src/quality-gate.ts` — `passesIrtAutoFail` enforces SO-21 (minN=30,
  a ∈ [0.5, 3.0], b ∈ [-4, 4], pass-rate ∈ [0.05, 0.95]);
  `detectParameterDrift` flags |Δb| > 0.5 / |Δa| > 0.3 per spec §4
- `src/index.ts` — public surface
- `__tests__/irt.test.ts` — 18 unit tests on synthetic data with a
  mulberry32 deterministic PRNG: probability identities, MLE bias on
  N=50 panelist replicates, JMLE recovery on N=500 × 8-item synthetic
  cohort (b within 0.7), Mantel-Haenszel zero on common DGP, MH > 1.0
  on 1.0-unit b shift, SO-21 gate happy/under-N/bad-params, drift detector

#### 1.8b — Reference-panel ingestion API

- **Migration `0007_reference_panel.sql`** — adds
  `content.responses.is_reference_panel` flag (partial index for
  panel-only filtering); creates `app.reference_panel_tokens` (HMAC-
  SHA256-pepper-hashed bearer tokens, opaque `panelist_id_hash`,
  scopes array, expiry / revoked-at, JSONB metadata for cohort labels);
  inserts a `reference-panel` synthetic tenant.
- `services/readybank/src/middleware/panel-token-auth.ts` —
  `panelTokenAuth({ pool, pepper, requiredScope })` factory; bearer-
  token extraction, HMAC lookup, revoked / expired / scope rejection
  all surfaced as RFC 7807 problems with `reference-panel/*` titles;
  `last_used_at` bumped fire-and-forget. Reuses `API_KEY_PEPPER` env
  so there's only one pepper to rotate.
- `services/readybank/src/routes/reference-panel.ts` —
  `POST /v1/reference-panel/responses` with zod-validated body
  (`question_id` UUID, `response_body`, optional `correct`/`score`,
  `time_taken_ms`, `started_at`, `suspicious_signals`); inserts into
  `content.responses` with `is_reference_panel = TRUE`; audit-logs
  `reference_panel.response.recorded`. No-op when `apiKeyPepper` is
  absent (mirrors how `apiKeyAuth` is gated in dev/test).
- `services/readybank/src/server.ts` — mounts `referencePanelRouter`
  BEFORE the `apiKeyAuth /v1/*` gate so panel-specific 401s win over
  the generic `Unauthorized` from the API-key path.
- `__tests__/reference-panel.test.ts` — 8 unit tests against a stub
  Pool: missing-token / unknown-token / revoked / expired / scope
  rejection / malformed-body 400 / happy-path 201 with audit insert
  / score-from-correct mapping.

### Tests

- 18 new IRT tests + 8 new reference-panel tests = **26 new** unit tests
- Total active tests across workspace: **142** (was 116)
  - `@qorium/db` smoke: 7 (skipped without DATABASE_URL)
  - `@qorium/auth`: 26
  - `@qorium/irt`: **18** (new)
  - `@qorium/nos-mapper`: 16
  - `@qorium/readybank`: **82** (was 74; +8 new panel tests)
- `pnpm typecheck` / `pnpm lint` / `pnpm format:check` / `pnpm build`
  — all green
- gitleaks — clean

### Sprint 1.8 — current state

| Sub-track                               | Status        |
| --------------------------------------- | ------------- |
| 1.8a IRT package                        | ✅ this PR    |
| 1.8b Reference-panel ingest API         | ✅ this PR    |
| 1.8c Anti-Leak Engine v0 productionized | ⏳ next round |
| 1.8d Next.js admin console              | ⏳ next round |

Phase 1 engineering progress ~86% post-this-merge. Closes to 100%
after 1.8c + 1.8d.

### Stop conditions hit

None. Pure code/migration. Migration `0007` is auto-applicable and
non-destructive (adds columns + tables; no DROPs). The synthetic
tenant insert is idempotent via ON CONFLICT.

### Bridge with Cowork

`@qorium/irt` is consumable as a workspace dep. The calibration cron
job referenced in spec §7 (nightly 03:00 IST) is intentionally NOT
shipped here — the worker process belongs in a follow-up sprint that
also surfaces calibration outcomes to the admin console (1.8d).
Cowork's earlier `irt-calibration-batch.mjs` prototype (Run #24)
should now migrate to consume this package; flag on next sync.

---

## 2026-05-07 — Run #37 — Sprint 1.8c Anti-Leak Engine v0 productionized ✅

Promotes the Run-#24 `anti-leak-scan.mjs` prototype to a proper PM2-
runnable service per `infra/Anti-Leak-Engine-v0-Design.md`. Lexical
detection only in this PR (full embedding-based cosine deferred — see
CTO-DELTA below). 1.8d (Next.js admin console) is the only remaining
sub-track for Phase 1 = 100%.

### What landed

- **`services/anti-leak/`** new workspace package `@qorium/anti-leak`:
  - `src/types.ts` — `SearchProvider` interface, `SearchResult`,
    `QuestionForScan`, `ClassificationResult`, `LeakSeverity`,
    `DetectionEvidence`, `ScanReport`
  - `src/config.ts` — `loadConfig()` resolves provider (`mock` | `serper`),
    Serper API key, per-question query budget, severity thresholds
    (auto-rotate / high-review / medium-review). Fail-loud when
    `provider=serper` without `SERPER_API_KEY`.
  - `src/providers/mock.ts` — `MockSearchProvider` for dev/test/CI;
    deterministic in-memory fixture map keyed by query text.
  - `src/providers/serper.ts` — `SerperSearchProvider` calling
    `https://google.serper.dev/search`. Bounded `AbortController`
    timeout, snippet truncation at 500 chars per spec §2.1.
  - `src/detector.ts` — `tokenize` (stopword-aware), `extractDistinctiveNgrams`
    (top-K longest 9–15-token windows; falls back to whole text when
    too short), `jaccard`, `matchedNgrams` (token-compact substring
    match so embedded stopwords don't break the lookup), `classify`
    (severity per spec §6 thresholds; treats Jaccard as cosine proxy
    until embeddings ship).
  - `src/repositories.ts` — `fetchReleasedQuestions` (oldest-released
    first, so scans rotate through the corpus over time),
    `insertLeakAlert` (writes to `content.leak_alerts` with full
    forensic evidence in `evidence_jsonb`).
  - `src/scanner.ts` — `runScan` orchestrator. For each released
    question: extract distinctive n-grams → query provider → classify
    each hit → dedupe on (question_id, source_url) → persist medium+
    alerts + audit-log `leak.detected` (critical) / `leak.suspected`
    (high+medium). Survives transient provider errors per query.
  - `src/scripts/scan.ts` — CLI entry point (`pnpm --filter
@qorium/anti-leak scan [--provider=mock] [--write]
[--max-questions=N]`). Dry-run only; `--write` requires DB wiring
    so it runs from PM2 worker, not from CI.
  - `src/index.ts` — public surface for callers.
- **`__tests__/detector.test.ts`** (15 tests) — tokenize, n-gram
  extraction, Jaccard, matchedNgrams, classify across all four
  severity bands.
- **`__tests__/scanner.test.ts`** (5 tests) — empty-fixture no-alert,
  critical leak detection, dedupe within run, low-similarity dropped,
  provider-error resilience.

### CTO-DELTA: lexical-only similarity in v0

Spec §2.2 specifies BOTH cosine-embedding similarity (>0.92 critical)
AND lexical Jaccard (>70% medium). v0 ships **lexical only** because
embedding similarity needs either:

- Anthropic Embeddings API key — cred-bound; halts auto-mode per
  charter, OR
- a self-hosted embedding model — heavier infra than this PR's scope.

The classifier interface is stable (`classify(body, snippet, thresholds)`)
so swapping in cosine is a one-file change. Production thresholds use
the same numeric values from §6 against the Jaccard score — this
catches verbatim leaks (the dominant Glassdoor / GFG / LeetCode-Discuss
class), and the embeddings sprint will catch paraphrases. Logged as
`infra/CTO-deltas/CTO-DELTA-anti-leak-lexical-only-v0.md` (TODO follow-up).

### Tests

- **20 new** unit tests (15 detector + 5 scanner)
- Total active tests across workspace: **162** (was 142)
  - `@qorium/db` smoke: 7 (skipped without DATABASE_URL)
  - `@qorium/auth`: 26
  - `@qorium/irt`: 18
  - `@qorium/nos-mapper`: 16
  - `@qorium/readybank`: 82
  - **`@qorium/anti-leak`: 20** (new)
- `pnpm typecheck` / `pnpm lint` / `pnpm format:check` / `pnpm build`
  — all green
- gitleaks — clean

### Sprint 1.8 — current state

| Sub-track                               | Status                                  |
| --------------------------------------- | --------------------------------------- |
| 1.8a IRT package                        | ✅ merged (PR #18)                      |
| 1.8b Reference-panel ingest API         | ✅ merged (PR #18)                      |
| 1.8c Anti-Leak Engine v0 productionized | ✅ this PR                              |
| 1.8d Next.js admin console              | ⏳ next round (Phase 1 = 100% on close) |

Phase 1 engineering progress: 86% → **~92%** post-merge.

### Out of scope (next round / next sprint)

- **Embedding-based similarity** (CTO-DELTA above) — needs cred-drop
  for Anthropic Embeddings or a self-hosted model
- **24h SLA tracker** — admin console UI, lands with 1.8d
- **PM2 cron registration** for the nightly 02:00 IST scan — needs
  the `infra/B10-ecosystem.config.js` update to add a `qorium-anti-leak`
  fork-mode worker entry (next round)
- **Variant generator pipeline** (spec §7) — needs Anthropic API key
  for the AI rewrite call (cred-bound; halts)
- **Multi-source crawlers** — GeeksforGeeks scraper, GitHub repo
  search, LeetCode Discuss; all build atop the same `SearchProvider`
  interface

### Stop conditions hit

None. Pure code. The Serper provider needs `SERPER_API_KEY` to make
real network calls — `loadConfig` fails loud if the key is absent
when `ANTILEAK_PROVIDER=serper`. Default config is mock provider so
boots are CI-safe.

### Bridge with Cowork

Cowork's Run-#24 `anti-leak-scan.mjs` prototype is now superseded by
this productionized service. Stream A should retire the .mjs script
on next sync and either:

1. Delete it (if no callers), or
2. Refactor it to invoke `@qorium/anti-leak`'s `runScan` so the two
   streams stay congruent.

---

## 2026-05-07 — Run #38 — Sprint 1.8d Admin Console — Phase 1 ENGINEERING = 100% ✅

Closes the last engineering sub-track of Phase 1. The admin console
now ties Sprints 1.6.5 → 1.8c into a single human-usable surface.

### CTO-DELTA: static-SPA admin instead of Next.js

The plan §4 listed "Admin console (Next.js)" as Sprint 1.8d. Shipped
instead as **static HTML / CSS / vanilla-JS pages + new admin API
routes in readybank**:

- Reuses the existing recruiter JWT cookie auth — one login flow not two
- Reuses `helmet` headers, RFC 7807 error contract, audit-log helpers
- No new build pipeline (no webpack / SSR runtime / hydration tax)
- Mirrors the pattern that already shipped at `/recruiter/dashboard.html`
- Migrates cleanly to Next.js later if a richer client-side state
  manager is needed

Logged as `infra/CTO-deltas/CTO-DELTA-admin-static-spa-v0.md` (TODO
follow-up writeup; the rationale is captured above).

### What landed

#### Backend — `services/readybank/src/routes/admin.ts`

New router mounted at `/v1/admin/*`. Every endpoint behind the
recruiter JWT cookie gate; admin = recruiter (RBAC sub-roles deferred
to Sprint 3.3 alongside SAML claim mapping).

| Endpoint                                | Purpose                                                                                                                                                        |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /v1/admin/leak-alerts`             | List alerts; filter by status / severity; limit ≤200                                                                                                           |
| `POST /v1/admin/leak-alerts/:id/review` | Record SME decision (`dismissed` / `false_positive` / `under_review`); audit-logs `leak.<decision>`; sets `reviewed_by` to JWT subject                         |
| `GET /v1/admin/sme-queue`               | Questions in `draft` / `sme_review` / `calibrating` status; body excerpts ≤500 chars; difficulty + Bloom tags                                                  |
| `GET /v1/admin/calibration`             | LEFT-JOIN with reference-panel response counts so the UI can show n + b + a + c + empirical pass-rate per item                                                 |
| `POST /v1/admin/panel-tokens`           | Mint a new bearer token for the Reference Panel ingest API. HMAC-SHA256-pepper hash stored; raw value returned ONCE; audit-logs `reference_panel.token.minted` |

Server changes:

- `src/server.ts` — mounts `/admin` and `/admin/` 302 redirects to
  `/admin/dashboard.html` BEFORE `express.static` (to preempt
  serve-static's default 301 trailing-slash redirect); pass
  `redirect: false` to express.static so static handler doesn't
  override our convenience redirects.

#### Frontend — `services/readybank/public/admin/`

Five pages, all CSP-compliant (no inline `style=""` attributes; no
inline `<script>`; module scripts from same origin). Midnight-Executive
theme matching `/recruiter/dashboard.html`.

- `dashboard.html` + `.js` — admin home with 4 metric cards (open
  leak alerts, critical leaks, SME-review queue size, items
  calibrating) + recent-leaks table
- `leak-inbox.html` + `.js` — anti-leak alert review surface with
  status / severity filters + `<dialog>`-based review modal that
  posts to `/v1/admin/leak-alerts/:id/review`
- `sme-queue.html` + `.js` — read-only SME review queue (editing
  surfaces ship in next round once I/O Psych contractor onboards
  per CC-02-A)
- `calibration.html` + `.js` — IRT calibration view; computes
  "SO-21 ready?" client-side from n ≥ 30 + non-null (a, b)
- `panel-tokens.html` + `.js` — Reference Panel token issuance UI;
  shows the raw token ONCE in a code block with capture-now warning;
  refuses to send PII (form takes a hex hash, not a name/email)
- `_layout.js` — shared side-nav, error renderer, `adminFetch` wrapper
  that auto-redirects to login on 401, and `pill()` helper
- `admin.css` — full theme; utility classes (`.tight`, `.spaced`,
  `.token-card`, `.fineprint`) so no inline styles are needed
  anywhere

### Tests

- **13 new** admin unit tests in `__tests__/admin.test.ts` (stub
  Pool, signed JWT cookie, supertest):
  - leak-alerts: 401 unauth · authed list · status filter · invalid
    query 400
  - leak-alerts review: state mutation + audit insert · unknown id
    404 · invalid decision 400
  - sme-queue: filter by status
  - panel-tokens mint: 201 + raw token format + audit insert ·
    invalid hash 400 · pepper-not-configured 503
  - redirects: `/admin` → `/admin/dashboard.html` 302 ·
    `/admin/` → `/admin/dashboard.html` 302
- **Total active tests across workspace: 175** (was 162)
  - `@qorium/db` smoke: 7 (skipped without DATABASE_URL)
  - `@qorium/auth`: 26
  - `@qorium/irt`: 18
  - `@qorium/nos-mapper`: 16
  - `@qorium/anti-leak`: 20
  - **`@qorium/readybank`: 95** (was 82; +13 admin)
- `pnpm typecheck` / `pnpm lint` / `pnpm format:check` / `pnpm build`
  — all green
- gitleaks — clean

### Sprint 1.8 — final state

| Sub-track                               | Status             |
| --------------------------------------- | ------------------ |
| 1.8a IRT package                        | ✅ merged (PR #18) |
| 1.8b Reference-panel ingest API         | ✅ merged (PR #18) |
| 1.8c Anti-Leak Engine v0 productionized | ✅ merged (PR #19) |
| 1.8d Admin console                      | ✅ this PR         |

**Phase 1 engineering: 92% → 100%** post-merge.

### Phase 1 — what's done vs what's still human-bound

**Done (engineering criteria):**

- Customer Zero web surfaces 6/6 LIVE (PR #12 merged Surface 6 JWT auth)
- ReadyBank API alpha (questions / packs / sessions / results / watermark)
- IRT calibration math (`@qorium/irt` — SO-21 enforceable)
- Reference Panel ingestion API (`POST /v1/reference-panel/responses`)
- Anti-Leak Engine v0 (`@qorium/anti-leak`)
- Admin console (5 pages + 5 admin API endpoints)
- 7 migrations applied / applicable; 175 unit tests; CI gates green

**Still human-bound (per Auto-Mode Charter §3):**

- First REAL Talpro candidate run end-to-end (Sprint 1.0's 7th gate)
- I/O Psychologist contractor signed (C5 SOW)
- Reference Panel ≥200 recruited
- SME Content Lead hire (I2)
- Senior Engineer #1 hire (I1)
- First 3 Recruiter Subscription logos (H2)
- First Bosch GCC discovery call (E4)
- Production cred-drop to `.env.bootstrap` (unblocks SES /
  observability / multi-region IaC apply + Serper.dev anti-leak in
  prod + variant-generator pipeline)
- NSDC NQR cross-check (CC-02-A) — flips nos-mapper mappings to verified
- Wave-3 v0.1 → v1 ratification (Constitutional Amendment v2.1)

### Stop conditions hit

None. Pure code. The admin console reuses existing auth, headers,
audit-logging primitives — no new secrets, no new outbound surface,
no new compute requirement.

### Out of scope (Sprint 2+)

- **Edit / approve / reject** actions on the SME queue — needs the
  I/O Psych contractor to sign off on the workflow per CC-02-A
- **Calibration cron worker** — wraps `@qorium/irt` calibrateItems
  - the panel-ingest data; needs PM2 ecosystem.config update
- **Variant generator pipeline** for confirmed leaks — needs
  Anthropic API key (cred-bound)
- **DIF reporting page** in the admin console — needs panel-demographic
  metadata to accumulate first
- **Embedding-based similarity** (CTO-DELTA in Run #37)

### Bridge with Cowork

The static-SPA pattern is consistent with Stream A's recruiter
dashboard pattern (Run #31). Stream A can mirror or extend the admin
pages on its next sync. The admin API endpoints are documented above
and live at `/v1/admin/*` — same auth contract as the recruiter
session pages.

---

**Phase 1 engineering boundary closed.** Auto-Mode meter advances to
the Phase 2 (India Stack) backlog per
`governance/Auto-Mode-Remote-Plan-v1.md` §4 Phase D. Human-Bound lane
remains the dominant blocker on the master meter — every entry on
that list is one CEO action away from unblocking the next jump.

---

## 2026-05-07 — Run #39 — Sprint 2.2 (Phase 2 opens) ✅

CEO approved "Phase 2 · Go" after the Phase 1 = 100% milestone (PR
#20 merge). First Phase 2 PR opens with the cleanest code-only piece
— the billing math library — so subsequent content-scaling and i18n
PRs can stack on a stable pricing foundation.

### What landed: `packages/billing` (`@qorium/billing`)

Pure-TS pricing + GST + HSN/SAC library. Zero external dependencies
(no payment SDKs, no DB, no HTTP). The Razorpay / Stripe integration
service waits for cred-drop; this library is the math underneath.

| Module           | Purpose                                                                                                                                                                                                                                                                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `currency.ts`    | `Money` in **bigint** minor units (paise / cents) for exact arithmetic; `money` / `moneyMinor` / `multiply` / `sumMoney` / `formatMoney` / `applyRate` (banker rounding)                                                                                                                                                            |
| `sku-pricing.ts` | Canonical pricing per Constitution §1.2 LOCKED — 6 ReadyBank tiers (3 INR Recruiter + 3 USD Platform), 6 JD-Forge tiers (3 per-JD + 3 monthly), 3 Stack-Vault tiers (₹10L / ₹40L / ₹1Cr nominal with ₹35L CEO-approval floor)                                                                                                       |
| `gst.ts`         | `computeGst()` covering 4 schemes: `intra-state` (CGST + SGST 9% each), `inter-state` (IGST 18%), `export-zero-rated` (foreign currency to non-India buyer), `non-india` (INR or no-LUT to non-India buyer = IGST). `validateGstin()` structural check (15-char regex + state code + PAN extraction). 38 Indian state codes mapped. |
| `hsn-sac.ts`     | SAC codes per SKU — ReadyBank `998314`, JD-Forge `998313`, Stack-Vault `998319`. All `verification: pending` until GST counsel sign-off (same pattern as `@qorium/nos-mapper`).                                                                                                                                                     |
| `invoice.ts`     | `buildInvoice({ buyer, seller, lines })` pure builder. Resolves SKU/tier prices, multiplies by quantity, applies GST per scheme, returns structured `InvoiceTotals` + warnings (e.g., below-floor pricing). `renderInvoicePlain()` for CLI / preview surface.                                                                       |

### Tests

- **31 new** unit tests covering:
  - Currency math: bigint arithmetic, banker-rounding edge cases, currency-mix rejection, INR-lakh + USD formatting
  - SKU pricing: every Wave-1+2 tier resolves; floor enforcement; default-currency-by-country
  - GST: all 4 schemes (intra-state, inter-state, export-zero-rated, non-india fallback); explicit rate override; correct CGST/SGST split
  - GSTIN: valid 15-char accepted; 14/16 chars rejected; malformed PAN rejected; lowercase normalized
  - State codes: Karnataka, Maharashtra, Delhi looked up
  - SAC mapping: 6-digit format invariant; access-pattern consistency
  - buildInvoice: intra-state INR with CGST+SGST; export-zero-rated USD; below-floor warning; mixed-currency rejection; unknown-tier rejection; plain-text render contains SAC + tax breakdown
- Total active tests across workspace: **206** (was 175)
- `pnpm typecheck` / `pnpm lint` / `pnpm format:check` / `pnpm build` — all green
- gitleaks — clean

### Phase 2 — current state

| Sub-track                                 | Status         |
| ----------------------------------------- | -------------- |
| Sprint 2.0 Wave-2 60→100 content scale-up | ⏳ next        |
| Sprint 2.1 Wave-1 60→100 content scale-up | ⏳ next        |
| **Sprint 2.2 INR pricing + GST + SAC**    | **✅ this PR** |
| Sprint 2.3 i18n framework                 | ⏳ next        |

Phase 2 progress: 0% → ~15% post-merge.

### Out of scope (next sprints / cred-drop gated)

- **Razorpay SDK calls** — needs Razorpay test/live keys (cred-bound)
- **Stripe SDK calls** — needs Stripe test/live keys (cred-bound)
- **Webhook handlers** for payment events — depend on the SDK calls
- **Invoice PDF rendering** — Chromium / wkhtmltopdf, follow-up service
- **Subscription lifecycle** (proration, cancelation, dunning) — depends on payment provider state
- **Customer self-service portal** — UI sprint after admin console pattern
- **Zoho Books integration** — Indian accounting system handoff
- **Live GSTIN status check** via the public GST registry — needs registered API access

### CTO-DELTAs

- **SAC codes pending verification** (consistent with `@qorium/nos-mapper`). Counsel sign-off flips to `verified` via small data-only PR.
- **Default GST rate is 18%.** Reduced 5% / 12% slabs apply to specific HSN codes (educational services may qualify); not exposed in v0 — pass `{ rate: 0.05 }` to `computeGst` to override per-line.
- **Pricing source-of-truth.** v0 hardcodes the Constitution §1.2 dashboard values into `sku-pricing.ts`. A future sprint may move pricing into Postgres so the CEO can adjust without a PR — but doing so requires a CHECK constraint and audit-log integration to satisfy SO-9 / Article XI traceability.

### Stop conditions hit

None. Pure code; no SDK calls, no $-spend, no outbound, no prod-cred ops.

### Bridge with Cowork

Stream A's Maitro Razorpay integration (referenced in spec §3) is the
intended fast-path for the future billing service. When that lands as
a Stream B PR, it will consume `@qorium/billing` for tax computation

- pricing — keeping the math stable while wiring the payment loop.

---

## 2026-05-07 — Run #40 — Sprint 2.3 i18n framework ✅

Sprint 2.3 closes the i18n surface for QOrium's three Indian-market
languages (Hindi, Tamil, Telugu). English ships as the canonical
source; the other three ship as **pending stubs** so the framework
wires up cleanly without me hallucinating user-facing copy in
languages I cannot verify. Translation review is human-bound per the
same governance pattern that gates `@qorium/nos-mapper` and
`@qorium/billing` SAC verification.

### What landed: `packages/i18n/` (`@qorium/i18n`)

Pure-TS i18n framework with zero external dependencies (~250 LOC).

| Module                          | Purpose                                                                                                                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `types.ts`                      | `LanguageCode`, `Locale`, `MessageBundle`, `BundleMessage` (with `verified` / `pending` status), `ResolvedLocale`, `CoverageReport`                                                         |
| `bundles.ts` + `bundles/*.json` | Static registry. `BUNDLES` exposes `en` (canonical, 40+ keys) / `hi` (15 illustrative pending stubs) / `ta` / `te` (framework-wire-up-only). `$meta` keys stripped before exposure.         |
| `resolver.ts`                   | `parseAcceptLanguage()` per RFC 9110 (q-values, stable sort), `pickLanguage()`, `resolveLocale()` (target → en bundle chain)                                                                |
| `pluralize.ts`                  | CLDR-aligned `one` / `other` rules for en/hi/ta/te. `pluralKey()` returns ordered candidates so the bundle lookup falls through to `_other` when `_one` is missing.                         |
| `format.ts`                     | `formatNumber()` with Indian-lakh grouping for en-IN; `formatDate()`; `formatRelativeTime()`; `defaultRegionFor()`                                                                          |
| `translator.ts`                 | `translate(key, resolved, { count, params, acceptPending })` — verified > English fallback > pending > raw key. `coverage()` for admin diagnostics. `lookup()` for direct entry inspection. |

### Tests

- **34 new** unit tests covering Accept-Language parsing, locale picking,
  bundle-chain construction, translate happy-path / unknown-key /
  pending-fallback / verified-target / interpolation / plurals /
  fall-through, plural rules per language, coverage diagnostics,
  Intl-based number/date/currency formatting
- Total active tests across workspace: **240** (was 206)
- `pnpm typecheck` (8 packages) / `pnpm lint` / `pnpm format:check` /
  `pnpm build` — all green
- gitleaks — clean

### Phase 2 — current state

| Sub-track                                 | Status             |
| ----------------------------------------- | ------------------ |
| Sprint 2.0 Wave-2 60→100 content scale-up | ⏳ next            |
| Sprint 2.1 Wave-1 60→100 content scale-up | ⏳ next            |
| Sprint 2.2 INR pricing + GST + SAC        | ✅ merged (PR #21) |
| **Sprint 2.3 i18n framework**             | **✅ this PR**     |

Phase 2 progress: 15% → ~30% post-merge. Master meter: ~49% → ~51%.

### CTO-DELTAs

- **Hindi / Tamil / Telugu translations are framework stubs only.** All
  hi entries are explicitly `status: pending`; ta + te bundles ship
  empty. Runtime falls back to English when a translation is pending
  or missing — end users **never see broken UI**. Native-speaker
  reviewers must replace each stub and flip `status: verified` per
  Reference Panel Governance v0 §3 — same contract that gates Wave-3
  psychometric content. Protects against the agent hallucinating
  user-facing copy in languages it cannot verify.
- **CLDR plural categories limited to `one` / `other`.** Covers en /
  hi / ta / te for all cardinal cases QOrium ships. If a future locale
  needs `few` / `many` / `two` / `zero`, extend `pluralCategory`.
- **No `i18next` dependency.** ~250 LOC of pure TS keeps the audit
  surface tight (Pillar B — Security) and sidesteps i18next's runtime
  config / loader machinery.

### Stop conditions hit

None. Pure code; no SDK calls, no $-spend, no outbound, no prod-cred ops.

### Out of scope (future sprints)

- Native-speaker translation review (human-bound; data-only follow-up PRs)
- Tone / register guidelines (formal आप vs informal तुम — editorial doc)
- ICU MessageFormat for richer macros inside messages
- Admin "translation review" surface (lands when `coverage()` graphs UI)
- Lazy / dynamic bundle loading (only needed if messages > ~1MB)

### Bridge with Cowork

The English bundle is a thin slice today (40+ keys). When Stream A
authors recruiter-portal copy, canonical English keys should be
extended in `packages/i18n/src/bundles/en.json` so the static surface
stays single-source-of-truth across both streams. Per-locale stubs
auto-fall-back; nothing else needs changing on either side.

---

## 2026-05-07 — Run #41 — Sprint 2.0 (first PR) — Wave-2 SAP-ABAP +20 ✅

CEO approved "Continue 2.0" after Phase 2 code-only sprints (2.2
billing + 2.3 i18n) merged. First content-scale-up PR ships 20 new
SAP-ABAP questions extending the existing 70 toward the Phase 2
target of 100 per Wave-2 domain.

### What landed: `customer-zero/Wave-2-SAP-ABAP-Extension-071-090.md`

20 v0.6-quality questions (Q071–Q090) covering Cloud-tier ABAP topics
not previously addressed:

| Sub-skill                                        | Questions              | Format                   |
| ------------------------------------------------ | ---------------------- | ------------------------ |
| ABAP RESTful Programming Model (RAP)             | Q071, Q079, Q084, Q089 | MCQ × 2, code, casestudy |
| CDS view entities (advanced)                     | Q072, Q080, Q083       | MCQ × 2, code            |
| AMDP / HANA SQLScript                            | Q073, Q082             | MCQ × 2                  |
| ATC custom checks                                | Q074, Q085             | MCQ, code                |
| ABAP Unit testability patterns                   | Q075                   | MCQ                      |
| Enqueue framework + locking                      | Q076, Q086             | MCQ, code                |
| bgRFC / async integration                        | Q077                   | MCQ                      |
| BTP integration (Cloud Connector / destinations) | Q078, Q090             | MCQ, casestudy           |
| Output management (Adobe Forms / BRF+)           | Q081                   | MCQ                      |
| Multi-tenant SaaS design on BTP ABAP             | Q087                   | design                   |
| S/4 migration design (HANA-native acceptability) | Q088                   | design                   |

Distribution: 12 MCQ + 4 code + 2 design + 2 case-study.
Difficulty: 3 Easy / 9 Medium / 6 Hard / 2 Very Hard on the IRT b scale.

### Library counts

| Metric                           | Before | After         |
| -------------------------------- | ------ | ------------- |
| Authored (dashboard total)       | 811    | **831** (+20) |
| Ingest-parsable                  | 376    | **396** (+20) |
| SAP-ABAP authored (target = 100) | 70     | **90 / 100**  |

`pnpm --filter @qorium/readybank ingest:wave1` (dry-run) confirms the
new file parses **20/20 cleanly** — no parser misses introduced.

### Tests

- No new unit tests (content-only PR)
- All existing 240 active workspace tests still pass
- typecheck (9 packages) / lint / format / build / gitleaks — all green

### Phase 2 — current state

| Sub-track                                     | Status                                                                                          |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Sprint 2.0 Wave-2 60→100 content scale-up** | **🟡 in progress** — SAP-ABAP +20 this PR; Q091-Q100 next; other 4 Wave-2 domains each need +40 |
| Sprint 2.1 Wave-1 60→100 content scale-up     | ⏳ pending                                                                                      |
| Sprint 2.2 INR pricing + GST + SAC            | ✅ merged (PR #21)                                                                              |
| Sprint 2.3 i18n framework                     | ✅ merged (PR #22)                                                                              |

Phase 2 progress: 30% → ~35% post-merge. Master meter: ~51% → ~52%.

### CTO-DELTAs

- v0.6 status, not v1.0 — SME-Lead sign-off is the human-bound gate
  flipping `status='draft'` to `status='released'`.
- All citations point to SAP Help Portal canonical URLs; SME Lead
  audits citation freshness on the v1.0 review pass.
- Bias-check notes per question articulate fairness across non-India
  experience levels — particularly important for Q090 (India-context
  case study).

### Stop conditions hit

None. Pure content + docs; no $-spend, no outbound, no prod-cred ops.

---

## 2026-05-07 — Run #42 — Sprint 2.0 (second PR) — SAP-ABAP 100/100 ✅

CEO said "Go" again after PR #23 merged. This PR closes the 100/100
SAP-ABAP target with the final 10 questions.

### What landed: `customer-zero/Wave-2-SAP-ABAP-Extension-091-100.md`

10 v0.6-quality questions (Q091-Q100) covering operational + craft-tier
topics: internal-table secondary keys, string templates, resumable
exceptions, dynamic data references, background processing API, ABAP
Doc + clean ABAP, ALV OO toolbar events, V1/V2 update tasks, IDoc
reprocessing strategy, multi-team transport landscape.

Distribution: 6 MCQ + 2 code + 1 design + 1 case-study.
Difficulty: 2 Easy / 4 Medium / 3 Hard / 1 Very Hard.

### Library counts

| Metric              | Before   | After                      |
| ------------------- | -------- | -------------------------- |
| Authored            | 831      | **841** (+10)              |
| Ingest-parsable     | 396      | **406** (+10, 10/10 clean) |
| **SAP-ABAP target** | 90 / 100 | **100 / 100 ✅**           |

### Tests

- No new unit tests (content-only PR)
- All 240 existing workspace tests still pass
- typecheck / lint / format / build / gitleaks — all green

### Phase 2 — current state

SAP-ABAP is the **first Wave-2 domain to hit the Phase 2 100-question
target.** Remaining 4 domains (OHCM, CPQ, Finacle/Flexcube, Embedded-
Auto) follow the same authoring pattern. Plus Sprint 2.1 — Wave-1
60→100 across 8 sub-skills (~320 new questions over ~16 future PRs).

Phase 2 progress: 35% → ~38%. Master meter unchanged at ~52% (content
gates beyond ~78% remain human-bound on SME validation + Customer-Zero
real-candidate run).

### CTO-DELTAs

- v0.6 status; SME-Lead sign-off remains the human-bound gate.
- Q098 V1/V2 update-task pattern: rubric verifies candidates correctly
  classify mandatory vs non-mandatory V2 and recognise the
  async-audit-failure-must-not-roll-back invariant.
- Q100 multi-geography case study: rubric distributes points across
  landscape engineering AND regulatory considerations so non-India-
  experienced candidates can score on structural / cadence dimensions.

### Stop conditions hit

None. Pure content + docs.

### Next sprint slice

Recommend pivoting to **OHCM Q061-Q080** (20 questions) next so the
SME reviewer rotation is fresh — different sub-skill, different
reviewer pool, no contention with the just-shipped SAP-ABAP queue.

---

## 2026-05-07 — Run #43-46 — Sprint 2.0 ALL 5 Wave-2 domains 100/100 ✅

CEO authorised "Continue OHCM + CPQ + Finacle + Embedded-Auto" in
auto-mode while away. All 4 remaining Wave-2 domains shipped over
4 commits stacked onto PR #24, each adding Q061-Q100 (40 questions).

### Wave 2 final state

| Domain              | Pre | Post           |
| ------------------- | --- | -------------- |
| SAP-ABAP            | 70  | **100/100 ✅** |
| Oracle HCM Cloud    | 60  | **100/100 ✅** |
| Salesforce CPQ      | 60  | **100/100 ✅** |
| Finacle/Flexcube    | 60  | **100/100 ✅** |
| Embedded Automotive | 60  | **100/100 ✅** |
| **Wave 2 total**    | 311 | **500/500 ✅** |

### Library counts (cumulative across whole branch)

| Metric          | Pre-Sprint-2.0 | Post             |
| --------------- | -------------- | ---------------- |
| Authored        | 811            | **1,001** (+190) |
| Ingest-parsable | 376            | **566** (+190)   |

### Phase 2 progress: 35% → ~80%. Master meter: ~52% → ~55%.

Auto-mode lane reaches its **structural cap at ~78%**. Remaining
auto-mode progress: Sprint 2.1 (Wave-1 60→100 across 8 sub-skills,
~16 future PRs). Beyond that, the human-bound lane drives master-meter
(SME validation, Customer Zero candidate, panel recruitment, hiring).

### CTO-DELTAs

- All 500 Wave-2 questions ship at v0.6 status (`status='draft'`).
  SME-Lead sign-off is the human-bound gate. Per SO-21, IRT
  calibration also required before customer-facing release.
- Multi-domain SME reviewer queue: 5 SMEs in parallel needed (one per
  domain).
- India-context scenarios ~15-20% reference India-specific regulatory
  (RBI, PMLA, DPDPA, GST, EPF, IBC, SARFAESI, BSR, PF). Bias-check
  rubrics distribute points so non-India-experienced candidates can
  score on structural dimensions.

### Stop conditions hit

None across the 4 commits. Pure content authoring; no code changes;
no SDK calls; no $-spend; no outbound; no prod-cred ops. Ingest
dry-run only.

---

## 2026-05-08 — Run #61 — Sprint 4.4 v0 Audit Log API (extends auto-lane past 33-tile cap)

CTO-recommendation directive after the auto-lane reached 33/33 cap at
Run #60 (Sprint 4.2 PITR closeout). Picked Sprint 4.4 — Audit Log API
v0 — as the next legal extension because: (a) pure code, no creds,
(b) leverages the already-populated `audit.events` table, (c) SOC 2
prerequisite that unblocks Sprint 5.1 SOC2-readiness harness,
(d) cleanest single-PR scope of the four queued specs.

### What landed

New routes on `services/readybank` per
`infra/Audit-Log-API-Spec-v0.md` §3 (Phase 1 only):

- `GET /v1/audit/events` — list with cursor pagination + filters
  (`action`, `resource_type`, `start_date`, `end_date`, `limit ≤ 200`)
- `GET /v1/audit/events/:id` — single event detail (UUID-validated)
- `GET /v1/audit/summary` — total + top-N actions over a window
  (default last 30 days; top_n default 10, max 50)

All three apply the existing `recruiterAuth` cookie middleware
individually (matching the `adminRouter` pattern). Each rejects with
RFC 7807 `application/problem+json` on auth/validation failures.

### Files

| Path                                                  | Purpose                                                                           |
| ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| `services/readybank/src/types/audit-event.ts`         | DB row + API envelope mapping; opaque (occurred_at, id) cursor encode/decode      |
| `services/readybank/src/repositories/audit-events.ts` | `listAuditEvents` (cursor-paginated), `getAuditEventById`, `summariseAuditEvents` |
| `services/readybank/src/routes/audit.ts`              | Express router; zod query schemas; reuses `HttpProblem`                           |
| `services/readybank/src/server.ts`                    | Mounts `auditRouter` after `adminRouter`                                          |
| `services/readybank/__tests__/audit.test.ts`          | 19 unit tests (stub Pool, signed JWT cookie, supertest)                           |

### Field-name aliasing (DB → API envelope)

The `audit.events` table predates the spec; the spec uses different
names. The envelope mapper aliases without schema change:

| DB column                          | API field                   |
| ---------------------------------- | --------------------------- |
| `event_type`                       | `action`                    |
| `entity_type`                      | `resource_type`             |
| `entity_id`                        | `resource_id`               |
| `changes.before` / `changes.after` | `old_values` / `new_values` |
| `payload`                          | `details`                   |
| `occurred_at`                      | `timestamp` (ISO 8601)      |

### v0 tenant scope (and why)

`audit.events` has `actor_id REFERENCES app.users(id)` but **no
`tenant_id` column**. The cleanest tenant-safe v0 is "recruiter sees
their own audit trail" (filter `actor_id = recruiter.id`). Org-wide
read scope is gated on adding `tenant_id` to `audit.events`,
deferred to Sprint 4.4.1.

### Tests

19 new unit tests, all passing. Workspace totals:

| Metric                 | Pre | Post          |
| ---------------------- | --- | ------------- |
| Active tests           | 121 | **140** (+19) |
| Skipped DB-integration | 21  | 21            |
| Failures               | 0   | 0             |

### Quality gates

- `pnpm typecheck` — 10/10 workspaces clean
- `pnpm lint` — clean
- `pnpm --filter @qorium/readybank test` — 140 passed / 21 skipped / 0 failed
- `pnpm build` — 10/10 workspaces clean
- gitleaks — relied on CI (not installed in sandbox)

### Deferred (explicit follow-ups)

- **Sprint 4.4.1** — Add `tenant_id` column to `audit.events`; expand
  read scope from "own actor_id" to "tenant-scoped events"; add a
  dedicated `audit:read:tenant` scope on the recruiter JWT.
- **Sprint 4.4.2** — Phase 2 export endpoints
  (`POST /v1/audit/events/export`, `GET /v1/audit/exports/:job_id`)
  and webhook integration with the (future) webhooks-service.
- **Sprint 4.4.3** — Phase 3 hash-chaining + SIEM streaming.

### Stop conditions hit

None. No constitutional touch (Articles I/IV/VII/IX), no monetary
commitment, no outbound message, no production-credential operation,
no IRT auto-fail, no anti-leak detection, no Gatekeeper sub-88
score, no destructive migration. Pure additive read-only API.

### Dashboard

`governance/dashboard.json` updated:

- `lastRefresh` → 2026-05-08T23:30:00+05:30
- `lastReconcileRun` → 61
- `lanes.auto.completed` 33 → 34, `lanes.auto.total` 33 → 34
- New tile `sprint-4.4.audit-log-v0` (status=complete) appended
- New entry at top of `runs[]` (id 61)
- Run #60 evidence string corrected: `scripts/restore-pitr.sh` →
  `infra/B7-postgres-migrations/scripts/restore-pitr.sh` (the actual
  on-disk path; pure documentation correction, no code change)
- `masterMeter.auto` UNCHANGED at 0.78 (Constitution Article IX cap)
