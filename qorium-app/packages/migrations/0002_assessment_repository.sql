ALTER TABLE assessment
ADD COLUMN IF NOT EXISTS candidate_email text NOT NULL DEFAULT 'candidate@example.com';

CREATE TABLE IF NOT EXISTS assessment_question (
  assessment_id uuid NOT NULL REFERENCES assessment(id),
  question_id text NOT NULL REFERENCES question(id),
  position integer NOT NULL,
  PRIMARY KEY (assessment_id, question_id)
);

CREATE INDEX IF NOT EXISTS assessment_question_order_idx
ON assessment_question (assessment_id, position);
