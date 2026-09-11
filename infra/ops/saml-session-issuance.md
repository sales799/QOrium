# SAML session issuance binding

recordSamlSession now inserts only from a recruiter row that is active, belongs to the supplied tenant and still has the assertion NameID pinned as external_sso_id. The session expiry must be future. SELECT FOR SHARE coordinates with concurrent account updates; no matching row causes issuance to fail. ACS already withholds the cookie when this function throws.

This check closes the gap between earlier recruiter resolution and persistence. It does not make SAML tokens compatible with the recruiter API or revoke an already issued token after later account changes. PR247's durable request checks and the pending SAML token integration are needed for the latter.

Four real PostgreSQL regression failures reproduced before the fix. Five cases pass after: valid issuance and rejection of disabled account, changed IdP subject, expired session and tenant mismatch. Full marketing suite104 tests pass. Minimal isolated schema fixture is not production migration/grants certification. No real assertion, customer row, key or deployment changed.

PR248's production missing-storage guard is an independent prerequisite; this branch is based on main and does not include it. Development proof fallback remains as before until the guard is combined. Shared SAML JWT integration must retain method/issuer/tenant binding, fixed recruiter role, durable revocation and explicit trusted signing configuration; do not accept arbitrary asserted roles or legacy two-segment cookies as API credentials.
