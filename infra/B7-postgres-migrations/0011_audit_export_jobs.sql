-- =============================================================================
-- Migration 0011 — Audit log export jobs (Sprint 4.4.2 / Run #63)
-- =============================================================================
-- Per `infra/Audit-Log-API-Spec-v0.md` §7: customers can request bulk exports
-- of their audit log. Exports are async — POST creates a job, GET polls for
-- status + downloads the materialized content.
--
-- v0 implementation (this migration): in-process synchronous worker writes
-- the rendered bytes back to `content` BYTEA. Real distributed worker with
-- S3 storage + signed URLs is Sprint 4.4.2.1.
--
-- Tenant scoping: every row carries (tenant_id, actor_id) so the same
-- transitional SCOPE_CLAUSE used in /v1/audit/events
--   (tenant_id = $1 OR (tenant_id IS NULL AND actor_id = $2))
-- applies to job lookups too.
-- =============================================================================

CREATE TABLE app.audit_export_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Scope: same SCOPE_CLAUSE pattern as audit.events
  tenant_id       UUID,
  actor_id        UUID,

  -- Request
  format          VARCHAR(16) NOT NULL CHECK (format IN ('csv', 'json')),
  filters_json    JSONB DEFAULT '{}',
  start_date      TIMESTAMPTZ,
  end_date        TIMESTAMPTZ,

  -- Lifecycle
  status          VARCHAR(20) NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'expired')),
  error_message   TEXT,

  -- Output (v0: stored in DB; v1 will store S3 key instead)
  row_count       INTEGER,
  content_type    VARCHAR(64),
  content         BYTEA,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days'
);

-- Look up jobs by (tenant_id, created_at DESC) for the active-jobs limiter.
CREATE INDEX audit_export_jobs_tenant_idx
  ON app.audit_export_jobs (tenant_id, created_at DESC)
  WHERE tenant_id IS NOT NULL;

-- Legacy fallback: lookups by actor_id when tenant_id IS NULL (Sprint 4.4 v0
-- callers pre-migration). Mirrors the audit.events scoping pattern.
CREATE INDEX audit_export_jobs_actor_idx
  ON app.audit_export_jobs (actor_id, created_at DESC)
  WHERE tenant_id IS NULL;

-- Active-job-count guard query: count rows still queued/processing per tenant.
CREATE INDEX audit_export_jobs_active_idx
  ON app.audit_export_jobs (tenant_id, status)
  WHERE status IN ('queued', 'processing');

COMMENT ON TABLE app.audit_export_jobs IS
  'Audit Log API export jobs (Sprint 4.4.2). One row per POST /v1/audit/events/export. content BYTEA holds the rendered export until expires_at; v1 will replace with S3 key.';
