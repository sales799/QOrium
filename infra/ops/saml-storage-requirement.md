# Production SAML storage requirement

The optional SAML pool now rejects an unconfigured production database, including a cached null fallback. Login and ACS return a generic503 before beginning authentication/processing when pool configuration cannot be established. Test/development proof fallback remains available. This prevents configured production code from issuing unsaved proof sessions or using process-local replay state merely because database settings are absent.

A configured Pool object is not a health, grants or migration check. This change does not validate connectivity or change later database-error handling. Verify migration0017, replay tables/permissions and configured replay pepper in staging. No database URL, secret or key is invented or rotated by this patch.

The shared SAML JWT issuer/verifier is now integrated; this guard alone is not SSO certification. Local signed-XML ACS validation now passes; real IdP/browser acceptance remains required. See shared-recruiter-sessions.md. Existing production deployments without SAML database configuration will intentionally receive503 and need verified configuration before SAML can be enabled.

Seven synthetic tests cover absent/partial settings, cached development fallback, test fallback, configured pool selection and both route failures. Five failures reproduced before the fix;106 marketing tests pass after it. Tests use a mocked pool factory and do not claim real PostgreSQL/IdP acceptance. No customer sessions, live database changes or deployments are included.
