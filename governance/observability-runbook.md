# QOrium Observability Runbook

**Owner:** CTO Office
**Status:** Sprint 4.1 spec — IaC committed; apply gated on cred-drop per `infra/auto-bootstrap/observability.tf`.
**Filed:** 2026-05-08

---

## Stack

| Layer | Vendor | Endpoint var | Notes |
|---|---|---|---|
| Metrics | Grafana Cloud Mimir | `OTEL_EXPORTER_OTLP_ENDPOINT` (gRPC) | Free tier sufficient for alpha. Upgrade trigger: >10K active series. |
| Logs | Grafana Cloud Loki | same OTLP endpoint | Per-service `service.name` resource attribute partitions in dashboards. |
| Traces | Grafana Cloud Tempo | same OTLP endpoint | Sampled at 10% in dev, 1% in prod (configurable per route). |
| Errors | Sentry | `SENTRY_DSN` (per service) | Outputs of observability.tf populate per-service DSNs. |

OpenTelemetry Collector deployed alongside services; collects OTLP from each pod and forwards to Grafana Cloud + Sentry.

---

## SLOs (multi-burn-rate alerting)

Per the auto-mode plan §3 stop conditions: SLOs surface human-actionable signals only — never auto-page on transient blips.

| Service | SLO | Window | Error budget |
|---|---|---|---|
| ReadyBank API | 99.9% requests <500ms | 30d | 43 min/30d |
| ReadyBank API | 99.95% non-5xx | 30d | 22 min/30d |
| Anti-Leak scan | 95% scans complete in <10min | 30d | (tier-2 SLO) |
| JD-Forge job | 99% jobs complete in <60s (post cred-drop) | 30d | (tier-2 SLO) |

Alerting uses the Google SRE multi-burn-rate pattern: fast burn (1h × 14.4×) AND slow burn (6h × 6×) must both fire before paging. Single-window spikes auto-resolve.

---

## Pre-built dashboards (committed to `infra/auto-bootstrap/grafana-dashboards/` once apply runs)

1. **Platform Overview** — request rate, latency p50/p95/p99, error rate per service, by route.
2. **IRT Auto-Fail** — per-question pass-rate trend; SO-21 violations queued for SME.
3. **Anti-Leak Severity** — distribution by severity tier; severity-3+ alarms.
4. **JD-Forge Job Queue** (cred-bound) — queue depth, p99 generation latency, error rate.
5. **Stack-Vault Tenant Health** — per-tenant request rate, watermark render counts (forensic baseline).
6. **DORA / Deploy Health** — deploy frequency, MTTR, change-fail rate.

---

## Incident response checklist

1. **Wake-up signal:** PagerDuty page sourced from a multi-burn-rate alarm (NEVER from a single-spike).
2. **First 5 minutes:** open the Platform Overview dashboard + Sentry feed for the affected service. Identify whether the root signal is latency, error rate, or saturation.
3. **First 15 minutes:** decide rollback vs investigate. Rollback if a deploy went out in the last 30 min AND the metric regressed at the same time.
4. **Comms:** statuspage update at minute 5 (acknowledged) and every 15 min thereafter until resolved.
5. **Post-incident:** within 5 days, publish a blameless postmortem to `governance/postmortems/` with five-whys + concrete commitments + dates.

---

## Cred-drop checklist (CEO action — human-bound)

Before `BOOTSTRAP_AUTHORIZED=true ./apply.sh observability`:

- [ ] Grafana Cloud account created; admin invite sent to CTO Office
- [ ] Grafana Cloud API token issued (scope: stack-create, dashboard-write); placed in `.env.bootstrap` as `TF_VAR_grafana_cloud_api_token`
- [ ] Sentry organization created; auth token issued; placed in `.env.bootstrap` as `TF_VAR_sentry_auth_token`
- [ ] DNS / domain ownership verification done if Grafana Cloud requires
- [ ] Per-service `OTEL_EXPORTER_OTLP_ENDPOINT` + `SENTRY_DSN` env vars dropped to runtime configs
- [ ] Helm chart for OpenTelemetry Collector reviewed + tagged for deploy
- [ ] First-week alarm budget agreed (no mass alarms day 1; tune over 2 weeks)

Once the box-tick set is true, the CEO runs:

```
cd infra/auto-bootstrap
BOOTSTRAP_AUTHORIZED=true ./apply.sh observability
```

The agent will NEVER call this command. The script hard-fails without the env var.

---

## Stop conditions on this work (§3 of Auto-Mode Plan)

- **Cred-drop required.** All Terraform `apply` paths halt without `BOOTSTRAP_AUTHORIZED=true`.
- **Monetary commitment.** Grafana Cloud Pro / Sentry Team plans require purchase decision; the agent does not commit.
- **Outbound message.** Inviting humans to the Grafana Cloud / Sentry org requires CEO action.

---

## Tier-2 alerts (informational; not page-worthy)

- IRT auto-fail count > 0 in last 24h → SME queue alert (Slack `#sme-queue`).
- Anti-leak severity-2 finding → SME review queue (Slack `#anti-leak`).
- Audit-log gap > 5 min → ops team Slack.
- Stack-Vault watermark render rate ≥ 10× tenant baseline → tenant-success Slack channel.

---

## Audit + retention

- Logs: 30d hot, 1y warm-archive (Grafana Cloud), 7y cold S3 (compliance).
- Metrics: 30d active series, 1y aggregated downsampled.
- Traces: 7d sampled.
- Sentry events: 90d (default; upgrade to extend if needed).

---

## Done-when (Sprint 4.1)

- [x] `terraform validate observability.tf` clean.
- [x] OpenTelemetry SDK init module shipped (`services/readybank/src/observability/otel.ts`).
- [x] No-op semantics covered by unit tests (4).
- [x] Runbook committed.
- [ ] **Cred-drop + apply** (human-bound; CEO action).
- [ ] First 7-day soak with alarms tuned (post-cred-drop).

Per Auto-Mode plan: this PR engineering-completes the tile; the apply itself is human-bound and the dashboard reflects this with status `engineering-complete-cred-bound`.
