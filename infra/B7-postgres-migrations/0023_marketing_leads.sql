-- ============================================================================
-- Migration 0023: marketing_leads - durable demo/contact lead capture
-- ============================================================================
-- Purpose: Persist public marketing form submissions before any outbound email
-- provider is attempted. This removes the prior "console fallback = success"
-- risk for demo/contact requests and gives operators a durable lead ledger.
--
-- ADDITIVE + REVERSIBLE. Creates one new table under app.*; no existing data is
-- modified. Down-migration: DROP TABLE app.marketing_leads.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS app.marketing_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(32) NOT NULL
    CHECK (source IN ('demo', 'contact')),
  status VARCHAR(32) NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'triaged', 'qualified', 'disqualified', 'closed')),
  name VARCHAR(160) NOT NULL,
  email CITEXT NOT NULL,
  company VARCHAR(160),
  role VARCHAR(120),
  phone VARCHAR(80),
  message TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  mail_status VARCHAR(32) NOT NULL DEFAULT 'pending'
    CHECK (mail_status IN ('pending', 'sent', 'console', 'failed')),
  mail_via VARCHAR(32),
  mail_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE app.marketing_leads IS
  'Durable ledger for public QOrium marketing form submissions. Inserted before mail delivery.';
COMMENT ON COLUMN app.marketing_leads.source IS
  'Public form source: demo or contact.';
COMMENT ON COLUMN app.marketing_leads.mail_status IS
  'Notification status after the durable lead row exists: pending, sent, console, or failed.';
COMMENT ON COLUMN app.marketing_leads.metadata IS
  'Non-sensitive form context such as hiring volume and selected SKU.';

CREATE INDEX IF NOT EXISTS marketing_leads_created_at_idx
  ON app.marketing_leads (created_at DESC);

CREATE INDEX IF NOT EXISTS marketing_leads_email_idx
  ON app.marketing_leads (email);

CREATE INDEX IF NOT EXISTS marketing_leads_source_status_created_idx
  ON app.marketing_leads (source, status, created_at DESC);

CREATE INDEX IF NOT EXISTS marketing_leads_open_idx
  ON app.marketing_leads (created_at DESC)
  WHERE status IN ('new', 'qualified') OR mail_status IN ('pending', 'failed', 'console');

COMMIT;
