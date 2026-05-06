-- QOrium Migration 0005: Recruiter Invitations (Sprint 1.6)
-- Authored: 2026-05-06
-- Purpose: Track recruiter invitation emails sent via the driver-agnostic
--          mailer (SES / SendGrid / mock). An invitation is a single-use
--          token mailed to a prospective recruiter; redeeming it sets the
--          recruiter's password and activates the account.
--
-- Companion artefacts:
--   services/readybank/src/mailer/                  (driver abstraction)
--   services/readybank/src/routes/auth.ts           (POST /v1/auth/invite,
--                                                    POST /v1/auth/accept)
--
-- Bridge Protocol: mirrors the shape Cowork-side shipped Run #32
-- (2026-05-04). Migration number 0005 is fixed by spec.

BEGIN;

-- ============================================================================
-- TABLE: app.recruiter_invitations
-- ============================================================================
-- One row per invitation. The invitation row is created at /v1/auth/invite
-- time, the email is dispatched via the mailer, and on success the
-- corresponding app.recruiters row is created in 'pending' state with a NULL
-- password_hash. Redeeming the token at /v1/auth/accept sets password_hash,
-- flips status to 'active', and stamps accepted_at on this row.

CREATE TABLE app.recruiter_invitations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id          UUID NOT NULL REFERENCES app.recruiters(id) ON DELETE CASCADE,
  -- SHA-256 of the invitation token. The plaintext token is mailed exactly
  -- once and never persisted, matching the API-key hashing pattern from 0001.
  token_hash            VARCHAR(64) NOT NULL UNIQUE,
  email                 CITEXT NOT NULL,
  -- Driver actually used (audit trail). One of 'ses' | 'sendgrid' | 'mock'.
  mailer_driver         VARCHAR(20) NOT NULL
    CHECK (mailer_driver IN ('ses', 'sendgrid', 'mock')),
  -- Provider-side message id when available (SES MessageId, SendGrid x-message-id).
  mailer_message_id     VARCHAR(255),
  sent_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at            TIMESTAMPTZ NOT NULL,
  accepted_at           TIMESTAMPTZ,
  revoked_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX recruiter_invitations_recruiter_id_idx
  ON app.recruiter_invitations (recruiter_id);
CREATE INDEX recruiter_invitations_email_idx
  ON app.recruiter_invitations (email);
-- Partial index: outstanding (un-accepted, un-revoked, un-expired) invitations
-- only. Used by /v1/auth/accept lookup.
CREATE INDEX recruiter_invitations_outstanding_idx
  ON app.recruiter_invitations (token_hash)
  WHERE accepted_at IS NULL AND revoked_at IS NULL;

COMMENT ON TABLE app.recruiter_invitations IS
  'Single-use invitation tokens mailed to prospective recruiters. Redeemed at /v1/auth/accept.';
COMMENT ON COLUMN app.recruiter_invitations.token_hash IS
  'SHA-256 of the plaintext invitation token. Plaintext is mailed exactly once and never stored.';
COMMENT ON COLUMN app.recruiter_invitations.mailer_driver IS
  'Audit trail: which driver dispatched this email (ses | sendgrid | mock).';

-- ============================================================================
-- app.recruiters: relax password_hash for pending invitations
-- ============================================================================
-- Migration 0004 declared password_hash NOT NULL. With invitations, the
-- recruiter row exists *before* the invitee picks a password — we relax the
-- constraint and add a CHECK that ties NULL password_hash to status='pending'.

ALTER TABLE app.recruiters ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE app.recruiters DROP CONSTRAINT IF EXISTS recruiters_status_check;
ALTER TABLE app.recruiters ADD CONSTRAINT recruiters_status_check
  CHECK (status IN ('active', 'disabled', 'pending'));

ALTER TABLE app.recruiters ADD CONSTRAINT recruiters_password_required_when_active
  CHECK (
    (status = 'pending' AND password_hash IS NULL)
    OR (status IN ('active', 'disabled') AND password_hash IS NOT NULL)
  );

COMMIT;

-- ============================================================================
-- ROLLBACK (reference only; not executed)
-- ============================================================================
-- BEGIN;
--   ALTER TABLE app.recruiters DROP CONSTRAINT IF EXISTS recruiters_password_required_when_active;
--   ALTER TABLE app.recruiters DROP CONSTRAINT IF EXISTS recruiters_status_check;
--   ALTER TABLE app.recruiters ADD CONSTRAINT recruiters_status_check
--     CHECK (status IN ('active', 'disabled'));
--   ALTER TABLE app.recruiters ALTER COLUMN password_hash SET NOT NULL;
--   DROP TABLE IF EXISTS app.recruiter_invitations;
-- COMMIT;
