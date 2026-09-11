-- Read-only, single-invitation impact inventory. See candidate-data-lifecycle.md.
-- Required psql variables: tenant_id and invitation_id (UUIDs, NOT email/token).
-- No deletion policy or erasure authorization is implied by this inventory.
\set ON_ERROR_STOP on
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL statement_timeout = '5s';
SET LOCAL lock_timeout = '1s';
WITH target AS (
  SELECT id, tenant_id, expires_at FROM content.invitations
  WHERE tenant_id = :'tenant_id'::uuid AND id = :'invitation_id'::uuid
), attempts AS (
  SELECT a.id, a.candidate_id FROM content.attempts a
  JOIN target i ON i.id = a.invitation_id AND i.tenant_id = a.tenant_id
), responses AS (
  SELECT r.id, r.attempt_id FROM content.responses r
  WHERE r.tenant_id = :'tenant_id'::uuid
    AND (r.attempt_id IN (SELECT id FROM attempts)
      OR r.candidate_id IN (SELECT candidate_id FROM attempts)
      OR r.candidate_id IN (SELECT 'cand_' || id::text FROM target))
), entities AS (
  SELECT id::text AS id FROM target UNION SELECT id::text FROM attempts
  UNION SELECT id::text FROM responses
)
SELECT jsonb_build_object(
  'mode', 'read_only_impact_inventory',
  'invitation_found', EXISTS(SELECT 1 FROM target),
  'invitation_expired', (SELECT expires_at <= now() FROM target),
  'attempts', (SELECT count(*) FROM attempts),
  'responses', (SELECT count(*) FROM responses),
  'responses_without_attempt', (SELECT count(*) FROM responses WHERE attempt_id IS NULL),
  'grade_decisions', (SELECT count(*) FROM content.grade_decisions g
    WHERE g.tenant_id = :'tenant_id'::uuid AND g.response_id IN (SELECT id FROM responses)),
  'direct_entity_audit_events', (SELECT count(*) FROM audit.events e
    WHERE e.tenant_id = :'tenant_id'::uuid AND e.entity_id IN (SELECT id FROM entities)),
  'tenant_export_jobs_requiring_review', (SELECT count(*) FROM app.audit_export_jobs j
    WHERE j.tenant_id = :'tenant_id'::uuid AND EXISTS(SELECT 1 FROM target)),
  'expired_tenant_exports_with_content', (SELECT count(*) FROM app.audit_export_jobs j
    WHERE j.tenant_id = :'tenant_id'::uuid AND j.expires_at <= now() AND j.content IS NOT NULL
      AND EXISTS(SELECT 1 FROM target)),
  'scope_complete', false
) AS impact;
ROLLBACK;
