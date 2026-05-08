# QOrium Disaster Recovery Runbook

**Owner:** CTO Office + On-call SRE
**Status:** Sprint 4.2 spec — IaC committed; cred-bound apply on `BOOTSTRAP_AUTHORIZED=true ./apply.sh pitr`.
**Filed:** 2026-05-08

---

## Failure modes covered

| Severity | Failure mode | Recovery |
|---|---|---|
| sev-1 | Database corruption (logical) | PITR restore to point before corruption |
| sev-1 | Region outage (primary AZ-pair down) | Cross-region snapshot restore |
| sev-1 | Accidental DELETE / DROP | PITR restore + selective re-merge |
| sev-2 | Single-AZ failure | Multi-AZ failover (auto, no on-call) |
| sev-2 | Replica lag spike | Promote replica or rebuild |
| sev-3 | Single bad row | Surgical repair via psql + audit log |

---

## RPO / RTO targets

| Metric | Target | Mechanism |
|---|---|---|
| RPO | ≤ 5 minutes | PITR continuous backup |
| RTO same-region | ≤ 60 minutes | aws rds restore-db-cluster-to-point-in-time |
| RTO cross-region | ≤ 2 hours | Backup vault destination + restore |
| Compliance retention | 7 years | S3 Deep Archive lifecycle |

---

## Decision tree

```
Incident detected
       │
       ▼
Symptom = data corruption?
   YES → use PITR restore (target-time = last-known-good)
   NO  ↓
       │
Symptom = region-wide outage?
   YES → use cross-region restore from destination vault
   NO  ↓
       │
Symptom = single-AZ?
   YES → wait 5 min for AWS auto-failover; if no recovery, manual promote replica
   NO  ↓
       │
Symptom = bad row / single-table?
   YES → surgical repair (DO NOT restore whole DB; impacts other writes)
   NO  ↓
       │
Escalate to CTO Office
```

---

## On-call procedure: PITR restore

### Pre-restore checklist

1. **Identify target time.** Coordinate with stakeholders — what was the last known-good moment? Audit log + monitoring should narrow this to a 5-minute window.
2. **Pick target cluster name.** Format: `qorium-restore-YYYY-MM-DD-HHMMSS`. Verify it doesn't already exist.
3. **Notify stakeholders.** Statuspage update; Slack `#incident-room`; CTO + CEO if sev-1.
4. **Freeze writes** if possible. Set service to read-only mode via feature flag to prevent additional damage during restore.

### Restore execution

```bash
# Dry-run first — ALWAYS
./infra/B7-postgres-migrations/scripts/restore-pitr.sh \
  --cluster qorium-prod \
  --target-time "2026-05-08T14:32:00Z" \
  --new-cluster qorium-restore-2026-05-08-143200

# Verify dry-run output. If correct, re-run with --execute:
./infra/B7-postgres-migrations/scripts/restore-pitr.sh \
  --cluster qorium-prod \
  --target-time "2026-05-08T14:32:00Z" \
  --new-cluster qorium-restore-2026-05-08-143200 \
  --execute
```

### Post-restore verification

1. **Cluster status:** wait for `available` in RDS console / CLI.
2. **Smoke tests** against the restored cluster's endpoint:
   - Read 5 known-good question UUIDs from `content.questions`.
   - Read 5 recent rows from `app.recruiters`.
   - Verify schema version matches expectations (run `\dt content.*` and confirm migration `0009_stack_vault.sql` is applied).
3. **Audit log review:** verify continuity around the restore-target time.
4. **Sample re-run:** pick 1 customer's last query → verify identical result.

### Cutover

1. Update service env (DATABASE_URL or pgbouncer endpoint) to point at new cluster.
2. Roll services 10% → 50% → 100% over 30 min, monitoring error rate.
3. **Do NOT decommission old cluster** until 24h pass without rollback signal.
4. Update statuspage to "monitoring" while soaking.

### Rollback path

If the restored DB shows issues:
1. Roll services back to old cluster endpoint.
2. Decommission the failed restore cluster (`aws rds delete-db-cluster --skip-final-snapshot`).
3. Try again with a different target-time (further back, or further forward).

---

## On-call procedure: cross-region restore

Same as PITR restore but via the destination vault (`qorium-destination-vault` in `ap-southeast-1` Singapore by default). Add `--region ap-southeast-1` to all AWS CLI calls.

Cross-region adds 30-60 min vs same-region due to KMS-key cross-region copy + S3 download for older snapshots.

---

## Comms template (statuspage)

```
[Investigating] We are investigating reports of database errors affecting
some QOrium customers. Engineering is on-call. We will update within 15 min.

[Identified] We have identified the issue and are restoring service.
Estimated time to recovery: 60 minutes. We will update at 15-minute intervals.

[Monitoring] Service is restored from a recent point-in-time backup.
We are monitoring closely; the system may run in a slightly stale read-only
mode for the next 30 minutes while we verify integrity.

[Resolved] Service is fully restored. We are conducting a postmortem and
will share findings within 5 working days.
```

---

## Postmortem requirement (sev-1)

Within 5 working days of any sev-1, publish to `governance/postmortems/`:
- Timeline (incident detected, page sent, on-call responded, mitigation started, restore-execute, restore-complete, cutover-complete, resolved).
- Five-Whys root cause.
- Customer impact summary (count + duration + revenue if quantifiable).
- Concrete commitments with owners + dates (typically 3-5 items).
- Blameless framing — focus on systems + processes, not individuals.

---

## Drill cadence

- **Quarterly tabletop**: walk through this runbook with a fictional incident; identify gaps; update.
- **Annual restore drill**: actually run a PITR restore in a non-prod environment; measure RTO.
- **Continuous validation**: backup-job-failure CloudWatch alarm fires within 1 hour of any failed automated backup.

---

## Cred-drop checklist (CEO action — human-bound)

Before `BOOTSTRAP_AUTHORIZED=true ./apply.sh pitr`:

- [ ] AWS account: production RDS / Aurora cluster `qorium-prod` exists or is intentionally being created
- [ ] AWS Backup service enabled in primary + backup regions
- [ ] IAM role for AWS Backup created with required scope
- [ ] Cross-region KMS keys policy reviewed by security
- [ ] Lifecycle retention (7y) confirmed against compliance + finance (storage cost projection)
- [ ] On-call rotation includes someone trained on this runbook

Once the box-tick set is true, the CEO runs:

```
cd infra/auto-bootstrap
BOOTSTRAP_AUTHORIZED=true ./apply.sh pitr
```

---

## Done-when (Sprint 4.2)

- [x] `terraform validate pitr.tf` clean.
- [x] `restore-pitr.sh` dry-run mode + execute mode + syntax check.
- [x] DR runbook (this document) committed.
- [x] Decision tree + comms template committed.
- [ ] **Cred-drop + apply** (human-bound; CEO action).
- [ ] First quarterly tabletop drill scheduled.

Per Auto-Mode plan: this PR engineering-completes the tile; apply itself is human-bound and the dashboard reflects this with status `engineering-complete-cred-bound`.
