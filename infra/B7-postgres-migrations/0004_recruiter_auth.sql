-- QOrium Migration 0004: Recruiter Authentication (Surface 6)
-- Authored: 2026-05-06
-- Purpose: Replace browser-side API key (sessionStorage) with proper recruiter
--          login: argon2id passwords, 8h sliding JWT cookie, 5-fail lockout.
-- Endpoints served from this schema:
--   POST /v1/auth/login     — verify password, issue HttpOnly session cookie
--   POST /v1/auth/logout    — clear session cookie
--   GET  /v1/auth/whoami    — return current recruiter, slide cookie expiry
--
-- Companion artefacts (not in this file):
--   services/readybank/src/routes/auth.ts        (route handlers)
--   services/readybank/src/middleware/recruiter-auth.ts (cookie-based gate)
--   services/readybank/public/login.html         (browser entry point)
--
-- Bridge Protocol: mirrors what shipped Cowork-side on Run #32 (2026-05-04).
-- Migration number 0004 is fixed by spec — 0003 is reserved for Stream B.

BEGIN;

-- ============================================================================
-- TABLE: app.recruiters
-- ============================================================================
-- One row per human recruiter user. Distinct from app.users (which today is
-- staff-only) so the recruiter surface can evolve independently of internal
-- staff auth without churning the shared users table or its CHECK constraints.

CREATE TABLE app.recruiters (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  email                 CITEXT NOT NULL UNIQUE,
  name                  VARCHAR(200) NOT NULL,
  -- Encoded argon2id hash, e.g. $argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>.
  -- Stores params + salt + digest in one column; verify() reads them back.
  password_hash         VARCHAR(255) NOT NULL,
  -- Failed-login counter. Resets to 0 on success or when locked_until expires.
  -- When it hits 5 we set locked_until = now() + RECRUITER_LOCKOUT_MINUTES
  -- (default 15) and reset the counter so the next attempt immediately 423s.
  failed_login_count    INTEGER NOT NULL DEFAULT 0
    CHECK (failed_login_count >= 0),
  -- NULL = not locked. While now() < locked_until login returns 423 Locked.
  locked_until          TIMESTAMPTZ,
  last_login_at         TIMESTAMPTZ,
  status                VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'disabled')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX recruiters_email_idx ON app.recruiters (email);
CREATE INDEX recruiters_tenant_id_idx ON app.recruiters (tenant_id);

COMMENT ON TABLE app.recruiters IS
  'Recruiter user accounts. Authenticated by argon2id password + 8h sliding JWT cookie.';
COMMENT ON COLUMN app.recruiters.password_hash IS
  'Encoded argon2id string. Includes algorithm params + salt; never expose.';
COMMENT ON COLUMN app.recruiters.failed_login_count IS
  'Consecutive failed attempts. Resets on success or when locked_until expires.';
COMMENT ON COLUMN app.recruiters.locked_until IS
  'When set and > now(), login returns 423 Locked. Cleared on successful login.';

-- updated_at trigger — matches the per-table function pattern from 0001.
CREATE OR REPLACE FUNCTION app.update_recruiter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recruiter_updated_at_trigger
  BEFORE UPDATE ON app.recruiters
  FOR EACH ROW
  EXECUTE FUNCTION app.update_recruiter_updated_at();

COMMIT;

-- ============================================================================
-- ROLLBACK (reference only; not executed)
-- ============================================================================
-- BEGIN;
--   DROP TRIGGER IF EXISTS recruiter_updated_at_trigger ON app.recruiters;
--   DROP FUNCTION IF EXISTS app.update_recruiter_updated_at CASCADE;
--   DROP TABLE IF EXISTS app.recruiters;
-- COMMIT;
