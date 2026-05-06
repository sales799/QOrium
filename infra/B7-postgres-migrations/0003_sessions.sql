-- QOrium Migration 0003: Candidate Sessions (Sprint 1.3)
-- Authored: 2026-05-06
-- Purpose: End-to-end candidate take flow.
--
-- A "session" is one candidate's invitation to take one pack.
--   - Recruiter calls POST /v1/sessions (recruiter-cookie gated) → row created with
--     a public token. The take URL `/take/<token>` is shareable.
--   - Candidate hits GET /take/<token> → state machine starts.
--   - Candidate's progress lives in this row: current question index, answers JSONB,
--     started_at, completed_at, score.
--   - Recruiter calls GET /v1/sessions (1.4) and /v1/results/:id (1.2) against
--     the same row.
--
-- Token discipline matches recruiter_invitations (0005): plaintext token is
-- generated server-side, returned exactly once in the create response, and
-- only the SHA-256 hash is persisted.

BEGIN;

CREATE TABLE app.sessions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id               UUID NOT NULL REFERENCES app.packs(id) ON DELETE RESTRICT,
  recruiter_id          UUID NOT NULL REFERENCES app.recruiters(id) ON DELETE RESTRICT,
  tenant_id             UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,

  -- Candidate identity. Email is mandatory (delivery channel); name optional.
  candidate_email       CITEXT NOT NULL,
  candidate_name        VARCHAR(200),

  -- SHA-256 of the public take token. Plaintext returned in the create response
  -- and never stored anywhere.
  public_token_hash     VARCHAR(64) NOT NULL UNIQUE,

  status                VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'expired', 'revoked')),

  -- Progress tracking. current_question_index is 0-based; answers is an array of
  -- { question_id, choice_or_text, answered_at, time_taken_ms }.
  current_question_index INT NOT NULL DEFAULT 0
    CHECK (current_question_index >= 0),
  answers               JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Final score, populated when status flips to 'completed'.
  score_total           NUMERIC(6, 2),
  score_max             NUMERIC(6, 2),
  result_summary        JSONB,

  -- Lifecycle timestamps.
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at            TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,
  expires_at            TIMESTAMPTZ NOT NULL,
  revoked_at            TIMESTAMPTZ,

  -- Watermarking (Sprint 1.2 will populate). Deterministic per-session salt for
  -- per-candidate content variants.
  watermark_salt        VARCHAR(64) NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex')
);

CREATE INDEX sessions_recruiter_id_idx ON app.sessions (recruiter_id);
CREATE INDEX sessions_tenant_id_idx   ON app.sessions (tenant_id);
CREATE INDEX sessions_pack_id_idx     ON app.sessions (pack_id);
CREATE INDEX sessions_status_idx      ON app.sessions (status);
CREATE INDEX sessions_candidate_email_idx ON app.sessions (candidate_email);
-- Partial index on outstanding sessions (live take URLs) for /take/:token lookup.
CREATE INDEX sessions_outstanding_idx ON app.sessions (public_token_hash)
  WHERE status IN ('pending', 'in_progress');

COMMENT ON TABLE app.sessions IS
  'One candidate take. Recruiter creates; candidate executes via /take/:token.';
COMMENT ON COLUMN app.sessions.public_token_hash IS
  'SHA-256 of the plaintext take token. Plaintext is returned exactly once at create-time.';
COMMENT ON COLUMN app.sessions.answers IS
  'Array of answer records: { question_id, value, answered_at, time_taken_ms }.';
COMMENT ON COLUMN app.sessions.watermark_salt IS
  'Deterministic per-session salt for Watermark Engine v0 (Sprint 1.2).';

-- updated_at-like behaviour via trigger so any UPDATE bumps a logical
-- "last activity" timestamp. Not strictly needed since we have started_at /
-- completed_at, but keeps audit queries simple.
CREATE OR REPLACE FUNCTION app.set_session_started_at()
RETURNS TRIGGER AS $$
BEGIN
  -- First flip from pending → in_progress stamps started_at.
  IF NEW.status = 'in_progress' AND OLD.status = 'pending' AND NEW.started_at IS NULL THEN
    NEW.started_at = NOW();
  END IF;
  -- Status → completed stamps completed_at.
  IF NEW.status = 'completed' AND OLD.status <> 'completed' AND NEW.completed_at IS NULL THEN
    NEW.completed_at = NOW();
  END IF;
  -- Status → revoked stamps revoked_at.
  IF NEW.status = 'revoked' AND OLD.status <> 'revoked' AND NEW.revoked_at IS NULL THEN
    NEW.revoked_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER session_lifecycle_trigger
  BEFORE UPDATE ON app.sessions
  FOR EACH ROW
  EXECUTE FUNCTION app.set_session_started_at();

COMMIT;
