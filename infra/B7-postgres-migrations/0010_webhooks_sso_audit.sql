-- ============================================================================
-- Migration 0010: Webhooks + SSO schemas + audit.events tenant_id
-- ============================================================================
-- Per:
--   * infra/Webhooks-Service-v0-Spec.md §2 (database tables) + §5 (signing)
--   * infra/SSO-SAML-Enterprise-Spec-v0.md §5 (sso.configurations)
--   * infra/Audit-Log-API-Spec-v0.md (tenant-scoped audit queries)
--
-- 0001 ships `audit.events` without `tenant_id` because the audit log was
-- originally CTO-internal. Spec calls for tenant-scoped queries (§3.1
-- "Customer Audit Trail"), so we add a nullable column + an index. NULL
-- = system-level event (cron, leak crawler, calibration batch).
-- ============================================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS webhooks;
CREATE SCHEMA IF NOT EXISTS sso;

CREATE TABLE webhooks.subscriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  /** Wildcard ('*') or one of the canonical event types in the v0 taxonomy. */
  event_type          VARCHAR(80) NOT NULL DEFAULT '*',
  endpoint_url        TEXT NOT NULL,
  /** HMAC pepper for outbound delivery signing. Generated server-side at
   * subscription creation; never returned via API after creation. */
  signing_secret_cipher TEXT NOT NULL,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  /** §10 customer experience: track failure streaks for the dashboard. */
  consecutive_failures INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, event_type, endpoint_url)
);

CREATE INDEX webhooks_subscriptions_tenant_active_idx
  ON webhooks.subscriptions (tenant_id, is_active);
CREATE INDEX webhooks_subscriptions_event_type_idx
  ON webhooks.subscriptions (event_type);

COMMENT ON TABLE webhooks.subscriptions IS
  'Per-tenant webhook subscriptions. event_type=''*'' matches every event for this tenant.';

CREATE TABLE webhooks.events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  event_type          VARCHAR(80) NOT NULL,
  aggregate_id        UUID,
  payload             JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX webhooks_events_tenant_created_idx
  ON webhooks.events (tenant_id, created_at DESC);
CREATE INDEX webhooks_events_event_type_idx ON webhooks.events (event_type);

COMMENT ON TABLE webhooks.events IS
  'Append-only event ledger consumed by the webhook delivery worker. Spec §2 calls for monthly partitioning at scale; deferred to a follow-up migration.';

CREATE TABLE webhooks.deliveries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id            UUID NOT NULL REFERENCES webhooks.events(id) ON DELETE CASCADE,
  subscription_id     UUID NOT NULL REFERENCES webhooks.subscriptions(id) ON DELETE CASCADE,
  status              VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'delivered', 'failed', 'abandoned')),
  http_status         INT,
  attempt_count       INT NOT NULL DEFAULT 0,
  next_retry_at       TIMESTAMPTZ,
  last_error          TEXT,
  delivered_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX webhooks_deliveries_event_idx ON webhooks.deliveries (event_id);
CREATE INDEX webhooks_deliveries_subscription_idx ON webhooks.deliveries (subscription_id);
CREATE INDEX webhooks_deliveries_pending_idx
  ON webhooks.deliveries (next_retry_at) WHERE status = 'pending';

COMMENT ON TABLE webhooks.deliveries IS
  'Per-(event, subscription) delivery attempt log. The delivery worker scans `pending` rows where next_retry_at <= NOW().';

CREATE TABLE sso.configurations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  protocol            VARCHAR(20) NOT NULL DEFAULT 'saml'
    CHECK (protocol IN ('saml', 'oidc')),
  idp_type            VARCHAR(40) NOT NULL DEFAULT 'custom'
    CHECK (idp_type IN ('okta', 'azure_ad', 'google_workspace', 'ping', 'jumpcloud', 'onelogin', 'custom')),
  /** SAML metadata URL (auto-discovery) or NULL for manually-configured tenants. */
  metadata_url        TEXT,
  entity_id           TEXT,
  sso_endpoint_url    TEXT,
  slo_endpoint_url    TEXT,
  /** PEM-encoded IdP signing certificate(s). For OIDC: JWKS URL. */
  idp_certificate     TEXT,
  oidc_issuer         TEXT,
  oidc_client_id      TEXT,
  oidc_client_secret_cipher TEXT,
  /** Tenant default role mapping (e.g., {"groups":{"admins":"admin"}}). */
  attribute_mapping   JSONB DEFAULT '{}'::jsonb,
  /** Active, draft (still being configured), or test-mode (only test users). */
  status              VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'test_mode', 'active', 'disabled')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id)
);

CREATE INDEX sso_configurations_status_idx ON sso.configurations (status);
CREATE INDEX sso_configurations_idp_type_idx ON sso.configurations (idp_type);

COMMENT ON TABLE sso.configurations IS
  'Per-tenant SSO configuration. One config per tenant in v0; multi-IdP per tenant deferred.';

ALTER TABLE audit.events
  ADD COLUMN tenant_id UUID REFERENCES app.tenants(id) ON DELETE SET NULL;

CREATE INDEX audit_events_tenant_occurred_idx
  ON audit.events (tenant_id, occurred_at DESC) WHERE tenant_id IS NOT NULL;

COMMENT ON COLUMN audit.events.tenant_id IS
  'Tenant scope for the audit event. NULL = system-level event (cron, batch jobs). Per Audit-Log-API-Spec-v0.md tenant-scoped queries.';

COMMIT;

-- Rollback ------------------------------------------------------------------
-- DROP INDEX audit.audit_events_tenant_occurred_idx;
-- ALTER TABLE audit.events DROP COLUMN tenant_id;
-- DROP TABLE sso.configurations;
-- DROP SCHEMA sso CASCADE;
-- DROP TABLE webhooks.deliveries;
-- DROP TABLE webhooks.events;
-- DROP TABLE webhooks.subscriptions;
-- DROP SCHEMA webhooks CASCADE;
