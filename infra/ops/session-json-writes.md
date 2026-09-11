# Direct ReadyBank session write media types

Recruiter-authenticated unsafe methods and /v1/auth actions now require application/json (charset allowed). GET/HEAD/OPTIONS remain unchanged. Form-urlencoded, multipart, plain-text and missing media types return415 before session renewal or handler execution. Current supplied login/invitation/admin clients already use JSON; direct logout callers must also send JSON, e.g. an empty object. The portal proxy forwards JSON headers; its separate Origin check remains separately reviewed work.

This rejects browser simple-form content types. It is not a complete CSRF guarantee: deployed CORS, origin/proxy topology and non-browser clients require review, and application/json preflight protection depends on restrictive CORS. No global webhook/media-type policy changes are included; non-session API paths remain as before.

Password sessions still use self-contained sliding JWTs; logout clears the browser cookie but does not revoke a copied JWT. SAML's app.recruiter_sessions records are a separate code path. Unifying revocation, disabled-user checks and absolute lifetime requires separate implementation and live schema verification. No session table, keys or live cookies changed here.

Before release verify staging login/logout/accept, recruiter/admin/audit writes and legitimate clients. Tests are synthetic HTTP/DB stubs, not browser/live acceptance. The repaired session-claim PR244 and this change need combined validation. Existing release blockers remain.
