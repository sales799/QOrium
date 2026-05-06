-- ============================================================================
-- Migration 0007: JD-Forge orders + question lineage
-- ============================================================================
-- Per infra/JD-Forge-v0-Design.md §5:
--
--   app.jd_forge_orders — one row per customer JD-pack request. Records the
--     parsed spec, the generated question UUIDs, the export format, the
--     status, and the cost charged. Drives the JD-Forge dashboard and the
--     /v1/jd-forge/requests/{id} polling endpoint.
--
--   content.questions.jd_forge_source_id — FK lineage column. NULL for
--     ReadyBank/Stack-Vault items; set when a question was generated for a
--     specific JD-Forge order. Enables forensic queries ("which JD packs
--     contain this question?") without scanning JSONB.
--
-- Spec calls for a `jd_forge_orders` table at the top level of the schema;
-- we put it under `app.*` for consistency with `app.tenants`/`app.api_keys`.
-- The CTO-DELTA `CTO-DELTA-jdforge-app-schema.md` records the placement.
-- ============================================================================

BEGIN;

CREATE TABLE app.jd_forge_orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID REFERENCES app.tenants(id) ON DELETE CASCADE,
  tier                VARCHAR(20) NOT NULL DEFAULT 'standard'
    CHECK (tier IN ('standard', 'reviewed', 'enterprise')),
  jd_text             TEXT NOT NULL,
  jd_hash             VARCHAR(64) NOT NULL,            -- SHA-256(jd_text) for cache lookup
  parsed_spec         JSONB,                            -- Stage 1 + 2 + 3 output (per spec §3)
  question_ids        UUID[] NOT NULL DEFAULT '{}',
  status              VARCHAR(40) NOT NULL DEFAULT 'pending'
    CHECK (status IN (
      'pending',
      'parsing',
      'mapping',
      'generating',
      'validating',
      'sme_review',
      'completed',
      'failed',
      'leaked'
    )),
  requested_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  failed_at           TIMESTAMPTZ,
  failure_reason      TEXT,
  sme_reviewed_by     UUID REFERENCES app.users(id) ON DELETE SET NULL,
  export_format       VARCHAR(40) DEFAULT 'json'
    CHECK (export_format IN ('json', 'csv', 'mettl-csv', 'hackerrank-yaml', 'pdf')),
  export_url          TEXT,
  cost_charged        NUMERIC(7, 2),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX jd_forge_orders_tenant_idx ON app.jd_forge_orders (tenant_id);
CREATE INDEX jd_forge_orders_status_idx ON app.jd_forge_orders (status);
CREATE INDEX jd_forge_orders_jd_hash_idx ON app.jd_forge_orders (jd_hash);
CREATE INDEX jd_forge_orders_requested_at_idx ON app.jd_forge_orders (requested_at DESC);

COMMENT ON TABLE app.jd_forge_orders IS
  'JD-Forge order lifecycle. Per infra/JD-Forge-v0-Design.md §5. v0 supports tier=standard only; reviewed/enterprise deferred to M5+.';
COMMENT ON COLUMN app.jd_forge_orders.jd_hash IS
  'SHA-256 of jd_text. Used by the parser cache (skip parsing on identical JD within 7 days per spec §3.1).';

ALTER TABLE content.questions
  ADD COLUMN jd_forge_source_id UUID REFERENCES app.jd_forge_orders(id) ON DELETE SET NULL;

CREATE INDEX questions_jd_forge_source_idx
  ON content.questions (jd_forge_source_id)
  WHERE jd_forge_source_id IS NOT NULL;

COMMENT ON COLUMN content.questions.jd_forge_source_id IS
  'Lineage FK to the JD-Forge order that generated this question. NULL for ReadyBank/Stack-Vault.';

COMMIT;

-- Rollback ------------------------------------------------------------------
-- DROP INDEX content.questions_jd_forge_source_idx;
-- ALTER TABLE content.questions DROP COLUMN jd_forge_source_id;
-- DROP TABLE app.jd_forge_orders;
