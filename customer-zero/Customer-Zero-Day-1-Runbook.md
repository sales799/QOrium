# Customer Zero Day-1 Operational Runbook

**Audience:** CTO Office on-call + SME Lead + Senior Engineer #1 (when hired)
**Trigger:** First production candidate hits the QOrium API
**Authored:** 2026-05-03 (Sprint 1.8)
**References:** `customer-zero/Customer-Zero-Pre-Launch-Checklist-v1.md` (canonical
checklist; this doc is the operational runbook that maps each item to a
verifier command + an on-call action).

This runbook is **operational**, not exhaustive. It is the script the on-call
runs on Day-1 to confirm the Phase 1 stack is alive end-to-end. The pre-
launch checklist remains the source of truth for what must be true before
Day-1 is even attempted.

---

## §0. Pre-flight (T-30 min)

Run from a workstation with `DATABASE_URL`, `REDIS_URL`, and `JUDGE0_URL`
set to the production values:

```
make ready                    # qorium-smoke ready
```

Expected output:

```
QOrium deployment readiness — smoke report
------------------------------------------------------------
  ✓  [PASS]  postgres.ping                 12 ms
  ✓  [PASS]  postgres.schema              45 ms
  ✓  [PASS]  tcp.redis                     8 ms
  ✓  [PASS]  http.judge0                  120 ms

Import graph (cross-workspace public APIs)
------------------------------------------------------------
  ✓  @qorium/leak-crawler::extractDistinctiveNGrams
  ✓  @qorium/leak-crawler::scoreEvidence + classifyEvidence
  ✓  @qorium/irt-calibration::fit2PL + classifyDrift
  ✓  @qorium/irt-calibration::defaultGuessingForFormat
  ✓  @qorium/judge0-orchestrator::isSupportedLanguage + scoreSubmission
  ✓  @qorium/judge0-orchestrator::computeAntiFraudSignals
  ✓  @qorium/testforge-orchestrator::nextActionFor
  ✓  @qorium/testforge-orchestrator::scoreEnsemble
  ✓  @qorium/testforge-orchestrator::runBenchmark (empty)

Summary: 13 pass, 0 fail, 0 skip — 215 ms
```

If anything is `[FAIL]`, **abort Day-1**. Diagnose using the failure
detail string (e.g. `connection refused`, `missing tables: ...`).

---

## §1. PM2 service start sequence (T+0)

On the Mac Mini sandbox host:

```
pm2 start /opt/qorium/ecosystem.config.js --env production
pm2 save
pm2 list
```

Expected services (per `infra/B10-ecosystem.config.js`):

| Service                          | Port | Mode    | Start order |
| -------------------------------- | ---- | ------- | ----------- |
| qorium-api                       | 5101 | cluster | 1           |
| qorium-jd-forge                  | 5102 | cluster | 2 (Phase 2) |
| qorium-stack-vault               | 5103 | cluster | 3 (Phase 2) |
| qorium-admin                     | 5104 | fork    | 4           |
| qorium-leak-crawler              | -    | fork    | 5 (cron-driven) |
| qorium-irt-calibration           | -    | fork    | 6 (cron-driven) |
| qorium-judge0-orchestrator       | 5108 | fork    | 7           |
| qorium-testforge-orchestrator    | 5110 | fork    | 8           |

Verifier (from any host with network access to the VPS):

```
curl -fs https://api.qorium.io/healthz | jq .
curl -fs https://admin.qorium.online/healthz | jq .
```

Both must return `{"status":"ok",...}`.

---

## §2. First-candidate smoke (T+5)

A hand-run end-to-end: insert a synthetic question via the admin UI,
submit a synthetic candidate response via the API, observe the
orchestrator pipeline graduate it to `released`.

```
# 1. Create a coding question via admin UI (manual)
#    → status moves to sme_review

# 2. SME accepts (admin UI button)
#    → testforge_status becomes 'accepted'

# 3. Trigger one orchestrator pass:
pnpm --filter @qorium/testforge-orchestrator start
#    → expect a JSON line { event: "testforge.report", priorsComputed: 1, ... }
#    → testforge_status becomes 'calibrating'

# 4. Submit ~30 candidate responses against the question (ReadyBank + Judge0)
#    → content.responses fills

# 5. Trigger nightly IRT batch:
pnpm --filter @qorium/irt-calibration start
#    → JSON line { event: "calibration.report", questionsCalibrated: 1, ... }

# 6. Trigger another orchestrator pass:
pnpm --filter @qorium/testforge-orchestrator start
#    → expect { event: "testforge.report", graduated: 1, ... }
#    → testforge_status === 'released' AND status === 'released'
#    → ReadyBank `GET /v1/questions/{uuid}` now returns the question
```

If steps 5–6 don't graduate the question, query
`content.calibration_history` and `content.testforge_runs` for the run-id
trail; the `flag` column on history rows tells you why.

---

## §3. Cron schedules (must be active before Day-1 sleep)

Per `infra/B10-ecosystem.config.js`:

| Job                      | Cron (IST) | Spec |
| ------------------------ | ---------- | ---- |
| qorium-leak-crawler      | 02:00 daily | `infra/Anti-Leak-Engine-v0-Design.md` §2.1 |
| qorium-irt-calibration   | 03:00 daily | `infra/IRT-Calibration-Pipeline-v0-Spec.md` §7 |

Verify PM2 has the cron entries:

```
pm2 show qorium-leak-crawler | grep cron_restart
pm2 show qorium-irt-calibration | grep cron_restart
```

A bias DIF monthly batch (first Wed 04:00) is **not yet wired** — defer to
Sprint ≥1.8.x once Reference Panel hits N≥200.

---

## §4. On-call escalation triggers

| Signal                                                              | Action                                                                                                |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `qorium-api` healthz returns non-200 for >2 min                     | PagerDuty (on-call); restart via `pm2 restart qorium-api`; check Sentry for stack trace               |
| Judge0 unreachable (`pm2 logs qorium-judge0-orchestrator` shows 5xx) | Page Senior Eng; verify Mac Mini Tailscale link via `tailscale status`; check `docker ps` on host    |
| `content.testforge_runs.status='failed'` for >3 consecutive passes  | SME Lead daily queue; investigate via `output` column                                                 |
| Calibration drift flag spike (>5 `drift_b` flags in one batch)      | CDO + I/O Psych contractor; review with last cohort's response data                                   |
| Leak alert with `severity='critical'`                               | SME Lead immediate review; if confirmed, manually trigger variant generation (currently SME-Lead-only) |
| AI plagiarism benchmark drops below 93%                              | **HALT NEW RELEASES** (SO-22 auto-fail); CTO + CEO joint sign required to resume                     |

---

## §5. Rollback procedures

### 5.1 PM2 rollback

```
pm2 reload all
pm2 list                                # confirm pid changes
curl -fs https://api.qorium.io/healthz  # confirm health restored
```

If the new code is broken:

```
cd /opt/qorium
git checkout HEAD~1                     # OR a known-good tag
pnpm install --frozen-lockfile && pnpm build
pm2 reload all
```

### 5.2 Migration rollback

Each migration in `infra/B7-postgres-migrations/` carries a rollback
SQL block as a trailing comment. Apply manually (no automated `down`
runner in v0):

```
psql "$DATABASE_URL" < <(grep -A 100 'Rollback' infra/B7-postgres-migrations/0006_testforge.sql | sed 's/^-- //g')
```

Then mark the migration as un-applied in `public.pgmigrations`:

```
DELETE FROM public.pgmigrations WHERE name = '0006_testforge';
```

### 5.3 PostgreSQL hot-restore

If the database is corrupted: failover to the last automated WAL
snapshot (per VPS provider's PITR feature). Do NOT attempt manual
`pg_dump` restore during business hours.

---

## §6. End-of-Day-1 close-out

```
make ready --json > /tmp/day1-final-readiness.json   # capture for record
pm2 save                                              # persist process list
pm2 logs --lines 200 > /tmp/day1-pm2-logs.txt         # capture for record

# Append to BUILD_LOG.md:
echo "Day 1 closed: $(date -u +%Y-%m-%dT%H:%M:%SZ); ready=passing; first candidate id=<>"
```

Send the `/tmp/day1-*` files to CEO + SME Lead. File a J6 Friday Eng
review entry per `governance/Operating-Rituals-v1.md`.

---

## §7. Halt conditions for activation (REQUEST from CEO)

These remain blocked until CEO action; **do not** attempt Day-1 without
each one resolved:

- **MSG91 OTP credentials** — for admin sign-in (see `CTO-DELTA-admin-auth-provider.md`)
- **Talpro India onboarding** — Customer Zero tenant + first 100 candidates seeded
- **Mac Mini Tailscale** — Judge0 reachable from VPS via `judge0.ts.net:2358`
- **Serper.dev API key** — for live anti-leak crawls (until then, leak crawler runs but no source polling occurs)
- **JUDGE0_AUTH_TOKEN** — for the production Judge0 instance

If any is unresolved at T-30, **abort Day-1**.

---

*End of Customer-Zero-Day-1-Runbook. Version: Sprint 1.8 ship.*
