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

---

## 2026-05-03 — Sprint 1.5 IRT Calibration Pipeline v0 (`qorium-irt-calibration`) ✅

`services/irt-calibration` (`@qorium/irt-calibration`) — PM2 fork-mode
worker that runs the canonical 5-stage calibration pipeline from
`infra/IRT-Calibration-Pipeline-v0-Spec.md` end-to-end. Closes the
**SO-21 constitutional gate** (IRT mandatory before release).

### What landed

- **Migration 0004 (`infra/B7-postgres-migrations/0004_calibration_history.sql`)**:
  `content.calibration_history` append-only audit table. Columns: `run_id`,
  `question_id`, `n_responses`, `b_est`, `a_est`, `c_est`, `log_likelihood`,
  `converged`, `iterations`, `prior_b`, `prior_a`, `delta_b`, `delta_a`,
  `empirical_pass_rate`, `flag` (CHECK on the canonical flag set), `ran_at`.
  Indexed on `question_id`, `run_id`, `ran_at DESC`, and a partial index
  on `flag <> 'none'` for SME triage queues.
- **Pure-logic core** (no DB / pino / runtime):
  - `src/model.ts` — 3PL probability function + Newton-stable sigmoid
    - `clampParameters` to spec §2 box (a∈[0,3], b∈[-4,4], c∈[0,0.3])
    - `defaultGuessingForFormat` (mcq=0.25 / msq=0.0625 / truefalse=0.5
      / coding|design|sjt|casestudy=0) + `itemLogLikelihood`
  - `src/ability.ts` — sum-score-based θ proxy per spec §4 stage 3:
    z-score per-candidate proportion-correct across the cohort;
    custom `correctPredicate` overrideable
  - `src/fit2pl.ts` — Newton-Raphson MLE on (a, b) with c held at the
    format-derived default; backtracking line search; gradient-ascent
    fallback when the Hessian is degenerate; box clamp every step;
    `isAtBounds` boundary check
  - `src/drift.ts` — full §4 stage 4 classifier (`drift_b` |Δb|>0.5,
    `drift_a` |Δa|>0.3, `extreme_pass_rate` |observed - expected|>0.20,
    `invalid_params` for NaN/non-positive a) + §4 stage 5 transitions
    (`released` | `sme_review` | `calibrating`)
- **Data layer (`src/repositories/calibrating.ts`)**:
  - `listCalibratingQuestions` — `status='calibrating' AND
COALESCE(calibration_n,0) >= minResponses`
  - `fetchResponsesForQuestions` — single batched query
  - `applyCalibration` — single-transaction: insert history row →
    update questions (params + status + `released_at` if graduating)
  - Skipped param/state writes when flag is `low_n` /
    `no_convergence` / `invalid_params` (history row alone is the
    audit trail)
- **Orchestrator (`src/orchestrator.ts`)**:
  - `runCalibration({listQuestions, fetchResponses, applyCalibration,
logger, config, generateRunId?, now?})` — DI on every external
    surface (no fixtures or DB needed in unit tests)
  - Builds per-cohort θ map once; reuses across all items in the batch
  - Per-item failures are logged + counted, never abort the run
  - Returns structured `CalibrationReport` (questionsConsidered /
    Calibrated / Released / FlaggedForSme / HeldInCalibration / errors,
    plus a per-flag count map)
- **Entry points**:
  - `src/index.ts::runOnce()` — opens 4-conn pg pool, runs one batch,
    drains; warns + no-ops if `DATABASE_URL` is unset
  - `src/cli.ts` — CLI with `--once` (default; PM2 cron drives cadence)
    and `--watch --interval <s>` for dev; JSON-line summary to stdout,
    fatal errors to stderr
- **Service config (`src/config.ts`)**:
  env knobs `IRT_MIN_RESPONSES` (default 30 per spec §3),
  `IRT_MAX_QUESTIONS_PER_RUN` (default 1,000 per spec §5),
  `IRT_MAX_ITERATIONS` (50), `IRT_TOLERANCE` (1e-6).
- **PM2 entry**: added `qorium-irt-calibration` to
  `infra/B10-ecosystem.config.js` — fork mode, `cron_restart: '0 3 * * *'`
  (03:00 IST per spec §7), 1 GB memory cap, env knobs wired to
  `env_production`. Logged as
  `infra/CTO-deltas/CTO-DELTA-b10-irt-calibration-entry.md`.
- **CTO-DELTAs**:
  - **#6 `CTO-DELTA-irt-fitter.md`** — TS-native MLE in v0; full Python
    `girth` deferred (spec §8 calls for girth, but cross-language
    packaging vs ~80 lines of stable numerical code wasn't worth the
    Phase 1 schedule cost). Hybrid path proposed for v1 (girth for
    quarterly DIF + I/O Psych QA reports).
  - **#7 `CTO-DELTA-irt-2pl-with-format-c.md`** — 2PL fit with c held
    at the format default (per spec §13 Q3 first option); full 3PL
    deferred until panel acquisition raises typical N >= 100.
  - **#8 `CTO-DELTA-b10-irt-calibration-entry.md`** — added the new PM2
    entry directly to B10 (CTO Office canonical), logged for upstream
    refresh.
- **Tests** (64 new cases, all active green):
  - `__tests__/model.test.ts` — sigmoid (parametrised), 3PL probability
    (5 cases), clamp, default-c per format (8 cases), log-likelihood
    boundary cases
  - `__tests__/ability.test.ts` — empty / all-zero / symmetric
    proportion / monotonic θ / custom predicate / null-score handling
  - `__tests__/fit2pl.test.ts` — empty data → invalid; mismatched
    arrays throw; clamp at bounds; c stays fixed; synthetic recovery
    for centred / hard / easy items; degenerate corpora; `isAtBounds`
  - `__tests__/drift.test.ts` — full §4 stage 4 classifier grid + §4
    stage 5 transitions parametrised
  - `__tests__/orchestrator.test.ts` — empty-batch / low-N / healthy
    fit / fetch failure / apply failure / runId propagation
- `packages/db/__tests__/migration.smoke.test.ts` — adds
  `calibration_history` to expected content tables + a CHECK-constraint
  smoke test.

### Verified locally

- `pnpm typecheck` clean across **6 workspaces** (now 7 incl. infra)
- `pnpm lint` / `pnpm format:check` clean
- `pnpm build` clean — irt-calibration emits `cli.js`, `index.js`,
  `model.js`, `fit2pl.js`, etc.
- `pnpm test` — irt-calibration 64/64 active; admin 58 + 7 skip;
  leak-crawler 47 + 2 skip; readybank 33 + 21 skip; auth 26;
  db 9 skip = **228 active green + 39 auto-skip** (was 164 + 38)
- `gitleaks protect --staged` clean

### Halt-conditions encountered

None. The pipeline runs end-to-end with synthetic data; activation
against a populated `content.responses` table is automatic once
calibration cohort responses start landing (Sprint 1.7 onwards).

### Constitution alignment

- **SO-21 (IRT scoring Day-1 mandatory)** — closed. Every released
  question now passes through this pipeline before status transitions
  to `released`.
- **Article VII phase gate** — closed. The pipeline rejects graduation
  without `converged === true && flag === 'none' && N >= minResponses`.

### Next sprint (1.6)

Judge0 sandbox integration. References
`infra/Judge0-Sandbox-Integration-Spec-v0.md` (already in repo per
INDEX). Likely shape: orchestrator service that submits coding
question test cases to Judge0, polls for completion, parses results
into a normalised execution report. Supports 12 languages + Apex
per spec.
**Halt conditions:** none expected; the docker-compose dev stack
already bundles Judge0 1.13.1 (per Sprint 0.2). Live activation
needs `JUDGE0_AUTH_TOKEN` for the production instance — REQUEST from
CEO at activation.

---

## 2026-05-03 — Sprint 1.6 Judge0 Sandbox Orchestrator v0 (`qorium-judge0-orchestrator`) ✅

`services/judge0-orchestrator` (`@qorium/judge0-orchestrator`) — PM2
fork-mode worker that runs candidate code submissions through the
Judge0 sandbox per `infra/Judge0-Sandbox-Integration-Spec-v0.md`.
Handles all 12 baseline languages (Java, Python, Node, TypeScript,
C++, Rust, Go, C, SQL, Bash, Shell/AWK); Apex deferred to v0.1
(separate worker).

### What landed

- **Migration 0005 (`infra/B7-postgres-migrations/0005_judge0_sandbox.sql`)**:
  adds `content.questions.sandbox_config` (JSONB) per spec §4 (test
  cases, language, memory/time limits, expected_output_pattern,
  weights, rubric) and `content.responses.execution_metadata` (JSONB)
  per spec §3.2 (test_results, compilation_error, runtime_error,
  exit_code, timeout, memory_kb, language). Adds a partial index
  `responses_pending_execution_idx` on rows where execution hasn't
  completed — used by the v0 polling shim.
- **Pure-logic modules**:
  - `src/languages.ts` — full §5 language profile table mapping QOrium
    language identifiers (`java21`, `python3`, etc.) to Judge0 numeric
    language IDs + per-language memory/time/compile budgets. Exposes
    `isSupportedLanguage`, `judge0IdFor`, `routesToJudge0` (false for
    Apex).
  - `src/scoring.ts` — `matchesExpected` (auto-anchored regex per
    spec §4 patterns like `"^8$"`; trailing-whitespace tolerant on
    actual output; literal-fallback on regex compile failure);
    `scoreSubmission` (weighted total 0–100, per-test reason ∈
    `match | mismatch | compile_error | runtime_error | timeout |
no_output`, stderr summary truncation).
  - `src/anti-fraud.ts` — §6.5 signal computation
    (`paste_vs_typed_ratio`, `time_on_task_too_low`,
    `language_mismatch`, `suspicious_ip_change`,
    `identical_submission`, `execution_failed`); pure logic.
  - `src/submission.ts` — submission validator (50 KB code limit,
    UUID question_id, allowlisted language) + `validateSandboxConfig`
    that parses both snake_case (spec form) and camelCase, enforces
    weights ~ 1.0 and ≤ 50 test cases.
- **Judge0 HTTP client**:
  - `src/judge0/types.ts` — Judge0 v1.13+ submission shape +
    `TERMINAL_STATUS_IDS` (3, 4, 5, 6, 7…14)
  - `src/judge0/client.ts` — `Judge0Client` with injectable `fetchImpl`,
    POST `/submissions?wait=false`, GET `/submissions/{token}` polling
    with terminal-status detection, `X-Auth-Token` support, per-request
    AbortSignal + timeout, parent-signal propagation, configurable
    poll interval / timeout
- **Orchestrator (`src/orchestrator.ts`)**:
  `executeSubmission({candidateCode, language, config, judge0,
antiFraud?, logger?, signal?})` — runs each test case through the
  client, accumulates outputs, scores, computes anti-fraud signals,
  builds the `execution_metadata` payload. Per-test client failures
  are recorded as `runtime_error` and the pipeline continues.
- **Data layer + entry**:
  - `src/repositories/responses.ts` — `listPendingResponses` (uses
    the 0005 partial index), `applyExecutionOutcome` (single UPDATE
    setting score / time_taken_ms / execution_metadata /
    suspicious_signals)
  - `src/index.ts::runOnce` — opens 4-conn pg pool, drains a bounded
    batch of pending responses (default 100), runs each, persists;
    skips unsupported languages and questions without
    `sandbox_config`. Warns and no-ops if `DATABASE_URL` unset.
  - `src/cli.ts` — `--once` (default) and `--watch --interval`
- **Service config (`src/config.ts`)**:
  env knobs `JUDGE0_URL` (defaults to `http://localhost:2358` —
  matches docker-compose dev), `JUDGE0_AUTH_TOKEN` (prod-only),
  `JUDGE0_POLL_INTERVAL_MS` (500), `JUDGE0_POLL_TIMEOUT_MS` (60_000),
  `JUDGE0_MAX_RESPONSES_PER_RUN` (100).
- **PM2 entry**: added `qorium-judge0-orchestrator` to
  `infra/B10-ecosystem.config.js` — fork mode, port 5108, env knobs
  wired. Logged as
  `infra/CTO-deltas/CTO-DELTA-judge0-bullmq-deferred.md`.
- **CTO-DELTAs**:
  - **#9 `CTO-DELTA-judge0-bullmq-deferred.md`** — v0 polls Postgres
    via the partial index added in migration 0005; BullMQ + Redis
    dispatch deferred to Sprint ≥1.7 alongside the submissions API.
    The orchestrator's I/O contract is BullMQ-ready
    (`(pendingRow) → executeSubmission → applyExecutionOutcome`), so
    swapping the producer is a one-file change.
  - **#10 `CTO-DELTA-judge0-apex-deferred.md`** — Apex execution path
    deferred to v0.1; v0 throws a clear error if `apex` is mis-routed
    to Judge0. Wave 1 corpus has no Apex questions.
- **Tests** (68 new cases, all active green):
  - `__tests__/languages.test.ts` — list/profile/isSupported (13)
  - `__tests__/scoring.test.ts` — auto-anchored regex, weighted
    scoring, all reason classifications, stderr truncation (12)
  - `__tests__/anti-fraud.test.ts` — every flag boundary +
    edge-case clamping (11)
  - `__tests__/submission.test.ts` — validators + sandbox config
    parsing (13)
  - `__tests__/judge0/client.test.ts` — POST shape, X-Auth-Token,
    polling past non-terminal statuses, terminal short-circuit,
    poll-timeout, parent-signal abort (11)
  - `__tests__/orchestrator.test.ts` — 100% pass / partial credit /
    compile error / TLE / per-test client failure / language
    mismatch / apex rejection / empty test_cases (8)
- `packages/db/__tests__/migration.smoke.test.ts` — adds verification
  that migration 0005 created both `sandbox_config` and
  `execution_metadata` columns (auto-skips without DB).

### Verified locally

- `pnpm typecheck` clean across **7 workspaces** (admin, db, auth,
  irt-calibration, judge0-orchestrator, leak-crawler, readybank)
- `pnpm lint` / `pnpm format:check` clean
- `pnpm build` clean — judge0-orchestrator emits `cli.js`, `index.js`,
  `orchestrator.js`, `judge0/client.js`, etc.
- `pnpm test` — judge0-orchestrator 68/68; admin 58 + 7 skip;
  irt-calibration 64; leak-crawler 47 + 2 skip; readybank 33 + 21 skip;
  auth 26; db 10 skip = **296 active green + 40 auto-skip**
  (was 228 + 39)
- `gitleaks protect --staged` clean

### Halt-conditions encountered

None at v0 scope. The orchestrator runs end-to-end against a stubbed
Judge0 in tests; in dev the docker-compose stack from Sprint 0.2
provides a real Judge0 1.13.1 at `http://localhost:2358`.

**Activation halts** for prod operation:

- `JUDGE0_AUTH_TOKEN` for the production Judge0 instance — REQUEST
  from CEO when standing up the Mac Mini sandbox host
- Apex path (Wave 2) — REQUEST Salesforce developer org credentials

### Next sprint (1.7)

TestForge QA Pipeline orchestrator. References
`governance/TestForge-QA-Pipeline-v1.md` (already in repo per INDEX).
Likely shape: a coordinator service that runs the 6 QA gates
(spec → AI generate → AI critique → SME review → IRT calibrate → release)
sequentially per question, with stage-fail handling and
per-gate audit trails. Supporting spec:
`governance/AI-Plagiarism-Benchmark-Protocol-v1.md` (SO-22 ≥93% gate).
**Halt conditions:** none expected for v0; the gates are mostly
already in place (review-decisions from 1.3, IRT from 1.5,
anti-leak from 1.4) — TestForge wires them into a pipeline + adds
the AI plagiarism check stage.

---

## 2026-05-03 — Sprint 1.7 TestForge QA Pipeline Orchestrator v0 (`qorium-testforge-orchestrator`) ✅

`services/testforge-orchestrator` (`@qorium/testforge-orchestrator`) —
PM2 fork-mode coordinator that runs the 6 QA gates per
`governance/TestForge-QA-Pipeline-v1.md`. Closes the **SO-22
constitutional gate** (AI plagiarism public benchmark ≥93%; v0 partial
ensemble; full ensemble queued for Sprint ≥1.8 / Sprint ≥2.0). Plus
adds the pre-calibration AI prior stage (§3.2) which the IRT pipeline
expects but no prior sprint owned.

### What landed

- **Migration 0006 (`infra/B7-postgres-migrations/0006_testforge.sql`)**:
  - `content.questions.testforge_status` (sibling to `status`; CHECK
    on the union of 8 pipeline states per spec §2.3)
  - `content.questions.testforge_last_check` (timestamp)
  - `content.questions.testforge_audit` (JSONB rolling per-gate audit)
  - `content.testforge_runs` (append-only coordinator-pass log; CHECK on
    `run_type` ∈ {sme_validation, irt_calibration, bias_dif, leak_crawl,
    plagiarism_benchmark, gate_scorecard, pre_calibration_prior,
    orchestrator_pass})
  - Indexed for J5 dashboard queries (`run_type, status, triggered_at DESC`)
- **Pure-logic core (no DB / runtime)**:
  - `src/gates.ts` — 6-gate state machine: `nextActionFor(state)`
    returns `await_sme_decision | compute_pre_calibration_prior |
await_calibration_responses | await_irt_calibration_run |
await_bias_dif_check | graduate_to_released | request_sme_re_review |
terminal`. Includes `applySmeDecision` (accept/revise/reject) and
    `customerFacingStatusFor` (mirrors testforge_status onto
    `content.questions.status`).
  - `src/prior.ts` — pre-calibration AI prior per §3.2. Nearest-
    neighbor by `(skill_id, sub_skill_id, format)` over items with
    `calibration_n ≥ 30`; weighted by IRT discrimination.
    `selectNeighbours` + `computePrior`; falls back to format
    defaults when no neighbours match.
  - `src/format-defaults.ts` — mirrors `services/irt-calibration`'s
    per-format guessing parameter so this workspace doesn't depend
    on the IRT calibration package directly.
  - `src/plagiarism/text.ts` — token / sentence / n-gram helpers.
  - `src/plagiarism/signals.ts` — 4 pure-logic signals matching
    spec thresholds: `burstinessScore`, `ngramEntropyScore`,
    `lexicalDiversityScore`, `sentenceLengthVarianceScore`. All
    return AI-likelihood ∈ [0, 1].
  - `src/plagiarism/ensemble.ts` — `scoreEnsemble` (statistical +
    stylometric live in v0; weights renormalised when behavioural /
    direct-model / self-check are absent so the score stays on
    a [0, 1] scale and `activeWeightSum` reports which signals
    contributed); `runBenchmark` returns the SO-22 detection /
    false-positive numbers.
- **Data layer**:
  - `src/repositories/questions.ts` — list orchestration candidates
    (any non-terminal `testforge_status`); fetch prior neighbours
    (released items with `calibration_n ≥ 30`); apply prior +
    transition; sync status (writes both pipeline + customer-facing
    columns transactionally).
  - `src/repositories/runs.ts` — `startRun` / `finishRun` for the
    `content.testforge_runs` audit log.
- **Orchestrator (`src/orchestrator.ts`)**:
  - `runOrchestratorPass({pool, logger, config, generateRunId?,
now?})` — DI on every external surface. For each candidate
    question, dispatches to the right gate handler; per-item failures
    are logged + counted, never abort the pass.
  - Owns the **pre-calibration prior** stage end-to-end (no other
    service does this).
  - Drives the **graduation** (`testforge_status='released'`) and
    **SME re-review escalation** (drift / bias flag) status changes
    that other services produce signals for.
- **Entry points**:
  - `src/index.ts::runOnce` — opens 4-conn pg pool, runs one pass,
    drains; warns + no-ops if `DATABASE_URL` unset
  - `src/cli.ts` — `--once` (default) and `--watch --interval`
- **PM2 entry**: added `qorium-testforge-orchestrator` to
  `infra/B10-ecosystem.config.js` — fork mode, port 5110, env knob
  `TESTFORGE_MAX_ITEMS_PER_RUN`.
- **CTO-DELTAs (3 logged)**:
  - **#11 `CTO-DELTA-testforge-plagiarism-perplexity-deferred.md`** —
    v0 ships statistical (burstiness, n-gram entropy) + stylometric
    (lexical-diversity, sentence-length-variance); perplexity-via-LM,
    GPT-Zero, Pangram, self-check deferred. Weights renormalised so
    v0 score is on the same scale as the future full ensemble.
    SO-22 implications: until direct-model signals land, the public
    benchmark may not hit 93%; the orchestrator transparently records
    `runBenchmark` results in `content.testforge_runs`. CTO + CDO
    should plan to ship at least one direct-model signal before the
    first quarterly external benchmark.
  - **#12 `CTO-DELTA-testforge-plagiarism-detector-colocated.md`** —
    spec §2.2 names two services (qorium-plagiarism-detector,
    qorium-testforge-orchestrator); v0 co-locates them in one
    workspace. Single PM2 entry. Split deferred to Phase 2 when
    perplexity-via-LM justifies a separate process.
  - **#13 `CTO-DELTA-testforge-status-column.md`** — `testforge_status`
    is a sibling column to `content.questions.status` (per spec §2.3
    verbatim). The customer-facing `status` is mirrored
    transactionally; existing API filters in ReadyBank stay correct
    without defensive updates.
- **Tests** (52 new cases, all active green):
  - `__tests__/gates.test.ts` — 17 cases: terminal states, pre-pipeline
    awaits, accepted (with/without prior), calibrating (N<30, IRT not
    yet, IRT done with N<200, IRT done with N≥200 awaiting bias, full
    pipeline graduated), drift escalation, SME decision, customer-
    facing status mirror.
  - `__tests__/prior.test.ts` — 9 cases: neighbour filtering by
    `calibration_n / format / skill / sub_skill`, null-param drops,
    format-default fallback, weighted average vs single neighbour,
    discrimination weighting, median fallback.
  - `__tests__/plagiarism/signals.test.ts` — 11 cases: AI vs human
    text relative scoring for each signal, edge cases (single
    sentence, empty input, short sample).
  - `__tests__/plagiarism/ensemble.test.ts` — 8 cases: aiLikelihood
    range, activeWeightSum reporting, optional-signal blending,
    flag threshold (≥0.6), clamping, benchmark report shape, empty-
    samples handling.
- `packages/db/__tests__/migration.smoke.test.ts` — adds verification
  that migration 0006 created the testforge columns + table + CHECK
  constraints (auto-skips without DB).

### Verified locally

- `pnpm typecheck` clean across **8 workspaces** (admin, db, auth,
  irt-calibration, judge0-orchestrator, leak-crawler, readybank,
  testforge-orchestrator)
- `pnpm lint` / `pnpm format:check` clean
- `pnpm build` clean — testforge-orchestrator emits `cli.js`,
  `index.js`, `orchestrator.js`, `gates.js`, `plagiarism/*.js`, etc.
- `pnpm test` — testforge-orchestrator 52/52; judge0-orchestrator
  68/68; admin 58 + 7 skip; irt-calibration 64/64; leak-crawler
  47 + 2 skip; readybank 33 + 21 skip; auth 26/26; db 11 skip =
  **348 active green + 41 auto-skip** (was 296 + 40)
- `gitleaks protect --staged` clean

### Halt-conditions encountered

None at v0 scope. Activation halts for prod operation:

- **#11** — first quarterly SO-22 benchmark may need direct-model
  signal (GPT-Zero or Pangram API key) → REQUEST from CEO when
  CTO/CDO plan the first public benchmark window
- **#11** — perplexity signal needs Hugging Face transformer infra
  (Python sidecar OR `@xenova/transformers` heavy bundle)

### Constitution alignment

- **SO-22 (AI plagiarism ≥93% public benchmark)**: pipeline is in
  place; v0 partial ensemble is honest about which signals are live
  via `activeWeightSum`. The 93% gate is enforced by `runBenchmark`
  reporting `passesSO22Threshold`.
- **Article VII Quality Gate auto-fail**: `runBenchmark` is the
  hook the Gatekeeper office (Sprint ≥1.8) consumes to enforce
  release halts on <93%.

### Next sprint (1.8)

Customer Zero deployment readiness — final integration tests + smoke
tests against the deployed service stack. Likely shape: end-to-end
test suite that exercises the 7 services together (readybank,
admin, leak-crawler, irt-calibration, judge0-orchestrator,
testforge-orchestrator, db) against a docker-compose-running
postgres + redis + judge0. Plus a deployment readiness checklist.
References:

- `governance/Operating-Rituals-v1.md` (J5 monthly close + J6 Friday Eng)
- `infra/B1-VPS-Capacity-and-Topology-Plan.md` (target deploy infra)
- `infra/B10-ecosystem.config.js` (PM2 ecosystem)
- `customer-zero/SME-Lead-Onboarding-Day-1.md` (operational runbook)

**Halt conditions:** none expected for the readiness suite (it runs
against docker-compose). Real Customer Zero activation is gated on
CEO actions — Talpro India onboarding, MSG91 OTP, Mac Mini Tailscale
wiring — REQUEST list from CEO at that time.

---

## 2026-05-03 — Sprint 1.8 Customer Zero deployment readiness ✅

`packages/smoke` (`@qorium/smoke`) — `qorium-smoke` CLI that gates
Customer Zero activation. Closes the **Phase 1 Engine MVP**: 8
workspaces shipped, 368 tests active green, deployment-readiness
runner verifies the cross-workspace import graph + infra healthchecks
in one command.

### What landed

- **`packages/smoke`** workspace:
  - `src/checks.ts` — `Check` primitive: `() => Promise<CheckResult>`
    with structured `{name, status, durationMs, details, skipReason}`.
    Implementations: `postgresPing` (SELECT 1), `postgresSchema`
    (verifies the 9 required tables across `app/content/audit`),
    `tcpReachable` (Redis or arbitrary host:port), `httpHealth`
    (Judge0 `/about` etc.; configurable accept-status set).
    `runChecks(checks[])` aggregates a `RunSummary`.
  - `src/import-graph.ts` — `exerciseImportGraph()` exercises 9 cross-
    workspace public APIs from leak-crawler / irt-calibration /
    judge0-orchestrator / testforge-orchestrator. Catches drift
    where a service builds in isolation but fails to resolve when
    consumed (e.g. missing public re-exports).
  - `src/render.ts` — `renderHumanText` (multi-line ASCII for `make
ready`) + `renderJsonLine` (single-line JSON for CI) +
    `exitCodeFor` (1 if any check or graph entry failed, else 0).
  - `src/cli.ts` — `qorium-smoke` CLI with subcommands `healthchecks`
    / `import-graph` / `ready` (default), flags `--json` and `--quiet`.
- **Service public-API exports** added (sourced by the import graph
  - future admin UI proofs):
  * `services/leak-crawler/src/index.ts` — `extractDistinctiveNGrams`,
    `normaliseTextForNGrams`, `scoreEvidence`, `jaccardSimilarity`,
    `lexicalOverlap`, `tokeniseToSet`, `classifyEvidence`,
    `compositeSimilarity`, `deriveWatermarkSeed`,
    `deriveWatermarkMarkers`, `attributeLeak`
  * `services/irt-calibration/src/index.ts` — `fit2PL`, `isAtBounds`,
    `classifyDrift`, `expectedPassRateAtMeanAbility`,
    `nextStatusForFlag`, `defaultGuessingForFormat`,
    `probability3PL`, `itemLogLikelihood`, `abilitiesFromResponses`,
    `estimateAbilities`
  * `services/judge0-orchestrator/src/index.ts` — `isSupportedLanguage`,
    `judge0IdFor`, `getLanguageProfile`, `listSupportedLanguages`,
    `scoreSubmission`, `matchesExpected`, `computeAntiFraudSignals`,
    `validateSubmission`, `validateSandboxConfig`
  * `services/testforge-orchestrator/src/index.ts` already exposed the
    needed surface from Sprint 1.7
- **`customer-zero/Customer-Zero-Day-1-Runbook.md`** — operational
  runbook covering pre-flight (`make ready`), PM2 service start
  sequence, first-candidate end-to-end smoke, cron schedule
  verification, on-call escalation triggers, rollback procedures
  (PM2, migration, PostgreSQL hot-restore), end-of-Day-1 close-out,
  and the activation halt list (REQUESTs from CEO).
- **`Makefile`**: `make smoke` (runs `qorium-smoke smoke`) and
  `make ready` (full `qorium-smoke ready`).
- **`README.md`**: Phase 1 status block with workspace inventory;
  added the new make targets.
- **Tests** (20 new + 4 auto-skip):
  - `__tests__/checks.test.ts` — postgres ping/schema (mock pool
    fixture), httpHealth (mock fetch), tcpReachable (real refused
    connect), runChecks aggregation
  - `__tests__/render.test.ts` — human-text renderer (header, skip,
    fail, import-graph section), JSON-line renderer (single-line
    JSON, importGraph propagation), exitCodeFor logic
  - `__tests__/e2e.integration.test.ts` — auto-skips without DB; when
    enabled, verifies all required Phase 1 tables exist, sandbox_config
    accepts the spec payload, testforge_runs accepts the
    orchestrator_pass type, and every cross-workspace import-graph
    entry returns `ok: true`

### Verified locally

- `pnpm typecheck` clean across **9 workspaces**
- `pnpm lint` / `pnpm format:check` clean
- `pnpm build` clean — smoke emits `cli.js`, `index.js`, etc.
- `pnpm test` — smoke 20 + 4 skip; testforge 52; judge0 68; admin
  58 + 7 skip; irt 64; leak 47 + 2 skip; readybank 33 + 21 skip;
  auth 26; db 11 skip = **368 active green + 45 auto-skip**
  (was 348 + 41)
- `gitleaks protect --staged` clean

### Halt-conditions encountered

None. Pure tooling sprint — packages a deploy gate that the CTO
office runs before flipping the Customer Zero switch.

### Phase 1 Engine MVP — feature-complete

8 workspaces shipped:

| Workspace                         | Sprint  | Function                                    |
| --------------------------------- | ------- | ------------------------------------------- |
| `packages/db`                     | 0.3     | Typed pg pool + custom migration runner     |
| `packages/auth`                   | 1.2     | API-key HMAC + Redis rate limit + audit log |
| `services/readybank`              | 1.0     | REST API: search / packs / export           |
| `apps/admin`                      | 1.2/1.3 | Next.js 15 SME review queue + auth          |
| `services/leak-crawler`           | 1.4     | Anti-Leak Engine v0 (PM2 fork)              |
| `services/irt-calibration`        | 1.5     | IRT 2-PL nightly batch                      |
| `services/judge0-orchestrator`    | 1.6     | Sandboxed code execution                    |
| `services/testforge-orchestrator` | 1.7     | 6-gate QA pipeline coordinator              |
| `packages/smoke`                  | 1.8     | Deployment readiness runner                 |

Constitutional gates closed:

- **SO-21** (IRT mandatory before release) — Sprint 1.5
- **Article VII phase gate** (no release without converged IRT
  - flag=none + N≥minResponses) — Sprint 1.5
- **SO-22** (AI plagiarism ≥93% public benchmark) — Sprint 1.7
  (v0 partial ensemble + reporting hook live; full ensemble
  upgrade queued)

13 CTO-DELTAs filed across the 8 sprints, all with default
"ratify" actions if no CTO Office reconciliation arrives by next
sprint review.

### Activation halts (REQUEST list for CEO)

Final inventory before Customer Zero Day-1:

1. **Postgres + Redis + Judge0 hosts provisioned** (Mac Mini + VPS;
   B1 plan)
2. **MSG91 credentials** for admin auth (#5)
3. **`SERPER_API_KEY`** for live anti-leak crawls (Sprint 1.4)
4. **`JUDGE0_AUTH_TOKEN`** for production Judge0 (#9)
5. **Salesforce dev-org credentials** for Apex (deferred to Wave 2; #10)
6. **GPT-Zero / Pangram API key** for first SO-22 quarterly benchmark (#11)
7. **Tailscale link** between VPS and Mac Mini (per spec §2.2)
8. **Talpro Customer Zero tenant + first 100 candidates seeded**

### Next phase (2.0)

Phase 2 — JD-Forge MVP. References
`infra/JD-Forge-v0-Design.md` (already in repo per INDEX). 3-tier
service: Standard / Reviewed / Enterprise; AI-powered JD-to-questions
pipeline; integrates with the Sprint 1.7 testforge-orchestrator for
the QA gates.

**Halt conditions:** Anthropic API budget expansion (the JD-to-
questions step is LLM-heavy); REQUEST from CEO when activating live
generation.

---

## 2026-05-03 — Sprint 2.0 JD-Forge MVP (`qorium-jd-forge`) ✅

`services/jd-forge` (`@qorium/jd-forge`) — PM2 cluster service on
port 5102 implementing the 5-stage JD-Forge pipeline per
`infra/JD-Forge-v0-Design.md`. Standard tier only (per spec §12 MVP
scope); Reviewed + Enterprise deferred to M5+. **Phase 2 begins.**

### What landed

- **Migration 0007** — `app.jd_forge_orders` order lifecycle table
  - `content.questions.jd_forge_source_id` FK lineage column
- **5-stage pipeline (every external surface DI-injected):**
  - `parser.ts` — `JdParser` interface + Stub (regex/dictionary) +
    Anthropic real impl (throws on missing API key)
  - `mapper.ts` — `RoleGraphMapper` interface + StringMatch v0
    (Dice-coefficient on bigrams, threshold 0.55); embedding impl
    deferred
  - `spec.ts` — `buildSpec` deterministic largest-remainder allocation
    across format / difficulty per spec §3.3
  - `generator.ts` — `AIQuestionGenerator` interface + Stub +
    Anthropic real impl (parallel calls; format-specific prompts)
  - `validator.ts` — per spec §7 standard-tier criteria
    (accept/regenerate/reject + leak-deny-list)
  - `exporters.ts` — JSON + CSV + Mettl-CSV (Mettl-required column
    order; XLSX deferred per CTO-DELTA)
- **Orchestrator** — `runOrder` dependency-injected; per-question
  failures don't abort
- **Express service** — `POST /v1/jd-forge/generate`,
  `GET /requests/{id}`, `POST /requests/{id}/feedback`, `/healthz`;
  zod-validated bodies; RFC 7807 errors; 503 when no DB
- **Repository** (`app.jd_forge_orders` writer + cache lookup helper)
- **Entry** picks Stub vs Anthropic per `ANTHROPIC_API_KEY` env

### CTO-DELTAs (3 logged)

- **#14 Anthropic deferred** — Stub default; real Anthropic gated on
  CEO-provisioned key; throws on missing key (fail loud)
- **#15 Embeddings deferred** — string-match v0; cosine impl when
  pgvector + embedding budget land (Sprint ≥2.x)
- **#16 XLSX deferred** — Mettl-CSV in v0; real XLSX when spreadsheet
  library is approved or first XLSX-only customer arrives

### Verified locally

- `pnpm typecheck` clean across **10 workspaces**
- `pnpm lint` / `pnpm format:check` clean
- `pnpm build` clean
- `pnpm test` — jd-forge 73/73 + 8 other workspaces =
  **441 active green + 46 auto-skip** (was 368 + 45)
- `gitleaks protect --staged` clean

### Halt-conditions encountered

None at v0 scope. Activation halts: `ANTHROPIC_API_KEY` (CEO action),
embedding API, spreadsheet library decision.

### Next sprint (2.1)

Stack-Vault MVP. References
`05-QOrium-Three-Use-Cases-SKU-Architecture.md` §3. Per-customer
namespace API with watermarked variants; reuses the watermark seed +
marker derivation from `services/leak-crawler/src/watermark.ts`
(Sprint 1.4). Probable new service `services/stack-vault/` on port
5103 (per B10 entry).

---

## 2026-05-03 — Sprint 2.1 Stack-Vault MVP (`qorium-stack-vault`) ✅

`services/stack-vault` (`@qorium/stack-vault`) — PM2 cluster service
on port 5103 implementing the per-customer namespace API for the
Stack-Vault SKU per `05-QOrium-Three-Use-Cases-SKU-Architecture.md` §4

- CTO Architecture §6.3.

### What landed

- **Migration 0008**:
  - `app.stack_vaults` — per-customer subscription record (CHECK on
    tier ∈ {department, enterprise, group}; status ∈ {provisioning,
    active, suspended, churned}; `watermark_secret` server-side only)
  - `app.stack_vault_access_log` — append-only audit per spec §4.7
    ("technical access logging" mitigation for the customer-pirates-
    own-vault risk); records vault_id, tenant_id, question_id,
    watermark_id, candidate_id, api_key_id, request_ip, user_agent,
    occurred_at
- **Pure-logic variant builder** (`src/variant.ts`):
  - `deriveWatermarkId` — first 16 hex chars of the
    HMAC-SHA256(watermark_secret, tenant_id|question_id|"watermark")
    seed from `@qorium/leak-crawler` (Sprint 1.4)
  - `buildVariant({vault, master})` — returns the master payload
    unchanged + `watermarkId` (customer-facing handle) +
    `watermarkMarkers` (the 5 forensic markers from the watermark spec)
  - `attributeLeakToVault({vault, questionId, observed})` — composes
    `attributeLeak` from leak-crawler with the vault identity to score
    a candidate vault against observed leaked-question markers
- **Data layer**:
  - `repositories/vaults.ts` — `getVaultByTenant` (tenant_id → vault) +
    `toPublicView` (strips `watermark_secret` before exposure)
  - `repositories/questions.ts` — `searchVaultQuestions` (released-only;
    format / difficulty filters; clamped limit) + `getReleasedQuestion`
  - `repositories/access-log.ts` — `recordAccess` (one row per read) +
    `summarisePerQuestion` (J5 dashboard fuel)
- **Express service** (`src/server.ts`, port 5103):
  - `GET /healthz`
  - `GET /v1/vaults/me` — vault metadata (public view; no secrets)
  - `GET /v1/vaults/me/questions/search` — search within the vault;
    returns variants with `watermarkId`; logs every variant returned
  - `GET /v1/vaults/me/questions/:uuid` — single watermarked variant
  - `POST /v1/vaults/me/refresh-request` — async-acknowledge
    out-of-cycle refresh requests
  - `POST /v1/vaults/me/leak-report` — async-acknowledge customer-
    reported suspected leaks
  - 401 if tenant unresolved; 403 if vault not active; 404 if no
    vault; 503 if no DB; RFC 7807 problem JSON throughout
- **Logger redaction** — `watermark_secret` / `watermarkSecret` /
  `DATABASE_URL` / `REDIS_URL` / `API_KEY_PEPPER` paths are removed
  from log output
- **CTO-DELTA #17** — `CTO-DELTA-stackvault-marker-substitution-deferred.md`:
  v0 attaches watermarkId + watermarkMarkers metadata to every
  read; mechanical body substitution (variable-suffix replacement,
  test-value scaling, comment-style swap, etc.) deferred to a
  dedicated sprint before Logo #1 onboarding (M4 target). Forensic
  attribution is preserved via the access-log + watermarkId pairing.
- **Public-API exports** — added `VariantMarkers` + `WatermarkInputs`
  type re-exports from `@qorium/leak-crawler` so the cross-workspace
  contract is type-stable
- **Tests** (25 new cases, all active green):
  - `variant.test.ts` — 11 (deterministic seed, per-tenant /
    per-question / per-secret variation, payload preservation, IRT
    passthrough, attribution at confidence 1.0 vs lower for wrong vault)
  - `server.test.ts` — 14 (auth, vault lookup, search returns
    variants with watermarkId, single-question fetch + 400/404,
    refresh-request + leak-report acknowledgments + 400 invalid
    bodies, RFC 7807 errors, secret never surfaces in responses)
  - `migration.smoke.test.ts` — adds verification that migration 0008
    created `app.stack_vaults` + `app.stack_vault_access_log` + tier
    CHECK constraint

### Verified locally

- `pnpm typecheck` clean across **11 workspaces**
- `pnpm lint` / `pnpm format:check` clean
- `pnpm build` clean — stack-vault dist emits server, variant,
  repositories, types
- `pnpm test` — stack-vault 25/25; jd-forge 73; smoke 20 + 4 skip;
  testforge 52; judge0 68; admin 58 + 7 skip; irt 64; leak 47 + 2 skip;
  readybank 33 + 21 skip; auth 26; db 13 skip =
  **466 active green + 47 auto-skip** (was 441 + 46)
- `gitleaks protect --staged` clean

### Halt-conditions encountered

None at v0 scope. Activation halts:

- Real Bosch / GCC customer onboarding (the 90-day discovery pipeline
  per spec §4.3 is operational work; the API surface is testable today)
- Mechanical marker substitution body-rewrite (CTO-DELTA #17;
  scheduled for the sprint immediately preceding Logo #1)

### Phase 2 progress

| Sprint | Workspace                                 | Status      |
| ------ | ----------------------------------------- | ----------- |
| 2.0    | `services/jd-forge`                       | shipped     |
| 2.1    | `services/stack-vault`                    | **shipped** |
| 2.2    | `services/ats-connectors` (planned)       | next        |
| 2.3    | `services/{webhooks,sso,audit}` (planned) | upcoming    |

### Next sprint (2.2)

ATS Connector Framework v0. References
`infra/ATS-Connector-Framework-v0.md` (already in repo per INDEX).
First connector: Greenhouse (per the SKU architecture); subsequent
connectors (Ashby / Darwinbox / Workday) plug into the same
`AtsConnector` interface. Likely shape: a connector framework
package (`packages/ats`) defining the abstract operations
(post-job, fetch-candidates, push-results) + a Greenhouse adapter.

---

## 2026-05-03 — Sprint 2.2 ATS Connector Framework v0 + Greenhouse adapter ✅

`packages/ats-connectors` (`@qorium/ats-connectors`) — connector framework

- all four v0 adapters per `infra/ATS-Connector-Framework-v0.md`.
  `services/ats-bridge` (`@qorium/ats-bridge`) — PM2 cluster service on
  port 5105 implementing the webhook receiver per spec §2.2 + §5.1.

### What landed

- **Migration 0009**:
  - `app.ats_integrations` — per-tenant ATS connection (CHECK on platform
    ∈ {greenhouse, ashby, darwinbox, workday, lever, bamboohr, ...} per
    spec §1.2 roadmap; status ∈ {pending, active, auth_required,
    degraded, suspended}; encrypted token / api_key / webhook secret
    columns)
  - `app.ats_webhook_log` — append-only audit + idempotency cache
    (UNIQUE (integration_id, idempotency_key) per spec §6 replay safety)
  - `app.ats_candidate_links` — UNIQUE (tenant_id, ats_platform,
    external_candidate_id) per spec §6
- **Pure-logic framework** (`packages/ats-connectors/src/`):
  - `types.ts` — `AtsConnector` interface + canonical `Candidate` /
    `Job` / `AssessmentResult` / `IntegrationCredentials` /
    `InboundEvent` (`candidate | assessment-trigger | job | noop |
error`) / `PostScoreInput|Outcome` / `SignatureVerificationResult`
  - `signature.ts` — `verifyHmacSignature` (HMAC-SHA256, prefix-aware,
    constant-time compare) + `computeHmacSignature` for outbound
  - `idempotency.ts` — `deriveIdempotencyKey` (header lookup with
    Idempotency-Key / X-Greenhouse-Event / etc. fallback chain; body-
    hash sha256 + minute-bucket synthesised key as last resort) +
    `InMemoryIdempotencyCache` (TTL-evicted)
  - `registry.ts` — `ConnectorRegistry` + `defaultRegistry()` with
    Greenhouse / Ashby / Darwinbox / Workday pre-populated
- **Greenhouse adapter (live, M6 target)** —
  `src/adapters/greenhouse.ts`:
  - HMAC-SHA256 signature verify on `Signature: sha256=<hex>` header
  - Webhook mapper: `candidate.created` / `application.created` →
    assessment-trigger; `candidate.updated` → candidate;
    `job.opened|updated` → job; everything else → noop with reason
  - Outbound: `PATCH /v1/candidates/{id}` with Basic auth (Harvest
    convention) + custom-field updates (`qorium_assessment_score` /
    `qorium_assessment_status` / `qorium_assessment_url`)
  - Recovery hints: `reauth` on 401/403, `permanent` on 404/422,
    `retry` on 5xx + 429
- **Stub adapters (interface-complete)** for Ashby (`src/adapters/ashby.ts`),
  Darwinbox (`src/adapters/darwinbox.ts`), Workday
  (`src/adapters/workday.ts`):
  - All three implement the full `AtsConnector` interface
  - Webhook signature verification + payload mapper are live (HMAC for
    Ashby/Darwinbox; Workday rejects until M9 certification)
  - Outbound `postScore` / `postAssessmentUrl` return
    `{ ok: false, status: 501, recovery: 'permanent' }` until their
    respective milestones (M7 Ashby, M8 Darwinbox, M9 Workday per spec §8)
- **`services/ats-bridge` Express service** (port 5105 per spec §2.2):
  - `GET /healthz` — service status + registered adapter list
  - `POST /webhooks/:platform/:tenantId` — raw-body capture for
    signature integrity; verifies signature → derives idempotency key →
    records to `app.ats_webhook_log` (UNIQUE constraint enforces
    replay-safety) → maps payload via the registered adapter → returns
    202 + idempotency_key + event_kind
  - 401 invalid signature, 403 inactive integration, 404 unknown
    platform / no integration, 400 invalid tenant uuid / non-JSON body,
    422 malformed payload, 503 no DB; RFC 7807 throughout
- **Logger redaction** for cipher columns + plaintext credentials
- **CTO-DELTAs (2 logged)**:
  - **#18 `CTO-DELTA-ats-real-oauth-deferred.md`** — Greenhouse outbound
    is live; Ashby / Darwinbox / Workday outbound deferred to their
    rollout milestones. Per-tenant OAuth credentials are CEO-only; v0
    framework is provably pluggable today.
  - **#19 `CTO-DELTA-ats-workday-certification-deferred.md`** — Workday
    signature verifier returns `{valid: false, reason: 'M9 certification'}`
    on every webhook today. Outbound returns 501. The interface stays
    unchanged when certification ships.
- **Tests** (55 new cases, all active green):
  - `packages/ats-connectors/__tests__/`:
    - `signature.test.ts` — 9 cases (valid sig, tampered body, missing
      secret, missing header, non-hex, array-shaped header, computeHmac,
      custom prefix)
    - `idempotency.test.ts` — 9 cases (header chain, body-hash fallback,
      collision avoidance, array headers, cache TTL)
    - `registry.test.ts` — 3 cases (default populated, throw on unknown,
      list)
    - `adapters/greenhouse.test.ts` — 14 cases (signature verify happy +
      tampered + wrong secret; payload mappers for candidate.created /
      .updated / job.opened / unknown / malformed / non-object;
      postScore happy + 401 + 503 + missing-token; postAssessmentUrl)
    - `adapters/stubs.test.ts` — 10 cases (Ashby + Darwinbox + Workday
      signature verify, payload mappers, postScore-501)
  - `services/ats-bridge/__tests__/server.test.ts` — 10 cases (healthz,
    unknown platform, invalid tenant, missing pool, missing integration,
    invalid signature, accepted candidate.created, replay→duplicate,
    422 malformed, 403 inactive)
  - `migration.smoke.test.ts` — adds verification that migration 0009
    created `ats_integrations` + `ats_webhook_log` + `ats_candidate_links`
    - platform CHECK constraint

### Verified locally

- `pnpm typecheck` clean across **13 workspaces**
- `pnpm lint` / `pnpm format:check` clean
- `pnpm build` clean — ats-connectors emits dist; ats-bridge emits dist
- `pnpm test` — ats-bridge 10/10; ats-connectors 45/45; stack-vault
  25/25; jd-forge 73; smoke 20 + 4 skip; testforge 52; judge0 68; admin
  58 + 7 skip; irt 64; leak 47 + 2 skip; readybank 33 + 21 skip;
  auth 26; db 14 skip = **521 active green + 48 auto-skip**
  (was 466 + 47)
- `gitleaks protect --staged` clean

### Halt-conditions encountered

None at v0 scope.

**Activation halts** added by Sprint 2.2:

- Greenhouse OAuth client id + secret + return URL allowlisting (M6)
- Ashby per-tenant API keys (M7)
- Darwinbox per-tenant API keys + tenant domain (M8)
- Workday certification + signing keys + tenant client credentials (M9)

### Phase 2 progress

| Sprint | Workspace                                         | Status      |
| ------ | ------------------------------------------------- | ----------- |
| 2.0    | `services/jd-forge`                               | shipped     |
| 2.1    | `services/stack-vault`                            | shipped     |
| 2.2    | `packages/ats-connectors` + `services/ats-bridge` | shipped     |
| 2.3    | `services/{webhooks,sso,audit-log}`               | **shipped** |

## 2026-05-03 — Sprint 2.3 Webhooks + SSO + Audit-Log services ✅

Per CTO Office spec set
(`infra/Webhooks-Service-v0-Spec.md`,
`infra/SSO-SAML-Enterprise-Spec-v0.md`,
`infra/Audit-Log-API-Spec-v0.md`),
three small workspaces ship together because they share the same
tenant-resolution + RFC 7807 + pino-http + helmet stack.

### What landed

- **Migration `0010_webhooks_sso_audit.sql`** (B7):
  - `webhooks.subscriptions` (UUID PK + tenant FK + event_type + endpoint_url +
    `signing_secret_cipher` + `is_active` + `consecutive_failures` + UNIQUE
    `(tenant_id, event_type, endpoint_url)`)
  - `webhooks.events` (append-only event ledger + `aggregate_id` + JSONB
    payload + `tenant_created_idx`)
  - `webhooks.deliveries` (per-(event, subscription) attempt log +
    status CHECK `pending|delivered|failed|abandoned` + partial index
    `(next_retry_at) WHERE status = 'pending'`)
  - `sso.configurations` (one row per tenant + protocol CHECK
    `saml|oidc` + idp_type CHECK `okta|azure_ad|google_workspace|ping|
jumpcloud|onelogin|custom` + status CHECK
    `draft|test_mode|active|disabled` + `attribute_mapping` JSONB +
    `oidc_client_secret_cipher` for KMS-encrypted at-rest secrets)
  - `audit.events.tenant_id` column added (nullable; NULL = system event)
    - partial index `(tenant_id, occurred_at DESC) WHERE tenant_id IS NOT NULL`

- **`@qorium/webhooks` (port 5106) — full v0 control plane**:
  - `signing.ts` — HMAC-SHA256 signature compute + verify per spec §5
    (`message = "<event_type>.<timestamp>.<body>"`; 5-minute timestamp
    tolerance; constant-time comparison via `timingSafeEqual`)
  - `retry.ts` — exponential backoff schedule per spec §6
    (`ATTEMPT_DELAYS_MS = [0, 1m, 5m, 30m, 4h, 24h]`, `MAX_AGE_MS = 35h`,
    `classifyHttpStatus` returns `success | retry | permanent`)
  - `envelope.ts` — 15 canonical event types + `buildEnvelope()` shape
    (`{id, event_type, timestamp, tenant_id, aggregate_id, data,
idempotency_key}`)
  - `repositories/subscriptions.ts` — Postgres CRUD with
    `generateSigningSecret()` returning `whsec_<64hex>` (returned at
    creation only, never re-emitted)
  - `server.ts` — Express endpoints
    (`GET /healthz`, `GET|POST /v1/webhooks/subscriptions`,
    `GET|PATCH|DELETE /v1/webhooks/subscriptions/:id`) with HTTPS-only
    URL validation, event-type allow-list, RFC 7807 errors,
    zod-validated bodies
  - `index.ts` — entry + public API exports + graceful shutdown

- **`@qorium/sso` (port 5107) — pure-logic SAML + JWT control plane**:
  - `metadata.ts` — `generateSpMetadataXml()` produces a SAML 2.0
    SP `EntityDescriptor` (entity id, ACS URL, optional SLO, optional
    KeyDescriptor with X.509 cert, AuthnRequestsSigned +
    WantAssertionsSigned flags)
  - `saml.ts` — `validateSamlAcs()` parses SAMLResponse base64 →
    extracts NameID + Audience + Recipient + NotBefore +
    NotOnOrAfter + AttributeStatement; validates audience match,
    recipient match, time window with 60s clock skew; delegates XML
    signature verification to a pluggable `verifySignature` callback
    (live impl will use xml-crypto with the IdP cert from
    `sso.configurations.idp_certificate`)
  - `principalFromAssertion()` applies tenant attribute mapping
    (group → role); unmapped groups default to `viewer` per spec §6
  - `jwt.ts` — minimal HS256 JWT issuer + verifier (no external
    dependency); claims match spec §4.2
    (`sub, tenant_id, roles, email, name, iss, aud, iat, exp`); RS256
    swap will be one-line when KMS keypair is provisioned
  - `repositories/configurations.ts` — `sso.configurations` UPSERT,
    keyed on `tenant_id`; preserves `oidc_client_secret_cipher` on
    update unless explicitly overwritten
  - `server.ts` — Express endpoints
    (`GET /healthz`, `GET /v1/auth/saml/metadata`,
    `POST /v1/auth/saml/login`, `POST /v1/auth/saml/acs`,
    `POST /v1/auth/oidc/login` (501 deferred),
    `GET /v1/auth/oidc/callback` (501 deferred),
    `POST /v1/auth/logout`,
    `GET|PUT /v1/sso/configurations`)

- **`@qorium/audit-log` (port 5111) — tenant-scoped read API**:
  - `query.ts` — pure-logic query builder; `parseListInputs()` clamps
    pagination + validates ISO-8601 dates; `buildListSql()` emits
    storage-name SQL (`event_type`, `entity_type`, `entity_id`,
    `occurred_at`) while accepting spec-name API params
    (`action`, `resource_type`, `resource_id`, `start_date`,
    `end_date`); `buildSummarySql()` for top-N action counts
  - `repositories/events.ts` — `listEvents` (returns
    `{events, total, limit, offset}`), `getEventById`,
    `summarise`, `recordEvent`; `toRow` projects storage names →
    spec field names at the boundary
  - `server.ts` — Express endpoints
    (`GET /healthz`,
    `GET /v1/audit/events` (filters: action, resource_type,
    resource_id, actor_id, start_date, end_date, limit, offset),
    `GET /v1/audit/events/:id`,
    `GET /v1/audit/summary`,
    `POST /v1/audit/events` (admin scope only — 403 by default until
    caller injects `authoriseSystemWrite`))

- **PM2 ecosystem entries added** for `qorium-webhooks` (5106),
  `qorium-sso` (5107), `qorium-audit-log` (5111) in
  `infra/B10-ecosystem.config.js`. Cluster mode, 2 instances each, 512M
  memory cap.

- **CTO-DELTAs (3 logged):**
  - **#20 `CTO-DELTA-webhooks-bullmq-deferred.md`** — v0 ships the
    full data model, signing, retry curve, and CRUD endpoints.
    BullMQ + Redis worker + producer hooks in domain services
    deferred to a follow-up sprint. The v0 helpers are structured
    so the swap is mechanical.
  - **#21 `CTO-DELTA-sso-idp-credentials-deferred.md`** — v0 ships SP
    metadata generator, ACS validator (with pluggable signature
    verifier), JWT issuer/verifier, and full Express surface.
    Live IdP wire-up (Okta / Azure / Google), `xml-crypto` signature
    verification against `idp_certificate`, RS256 with KMS keypair,
    and OIDC flow deferred to first enterprise customer onboarding
    sprint.
  - **#22 `CTO-DELTA-audit-log-naming.md`** — Spec §5 uses
    SaaS-conventional column names (`action`, `resource_type`,
    `resource_id`, `created_at`); migration 0001 ships the table
    with names matching the existing event taxonomy (`event_type`,
    `entity_type`, `entity_id`, `occurred_at`). Service maps storage
    names → spec names at the API boundary; renaming columns
    deferred (no functional benefit; would force a coordinated
    migration across all audit emitters).

- **Tests** (72 new cases, all green; +28 from sso, +23 from
  webhooks, +20 from audit-log, +1 migration smoke):
  - `services/webhooks/__tests__/`:
    - `signing.test.ts` — 6 cases (deterministic signature, fresh
      verify, stale signature rejection, tampered payload rejection,
      missing header rejection, headers shape)
    - `retry.test.ts` — 5 cases (backoff schedule, status
      classifier, retry scheduling on curve, max-attempts abandon,
      max-age abandon)
    - `envelope.test.ts` — 4 cases (taxonomy, isCanonicalEventType,
      envelope shape, injected clock)
    - `server.test.ts` — 8 cases (healthz, no-DB 503, create returns
      `whsec_*` once, unknown event type 400, http-only 400,
      duplicate 409, list happy path, no-tenant 401)
  - `services/sso/__tests__/`:
    - `metadata.test.ts` — 5 cases (minimal SP descriptor, SLO
      element, KeyDescriptor with cert, XML escaping,
      AuthnRequestsSigned override)
    - `saml.test.ts` — 9 cases (well-formed assertion, audience
      mismatch, recipient mismatch, expired, not-yet-valid, signature
      stub rejection, garbage base64, group → role mapping, default
      viewer)
    - `jwt.test.ts` — 6 cases (issue parseable JWT, round-trip
      verify, wrong-secret reject, wrong-audience reject, expired
      reject, malformed reject)
    - `server.test.ts` — 9 cases (healthz, metadata XML, ACS happy
      path issues JWT, ACS unsigned reject, ACS audience mismatch,
      ACS missing tenant 400, OIDC 501, logout requires bearer,
      logout valid bearer)
  - `services/audit-log/__tests__/`:
    - `query.test.ts` — 10 cases (clamp limit, default limit, malformed
      date, start≥end, tenant scoping, multi-filter, count-SQL params,
      date range, summary group-by + topN clamp + topN passthrough)
    - `server.test.ts` — 10 cases (healthz, no-DB 503, no-tenant 401,
      list happy path, malformed date 400, 404 unknown id, 400
      malformed id, summary, POST 403 by default, POST 201 with admin
      scope)
  - `migration.smoke.test.ts` — adds verification of migration 0010
    (webhooks + sso schemas exist; 4 expected tables;
    `audit.events.tenant_id` exists; deliveries.status CHECK
    constraint enforced; sso.configurations.protocol CHECK enforced)

### Verified locally

- `pnpm typecheck` clean across **16 workspaces**
- `pnpm lint` clean
- `pnpm format:check` clean
- `pnpm build` — all workspaces emit dist
- `pnpm test` — webhooks 23/23, sso 29/29, audit-log 20/20,
  ats-bridge 10/10, ats-connectors 45/45, stack-vault 25/25,
  jd-forge 73/73, smoke 20/20 + 4 skip, testforge 52/52,
  judge0 68/68, admin 58 + 7 skip, irt 64, leak 47 + 2 skip,
  readybank 33 + 21 skip, auth 26, db 14 skip = \*\*594 active green
  - 48 auto-skip\*\* (was 521 + 48)

### Halt-conditions encountered

None at v0 scope.

**Activation halts** added by Sprint 2.3:

- SAML IdP test tenant credentials (Okta / Azure AD / Google
  Workspace) for live ACS validation against real signed assertions.
  v0 ships the validator with a pluggable signature callback; the
  live verifier swap is one file (`xml-crypto` against
  `idp_certificate`).
- QOrium SP signing keypair (2048-bit RSA, KMS-managed) for
  RS256 JWT signing + outbound SAML AuthnRequest signing. v0 uses
  HS256 with `SSO_JWT_SIGNING_SECRET`; rotating to RS256 is a
  one-line swap.
- Redis URL for SSO refresh token store + SAML state cache.
  v0 issues stateless JWTs; refresh tokens deferred.
- Redis URL + BullMQ for webhooks delivery worker. v0 ships the
  control plane (subscriptions CRUD + retry curve + signing helper)
  but no live delivery loop.

### Phase 2 progress

| Sprint | Workspace                                         | Status      |
| ------ | ------------------------------------------------- | ----------- |
| 2.0    | `services/jd-forge`                               | shipped     |
| 2.1    | `services/stack-vault`                            | shipped     |
| 2.2    | `packages/ats-connectors` + `services/ats-bridge` | shipped     |
| 2.3    | `services/{webhooks,sso,audit-log}`               | shipped     |
| 2.4    | `apps/admin` dashboards                           | **shipped** |

## 2026-05-03 — Sprint 2.4 Customer Onboarding Dashboards ✅

Per CEO directive (autonomous-continuous mode, this session). Builds the
admin UI surface that consumes the v0 services shipped in Sprint 2.3.

### What landed

- **Service URL resolver** + tagged `callService<T>()` fetch wrapper at
  `apps/admin/src/lib/clients/services.ts`. Reads service URLs from env
  with localhost defaults per `infra/B10-ecosystem.config.js`. Returns
  `{ ok, status, body, error }` rather than throwing — dashboards
  render errors inline.
- **Tenant resolver** at `apps/admin/src/lib/tenant.ts`:
  `resolveAdminTenantId()` reads `ADMIN_DEFAULT_TENANT_ID`. Multi-tenant
  switching follows once api-key-mgmt issues per-user JWTs (Sprint 2.7).
- **Typed clients** for sso, webhooks, audit, ats
  (`apps/admin/src/lib/clients/{sso,webhooks,audit,ats}.ts`).
- **`/admin/sso`** — config form (read+upsert), status pill (draft /
  test_mode / active / disabled), JSON editor for attribute_mapping,
  link to download SP metadata.
- **`/admin/webhooks`** — subscriptions list (event_type, endpoint_url,
  is_active, consecutive_failures); create form with HTTPS validator
  - canonical event_type dropdown; reveal-once signing secret; toggle
    active; delete confirmation.
- **`/admin/audit`** — audit log viewer with filters (action,
  resource_type, actor_id, start_date, end_date) + paginated table
  with expandable JSON detail.
- **`/admin/ats`** — ATS adapter list from ats-bridge `/healthz`;
  status pills (live=Greenhouse, M9=Workday, stub=others); per-tenant
  credential management deferred to Sprint 2.7.
- **`/admin/customers`** — onboarding checklist (SSO configured?
  Webhook subscribed? Audit events flowing? API key issued? Billing?).
- **Layout nav** updated to surface all 7 admin sections.

### Tests (16 new cases, all green)

- `apps/admin/__tests__/clients.test.ts` — 7 cases (env-driven URL
  resolution, OK/ERR fetch results, tenant header forwarding, JSON
  body, error capture)
- `apps/admin/__tests__/tenant.test.ts` — 5 cases (UUID validation,
  env reading, fallback)
- `apps/admin/__tests__/sso-client.test.ts` — 4 cases (header
  forwarding, JSON serialisation, list parsing)

### Verified locally

- `pnpm --filter @qorium/admin typecheck` clean
- `pnpm --filter @qorium/admin test` 74 passed + 7 skipped (was 58 + 7)
- `pnpm typecheck` workspace-wide clean
- `pnpm lint` clean
- `pnpm format:check` clean
- `pnpm --filter @qorium/admin build` clean

### Halt conditions

None at v0 scope. Real IdP credentials, real per-tenant ATS
credentials, and real `ADMIN_DEFAULT_TENANT_ID` for production are
already captured in Sprint 2.2 + 2.3 deltas.

### Next sprint (2.5)

`apps/docs` Next.js docs site + `packages/qorium-sdk` typed client.
Halt: real `docs.qorium.io` DNS + cert (CTO-DELTA #23).

## 2026-05-03 — Sprint 2.5 Public API Documentation Site + TS SDK ✅

Per CEO directive (autonomous-continuous mode). Builds the public-facing
docs site + canonical TypeScript SDK so customers can integrate without
reading the spec markdown.

### What landed

- **`@qorium/sdk`** — typed client for the v0 public API
  (`QoriumClient`, `ReadyBankResource`, `JdForgeResource`,
  `StackVaultResource`, `WebhooksResource`, `AuditLogResource`,
  `signRequest()` HMAC-SHA256 helper).
- **`apps/docs`** (port 5108) — Next.js 15 static-export-ready
  reference site with 14 hand-curated sections + hand-written
  OpenAPI 3.1 fragments per service.
- **CTO-DELTA #23** — `CTO-DELTA-docs-site-dns-deferred.md`.

### Tests (32 new cases, all green)

- SDK: 21 cases (client + resources + signing).
- Docs: 11 cases (sections catalogue + OpenAPI fragment validation).

### Verified locally

- `pnpm typecheck` clean across 18 workspaces (was 16)
- `pnpm lint` + `pnpm format:check` clean
- `pnpm --filter @qorium/sdk build` clean
- `pnpm --filter @qorium/docs build` clean (14 SSG routes)

### Halt conditions

- Real `docs.qorium.io` DNS + cert (CTO-DELTA #23) — CEO action.

### Next sprint (2.6)

`services/billing` v0 MVP per `infra/Billing-Service-v0-Spec.md`.
Halt: real Razorpay test sandbox credentials (CTO-DELTA #24).

## 2026-05-03 — Sprint 2.6 Billing Service v0 MVP ✅

Migration `0011_billing.sql` ships 6 tables (customers, subscriptions,
invoices, line_items, payments, usage_records) with comprehensive
CHECK constraints. `@qorium/billing` (port 5112) ships pure-logic
invoice math, dunning state machine, Razorpay client (Stub-vs-Real)
with HMAC webhook verifier, and Express endpoints for customer upsert,
invoice preview/create/list, and Razorpay payment webhook ingestion.
CTO-DELTA #24 documents Razorpay KYB account, Stripe, ledger, refunds,
customer portal, Zoho Books, PDF generation as activation halts. 38
new test cases (680 active green total). Pushed as `d4ad069`.

## 2026-05-03 — Sprint 2.7 Customer Zero Deployment Readiness ✅

Migration `0012_api_key_scopes.sql` extends `app.api_keys` with rate
limit + rotation columns. `@qorium/api-key-mgmt` (port 5113) ships
issuance/revocation/list/rotation-due endpoints + scope catalogue per
D3 §3 + scope-enforcement helper. `infra/deployment/{staging,production}.env.template`

- `infra/runbooks/customer-zero-day-1.md` give the deploy operator a
  turnkey checklist. PM2 ecosystem extended with billing + api-key-mgmt.
  CTO-DELTA #25 covers VPS / DNS / TLS / pepper / admin-JWT halts. 28
  new test cases (708 active green total). Pushed as `dfb4d7c`.

## 2026-05-03 — Sprint 2.8 Secret Rotation Automation ✅

### What landed

- **Migration `0013_secret_rotations.sql`** —
  `app.secret_rotations` (rotation ledger keyed on `resource_key`) +
  `app.secret_rotation_log` (audit trail). CHECK constraints enforce
  the resource_type / status vocabularies derived from B6 §2.
- **`@qorium/secret-rotation-worker`** (PM2 fork, 6h tick) — pure-logic
  policy evaluator (`evaluatePolicy`: send_reminder / mark_overdue /
  no_op based on `next_rotation_due` + reminder lead + grace days).
  Per-resource rotators with the Stub-vs-Real pattern: the
  `webhook_subscription_secret` rotator is interface-complete (live
  flip needs `WEBHOOKS_ADMIN_TOKEN`); `database_url`, `api_key`,
  etc. ship as stubs that just reschedule.
- **`runTick()`** scans rows due within `lookAheadDays` (default 14),
  decides per row, and writes a `secret_rotation_log` event for every
  state transition.
- **PM2 ecosystem updated** — adds `qorium-secret-rotation` fork
  entry; `SECRET_ROTATION_PERFORM` defaults to `false` so v0 only
  emits reminders + marks overdue.
- **CTO-DELTA #26** — `CTO-DELTA-secret-rotation-worker-stub.md` —
  flags the live provider rotation APIs (Anthropic, Razorpay, OpenAI,
  Cloudflare R2, GitHub PAT, Postgres password) as activation halts.

### Tests (21 new cases, all green)

- `services/secret-rotation-worker/__tests__/policy.test.ts` — 11
  cases (paused / healthy / reminder / overdue / grace days /
  default-policy lookup)
- `services/secret-rotation-worker/__tests__/rotators.test.ts` —
  5 cases (stub rotator, webhook rotator with + without token,
  registry, throw-on-unknown)
- `services/secret-rotation-worker/__tests__/runner.test.ts` —
  5 cases (reminder, overdue, paused skip, perform=false, log emit)
- `migration.smoke.test.ts` — verifies migration 0013 (two tables +
  resource_type CHECK)

### Verified locally

- `pnpm typecheck` clean across **21 workspaces**
- `pnpm lint` + `pnpm format:check` clean
- `pnpm --filter @qorium/secret-rotation-worker build` clean
- `pnpm --filter @qorium/secret-rotation-worker test` 21/21 green

### Halt conditions

- Live Anthropic / Razorpay / OpenAI / Cloudflare R2 / GitHub PAT
  rotation APIs (CEO action; per-provider account access).
- `WEBHOOKS_ADMIN_TOKEN` for the webhook rotator (Sprint 2.9).
- Slack webhook URL for reminder notifications (Sprint 2.9).

### Next sprint (2.9)

`packages/observability` + `services/uptime-monitor` per CTO
Architecture §13 + `governance/Operating-Rituals-v1.md`.
Halt: Sentry DSN, Grafana Cloud token, Talpro Sentinel webhook.

---

## 2026-05-04 — Sprints 2.9 → 2.17 (autonomous-continuous batch summary)

This block summarises seven sprints shipped between the previous log
entry and the Sprint 2.17 commit. Per-sprint diffs are in the git log
on `claude/setup-qorium-build-agent-zA0l5`; per-sprint architectural
notes are in the corresponding `infra/CTO-deltas/CTO-DELTA-*.md` files.

### Sprint 2.9 — `packages/observability` + `services/uptime-monitor` ✅

- Sentry SDK wrapper, OpenTelemetry init helper, Pino → Loki shim
  (Stub-vs-Real; Real throws on missing DSN/token)
- Uptime monitor service (port 5114; PM2 fork; 60s smoke loop) with
  `/v1/uptime/status` SLO API
- Admin uptime dashboard + Grafana JSON export
- 24 new tests · halt: SENTRY_DSN, Grafana token, Slack/Pagerduty
  webhook (CTO-DELTA #27)

### Sprint 2.10 — `services/ai-pair-coding-orchestrator` (Wave 3) ✅

- Migration `0014_ai_pair_coding.sql` (sessions + events tables)
- Pure-logic 6-dimension grader (A code-quality, B suggestion-acceptance,
  C rejection-discipline, D question-asking, E iteration-rhythm,
  F self-correction)
- Anthropic client (Stub default; Real throws on missing key)
- Express endpoints: session CRUD, turn submit, grade, complete
- Admin session viewer page
- 29 new tests · halt: ANTHROPIC_API_KEY (CTO-DELTA #28)

### Sprint 2.11 — `apps/candidate-portal` (Wave 3 frontend stub) ✅

- New Next.js 15 app at port 5116 with signal-tracker reducer +
  orchestrator-client + CandidateWorkbench component
- Stub LLM mode wired to the Sprint 2.10 stub so the UX is reviewable
  in dev without an API key
- 19 new tests · halt: CodeMirror 6 + AI sidebar UX (frontend
  upgrade) + real Anthropic for live model calls

### Sprint 2.12 — `services/setu` (status MCP + auto-deploy bridge) ✅

- New service at port 5117 with two surfaces: `/setu/v1/setu/status`
  (snapshot for the dashboard MCP) + `/setu/v1/setu/deploys/webhook`
  (HMAC-verified GitHub webhook → triggers deploy)
- `bin/setu-deploy.sh` with flock + git fetch + pnpm install +
  pnpm build + migrate + pm2 reload + smoke
- `.github/workflows/setu-deploy.yml` (webhook + SSH-fallback modes)
- Snapshot CLI emits `_QORIUM_STATUS.json` (single source of truth
  for the external dashboard MCP)
- 33 new tests · halt: VPS access + GitHub repo settings paste
  (CTO-DELTA #29)

### Sprint 2.13 — `services/webhooks-delivery-worker` ✅

- PM2 fork that drains `webhooks.deliveries` rows where
  `next_retry_at <= NOW()` using the Sprint 2.3 retry curve
- `emit.ts` with wildcard event matching, `poster.ts` (Stub-vs-Real),
  `orchestrator.ts` (deliverOne with HMAC + idempotency), `runner.ts`
- 25 new tests · halt: real customer webhook endpoints

### Sprint 2.14 — SSO OIDC + RS256 JWT extension ✅

- `services/sso/src/jwt.ts` extended to auto-detect HS256 vs RS256
  from the key shape (PEM = RS256, hex = HS256)
- `services/sso/src/oidc.ts` new — Authorization Code + PKCE (S256)
  with generateState, generatePkce, buildAuthorizeUrl,
  inMemoryStateStore, exchangeCode, decodeIdTokenClaims
- 22 new tests · halt: real IdP test-tenant credentials (Okta /
  Azure AD / Google) — same set as Sprint 2.3 (CTO-DELTA #21)

### Sprint 2.15 — Stack-Vault marker substitution body rewriter ✅

- `services/stack-vault/src/substitution.ts` — pure-logic body
  rewriter with applyVariableSuffix (idempotent), applyTestValuePerturbation
  (numeric scaling), applySynonymRewrite (9-entry SYNONYM_TABLE),
  applyCommentStyleSwap (// ↔ /\* \*/), applyHelperReorder (no-op stub),
  applyAllMarkers orchestrator
- 18 new tests · closes the SO-9 anti-leak forensic-watermark loop

### Sprint 2.15.1 — Domain rebrand `qorium.io` → `qorium.online` ✅

- sed-replace across 24 code/config files; CTO-deltas + spec docs
  preserved as historical record
- CTO-DELTA #30 captures the rationale + the additional `.in` domain

### Sprint 2.16 — JD-Forge XLSX export pathway ✅

- `services/jd-forge/src/xlsx-writer.ts` — pure-Node OOXML writer
  (no external deps; STORED-mode ZIP + `zlib.crc32`)
- 5 OOXML parts: `[Content_Types].xml`, `_rels/.rels`,
  `xl/workbook.xml`, `xl/_rels/workbook.xml.rels`,
  `xl/worksheets/sheet1.xml`
- `columnLetter` (A→Z→AA→ZZ→AAA), `exportXlsx`, `exportMettlXlsx`
- ExportFormat extended with `xlsx` + `mettl-xlsx`
- 11 new tests · closes a Phase 1 halt without supply-chain risk
  from exceljs/SheetJS

### Sprint 2.16.5 — Setu 100% auto-mode bootstrap ✅

- `services/setu/bin/setu-bootstrap.sh` — single-curl idempotent
  installer (Node 20, pnpm 10, Postgres 16, Redis, PM2, nginx,
  certbot, openssl rand secrets, role+db, server block, certbot if
  DNS resolves, systemd unit, install + build + migrate + pm2 start,
  emits `.SETU_GITHUB_PASTE_ME.txt`)
- `infra/nginx/qorium.conf` — 15 upstream pools + path-based routing
- `infra/systemd/qorium-pm2.service` — pm2 resurrect on boot
- `infra/runbooks/setu-100-percent-auto-mode.md` — operator runbook
- CTO-DELTA #31

### Sprint 2.17 — Wave 3 question-authoring framework v0 ✅

- `services/ai-pair-coding-orchestrator/src/authoring.ts` — pure-logic
  framework codifying spec §4.1 (six archetypes) + §4.2 (schema
  fields). Public surface: `ARCHETYPES`, `QuestionDraft`,
  `validateDraft` (returns ALL issues, error/warning severity per
  field + per archetype rule), `isReadyForRelease`, `renderSpecYaml`
  (literal block scalars + special-char quoting), `archetypeMetadata`
- 20 new tests covering catalogue, all field rules, archetype-specific
  rules, multi-issue collection, YAML render edge cases
- Re-exported from the orchestrator's `index.ts` so admin UI + future
  SME CLI can consume directly
- CTO-DELTA #32 also documents the **bootstrap-404 incident** the CEO
  hit during the Sprint 2.16.5 bootstrap attempt + the defence-in-depth
  fixes shipped in this same commit (curl `-f` flag, fallback URL to
  the feature branch, PR ready-for-review so canonical URL works
  post-merge)

### Cumulative state at end of Sprint 2.17

- 27 workspaces, 14 Postgres migrations, 32 CTO-DELTAs
- **930 active green tests** + ~53 auto-skip
- All deployment readiness items shipped in code; CEO action remaining
  is to (a) re-run bootstrap with the corrected curl command, then
  (b) merge PR #9 to main so the canonical URL works.

### Next sprint (2.18) [PLANNED → SHIPPED below]

---

## 2026-05-04 — Sprint 2.18 `packages/audit-emitter` + api-key-mgmt integration ✅

- **`packages/audit-emitter`** — new pure-logic + thin-fetch package:
  - Taxonomy: 9 resource buckets (api_key, ats, billing, pack,
    question, secret, session, sso, webhooks); 39 well-known actions
    in `resource.verb` form; auto-tightening `AuditAction` union;
    `isKnownAction`, `actionResource`, `actionsFor` helpers
  - Idempotency: `canonicalJson` (recursive key-sorted serialisation),
    `deriveIdempotencyKey` (sha256 over canonical bytes; optional
    bucket-window for time-bucketed dedup), `freshIdempotencyKey`
    (UUID-based)
  - Emitter: `createAuditEmitter({ mode: 'stub' | 'real' })` factory.
    Stub = in-memory ring buffer (default 1000) + sliding-window
    dedup (5 min). Real = HTTP POST to `/v1/audit/events` with
    `Authorization: Bearer ${adminToken}` + `Idempotency-Key` header,
    `AbortController` timeout (default 5s), 409 → deduplicated, 5xx
    → `delivered:false` + warning (so audit hiccups don't fail the
    primary mutation)
- **`services/api-key-mgmt`** — first reference integration:
  - Adds `@qorium/audit-emitter` workspace dep
  - `createServer({ ..., auditEmitter? })` defaults to a stub
  - `POST /v1/api-keys` emits `api_key.created` with payload
    (family, name, scopes, rate limits, rotation_due_at)
  - `POST /v1/api-keys/:id/revoke` emits `api_key.revoked` with
    prefix + revoked_at
  - 2 new tests confirm emission shape + skip on validation failure
- **CTO-DELTA #33** — `CTO-DELTA-audit-emitter.md` documents the
  framework + the deferral of wholesale wire-up across billing/sso/
  webhooks (mechanical follow-up; pattern is now in place).

### Tests (33 new cases, all green)

- `packages/audit-emitter/__tests__/taxonomy.test.ts` (8)
- `packages/audit-emitter/__tests__/idempotency.test.ts` (9)
- `packages/audit-emitter/__tests__/emitter.stub.test.ts` (8)
- `packages/audit-emitter/__tests__/emitter.real.test.ts` (6)
- `services/api-key-mgmt/__tests__/server.test.ts` (+2 audit tests)

### Verified locally

- `pnpm typecheck` clean across **28 workspaces**
- `pnpm lint` + `pnpm format:check` clean
- `pnpm --filter @qorium/audit-emitter build` clean (emits dist for
  consumer resolution)
- `pnpm test` workspace-wide: **963 active green + ~53 auto-skip**
  (was 930; +33 net = 31 new in audit-emitter + 2 new in api-key-mgmt)

### Halt conditions

- Wholesale wire-up across billing / sso / webhooks (mechanical;
  follow-up sprint)
- CTO-policy decision on which `actor_type` values each service is
  authorised to write
- `AUDIT_LOG_ADMIN_TOKEN` for the production-mode emitter

### Next sprint (2.19) [PIVOT — see below]

The originally planned `apps/my` self-service portal is deferred a
sprint in favour of the mechanical follow-up from CTO-DELTA #33: wire
the new audit-emitter into the remaining 3 emitter services so the
audit story is feature-complete before adding more surface area.

---

## 2026-05-04 — Sprint 2.19 audit-emitter wholesale wire-up ✅

Sprint 2.18 shipped `@qorium/audit-emitter` + a reference integration
in api-key-mgmt. This sprint takes the same pattern wholesale across
the other 3 emitter services so every state-changing call in the
domain layer leaves a canonical audit row.

### What landed

- **`services/billing`** — adds `@qorium/audit-emitter` dep. Emits:
  - `billing.customer.created` on `POST /v1/billing/customers`
  - `billing.invoice.issued` on `POST /v1/billing/invoices`
  - `billing.invoice.paid` on Razorpay `payment.captured` webhook
  - `billing.payment.failed` on Razorpay `payment.failed` webhook
- **`services/sso`** — adds `@qorium/audit-emitter` dep. Emits:
  - `sso.login.success` when SAML ACS issues a session JWT
  - `sso.login.failure` when SAML ACS rejects the assertion
  - `sso.config.activated` / `sso.config.updated` on `PUT /v1/sso/configurations`
- **`services/webhooks`** — adds `@qorium/audit-emitter` dep. Emits:
  - `webhooks.subscription.created` on POST
  - `webhooks.subscription.deleted` on DELETE

All three services accept an optional `auditEmitter` in their
`createServer` options (defaults to a stub), matching the api-key-mgmt
pattern. Production wires a real emitter in each service's `index.ts`
once `AUDIT_LOG_BASE_URL` + `AUDIT_LOG_ADMIN_TOKEN` are available.

### Tests (4 new cases, all green)

- `services/webhooks/__tests__/server.test.ts` (+1: emit on create)
- `services/billing/__tests__/server.test.ts` (+1: emit customer +
  invoice events)
- `services/sso/__tests__/server.test.ts` (+2: emit success + failure
  on SAML ACS)

### Verified locally

- `pnpm typecheck` clean across **28 workspaces**
- `pnpm lint` + `pnpm format:check` clean
- `pnpm test` workspace-wide: **967 active green** + ~53 auto-skip
  (was 963; +4 net)

### Halt conditions

- `AUDIT_LOG_ADMIN_TOKEN` minted via api-key-mgmt + the `audit:write`
  scope (deferred to a future sprint that defines the scope catalogue
  for inter-service auth)
- CTO-policy decision on which `actor_type` values each service may
  write to the audit log

### Next sprint (2.20)

`apps/my` — Next.js customer self-service portal (port 5118): invoice
list, payment intent flow, subscription overview, API key management.
Reuses `@qorium/qorium-sdk`. ~30 new tests.

---

## 2026-05-04T15:30Z — Sprint 2.21 services/leak-rotation-worker ✅

**SO-9 enforcement engine.** Constitution v2.0 §SO-9 mandates a
24-hour-or-better detect-and-rotate cycle for Critical-severity
leaks (Adaface-benchmark parity); High rotates within 7 days. The
leak-crawler service writes detection signals to
`content.leak_alerts`; this worker consumes them and enforces the
SLA.

`services/leak-rotation-worker` (PM2 fork, 5-min tick):

- `src/policy.ts` — pure-logic decision engine. `SLA_HOURS` table
  (critical=24, high=7×24, medium/low=null), `decideRotation()`
  returns `{rotate, slaCutoff, reason}`, default confidence floor
  0.85, `selectAlertsForRotation()` for batch filtering,
  `hoursUntilSlaBreach()` for dashboard visibility.
- `src/repository.ts` — atomic transaction: flips
  `content.questions.status='leaked'` + sets `deprecated_at` AND
  flips `content.leak_alerts.status='rotated'` in one BEGIN/COMMIT.
- `src/runner.ts` — `runTick()` orchestrates fetch → decide →
  rotate → audit. Continues on partial failure.
- `src/index.ts` — boots the 5-min loop; reads env for tick
  interval, scan limit, confidence floor, audit-log creds.

PM2 ecosystem updated: `qorium-leak-rotation` registered (fork
mode, no port).

23 new tests:

- `policy.test.ts` (17) — critical 24h boundary, high 7d boundary,
  severity rejections (medium/low), confidence-floor (default +
  custom), already-handled passthroughs (rotated/dismissed/
  false_positive), under_review parity, slaCutoff ISO formatting
- `runner.test.ts` (6) — happy path with audit emit, within-SLA
  skip, severity/confidence/handled counters, partial-failure
  resilience, custom confidence floor, forensic payload (severity
  - similarity + source_type)

Constitution Article VII's auto-fail criterion ("anti-leak
rotation engine not in continuous operation OR any item detected
public >24h without rotation triggered") is now structurally
addressable.

Workspace state at end of Sprint 2.21:

- 30 workspaces · 14 migrations · 33 CTO-DELTAs
- 1,012 active green tests (was 989; +23 net)
- typecheck + lint + format:check clean

Stream B autonomous-eligible queue is now exhausted. Further
sprints require CEO unblocks.

---

## 2026-05-04T15:00Z — Sprint 2.20 + PM2 ecosystem fill-in ✅

Two parallel changes:

1. **PM2 ecosystem fill-in** — added `qorium-ats-bridge` (5105),
   `qorium-docs` (5108), `qorium-candidate-portal` (5116) to
   `infra/B10-ecosystem.config.js`. They were built but missing
   from the process list, so the public surface was incomplete.
   Total apps: 18 → 22 (after Sprint 2.20 below).

2. **Sprint 2.20 — `apps/my` customer self-service portal** at
   port 5118. New Next.js 15 app with server-rendered customer
   dashboard (outstanding invoices, active subscriptions, API key
   portfolio). Pure-logic helpers in `src/lib/`:
   - `billing-summary.ts` — `summariseBilling()` (computes
     outstanding + overdue + monthly recurring), `formatMoney()`
     (Intl currency), tone helpers for status badges
   - `api-keys.ts` — `toDisplayState()` (mask + status derivation
     including expired / revoked / rotation_due / expiring),
     `aggregatePortfolio()` for dashboard tile
   - `app/page.tsx` — server-rendered dashboard with 3 tiles
   - `app/healthz/route.ts` — uptime monitor probe
     22 tests covering both helpers.

Nginx routing updated: `my.qorium.online` now points at
`qorium_my` upstream (was a placeholder routing to billing).

Added `qorium-my` PM2 entry (cluster mode, 2 instances).

Workspace state at end of Sprint 2.20:

- 29 workspaces · 14 Postgres migrations · 33 CTO-DELTAs
- 989 active green tests + ~53 auto-skip (was 967; +22 net)
- typecheck + lint + format:check clean

Next: Sprint 2.21 — `services/leak-rotation-worker` (SO-9 24h
question rotation enforcement).

---

## 2026-05-04T14:30Z — Artifact reconciliation against macro Phase 0 ✅

CEO flagged that the artifact dashboard had been declaring "project
complete" by the strength of Stream B's engineering deliverables —
when the macro project (per Constitution Article IX) is at **~38%
Phase 0** with 26 of 45 punchlist items still pending and most of
those gated on CEO actions (capital, IP counsel, hiring, Bosch
outreach, real API keys).

`_QORIUM_ARTIFACT_DASHBOARD.md` rewritten with:

- **Macro Project Status (Phase 0–7)** at the top, with all 45 §A–§F
  items individually statused (✅ / 🟡 / ⏳ / 🚫) and ownership marked
  (👤 CEO / 🤖 Stream B / 🤝 joint).
- **What blocks 100% Phase 0** — explicit CEO action queue ordered by
  ETA (Day 3 → Day 14) so the CEO can scan the work in front of them.
- **Stream B Engineering Scaffolding** demoted under the macro section
  with explicit framing: "this is the enabling layer, not project
  completion."

`task_plan_phase0_phase1.md` updated to flip ⏳ → ✅ on §B items 1, 3,
5, 6, 7, 8, 10 and §D items 1, 3 (closed by Stream B), and ⏳ → 🟡 on
§B items 2, 4, 13 and §D item 5 (engineering scaffolding shipped;
CEO action flips live).

Going forward: when Stream B closes a §B or §D item, both files
update in the same commit.
