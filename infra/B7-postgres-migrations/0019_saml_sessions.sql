-- 0019_saml_sessions.sql
-- Durable SAML request state + recruiter SAML sessions.

BEGIN;

CREATE TABLE IF NOT EXISTS app.saml_authn_request_state (
  request_id_hash BYTEA PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  relay_state     VARCHAR(256) NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consumed_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS saml_authn_request_state_expires_idx
  ON app.saml_authn_request_state (expires_at);

CREATE INDEX IF NOT EXISTS saml_authn_request_state_tenant_idx
  ON app.saml_authn_request_state (tenant_id, created_at DESC);

ALTER TABLE app.recruiters
  ALTER COLUMN password_hash DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS external_sso_id VARCHAR(256);

CREATE INDEX IF NOT EXISTS recruiters_external_sso_id_idx
  ON app.recruiters (tenant_id, external_sso_id)
  WHERE external_sso_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS app.recruiter_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  recruiter_id    UUID NOT NULL REFERENCES app.recruiters(id) ON DELETE CASCADE,
  session_id_hash BYTEA NOT NULL UNIQUE,
  auth_method     VARCHAR(32) NOT NULL CHECK (auth_method IN ('password', 'saml', 'oidc', 'admin')),
  assertion_hash  BYTEA,
  expires_at      TIMESTAMPTZ NOT NULL,
  revoked_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS recruiter_sessions_recruiter_idx
  ON app.recruiter_sessions (recruiter_id, created_at DESC);

CREATE INDEX IF NOT EXISTS recruiter_sessions_expires_idx
  ON app.recruiter_sessions (expires_at);

COMMENT ON TABLE app.saml_authn_request_state IS
  'Short-lived SP-initiated SAML AuthnRequest state. ACS atomically marks rows consumed before issuing a session.';

COMMENT ON TABLE app.recruiter_sessions IS
  'Revocable recruiter auth sessions issued after password, SAML, OIDC, or admin login.';

COMMENT ON COLUMN app.recruiters.external_sso_id IS
  'Pinned stable IdP subject for SAML/OIDC account-claim protection.';

COMMIT;
