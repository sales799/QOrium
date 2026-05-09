# SOC 2 Evidence Collection Runbook (Sprint 5.1)

Quarterly cadence; owner = CTO Office. The auditor (Y2 onwards)
reviews these evidence packages over a 6-month observation window.

## Quarterly cadence

| Window | Pull date | Owner | Output |
|---|---|---|---|
| Q1 (Jan–Mar) | first business day of April | CTO Office | `s3://qorium-soc2-evidence/q1-{year}.json` |
| Q2 (Apr–Jun) | first business day of July | CTO Office | `s3://qorium-soc2-evidence/q2-{year}.json` |
| Q3 (Jul–Sep) | first business day of October | CTO Office | `s3://qorium-soc2-evidence/q3-{year}.json` |
| Q4 (Oct–Dec) | first business day of January | CTO Office | `s3://qorium-soc2-evidence/q4-{year}.json` |

## What each pull captures

Per `services/readybank/src/scripts/soc2-evidence-pull.ts`:

```jsonc
{
  "window": { "start": "2026-01-01", "end": "2026-03-31" },
  "audit_summary": {
    "total_events": 152340,
    "by_category": {
      "auth": 41210,        // CC6.2
      "leak": 28,           // CC7.1
      "api_key.rotation": 14, // CC6.1
      "stack_vault": 1893,  // SO-10
      "compliance": 9       // CC2.3
    }
  },
  "api_keys": {
    "total_active": 87,
    "rotated_in_window": 14,
    "expired_revoked": 3
  },
  "migrations_applied": [
    "0010_audit_events_tenant_id.sql",
    "0011_audit_export_jobs.sql",
    "0012_audit_events_hash_columns.sql",
    "0013_webhooks.sql",
    "0014_ats_connectors.sql"
  ],
  "incidents": {
    "opened": 2,
    "closed": 2,
    "median_resolution_hours": 1.4
  },
  "anti_leak": {
    "detections_total": 28,
    "confirmed": 6,
    "rotated_questions": 6
  },
  "irt_auto_fail_events": 0,
  "gatekeeper_runs": {
    "total": 142,
    "min_score": 88,
    "median_score": 94
  },
  "replication_health": {
    "rpo_p95_seconds": 78,
    "rto_simulated_seconds_q1_drill": 2840
  },
  "hash_chain_verifications": {
    "tenants_verified": 1,
    "breaks_detected": 0,
    "unmaterialized_rows": 0
  }
}
```

## How to run a pull

```bash
# Run from VPS or any host with DATABASE_URL + S3 creds.
pnpm --filter @qorium/readybank exec \
  ts-node src/scripts/soc2-evidence-pull.ts \
  --start 2026-01-01 \
  --end 2026-03-31 \
  --out /tmp/soc2-q1-2026.json

aws s3 cp /tmp/soc2-q1-2026.json \
  s3://qorium-soc2-evidence/q1-2026.json \
  --acl bucket-owner-full-control
```

## Auditor review checklist

For each quarterly package:

1. **Spot-check 3 random tenants** — verify the same evidence query
   is reproducible by running the SQL noted in `control-mapping.md`.
2. **Walk the hash chain** — call `GET /v1/audit/verify` for each
   spot-checked tenant; expect `{ valid: true, breaks: [] }`.
3. **Cross-reference incidents** — every entry in `governance/QUEUE.md`
   between `start` and `end` must appear in `incidents.opened`.
4. **Migration evidence** — every `*.sql` in `infra/B7-postgres-migrations/`
   created in the window must appear in `migrations_applied`.

## Exceptions handling

If any control evidence is missing:

1. Open an entry in `governance/QUEUE.md` with timestamp + reason.
2. Surface to CEO (CC1.5 enforces accountability).
3. Schedule remediation in next sprint cadence.

The auditor accepts documented exceptions; un-documented gaps are
findings.

## Cred-drop checklist

Before the first pull:

- [ ] AWS credentials with `s3:PutObject` on `qorium-soc2-evidence`
- [ ] DATABASE_URL pointing at production replica (read-only)
- [ ] Bucket created with versioning + cross-region replication
      (Sprint 5.0 multi-region.tf creates the replica bucket)
- [ ] Object Lock in compliance mode for ≥ 7 years (DPDPA + SOC 2)

## What this runbook does NOT cover

- The actual SOC 2 audit engagement (auditor selection, scoping,
  pricing) — CEO action.
- Customer-facing trust portal (status page + audit reports). Sprint
  5.1.4 ships the portal.
