# CTO-DELTA: `@qorium/audit-emitter` shared library v0 (Sprint 2.18)

**Date:** 2026-05-04
**Author:** Claude Code (autonomous-continuous build session)
**Status:** Provisional — pending CTO Office reconciliation
**Origin:** Architecture review — domain services were each free-stringing
their `action` names (or skipping audit emission entirely). The audit
log query surface (filter by `action`) and the SO-9 / SO-21 audit
dashboards needed a deterministic taxonomy to be usable.

## Background

Sprint 2.3 shipped the audit-log read API (`services/audit-log`) plus a
`POST /v1/audit/events` endpoint for system writes. Sprints 2.4 → 2.17
added 14 more domain services (api-key-mgmt, billing, sso, webhooks,
ats-bridge, etc.), each of which performs state-changing actions that
should leave an audit trail.

But there was no shared client library — the writes would have either
not been emitted, been emitted as raw `fetch()` calls scattered across
services with inconsistent shape, or used ad-hoc action strings that
the audit-log query filters couldn't reliably target.

## What landed

- **`packages/audit-emitter`** — new pure-logic + thin-fetch package:
  - `taxonomy.ts` — `AUDIT_ACTIONS` catalogue grouped by 9 resource
    buckets (api_key, ats, billing, pack, question, secret, session,
    sso, webhooks). 39 well-known actions following `resource.verb`
    naming. `AuditAction` union type auto-tightens as the catalogue
    grows. `isKnownAction(action)` lets the emitter warn on ad-hoc
    drift; `actionResource(action)` and `actionsFor(resource)` support
    UI dropdowns.
  - `idempotency.ts` — `canonicalJson` (recursive key-sorted
    serialisation), `deriveIdempotencyKey` (sha256 over canonical
    representation, with optional bucket-window for time-bucketed
    dedup), `freshIdempotencyKey` (UUID-based for explicit per-call
    keys).
  - `emitter.ts` — `createAuditEmitter({ mode: 'stub' | 'real' })`
    factory:
    - **Stub mode**: in-memory ring buffer (default 1000 events) +
      sliding-window dedup (default 5 min); `recent(n)` for tests; no
      external dependencies.
    - **Real mode**: HTTP POST to `${baseUrl}/v1/audit/events` with
      `Authorization: Bearer ${adminToken}` + `Idempotency-Key` header.
      Honours per-call `timeoutMs` (default 5s) via `AbortController`.
      Treats 409 from the audit-log as `deduplicated: true`. Returns
      `delivered: false` + warning on 5xx without throwing (so domain
      services do not fail their primary mutation due to audit
      hiccups).
  - Both shapes implement the same `AuditEmitter` interface so call
    sites are identical between tests and production.
- **`packages/audit-emitter/__tests__/`** — 31 tests:
  - `taxonomy.test.ts` (8): catalogue shape, naming convention,
    no-duplicates, `isKnownAction`, `actionResource`, `actionsFor`
  - `idempotency.test.ts` (9): `canonicalJson` (key sorting,
    arrays, null/undefined, drop-undefined, primitives) +
    `deriveIdempotencyKey` (stable, changes per field, ordering-
    insensitive payload, bucket-window collapse)
  - `emitter.stub.test.ts` (8): delivery, dedup, window expiry,
    caller-supplied keys, taxonomy warnings, reset, ring-buffer roll
  - `emitter.real.test.ts` (6): missing-creds throw, POST shape +
    headers, caller-supplied key wins, 409 → deduplicated, 5xx →
    warning, AbortController timeout
- **`services/api-key-mgmt`** — first integration:
  - Adds `@qorium/audit-emitter` as a workspace dependency
  - `createServer({ ..., auditEmitter? })` — defaults to a stub if
    omitted (so dev/test runs need nothing extra; production wires a
    real emitter from `index.ts` once `AUDIT_LOG_BASE_URL` +
    `AUDIT_LOG_ADMIN_TOKEN` are set)
  - `POST /v1/api-keys` emits `api_key.created` with the family,
    name, scopes, rate limits, and rotation_due_at in payload
  - `POST /v1/api-keys/:id/revoke` emits `api_key.revoked` with
    prefix + revoked_at
  - 2 new tests confirm emission shape on success + skip on
    validation failure (now 30 tests in this workspace, was 28)

## What this unblocks

- **Audit dashboard** (Sprint 2.4 admin/audit) gains a deterministic
  filter set as services adopt the catalogue.
- **Future SO-9 audit-trail query** (per Constitution standing order
  9 — leak rotation must be auditable) can pivot on canonical actions
  rather than fuzzy string matching.
- **Future webhooks-emit-from-audit** (Sprint 2.13's webhooks worker
  already polls `webhooks.deliveries`; a future enhancement can
  produce events from the audit row stream).

## What is still deferred

- **Wholesale wire-up across the other 3 emitter services**
  (billing, sso, webhooks) — same pattern as api-key-mgmt; each
  service needs ~10–20 lines of changes. Deferred to Sprint 2.18.x
  (or Sprint 2.19) as a mechanical follow-up; the framework + first
  reference integration are sufficient to ratify the pattern.
- **Real audit-log POST authorisation policy** — the audit-log
  endpoint accepts `authoriseSystemWrite(req)` but the production
  policy (which services can write which `actor_type` values) needs
  a CTO-policy decision before shipping the real emitter to
  production.
- **Persisted dedup window** — current dedup is per-process (in-
  memory). Cross-process dedup would need a Redis-backed key store;
  unnecessary for v0 because the audit-log endpoint can also dedup
  via the `Idempotency-Key` header (future work in audit-log).

## Reconciliation request to CTO Office

Default action: **ratify the v0 framework + the api-key-mgmt
integration** as the canonical pattern. The interface is identical
between Stub and Real, the taxonomy is conservative (only adds
actions that domain services demonstrably need), and the failure
mode (warn-on-unknown, warn-on-5xx) means audit emission never
breaks the primary mutation flow.

## Verification

- `pnpm --filter @qorium/audit-emitter typecheck` — clean.
- `pnpm --filter @qorium/audit-emitter test` — 31/31 passing.
- `pnpm --filter @qorium/audit-emitter build` — emits dist (so other
  workspaces can resolve it via `main`).
- `pnpm --filter @qorium/api-key-mgmt typecheck` — clean.
- `pnpm --filter @qorium/api-key-mgmt test` — 30/30 passing.
- `pnpm typecheck && pnpm lint && pnpm format:check` (workspace-
  wide) — clean.
- Workspace-wide `pnpm test` count: **974** active green (was 941;
  +33 net = 31 new in audit-emitter + 2 new in api-key-mgmt).
