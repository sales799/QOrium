-- QOrium PostgreSQL Migration 0002 — packs (ReadyBank export bundles)
-- Authored by Claude Code (Sprint 1.4) per handoff §6 (new migrations are mine,
-- Cowork may add comments).
-- Purpose: store the resolved question_ids[] from a `POST /v1/packs/generate`
-- call so subsequent `GET /v1/packs/{id}/export` returns a stable bundle even
-- if the underlying ReadyBank library changes between calls (no leakage of
-- mid-generation rotation events).
--
-- Lives at: infra/B7-postgres-migrations/0002_packs.sql
-- Apply via: pnpm --filter @qorium/db migrate:up
-- Rollback : statements at the bottom of this file (reference only).

BEGIN;

CREATE TABLE app.packs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  api_key_id      UUID REFERENCES app.api_keys(id) ON DELETE SET NULL,
  name            VARCHAR(200),
  filters         JSONB NOT NULL DEFAULT '{}',
  question_ids    UUID[] NOT NULL,
  question_count  INTEGER NOT NULL,
  status          VARCHAR(50) NOT NULL DEFAULT 'ready'
    CHECK (status IN ('ready', 'generating', 'failed', 'expired')),
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_exported_at TIMESTAMPTZ,
  export_count    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX packs_tenant_id_idx ON app.packs (tenant_id);
CREATE INDEX packs_api_key_id_idx ON app.packs (api_key_id) WHERE api_key_id IS NOT NULL;
CREATE INDEX packs_status_expires_idx ON app.packs (status, expires_at)
  WHERE status = 'ready';

COMMENT ON TABLE  app.packs                IS 'Snapshot of question_ids resolved by POST /v1/packs/generate. Subsequent /export calls read from this snapshot so rotation events between generate and export do not change the bundle.';
COMMENT ON COLUMN app.packs.filters        IS 'Original filter criteria (skill, format, difficulty, language, limit) used to generate the pack. JSON-encoded for replay/audit.';
COMMENT ON COLUMN app.packs.question_ids   IS 'Resolved UUIDs of content.questions rows at generation time. Order is meaningful (matches search ordering: released_at DESC, id DESC).';
COMMENT ON COLUMN app.packs.expires_at     IS 'Optional expiry; NULL = no expiry. Caller may pass expires_in_days at generation time.';
COMMENT ON COLUMN app.packs.export_count   IS 'Incremented on every successful /export response (audit + monitoring).';

COMMIT;

-- ============================================================================
-- ROLLBACK STATEMENTS (for reference; not executed)
-- ============================================================================
-- BEGIN;
-- DROP TABLE IF EXISTS app.packs CASCADE;
-- COMMIT;
