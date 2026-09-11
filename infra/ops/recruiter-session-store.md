# Durable recruiter password sessions

Password login, whoami, recruiter, billing, audit and admin gates now use durableSessions and the existing migration0017 recruiter_sessions table. Logout revokes the stable session before clearing the cookie. An authentic expired token may revoke a newer copy of the same session. Invalid/legacy cookies can be cleared idempotently; legacy tokens cannot authenticate.

Database create/renew requires an active recruiter in the same tenant and returns current identity plus expires_at. JWT expiry is floored to that stored deadline; the cookie uses the same absolute Expires value. Every request rechecks account/session state. Conditional renewal cannot revive a revoked session. Database errors return generic503, without issuing a replacement cookie; logout storage failure does not claim success or clear the cookie. JSON write requirements remain enforced.

The existing configured JWT secret must be at least32 UTF-8 bytes. Password session IDs use HMAC-SHA256 of password-session:tenantId:sessionId with that secret. There is no generated/default key, fallback to stateless sessions or automatic key rotation. SAML now uses the shared JWT contract with its separately configured signing key and saml-session identifier domain; assertion replay hashing remains separate. See shared-recruiter-sessions.md.

## Required release preparation

Verify migration0017 and grants, connection/statement/lock timeout operation, sufficiently strong existing signing configuration and database availability in staging. Plan reauthentication: old JWTs lack stable IDs and will be rejected. No live migration, secret rotation or deployment is part of this change. A rollback to old source restores its old stateless behavior and must not be presented as preserving revocation.

Test the browser/proxy/cookie topology and SAML/IdP flow before production acceptance. Signed-XML SAML ACS acceptance, password reset/session-wide invalidation policy and logout audit actor attribution remain separate review items. The original logout audit lacked a populated recruiter actor; this patch does not fabricate one. Requests already authorized before revocation may finish; subsequent gates reject the session.

## Local validation

672 tests passed,21 skipped with dedicated disposable PostgreSQL enabled. Nineteen database tests include HTTP login→renew→logout→reject-original-and-copy, disabled-account rejection, failure withholding, and separate rejection through all five protected route groups. Unit tests cover signed claim validation and token lifecycles. Existing business-route suites use explicit active-session storage fixtures while retaining real signature/claim checks and business assertions; these fixtures do not claim revocation coverage. Only dedicated database tests provide that evidence. Cookie assertions now follow the intentional absolute deadline contract.

The database fixture models relevant constraints; it does not certify full production migrations/RLS/grants. All disposable containers and volumes were removed. No live sessions or customer data were accessed.
