# Outcome Metrics — Sprint 7.0

**Status:** v0 · engineering-scaffold (data-only)
**Anchor:** Auto-Mode-Remote-Plan §Phase G Sprint 7.0
**Constitutional context:** Article IX defines Project Completion as
$300M acquisition / IPO ≥₹3,000Cr / $50M ARR — these are **business
outcomes** (human-bound). This sprint ships the **engineering surface**
that measures progress against them: SQL views + dashboard
specifications. The actual business outcomes are not auto-eligible.

## Index

| Doc | Purpose |
|---|---|
| [`outcome-metrics-spec.md`](./outcome-metrics-spec.md) | Definitions: ARR, MRR, DAU, MAU, content-throughput, NRR, leak-rate, IRT-calibration-rate |
| [`dashboards.md`](./dashboards.md) | Grafana panel specifications (one panel per metric) |
| [migration `0015_outcome_metrics_views.sql`](../../infra/B7-postgres-migrations/0015_outcome_metrics_views.sql) | SQL views over the canonical schema |

## Design principles

1. **Views, not snapshots.** Every metric is a SQL view computed from
   live tables (`audit.events`, `app.api_keys`, `content.questions`,
   `webhooks.deliveries`, `ats.sync_runs`). No pre-aggregated tables;
   no risk of drift.
2. **Tenant-scoped where applicable.** ARR / NRR / DAU / MAU are
   per-tenant. Content-throughput is org-wide.
3. **Outcome = revenue + adoption + content quality.** Three pillars.
4. **The Master Meter doesn't move past 0.78 from these views.** Per
   Constitution Article IX, business outcomes (M&A / IPO / first 3
   logos / first Bosch GCC discovery call) are human-bound; the views
   merely surface progress against them.

## What this sprint ships

- ✅ SQL view definitions (migration `0015`)
- ✅ Metric specifications (`outcome-metrics-spec.md`)
- ✅ Grafana panel specs (`dashboards.md`)

## What this sprint does NOT ship (deferred)

- **Sprint 7.0.1** — provisioning the actual Grafana dashboards from
  the panel specs (cred-bound; depends on Sprint 4.1 observability.tf
  apply).
- **Sprint 7.0.2** — alerting rules (e.g., alert if ARR drops >5%
  week-over-week; alert if content-throughput < target).
- **Sprint 7.0.3** — public investor metrics page (subset of metrics
  exposed at `metrics.qorium.online`).

## Querying the views (developer cheat sheet)

Once migration `0015` is applied:

```sql
-- Org-wide content throughput (last 30 days)
SELECT * FROM metrics.content_throughput_30d;

-- Per-tenant ARR snapshot (excludes free tier; sums billing.subscriptions)
SELECT * FROM metrics.tenant_arr WHERE tenant_id = '<uuid>';

-- DAU rolling 30 days
SELECT * FROM metrics.dau_rolling;

-- Leak-detection rate per quarter (SO-9 health metric)
SELECT * FROM metrics.leak_rate_quarterly;
```

All views are read-only and respect any RLS policies layered onto the
underlying tables.

---

_Maintainer: CTO Office. Override or extend by editing
`outcome-metrics-spec.md` and shipping a follow-on migration._
