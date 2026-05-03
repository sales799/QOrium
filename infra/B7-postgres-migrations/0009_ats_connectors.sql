-- ============================================================================
-- Migration 0009: ATS Connector Framework
-- ============================================================================
-- Per infra/ATS-Connector-Framework-v0.md §4 (auth model) + §5 (data flow) +
-- §6 (idempotency).
--
--   app.ats_integrations — one row per (tenant, ATS platform) connection.
--     Holds OAuth tokens / API keys (encrypted), webhook secret, and the
--     tenant's chosen custom-field mappings. The OAuth/access tokens are
--     stored encrypted at rest; the columns hold cipher-text.
--
--   app.ats_webhook_log — append-only audit + idempotency cache. Spec §6
--     requires `Idempotency-Key`-based replay safety; this table provides it.
--
--   app.ats_candidate_links — maps the tenant's external candidate id (from
--     the ATS) to the QOrium candidate row. Enforces uniqueness per spec §6
--     (`UNIQUE (tenant_id, ats_platform, external_candidate_id)`).
-- ============================================================================

BEGIN;

CREATE TABLE app.ats_integrations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  ats_platform          VARCHAR(40) NOT NULL CHECK (ats_platform IN (
    'greenhouse',
    'ashby',
    'darwinbox',
    'workday',
    'lever',          -- v1+ roadmap (spec §1.2)
    'bamboohr',
    'successfactors',
    'icims',
    'smartrecruiters',
    'workable',
    'recruitee'
  )),
  /** OAuth or API-key auth state, encrypted at rest. NULL while in OAuth flow. */
  access_token_cipher   TEXT,
  refresh_token_cipher  TEXT,
  api_key_cipher        TEXT,
  /** When the access token expires (OAuth only). */
  access_token_expires_at TIMESTAMPTZ,
  /** Webhook signing secret provided by the ATS for inbound verification. */
  webhook_secret_cipher TEXT,
  /** Tenant-specific configuration (field mappings, ATS URL, etc.). */
  tenant_config         JSONB DEFAULT '{}'::jsonb,
  status                VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'auth_required', 'degraded', 'suspended')),
  /** Sandbox flag per spec §9.2 — sandbox webhooks don't count toward billing. */
  sandbox_mode          BOOLEAN NOT NULL DEFAULT false,
  last_synced_at        TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, ats_platform)
);

CREATE INDEX ats_integrations_tenant_idx ON app.ats_integrations (tenant_id);
CREATE INDEX ats_integrations_status_idx ON app.ats_integrations (status);
CREATE INDEX ats_integrations_platform_idx ON app.ats_integrations (ats_platform);

COMMENT ON TABLE app.ats_integrations IS
  'Per-tenant ATS connection. Tokens encrypted at rest. One row per (tenant, ATS platform).';

CREATE TABLE app.ats_webhook_log (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id      UUID NOT NULL REFERENCES app.ats_integrations(id) ON DELETE CASCADE,
  ats_platform        VARCHAR(40) NOT NULL,
  /** Idempotency-Key from the inbound webhook (or a synthesised key for ATSes
   * that don't supply one — sha256 of body+platform+received_at-bucket). */
  idempotency_key     VARCHAR(128) NOT NULL,
  event_type          VARCHAR(80) NOT NULL,
  signature_valid     BOOLEAN NOT NULL,
  /** 'received' immediately after signature check; 'processed' on success;
   * 'failed' on terminal failure. */
  status              VARCHAR(20) NOT NULL DEFAULT 'received'
    CHECK (status IN ('received', 'processed', 'failed', 'duplicate')),
  payload             JSONB,
  response_status     INT,
  error_message       TEXT,
  received_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at        TIMESTAMPTZ,
  UNIQUE (integration_id, idempotency_key)
);

CREATE INDEX ats_webhook_log_integration_received_idx
  ON app.ats_webhook_log (integration_id, received_at DESC);
CREATE INDEX ats_webhook_log_event_type_idx ON app.ats_webhook_log (event_type);
CREATE INDEX ats_webhook_log_status_idx ON app.ats_webhook_log (status);

COMMENT ON TABLE app.ats_webhook_log IS
  'Append-only ATS webhook audit + idempotency cache. UNIQUE (integration_id, idempotency_key) enforces replay safety per spec §6.';

CREATE TABLE app.ats_candidate_links (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id          UUID NOT NULL REFERENCES app.ats_integrations(id) ON DELETE CASCADE,
  tenant_id               UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  ats_platform            VARCHAR(40) NOT NULL,
  external_candidate_id   VARCHAR(255) NOT NULL,
  /** Internal QOrium candidate id (string; references the existing candidate
   * concept on `content.responses.candidate_id` rather than a hard FK so the
   * mapping survives candidate deletion). */
  qorium_candidate_id     VARCHAR(100) NOT NULL,
  external_job_id         VARCHAR(255),
  /** Cached candidate metadata for the dashboards; treat as advisory. */
  candidate_email         VARCHAR(255),
  candidate_first_name    VARCHAR(120),
  candidate_last_name     VARCHAR(120),
  assessment_status       VARCHAR(40)
    CHECK (assessment_status IS NULL OR assessment_status IN (
      'pending', 'invited', 'in_progress', 'completed', 'expired', 'opted_out'
    )),
  assessment_score        NUMERIC(5, 2),
  assessment_url          TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, ats_platform, external_candidate_id)
);

CREATE INDEX ats_candidate_links_integration_idx ON app.ats_candidate_links (integration_id);
CREATE INDEX ats_candidate_links_qorium_idx ON app.ats_candidate_links (qorium_candidate_id);
CREATE INDEX ats_candidate_links_status_idx ON app.ats_candidate_links (assessment_status);

COMMENT ON TABLE app.ats_candidate_links IS
  'Tenant ATS external candidate id ↔ QOrium candidate id mapping. Enforces (tenant_id, ats_platform, external_candidate_id) uniqueness per spec §6.';

COMMIT;

-- Rollback ------------------------------------------------------------------
-- DROP TABLE app.ats_candidate_links;
-- DROP TABLE app.ats_webhook_log;
-- DROP TABLE app.ats_integrations;
