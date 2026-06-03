-- ============================================================================
-- Migration 0019: grade_decisions — A2 reasoning-trace + confidence storage
-- ============================================================================
-- Per `CODEX_PENDING_PHASE_A_PROOF_LOOP_2026-06-03.md` Branch A2 + BACKEND_
-- MODULES_360_v1.md M21 (Reasoning trace & confidence).
--
-- PROBLEM
--   `content.responses` carries `score` but no stored grade reasoning. The
--   wedge claim ("AI-graded WITH reasoning trace") requires the model's chain
--   of grading + a confidence band, persisted and surfaced per answer.
--
-- DESIGN CHOICE
--   Separate table (NOT a jsonb blob on responses) because:
--     - Multiple graders may score the same response (ensemble / re-grade).
--     - Reasoning text is large and hot-path queries on responses shouldn't
--       drag it in via SELECT *.
--     - Per-grader audit trail for Rakshak Legal disclosure.
--
-- LABELING GUARDRAIL
--   This table holds *AI-grader* output. The UI must surface it as
--   "AI-verified" (per `PHASE_A_ENGINE_FINDINGS_AND_AI_VERIFY` non-negotiable);
--   it MUST NOT be relabeled as "SME-validated" or "human-expert-reviewed".
--   `content.questions.sme_validated_by` remains the only human-SME marker.
--
-- APPLY ORDER
--   1. PR review by ARJUN (cross-account, never self-merge)
--   2. STAGING psql apply
--   3. PROD apply via atomic-release.sh + pg_dump
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. content.grade_decisions
-- ---------------------------------------------------------------------------

CREATE TABLE content.grade_decisions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,

  -- The per-answer response this decision graded. content.responses is the
  -- per-answer table (see 0015_assessment_delivery convention).
  response_id         UUID NOT NULL REFERENCES content.responses(id) ON DELETE CASCADE,

  -- The question this decision is for (denormalised for fast UI queries:
  -- "show me reasoning across attempts for question X").
  question_id         UUID NOT NULL REFERENCES content.questions(id),

  -- Grader identity + version. Multiple graders may score the same response
  -- (ensemble / re-grade); the (response_id, model, prompt_version) tuple is
  -- the natural unique key.
  model               VARCHAR(64)  NOT NULL,
  prompt_version      VARCHAR(64)  NOT NULL DEFAULT 'v1',
  grader_source       VARCHAR(32)  NOT NULL DEFAULT 'm4_grader'
    CHECK (grader_source IN ('m4_grader','ai_verify','ensemble','ats_rescore')),

  -- The decision itself.
  score               NUMERIC(5,4) NOT NULL CHECK (score >= 0 AND score <= 1),
  confidence          NUMERIC(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  reasoning_text      TEXT         NOT NULL,
  reasoning_hash      CHAR(64)     NOT NULL,  -- sha256 hex of reasoning_text (immutability proof)

  -- Optional structured rubric breakdown for M6 video / M5 aptitude per-criterion scoring.
  rubric_breakdown    JSONB,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Each (response, model, prompt_version) grades only once.
  UNIQUE (response_id, model, prompt_version)
);

-- ---------------------------------------------------------------------------
-- 2. Indexes
-- ---------------------------------------------------------------------------

-- Hot path: surfacing reasoning in candidate/recruiter result UI.
CREATE INDEX idx_grade_decisions_response_id
  ON content.grade_decisions (response_id);

-- Tenant scoping (RLS-ready, see migration 0020 draft).
CREATE INDEX idx_grade_decisions_tenant_id
  ON content.grade_decisions (tenant_id);

-- Cross-attempt analysis: "which graders score question X high-confidence?"
CREATE INDEX idx_grade_decisions_question_model
  ON content.grade_decisions (question_id, model);

-- Time-window queries for drift / regression detection.
CREATE INDEX idx_grade_decisions_created_at
  ON content.grade_decisions (created_at DESC);

-- ---------------------------------------------------------------------------
-- 3. Column comments (so a fresh reviewer understands the contract).
-- ---------------------------------------------------------------------------

COMMENT ON TABLE content.grade_decisions IS
  'AI grader output per response: score, confidence, reasoning text + hash. '
  'A2 reasoning-trace storage (M21). NEVER relabel as SME-validated.';

COMMENT ON COLUMN content.grade_decisions.reasoning_hash IS
  'sha256(reasoning_text) — immutability proof for Rakshak Legal disclosure. '
  'Application MUST verify on write that hash matches the text it persisted.';

COMMENT ON COLUMN content.grade_decisions.confidence IS
  'Grader self-reported confidence 0..1. UI displays as a band; below the '
  'confidence floor the answer is flagged for ensemble re-grade.';

COMMENT ON COLUMN content.grade_decisions.grader_source IS
  'Provenance tag. m4_grader = real-time per-answer; ai_verify = the offline '
  'AI-verification gate; ensemble = multi-model consensus; ats_rescore = '
  'recalibration after IRT params shift.';

COMMIT;

-- ============================================================================
-- DOWN (manual rollback)
-- ============================================================================
-- BEGIN;
-- DROP TABLE IF EXISTS content.grade_decisions;
-- COMMIT;
