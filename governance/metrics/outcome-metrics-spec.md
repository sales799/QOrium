# Outcome Metrics Spec (Sprint 7.0)

Each metric below is defined precisely (formula + source tables + grain
+ scope) and maps to a SQL view in migration `0015_outcome_metrics_views.sql`.

## A. Revenue

### A1 — ARR (Annual Recurring Revenue)

- **Formula:** sum of active subscription monthly amounts × 12
- **Grain:** snapshot at query time
- **Scope:** per-tenant + org-wide rollup
- **Source:** `app.subscriptions` (introduced in Sprint 2.2 billing alpha — fields: `monthly_amount_minor`, `currency`, `status`)
- **View:** `metrics.tenant_arr`
- **Constitutional anchor:** Article IX M9 phase-gate "$50M ARR Talpro Universe Anchor"
- **Caveat:** subscription table will be populated once first 3 logos sign (human-bound). Today the view returns 0 rows — that's correct, not broken.

### A2 — MRR (Monthly Recurring Revenue)

- **Formula:** ARR / 12 by definition; reported separately for finance reconciliation
- **View:** `metrics.tenant_mrr`

### A3 — NRR (Net Revenue Retention)

- **Formula:** (ARR_end - ARR_churn - ARR_contraction + ARR_expansion) / ARR_start
- **Grain:** trailing 12 months, snapshot monthly
- **View:** `metrics.tenant_nrr_trailing_12m`
- **Caveat:** requires ≥ 12 months of subscription history; returns NULL until that window exists.

## B. Adoption

### B1 — DAU (Daily Active Users)

- **Definition:** distinct `actor_id` in `audit.events` per UTC day where `event_type IN ('auth.login_success', 'question.viewed', 'pack.generated', 'pack.exported')`
- **Grain:** per UTC day
- **Scope:** org-wide (per-tenant via filter)
- **View:** `metrics.dau_rolling`

### B2 — MAU (Monthly Active Users)

- **Definition:** distinct `actor_id` in `audit.events` over trailing 30 days
- **View:** `metrics.mau_rolling`

### B3 — Stickiness (DAU/MAU ratio)

- **View:** computed in dashboard layer; no separate SQL view

## C. Content Throughput

### C1 — Content throughput (30 days)

- **Definition:** count of `content.questions` rows where `released_at` falls in trailing 30 days
- **Grain:** snapshot
- **Scope:** org-wide (no tenant scope — content is shared library)
- **View:** `metrics.content_throughput_30d`
- **Constitutional anchor:** M3 target 5,000-question library

### C2 — Wave coverage

- **Definition:** count of `content.questions` per `(sku, wave_id)` partition with `status='released'`
- **View:** `metrics.wave_coverage`

## D. Quality Signals

### D1 — Leak detection rate (quarterly)

- **Definition:** count of `content.leak_alerts` where `status='confirmed'` per quarter, normalised by total released questions
- **View:** `metrics.leak_rate_quarterly`
- **Constitutional anchor:** SO-9 anti-leak forensics

### D2 — IRT calibration coverage

- **Definition:** count of `content.questions` where `discrimination_a IS NOT NULL` (i.e., IRT-calibrated) ÷ total released
- **View:** `metrics.irt_coverage`

### D3 — Webhook delivery success rate

- **Definition:** `webhooks.deliveries` where `status='delivered'` ÷ total per subscription per day
- **View:** `metrics.webhook_success_rate`

### D4 — ATS sync success rate

- **Definition:** `ats.sync_runs` where `status='succeeded'` ÷ total per kind per day
- **View:** `metrics.ats_sync_success_rate`

## E. Operational

### E1 — Audit-event volume

- **Definition:** count of `audit.events` per UTC day per `event_type` prefix
- **View:** `metrics.audit_volume_daily`

### E2 — Hash-chain integrity (org-wide)

- **Definition:** % of events where `hash_current IS NOT NULL` (i.e., post-Sprint 4.4.3); per UTC day
- **View:** `metrics.hash_chain_coverage`

### E3 — DR replication health

- **Definition:** snapshot of S3 cross-region replication latency + Postgres replica lag
- **Source:** CloudWatch metrics (out of SQL view scope; documented in `dashboards.md`)

## Privacy + tenant scoping

All per-tenant views are RLS-friendly. When QOrium adds RLS policies in
a future sprint (`Sprint 5.2`), these views inherit them — no changes
needed at the metric layer.

## Caveat: views vs Materialized Views

v0 uses regular views. If any view becomes too slow at scale (>500ms
on the production replica), Sprint 7.0.0.1 promotes it to a
`MATERIALIZED VIEW` with `REFRESH CONCURRENTLY` on a 5-minute cadence.
The view definitions are designed so this conversion is mechanical.
