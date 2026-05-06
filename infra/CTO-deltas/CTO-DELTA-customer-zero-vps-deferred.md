# CTO-DELTA: Customer Zero deployment readiness ships tooling; live VPS + DNS deferred

**Date:** 2026-05-03
**Author:** Claude Code (autonomous-continuous build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `infra/D3-Talpro-Internal-API-Key-Spec.md`,
`infra/B1-VPS-Capacity-and-Topology-Plan.md`,
`customer-zero/Customer-Zero-Day-1-Runbook.md`.

## Background

Sprint 2.7 ships everything the build agent can build without a real
VPS or real Talpro contracts: API key issuance, scope catalogue,
rotation reminders, env templates, the day-1 deployment runbook, and
the smoke check matrix.

What we **cannot** build until the CEO + Cowork CTO Office act:

- Real VPS provisioning (Hostinger account, capacity confirmed).
- Real Postgres 16 instance with `DATABASE_URL_PROD` populated.
- Real Redis instance.
- Real DNS A records for `api.qorium.io`, `admin.qorium.io`,
  `docs.qorium.io`, `my.qorium.io`.
- Real TLS certificates (Let's Encrypt + nginx).
- Real Talpro India tenant signing the contract.
- Real CTO admin JWT for api-key-mgmt issuance calls.
- Real `API_KEY_PEPPER` minted via `openssl rand -hex 32` (the dev
  default rejects in production via `assertProdEnv`).

## Adaptation in v0

- Migration `0012_api_key_scopes.sql` adds rate-limit + rotation
  fields to `app.api_keys`.
- `services/api-key-mgmt` (port 5113) ships:
  - `issueKey()` pure-logic — produces qor*(live|test|internal)*…
    keys with HMAC-SHA256 hashing using a configurable pepper.
  - `enforceScope()` pure-logic — wildcard + literal scope matching;
    the catalogue mirrors D3 §3 verbatim.
  - Express endpoints for issue / list / revoke / rotation-due, all
    behind an admin authoriser that the deployment wires to a JWT
    scope check.
  - Boot-time pepper validation (`assertProdEnv`-style) — service
    refuses to start if running in production with a < 32 char
    pepper or the dev fallback.
- `infra/deployment/staging.env.template` + `production.env.template`
  enumerate every env var across all services with a HALT/REQUIRED
  marker on each one.
- `infra/runbooks/customer-zero-day-1.md` — operational checklist
  derived from `customer-zero/Customer-Zero-Day-1-Runbook.md` and
  mapped to v0 service health endpoints.
- `infra/B10-ecosystem.config.js` extended with `qorium-api-key-mgmt`
  on port 5113 so PM2 picks it up at deploy time.

## What is deferred

- **Live VPS provisioning** — CEO action.
- **DNS + TLS** — CEO action; templates assume `api.qorium.io`.
- **Real Talpro contract sign-off** — CEO + Talpro Delivery Head.
- **Real api-key-mgmt admin JWT** — issued by SSO once the IdP is live
  (Sprint 2.3 deltas).
- **Cron-scheduled rotation reminders** — Sprint 2.8 (secret
  rotation worker).
- **24/7 alerting on rotation overdue** — Sprint 2.9 (observability).

## Reconciliation request to CTO Office

Default action: **ratify v0 tooling now**, treat the env templates +
runbook + api-key-mgmt service as the M1 production-readiness
artefact. The CEO + Cowork CTO Office can deploy on their cadence
without further code changes from the autonomous build agent.

## Verification

- `services/api-key-mgmt/__tests__/scopes.test.ts` — 9 cases
- `services/api-key-mgmt/__tests__/issuance.test.ts` — 9 cases
- `services/api-key-mgmt/__tests__/server.test.ts` — 11 cases
- `migration.smoke.test.ts` — adds verification of migration 0012
  (rate_limit_per_min / rotation_due_at columns + index).
- `infra/deployment/*.env.template` — sample template that boots
  cleanly through `loadConfig()` for every service in the workspace.
- `infra/runbooks/customer-zero-day-1.md` — every `http.*` smoke
  check named here is exposed by the corresponding service today.
