-- ============================================================================
-- Migration 0005: Judge0 sandbox integration columns
-- ============================================================================
-- Adds the storage shape required by the qorium-judge0-orchestrator service:
--
--   content.questions.sandbox_config (JSONB) — per-question test cases,
--     language, memory/time limits, expected_output_pattern, weights, rubric.
--     Schema documented in infra/Judge0-Sandbox-Integration-Spec-v0.md §4.
--
--   content.responses.execution_metadata (JSONB) — per-submission execution
--     report: stdout/stderr per test case, exit codes, timing, memory usage,
--     compilation/runtime errors, language. Schema documented in §3.2.
--
-- Both columns are nullable so non-coding questions and pre-existing rows
-- remain valid.
-- ============================================================================

BEGIN;

ALTER TABLE content.questions
  ADD COLUMN sandbox_config JSONB;

ALTER TABLE content.responses
  ADD COLUMN execution_metadata JSONB;

COMMENT ON COLUMN content.questions.sandbox_config IS
  'Judge0/Apex execution config: language, memory_mb, time_ms, test_cases[], starter_code, reference_solution, rubric. NULL for non-coding questions.';
COMMENT ON COLUMN content.responses.execution_metadata IS
  'Per-submission execution report: test_results[], compilation_error, runtime_error, exit_code, timeout, memory_kb, language. NULL until orchestrator processes the submission.';

-- A partial index helps the orchestrator + admin queries find pending coding
-- responses quickly (responses where execution hasn't completed yet).
CREATE INDEX responses_pending_execution_idx
  ON content.responses (submitted_at)
  WHERE execution_metadata IS NULL AND score IS NULL;

COMMIT;

-- Rollback ------------------------------------------------------------------
-- DROP INDEX content.responses_pending_execution_idx;
-- ALTER TABLE content.responses DROP COLUMN execution_metadata;
-- ALTER TABLE content.questions DROP COLUMN sandbox_config;
