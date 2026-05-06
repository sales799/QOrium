# CTO-DELTA: ATS adapters ship interface-complete; live OAuth + outbound calls gated on tenant credentials

**Date:** 2026-05-03
**Author:** Claude Code (parallel build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `infra/ATS-Connector-Framework-v0.md` §4 (Auth Model) +
§8 (Rollout Sequence)

## Background

§8 lays out a per-ATS rollout: Greenhouse at M6, Ashby at M7, Darwinbox at
M8, Workday at M9. Each rollout requires:

- A tenant-supplied OAuth client (Greenhouse / Workday / Ashby) or API key
  (Darwinbox)
- A registered webhook endpoint on the ATS side (so the ATS knows where
  to call)
- The QOrium-side admin UI for self-service connector setup (spec §9.1)

Live OAuth flows can't be exercised from this autonomous build session
without CEO action (provisioning Greenhouse OAuth app + registering
return URLs + onboarding test tenants).

## Adaptation in v0

`packages/ats-connectors` ships **interface-complete** adapters for all
four v0 ATSes:

| Adapter    | Webhook signature verify | Webhook payload map | Outbound calls (postScore / postAssessmentUrl)           |
| ---------- | ------------------------ | ------------------- | -------------------------------------------------------- |
| Greenhouse | live (HMAC-SHA256)       | live                | live (PATCH /v1/candidates/{id} with Basic auth + Token) |
| Ashby      | live (HMAC-SHA256)       | live                | stub (returns 501 + recovery=permanent until M7)         |
| Darwinbox  | live (HMAC-SHA256)       | live                | stub (returns 501 + recovery=permanent until M8)         |
| Workday    | rejects all (until M9)   | live (canonical)    | stub (returns 501 + recovery=permanent until M9)         |

The Greenhouse adapter ships full Harvest-API outbound support because
the spec sequences Greenhouse first (§8.1 "Easiest, Clearest API"). Ashby

- Darwinbox + Workday outbound paths are deferred to their respective
  milestones; their adapters return `recovery: 'permanent'` so the bridge
  service drops the request rather than retrying forever.

## Auth flows

The bridge service expects credentials to land via the admin UI
(`apps/admin/integrations/*`, planned for a follow-up sprint). The data
model (migration 0009) holds:

- `access_token_cipher` / `refresh_token_cipher` — OAuth (Greenhouse,
  Workday, Ashby)
- `api_key_cipher` — header-style auth (Darwinbox)
- `webhook_secret_cipher` — HMAC seed for inbound verification

All four columns are TEXT and store **cipher text**; the bridge service
decrypts at use site via a pluggable `CipherDecoder`. Production
deployments will wire `decodeCipher` to the KMS adapter (D3 spec, Talpro
Secrets Protocol). v0 tests + dev pass plaintext-decoder.

## Reconciliation request to CTO Office

Two options:

1. **Ratify v0 interface-complete + Greenhouse live** (recommended). Pros:
   the framework is provably pluggable; the Greenhouse rollout (M6) has a
   clear flip-the-switch path (OAuth credentials + admin UI ship + go);
   Ashby / Darwinbox / Workday outbound calls light up at M7 / M8 / M9
   respectively without framework changes.
2. **Block v0 on full per-ATS go-live** — bring real Greenhouse OAuth +
   admin UI before shipping. Cons: drags Phase 2 further; OAuth client
   provisioning is a CEO + Greenhouse ops loop with multi-day latency.

Default action if no reconciliation by next sprint review: **option 1**.

## Activation halts (CEO actions per ATS)

| ATS        | Required by | CEO action                                                    |
| ---------- | ----------- | ------------------------------------------------------------- |
| Greenhouse | M6          | Greenhouse OAuth client id + secret + return URL allowlisting |
| Ashby      | M7          | Ashby API key per tenant (provisioned by Ashby tenant admin)  |
| Darwinbox  | M8          | Darwinbox API key + tenant domain                             |
| Workday    | M9          | Workday certification submission + tenant signing keys        |

These all land on the Customer Zero Day-1 runbook activation list
(Sprint 1.8).

## Verification

- `packages/ats-connectors/__tests__/`:
  - `signature.test.ts` — 9 cases (HMAC valid / mismatched body / missing
    secret / array headers / non-hex / etc.)
  - `idempotency.test.ts` — 9 cases (header lookups, body-hash fallback,
    cache TTL)
  - `registry.test.ts` — 3 cases (defaults populated, throw on unknown,
    list)
  - `adapters/greenhouse.test.ts` — 14 cases (signature verify, all event
    types, postScore happy + 401 + 503 + missing-token, postAssessmentUrl)
  - `adapters/stubs.test.ts` — 9 cases (Ashby / Darwinbox / Workday
    signature verify, payload mappers, postScore-not-implemented)
- `services/ats-bridge/__tests__/server.test.ts` — 9 cases (healthz,
  unknown platform, invalid tenant, missing pool, missing integration,
  invalid signature, valid candidate.created, replay = duplicate, 422
  malformed payload, 403 inactive)
