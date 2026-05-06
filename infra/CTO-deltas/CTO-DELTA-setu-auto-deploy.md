# CTO-DELTA: Setu auto-deployment service introduced (off-spec, CEO directive)

**Date:** 2026-05-03
**Author:** Claude Code (autonomous-continuous build session)
**Status:** Provisional — pending CTO Office reconciliation
**Origin:** CEO directive in this session: "We build Setu" + "we created
SETU for Auto Deployment".

## Background

The 16-sprint plan does not include an auto-deployment service. The CEO
asked for two things:

1. A bridge that updates the external "QOrium Live Progress Dashboard"
   when commits land.
2. Auto-deployment of every commit to a VPS so the deploy step is not a
   manual CEO action.

Setu (Sanskrit: bridge) addresses both.

## What landed (Sprint 2.12)

- **`services/setu` (port 5117)** — Express service with two surfaces:
  - **Status endpoints** (`/v1/setu/status[/hero|/sprints|/halts|
/cto-deltas]`) that the external dashboard MCP can poll. Pulls the
    snapshot from disk on each request so the dashboard always sees the
    latest commit without restart.
  - **Deploy endpoints**:
    - `POST /v1/setu/deploys/webhook` — GitHub `push` webhook, HMAC-
      verified per docs.github.com/en/webhooks/using-webhooks/
      validating-webhook-deliveries.
    - `POST /v1/setu/deploys/manual` — admin-only re-deploy trigger
      (Bearer token).
    - `GET /v1/setu/deploys[/latest]` — in-memory ring buffer history.
- **Pure-logic deploy policy** (`services/setu/src/deploy/policy.ts`):
  - main → production
  - staging or claude/\* → staging
  - everything else → ignore
  - force-pushes / fork pushes / ref deletions → ignore
- **Pure-logic deploy runner** (`runner.ts`) — shell-out to
  `bin/setu-deploy.sh` with deterministic env injection
  (`SETU_DEPLOY_ENV`, `SETU_DEPLOY_BRANCH`, `SETU_DEPLOY_COMMIT`).
- **`bin/setu-deploy.sh`** — VPS-side deploy script:
  1. `flock` to serialise concurrent deploys
  2. `git fetch + reset --hard <commit>`
  3. `pnpm install --frozen-lockfile`
  4. `pnpm build`
  5. `pnpm --filter @qorium/db migrate`
  6. `pm2 reload ecosystem.config.cjs --env <env>`
  7. Smoke check uptime-monitor `/healthz`
- **`.github/workflows/setu-deploy.yml`** — two-mode workflow:
  - If `SETU_WEBHOOK_URL` is set in the GitHub repo's environment
    variables, fires a signed webhook at Setu directly.
  - Otherwise (fallback) SSHes into the VPS and runs `bin/setu-deploy.sh`.
- **CLI** (`pnpm --filter @qorium/setu snapshot`) for emitting
  `_QORIUM_STATUS.json` to the repo root for git-based dashboard sync.
- **PM2 ecosystem updated** — `qorium-setu` (cluster, port 5117).

## What is deferred

This is the **bootstrap** halt — until the CEO performs the one-time
setup, auto-deploy cannot fire end-to-end:

1. **Provision a Linux VPS** (Hostinger or any Linux host) with:
   - Node.js ≥ 20 + pnpm 10
   - PostgreSQL 16 + Redis
   - PM2 globally installed
   - Git installed and the QOrium repo cloned to `/opt/qorium`
   - `nginx` fronting ports 5101–5117 with TLS
2. **Generate an SSH deploy key** and add to GitHub repo deploy keys.
3. **Set GitHub repo variables**:
   - `SETU_WEBHOOK_URL` — `https://setu.qorium.io/v1/setu/deploys/webhook`
4. **Set GitHub repo secrets**:
   - `SETU_WEBHOOK_SECRET` — random hex string ≥32 chars
5. **Set VPS env vars** in `/opt/qorium/.env`:
   - `SETU_DEPLOY_ENABLED=true`
   - `SETU_WEBHOOK_SECRET=<same as GitHub>`
   - `SETU_MANUAL_DEPLOY_TOKEN=<random hex>`
   - All env vars from `infra/deployment/production.env.template`
6. **Boot Setu first**: `pm2 start ecosystem.config.cjs --only qorium-setu`.
   From that point, every push to `claude/*` or `main` triggers deploy
   automatically without further CEO action.

After step 6, the existing autonomous-build branch (`claude/setup-
qorium-build-agent-zA0l5`) will auto-deploy each new commit to staging
the moment it's pushed.

## Reconciliation request to CTO Office

Default action: **ratify Setu as a v0 platform service**. The off-spec
status (16-sprint plan does not include it) is justified by the CEO
directive in this session.

Once the CEO has executed the bootstrap halt above, the Setu webhook
fires end-to-end on every push and the activation halt
"VPS deployment requires CEO action" (CTO-DELTA #25) collapses to
just "first-boot bootstrap".

## Verification

- `services/setu/__tests__/snapshot.test.ts` — 9 cases (sprint table
  parsing, test totals, halts, CTO-DELTAs, PM2 service count, build
  history, full snapshot composition, phase synthesis)
- `services/setu/__tests__/server.test.ts` — 8 cases (status
  endpoints, RFC 7807 404, async getStatus)
- `services/setu/__tests__/deploy.test.ts` — 18 cases (deploy
  policy: main→prod, staging→staging, claude/\*→staging, unknown
  branches ignored, tag refs ignored, deletions ignored, force-pushes
  ignored, fork pushes ignored; HMAC verify happy + tampered + missing
  - malformed; DeployHistory ring buffer; runner shell-out + non-zero
    exit + env injection)
- `services/setu/__tests__/webhook.test.ts` — 10 cases (deploy
  disabled 503, bad signature 401, non-push 202, non-deploy branch
  202, push to main → production deploy, push to claude/\* → staging
  deploy, manual deploy auth, deploys history endpoints)
