-- =============================================================================
-- Migration 0014 — ATS connector framework schema (Sprint 4.6 / Run #66)
-- =============================================================================
-- Per `infra/ATS-Connector-Framework-v0.md` §2. v0 framework + schema; the
-- live-fetch adapters (Greenhouse / Workday / Ashby / Darwinbox per spec
-- §3) land in Sprint 4.6.1+. First adapter is Lever (open API; OSS fixtures)
-- per `governance/Auto-Mode-Remote-Plan-v1.md` §Phase F Sprint 4.2.
--
-- Tenant scope mirrors the audit-log + webhooks pattern. Credentials are
-- stored as HMAC-keyed BYTEA (key from env API_KEY_PEPPER) so a DB
-- compromise can't read the raw API token; the raw token is shown to the
-- customer once at connection-create time.
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS ats;

CREATE TABLE ats.connections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL,
  platform        VARCHAR(32) NOT NULL
    CHECK (platform IN ('lever', 'greenhouse', 'workday', 'ashby', 'darwinbox')),
  display_name    VARCHAR(120) NOT NULL,

  -- HMAC of the API token (or OAuth refresh token). Raw shown once.
  credential_hash BYTEA NOT NULL,
  credential_kind VARCHAR(16) NOT NULL DEFAULT 'api_token'
    CHECK (credential_kind IN ('api_token', 'oauth')),

  -- OAuth-only: encrypted refresh token (kept out of v0; nullable until
  -- Sprint 4.6.2 wires Workday OAuth).
  oauth_refresh_blob BYTEA,
  oauth_expires_at   TIMESTAMPTZ,

  -- Customer-controlled config (field mappings, polling cadence, etc.)
  config_json     JSONB NOT NULL DEFAULT '{}',

  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  last_sync_at    TIMESTAMPTZ,
  last_error      TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (tenant_id, platform, display_name)
);

CREATE INDEX ats_connections_tenant_idx
  ON ats.connections (tenant_id, is_active, platform);

CREATE TABLE ats.sync_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id   UUID NOT NULL REFERENCES ats.connections(id) ON DELETE CASCADE,
  tenant_id       UUID NOT NULL,

  kind            VARCHAR(32) NOT NULL
    CHECK (kind IN ('candidates', 'jobs', 'assessment_results', 'auth_refresh')),

  status          VARCHAR(20) NOT NULL DEFAULT 'idle'
    CHECK (status IN ('idle', 'running', 'succeeded', 'failed')),

  rows_in         INTEGER NOT NULL DEFAULT 0,
  rows_out        INTEGER NOT NULL DEFAULT 0,
  rows_skipped    INTEGER NOT NULL DEFAULT 0,
  error_message   TEXT,

  started_at      TIMESTAMPTZ,
  finished_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ats_sync_runs_connection_idx
  ON ats.sync_runs (connection_id, created_at DESC);

CREATE INDEX ats_sync_runs_tenant_idx
  ON ats.sync_runs (tenant_id, kind, created_at DESC);

COMMENT ON TABLE ats.connections IS
  'Per-tenant ATS connection credentials + config (Sprint 4.6). credential_hash is HMAC-keyed; raw token shown once at create time.';
COMMENT ON TABLE ats.sync_runs IS
  'Per-(connection, kind) sync run history. Worker pulls runs in idle/running state and drives them through the SyncStateMachine.';
