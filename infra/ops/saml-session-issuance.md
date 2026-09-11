# SAML session issuance binding

recordSamlSession now inserts only from a recruiter row that is active, belongs to the supplied tenant and still has the assertion NameID pinned as external_sso_id. The session expiry must be future. SELECT FOR SHARE coordinates with concurrent account updates; no matching row causes issuance to fail. ACS already withholds the cookie when this function throws.

This check closes the gap between earlier recruiter resolution and persistence. The integrated shared JWT contract makes new SAML sessions usable by the API, whose durable request checks reject later disabled/revoked sessions. This issuance check alone does not provide those request-time guarantees.

Four real PostgreSQL regression failures reproduced before the fix. Five cases pass after: valid issuance and rejection of disabled account, changed IdP subject, expired session and tenant mismatch. Full marketing suite104 tests pass. Minimal isolated schema fixture is not production migration/grants certification. No real assertion, customer row, key or deployment changed.

The integration branch includes PR248's production missing-storage guard and the shared JWT contract. Development request/metadata proof flows remain; synthetic non-UUID recruiters cannot obtain an API session. Shared SAML JWT integration must retain method/issuer/tenant binding, fixed recruiter role, durable revocation and explicit trusted signing configuration; do not accept arbitrary asserted roles or legacy two-segment cookies as API credentials.
