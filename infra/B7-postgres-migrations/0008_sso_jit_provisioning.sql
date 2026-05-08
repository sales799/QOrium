-- 0008_sso_jit_provisioning.sql
-- Sprint 3.3 — SAML/SSO + JIT provisioning + SCIM 2.0.
--
-- Implements `infra/SSO-SAML-Enterprise-Spec-v1.md` §6 (Tenant configuration
-- table) plus supporting infrastructure for §1 (IdP-init), §2 (JIT
-- provisioning), §3 (SCIM 2.0 endpoints), §4 (Key rotation cadence).
--
-- Live IdP integration tests are gated on cred-drop per spec §9. The library
-- code in @qorium/saml validates assertions lexically (XML-DSig + clock skew +
-- replay) without IdP credentials.
--
-- Adds:
--   1. app.tenant_sso_config — per-tenant IdP config (SAML XOR OIDC).
--   2. app.saml_assertions_seen — replay-attack guard (assertion IDs +
--      authnRequest IDs the SP has seen recently).
--   3. app.scim_external_id_map — maps SCIM externalId ↔ recruiter row
--      for idempotent SCIM CRUD.
--   4. app.sp_signing_certs — SP signing certs with overlap window for
--      §4.1 (30-day overlap rotation).
--
-- Idempotent: every ALTER + CREATE uses IF NOT EXISTS where supported.

BEGIN;

-- ── 1. Per-tenant SSO config (spec §6) ──────────────────────────────
CREATE TABLE IF NOT EXISTS app.tenant_sso_config (
  tenant_id              UUID PRIMARY KEY REFERENCES app.tenants(id) ON DELETE CASCADE,
  protocol               VARCHAR(16) NOT NULL CHECK (protocol IN ('saml', 'oidc', 'none')),

  -- SAML fields
  idp_entity_id          VARCHAR(256),
  idp_sso_url            VARCHAR(512),
  idp_slo_url            VARCHAR(512),
  -- PEM-encoded X.509 IdP signing cert; up to 2 active to support rotation
  -- (current + next during 30-day overlap window per §4.2)
  idp_signing_cert       TEXT,
  idp_signing_cert_next  TEXT,
  idp_metadata_url       VARCHAR(512),

  -- OIDC fields
  oidc_issuer            VARCHAR(512),
  oidc_client_id         VARCHAR(256),
  -- AES-GCM encrypted at rest with key in Vault (per §4.4 + §4.5)
  oidc_client_secret_enc TEXT,

  -- SCIM bearer token: HMAC-SHA256(pepper, raw_token) — same model as api_keys
  scim_token_hash        BYTEA,
  scim_token_expires_at  TIMESTAMPTZ,

  -- Behavioural flags
  default_redirect_path  VARCHAR(256) DEFAULT '/recruiter/dashboard.html',
  allow_jit_provisioning BOOLEAN NOT NULL DEFAULT FALSE,
  allow_idp_initiated    BOOLEAN NOT NULL DEFAULT FALSE,
  delete_users_allowed   BOOLEAN NOT NULL DEFAULT FALSE,
  encryption_required    BOOLEAN NOT NULL DEFAULT FALSE,

  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure only one auth protocol is configured per tenant
  CONSTRAINT tenant_sso_protocol_xor CHECK (
    (protocol = 'saml' AND idp_entity_id IS NOT NULL AND idp_sso_url IS NOT NULL) OR
    (protocol = 'oidc' AND oidc_issuer IS NOT NULL AND oidc_client_id IS NOT NULL) OR
    (protocol = 'none')
  )
);

COMMENT ON TABLE app.tenant_sso_config IS
  'Per-tenant SAML/OIDC + SCIM config. SP/IdP-init flow honored only when allow_idp_initiated=true. JIT-create on first login when allow_jit_provisioning=true.';

CREATE INDEX IF NOT EXISTS tenant_sso_config_protocol_idx
  ON app.tenant_sso_config (protocol);

-- ── 2. Replay-attack guard (spec §1.3 + §1.1) ───────────────────────
-- Stores AuthnRequest IDs (SP-init) AND assertion IDs (IdP-init) that
-- have been seen. Lookup is by hash for index size; raw IDs are
-- typically opaque XML IDs ~30+ chars.
CREATE TABLE IF NOT EXISTS app.saml_assertions_seen (
  -- HMAC-SHA256(pepper, ID || tenant_id) for index size + tenant binding
  assertion_id_hash  BYTEA PRIMARY KEY,
  tenant_id          UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  -- 'authn_request' (SP-init) | 'assertion' (IdP-init)
  kind               VARCHAR(16) NOT NULL CHECK (kind IN ('authn_request', 'assertion')),
  -- The assertion's NotOnOrAfter; we expire rows via cron
  expires_at         TIMESTAMPTZ NOT NULL,
  seen_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS saml_assertions_seen_expires_idx
  ON app.saml_assertions_seen (expires_at);

CREATE INDEX IF NOT EXISTS saml_assertions_seen_tenant_idx
  ON app.saml_assertions_seen (tenant_id, seen_at DESC);

COMMENT ON TABLE app.saml_assertions_seen IS
  'Replay-attack guard for SAML SP-init AuthnRequests + IdP-init assertions. Rows expire at NotOnOrAfter; daily cron purges expired rows.';

-- ── 3. SCIM externalId map (spec §3.4) ──────────────────────────────
CREATE TABLE IF NOT EXISTS app.scim_external_id_map (
  tenant_id      UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  external_id    VARCHAR(256) NOT NULL,
  recruiter_id   UUID NOT NULL REFERENCES app.recruiters(id) ON DELETE CASCADE,
  resource_type  VARCHAR(16) NOT NULL CHECK (resource_type IN ('User', 'Group')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, external_id, resource_type)
);

CREATE INDEX IF NOT EXISTS scim_external_id_map_recruiter_idx
  ON app.scim_external_id_map (recruiter_id);

COMMENT ON TABLE app.scim_external_id_map IS
  'Idempotency mapping for SCIM CRUD. Same externalId posted twice → returns existing recruiter row, never duplicates.';

-- ── 4. SP signing certs with overlap (spec §4.1) ────────────────────
CREATE TABLE IF NOT EXISTS app.sp_signing_certs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- PEM-encoded X.509 cert + its private key reference (Vault path)
  cert_pem        TEXT NOT NULL,
  key_vault_path  VARCHAR(256) NOT NULL,
  not_before      TIMESTAMPTZ NOT NULL,
  not_after       TIMESTAMPTZ NOT NULL,
  -- Active = currently used to sign new AuthnRequests
  -- Retired = still published in metadata for the 30-day overlap window
  status          VARCHAR(16) NOT NULL CHECK (status IN ('active', 'retired')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  retired_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS sp_signing_certs_status_idx
  ON app.sp_signing_certs (status, not_after);

COMMENT ON TABLE app.sp_signing_certs IS
  'SP signing certs with rotation overlap. New cert stays active >=30d before old retires. Both published in /v1/auth/saml/metadata during overlap so IdPs can update at their pace.';

-- ── 5. Add SSO source to recruiters ──────────────────────────────────
-- Tracks which login produced the row so security review can identify
-- JIT-provisioned vs admin-created.
ALTER TABLE app.recruiters
  ADD COLUMN IF NOT EXISTS auth_source VARCHAR(32) NOT NULL DEFAULT 'password'
    CHECK (auth_source IN ('password', 'saml-jit', 'saml-claim', 'scim', 'admin'));

COMMENT ON COLUMN app.recruiters.auth_source IS
  'How this row was created: password=signup, saml-jit=first SAML login, saml-claim=existing email matched on first SAML, scim=provisioned via SCIM, admin=manual creation.';

COMMIT;
