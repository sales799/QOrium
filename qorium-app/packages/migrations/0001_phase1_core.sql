CREATE TYPE question_type AS ENUM ('mcq', 'multi_select', 'short_answer', 'code_question');
CREATE TYPE audit_actor_type AS ENUM ('system', 'recruiter', 'candidate', 'worker');

CREATE TABLE skill (
  id text PRIMARY KEY,
  parent_id text REFERENCES skill(id),
  kind text NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE skill_alias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id text NOT NULL REFERENCES skill(id),
  alias text NOT NULL
);

CREATE TABLE assessment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL DEFAULT 'demo-org',
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE section (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessment(id),
  title text NOT NULL,
  position integer NOT NULL
);

CREATE TABLE question (
  id text PRIMARY KEY,
  section_id uuid REFERENCES section(id),
  skill_id text NOT NULL REFERENCES skill(id),
  type question_type NOT NULL,
  stem text NOT NULL,
  options jsonb,
  correct_answer jsonb,
  explanation text NOT NULL,
  irt_a real NOT NULL DEFAULT 1.0,
  irt_b real NOT NULL DEFAULT 0.0,
  irt_c real NOT NULL DEFAULT 0.25
);

CREATE TABLE attempt (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessment(id),
  candidate_email text NOT NULL,
  submitted_at timestamptz
);

CREATE TABLE answer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES attempt(id),
  question_id text NOT NULL REFERENCES question(id),
  response jsonb NOT NULL,
  grade real,
  confidence real,
  reasoning_trace_ref text
);

CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  event text NOT NULL,
  actor_type audit_actor_type NOT NULL,
  actor_id text NOT NULL,
  payload_hash text NOT NULL,
  refs jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION audit_log_prevent_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_no_update
BEFORE UPDATE ON audit_log
FOR EACH ROW EXECUTE FUNCTION audit_log_prevent_mutation();

CREATE TRIGGER audit_log_no_delete
BEFORE DELETE ON audit_log
FOR EACH ROW EXECUTE FUNCTION audit_log_prevent_mutation();
