ALTER TABLE question
ADD COLUMN IF NOT EXISTS difficulty integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS tags jsonb NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS rubric jsonb,
ADD COLUMN IF NOT EXISTS language_hints jsonb,
ADD COLUMN IF NOT EXISTS starter_code jsonb,
ADD COLUMN IF NOT EXISTS test_expectation text;

ALTER TABLE answer
ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS answer_attempt_position_idx
ON answer (attempt_id, position);
