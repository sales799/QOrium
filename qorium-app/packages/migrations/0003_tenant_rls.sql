-- Phase G: tenant RLS for the local QOrium app schema.
--
-- Apply only after the API deployment that sets app.current_tenant_id on
-- tenant-scoped database transactions. Without that app wiring, FORCE RLS will
-- correctly hide tenant rows from the runtime role.

CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE FUNCTION app.current_tenant_id_text()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(current_setting('app.current_tenant_id', true), '')
$$;

ALTER TABLE assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON assessment;
CREATE POLICY tenant_isolation ON assessment
  USING (org_id = app.current_tenant_id_text())
  WITH CHECK (org_id = app.current_tenant_id_text());

ALTER TABLE assessment_question ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_question FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON assessment_question;
CREATE POLICY tenant_isolation ON assessment_question
  USING (
    EXISTS (
      SELECT 1
      FROM assessment
      WHERE assessment.id = assessment_question.assessment_id
        AND assessment.org_id = app.current_tenant_id_text()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM assessment
      WHERE assessment.id = assessment_question.assessment_id
        AND assessment.org_id = app.current_tenant_id_text()
    )
  );

ALTER TABLE attempt ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON attempt;
CREATE POLICY tenant_isolation ON attempt
  USING (
    EXISTS (
      SELECT 1
      FROM assessment
      WHERE assessment.id = attempt.assessment_id
        AND assessment.org_id = app.current_tenant_id_text()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM assessment
      WHERE assessment.id = attempt.assessment_id
        AND assessment.org_id = app.current_tenant_id_text()
    )
  );

ALTER TABLE answer ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON answer;
CREATE POLICY tenant_isolation ON answer
  USING (
    EXISTS (
      SELECT 1
      FROM attempt
      JOIN assessment ON assessment.id = attempt.assessment_id
      WHERE attempt.id = answer.attempt_id
        AND assessment.org_id = app.current_tenant_id_text()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM attempt
      JOIN assessment ON assessment.id = attempt.assessment_id
      WHERE attempt.id = answer.attempt_id
        AND assessment.org_id = app.current_tenant_id_text()
    )
  );

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON audit_log;
CREATE POLICY tenant_isolation ON audit_log
  USING (org_id = app.current_tenant_id_text())
  WITH CHECK (org_id = app.current_tenant_id_text());
