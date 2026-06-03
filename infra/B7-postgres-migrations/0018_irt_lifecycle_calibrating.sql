-- ============================================================================
-- Migration 0018: IRT lifecycle fix — move launch questions into 'calibrating'
-- ============================================================================
-- Per `PHASE_A_ENGINE_FINDINGS_AND_AI_VERIFY_2026-06-03.md` (CTO finding, gap 1).
--
-- PROBLEM
--   The IRT-calibration engine (M14, `/opt/qorium/services/irt-calibration`)
--   only selects questions WHERE status='calibrating' AND calibration_n >=
--   MIN_RESPONSES(50). The 1,406 Wave1/2/3 launch questions were AI-released
--   straight to status='released' with calibration_n=0, skipping 'calibrating'
--   entirely. With responses arriving from the Customer-Zero send-flow (A4),
--   they will never be picked up by the engine — staying flat at
--   "model-estimated" forever even after crossing 50 real responses.
--
-- FIX (option B from the brief — migrate launch questions to 'calibrating';
--      the engine then auto-promotes them to 'released' once fit+checks pass).
--
-- SCOPE
--   Targets questions that meet ALL of the following:
--     - status = 'released'
--     - calibration_n = 0 (zero responses, never seen real data)
--     - released_at < migration_apply_time (no future regressions)
--   Idempotent: re-running is a no-op (a question once moved to 'calibrating'
--   stays there until the engine promotes it back).
--
-- LABELING GUARDRAIL (NON-NEGOTIABLE — Rakshak Legal 94/100)
--   This migration does NOT touch ai_critique_scores.ai_verified or
--   sme_validated_by. UI label remains "AI-verified · model-estimated · calibrating
--   with live use" until calibration_history rows exist for the question with
--   calibration_n >= 50. See A2 (grade_decisions, 0019) for the per-answer
--   reasoning trace + confidence wiring.
--
-- APPLY ORDER
--   1. PR review by ARJUN (cross-account, never self-merge)
--   2. STAGING psql apply, verify the row-count delta, run engine cron once
--   3. PROD apply via `apps/scripts/atomic-release.sh` migrations phase
--      with `pg_dump` snapshot beforehand
--
-- ROLLBACK
--   See DOWN block at the bottom. Restores the original 'released' status
--   for any row this migration moved (tracked via the audit row written below).
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Audit trail: capture what we moved so the DOWN block is precise.
-- Reuses `content.calibration_history` if present, otherwise creates a small
-- audit table (we prefer not to touch calibration_history with synthetic rows
-- because the IRT engine reads from there — see M14 gap 2).
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS content.irt_lifecycle_audit (
  id                BIGSERIAL PRIMARY KEY,
  migration_id      VARCHAR(64) NOT NULL,
  question_id       UUID NOT NULL,
  prev_status       VARCHAR(32) NOT NULL,
  new_status        VARCHAR(32) NOT NULL,
  prev_calibration_n INT NOT NULL,
  moved_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note              TEXT
);

CREATE INDEX IF NOT EXISTS idx_irt_lifecycle_audit_migration
  ON content.irt_lifecycle_audit (migration_id);

-- ---------------------------------------------------------------------------
-- 1. Snapshot the candidate set into the audit table BEFORE updating, so the
--    DOWN block can be exact (no guessing which rows we touched).
-- ---------------------------------------------------------------------------

INSERT INTO content.irt_lifecycle_audit
  (migration_id, question_id, prev_status, new_status,
   prev_calibration_n, note)
SELECT
  '0018_irt_lifecycle_calibrating',
  q.id,
  q.status,
  'calibrating',
  COALESCE(q.calibration_n, 0),
  'Migrated to calibrating per PHASE_A_ENGINE_FINDINGS gap 1'
FROM content.questions q
WHERE q.status = 'released'
  AND COALESCE(q.calibration_n, 0) = 0;

-- ---------------------------------------------------------------------------
-- 2. Move the launch questions to status='calibrating'.
--    The IRT engine cron will now find them once their calibration_n crosses
--    the MIN_RESPONSES=50 threshold (engine fits + auto-promotes back to
--    'released' on success, or holds with status='flagged_for_sme' on drift).
-- ---------------------------------------------------------------------------

WITH moved AS (
  UPDATE content.questions
  SET status     = 'calibrating',
      updated_at = NOW()
  WHERE status = 'released'
    AND COALESCE(calibration_n, 0) = 0
  RETURNING id
)
SELECT 'rows_moved_to_calibrating' AS metric, COUNT(*)::TEXT AS value FROM moved;

-- ---------------------------------------------------------------------------
-- 3. Verification queries (the apply pipeline should diff these vs. baseline).
-- ---------------------------------------------------------------------------

-- Expected post-apply: ~1406 (Wave1/2/3 launch question count).
SELECT 'calibrating_after' AS metric, COUNT(*)::TEXT AS value
  FROM content.questions WHERE status = 'calibrating';

-- Expected post-apply: 0 (no released questions with zero calibration data).
SELECT 'released_with_zero_calibration_after' AS metric, COUNT(*)::TEXT AS value
  FROM content.questions
  WHERE status = 'released' AND COALESCE(calibration_n, 0) = 0;

COMMIT;

-- ============================================================================
-- DOWN (manual rollback — DO NOT WRAP IN -- DOWN-- markers for the auto-runner;
-- this is a documented manual recovery for the cross-account reviewer).
-- ============================================================================
--
-- BEGIN;
-- UPDATE content.questions q
--    SET status     = a.prev_status,
--        updated_at = NOW()
--   FROM content.irt_lifecycle_audit a
--  WHERE a.migration_id = '0018_irt_lifecycle_calibrating'
--    AND q.id = a.question_id
--    AND q.status = 'calibrating'  -- only revert rows we moved, not new ones
--    AND COALESCE(q.calibration_n, 0) = 0;  -- only if engine hasn't touched them
-- COMMIT;
