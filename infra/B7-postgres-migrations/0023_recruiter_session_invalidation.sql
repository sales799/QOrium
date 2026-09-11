-- Revoke existing sessions atomically when recruiter authentication identity changes.
-- Requires 0004, 0008 and 0017. Source migration only; stage/grant review before deployment.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

CREATE FUNCTION app.invalidate_recruiter_sessions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, app
AS $$
BEGIN
  -- An invoker subject to RLS could silently miss sessions. Reject the account
  -- change until deployment supplies a role with full revocation visibility.
  IF pg_catalog.row_security_active('app.recruiter_sessions'::regclass) THEN
    RAISE EXCEPTION 'Session revocation requires unrestricted session visibility'
      USING ERRCODE = '42501';
  END IF;
  UPDATE app.recruiter_sessions
     SET revoked_at = clock_timestamp()
   WHERE recruiter_id = OLD.id
     AND tenant_id = OLD.tenant_id
     AND revoked_at IS NULL;
  RETURN NEW;
END;
$$;

CREATE TRIGGER recruiter_sessions_invalidate_on_change
AFTER UPDATE OF password_hash, status, external_sso_id, email, tenant_id, auth_source
ON app.recruiters
FOR EACH ROW
WHEN (
  OLD.password_hash IS DISTINCT FROM NEW.password_hash OR
  OLD.status IS DISTINCT FROM NEW.status OR
  OLD.external_sso_id IS DISTINCT FROM NEW.external_sso_id OR
  OLD.email IS DISTINCT FROM NEW.email OR
  OLD.tenant_id IS DISTINCT FROM NEW.tenant_id OR
  OLD.auth_source IS DISTINCT FROM NEW.auth_source
)
EXECUTE FUNCTION app.invalidate_recruiter_sessions();

COMMIT;

-- Reviewed rollback (does not restore invalidated sessions):
-- BEGIN;
-- DROP TRIGGER recruiter_sessions_invalidate_on_change ON app.recruiters;
-- DROP FUNCTION app.invalidate_recruiter_sessions();
-- COMMIT;
