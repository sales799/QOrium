-- =============================================================================
-- Migration 0013 — Webhooks schema (Sprint 4.5 / Run #65)
-- =============================================================================
-- Per `infra/Webhooks-Service-v0-Spec.md` §2 Database Tables. v0 schema only;
-- the PM2 service + Redis-backed delivery worker land in Sprint 4.5.1 — at
-- which point they `INSERT INTO webhooks.events`, the worker pulls
-- `webhooks.deliveries WHERE status='pending' AND next_retry_at <= NOW()`,
-- and POSTs to subscribers.
--
-- Tenant scoping mirrors the audit-log pattern (Sprint 4.4.1 SCOPE_CLAUSE).
-- subscriptions.signing_secret is a HASH of the secret (never the raw
-- secret) — the raw is returned to the customer ONCE at creation time.
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS webhooks;

CREATE TABLE webhooks.subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL,

  -- NULL = subscribe to all events. Otherwise an exact event-type match.
  event_type      VARCHAR(64),

  endpoint_url    TEXT NOT NULL CHECK (endpoint_url ~ '^https://'),

  -- HMAC of the signing secret keyed by API_KEY_PEPPER. The raw secret is
  -- shown to the customer once at creation; we store only the hash so a
  -- DB compromise can't forge signatures.
  signing_secret_hash  BYTEA NOT NULL,

  -- 180-day rotation per spec §9. Both old + new are valid during overlap.
  signing_secret_rotated_at TIMESTAMPTZ,
  signing_secret_previous_hash BYTEA,

  is_active       BOOLEAN NOT NULL DEFAULT TRUE,

  -- Spec §10: alert when 5+ consecutive failures occur.
  consecutive_failures INTEGER NOT NULL DEFAULT 0,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX webhooks_subscriptions_tenant_idx
  ON webhooks.subscriptions (tenant_id, is_active, event_type);

CREATE TABLE webhooks.events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL,
  event_type      VARCHAR(64) NOT NULL,
  aggregate_id    VARCHAR(100),
  payload         JSONB NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spec §2 calls for monthly partitioning by created_at. We start single-table
-- and hand off to Sprint 4.5.2 to convert to RANGE-partitioned (same pattern
-- as audit.events 0002_partitions.sql stub).
CREATE INDEX webhooks_events_tenant_type_idx
  ON webhooks.events (tenant_id, event_type, created_at DESC);

CREATE TABLE webhooks.deliveries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES webhooks.events(id),
  subscription_id UUID NOT NULL REFERENCES webhooks.subscriptions(id),

  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'delivered', 'failed')),

  attempt_count   INTEGER NOT NULL DEFAULT 0,
  http_status     INTEGER,
  last_error      TEXT,

  -- Worker pulls rows where status='pending' AND next_retry_at <= NOW().
  next_retry_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  delivered_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Worker dispatch index — tight WHERE clause keeps it small.
CREATE INDEX webhooks_deliveries_dispatch_idx
  ON webhooks.deliveries (next_retry_at, id)
  WHERE status = 'pending';

-- Customer history view: GET /webhooks/subscriptions/:id/deliveries.
CREATE INDEX webhooks_deliveries_subscription_idx
  ON webhooks.deliveries (subscription_id, created_at DESC);

COMMENT ON TABLE webhooks.subscriptions IS
  'Customer-configured webhook subscriptions (Sprint 4.5). signing_secret_hash is HMAC-keyed; raw secret is shown once at creation.';
COMMENT ON TABLE webhooks.events IS
  'Append-only outbound event ledger. Worker fans out to all matching subscriptions via webhooks.deliveries.';
COMMENT ON TABLE webhooks.deliveries IS
  'Per-(event, subscription) delivery attempt state. Worker picks up rows where status=pending AND next_retry_at <= NOW().';
