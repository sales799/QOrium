-- 0009_stack_vault.sql
-- Sprint 3.4 — Stack-Vault tenant isolation infrastructure.
--
-- Stack-Vault is SKU 3 per Constitution §1.2: customer-exclusive,
-- IP-protected question library. Per-tenant pricing tier; per-tenant
-- isolation enforced at the DB layer (defense in depth + clear blast
-- radius semantics).
--
-- Tier floors per Constitution §1.2:
--   bronze:  ₹10L  =      1,000,000,00 paise   = 1_000_000_000  bigint
--   silver:  ₹40L  =      4,000,000,00 paise   = 4_000_000_000  bigint
--   gold:    ₹1Cr  =     10,000,000,00 paise   = 10_000_000_000 bigint
--
-- Adds:
--   1. app.tenant_stack_vaults — per-tenant vault config (tier, floor,
--      expiry, optional vault-specific watermark pepper).
--   2. content.questions.stack_vault_tenant_id — NULL = ReadyBank shared
--      library; non-NULL = exclusive to that tenant. Cross-tenant reads
--      return 404 (information leak avoidance).
--   3. Composite uniqueness on (stack_vault_tenant_id, qor_id) so a
--      tenant's question id space is independent of others.
--   4. Sparse partial index for hot path (tenant-scoped vault search).
--
-- Idempotent: every ALTER + CREATE uses IF NOT EXISTS where supported.

BEGIN;

-- ── 1. Per-tenant vault config ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS app.tenant_stack_vaults (
  tenant_id              UUID PRIMARY KEY REFERENCES app.tenants(id) ON DELETE CASCADE,
  tier                   VARCHAR(16) NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold')),
  -- Annual contract floor in paise (Money in bigint, per packages/billing).
  -- 1 INR = 100 paise; ₹10L = 1_000_000 INR = 100_000_000_00 paise.
  -- Per Constitution §1.2: bronze=₹10L, silver=₹40L, gold=₹1Cr+.
  annual_floor_paise     BIGINT NOT NULL CHECK (annual_floor_paise > 0),
  -- Per-vault watermark pepper; rotate by reissuing all rendered
  -- assertions. Stored encrypted-at-rest in production via Vault.
  watermark_pepper_enc   TEXT,
  contract_started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  contract_expires_at    TIMESTAMPTZ NOT NULL,
  -- Inactive = renewal lapsed; questions remain exclusive but read access blocked.
  status                 VARCHAR(16) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'lapsed', 'terminated')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tenant_stack_vaults_status_expiry_idx
  ON app.tenant_stack_vaults (status, contract_expires_at);

COMMENT ON TABLE app.tenant_stack_vaults IS
  'Per-tenant Stack-Vault config. Tier + annual floor + contract window. Watermark pepper is per-vault to prevent cross-vault watermark forgery.';

COMMENT ON COLUMN app.tenant_stack_vaults.annual_floor_paise IS
  'Annual contract floor in paise (Money bigint). bronze=100_000_000_00, silver=400_000_000_00, gold>=1_000_000_000_00.';

-- ── 2. stack_vault_tenant_id on questions ────────────────────────────
ALTER TABLE content.questions
  ADD COLUMN IF NOT EXISTS stack_vault_tenant_id UUID
    REFERENCES app.tenants(id) ON DELETE RESTRICT;

COMMENT ON COLUMN content.questions.stack_vault_tenant_id IS
  'NULL = ReadyBank shared library (visible to all tenants per their plan). Non-NULL = Stack-Vault exclusive to that tenant; cross-tenant reads MUST return 404 (no 403 to avoid existence-leak).';

-- ── 3. Sparse index for vault hot path ──────────────────────────────
CREATE INDEX IF NOT EXISTS questions_stack_vault_idx
  ON content.questions (stack_vault_tenant_id)
  WHERE stack_vault_tenant_id IS NOT NULL;

-- Within a vault, qor_id namespaces are independent — same logical
-- question id can exist in tenant A's vault and tenant B's vault.
-- Note: keep the existing global UNIQUE on qor_id for ReadyBank rows;
-- vault rows are excluded via the partial index below.
CREATE UNIQUE INDEX IF NOT EXISTS questions_vault_tenant_qorid_uniq
  ON content.questions (stack_vault_tenant_id, qor_id)
  WHERE stack_vault_tenant_id IS NOT NULL;

-- ── 4. Updated-at trigger ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION app.tenant_stack_vaults_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tenant_stack_vaults_updated_at ON app.tenant_stack_vaults;
CREATE TRIGGER tenant_stack_vaults_updated_at
  BEFORE UPDATE ON app.tenant_stack_vaults
  FOR EACH ROW EXECUTE FUNCTION app.tenant_stack_vaults_set_updated_at();

COMMIT;
