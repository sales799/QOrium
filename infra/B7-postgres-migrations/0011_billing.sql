-- ============================================================================
-- Migration 0011: Billing service v0 schema
-- ============================================================================
-- Per `infra/Billing-Service-v0-Spec.md` §4. Ships:
--   * billing.customers        — one row per QOrium tenant; stripe/razorpay ids
--   * billing.subscriptions    — recurring plan attached to a customer
--   * billing.invoices         — header for a billing run
--   * billing.line_items       — invoice rows (recurring, usage, overage)
--   * billing.payments         — provider attempts (razorpay/stripe)
--   * billing.usage_records    — daily usage counters (idempotent per day)
--
-- Ledger + refunds tables are deferred to a follow-up migration. The v0
-- shape supports invoice math + payment recording + Razorpay webhooks
-- without double-entry accounting; see CTO-DELTA #24 for the deferral.
-- ============================================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS billing;

CREATE TABLE billing.customers (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  display_name           VARCHAR(255) NOT NULL,
  email                  VARCHAR(255) NOT NULL,
  country                VARCHAR(2) NOT NULL DEFAULT 'IN' CHECK (country IN ('IN', 'US', 'GB', 'AE', 'SG')),
  currency               VARCHAR(3) NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR', 'USD', 'GBP', 'AED', 'SGD')),
  /** GSTIN (India) or US Tax ID. NULL = B2C consumer. */
  tax_id                 VARCHAR(64),
  billing_address        JSONB DEFAULT '{}'::jsonb,
  /** Razorpay or Stripe customer reference. NULL until first payment. */
  provider_customer_id   VARCHAR(255),
  payment_provider       VARCHAR(32) CHECK (payment_provider IN ('razorpay', 'stripe', NULL)),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id)
);

CREATE INDEX billing_customers_country_idx ON billing.customers (country);

COMMENT ON TABLE billing.customers IS
  'One row per QOrium tenant. Spec §4 customers table; ledger/refund FKs deferred per CTO-DELTA #24.';

CREATE TABLE billing.subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id            UUID NOT NULL REFERENCES billing.customers(id) ON DELETE CASCADE,
  sku                    VARCHAR(32) NOT NULL CHECK (sku IN ('readybank', 'jd_forge', 'stack_vault')),
  tier                   VARCHAR(32) NOT NULL,
  status                 VARCHAR(32) NOT NULL DEFAULT 'active'
    CHECK (status IN ('trial', 'active', 'past_due', 'canceled', 'paused')),
  /** Monetary plan amount in lowest currency unit (paise for INR, cents for USD). */
  unit_amount_cents      BIGINT NOT NULL,
  currency               VARCHAR(3) NOT NULL DEFAULT 'INR',
  billing_cycle          VARCHAR(16) NOT NULL DEFAULT 'annual'
    CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual', 'usage')),
  current_period_start   DATE NOT NULL,
  current_period_end     DATE NOT NULL,
  next_billing_date      DATE,
  auto_renew             BOOLEAN NOT NULL DEFAULT true,
  metadata               JSONB DEFAULT '{}'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX billing_subscriptions_customer_idx ON billing.subscriptions (customer_id);
CREATE INDEX billing_subscriptions_status_idx ON billing.subscriptions (status);
CREATE INDEX billing_subscriptions_next_billing_idx
  ON billing.subscriptions (next_billing_date) WHERE status IN ('active', 'past_due');

COMMENT ON TABLE billing.subscriptions IS
  'Per-customer SKU subscription. Spec §2 covers the SKU-to-billing-cycle mapping.';

CREATE TABLE billing.invoices (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id            UUID NOT NULL REFERENCES billing.customers(id) ON DELETE CASCADE,
  /** Human-friendly running number, e.g. INV-2026-00001. */
  invoice_number         VARCHAR(32) NOT NULL UNIQUE,
  subtotal_cents         BIGINT NOT NULL,
  tax_cents              BIGINT NOT NULL DEFAULT 0,
  total_cents            BIGINT NOT NULL,
  currency               VARCHAR(3) NOT NULL DEFAULT 'INR',
  status                 VARCHAR(32) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'open', 'paid', 'void', 'failed', 'refunded')),
  issued_at              TIMESTAMPTZ,
  due_date               DATE,
  paid_at                TIMESTAMPTZ,
  pdf_url                TEXT,
  notes                  TEXT,
  metadata               JSONB DEFAULT '{}'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX billing_invoices_customer_idx ON billing.invoices (customer_id);
CREATE INDEX billing_invoices_status_idx ON billing.invoices (status);
CREATE INDEX billing_invoices_due_date_idx ON billing.invoices (due_date) WHERE status = 'open';

CREATE TABLE billing.line_items (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id             UUID NOT NULL REFERENCES billing.invoices(id) ON DELETE CASCADE,
  subscription_id        UUID REFERENCES billing.subscriptions(id) ON DELETE SET NULL,
  type                   VARCHAR(32) NOT NULL DEFAULT 'recurring'
    CHECK (type IN ('recurring', 'usage', 'overage', 'one_off', 'discount')),
  description            VARCHAR(255) NOT NULL,
  quantity               INT NOT NULL DEFAULT 1,
  unit_amount_cents      BIGINT NOT NULL,
  /** Tax rate × 100, e.g. 1800 = 18.00%. */
  tax_rate_bps           INT NOT NULL DEFAULT 0,
  tax_amount_cents       BIGINT NOT NULL DEFAULT 0,
  total_cents            BIGINT NOT NULL,
  period_start           DATE,
  period_end             DATE,
  metadata               JSONB DEFAULT '{}'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX billing_line_items_invoice_idx ON billing.line_items (invoice_id);

CREATE TABLE billing.payments (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id             UUID NOT NULL REFERENCES billing.invoices(id) ON DELETE CASCADE,
  payment_provider       VARCHAR(32) NOT NULL CHECK (payment_provider IN ('razorpay', 'stripe', 'manual')),
  provider_payment_id    VARCHAR(255),
  provider_order_id      VARCHAR(255),
  amount_cents           BIGINT NOT NULL,
  currency               VARCHAR(3) NOT NULL DEFAULT 'INR',
  status                 VARCHAR(32) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'authorized', 'captured', 'failed', 'refunded')),
  error_message          TEXT,
  attempt_count          INT NOT NULL DEFAULT 0,
  next_retry_at          TIMESTAMPTZ,
  raw_event              JSONB,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX billing_payments_invoice_idx ON billing.payments (invoice_id);
CREATE INDEX billing_payments_status_idx ON billing.payments (status);

CREATE TABLE billing.usage_records (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id            UUID NOT NULL REFERENCES billing.customers(id) ON DELETE CASCADE,
  metric                 VARCHAR(64) NOT NULL
    CHECK (metric IN ('jd_forge_orders', 'stack_vault_questions', 'readybank_exports')),
  quantity               INT NOT NULL DEFAULT 0,
  event_date             DATE NOT NULL,
  metadata               JSONB DEFAULT '{}'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (customer_id, metric, event_date)
);

CREATE INDEX billing_usage_records_customer_idx
  ON billing.usage_records (customer_id, event_date DESC);

COMMENT ON TABLE billing.usage_records IS
  'Daily usage rollups for usage-based SKUs (JD-Forge orders, Stack-Vault overage). UNIQUE (customer, metric, date) makes idempotent emit cheap.';

COMMIT;

-- Rollback ------------------------------------------------------------------
-- DROP TABLE billing.usage_records;
-- DROP TABLE billing.payments;
-- DROP TABLE billing.line_items;
-- DROP TABLE billing.invoices;
-- DROP TABLE billing.subscriptions;
-- DROP TABLE billing.customers;
-- DROP SCHEMA billing CASCADE;
