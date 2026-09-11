# Shared password and SAML recruiter sessions

Both apps now use the shared @qorium/auth JWT contract. Password issuer is qorium-readybank; SAML issuer is qorium-saml; audience is qorium-recruiter. Claims bind UUID recruiter/tenant/sid, method and fixed recruiter role. Arbitrary IdP roles do not grant API authority. The verifier pins HS256, issuer, audience and the key for the declared method; decoding selects a key but never authorizes a request.

Password keeps JWT_SECRET and its existing password-session identifier HMAC domain. SAML requires QORIUM_SESSION_SIGNING_SECRET in both marketing and ReadyBank, with the same trusted SAML value and at least32 UTF-8 bytes. This key is configured separately from JWT_SECRET. Missing/weak SAML configuration disables API SAML acceptance. Marketing no longer falls back to QORIUM_RECRUITER_JWT_SECRET or QORIUM_SIGNING_SECRET. No real values are generated, copied or rotated by this change.

New SAML rows use the saml-session:tenant:sid HMAC domain with the SAML signing key. Assertion replay hashing retains its existing replay-pepper configuration. Old two-segment SAML cookies and old rows are not adopted; a new IdP sign-in is required. Password legacy JWTs without sid also require reauthentication. The API renews/revokes through a method-bound store and preserves the method and stable sid. Current account status is rechecked. Cookie/JWT expiry uses the persisted deadline.

SAML identity resolution/issuance retains active-account, tenant and pinned NameID checks. Production missing DB configuration fails closed via PR248. Development metadata/request proof routes remain, but a synthetic non-UUID recruiter cannot produce an API session. ACS catches issuance/configuration errors and withholds cookies. Sign-in requires real persisted identity for usable API sessions.

## Local evidence and release limits

Shared auth51 tests pass;ReadyBank675 tests pass/21 skipped;marketing111 tests pass with disposable PostgreSQL enabled. Cross-app tests call actual marketing session creation/persistence then API renewal/logout and copied-token rejection;they use a parsed assertion fixture, not a signed XML ACS request or real IdP/browser. Shared key tests cover wrong-method keys, issuer/audience/method/role/ID mismatches and legacy formats. Initial cross-app failures exposed a missing assertion_hash column in the minimal test fixture;added the existing migration column without changing production schema. Initial log retained.

Production deployment still requires matching explicitly configured SAML keys, migration0017/replay/grants verification, browser/proxy cookie tests, signed-XML ACS end-to-end tests, independent review and working CI/deployment access. Existing secrets and live configuration were not inspected or changed. A configured pool is not proof of connectivity. No live SSO certification or completion certificate is issued.
