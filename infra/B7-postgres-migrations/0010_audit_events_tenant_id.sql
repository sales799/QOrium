-- =============================================================================
-- Migration 0010 — Add tenant_id to audit.events for org-wide read scope
-- Sprint 4.4.1 (Run #62)
-- =============================================================================
-- Adds the `tenant_id` column required to expand the Audit Log API's read
-- scope from "own actor_id" (Sprint 4.4 v0) to "tenant-scoped events" (v1).
--
-- Existing rows keep tenant_id NULL. The Audit Log API repository filters with
-- a transitional OR-clause `(tenant_id = $1 OR (tenant_id IS NULL AND
-- actor_id = $2))` so that legacy rows remain visible to the recruiter who
-- wrote them. New events written via `recordAuditEvent({ tenant_id, ... })`
-- populate the column directly; once all callers are migrated and a sweep
-- backfill is run, the OR-fallback can be dropped.
--
-- Index: (tenant_id, occurred_at DESC) is the workhorse for list + summary
-- queries. The existing (actor_id, occurred_at) index is left in place for
-- the legacy-fallback path.
-- =============================================================================

ALTER TABLE audit.events
  ADD COLUMN tenant_id UUID;

CREATE INDEX audit_events_tenant_idx
  ON audit.events (tenant_id, occurred_at DESC)
  WHERE tenant_id IS NOT NULL;

COMMENT ON COLUMN audit.events.tenant_id IS
  'Tenant scope for org-wide read API. Nullable for legacy rows + system events. Sprint 4.4.1.';
