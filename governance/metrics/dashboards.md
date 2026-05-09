# Outcome Metrics Dashboards (Sprint 7.0)

Grafana panel specifications. One panel per metric in
`outcome-metrics-spec.md`. Sprint 7.0.1 provisions these into Grafana
Cloud (depends on Sprint 4.1 observability.tf apply).

## Dashboard A — Revenue (CEO + CFO)

| Panel | Type | Query | Refresh |
|---|---|---|---|
| ARR (org-wide) | Stat | `SELECT SUM(arr_minor) / 100.0 / 1e6 AS arr_million_usd FROM metrics.tenant_arr` | 5m |
| ARR by tenant (top 10) | Bar | `SELECT tenant_slug, arr_minor / 100.0 AS arr FROM metrics.tenant_arr ORDER BY arr DESC LIMIT 10` | 5m |
| MRR trend | Time-series | `metrics.tenant_mrr` over time | 1h |
| NRR (trailing 12m) | Stat with sparkline | `metrics.tenant_nrr_trailing_12m` | 1d |
| Phase-gate progress | Gauge (0 → $50M ARR) | `SUM(arr_minor) / 100 / 50000000.0` | 5m |

## Dashboard B — Adoption (CEO + CDO)

| Panel | Type | Query |
|---|---|---|
| DAU (org-wide trend) | Time-series | `metrics.dau_rolling WHERE day >= NOW() - INTERVAL '90 days'` |
| MAU (org-wide trend) | Time-series | `metrics.mau_rolling WHERE month >= NOW() - INTERVAL '12 months'` |
| Stickiness (DAU/MAU) | Stat | computed: latest DAU ÷ latest MAU |
| Active tenants | Stat | distinct `tenant_id` in `metrics.dau_rolling` last 7 days |

## Dashboard C — Content Quality (CCO + CTO)

| Panel | Type | Query |
|---|---|---|
| 30-day throughput | Stat | `metrics.content_throughput_30d` |
| Library size | Stat | `SELECT COUNT(*) FROM content.questions WHERE status='released'` |
| Wave coverage matrix | Heatmap | `metrics.wave_coverage` |
| IRT calibration coverage | Gauge | `metrics.irt_coverage` |
| Leak detection rate | Time-series | `metrics.leak_rate_quarterly` |

## Dashboard D — Engineering Health (CTO)

| Panel | Type | Query |
|---|---|---|
| Audit-event volume | Time-series stacked | `metrics.audit_volume_daily` |
| Hash-chain coverage | Stat | `metrics.hash_chain_coverage` |
| Webhook delivery success | Stat + sparkline | `metrics.webhook_success_rate` |
| ATS sync success rate | Stat per platform | `metrics.ats_sync_success_rate` |
| DR replication health | CloudWatch | `aws/s3 ReplicationLatency` + `aws/rds ReplicaLag` |

## Refresh cadence

| Tier | Cadence | Use case |
|---|---|---|
| Hot (5m) | ARR, DAU, throughput | Live ops dashboards |
| Warm (1h) | MRR trend, IRT coverage, hash-chain coverage | Daily standups |
| Cold (1d) | NRR, leak-rate-quarterly | Quarterly reviews |

## Alerting (Sprint 7.0.2)

| Rule | Condition | Severity | Channel |
|---|---|---|---|
| ARR drop | week-over-week change < -5% | critical | PagerDuty + #incident-page |
| DAU collapse | day-over-day change < -50% | critical | PagerDuty + #incident-page |
| Hash-chain coverage drop | <99% for any 5-minute bucket | high | #incident-comms |
| Leak rate spike | quarterly > 1% of released questions | high | CEO + CTO email |
| Webhook delivery fail | <95% success for any 1-hour bucket | medium | #incident-comms |
| ATS sync fail | any sync `kind` <90% success for 1 hour | medium | #incident-comms |

## Investor metrics page (Sprint 7.0.3)

Public-facing subset at `metrics.qorium.online`:

- Library size (org-wide; no tenant breakdown)
- Wave coverage matrix
- Customer count (org-wide; no PII)
- Hash-chain coverage (trust signal)
- Uptime (from observability stack)

Customer-specific metrics (ARR per tenant, DAU per tenant) NEVER appear
on the public page.
