-- =============================================================================
-- Migration 0015 — Outcome metrics views (Sprint 7.0 / Run #69)
-- =============================================================================
-- Per `governance/metrics/outcome-metrics-spec.md`. Read-only views over
-- canonical tables. v0 uses regular VIEWs; Sprint 7.0.0.1 promotes any
-- slow ones to MATERIALIZED VIEW + REFRESH CONCURRENTLY on 5-minute cadence.
--
-- Naming: all views live in `metrics` schema for tidy separation.
-- Tenant scoping: views that expose per-tenant data carry `tenant_id` so
-- downstream Grafana dashboards can apply RLS-friendly filters.
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS metrics;

-- A1 — Per-tenant ARR snapshot ----------------------------------------------
-- Returns 0 rows until app.subscriptions is populated (post first 3 logos
-- per Constitution Article IX M9 phase-gate). The view definition is
-- defensive: it tolerates the table not existing yet via CTE join pattern.

CREATE OR REPLACE VIEW metrics.tenant_arr AS
SELECT
  t.id                                            AS tenant_id,
  t.slug                                          AS tenant_slug,
  COALESCE(SUM(s.monthly_amount_minor) * 12, 0)::bigint AS arr_minor,
  MAX(s.currency)                                 AS currency,
  COUNT(s.id)                                     AS active_subscription_count,
  NOW()                                           AS snapshot_at
FROM app.tenants t
LEFT JOIN app.subscriptions s
  ON s.tenant_id = t.id
 AND s.status = 'active'
GROUP BY t.id, t.slug;

COMMENT ON VIEW metrics.tenant_arr IS
  'A1 ARR snapshot per tenant. Returns 0 rows for tenants with no active subscriptions; that is correct, not broken.';

-- A2 — Per-tenant MRR (= ARR / 12) ------------------------------------------

CREATE OR REPLACE VIEW metrics.tenant_mrr AS
SELECT
  tenant_id,
  tenant_slug,
  (arr_minor / 12)::bigint AS mrr_minor,
  currency,
  snapshot_at
FROM metrics.tenant_arr;

-- B1 — DAU rolling daily ----------------------------------------------------
-- Distinct actor_id per UTC day for "active" event types.

CREATE OR REPLACE VIEW metrics.dau_rolling AS
SELECT
  DATE_TRUNC('day', occurred_at AT TIME ZONE 'UTC')::date AS day,
  COUNT(DISTINCT actor_id) FILTER (WHERE actor_id IS NOT NULL) AS dau,
  COUNT(DISTINCT tenant_id) FILTER (WHERE tenant_id IS NOT NULL) AS active_tenants
FROM audit.events
WHERE event_type IN (
    'auth.login_success',
    'question.viewed',
    'pack.generated',
    'pack.exported'
  )
  AND occurred_at >= NOW() - INTERVAL '180 days'
GROUP BY 1
ORDER BY 1;

-- B2 — MAU rolling monthly --------------------------------------------------

CREATE OR REPLACE VIEW metrics.mau_rolling AS
SELECT
  DATE_TRUNC('month', occurred_at AT TIME ZONE 'UTC')::date AS month,
  COUNT(DISTINCT actor_id) FILTER (WHERE actor_id IS NOT NULL) AS mau,
  COUNT(DISTINCT tenant_id) FILTER (WHERE tenant_id IS NOT NULL) AS active_tenants
FROM audit.events
WHERE event_type IN (
    'auth.login_success',
    'question.viewed',
    'pack.generated',
    'pack.exported'
  )
  AND occurred_at >= NOW() - INTERVAL '24 months'
GROUP BY 1
ORDER BY 1;

-- C1 — Content throughput (30-day window) -----------------------------------

CREATE OR REPLACE VIEW metrics.content_throughput_30d AS
SELECT
  COUNT(*) FILTER (WHERE released_at >= NOW() - INTERVAL '30 days') AS released_30d,
  COUNT(*) FILTER (WHERE released_at >= NOW() - INTERVAL '7 days')  AS released_7d,
  COUNT(*) FILTER (WHERE released_at >= NOW() - INTERVAL '1 day')   AS released_1d,
  COUNT(*) FILTER (WHERE status = 'released')                       AS library_total
FROM content.questions;

-- C2 — Wave coverage matrix -------------------------------------------------

CREATE OR REPLACE VIEW metrics.wave_coverage AS
SELECT
  sku,
  COALESCE(skill_id::text, 'unspecified') AS skill_bucket,
  COUNT(*) FILTER (WHERE status = 'released') AS released,
  COUNT(*) FILTER (WHERE status = 'sme_review') AS sme_review,
  COUNT(*) FILTER (WHERE status = 'draft') AS draft,
  COUNT(*) AS total
FROM content.questions
GROUP BY sku, skill_id;

-- D1 — Leak detection rate (quarterly) --------------------------------------

CREATE OR REPLACE VIEW metrics.leak_rate_quarterly AS
SELECT
  DATE_TRUNC('quarter', detected_at)::date AS quarter,
  COUNT(*) FILTER (WHERE status = 'rotated' OR status = 'under_review' OR severity = 'critical') AS confirmed,
  COUNT(*)                                                                                       AS total_alerts
FROM content.leak_alerts
GROUP BY 1
ORDER BY 1;

-- D2 — IRT calibration coverage ---------------------------------------------

CREATE OR REPLACE VIEW metrics.irt_coverage AS
SELECT
  COUNT(*) FILTER (WHERE discrimination_a IS NOT NULL AND status = 'released') AS calibrated,
  COUNT(*) FILTER (WHERE status = 'released')                                  AS released_total,
  CASE
    WHEN COUNT(*) FILTER (WHERE status = 'released') = 0 THEN NULL
    ELSE ROUND(
      100.0 * COUNT(*) FILTER (WHERE discrimination_a IS NOT NULL AND status = 'released')::numeric
      / COUNT(*) FILTER (WHERE status = 'released')::numeric,
      2
    )
  END AS coverage_pct
FROM content.questions;

-- E1 — Audit-event volume daily ---------------------------------------------

CREATE OR REPLACE VIEW metrics.audit_volume_daily AS
SELECT
  DATE_TRUNC('day', occurred_at)::date AS day,
  SPLIT_PART(event_type, '.', 1)       AS event_prefix,
  COUNT(*)                             AS events
FROM audit.events
WHERE occurred_at >= NOW() - INTERVAL '90 days'
GROUP BY 1, 2
ORDER BY 1, 2;

-- E2 — Hash-chain coverage --------------------------------------------------

CREATE OR REPLACE VIEW metrics.hash_chain_coverage AS
SELECT
  DATE_TRUNC('day', occurred_at)::date                                        AS day,
  COUNT(*) FILTER (WHERE hash_current IS NOT NULL)                            AS hashed,
  COUNT(*)                                                                    AS total,
  CASE
    WHEN COUNT(*) = 0 THEN NULL
    ELSE ROUND(100.0 * COUNT(*) FILTER (WHERE hash_current IS NOT NULL)::numeric / COUNT(*)::numeric, 2)
  END AS coverage_pct
FROM audit.events
WHERE occurred_at >= NOW() - INTERVAL '30 days'
GROUP BY 1
ORDER BY 1;

COMMENT ON SCHEMA metrics IS
  'Outcome metrics views (Sprint 7.0). Read-only; derives from canonical tables. See governance/metrics/outcome-metrics-spec.md.';
