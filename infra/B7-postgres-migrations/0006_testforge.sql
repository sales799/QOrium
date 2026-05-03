-- ============================================================================
-- Migration 0006: TestForge QA Pipeline state + audit
-- ============================================================================
-- Per governance/TestForge-QA-Pipeline-v1.md §2.3, adds:
--
--   content.questions.testforge_status — pipeline state distinct from the
--     existing `status` column (which captures the customer-facing release
--     state: draft / sme_review / calibrating / released / deprecated / leaked).
--     `testforge_status` adds 'accepted', 'bias_review', 'rejected' that the
--     pipeline owns end-to-end. Logged as CTO-DELTA-testforge-status-column.
--
--   content.questions.testforge_last_check — timestamp of the most recent
--     pipeline pass against the question (drives "is this question stale?"
--     queries in the J6 Friday Eng review).
--
--   content.questions.testforge_audit — JSONB rolling audit of the gates
--     this question has passed / failed (e.g. { sme: 'accepted',
--     irt: { converged: true, run_id: '...' }, leak: 'clean', ... }).
--
--   content.testforge_runs — append-only record of every coordinator pass
--     across the 6 gates. Drives the J5 monthly dashboard (§7 KPIs).
-- ============================================================================

BEGIN;

-- The existing `status` column is the canonical customer-facing state. We
-- mirror the pipeline state on a sibling column so existing API code
-- (ReadyBank /v1/questions, packs, etc.) keeps working unchanged. The
-- coordinator is responsible for keeping the two columns consistent.
ALTER TABLE content.questions
  ADD COLUMN testforge_status VARCHAR(40) DEFAULT 'draft'
    CHECK (testforge_status IN (
      'draft',
      'sme_review',
      'accepted',
      'calibrating',
      'bias_review',
      'released',
      'leaked',
      'rejected'
    ));

ALTER TABLE content.questions
  ADD COLUMN testforge_last_check TIMESTAMPTZ;

ALTER TABLE content.questions
  ADD COLUMN testforge_audit JSONB DEFAULT '{}'::jsonb;

CREATE INDEX questions_testforge_status_idx ON content.questions (testforge_status);

CREATE TABLE content.testforge_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type        VARCHAR(40) NOT NULL CHECK (run_type IN (
    'sme_validation',
    'irt_calibration',
    'bias_dif',
    'leak_crawl',
    'plagiarism_benchmark',
    'gate_scorecard',
    'pre_calibration_prior',
    'orchestrator_pass'
  )),
  triggered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  status          VARCHAR(20) NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'completed', 'failed')),
  items_processed INT NOT NULL DEFAULT 0,
  items_passed    INT NOT NULL DEFAULT 0,
  items_flagged   INT NOT NULL DEFAULT 0,
  output          JSONB,
  error_message   TEXT
);

CREATE INDEX testforge_runs_type_status_idx
  ON content.testforge_runs (run_type, status, triggered_at DESC);
CREATE INDEX testforge_runs_triggered_at_idx
  ON content.testforge_runs (triggered_at DESC);

COMMENT ON COLUMN content.questions.testforge_status IS
  'TestForge pipeline state. Sibling to `status`; the coordinator keeps both consistent. Per TestForge-QA-Pipeline-v1 §2.3.';
COMMENT ON TABLE content.testforge_runs IS
  'Append-only record of every TestForge coordinator pass. Drives the J5 monthly dashboard. Per TestForge-QA-Pipeline-v1 §2.3.';

COMMIT;

-- Rollback ------------------------------------------------------------------
-- DROP TABLE content.testforge_runs;
-- ALTER TABLE content.questions DROP COLUMN testforge_audit;
-- ALTER TABLE content.questions DROP COLUMN testforge_last_check;
-- ALTER TABLE content.questions DROP COLUMN testforge_status;
