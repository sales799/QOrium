# Durable recruiter session store (integration pending)

createSessionStore is a persistence primitive, not an enabled login feature. No route currently calls it. It uses the existing migration0017 schema; verify migration/grants before adoption.

The caller supplies a trusted 32-byte identifier digest function with no default secret. For SAML compatibility preserve HMAC-SHA256 over session:tenantId:sessionId using its configured replay pepper. No key rotation is included.

Create and renewal require a currently active recruiter in the same tenant and return database identity. Every operation binds tenant, recruiter, method and stable session ID. Renewal never recreates rows; revocation is idempotent and works for disabled/expired accounts. Transactions set tenant context and statement/lock timeouts (3s/1s). Pool acquisition bounds remain the caller's pool configuration responsibility. Provider/database failures throw generic SessionStoreUnavailable; callers must withhold issuance/renewal and never fall back to stateless authentication.

Next: wire password issuance, all recruiter gates and logout, retaining a stable session ID across renewal. Legacy JWTs need deliberate reauthentication; SAML format unification needs coordinated configuration and staging proof. This commit does not fix deployed logout or certify SSO.

Tests use QORIUM_SESSION_TEST_DATABASE_URL only for an authorized disposable PostgreSQL endpoint. They create/drop a random database and minimal fixture; not production migration or grants certification. Coverage includes lifecycle, tenant/recruiter/method isolation, expiry, disabled/deleted users, idempotent revocation, duplicate prevention, concurrent renewal/revocation, read-only failures and concealed dependency errors.
