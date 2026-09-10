# Authentication deployment requirements

The API validates production authentication configuration before creating the
repository or listening. For `NODE_ENV=production`, explicitly configure:

- `QORIUM_SIGNING_SECRET` and `QORIUM_RECRUITER_JWT_SECRET`: distinct, randomly
  generated secrets, each at least 32 characters. Length validation does not
  establish randomness or protect a leaked key.
- `QORIUM_RECRUITER_EMAIL`: the configured recruiter email, not the development
  example address.
- `QORIUM_RECRUITER_PASSWORD`: a non-development password of at least 16
  non-padding characters.
- `QORIUM_RECRUITER_ORG_ID`: the organization identifier; existing records are
  not reassigned automatically.
- Secure cookies must stay enabled. The included PM2 configuration forwards
  these settings from the deployment environment without embedding secrets.

Development defaults remain available outside production for local tests only.
The token wire format is unchanged, but tokens with absent/invalid/expired `exp`,
invalid claim types or extra segments are rejected. Expiry is an integer Unix
millisecond timestamp. Assessment and recruiter signing keys are separate in
production; a transition from shared signing keys can invalidate existing
recruiter sessions and must be planned before rollout.

Do not restart production to discover missing configuration. Verify the target
release, protected environment configuration and rollback first. This change
neither provisions nor rotates live secrets, and no production configuration was
inspected or changed during local validation. Record the deployed release and
run authenticated acceptance checks before certifying readiness.

This is the existing single configured recruiter login, not a multi-user identity
provider. Session revocation, credential rotation, browser-origin policy, abuse
controls and full tenant authorization remain separate acceptance work.
