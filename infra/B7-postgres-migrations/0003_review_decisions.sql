-- ============================================================================
-- Migration 0003: SME review decisions audit log
-- ============================================================================
-- Records every accept / edit / reject decision an SME makes against a
-- question in `sme_review` status. Drives the admin queue (Sprint 1.3) and
-- the calibration pipeline (Sprint 1.5 — accepted items move to `calibrating`).
--
-- Workflow status transitions executed by `apps/admin`:
--   sme_review + accept → calibrating
--   sme_review + edit   → draft         (author re-works body; question re-enters queue when re-submitted)
--   sme_review + reject → deprecated
--
-- Both prior_status and next_status are persisted on every row so the audit
-- trail is self-describing even if workflow rules change in future.
-- ============================================================================

BEGIN;

CREATE TABLE content.review_decisions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id     UUID NOT NULL REFERENCES content.questions(id) ON DELETE CASCADE,
  reviewer_email  VARCHAR(255) NOT NULL,
  decision        VARCHAR(20) NOT NULL CHECK (decision IN ('accept', 'edit', 'reject')),
  notes           TEXT,
  prior_status    VARCHAR(50) NOT NULL,
  next_status     VARCHAR(50) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX review_decisions_question_id_idx ON content.review_decisions (question_id);
CREATE INDEX review_decisions_reviewer_idx ON content.review_decisions (reviewer_email);
CREATE INDEX review_decisions_created_at_idx ON content.review_decisions (created_at DESC);

COMMENT ON TABLE content.review_decisions IS
  'Append-only SME review decisions. Each row records a decision + the status transition it caused. Drives admin queue and calibration pipeline.';
COMMENT ON COLUMN content.review_decisions.decision IS
  'accept → moves question to calibrating; edit → moves to draft for author rework; reject → moves to deprecated.';
COMMENT ON COLUMN content.review_decisions.prior_status IS
  'questions.status at the moment the decision was recorded; preserves audit even if workflow rules change later.';

COMMIT;

-- Rollback ------------------------------------------------------------------
-- DROP TABLE content.review_decisions;
