-- ============================================================================
-- Migration 0008: Stack-Vault per-customer namespace + access log
-- ============================================================================
-- Per 05-QOrium-Three-Use-Cases-SKU-Architecture.md §4 + CTO Architecture §6.3:
--
--   app.stack_vaults — one row per customer Stack-Vault subscription. Holds:
--     * tenant_id (the customer)
--     * tier (Department / Enterprise / Group per spec §4.4)
--     * library_size (target question count for the tier)
--     * watermark_secret (server-side; HMAC seed for per-(tenant, question)
--       watermark derivation; never returned via API)
--     * status (provisioning / active / suspended / churned)
--     * contract dates + refresh cadence
--
--   app.stack_vault_access_log — append-only audit per spec §4.7
--     ("technical access logging" mitigation for the
--     "customer pirates their own Stack-Vault" risk). Every customer read
--     of a watermarked question is recorded with the question_id,
--     watermark_id derived for that read, candidate_id (if available),
--     and the timestamp + IP + UA.
--
-- The link from Stack-Vault back to a master question lives on
-- `content.questions.parent_question_id` (already in B7 0001) — variants
-- carry parent_question_id pointing to the master.
-- ============================================================================

BEGIN;

CREATE TABLE app.stack_vaults (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  tier              VARCHAR(20) NOT NULL DEFAULT 'department'
    CHECK (tier IN ('department', 'enterprise', 'group')),
  library_size      INT NOT NULL CHECK (library_size > 0),
  watermark_secret  VARCHAR(128) NOT NULL,        -- HMAC pepper for this vault
  status            VARCHAR(20) NOT NULL DEFAULT 'provisioning'
    CHECK (status IN ('provisioning', 'active', 'suspended', 'churned')),
  contract_start_date DATE,
  contract_end_date   DATE,
  /** Quarterly refresh: number of new + retired questions per cycle. */
  refresh_new_per_quarter     INT NOT NULL DEFAULT 50,
  refresh_retired_per_quarter INT NOT NULL DEFAULT 25,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id)                              -- one vault per tenant in v0
);

CREATE INDEX stack_vaults_tenant_idx ON app.stack_vaults (tenant_id);
CREATE INDEX stack_vaults_status_idx ON app.stack_vaults (status);

COMMENT ON TABLE app.stack_vaults IS
  'Per-customer Stack-Vault subscription. One vault per tenant in v0. Per 05-QOrium-Three-Use-Cases-SKU-Architecture.md §4.';
COMMENT ON COLUMN app.stack_vaults.watermark_secret IS
  'HMAC seed for per-(tenant, question_id) watermark derivation. Server-side only; never returned via the API. Rotate on subscription churn.';

CREATE TABLE app.stack_vault_access_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id        UUID NOT NULL REFERENCES app.stack_vaults(id) ON DELETE CASCADE,
  tenant_id       UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL,                -- soft-ref; questions may rotate out
  watermark_id    VARCHAR(64) NOT NULL,         -- truncated HMAC returned to the customer
  candidate_id    VARCHAR(100),                 -- optional external candidate ref
  api_key_id      UUID REFERENCES app.api_keys(id) ON DELETE SET NULL,
  request_ip      INET,
  user_agent      TEXT,
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX stack_vault_access_log_vault_idx ON app.stack_vault_access_log (vault_id);
CREATE INDEX stack_vault_access_log_question_idx ON app.stack_vault_access_log (question_id);
CREATE INDEX stack_vault_access_log_occurred_at_idx ON app.stack_vault_access_log (occurred_at DESC);
CREATE INDEX stack_vault_access_log_tenant_occurred_idx
  ON app.stack_vault_access_log (tenant_id, occurred_at DESC);

COMMENT ON TABLE app.stack_vault_access_log IS
  'Append-only audit of every Stack-Vault read. Mitigates the "customer pirates their own Stack-Vault" risk per spec §4.7.';

COMMIT;

-- Rollback ------------------------------------------------------------------
-- DROP TABLE app.stack_vault_access_log;
-- DROP TABLE app.stack_vaults;
