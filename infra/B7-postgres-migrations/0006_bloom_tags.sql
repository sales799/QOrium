-- 0006_bloom_tags.sql
-- Sprint 1.7c — Bloom's taxonomy tagging on content.questions.
--
-- Adds two columns to support competitive defense vs Artifactum and any
-- future psychometric reporting:
--   bloom_level     — Bloom's Revised Taxonomy cognitive process dimension
--   bloom_dimension — Bloom's Revised Taxonomy knowledge dimension
--
-- Both columns are nullable on insert; backfill happens via heuristic in a
-- follow-up PR (1.7c.2) and SME review queue in the admin app (1.8d). New
-- AI-authored questions should set these explicitly via the Content Engine
-- self-critique step (Sprint 3).
--
-- References:
--   Anderson, L.W. & Krathwohl, D.R. (2001). A Taxonomy for Learning,
--   Teaching, and Assessing: A Revision of Bloom's Taxonomy of Educational
--   Objectives.
--
-- Migration is idempotent: every ALTER and CREATE INDEX uses IF NOT EXISTS.

BEGIN;

-- Cognitive Process Dimension: 6 levels, lowest → highest order thinking.
ALTER TABLE content.questions
  ADD COLUMN IF NOT EXISTS bloom_level VARCHAR(16);

-- Knowledge Dimension: 4 categories, what kind of knowledge is being assessed.
ALTER TABLE content.questions
  ADD COLUMN IF NOT EXISTS bloom_dimension VARCHAR(16);

-- CHECK constraints (DROP-then-ADD pattern so the migration is re-runnable).
ALTER TABLE content.questions
  DROP CONSTRAINT IF EXISTS questions_bloom_level_check;
ALTER TABLE content.questions
  ADD CONSTRAINT questions_bloom_level_check
  CHECK (
    bloom_level IS NULL
    OR bloom_level IN (
      'remember',
      'understand',
      'apply',
      'analyze',
      'evaluate',
      'create'
    )
  );

ALTER TABLE content.questions
  DROP CONSTRAINT IF EXISTS questions_bloom_dimension_check;
ALTER TABLE content.questions
  ADD CONSTRAINT questions_bloom_dimension_check
  CHECK (
    bloom_dimension IS NULL
    OR bloom_dimension IN (
      'factual',
      'conceptual',
      'procedural',
      'metacognitive'
    )
  );

-- Indexes — partial, to keep them tight while backfill is in flight.
CREATE INDEX IF NOT EXISTS questions_bloom_level_idx
  ON content.questions (bloom_level)
  WHERE bloom_level IS NOT NULL;

CREATE INDEX IF NOT EXISTS questions_bloom_dimension_idx
  ON content.questions (bloom_dimension)
  WHERE bloom_dimension IS NOT NULL;

COMMENT ON COLUMN content.questions.bloom_level IS
  'Bloom''s Revised Taxonomy cognitive process dimension: remember | understand | apply | analyze | evaluate | create. NULL until SME-tagged or heuristic-backfilled.';

COMMENT ON COLUMN content.questions.bloom_dimension IS
  'Bloom''s Revised Taxonomy knowledge dimension: factual | conceptual | procedural | metacognitive. NULL until SME-tagged or heuristic-backfilled.';

COMMIT;
