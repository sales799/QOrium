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

## 2026-05-03 — Sprint 1.1 spec INDEX + 4 CTO-DELTA ratifications ✅

Per CTO Office authorisation (Stream B handoff, 2026-05-03), Sprint 1.1
establishes the canonical spec-ingest pattern and closes out the four
provisional CTO-DELTAs raised during Sprint 0–1.0.

### What landed

- `docs/specs/README.md` — documents the spec-ingest pattern: agent looks
  for canonical specs in `docs/specs/` → `infra/` → `governance/` → repo
  root; missing specs trigger a `REQUEST: <name> from CTO Office` halt.
- `docs/specs/INDEX.md` — single lookup table mapping every spec the
  build agent depends on (across phases 1–4) to its canonical path,
  organised by sprint dependency. New specs ingested in future sprints
  land in `docs/specs/<filename>` and are appended here.
- `infra/CTO-deltas/CTO-DELTA-CI-pnpm-adoption.md` — RATIFIED. pnpm 10.x
  is canonical; B5 yaml is archival.
- `infra/CTO-deltas/CTO-DELTA-gitleaks-v8-syntax.md` — RATIFIED.
  `.gitleaks.toml` is canonical; B6 yaml is archival intent-of-record.
- `infra/CTO-deltas/CTO-DELTA-migration-runner.md` — RATIFIED. Custom
  ~150-line runner is canonical at QOrium scale; switch path to
  `node-pg-migrate` preserved (same `public.pgmigrations` table).
- `infra/CTO-deltas/CTO-DELTA-api-key-hashing.md` — RATIFIED.
  HMAC-SHA256(pepper, key) is canonical; D3 §2.2 will be amended in
  the next spec refresh. Argon2id reserved for password-class secrets.

### Why a registry, not a copy

All 25+ canonical specs were already ingested into the repo by PR #2 at
the paths the toolchain expects (`infra/B7-postgres-migrations/` is read
by the migration runner; `governance/Quality-Gate-92pt-Scorecard.md` is
referenced by the release-gate workflow; etc.). Duplicating them under
`docs/specs/` would create drift the moment the Cowork session pushes a
revision. Instead, `docs/specs/INDEX.md` is the single source of truth
for "where does spec X live?"; new specs ingested by future agent
flows land directly under `docs/specs/<filename>`.

### CTO-DELTA reconciliation summary

| #   | Topic                   | Default position                | Ratified outcome                                     |
| --- | ----------------------- | ------------------------------- | ---------------------------------------------------- |
| 1   | CI npm → pnpm           | Match handoff §3 (pnpm)         | RATIFIED — pnpm 10.x canonical                       |
| 2   | gitleaks v8 syntax      | Preserve B6 intent in valid v8  | RATIFIED — `.gitleaks.toml` canonical                |
| 3   | Custom migration runner | Match canonical filename layout | RATIFIED — thin custom runner; switch path preserved |
| 4   | API key hashing         | HMAC-SHA256 (deterministic)     | RATIFIED — D3 §2.2 amended in next refresh           |

### Verified locally

- `pnpm typecheck` clean across all 4 workspaces
- `pnpm lint` / `pnpm format:check` clean
- `pnpm build` clean
- `pnpm test` (no DATABASE_URL): 31 active green + 28 auto-skip = 59 cases
- gitleaks clean
- No code changes; documentation-only PR. CI parity with `main`.

### Halt-conditions encountered

None. Sprint 1.1 closes within the autonomous-mode delegation envelope.

### Next sprint

Sprint 1.2 — `apps/admin` Next.js 15 scaffold with NextAuth (Google OAuth
stubbed, real credentials deferred), shadcn/ui + Tailwind, route stubs
at `/admin/queue` and `/admin/calibration`, guard middleware tests.
References `07-CTO-Architecture-v1.md` (already in repo per INDEX).
**Halt condition:** real Google OAuth client credentials → REQUEST from CEO.

---

## 2026-05-03 — Sprint 1.2 apps/admin Next.js scaffold ✅

`apps/admin` (`@qorium/admin`) — Next.js 15 + React 19 + TypeScript +
Tailwind v4 + NextAuth v5. Listens on :5104 (per B10 `qorium-admin`).
Guard-middleware-protected route stubs for SME review queue + IRT
calibration; auth scaffold designed for runtime swap to real provider
once CTO Office picks between MSG91 OTP / Google OAuth / both.

### What landed

- `apps/admin/package.json` + `tsconfig.json` + `next.config.mjs` +
  `postcss.config.mjs` + `vitest.config.ts` — Next.js 15.0.4 with App
  Router, src directory, typed routes, Tailwind v4 via
  `@tailwindcss/postcss`. Engine port 5104 per B10.
- `src/auth-config.ts` — pure logic separated from NextAuth wiring:
  `parseEmailAllowlist`, `isEmailAllowed`, `isWellFormedEmail`,
  `buildAdminUser`, `isProtectedPath`, `buildLoginRedirect`. All
  pure functions, fully unit-testable without runtime.
- `src/env.ts` — `loadAdminEnv()` returns dev fallback for
  `AUTH_SECRET` so `next build` works without prod secrets;
  separate `assertProdEnv()` for runtime startup guards.
- `src/auth.ts` — NextAuth v5 config with Credentials provider stub
  whose `authorize` callback delegates to `isEmailAllowed`. Empty
  allowlist = no access (secure-by-default for fresh clones).
  `authorized` callback gates `/`, `/admin/*` to authed sessions;
  `/login`, `/api/auth/*`, `/healthz` are public.
- `src/middleware.ts` — exports `auth` as default; matcher excludes
  `/api/auth`, `_next/*`, `favicon.ico`, `/healthz`.
- `src/app/api/auth/[...nextauth]/route.ts` — re-exports
  `handlers.GET` / `handlers.POST` per NextAuth v5 convention.
- `src/app/layout.tsx` — root HTML shell with Tailwind globals.
  `robots: noindex,nofollow` (admin console must never be indexed).
- `src/app/login/page.tsx` — server-component login page with a
  React server action calling `signIn('credentials', { email,
redirectTo })`. Honours `?from=…` for post-login redirect; ignores
  non-relative `from` values to prevent open-redirect.
- `src/app/admin/layout.tsx` — protected shell with header nav
  (queue / calibration links + sign-out form posting to a
  server action calling `signOut`). Reads session via `await auth()`.
- `src/app/admin/queue/page.tsx` — SME review queue stub
  (placeholder until Sprint 1.3 wires `GET /admin/v1/sme/review-queue`).
- `src/app/admin/calibration/page.tsx` — IRT calibration panel stub
  (placeholder until Sprint 1.5 wires the calibration pipeline).
- `src/app/page.tsx` — `/` redirects to `/admin/queue`.
- `src/app/healthz/route.ts` — `GET /healthz` returns
  `{ status: 'ok', service: 'qorium-admin' }`; public.
- `__tests__/auth-config.test.ts` — 30 vitest cases (allowlist
  parsing edge cases, email format validation parametrised,
  case-insensitive matching, malformed email rejection,
  protected-path classification, login redirect URL building).
- `__tests__/env.test.ts` — 7 vitest cases (dev fallback,
  override, build-time tolerance, allowlist passthrough,
  `assertProdEnv` boundary cases).
- `.env.example` — added `AUTH_SECRET`, `ADMIN_EMAIL_ALLOWLIST`,
  `MSG91_*` placeholders.

### CTO-DELTA: admin auth provider

Architecture §6.1 specifies email + OTP via MSG91; the Stream B handoff
specifies Google OAuth. Both require CEO-only secrets that are halt
conditions. The scaffold ships a Credentials provider stub gated by an
empty-by-default email allowlist; `auth-config.ts` is pure logic so the
provider swap is a one-file change in `auth.ts`. Logged at
`infra/CTO-deltas/CTO-DELTA-admin-auth-provider.md` with three
reconciliation options (MSG91 / Google OAuth / both env-gated).

### Verified locally

- `pnpm typecheck` clean across 5 workspaces (apps/admin now compiles)
- `pnpm lint` clean
- `pnpm format:check` clean
- `pnpm build` clean — Next.js production build emits 7 routes:
  `/` (static redirect), `/admin/calibration` (dynamic),
  `/admin/queue` (dynamic), `/api/auth/[...nextauth]` (dynamic),
  `/healthz` (dynamic), `/login` (dynamic), `/_not-found` (static).
  Middleware bundle: 81.4 kB.
- `pnpm test` — admin: 37/37, db: 7 skipped, auth: 26/26,
  readybank: 33/33 + 21 skipped = **96 active green + 28 auto-skip**
- `gitleaks protect --staged` clean for this PR's content

### Halt-conditions encountered

None. The scaffold ships fully without external service deps; real
provider integration is gated on CTO Office reconciliation +
provisioning of MSG91 / Google OAuth credentials.

### Next sprint (1.3)

SME review queue UI wired to a real `GET /admin/v1/sme/review-queue`
endpoint on the readybank service (or a new `services/admin-api`),
plus accept/edit/reject decision flow. Will need a content-engine
schema decision — likely add a `content.review_decisions` table.
References CTO Architecture §6.3 (already in repo per INDEX).
**Halt conditions:** none expected; pure backend + UI work.

---

## 2026-05-03 — Sprint 1.3 SME review queue + decision workflow ✅

Live SME review workflow against `content.questions` in `sme_review`
status. Decisions persisted to a new audit table and applied as
status transitions inside a single transaction. Wired into the
`/admin/queue` page via Next.js Server Actions.

### What landed

- **Migration 0003 (`infra/B7-postgres-migrations/0003_review_decisions.sql`)**:
  `content.review_decisions` table — `id` UUID PK, `question_id` FK
  (cascade delete), `reviewer_email`, `decision` CHECK
  `('accept', 'edit', 'reject')`, `notes`, `prior_status`,
  `next_status`, `created_at`. Indexes on `question_id`,
  `reviewer_email`, `created_at DESC`.
- **Workflow encoding in `apps/admin/src/server/decisions.ts`**:
  status transitions live as a frozen map (`accept→calibrating`,
  `edit→draft`, `reject→deprecated`); `validateDecisionInput`
  enforces shape + the rule that `edit` requires non-empty notes;
  100 % pure functions, no DB / Next.js dependency.
- **Data layer (`apps/admin/src/server/queue.ts`)**:
  `listReviewQueue` (clamps limit to 200), `getReviewable`
  (returns null for non-`sme_review` rows), `recordDecision`
  (transactional: SELECT … FOR UPDATE → INSERT decision → UPDATE
  question status; stamps `deprecated_at` on reject; returns null
  if the row was actioned by someone else mid-flight).
- **Pool singleton (`apps/admin/src/server/db.ts`)**:
  `getAdminPool()` caches a single `pg.Pool` on `globalThis` keyed
  by a Symbol so Next.js dev hot-reload doesn't leak pools.
- **Server Action (`apps/admin/src/app/admin/queue/_actions.ts`)**:
  `recordDecisionAction` — uses `useActionState` contract; reads
  the SME's email from `await auth()` so the form can't spoof
  the reviewer; UUID-validates the questionId; calls
  `validateDecisionInput`; `revalidatePath('/admin/queue')` on
  success; surfaces RFC-style error states (`error`, `stale`,
  `success`).
- **Client form (`apps/admin/src/app/admin/queue/_components/decision-form.tsx`)**:
  three submit buttons (Accept / Send back for edits / Reject)
  sharing one `<textarea>` for notes. Disabled while the action
  is pending. `useActionState` shows per-row success / stale /
  error messages.
- **Live page (`apps/admin/src/app/admin/queue/page.tsx`)**:
  loads the queue from Postgres on each request (`force-dynamic`);
  gracefully degrades when `DATABASE_URL` is absent (shows an
  amber banner instead of crashing the route); empty-state when
  the queue is clear; renders body markdown in a scroll container.
- **`apps/admin/package.json`**: adds `@qorium/db: workspace:*`.
- **Tests**:
  - `apps/admin/__tests__/decisions.test.ts` — 21 vitest cases
    (status transitions parametrised; validator boundary cases;
    whitespace-only notes; max-length; non-string rejection).
  - `apps/admin/__tests__/queue.integration.test.ts` — 7 vitest
    cases (queue ordering, limit clamp, getReviewable visibility,
    accept/edit/reject transitions with audit-row verification,
    stale-row handling). Auto-skips when `DATABASE_URL` unset.
  - `packages/db/__tests__/migration.smoke.test.ts` — appended
    `review_decisions` to the expected content tables list and
    added a CHECK-constraint smoke for the `decision` column.

### Verified locally

- `pnpm typecheck` clean across 5 workspaces
- `pnpm lint` / `pnpm format:check` clean
- `pnpm build` clean — `/admin/queue` route bundle now 1.13 kB
  (was 150 B stub); middleware bundle 81.4 kB
- `pnpm test` — admin 58/58 + 7 skipped; db 8 skipped (no DB);
  auth 26/26; readybank 33/33 + 21 skipped =
  **117 active green + 36 auto-skip**
- `gitleaks protect --staged` clean

### Halt-conditions encountered

None. Pure backend + UI sprint, no external service deps.

### Next sprint (1.4)

Anti-Leak Engine v0 service (`qorium-leak-crawler`, fork mode per
B10). References `infra/Anti-Leak-Engine-v0-Design.md` (already
in repo per INDEX). Will request `Serper.dev` API key from CEO
when activating real crawls; until then, a stub source-poller
is sufficient for the service skeleton + scheduling + signal
ingestion to `content.leak_alerts`.
**Halt condition:** real Serper.dev API key required for live
crawls → REQUEST from CEO at activation time.

---

## 2026-05-03 — Sprint 1.4 Anti-Leak Engine v0 (`qorium-leak-crawler`) ✅

`services/leak-crawler` (`@qorium/leak-crawler`) — PM2 fork-mode
worker that scans released questions for leakage signals and
records `content.leak_alerts` rows. Implements the v0 design from
`infra/Anti-Leak-Engine-v0-Design.md` end-to-end: n-gram query
extraction (§2.1) → multi-source poller fan-out → lexical scoring
(§2.2) → severity classification (§6) → idempotent alert insert.
Real cosine/embedding scoring + Anthropic variant rotation are
deliberately deferred; the design is dependency-injected so they
slot in cleanly in 1.4.x / 1.5.

### What landed

- **Pure-logic core (no DB / HTTP)**:
  - `src/ngrams.ts` — markdown-aware text normalisation (drops
    fenced + inline code, strips punctuation), distinctiveness-ranked
    n-gram extraction (9–15 word window, top-K, no substring dupes)
  - `src/similarity.ts` — Jaccard token-set overlap with stopword
    pruning + min-token-length filter; `scoreEvidence` returns the
    bichannel record (cosine deferred = 0; lexical live)
  - `src/severity.ts` — full §6 classifier (`critical|high|medium|low|none`)
    - `compositeSimilarity` weighted blend (cosine 0.6 / lexical 0.4)
  - `src/watermark.ts` — `deriveWatermarkSeed` (HMAC-SHA256 per §3),
    `deriveMarkers` (5 forensic markers: variable suffix / test-value
    %-shift / synonym index / comment style / helper-reorder parity),
    `attributeLeak` (per-marker match → composite confidence),
    `seedsEqual` (constant-time)
- **Source pollers**:
  - `src/sources/types.ts` — `SourcePoller` interface + `SourceType`
    union
  - `src/sources/serper.ts` — real Serper.dev client (POST
    `https://google.serper.dev/search`, `X-API-KEY`, AbortSignal +
    15s timeout, payload validation, bounded `maxResults`); fetch
    impl is injectable for testing
  - `src/sources/stub.ts` — fixture-driven poller for tests + dev
    when `SERPER_API_KEY` is absent
- **Data layer**:
  - `src/repositories/questions.ts` — `listReleasedQuestions`
    (status='released' only; spec §10 5K cap with 20K hard ceiling)
  - `src/repositories/alerts.ts` — `recordAlertIfNew` (de-dup by
    `(question_id, source_url)` at the application level; full
    evidence_jsonb payload with snippet / classifier reason / matched
    n-grams)
- **Orchestrator** (`src/orchestrator.ts`):
  - `runCrawl({listQuestions, recordAlert, pollers, logger,
ngramsPerQuestion, resultsPerQuery, signal?, now?})` — DI on
    every external surface
  - For each released question → top-K n-grams → fan out across
    pollers → score each result → classify → persist if above floor
  - Per-poller failures are logged + counted, never abort the pass
  - Cooperative cancel via `AbortSignal`
  - Returns a structured `CrawlReport` (questionsScanned, queriesIssued,
    resultsScored, alertsCreated, alertsSkippedDuplicate, errors)
- **Entry points**:
  - `src/index.ts` — `runOnce` builds Serper poller from env (or
    StubPoller in non-prod when key is unset, no-op + warning in
    prod), opens a 4-conn pg pool, runs one pass, drains pool
  - `src/cli.ts` — CLI with `--once` (default; PM2 cron-restart drives
    cadence) and `--watch --interval <s>` (dev), JSON-line summary on
    stdout, fatal-error JSON to stderr
- **Service config**:
  - `src/config.ts` — env-driven knobs (`LEAK_CRAWLER_MAX_QUESTIONS`,
    `LEAK_CRAWLER_NGRAMS_PER_QUESTION`, `LEAK_CRAWLER_QPM`, etc.) with
    sensible defaults that match spec §10
  - `src/logger.ts` — pino with `service`/`git_sha` base + redaction of
    `SERPER_API_KEY` / `ANTHROPIC_API_KEY` / `DATABASE_URL` / `REDIS_URL`
- **Tests** (49 cases across 7 files; 47 active + 2 auto-skip):
  - `__tests__/ngrams.test.ts` — 5 cases (normalisation, K-bound,
    too-short rejection, substring de-dup, distinctiveness preference)
  - `__tests__/similarity.test.ts` — 9 cases (stopword/short-token
    drop, identifier preservation, Jaccard correctness, body-vs-snippet
    scoring on real prose)
  - `__tests__/severity.test.ts` — 8 cases (full classification grid +
    threshold boundary determinism + composite blend)
  - `__tests__/watermark.test.ts` — 14 cases (determinism, input
    sensitivity, 64-hex shape, marker ranges, attribution match/mismatch,
    constant-time equality, throw-on-bad-input)
  - `__tests__/sources/serper.test.ts` — 6 cases (POST shape + headers,
    organic-hit parsing, missing-link/snippet skip, maxResults bound,
    non-2xx → throw, missing-apiKey rejection)
  - `__tests__/orchestrator.test.ts` — 6 cases (no pollers → empty
    report, high-overlap → alert created, below-floor → no persistence,
    duplicate counted separately, poller throw counted but doesn't abort,
    AbortSignal honoured)
  - `__tests__/orchestrator.integration.test.ts` — 2 cases against
    live Postgres: end-to-end alert creation, idempotent re-crawl no-op.
    Auto-skips when `DATABASE_URL` unset.

### Verified locally

- `pnpm typecheck` clean across 6 workspaces
- `pnpm lint` / `pnpm format:check` clean
- `pnpm build` clean — leak-crawler dist emits `cli.js`,
  `index.js`, `orchestrator.js` etc.; Next.js admin build unchanged
- `pnpm test` — leak-crawler 47/47 + 2 skip; admin 58 + 7 skip;
  auth 26/26; db 8 skip; readybank 33 + 21 skip =
  **164 active green + 38 auto-skip** (was 117 + 36)
- `gitleaks protect --staged` clean

### Halt-conditions encountered

None at v0 scope. **Activation halt for live operation:** real
`SERPER_API_KEY` is required to run crawls against production
search; until provisioned by CEO, the service runs end-to-end
against the StubPoller in dev / falls through with a warning in
prod. Anthropic-driven variant generation (spec §7) is reserved
for Sprint ≥1.5.

### Next sprint (1.5)

IRT Calibration Pipeline v0. References
`infra/IRT-Calibration-Pipeline-v0-Spec.md` (already in repo per
INDEX). Likely shape: nightly cron service that runs 2-PL fits
on questions in `calibrating` status against accumulated
`content.responses`, updates `difficulty_b` / `discrimination_a`,
and graduates to `released` once IRT parameters stabilise.
**Halt conditions:** none expected for v0; uses local
computations only. SO-21 (IRT mandatory) is the constitutional
gate this sprint closes.
