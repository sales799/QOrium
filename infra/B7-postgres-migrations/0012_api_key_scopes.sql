-- ============================================================================
-- Migration 0012: extend app.api_keys for D3 Talpro internal-namespace keys
-- ============================================================================
-- Per `infra/D3-Talpro-Internal-API-Key-Spec.md` §3, §4, §6.
--
-- The 0001 schema already ships `scopes TEXT[]` and `expires_at TIMESTAMPTZ`.
-- This migration adds the per-key rate limit configuration + rotation
-- reminder timestamps required by D3 §4 and B6 calendar.
-- ============================================================================

BEGIN;

ALTER TABLE app.api_keys
  ADD COLUMN IF NOT EXISTS rate_limit_per_min INT NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS rate_limit_burst INT NOT NULL DEFAULT 120,
  ADD COLUMN IF NOT EXISTS rotation_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_rotated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN app.api_keys.rate_limit_per_min IS
  'Sustained throughput cap (requests/min). D3 §4.1 sets 1000 for Talpro Customer Zero.';
COMMENT ON COLUMN app.api_keys.rate_limit_burst IS
  'Per-second burst cap. D3 §4.1 sets 60 for Talpro Customer Zero.';
COMMENT ON COLUMN app.api_keys.rotation_due_at IS
  'When the key MUST be rotated (default 180 days from issue per B6).';
COMMENT ON COLUMN app.api_keys.metadata IS
  'Free-form metadata: customer support note, issuing operator, scope notes.';

CREATE INDEX IF NOT EXISTS api_keys_rotation_due_idx
  ON app.api_keys (rotation_due_at) WHERE revoked_at IS NULL;

COMMIT;

-- Rollback ------------------------------------------------------------------
-- DROP INDEX IF EXISTS app.api_keys_rotation_due_idx;
-- ALTER TABLE app.api_keys
--   DROP COLUMN metadata,
--   DROP COLUMN last_rotated_at,
--   DROP COLUMN rotation_due_at,
--   DROP COLUMN rate_limit_burst,
--   DROP COLUMN rate_limit_per_min;
