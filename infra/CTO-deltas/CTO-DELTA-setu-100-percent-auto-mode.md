# CTO-DELTA: Setu 100% auto-mode bootstrap (Sprint 2.16.5)

**Date:** 2026-05-04
**Author:** Claude Code (autonomous-continuous build session)
**Status:** Provisional — pending CTO Office reconciliation
**Origin:** CEO directive in this session: "We have to Achieve 100% Auto
Mode Enabled Infra Fix Everything which is required."

## Background

Sprint 2.12 shipped Setu's webhook + deploy primitives but left the VPS
bootstrap as a manual ~7-step CEO action. Sprint 2.15.1 unblocked the
DNS halt by rebranding to `qorium.online`. The remaining bootstrap
friction (certbot, nginx config, Postgres setup, systemd, secret
generation) was still 30+ minutes of manual ops work.

This sprint collapses that into a **single curl command** the CEO runs
on the VPS, after which Setu manages itself.

## What landed

- **`services/setu/bin/setu-bootstrap.sh`** — idempotent one-shot
  installer:
  1. Detects Debian/Ubuntu, installs missing packages (Node 20, pnpm 10,
     Postgres 16, Redis, PM2, nginx, certbot, git, build-essential, jq)
  2. Clones (or fast-forwards) the repo to `/opt/qorium`
  3. Generates fresh secrets via `openssl rand -hex 32` and writes a
     hardened `/opt/qorium/.env` (chmod 600 root:root)
  4. Creates the `qorium` Postgres role + database via `sudo -u postgres`
  5. Installs the nginx server block from `infra/nginx/qorium.conf`
  6. Runs `certbot --nginx` (only if DNS resolves to the local box —
     otherwise skips with a "rerun me later" message)
  7. Installs `qorium-pm2.service` systemd unit so PM2 restarts on reboot
  8. Runs `pnpm install --frozen-lockfile + pnpm build + pnpm migrate`
  9. `pm2 start ecosystem.config.cjs --env production` + `pm2 save`
  10. Writes `/opt/qorium/.SETU_GITHUB_PASTE_ME.txt` with the two values
      the CEO needs to paste into GitHub repo settings
- **`infra/nginx/qorium.conf`** — full nginx server block:
  - 15 upstream pools (one per PM2 service, ports 5101–5117)
  - Path-based routing on `api.qorium.online` (`/setu/*`, `/v1/auth/*`,
    `/v1/jd-forge/*`, `/v1/stack-vault/*`, `/v1/webhooks/*`, `/v1/audit/*`,
    `/v1/billing/*`, `/v1/api-keys/*`, `/v1/uptime/*`,
    `/v1/ai-pair-coding/*`, `/webhooks/*` → ats-bridge, `/v1/*` → readybank)
  - Subdomain server blocks for `admin`, `docs`, `candidate`, `my`
  - Standard X-Forwarded-\* + keepalive + gzip
- **`infra/systemd/qorium-pm2.service`** — systemd unit that resurrects
  PM2 on reboot (so a power-cycle doesn't lose the service set)
- **`infra/runbooks/setu-100-percent-auto-mode.md`** — operator-facing
  runbook with the wildcard-DNS shortcut, the single curl command,
  failure-mode triage, and revert instructions

## What this unblocks

After the CEO performs the one-time `curl | sudo bash` + GitHub paste:

- **Every push to `claude/*` or `main` deploys autonomously** via the
  Setu webhook
- **PM2 state survives reboots** (qorium-pm2.service runs `pm2 resurrect`
  at boot)
- **TLS auto-renewal** via certbot's systemd timer (installed by the
  certbot package)
- **No further CEO action required** unless rotating secrets (per
  Sprint 2.8 rotation worker) or onboarding a new domain

## What is still deferred

- **Multi-distro support** — bootstrap targets Debian/Ubuntu only. Alpine
  - CentOS coverage is a follow-up if the CEO picks a different VPS image.
- **Rolling deploys with zero downtime** — current `pm2 reload` is
  rolling for cluster-mode services but fork-mode workers (leak-crawler,
  judge0-orchestrator, irt-calibration, etc.) take a brief restart.
  Acceptable for v0; the Sprint 2.9 uptime monitor will catch any
  regressions.
- **Hostinger-specific provisioning** (firewall rules, snapshot schedule,
  DDoS rules) — captured in
  `infra/B1-VPS-Capacity-and-Topology-Plan.md` and stays a CEO console
  action.

## Reconciliation request to CTO Office

Default action: **ratify Setu 100% auto-mode**. The bootstrap is
idempotent, hardened (chmod 600 secret files, no unnecessary world-
readable artefacts), and reversible (the runbook documents how to
disable auto-deploy with one `sed` + `pm2 restart`).

## Verification

- Bootstrap script syntax: `bash -n services/setu/bin/setu-bootstrap.sh`
  is clean (verified via the build agent).
- Nginx config syntax: covered by `nginx -t` inside the script before it
  reloads (CI-equivalent at runtime; we cannot test `nginx -t` in the
  build agent without nginx installed).
- Systemd unit: standard format; `systemctl daemon-reload` is the smoke.
- The bootstrap is self-checking at runtime: every dependency install
  - every file write is gated on `command -v` / `[[ -f ]]` so re-runs
    do not duplicate work.

## Operator quickstart (TL;DR)

```bash
# On the VPS at 147.93.103.194
URL_MAIN="https://raw.githubusercontent.com/sales799/QOrium/main/services/setu/bin/setu-bootstrap.sh"
URL_BRANCH="https://raw.githubusercontent.com/sales799/QOrium/claude/setup-qorium-build-agent-zA0l5/services/setu/bin/setu-bootstrap.sh"
curl -fsSL "$URL_MAIN" -o /tmp/qorium-bootstrap || curl -fsSL "$URL_BRANCH" -o /tmp/qorium-bootstrap
sudo bash /tmp/qorium-bootstrap
cat /opt/qorium/.SETU_GITHUB_PASTE_ME.txt
# Paste the two values into github.com/sales799/QOrium/settings/secrets/actions
# Done. Every push auto-deploys from now on.
```

## Pre-merge URL caveat (added 2026-05-04)

The first CEO bootstrap attempt hit `bash: line 1: 404:: command not
found` because the original `curl -sSL` pattern silently downloaded a
404 page and piped it to `bash`. The second attempt (after the `-f`
flag fix shipped) hit a fresh 404 because **the URL had the wrong case
for the repo name** — `sales799/qorium` instead of `sales799/QOrium`.
`raw.githubusercontent.com` is case-sensitive on path components, so
the lowercase form 404s.

Three fixes shipped together:

1. **Repo casing.** All bootstrap URLs use `sales799/QOrium` (capital
   Q + O) — the canonical name from `git remote -v`. The lowercase form
   only works on the GitHub website (which is case-insensitive); raw
   content is case-sensitive.
2. **`curl -f` flag.** Makes curl exit non-zero on any HTTP error (so
   a 404 fails loud at the curl step, not at bash interpretation).
3. **Two-URL fallback.** Covers the window between sprint commits and
   merge of the branch to `main`. Once PR #9 merges, the first URL is
   the only one needed; the fallback becomes a no-op.

Bonus gotcha: temp file is now `/tmp/qorium-bootstrap` (no `.sh`
suffix). Some chat/terminal clients auto-linkify `*.sh` filenames as
URLs when copied, mangling the paste into markdown link syntax. The
no-suffix name avoids that trigger.
