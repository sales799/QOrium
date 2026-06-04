-- ============================================================================
-- Migration 0021: Assessment delivery loop (invite -> attempt -> grade)
-- ============================================================================
-- Per `QORIUM_ASSESSMENT_LOOP_v1.md` (PRAROOP spec, 2026-06-03).
-- DROP-IN: place at infra/B7-postgres-migrations/0021_assessment_delivery.sql
-- in the qorium-platform repo. Apply via the documented pipeline (node-pg-migrate
-- / psql per infra/B7 README): PR review by the cross-account reviewer, then
-- STAGING first, then production. Do NOT hand-apply to the live bank DB.
--
-- Adds candidate test-delivery + grading orchestration on top of the existing
-- content.questions bank and content.responses per-answer table.
-- House convention (verified against 0014): tables in `content`, tenant FK ->
-- app.tenants(id), candidate_id VARCHAR(128). Additive only.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Assessment definition (which questions/skills compose a test)
-- ---------------------------------------------------------------------------
CREATE TABLE content.assessments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  title             VARCHAR(256) NOT NULL,
  slug              VARCHAR(128) NOT NULL,
  selection_mode    VARCHAR(32) NOT NULL DEFAULT 'fixed'
    CHECK (selection_mode IN ('fixed', 'blueprint', 'adaptive')),
  /** blueprint mode: [{skill_id, count, difficulty_band}] sampled at attempt start */
  blueprint_json    JSONB,
  time_limit_sec    INT NOT NULL DEFAULT 3600,
  pass_score        NUMERIC NOT NULL DEFAULT 0.6,  -- fraction 0..1
  total_questions   INT NOT NULL,
  status            VARCHAR(32) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'archived')),
  created_by        VARCHAR(128),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, slug)
);

-- Fixed-mode ordered question set
CREATE TABLE content.assessment_questions (
  assessment_id     UUID NOT NULL REFERENCES content.assessments(id) ON DELETE CASCADE,
  question_id       UUID NOT NULL REFERENCES content.questions(id),
  position          INT NOT NULL,
  PRIMARY KEY (assessment_id, question_id)
);

-- ---------------------------------------------------------------------------
-- Invitations (one candidate, one assessment, one tokenised link)
-- ---------------------------------------------------------------------------
CREATE TABLE content.invitations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id     UUID NOT NULL REFERENCES content.assessments(id),
  tenant_id         UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  candidate_email   VARCHAR(256) NOT NULL,
  candidate_name    VARCHAR(256),
  token             VARCHAR(64) NOT NULL UNIQUE,   -- url-safe, >= 32 chars
  status            VARCHAR(32) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'opened', 'in_progress', 'submitted', 'expired')),
  expires_at        TIMESTAMPTZ NOT NULL,
  sent_at           TIMESTAMPTZ,
  created_by        VARCHAR(128),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX invitations_token_idx      ON content.invitations (token);
CREATE INDEX invitations_assessment_idx ON content.invitations (assessment_id);

-- ---------------------------------------------------------------------------
-- Attempts (a candidate's run across the question set)
-- ---------------------------------------------------------------------------
CREATE TABLE content.attempts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id     UUID NOT NULL REFERENCES content.invitations(id),
  assessment_id     UUID NOT NULL REFERENCES content.assessments(id),
  tenant_id         UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  candidate_id      VARCHAR(128) NOT NULL,         -- ties to content.responses.candidate_id
  status            VARCHAR(32) NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'submitted', 'graded', 'abandoned')),
  question_order    UUID[] NOT NULL,               -- materialised at start
  current_idx       INT NOT NULL DEFAULT 0,
  total_score       NUMERIC,
  max_score         NUMERIC,
  percentile        NUMERIC,
  integrity_flags   JSONB NOT NULL DEFAULT '{}'::jsonb,  -- {tab_switches, paste_events, focus_loss, fullscreen_exits}
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at      TIMESTAMPTZ,
  graded_at         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX attempts_invitation_idx ON content.attempts (invitation_id);
CREATE INDEX attempts_assessment_idx ON content.attempts (assessment_id);
CREATE INDEX attempts_tenant_idx     ON content.attempts (tenant_id);

-- ---------------------------------------------------------------------------
-- Link existing per-answer rows to their attempt
-- ---------------------------------------------------------------------------
ALTER TABLE content.responses
  ADD COLUMN IF NOT EXISTS attempt_id UUID REFERENCES content.attempts(id);
CREATE INDEX IF NOT EXISTS responses_attempt_idx ON content.responses (attempt_id);

COMMIT;

-- ============================================================================
-- ROLLBACK (manual — do NOT run on apply)
-- ============================================================================
-- BEGIN;
--   DROP INDEX IF EXISTS content.responses_attempt_idx;
--   ALTER TABLE content.responses DROP COLUMN IF EXISTS attempt_id;
--   DROP TABLE IF EXISTS content.attempts;
--   DROP TABLE IF EXISTS content.invitations;
--   DROP TABLE IF EXISTS content.assessment_questions;
--   DROP TABLE IF EXISTS content.assessments;
-- COMMIT;
