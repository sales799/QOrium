# Merge Order — PRs #31 → #40 (Autonomous Sprint Run, 2026-05-08)

**Owner:** CTO Office
**Anchor:** Auto-Mode-Remote-Plan-v1 §Phase G
**Status:** ready-for-CEO-merge
**Tile:** `human-prep.merge-the-9-PRs.merge-order-doc` (auto-eligible: true)

This document is the canonical merge sequence for the 10 draft PRs produced
by the `CTO autonomous run — APPROVED` block on 2026-05-08. Every PR is
draft; CI is green on each (PR #32 unblocks the secret-scan job that #31
originally tripped). Merge in the order below and the migrations apply
cleanly in numerical sequence with no manual intervention.

The authorship intent is **safe non-blocking sequencing first, optimal
parallelism second**. PR #32 jumps the queue because it unblocks CI for
every other PR; the audit-log stack (#31 → #33 → #34 → #35) must merge in
order because it is a code stack; the remaining 5 PRs are independent of
each other and can be merged in any order — the order shown is just the
recommended cadence.

---

## TL;DR — paste-and-merge sequence

```
1.  PR #32  chore(ci): replace gitleaks-action@v2 with pinned binary       [unblocks CI]
2.  PR #31  feat(sprint-4.4): Audit Log API v0                              [base of stack]
3.  PR #33  feat(sprint-4.4.1): tenant-scope + tenant_id column             [stacked on #31]
4.  PR #34  feat(sprint-4.4.2): bulk export                                 [stacked on #33]
5.  PR #35  feat(sprint-4.4.3): hash-chaining + verify endpoint             [stacked on #34]
6.  PR #36  feat(sprint-4.5):   Webhooks Service v0                         [independent]
7.  PR #37  feat(sprint-4.6):   ATS Connector Framework v0                  [independent]
8.  PR #38  feat(sprint-5.0):   multi-region terraform skeleton             [IaC only]
9.  PR #39  feat(sprint-5.1):   SOC 2 readiness harness                     [docs + script]
10. PR #40  feat(sprint-7.0):   outcome instrumentation views               [DB views]
```

After all merges: `infra/B7-postgres-migrations/` contains migrations
`0010` through `0015` in order. Run them in numeric order on each
environment (see *Production deploy* below).

---

## PR-by-PR detail

### 1 · PR #32 — CI gitleaks pin

| Field | Value |
|---|---|
| Branch | `claude/ci-replace-gitleaks-action` |
| Why first | Replaces `gitleaks/gitleaks-action@v2` (license-gated; failed on PR #31) with a pinned binary install. Until this is merged the secret-scan job blocks every other PR's required-checks. |
| Migrations | none |
| Service reload | none |
| Risk | minimal — workflow file change only |
| Rollback | revert merge commit; CI returns to action-based scanner (still failing) |
| Smoke | none required; first post-merge PR's CI run validates |

### 2 · PR #31 — Sprint 4.4 Audit Log API v0

| Field | Value |
|---|---|
| Branch | `claude/sprint-4.4-audit-log-api` |
| Migrations | none (consumes existing `audit.events` table) |
| Service reload | `pm2 reload readybank` (new routes: `GET /v1/audit/events`, `/:id`, `/summary`) |
| Risk | low — read-only routes, JWT-cookie-gated |
| Rollback | revert; routes disappear, no schema change to undo |
| Smoke | `curl https://api.qorium.online/v1/audit/events?limit=1` with recruiter cookie; expect 200 + envelope |

### 3 · PR #33 — Sprint 4.4.1 Tenant-scoped reads + `tenant_id` column

| Field | Value |
|---|---|
| Branch | `claude/sprint-4.4.1-audit-tenant-scope` (stacked on #31) |
| Migrations | **`0010_audit_events_tenant_id.sql`** — `ADD COLUMN tenant_id UUID` + partial index. Non-breaking: existing rows keep `tenant_id IS NULL`; SCOPE_CLAUSE `(tenant_id = $1 OR (tenant_id IS NULL AND actor_id = $2))` reads both transitional shapes. |
| Service reload | `pm2 reload readybank` (admin + reference-panel routes start passing tenant_id; audit routes start scoping) |
| Risk | medium — repository contract change. Mitigation: the SCOPE_CLAUSE legacy fallback is the entire point of this sprint; no row needs backfill before ship. |
| Rollback | revert merge; column stays (no data loss); routes return to unscoped reads |
| Smoke | recruiter A cannot see recruiter B's events (`audit.test.ts` `TENANT_A`/`TENANT_B` covers; production smoke = call /v1/audit/events as 2 recruiters from different tenants and confirm row sets disjoint) |

### 4 · PR #34 — Sprint 4.4.2 Bulk export

| Field | Value |
|---|---|
| Branch | `claude/sprint-4.4.2-audit-export` (stacked on #33) |
| Migrations | **`0011_audit_export_jobs.sql`** — `app.audit_export_jobs` table. Adds POST `/v1/audit/events/export`, GET `/:id`, GET `/:id/download`. |
| Service reload | `pm2 reload readybank` |
| Risk | low — async worker uses `setImmediate`; per-tenant active-job cap of 5; 366-day range cap |
| Rollback | revert; export endpoints + table go away (no live tenant data depends on them at this hour) |
| Smoke | request CSV export of trailing 7 days for one tenant; confirm 202 → poll → 200 download with RFC-4180-quoted CSV |

### 5 · PR #35 — Sprint 4.4.3 Hash-chaining + verify endpoint

| Field | Value |
|---|---|
| Branch | `claude/sprint-4.4.3-audit-hash-chain` (stacked on #34) |
| Migrations | **`0012_audit_events_hash_columns.sql`** — `ADD COLUMN hash_current, hash_previous VARCHAR(64)` + partial chain-walk index. Non-breaking: legacy rows have NULL hashes; verifier counts them as `unhashed` not `broken`. |
| Service reload | `pm2 reload readybank` (new route: `GET /v1/audit/verify`; auditEvent INSERT now computes SHA-256 hash_current) |
| Risk | medium — INSERT path now does hash compute. Mitigation: pure-function compute, deterministic, sub-millisecond; no external calls. |
| Rollback | revert; hash columns become orphan but non-breaking; new audit rows stop being hashed |
| Smoke | `GET /v1/audit/verify` returns `{ chain_status: "intact", unhashed_count: <N>, hashed_count: <M> }` |
| Followup | async backfill worker for legacy rows is **NOT** in this PR — deferred to Sprint 4.4.3.1 if needed |

### 6 · PR #36 — Sprint 4.5 Webhooks Service v0

| Field | Value |
|---|---|
| Branch | `claude/sprint-4.5-webhooks-v0` (off main) |
| Migrations | **`0013_webhooks.sql`** — `webhooks.{subscriptions, events, deliveries}` schema |
| Service reload | none (this PR ships the **library** + **schema** only; no routes wired to readybank yet — that's Sprint 4.5.1) |
| Risk | minimal — new schema, new package, no live integration |
| Rollback | revert; tables drop on next migration cycle |
| Smoke | none — there is no live customer-facing surface |

### 7 · PR #37 — Sprint 4.6 ATS Connector Framework v0

| Field | Value |
|---|---|
| Branch | `claude/sprint-4.6-ats-connectors` (off main) |
| Migrations | **`0014_ats_connectors.sql`** — `ats.{connections, sync_runs}` schema |
| Service reload | none (library + Lever stub adapter; no live ATS sync wired yet — that's Sprint 4.6.1+) |
| Risk | minimal — new schema, new package, mock adapter only |
| Rollback | revert; tables drop on next migration cycle |
| Smoke | none |

### 8 · PR #38 — Sprint 5.0 Multi-region IaC

| Field | Value |
|---|---|
| Branch | `claude/sprint-5.0-multi-region-iac` (off main) |
| Migrations | none |
| Service reload | none |
| Risk | none on merge — `terraform apply` is gated on `BOOTSTRAP_AUTHORIZED=true`; halts on cred-drop. Plan-only at merge time. |
| Rollback | revert; .tf files vanish from main |
| Smoke | `terraform plan` from `infra/auto-bootstrap/` produces a non-empty diff for the paired ap-south-1 + ap-southeast-1 VPCs without errors |

### 9 · PR #39 — Sprint 5.1 SOC 2 readiness harness

| Field | Value |
|---|---|
| Branch | `claude/sprint-5.1-soc2-harness` (off main) |
| Migrations | none |
| Service reload | none |
| Risk | minimal — adds `governance/soc2/` docs + `services/readybank/src/scripts/soc2-evidence-pull.ts`. The script is a developer-run CLI; not invoked by any service or cron yet. |
| Rollback | revert |
| Smoke | `pnpm --filter @qorium/readybank exec tsx src/scripts/soc2-evidence-pull.ts --dry-run` exits 0 |

### 10 · PR #40 — Sprint 7.0 Outcome instrumentation

| Field | Value |
|---|---|
| Branch | `claude/sprint-7.0-outcome-instrumentation` (off main) |
| Migrations | **`0015_outcome_metrics_views.sql`** — `CREATE SCHEMA metrics` + 9 read-only views (tenant_arr, tenant_mrr, dau_rolling, mau_rolling, content_throughput_30d, wave_coverage, leak_rate_quarterly, irt_coverage, audit_volume_daily, hash_chain_coverage). |
| Service reload | none (views only; Grafana panels live in Sprint 7.0.1) |
| Risk | minimal — read-only views over canonical tables. Some views return 0 rows until `app.subscriptions` is populated post first 3 logos — that's correct, not broken. |
| Rollback | revert; `DROP SCHEMA metrics CASCADE` if needed |
| Smoke | `psql -c "SELECT * FROM metrics.content_throughput_30d;"` returns one row |

---

## Migration ordering

The migrations **must** be applied in this exact order on every environment:

```
0010_audit_events_tenant_id.sql
0011_audit_export_jobs.sql
0012_audit_events_hash_columns.sql
0013_webhooks.sql
0014_ats_connectors.sql
0015_outcome_metrics_views.sql
```

`@qorium/db` migration runner orders by filename, so as long as merges happen
in the order above the runner picks up new migrations correctly. **Do not
rename, reorder, or insert a migration between these numbers.** If a future
sprint needs to retro-fix migration 0010, it ships as `0010a_*.sql` per the
existing convention.

---

## Production deploy steps

After **all 10 PRs** are merged to `main`:

```bash
# 1. Pull the merged tip
ssh vps
cd /home/qorium/QOrium
git pull origin main

# 2. Apply migrations in number order (idempotent — runner skips applied)
pnpm --filter @qorium/db migrate

# 3. Reload the only service that picks up new code paths
pm2 reload readybank
pm2 logs readybank --lines 50    # confirm clean boot

# 4. Smoke checks (with a recruiter JWT cookie set)
curl -fsS https://api.qorium.online/healthz                  # 200
curl -fsS https://api.qorium.online/v1/audit/events?limit=1  # 200 + envelope
curl -fsS https://api.qorium.online/v1/audit/verify          # 200 + chain_status
psql $QORIUM_DATABASE_URL -c "SELECT * FROM metrics.content_throughput_30d;"
```

`infra/auto-bootstrap/multi-region.tf` from PR #38 stays plan-only — no
`terraform apply` until cred-drop unlocks `BOOTSTRAP_AUTHORIZED=true`.

---

## Smoke-test checklist (post-merge, post-deploy)

| # | Check | Pass criterion |
|---|---|---|
| 1 | `/healthz` 200 | live |
| 2 | `/v1/audit/events?limit=1` with recruiter cookie | 200 + envelope shape `{ events: [...], cursor: ... }` |
| 3 | `/v1/audit/events/:id` known event | 200 + tenant_id present |
| 4 | `/v1/audit/events/export` POST CSV trailing 7d | 202 + job id |
| 5 | `/v1/audit/events/export/:id` poll | eventually 200 + status `completed` |
| 6 | `/v1/audit/events/export/:id/download` | 200 CSV with `Content-Type: text/csv` |
| 7 | `/v1/audit/verify` | 200 + `chain_status: "intact"` |
| 8 | Cross-tenant isolation | recruiter A's `/v1/audit/events` does not contain any of recruiter B's tenant rows |
| 9 | `audit.events.hash_current` not null on rows inserted post-deploy | `psql -c "SELECT count(*) FROM audit.events WHERE hash_current IS NOT NULL AND occurred_at > now() - interval '5 min';"` > 0 |
| 10 | `metrics.dau_rolling` view returns rows | `psql -c "SELECT day, dau FROM metrics.dau_rolling LIMIT 5;"` |
| 11 | `pnpm --filter @qorium/webhooks test` from main HEAD | 43 tests green |
| 12 | `pnpm --filter @qorium/ats-connectors test` from main HEAD | 23 tests green |

If any check fails: pause; run rollback for the latest-merged PR (`git
revert -m 1 <merge-commit>`) and re-deploy. Migrations 0010–0012 are
non-breaking on rollback (column stays, routes go away). Migrations 0013–0015
are net-new schemas safe to leave.

---

## Stop conditions during merge run

Per `governance/Auto-Mode-Remote-Plan-v1.md` §stopConditions, halt the
merge run and contact CTO Office before proceeding if:

- **Required checks unexpectedly red** on a PR that was green at draft time
  (someone may have force-pushed; re-review)
- **Migration runner reports drift** between local file order and applied
  history (means someone applied a migration out-of-band — investigate)
- **`/v1/audit/verify` returns `chain_status: "broken"`** post-deploy of
  PR #35 (means hash-chain is corrupt; rollback PR #35 immediately)
- **Production credentials drop** in mid-merge run (cred-drop unblocks
  Sprint 5.0 apply path; pause merge so the apply can be planned)

---

## What this doc does **not** cover

- Webhook subscription wiring to `audit.events` triggers (Sprint 4.5.1)
- Live ATS sync against a real Lever org (Sprint 4.6.1+; cred-bound)
- `terraform apply` of `multi-region.tf` (cred-drop bound)
- SOC 2 evidence-pull cron registration (Sprint 5.1.1)
- Grafana panel provisioning from the spec docs (Sprint 7.0.1)

These are the next-up follow-on sprints; tracked separately as
`engineering-complete-cred-bound` tiles in `governance/dashboard.json`.

---

_Prepared by CTO Office under MANTHAN human-lane acceleration plan, 2026-05-08._
