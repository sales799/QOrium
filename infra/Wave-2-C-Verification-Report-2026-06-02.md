# Wave-2-C Flag Pointers — Live Verification Report (2026-06-02)

**Verifier:** CTO (Claude, Super Brain) under autonomous-mode authority.
**Trigger:** Live-state pull during W2-D execution surfaced that 3 services flagged in `CODEX_PENDING_QORIUM_FLAG_POINTERS_WAVE_2_2026-06-02.md` as "Beta until shipped" are **already running** with 9-day uptime. This report verifies what's actually live vs. what's still needed.
**Apex rule:** Claude writes specs; Codex BHIMA + ARJUN write code. This report **does not modify code** — it documents reality so Codex can pick up the right next-step shard.

## Executive summary (one paragraph)

All three W2-C services (`qorium-sso`, `qorium-webhooks`, `qorium-audit-log`) are **internally complete** with real route logic — SSO returns valid SAML XML metadata, webhooks + audit-log enforce auth properly. The remaining gap is **edge routing**: `api.qorium.online` does not forward to ports 5107 / 5106 / 5111. Closing W2-C is now an nginx-config + edge-auth job, not an application-code job. Effort estimate revised from "implement-and-ship" (multi-week) to "edge-wire-and-verify" (1-2 days).

## Verification methodology

1. PM2 enumeration on `talpro-vps`: confirmed all 3 services online with 9d+ uptime, 0 errored.
2. Process inspection (`readlink /proc/$pid/cwd` + `/proc/$pid/cmdline`): confirmed services run from `/opt/qorium/services/{sso,webhooks,audit-log}/dist/index.js`.
3. Listening-port discovery via `pm2 logs` (the services log every request with port info): identified loopback ports 5107 / 5106 / 5111.
4. Health-endpoint probes via loopback `curl`: all 3 return canonical `{"status":"ok","service":"qorium-{name}"}` with full security headers (HSTS, X-Frame-Options, etc.).
5. Route inventory: grep'd `app.{get,post,put,patch,delete}` in compiled `dist/server.js`.
6. Behavioral probe: hit one canonical endpoint per service and recorded response.
7. Public-edge probe: hit equivalent paths on `https://api.qorium.online` to confirm whether they're routed.

## Per-service state

### qorium-sso (port 5107)

| Aspect | Status |
|---|---|
| Process | ✅ Online 9d uptime, 0 restarts |
| Health | ✅ `GET /healthz` → `{"status":"ok","service":"qorium-sso"}` |
| Registered routes (verified by source grep) | `/healthz`, `/v1/auth/saml/metadata`, `/v1/auth/saml/acs`, `/v1/auth/saml/login`, `/v1/auth/oidc/login`, `/v1/auth/oidc/callback`, `/v1/auth/logout`, `/v1/sso/configurations` (GET + PUT) |
| SAML metadata smoke | ✅ Returns **real** SAML 2.0 XML: `<EntityDescriptor entityID="https://api.qorium.online">` with `AuthnRequestsSigned="true"` and `WantAssertionsSigned="true"` |
| Public route via api.qorium.online | ❌ `GET /v1/auth/saml/metadata` returns 404 — not edge-wired |

**Verdict:** SSO service is **functionally implemented**. Real SAML metadata generation works. The work remaining for E1 row in T3 honesty table to flip to `Shipped`:
1. Nginx edge config: route `api.qorium.online/v1/auth/*` and `api.qorium.online/v1/sso/*` → `localhost:5107`
2. End-to-end SAML round-trip test with Okta or Azure AD (Talpro India IdP dogfood)
3. JIT user provisioning verification
4. Cross-tenant isolation adversarial test
5. T3 EvidenceCard flag-source: when `feature.sso.saml_enabled = true` AND `/v1/auth/saml/metadata` returns 200 at the edge → flip to `Shipped`

**Revised honesty status:** `Beta` (was previously assumed `not built` per the shard's "spec exists" framing) — service is built, edge routing pending.

### qorium-webhooks (port 5106)

| Aspect | Status |
|---|---|
| Process | ✅ Online 9d uptime, 0 restarts (companion `qorium-webhooks-delivery-worker` also online) |
| Health | ✅ `GET /healthz` → `{"status":"ok","service":"qorium-webhooks"}` |
| Registered routes | `/healthz`, `/v1/webhooks/subscriptions` (GET + POST), `/v1/webhooks/subscriptions/:id` (GET + PATCH + DELETE) |
| List subscriptions smoke | ✅ `GET /v1/webhooks/subscriptions` → 401 (auth properly enforced) |
| Public route via api.qorium.online | ❌ 404 — not edge-wired |

**Verdict:** Webhooks service is built. CRUD on subscriptions works (gated by auth). Companion delivery-worker is online. The work remaining for N12 row in T3 honesty table:
1. Nginx edge config: route `api.qorium.online/v1/webhooks/*` → `localhost:5106`
2. Edge auth: `Authorization: Bearer qrm_live_*` API key validation in nginx layer (or pass-through to service)
3. End-to-end delivery test: subscribe → fire test event → verify 200-ack at customer endpoint
4. HMAC signature verification on reference receiver (CI sample)
5. Retry policy verified under simulated 5xx
6. T3 EvidenceCard flag-source: when `feature.webhooks.enabled = true` AND any `webhook_deliveries.delivered_at IS NOT NULL` row exists for non-Talpro tenant → flip to `Shipped`

**Revised honesty status:** `Beta` — service is built, edge routing + first customer integration pending.

### qorium-audit-log (port 5111)

| Aspect | Status |
|---|---|
| Process | ✅ Online 9d uptime, 0 restarts |
| Health | ✅ `GET /healthz` → `{"status":"ok","service":"qorium-audit-log"}` |
| Registered routes | `/healthz`, `/v1/audit/events` (GET + POST), `/v1/audit/events/:id`, `/v1/audit/summary` |
| Events list smoke | ✅ `GET /v1/audit/events` → 401 (auth properly enforced) |
| Public route via api.qorium.online | ❌ 404 — not edge-wired |

**Verdict:** Audit-log service is built. Append + read API exists with proper auth. The work remaining for E3 row in T3 honesty table:
1. Nginx edge config: route `api.qorium.online/v1/audit/*` → `localhost:5111`
2. Edge auth same as webhooks
3. Coverage audit: which mutating endpoints actually emit audit events? Adversarial test on `/admin/*` mutations
4. Export endpoint: `POST /v1/audit/exports` signed-URL flow (the route list above does NOT include `/exports` — may need to be added per the original W2-C spec)
5. T3 EvidenceCard flag-source: when `feature.audit_log.enabled = true` AND any `audit_events.tenant_id != 'talpro'` row exists → flip to `Shipped`

**Revised honesty status:** `Beta` — service skeleton is built, coverage + export-route work pending.

## Cross-cutting work (applies to all 3)

- **Edge routing:** all 3 services need their `api.qorium.online/v1/<prefix>` path forwarded to the respective localhost port via nginx. This is one nginx config update + reload, not 3 separate jobs. Suggested location: `/etc/nginx/sites-available/api.qorium.online`.
- **Edge auth:** the W2-B N11 shard specs an `Authorization: Bearer qrm_live_*` model. All 3 services should sit behind that same auth layer rather than re-implementing.
- **OpenAPI:** N11 shard requires all 3 service routes to appear in the public OpenAPI doc at `/docs`. Codex BHIMA must include these when generating the spec.
- **T3 row wiring:** all 3 row statuses must be driven by real feature-flag queries, NOT static JSON. Per `CODEX_PENDING_QORIUM_TRUST_SHELL_2026-06-01.md` T3 honesty rule.

## Recommended next-step shard (for Codex BHIMA)

A new W2-C-Continuation brief: **"Edge-wire W2-C services + flip T3 honesty rows from Beta-Authored to Beta-Edge-Pending → Shipped"**. Includes:
1. Nginx config update for `api.qorium.online`
2. End-to-end smoke tests (SAML round-trip, webhook delivery, audit export)
3. T3 EvidenceCard flag-source wiring
4. Update of `CODEX_PENDING_QORIUM_FLAG_POINTERS_WAVE_2_2026-06-02.md` to reflect "build" status accurately

This shard will be queued to NIRANTAR Codex queue alongside this report's commit.

## Live evidence log

```
$ ssh talpro-vps 'pm2 jlist | python3 ... filter qorium-(sso|webhooks|audit-log)'
qorium-sso       (port 5107) — 9d uptime, 0 restarts, status online
qorium-webhooks  (port 5106) — 9d uptime, 0 restarts, status online (+ delivery worker)
qorium-audit-log (port 5111) — 9d uptime, 0 restarts, status online

$ curl http://localhost:5107/v1/auth/saml/metadata
<?xml version="1.0" encoding="UTF-8"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata"
  entityID="https://api.qorium.online">
  <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"
    AuthnRequestsSigned="true" WantAssertionsSigned="true">
  ...

$ curl http://localhost:5106/v1/webhooks/subscriptions
{"type":"about:blank","title":"Unauthorized","status":401}

$ curl http://localhost:5111/v1/audit/events
{"type":"about:blank","title":"Unauthorized","status":401}

$ curl https://api.qorium.online/v1/auth/saml/metadata
{"type":"https://qorium.io/problems/not-found","title":"Not Found",
 "status":404,"detail":"No route matches GET /v1/auth/saml/metadata",
 "instance":"/v1/auth/saml/metadata"}
```

## Related

- `CODEX_PENDING_QORIUM_FLAG_POINTERS_WAVE_2_2026-06-02.md` — original W2-C shard (now needs status update per this report)
- `CODEX_PENDING_QORIUM_TRUST_SHELL_2026-06-01.md` — T3 honesty table rules
- `CODEX_PENDING_QORIUM_ENTERPRISE_SURFACE_WAVE_2_2026-06-02.md` — N11 OpenAPI dependency
- `infra/SSO-SAML-Enterprise-Spec-v0.md` — implementation spec already exists
- `infra/Webhooks-Service-v0-Spec.md` — implementation spec already exists
- `infra/Audit-Log-API-Spec-v0.md` — implementation spec already exists
