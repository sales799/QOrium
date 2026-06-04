-- Phase G: enterprise tenant RLS for staging/production tenant-scoped tables.
--
-- Apply as the schema owner/admin only after the deployed app sets:
--   select set_config('app.current_tenant_id', '<tenant-uuid>', true);
-- inside every tenant-scoped transaction.
--
-- Migrations, admin jobs, and trusted cron workers should use a separate
-- BYPASSRLS role. Do not run this against production before staging proves
-- cross-tenant reads return zero rows for the runtime role.

CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE FUNCTION app.current_tenant_id_uuid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(current_setting('app.current_tenant_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION app.apply_tenant_rls(target_table regclass, tenant_column name)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', target_table);
  EXECUTE format('ALTER TABLE %s FORCE ROW LEVEL SECURITY', target_table);
  EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %s', target_table);
  EXECUTE format(
    'CREATE POLICY tenant_isolation ON %s USING (%I = app.current_tenant_id_uuid()) WITH CHECK (%I = app.current_tenant_id_uuid())',
    target_table,
    tenant_column,
    tenant_column
  );
END;
$$;

DO $$
BEGIN
  IF to_regclass('app.api_keys') IS NOT NULL THEN
    PERFORM app.apply_tenant_rls('app.api_keys'::regclass, 'tenant_id');
  END IF;
  IF to_regclass('app.ats_candidate_links') IS NOT NULL THEN
    PERFORM app.apply_tenant_rls('app.ats_candidate_links'::regclass, 'tenant_id');
  END IF;
  IF to_regclass('app.ats_integrations') IS NOT NULL THEN
    PERFORM app.apply_tenant_rls('app.ats_integrations'::regclass, 'tenant_id');
  END IF;
  IF to_regclass('app.jd_forge_orders') IS NOT NULL THEN
    PERFORM app.apply_tenant_rls('app.jd_forge_orders'::regclass, 'tenant_id');
  END IF;
  IF to_regclass('app.packs') IS NOT NULL THEN
    PERFORM app.apply_tenant_rls('app.packs'::regclass, 'tenant_id');
  END IF;
  IF to_regclass('app.stack_vault_access_log') IS NOT NULL THEN
    PERFORM app.apply_tenant_rls('app.stack_vault_access_log'::regclass, 'tenant_id');
  END IF;
  IF to_regclass('app.stack_vaults') IS NOT NULL THEN
    PERFORM app.apply_tenant_rls('app.stack_vaults'::regclass, 'tenant_id');
  END IF;
  IF to_regclass('app.tenant_users') IS NOT NULL THEN
    PERFORM app.apply_tenant_rls('app.tenant_users'::regclass, 'tenant_id');
  END IF;
  IF to_regclass('content.ai_pair_coding_sessions') IS NOT NULL THEN
    PERFORM app.apply_tenant_rls('content.ai_pair_coding_sessions'::regclass, 'tenant_id');
  END IF;
  IF to_regclass('content.responses') IS NOT NULL THEN
    PERFORM app.apply_tenant_rls('content.responses'::regclass, 'tenant_id');
  END IF;
END;
$$;

DROP FUNCTION app.apply_tenant_rls(regclass, name);
