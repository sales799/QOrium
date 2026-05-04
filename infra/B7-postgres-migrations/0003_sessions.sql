-- QOrium Migration 0003 — app.sessions (Sprint 1.3, Run #29)
-- Take-assessment sessions: a recruiter-issued single-use URL token that lets
-- a named candidate take a specified pack without seeing the API key.
--
-- Lifecycle:
--   1. POST /v1/sessions  -> recruiter (auth'd) creates row with token + question_ids[] + expires_at
--   2. GET /take/<token>  -> public HTML page; renders one question at a time
--   3. POST /take/<token>/answer -> public; grades + persists to content.responses; advances pointer
--   4. expires_at OR all answered -> session.status = 'completed'; further attempts 410 Gone
-- Auth-via-token: long random string in URL is the bearer; revocable on demand.

BEGIN;

CREATE TABLE app.sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  api_key_id      UUID REFERENCES app.api_keys(id) ON DELETE SET NULL,
  candidate_id    VARCHAR(100) NOT NULL,
  -- 32-byte secret, stored as 64-hex; long enough that brute force is not feasible.
  session_token   VARCHAR(80)  NOT NULL UNIQUE,
  question_ids    UUID[] NOT NULL,
  current_index   INTEGER NOT NULL DEFAULT 0,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'expired', 'revoked')),
  pack_name       VARCHAR(200),
  recruiter_email VARCHAR(200),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours')
);

CREATE INDEX sessions_tenant_id_idx ON app.sessions (tenant_id);
CREATE INDEX sessions_candidate_id_idx ON app.sessions (tenant_id, candidate_id);
CREATE INDEX sessions_status_expires_idx ON app.sessions (status, expires_at)
  WHERE status IN ('pending', 'in_progress');
CREATE INDEX sessions_token_lookup_idx ON app.sessions (session_token)
  WHERE status IN ('pending', 'in_progress');

COMMENT ON TABLE  app.sessions                IS 'Take-assessment session: one row per recruiter-issued candidate URL. session_token is the bearer secret in the public /take/ URL.';
COMMENT ON COLUMN app.sessions.session_token  IS '32-byte random hex (64 chars). Treat as a bearer token; never logged in plaintext beyond first 12 chars.';
COMMENT ON COLUMN app.sessions.question_ids   IS 'Ordered list of content.questions UUIDs. Candidate sees these in order; current_index points to the next unanswered.';
COMMENT ON COLUMN app.sessions.current_index  IS 'Number of questions already answered. When current_index == array_length(question_ids), session auto-completes.';
COMMENT ON COLUMN app.sessions.expires_at     IS 'Default 48h after creation. After expiry, /take/ returns 410 Gone.';

COMMIT;

-- ============================================================================
-- ROLLBACK STATEMENTS (reference; not executed)
-- ============================================================================
-- BEGIN;
-- DROP TABLE IF EXISTS app.sessions CASCADE;
-- COMMIT;
