-- ============================================================================
-- Migration 0013: secret rotation tracking
-- ============================================================================
-- Per `infra/B6-Secret-Rotation-Calendar.md` §1, §2, §3.
--
-- A small ledger for tracking every rotation event across the
-- inventory in B6 §2 (DATABASE_URL_PROD, Anthropic, Razorpay, etc.).
-- The actual rotation is performed manually or via the worker in
-- Sprint 2.8; this table is the audit trail + scheduling source of truth.
-- ============================================================================

BEGIN;

CREATE TABLE app.secret_rotations (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  /** Canonical identifier for the secret, e.g. 'DATABASE_URL_PROD'. */
  resource_key           VARCHAR(128) NOT NULL,
  resource_type          VARCHAR(64) NOT NULL CHECK (resource_type IN (
    'database_url', 'api_key', 'webhook_secret', 'oauth_client',
    'jwt_signing_key', 'tls_certificate', 'ssh_key', 'storage_credentials',
    'webhook_subscription_secret', 'sso_oidc_secret', 'integration_token'
  )),
  /** Owner of the rotation runbook (eg 'CTO Office', 'Finance + CTO'). */
  owner                  VARCHAR(64) NOT NULL DEFAULT 'CTO Office',
  /** Days between rotations per B6 §2. */
  rotation_policy_days   INT NOT NULL,
  last_rotated_at        TIMESTAMPTZ,
  last_rotated_by        VARCHAR(128),
  next_rotation_due      TIMESTAMPTZ NOT NULL,
  status                 VARCHAR(32) NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'reminder_sent', 'overdue', 'rotated', 'paused')),
  /** Number of failed rotation attempts since last success. */
  attempt_count          INT NOT NULL DEFAULT 0,
  last_attempt_at        TIMESTAMPTZ,
  last_error             TEXT,
  /** Free-form context: provider, tenant_id, environment, etc. */
  metadata               JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (resource_key)
);

CREATE INDEX secret_rotations_due_idx
  ON app.secret_rotations (next_rotation_due) WHERE status != 'paused';
CREATE INDEX secret_rotations_status_idx
  ON app.secret_rotations (status);

COMMENT ON TABLE app.secret_rotations IS
  'Ledger + scheduling source-of-truth for the B6 secret rotation calendar.';

CREATE TABLE app.secret_rotation_log (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rotation_id            UUID NOT NULL REFERENCES app.secret_rotations(id) ON DELETE CASCADE,
  event                  VARCHAR(40) NOT NULL CHECK (event IN (
    'reminder_sent', 'rotation_started', 'rotation_succeeded',
    'rotation_failed', 'rotation_skipped', 'manual_override'
  )),
  payload                JSONB DEFAULT '{}'::jsonb,
  occurred_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX secret_rotation_log_rotation_idx
  ON app.secret_rotation_log (rotation_id, occurred_at DESC);

COMMIT;

-- Rollback ------------------------------------------------------------------
-- DROP TABLE app.secret_rotation_log;
-- DROP TABLE app.secret_rotations;
