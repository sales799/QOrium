-- ============================================================================
-- Migration 0020: RLS tenant isolation — DRAFT, STAGING-ONLY, DO NOT APPLY
-- ============================================================================
--
--    *** CRITICAL ***  THIS MIGRATION MUST NOT BE APPLIED TO PROD WITHOUT:
--      1. The app-layer change that issues `SET LOCAL app.current_tenant_id`
--         on every request handler (qorium-api, qorium-admin, qorium-my,
--         qorium-marketing/api-routes, candidate-portal) shipped + tested.
--      2. A BYPASSRLS role granted to cron / admin / IRT engine / leak-
--         crawler / migration runner (qorium_bypass_rls below).
--      3. Staging verification: tenant A session CANNOT read tenant B rows
--         in any of the 10 tables — captured in a runbook artifact under
--         `governance/incidents/2026-06-XX-rls-staging-verify.md`.
--      4. ARJUN cross-account review of the entire stack (app wiring +
--         this migration + the BYPASSRLS role grants).
--
--    Until all four conditions are met this migration is illustrative only.
--    The CI numbering check still wants it claimed (RESERVED.md entry).
--
-- ============================================================================
-- Per `PHASE_G_ENTERPRISE_HARDENING_PACK.md` (CTO audit 2026-06-03).
--
-- CONTEXT
--   Audit found RLS DISABLED on all 10 tenant tables. Isolation is currently
--   app-layer only. Flipping RLS on without the app wiring would break every
--   production request (no tenant GUC set → policy matches nothing → 0 rows).
--
-- THE 10 TABLES
--   app.api_keys
--   app.ats_candidate_links
--   app.ats_integrations
--   app.jd_forge_orders
--   app.packs
--   app.stack_vault_access_log
--   app.stack_vaults
--   app.tenant_users
--   content.ai_pair_coding_sessions
--   content.responses
--
-- POLICY SHAPE
--   ENABLE ROW LEVEL SECURITY + FORCE (table owner is not exempt; only
--   BYPASSRLS roles are). Single tenant_isolation policy:
--     USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid)
--   The `true` second arg returns NULL if the GUC is unset, which then fails
--   the equality and returns 0 rows — fail-closed.
--
-- BYPASSRLS ROLE
--   `qorium_bypass_rls` — used by:
--     - cron jobs (IRT calibration, leak crawler, secret rotation)
--     - admin console operators (with audit logging on every grant)
--     - migration runner
--   Granted via `ALTER ROLE ... WITH BYPASSRLS`, not via policy.
--
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. BYPASSRLS role (idempotent).
--    NOTE: requires the DBA session to be a superuser. The atomic-release
--    runner role must have CREATEROLE + BYPASSRLS attributes themselves, or
--    this block needs to run as the postgres superuser.
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'qorium_bypass_rls') THEN
    EXECUTE 'CREATE ROLE qorium_bypass_rls NOLOGIN BYPASSRLS';
  ELSE
    EXECUTE 'ALTER ROLE qorium_bypass_rls WITH BYPASSRLS';
  END IF;
END$$;

-- The cron / admin / migration login roles must inherit this. Grants are
-- intentional and reviewed:
GRANT qorium_bypass_rls TO qorium_cron;            -- IRT, leak-crawler, etc.
GRANT qorium_bypass_rls TO qorium_admin;           -- support / DBA console
GRANT qorium_bypass_rls TO qorium_migration_runner;-- atomic-release apply

-- ---------------------------------------------------------------------------
-- 2. Helper: a single function that returns the current tenant UUID (or NULL)
--    so the policy expression stays one line and is consistent across tables.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION app.current_tenant_id() RETURNS UUID
LANGUAGE SQL STABLE AS $$
  SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
$$;

COMMENT ON FUNCTION app.current_tenant_id() IS
  'Returns the tenant GUC set via SET LOCAL by the app request handler. '
  'NULL when unset — policies must fail-closed on NULL.';

-- ---------------------------------------------------------------------------
-- 3. Enable RLS + tenant_isolation policy on each of the 10 tables.
--    Each block: ENABLE → FORCE → DROP existing policy if any → CREATE.
--    DROP+CREATE is idempotent and lets us iterate on the policy in a
--    follow-up migration without renaming.
-- ---------------------------------------------------------------------------

-- ---- app.api_keys ----------------------------------------------------------
ALTER TABLE app.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.api_keys FORCE  ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON app.api_keys;
CREATE POLICY tenant_isolation ON app.api_keys
  USING       (tenant_id = app.current_tenant_id())
  WITH CHECK  (tenant_id = app.current_tenant_id());

-- ---- app.ats_candidate_links ----------------------------------------------
ALTER TABLE app.ats_candidate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.ats_candidate_links FORCE  ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON app.ats_candidate_links;
CREATE POLICY tenant_isolation ON app.ats_candidate_links
  USING       (tenant_id = app.current_tenant_id())
  WITH CHECK  (tenant_id = app.current_tenant_id());

-- ---- app.ats_integrations -------------------------------------------------
ALTER TABLE app.ats_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.ats_integrations FORCE  ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON app.ats_integrations;
CREATE POLICY tenant_isolation ON app.ats_integrations
  USING       (tenant_id = app.current_tenant_id())
  WITH CHECK  (tenant_id = app.current_tenant_id());

-- ---- app.jd_forge_orders --------------------------------------------------
ALTER TABLE app.jd_forge_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.jd_forge_orders FORCE  ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON app.jd_forge_orders;
CREATE POLICY tenant_isolation ON app.jd_forge_orders
  USING       (tenant_id = app.current_tenant_id())
  WITH CHECK  (tenant_id = app.current_tenant_id());

-- ---- app.packs -------------------------------------------------------------
ALTER TABLE app.packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.packs FORCE  ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON app.packs;
CREATE POLICY tenant_isolation ON app.packs
  USING       (tenant_id = app.current_tenant_id())
  WITH CHECK  (tenant_id = app.current_tenant_id());

-- ---- app.stack_vault_access_log -------------------------------------------
ALTER TABLE app.stack_vault_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.stack_vault_access_log FORCE  ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON app.stack_vault_access_log;
CREATE POLICY tenant_isolation ON app.stack_vault_access_log
  USING       (tenant_id = app.current_tenant_id())
  WITH CHECK  (tenant_id = app.current_tenant_id());

-- ---- app.stack_vaults -----------------------------------------------------
ALTER TABLE app.stack_vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.stack_vaults FORCE  ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON app.stack_vaults;
CREATE POLICY tenant_isolation ON app.stack_vaults
  USING       (tenant_id = app.current_tenant_id())
  WITH CHECK  (tenant_id = app.current_tenant_id());

-- ---- app.tenant_users -----------------------------------------------------
-- ASSUMPTION: app.tenant_users has a tenant_id column (the table name is the
-- pluralised join — each row represents user X in tenant Y). Reviewer to
-- confirm the column name; rename here if needed.
ALTER TABLE app.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.tenant_users FORCE  ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON app.tenant_users;
CREATE POLICY tenant_isolation ON app.tenant_users
  USING       (tenant_id = app.current_tenant_id())
  WITH CHECK  (tenant_id = app.current_tenant_id());

-- ---- content.ai_pair_coding_sessions --------------------------------------
ALTER TABLE content.ai_pair_coding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content.ai_pair_coding_sessions FORCE  ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON content.ai_pair_coding_sessions;
CREATE POLICY tenant_isolation ON content.ai_pair_coding_sessions
  USING       (tenant_id = app.current_tenant_id())
  WITH CHECK  (tenant_id = app.current_tenant_id());

-- ---- content.responses ----------------------------------------------------
ALTER TABLE content.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE content.responses FORCE  ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON content.responses;
CREATE POLICY tenant_isolation ON content.responses
  USING       (tenant_id = app.current_tenant_id())
  WITH CHECK  (tenant_id = app.current_tenant_id());

-- ---------------------------------------------------------------------------
-- 4. Staging verification queries (the apply pipeline runs these as two
--    different session roles to confirm cross-tenant reads return 0).
-- ---------------------------------------------------------------------------

-- Expected behaviour after apply (run as a non-bypass tenant role):
--   SET LOCAL app.current_tenant_id = '<tenant_A_uuid>';
--   SELECT COUNT(*) FROM app.packs;   -- only tenant A's packs
--   SET LOCAL app.current_tenant_id = '<tenant_B_uuid>';
--   SELECT COUNT(*) FROM app.packs;   -- only tenant B's packs
--   RESET app.current_tenant_id;
--   SELECT COUNT(*) FROM app.packs;   -- 0 rows (fail-closed)

COMMIT;

-- ============================================================================
-- DOWN (rollback)
-- ============================================================================
-- BEGIN;
-- DO $$
-- DECLARE
--   t TEXT;
--   tables TEXT[] := ARRAY[
--     'app.api_keys','app.ats_candidate_links','app.ats_integrations',
--     'app.jd_forge_orders','app.packs','app.stack_vault_access_log',
--     'app.stack_vaults','app.tenant_users','content.ai_pair_coding_sessions',
--     'content.responses'
--   ];
-- BEGIN
--   FOREACH t IN ARRAY tables LOOP
--     EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %s', t);
--     EXECUTE format('ALTER TABLE %s NO FORCE ROW LEVEL SECURITY', t);
--     EXECUTE format('ALTER TABLE %s DISABLE ROW LEVEL SECURITY', t);
--   END LOOP;
-- END$$;
-- DROP FUNCTION IF EXISTS app.current_tenant_id();
-- -- BYPASSRLS role left in place; revoke explicitly if removing.
-- COMMIT;
