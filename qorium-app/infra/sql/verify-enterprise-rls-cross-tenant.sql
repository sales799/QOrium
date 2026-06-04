-- Phase G staging verification for enterprise tenant RLS.
--
-- Usage:
--   psql "$DATABASE_URL_STAGING_RUNTIME" \
--     -v ON_ERROR_STOP=1 \
--     -v tenant_a='00000000-0000-0000-0000-000000000001' \
--     -v tenant_b='00000000-0000-0000-0000-000000000002' \
--     -f qorium-app/infra/sql/verify-enterprise-rls-cross-tenant.sql
--
-- The connection must use the normal app runtime role, not owner/superuser.

\if :{?tenant_a}
\else
  \echo 'tenant_a psql variable is required'
  \quit 2
\endif

\if :{?tenant_b}
\else
  \echo 'tenant_b psql variable is required'
  \quit 2
\endif

BEGIN;

SELECT set_config('app.verify_tenant_a', :'tenant_a', true);
SELECT set_config('app.verify_tenant_b', :'tenant_b', true);
SELECT set_config('app.current_tenant_id', :'tenant_a', true);

DO $$
DECLARE
  leaked_count bigint;
  tenant_b uuid := current_setting('app.verify_tenant_b')::uuid;
BEGIN
  IF to_regclass('app.packs') IS NOT NULL THEN
    SELECT count(*) INTO leaked_count
    FROM app.packs
    WHERE tenant_id = tenant_b;
    IF leaked_count <> 0 THEN
      RAISE EXCEPTION 'RLS leak: tenant A saw % app.packs rows from tenant B', leaked_count;
    END IF;
  END IF;

  IF to_regclass('content.responses') IS NOT NULL THEN
    SELECT count(*) INTO leaked_count
    FROM content.responses
    WHERE tenant_id = tenant_b;
    IF leaked_count <> 0 THEN
      RAISE EXCEPTION 'RLS leak: tenant A saw % content.responses rows from tenant B', leaked_count;
    END IF;
  END IF;
END;
$$;

SELECT set_config('app.current_tenant_id', :'tenant_b', true);

DO $$
DECLARE
  leaked_count bigint;
  tenant_a uuid := current_setting('app.verify_tenant_a')::uuid;
BEGIN
  IF to_regclass('app.packs') IS NOT NULL THEN
    SELECT count(*) INTO leaked_count
    FROM app.packs
    WHERE tenant_id = tenant_a;
    IF leaked_count <> 0 THEN
      RAISE EXCEPTION 'RLS leak: tenant B saw % app.packs rows from tenant A', leaked_count;
    END IF;
  END IF;

  IF to_regclass('content.responses') IS NOT NULL THEN
    SELECT count(*) INTO leaked_count
    FROM content.responses
    WHERE tenant_id = tenant_a;
    IF leaked_count <> 0 THEN
      RAISE EXCEPTION 'RLS leak: tenant B saw % content.responses rows from tenant A', leaked_count;
    END IF;
  END IF;
END;
$$;

ROLLBACK;

\echo 'Phase G RLS cross-tenant verification passed'
