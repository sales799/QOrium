# Multi-Region DR Runbook (Sprint 5.0)

**Status:** v0 · engineering-complete-cred-bound
**Stack:** `infra/auto-bootstrap/multi-region.tf`
**RPO:** 15 minutes (Postgres replica lag + S3 CRR lag)
**RTO:** 60 minutes (manual cutover with automated checks)

This runbook complements:

- `governance/dr-runbook.md` (Sprint 4.2 — same-region PITR)
- `governance/observability-runbook.md` (Sprint 4.1 — alerting)

## 1 · When to invoke this runbook

Composite alarm `qorium-primary-region-down` has fired (≥ 3 consecutive
`/healthz` failures over 90 seconds), AND the on-call engineer has
verified the failure is region-scoped (not just one PM2 process).

If only one process is down → `pm2 restart` per `dr-runbook.md`.
If the whole region is down → continue here.

## 2 · Cutover decision tree

```
┌─ Composite alarm fires
│
├─ STEP 1 — Verify region failure (5 min)
│   ☐ ssh into Hostinger VPS (primary). Failed? → continue.
│   ☐ Check Hostinger status page for ap-south-1. Outage? → continue.
│   ☐ Check AWS Health Dashboard for ap-south-1.
│
├─ STEP 2 — Decide cutover (5 min)
│   ☐ Estimated outage > 30 min? → cut over.
│   ☐ Estimated outage < 30 min? → wait + monitor; do not cut.
│   ☐ Customer-bound deadline within 1 hour? → cut over.
│
├─ STEP 3 — Notify (parallel; 5 min)
│   ☐ status.qorium.online — "primary region degraded; cutover in progress"
│   ☐ #incident-comms Slack channel — full timeline
│   ☐ Customer Zero (Talpro) — direct DM to delivery head
│
├─ STEP 4 — Promote DR replica to primary (15 min)
│   ☐ aws rds promote-read-replica --db-instance-identifier qorium-dr-replica
│       (cred-bound; halts until Sprint 5.0.1 wires the replica)
│   ☐ Wait for state=available
│   ☐ Capture new endpoint into .env.bootstrap (DR_DATABASE_URL)
│
├─ STEP 5 — Re-point Route53 (5 min)
│   ☐ aws route53 change-resource-record-sets ...
│       Update api.qorium.online → DR ALB
│   ☐ DNS TTL is 60s; expect global propagation < 5 min
│
├─ STEP 6 — Smoke test (10 min)
│   ☐ curl https://api.qorium.online/healthz → 200
│   ☐ curl /readyz → 200
│   ☐ Recruiter login → 200 + cookie set
│   ☐ /v1/audit/events with test JWT → 200
│
└─ STEP 7 — Declare cutover complete (5 min)
    ☐ Update status.qorium.online — "operating from DR region"
    ☐ Append entry to governance/QUEUE.md with timeline
    ☐ Slack #incident-comms — closing summary

TOTAL: ~50 min cutover (under the 60-min RTO target)
```

## 3 · Failover triggers — composite alarm wiring

| Signal | Threshold | Source |
|---|---|---|
| `/healthz` consecutive failures | ≥ 3 | Route53 health check |
| `/healthz` evaluation period | 90 s | Route53 |
| Composite alarm | `qorium-primary-region-down` | CloudWatch |
| Notification | PagerDuty + Slack #incident-page | Sprint 4.1 observability stack |

## 4 · RPO / RTO targets

| Target | Value | Mechanism |
|---|---|---|
| **RPO (data loss window)** | ≤ 15 min | Postgres async replica + S3 CRR |
| **RTO (downtime)** | ≤ 60 min | This cutover runbook |
| **Observed replica lag (alarm)** | > 10 min | CloudWatch alarm `qorium-replica-lag` (Sprint 5.0.1) |
| **Observed CRR lag (alarm)** | > 30 min | S3 `ReplicationLatency` metric |

## 5 · Failback (return to primary)

Run the same decision tree in reverse, but with two extra steps:

1. **Reverse-replicate** any writes that landed on DR back to the
   recovered primary. Use `pg_dump --data-only` from DR + COPY to
   primary. Bound by writes-since-cutover.
2. **Update sync_runs / webhooks.deliveries** state — both tables have
   `tenant_id` scoping; no cross-tenant leakage during cutover.

Schedule failback during a low-traffic window (typically Sunday 02:00 IST).

## 6 · Quarterly drill cadence

- **Q1 / Q3** (Mar / Sep): Full simulated cutover in staging.
- **Q2 / Q4**: Tabletop walk-through with on-call rotation.
- Drill output appended to this runbook + dashboard `runs[]`.

## 7 · Cred-drop checklist (CEO action)

Items required before `terraform apply` of `multi-region.tf` succeeds:

- [ ] AWS credentials in `~/.aws/credentials` profile `qorium-prod`
      with cross-region IAM (RDS replicate, S3 CRR, Route53 records).
- [ ] `BOOTSTRAP_AUTHORIZED=true` in `.env.bootstrap`.
- [ ] PagerDuty integration key for cutover alerts.

Until all three land, the apply step in `infra/auto-bootstrap/apply.sh`
halts cleanly with a clear message.

## 8 · What this runbook does NOT cover

- Multi-region active/active (Sprint 6.0).
- Geographic data-residency (Sprint 6.1; e.g., EU customer data confined
  to eu-west-1).
- Cross-cloud DR (e.g., AWS primary + GCP DR). Out of scope for v0.

---

_Maintained alongside `governance/dr-runbook.md`. Update whenever
`infra/auto-bootstrap/multi-region.tf` materially changes._
