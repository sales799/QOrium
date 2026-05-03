-- ============================================================================
-- Migration 0014: Wave 3 AI pair-coding tables
-- ============================================================================
-- Per `infra/Wave-3-AI-Pair-Coding-Format-Prototype-Spec-v0.md` §3.2.
-- ============================================================================

BEGIN;

CREATE TABLE content.ai_pair_coding_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id         UUID REFERENCES content.questions(id) ON DELETE SET NULL,
  candidate_id        VARCHAR(128) NOT NULL,
  tenant_id           UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at        TIMESTAMPTZ,
  status              VARCHAR(32) NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'submitted', 'timeout', 'abandoned')),
  final_code_text     TEXT,
  ai_messages_count   INT NOT NULL DEFAULT 0,
  candidate_typed_chars INT NOT NULL DEFAULT 0,
  candidate_pasted_chars INT NOT NULL DEFAULT 0,
  edit_test_cycles    INT NOT NULL DEFAULT 0,
  signals             JSONB NOT NULL DEFAULT '{}'::jsonb,
  /** Six-dimension grade per spec §2.4 (set after submission). */
  grades              JSONB,
  ai_provider         VARCHAR(32) NOT NULL DEFAULT 'anthropic'
    CHECK (ai_provider IN ('anthropic', 'openai', 'gemini')),
  ai_model            VARCHAR(64) NOT NULL DEFAULT 'claude-sonnet-4-6',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ai_pair_coding_sessions_question_idx
  ON content.ai_pair_coding_sessions (question_id, started_at DESC);
CREATE INDEX ai_pair_coding_sessions_tenant_idx
  ON content.ai_pair_coding_sessions (tenant_id, started_at DESC);
CREATE INDEX ai_pair_coding_sessions_status_idx
  ON content.ai_pair_coding_sessions (status);

CREATE TABLE content.ai_pair_coding_messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          UUID NOT NULL REFERENCES content.ai_pair_coding_sessions(id) ON DELETE CASCADE,
  occurred_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role                VARCHAR(20) NOT NULL CHECK (role IN ('candidate', 'ai_assistant', 'system')),
  message_text        TEXT NOT NULL,
  contained_code      BOOLEAN NOT NULL DEFAULT false,
  candidate_action    VARCHAR(20) CHECK (candidate_action IN ('accepted', 'modified', 'rejected', 'ignored', NULL)),
  metadata            JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX ai_pair_coding_messages_session_idx
  ON content.ai_pair_coding_messages (session_id, occurred_at);

COMMENT ON TABLE content.ai_pair_coding_sessions IS
  'Wave 3 AI pair-coding session state. Per Wave-3-AI-Pair-Coding-Format-Prototype-Spec-v0.md §3.2.';
COMMENT ON TABLE content.ai_pair_coding_messages IS
  'Turn-by-turn message log for the AI pair-coding session. Used by §3.3 signal capture + §2.4 grading.';

COMMIT;

-- Rollback ------------------------------------------------------------------
-- DROP TABLE content.ai_pair_coding_messages;
-- DROP TABLE content.ai_pair_coding_sessions;
