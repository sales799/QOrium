# CTO-DELTA: Workday adapter ships interface-only; certification + signed-JWT verification deferred to M9

**Date:** 2026-05-03
**Author:** Claude Code (parallel build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `infra/ATS-Connector-Framework-v0.md` §3.2 (Workday)

- §8.4 (M9 rollout)

## Background

Spec §3.2 describes Workday's complexity:

- **Certification** — Workday requires production integrations to pass
  their certification process. Lead time is 4–12 weeks. §8.4 calls
  starting certification at M6 to land by M9.
- **Multi-tenant config** — every Workday tenant requires custom field
  pre-configuration by their admin + a Workday Setup walkthrough.
- **Webhook auth** — Workday signs webhooks with **RS256 JWTs** using
  Workday-issued public keys, not the HMAC scheme the other three ATSes
  use.
- **API surface** — REST is preferred but not always available;
  fallback is Workday Recruiting Web Services (SOAP). The bridge service
  needs to handle both.
- **Permission model** — every API call honours Workday's role-based
  permission model, which is configured per-tenant.

None of this is achievable in the autonomous build session.

## Adaptation in v0

`packages/ats-connectors/src/adapters/workday.ts`:

- **`verifySignature`** — returns `{valid: false, reason: 'Workday
signature verification deferred until M9 certification'}` for every
  inbound webhook. The bridge service therefore rejects every Workday
  webhook with HTTP 401 today. Fail loud rather than silently accept.
- **`receiveWebhook`** — maps the canonical `Recruiting.Candidate.Created`
  / `Recruiting.Candidate.Updated` event classes into the canonical
  `Candidate` shape. The mapper is pure logic and works against
  hand-authored test fixtures so the certification team can validate
  payload contracts before wiring real signatures.
- **`postScore` / `postAssessmentUrl`** — return `{ok: false, status:
501, recovery: 'permanent'}` until certification ships.

Workday is registered in `defaultRegistry()` so the bridge service is
forward-compatible: when M9 lands, the only changes are (a) the
signature verifier (needs RS256 + Workday's public-key set) and (b) the
outbound HTTP / SOAP client. The interface is unchanged.

## Why ship the skeleton at all?

- The bridge service's `defaultRegistry` returns a complete platform
  list, so the admin UI integration page can offer Workday in the
  dropdown (spec §9.1) without the bridge service refusing the platform
  param at the URL level.
- The webhook payload mapper is exercised by tests — when certification
  finally lands, the team is debugging Workday auth, not the canonical
  payload mapping.
- Removing Workday from the registry today and re-adding it at M9 would
  be more churn than keeping it disabled-but-present.

## Reconciliation request to CTO Office

Two options:

1. **Ratify v0 skeleton + M9 certification track** (recommended). Pros:
   the framework is provably 4-ATS pluggable today; Workday certification
   work happens in parallel without blocking Greenhouse / Ashby /
   Darwinbox rollout; the M9 flip-the-switch is gated on (a) Workday
   approval and (b) wiring the RS256 verifier + REST client.
2. **Defer Workday entirely from v0 framework** — drop the adapter from
   the registry, document the gap. Cons: the M9 phase-gate explicitly
   names Workday; missing it from v0 framework would be visible as a
   regression vs the spec.

Default action if no reconciliation by next sprint review: **option 1**.

## Activation halts (CEO action chain for M9)

1. **M6:** Submit Workday certification application; identify
   certification engineer + sample tenant for testing
2. **M7–M8:** Workday certification testing + iteration
3. **M9:** Certification approval; provision per-tenant signing keys +
   client credentials; flip the verifier from "always reject" to the
   RS256 implementation; wire the REST client (SOAP fallback ready in
   case a tenant's Workday instance doesn't expose REST)

## Verification

- `packages/ats-connectors/__tests__/adapters/stubs.test.ts` — 4 Workday
  cases (signature always invalid with M9 reason, candidate.created
  payload maps correctly, candidate.updated payload maps correctly,
  postScore returns 501)
- `services/ats-bridge/__tests__/server.test.ts` — exercises the bridge's
  rejection path for invalid signatures (which Workday hits today by
  design)
