# CODEX PENDING — QOrium Flag Pointers Wave-2 (E1 SSO + N12 Webhooks + E3 Audit Log)

**Queued by:** CTO (Claude, Super Brain). **Executor:** Codex BHIMA (backend lane) — sole.
**Apex rule:** Codex writes ALL code; Claude does not.
**Date queued:** 2026-06-02
**Parent audit:** `QORIUM-FEATURES-AUDIT-MISSING-MATRIX-2026-06-01.md` §2 rows E1 (🔴 P0), N12 (🟠 P1), E3 (🟠 P1) — all rows already have full implementation specs in `infra/`.
**Honesty hard-rule:** these features must NOT be claimed Live until deployed AND flag-verifiable at build time. The T3 Responsible-AI honesty table (per `CODEX_PENDING_QORIUM_TRUST_SHELL_2026-06-01.md`) will list them as `Beta` with date target while shipping, then flip to `Shipped` when the EvidenceCard's flag-source resolves.

## What this ships

Three "spec exists, ship it" features. No new spec writing — Codex implements existing specs and updates the honesty table.

| Item | Implementation spec | Status target |
|---|---|---|
| E1 — SSO (SAML/OIDC) | `infra/SSO-SAML-Enterprise-Spec-v0.md` | Beta → Shipped (after first enterprise customer integrates) |
| N12 — Webhooks (HMAC-signed) | `infra/Webhooks-Service-v0-Spec.md` | Beta → Shipped (after 1 customer end-to-end) |
| E3 — Customer Audit Log (read-only) | `infra/Audit-Log-API-Spec-v0.md` | Beta → Shipped (after first audit export) |

## Per-feature checklist

### E1 — SSO/SAML/OIDC

**Implement per:** `infra/SSO-SAML-Enterprise-Spec-v0.md`. Read it; the design is already complete. No deviation without CTO sign-off.

**Specifics to land:**
- IdP support: Okta, Azure AD, Google Workspace (priority order — first one with a customer commitment lands first).
- Routes: `/auth/saml/login/:tenant`, `/auth/saml/acs/:tenant`, `/auth/saml/metadata/:tenant`, `/auth/oidc/login/:tenant`, `/auth/oidc/callback/:tenant`.
- Per-tenant config in `tenants.sso_config` jsonb; admin UI under `/admin/settings/sso` (ARJUN side).
- JIT user provisioning on first SSO login; SCIM is E2 (separate P1, defer).
- Session bound to tenant; cross-tenant access blocked.

**T3 honesty row:**
- Status: `Beta` while smoke-testing with Talpro India customer-zero.
- Flag: `feature.sso.saml_enabled` per tenant.
- Live as of: date when first non-Talpro tenant authenticates via SAML.
- Owner: BHIMA.
- Evidence: `/auth/saml/metadata/talproindia` resolves at build time → flips to `Shipped`.

**Exit criteria:**
1. SAML round-trip works for Okta + Azure AD (Talpro India dogfoods both).
2. OIDC round-trip works for Google Workspace.
3. Rakshak ≥ 88/100 17/17 on qorium.online (no auth regression).
4. T3 honesty row updates automatically when flag resolves.

### N12 — Webhooks (HMAC-signed)

**Implement per:** `infra/Webhooks-Service-v0-Spec.md`. Spec is complete.

**Specifics to land:**
- Topics (v1): `candidate.session.started`, `candidate.session.completed`, `candidate.session.graded`, `candidate.shortlisted`, `report.generated`, `irt.calibration.complete`.
- HMAC-SHA256 signing with per-subscription secret. Header: `X-QOrium-Signature: t=<unix_ts>,v1=<hex_digest>`.
- Retry policy: exponential backoff (1m, 5m, 30m, 2h, 12h, 24h — 6 attempts).
- Delivery state in `webhook_deliveries` table with idempotency key.
- Admin UI `/admin/settings/webhooks` (ARJUN). Subscriber endpoint: `POST /v1/webhooks/subscriptions`.
- Test-fire endpoint: `POST /v1/webhooks/subscriptions/:id/test` (sends mock event for integration testing).

**T3 honesty row:**
- Status: `Beta` until 1 customer is integrated end-to-end.
- Flag: `feature.webhooks.enabled` (global) + per-subscription `active`.
- Owner: BHIMA.
- Evidence: webhook delivery log shows ≥ 1 customer-domain endpoint receiving + 200-ack.

**Exit criteria:**
1. All 6 topics fire correctly under real conditions.
2. HMAC signature verifies on a reference Node.js + Python receiver (CI verifies).
3. Retry logic verified under simulated 5xx receiver.
4. Replay protection: timestamp tolerance ±5min.
5. Admin UI lists deliveries with status + retry count.

### E3 — Customer Audit Log (read-only)

**Implement per:** `infra/Audit-Log-API-Spec-v0.md`. Spec is complete.

**Specifics to land:**
- Append-only `audit_events` table with `tenant_id, actor_id, action, resource_type, resource_id, before_state, after_state, ip, user_agent, ts`.
- Coverage v1: all `/admin/*` mutating endpoints + login/logout + permission grants + SSO config changes + webhook subscription changes + candidate session events.
- Read API: `GET /v1/audit/events?tenant_id=&from=&to=&action=&actor_id=` — paginated 50/page, RBAC-gated to admin role.
- Export: `POST /v1/audit/exports` returns a signed URL to JSONL or CSV (15-min expiry). Export is itself audited.
- Retention: 365 days hot, optional archive to S3-equivalent (per customer config).
- DPDP cross-link: residency posture (E4) governs where audit data is stored.

**T3 honesty row:**
- Status: `Beta` until 1 customer admin successfully exports their first audit log.
- Flag: `feature.audit_log.enabled` (global, default on).
- Owner: BHIMA.
- Evidence: any `audit_events.tenant_id != 'talpro'` row exists.

**Exit criteria:**
1. Audit events emit on every spec-listed action (verified by adversarial coverage test).
2. RBAC enforced: only `admin` role can read tenant's audit log; only own-tenant.
3. Export round-trip works (admin user → export request → signed URL → download → row count matches).
4. Export action itself appears as an `audit.exported` event in the same log.

## Shared work

### Trust-shell T3 wiring (cross-shard dependency)

This shard creates the data feed for the T3 Responsible-AI honesty table from `CODEX_PENDING_QORIUM_TRUST_SHELL_2026-06-01.md`. Each row above MUST be a real row in the `responsible_ai_capabilities` table, with status driven by the real feature flag (`feature.sso.saml_enabled`, `feature.webhooks.enabled`, `feature.audit_log.enabled`). No static JSON.

### OpenAPI documentation (cross-shard dependency)

All endpoints above MUST be documented in the public OpenAPI spec from N11 Enterprise Surface shard. SSO routes marked as auth-related, webhooks topics enumerated, audit-log endpoint with response schema.

### Watchdogs

- `/auth/saml/metadata/talproindia` — green check
- `POST /v1/webhooks/subscriptions/:id/test` — synthetic fire every 6h to a test endpoint
- `GET /v1/audit/events?tenant_id=talpro&limit=1` — green check

## Exit criteria (across all 3)

1. All 3 features deployed; flags resolve at build time.
2. T3 honesty table reflects real status (Beta until evidence trigger).
3. Public OpenAPI docs include endpoints from all 3.
4. Rakshak ≥ 88/100 17/17 (no regression).
5. WCAG 2.1 AA on the 2 admin UIs (SSO settings, webhooks settings).
6. Honesty CI: T3 row mismatch (e.g. claims `Shipped` but flag is false) blocks deploy.

## Coordination

- BHIMA owns all backend: SSO router, webhook delivery service, audit-log append + read API, T3 capability rows, OpenAPI doc updates.
- ARJUN owns admin UI for SSO settings + webhooks settings + audit-log viewer (read-only table).

## Parallel-work guard

`gh pr list --state all --search "sso webhooks audit"`. Lock `project-lock:qorium-flag-pointers-w2`.

## Open input (non-blocking)

- CEO: confirm IdP launch order (default: Okta → Azure AD → Google Workspace based on enterprise pipeline).
- CEO: webhook retention policy (default: 30 days delivery history visible to customer, then archived).
- CEO: audit-log retention default (365 days hot is the working default; per-tenant overrides available).
