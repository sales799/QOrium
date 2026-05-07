-- 0007_reference_panel.sql
-- Sprint 1.8b — Reference-panel ingestion infrastructure.
--
-- The Reference Panel feeds calibration responses for SO-21 IRT scoring
-- (per `infra/IRT-Calibration-Pipeline-v0-Spec.md`). Panelists are NOT
-- recruiters and NOT customer candidates — they are paid contractors
-- + Customer-Zero opt-in candidates. Their responses live in the same
-- `content.responses` table as customer responses, but tagged so the
-- calibration job can isolate them and so PII handling matches the
-- panel governance contract (`customer-zero/Reference-Panel-Governance-v0.md`).
--
-- Adds:
--   1. `is_reference_panel` boolean flag on `content.responses` so the
--      IRT calibration job can `WHERE is_reference_panel = true`.
--   2. `app.reference_panel_tokens` — bearer-token auth surface for the
--      ingestion API. Tokens are pre-hashed with HMAC-SHA256(pepper, token)
--      using the same pepper contract as `app.api_keys` (per CTO-DELTA #4).
--   3. A dedicated `reference-panel` synthetic tenant so RLS policies
--      and queries can treat panel responses uniformly.
--
-- Idempotent: every ALTER + CREATE uses IF NOT EXISTS where supported.

BEGIN;

-- ── 1. Tag column on content.responses ───────────────────────────────
ALTER TABLE content.responses
  ADD COLUMN IF NOT EXISTS is_reference_panel BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS responses_reference_panel_idx
  ON content.responses (question_id)
  WHERE is_reference_panel = TRUE;

COMMENT ON COLUMN content.responses.is_reference_panel IS
  'TRUE for responses contributed by Reference Panel members (paid contractors / Customer-Zero opt-in). Calibration job uses this filter.';

-- ── 2. Token table for ingestion auth ────────────────────────────────
CREATE TABLE IF NOT EXISTS app.reference_panel_tokens (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  -- HMAC-SHA256(pepper, raw_token). Same hashing model as app.api_keys
  -- per CTO-DELTA #4. Raw token never stored.
  token_hash        BYTEA NOT NULL UNIQUE,
  -- Stable opaque ID for the panelist; we do NOT store name + email
  -- here. The mapping name↔panelist_id_hash lives in a separate
  -- governance-managed store outside this DB.
  panelist_id_hash  BYTEA NOT NULL,
  -- Optional metadata: cohort label, paid/volunteer, demographic group
  -- for DIF (NEVER PII). Stored as JSONB so governance can extend
  -- without migration churn.
  metadata          JSONB NOT NULL DEFAULT '{}',
  scopes            TEXT[] NOT NULL DEFAULT ARRAY['reference-panel:write'],
  expires_at        TIMESTAMPTZ NOT NULL,
  revoked_at        TIMESTAMPTZ,
  last_used_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reference_panel_tokens_tenant_idx
  ON app.reference_panel_tokens (tenant_id);

CREATE INDEX IF NOT EXISTS reference_panel_tokens_panelist_idx
  ON app.reference_panel_tokens (panelist_id_hash);

CREATE INDEX IF NOT EXISTS reference_panel_tokens_active_idx
  ON app.reference_panel_tokens (expires_at)
  WHERE revoked_at IS NULL;

COMMENT ON TABLE app.reference_panel_tokens IS
  'Bearer-token auth surface for POST /v1/reference-panel/responses. Tokens are HMAC-SHA256-pepper-hashed; raw value never stored.';

COMMENT ON COLUMN app.reference_panel_tokens.metadata IS
  'Opaque governance metadata: cohort label, paid/volunteer flag, demographic group for DIF. NEVER PII. Reference Panel Governance v0 §3.';

-- ── 3. Synthetic tenant ──────────────────────────────────────────────
INSERT INTO app.tenants (slug, name, type, plan, status)
  VALUES ('reference-panel', 'QOrium Reference Panel', 'internal', 'enterprise', 'active')
  ON CONFLICT (slug) DO NOTHING;

COMMIT;
