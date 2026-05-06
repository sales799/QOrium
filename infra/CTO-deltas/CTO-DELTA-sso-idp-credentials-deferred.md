# CTO-DELTA: SSO ships SAML pure logic + endpoints; live IdP wire-up deferred

**Date:** 2026-05-03
**Author:** Claude Code (parallel build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `infra/SSO-SAML-Enterprise-Spec-v0.md` §3 (Target IdP Integrations), §4 (Architecture), §7.1 (SAML Assertion Validation)

## Background

Spec §3 names three live IdP targets for Month 6:

- Okta (SAML 2.0 + OIDC)
- Azure Active Directory (SAML 2.0)
- Google Workspace (OIDC)

§4 prescribes `passport-saml`, `passport-openidconnect`, `xml2js`,
`redis` for state management, plus a 2048-bit RSA SP signing key
rotated annually (§7.3).

Live wire-up requires:

- A real Okta / Azure / Google admin tenant for testing
- The QOrium SP signing keypair (private key in KMS, public cert in
  metadata)
- An XML signature verification library wired against `xml-crypto` or
  `passport-saml`'s built-in verifier
- A Redis instance for SAML state + OIDC PKCE state
- Customer onboarding flow including admin upload of IdP metadata

These are halt conditions per the agent constitution (real customer
credentials + IdP admin access) and explicitly delegated to a live
sprint with the customer present.

## Adaptation in v0

The v0 SSO service ships:

- **SP metadata generator** (`generateSpMetadataXml`): a pure-logic XML
  builder that produces a SAML 2.0 SP `EntityDescriptor` matching spec
  §5 — entity id, ACS URL, optional SLO URL, optional signing cert,
  AuthnRequestsSigned + WantAssertionsSigned flags.
- **ACS validator** (`validateSamlAcs`): parses the SAMLResponse,
  validates audience / recipient / time window (NotBefore / NotOnOrAfter
  with clock skew). The XML signature check is delegated to a pluggable
  `verifySignature` callback so a live caller can wire `xml-crypto`
  against the IdP certificate from `sso.configurations.idp_certificate`
  without changing the rest of the service.
- **Principal mapper** (`principalFromAssertion`): applies a tenant's
  `attribute_mapping` (group → role) per spec §6, defaulting unmapped
  groups to `viewer`.
- **JWT issuer + verifier** (HS256, no external dep): claims match
  spec §4.2 — `sub`, `tenant_id`, `roles`, `email`, `name`, `iss`,
  `aud`, `iat`, `exp`. RS256 + KMS will swap the signer when the live
  keypair is provisioned.
- **Express endpoints** for `/v1/auth/saml/metadata`, `/saml/login`,
  `/saml/acs`, `/oidc/login`, `/oidc/callback` (501 until live),
  `/logout`, `/sso/configurations` (read + upsert).
- **`sso.configurations` table** (migration 0010) with all spec §5
  columns including `oidc_client_secret_cipher` for KMS-encrypted-at-rest
  client secrets.

**What is deferred:**

- Live XML signature verification with the IdP certificate. The hook is
  in place — `verifySamlSignature: (xml) => boolean` on
  `createServer()`. Tests use a stub that returns `true` for
  well-formed test fixtures and `false` to exercise rejection paths.
- The RS256 KMS-backed signing key. v0 uses HS256 with
  `SSO_JWT_SIGNING_SECRET` env var; rotating to RS256 is a one-line
  swap in `jwt.ts` (`createSign('RSA-SHA256')`) once the keypair is
  available.
- OIDC flow (Authorization Code + PKCE). Endpoints return 501 with the
  CTO-DELTA reference. The `sso.configurations` row already supports
  `oidc_issuer`, `oidc_client_id`, `oidc_client_secret_cipher`.
- Session storage in Redis. v0 issues stateless JWTs; logout is a
  client-side cookie drop. Spec §7.2 calls for refresh tokens in Redis
  with a 7-day TTL — deferred.
- The admin UI configuration screen at `/admin/sso` (spec §5).
  `services/sso` exposes the API; admin-side wiring lives in a later
  sprint.

## Reconciliation request to CTO Office

Two options:

1. **Ratify v0 control plane, IdP live wire-up at first enterprise
   customer onboarding** (recommended). Pros: ships everything that
   doesn't need a real IdP today; the ACS validator + principal mapper
   are unit-tested against canonical Okta / Azure / Google response
   shapes; tenants can already configure their `sso.configurations`
   row via `PUT /v1/sso/configurations` and download SP metadata.
2. **Block v0 on a sandbox Okta tenant** — provision the test IdP
   account, wire `xml-crypto`, ship live ACS today. Cons: requires a
   credentialed session; out of scope for Sprint 2.3.

Default action if no reconciliation by next sprint review: assume
**option 1**. The first enterprise customer onboarding sprint will
provision the IdP test tenant, ship `xml-crypto` against
`idp_certificate`, swap HS256 → RS256, and add the OIDC + Redis-backed
session store.

## Verification

- `services/sso/__tests__/metadata.test.ts` pins the SP metadata XML
  shape against a deterministic fixture.
- `services/sso/__tests__/saml.test.ts` exercises ACS validation
  (audience mismatch, recipient mismatch, time window, signature stub,
  attribute mapping).
- `services/sso/__tests__/jwt.test.ts` covers issue + verify
  round-tripping plus reject-on-tamper.
- `services/sso/__tests__/server.test.ts` exercises the SAML metadata
  endpoint, ACS happy path + rejection paths, OIDC 501, and bearer
  token logout.
- `migration.smoke.test.ts` adds a smoke for `sso.configurations`
  including the protocol CHECK constraint.
