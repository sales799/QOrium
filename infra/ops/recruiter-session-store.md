# Durable recruiter session store (integration pending)

createSessionStore is a persistence primitive, not an enabled login feature. No route currently calls it. It uses the existing migration0017 schema; verify migration/grants before adoption.

The caller supplies a trusted 32-byte identifier digest function with no default secret. For SAML compatibility preserve HMAC-SHA256 over session:tenantId:sessionId using its configured replay pepper. No key rotation is included.

Create and renewal require a currently active recruiter in the same tenant and return database identity. Every operation binds tenant, recruiter, method and stable session ID. Renewal never recreates rows; revocation is idempotent and works for disabled/expired accounts. Transactions set tenant context and statement/lock timeouts (3s/1s). Pool acquisition bounds remain the caller's pool configuration responsibility. Provider/database failures throw generic SessionStoreUnavailable; callers must withhold issuance/renewal and never fall back to stateless authentication.

Next: wire password issuance, all recruiter gates and logout, retaining a stable session ID across renewal. Legacy JWTs need deliberate reauthentication; SAML format unification needs coordinated configuration and staging proof. This commit does not fix deployed logout or certify SSO.

Tests use QORIUM_SESSION_TEST_DATABASE_URL only for an authorized disposable PostgreSQL endpoint. They create/drop a random database and minimal fixture; not production migration or grants certification. Coverage includes lifecycle, tenant/recruiter/method isolation, expiry, disabled/deleted users, idempotent revocation, duplicate prevention, concurrent renewal/revocation, read-only failures and concealed dependency errors.

## Token lifecycle adapter (HTTP wiring still pending)

The store now returns expires_at from INSERT/UPDATE RETURNING. durableSessions issues password JWTs with an absolute expiry floored to that database deadline and a stable UUID sid. Renewal uses fresh database identity. Tokens without sid/auth_method are rejected; there is no legacy stateless fallback. A correctly signed expired token can revoke its stable session, so an older cookie can invalidate a newer copy. The adapter requires an explicit signing secret of at least32 UTF-8 bytes. Actual cookie attributes, HTTP error mapping, login/all-five-gate/logout wiring and production configuration verification are not included yet.
