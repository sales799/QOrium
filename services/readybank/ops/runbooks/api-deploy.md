# Runbook — ReadyBank API Deploy

**Owner:** CTO Office · **Authority:** Constitution SO-3 (Quality Gate) + ADR 0001 (Express stack) + ADR 0002 (URL versioning) · **Companion runbook:** `cto/runbooks/deploy-rollback.md` (parallel for marketing app)
**Cadence:** Per release; cron-monitored for health

---

## When to use this runbook

When deploying or rolling back changes to the `@qorium/readybank` service. The runbook covers:

1. Standard deploys (new code merged to `main`)
2. Database migrations (forward-only; SO-13 tech-stack discipline)
3. Rollbacks (when a deploy breaks production)
4. Pre-customer-onboarding readiness checks

ReadyBank does NOT yet have a dedicated GH Actions deploy workflow analogous to `deploy-marketing.yml` — those land at M2 when first paid customer onboards. This runbook documents the manual procedure until then.

---

## Pre-deploy checklist

Before any deploy:

- [ ] CI green on `main` (lint · typecheck · test · secret-scan · security-audit · build)
- [ ] GATEKEEPER release-gate per `gatekeeper/release-gate-protocol.md` signed off
- [ ] If migration included: backup database (manual `pg_dump`) before proceeding
- [ ] If breaking change: ADR exists in `services/readybank/ops/adrs/` (per ADR 0002 URL versioning; if breaking → v2 branch)
- [ ] If new dependency: security review per `gatekeeper/security-review-protocol.md`
- [ ] PM2 status currently healthy (`pm2 status` shows `qorium-readybank` online)
- [ ] If rolling out >1 PR's worth of changes: post in team channel; defer if possible

---

## Standard deploy procedure

### Step 1 — SSH to VPS

```bash
ssh -p 2244 root@147.93.103.194
```

### Step 2 — Pull latest

```bash
cd /opt/apps/qorium-monorepo  # path TBD when ReadyBank goes prod
git fetch origin
git pull origin main
```

### Step 3 — Install + build

```bash
pnpm install --frozen-lockfile
pnpm --filter '@qorium/db' build
pnpm --filter '@qorium/auth' build
pnpm --filter '@qorium/readybank' build
```

Workspace order matters: `@qorium/db` and `@qorium/auth` must build first (their `dist/` is consumed by ReadyBank).

### Step 4 — Apply migrations (if any new ones)

```bash
pnpm --filter '@qorium/db' migrate:up
```

**Migration discipline (forward-only — see "Migration rollback" section below for the only exception):**

- Migrations apply automatically on deploy
- Each migration is irreversible in normal operation
- If a migration is wrong, the fix is a NEW forward migration (not a rollback)
- Never `migrate:down` on production unless executing the formal rollback procedure (next section)

### Step 5 — PM2 reload

```bash
pm2 reload qorium-readybank
```

Reload (not restart) — preserves connection draining; zero-downtime.

If `pm2 reload` fails (config drift, etc.):

```bash
pm2 restart qorium-readybank --update-env
```

### Step 6 — Health smoke test

```bash
# From VPS:
curl -sS http://localhost:5101/health

# From outside (when API is on public IP / domain):
curl -sS https://api.qorium.online/health   # URL TBD post-launch
```

Expected response:

```json
{ "status": "ok", "version": "1.X.X", "timestamp": "2026-..." }
```

If non-200 OR `status !== "ok"` → **STOP** and trigger rollback (next section).

### Step 7 — Functional smoke (first 5 min after deploy)

For each of these endpoints, fire a sample request from a known-working API key:

```bash
# Sample question fetch
curl -sS -H "Authorization: Bearer ${TEST_API_KEY}" \
  http://localhost:5101/v1/questions/${SAMPLE_UUID}

# Sample pack generation
curl -sS -X POST -H "Authorization: Bearer ${TEST_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"role":"Senior Backend Engineer","difficulty":4,"count":5}' \
  http://localhost:5101/v1/packs/generate
```

Both should return 200 with valid JSON. Any error → rollback.

### Step 8 — Monitor

For the next 4 hours:

- Watch `pm2 logs qorium-readybank` for unexpected errors
- Check p95 latency (per `services/readybank/ops/sli-slo.md` SLO targets)
- Customer-channel monitoring: any reports from active customers?

If anything trends bad → rollback per `cto/runbooks/incident-response.md` Step 4 (Contain).

### Step 9 — Document

GATEKEEPER release-gate sign-off log entry (per `gatekeeper/release-gate-protocol.md` Section 6):

- Deploy time + commit SHA
- Smoke test result
- Customer impact observed (yes/no)
- Status: SHIPPED / ROLLED BACK / IN MONITORING

---

## Rollback procedure (~5 minutes)

If smoke fails OR a customer reports degradation in the post-deploy window:

### Step 1 — Find previous good SHA

```bash
cd /opt/apps/qorium-monorepo
git log --oneline -10
```

Identify the SHA before the bad deploy.

### Step 2 — Roll back

```bash
git checkout <previous-good-sha>
pnpm install --frozen-lockfile
pnpm --filter '@qorium/db' build
pnpm --filter '@qorium/auth' build
pnpm --filter '@qorium/readybank' build
pm2 reload qorium-readybank
```

### Step 3 — Verify

Re-run Step 6-7 smoke from the standard deploy.

### Step 4 — Notify

Same notification pattern as `cto/runbooks/deploy-rollback.md`:

```
ReadyBank API rolled back from <bad-sha> to <good-sha>.
Reason: <one-line>.
Smoke test passed at <timestamp>.
Forward-fix PR coming next.
```

---

## Migration rollback (the rare exception)

If a migration is fundamentally broken AND data hasn't been written against the new schema yet:

### Eligible scenarios

- The migration was deployed but no production traffic has hit it yet (deploy window <5 min, no traffic)
- The migration created a new table or column not yet referenced by app code
- The migration's only change is a non-destructive add (column / index / table)

### Ineligible scenarios (forward-only ALWAYS)

- Migration dropped or renamed a column
- Migration changed a column's type
- Production traffic has already written data using the new schema
- Any case where `migrate:down` would lose data

For ineligible scenarios → write a NEW forward migration that reverts the change. Roll the code back; data state stays as-is until the corrective migration ships.

### Rollback sequence (eligible only)

```bash
pnpm --filter '@qorium/db' migrate:down --steps=1
```

Then perform standard code rollback (Step 1-4 above).

This procedure will get its own ADR + standalone runbook when ReadyBank gets live customer data and migration discipline becomes binding (M3+).

---

## Customer-impact thresholds

| Severity | Trigger                                                                | Action                                                                                                    |
| -------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **P0**   | Health endpoint 5xx OR any 5xx >1% for 5 min OR customer data exposure | Immediate rollback + customer notification per `cto/runbooks/incident-response.md` §Customer notification |
| **P1**   | p95 >250ms on `/v1/packs/generate` for >1h OR specific endpoint broken | Investigate; rollback if not fixable in 30 min                                                            |
| **P2**   | Single customer reports issue, no metric impact                        | Investigate; fix forward in next deploy                                                                   |

Per `services/readybank/ops/sli-slo.md` SLO targets.

---

## Pre-customer-onboarding readiness check

Before the FIRST paying customer onboards (per `bali/outreach/platform-api.md` Y1 motion):

- [ ] Deploy workflow tested end-to-end (this runbook walked through manually)
- [ ] Rollback tested (deliberate bad deploy in staging; rollback timed; <5 min)
- [ ] Sentry DSN provisioned for error tracking (TD-007 in `cto/tech-debt.md`)
- [ ] Uptime monitor extended to ReadyBank API (extend `.github/workflows/uptime.yml`)
- [ ] API key issuance tested (via `@qorium/auth` package admin endpoint, when one exists)
- [ ] Customer onboarding runbook walked through (`services/readybank/ops/runbooks/customer-onboarding.md`)
- [ ] PM2 startup configured (auto-start on VPS reboot)
- [ ] Backup discipline operational (daily `pg_dump` cron)

This pre-flight check is itself logged to `gatekeeper/release-signoffs/<date>-readybank-customer-ready.md` as a milestone gate.

---

## Anti-patterns

- ❌ **`pm2 restart` instead of `pm2 reload`** for routine deploys. Reload is zero-downtime; restart drops connections.
- ❌ **Migrating on prod without backup.** `pg_dump` first, every time.
- ❌ **Skipping the security review on workflow changes.** Per `gatekeeper/security-review-protocol.md` — workflow + deploy script changes ALWAYS get security review.
- ❌ **Auto-deploy on push to main** without GATEKEEPER sign-off. Until M2+, manual deploy gives the human gate.
- ❌ **Breaking change merged to main without v2 branch.** Per ADR 0002, breaking changes go on a `/v2/` branch with migration plan; never silently break v1 contracts.

---

## Y1 reality

This runbook documents the manual deploy procedure. Per `_QORIUM_BUILD_LOG.md` history:

- Sprint 0.1 + 0.2: monorepo bootstrap (2026-04-01 to 04-15)
- Sprint 1: ReadyBank service skeleton on :5101 (PR #4, 2026-04-25)
- Sprint 2: `/v1/questions/{uuid}` + `/v1/questions/search` (PR #6, 2026-04-27)
- Sprint 3: `/v1/packs` + bulk export (PR #7, 2026-04-29)

Currently no live customer traffic; this runbook codifies the procedure for when traffic arrives.

By M2 (per Blueprint trajectory), a dedicated `deploy-readybank.yml` GH Actions workflow ships (parallel to `deploy-marketing.yml`); this runbook becomes the manual fallback + the workflow's design spec.

---

_Cross-references: Constitution SO-3, SO-13, ADR 0001 + 0002 + 0003 in this folder, `cto/runbooks/deploy-rollback.md` (parallel pattern for marketing app), `cto/runbooks/incident-response.md` (parent for incident classification), `gatekeeper/release-gate-protocol.md` (release-gate parent)._
