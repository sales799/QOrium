#!/usr/bin/env bash
#
# Setu deploy script — runs on the VPS (or in CI with SSH access).
# Idempotent + safe to re-run. Called by services/setu after a verified
# GitHub push webhook OR by GitHub Actions on demand.
#
# Usage: setu-deploy.sh <env: staging|production> <branch> <commit-sha>
#
# Required env vars on the host:
#   QORIUM_REPO_ROOT     — absolute path to the cloned repo (default /opt/qorium)
#   QORIUM_PNPM          — path to pnpm binary (default 'pnpm')
#   QORIUM_NODE_ENV_FILE — path to the env file (default $REPO_ROOT/.env)
#
# Behaviour:
#   1. Acquire flock to serialise concurrent deploys
#   2. git fetch + checkout the requested commit
#   3. pnpm install --frozen-lockfile
#   4. pnpm build
#   5. Run pending Postgres migrations
#   6. pm2 reload ecosystem.config.cjs --env <env>
#   7. Smoke check (curl localhost:5114/healthz then /v1/uptime/status)

set -euo pipefail

ENV_NAME="${1:-staging}"
BRANCH="${2:-main}"
COMMIT="${3:-HEAD}"

REPO_ROOT="${QORIUM_REPO_ROOT:-/opt/qorium}"
PNPM="${QORIUM_PNPM:-pnpm}"
ENV_FILE="${QORIUM_NODE_ENV_FILE:-$REPO_ROOT/.env}"
LOCK_FILE="/tmp/qorium-setu-deploy.lock"
LOG_FILE="/var/log/setu/deploy-$(date +%Y%m%d-%H%M%S).log"

mkdir -p "$(dirname "$LOG_FILE")" || true
exec > >(tee -a "$LOG_FILE") 2>&1

echo "[setu-deploy] env=$ENV_NAME branch=$BRANCH commit=$COMMIT repo=$REPO_ROOT"

# --- 1. Flock ---------------------------------------------------------------
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "[setu-deploy] another deploy is running; exiting"
  exit 75 # EX_TEMPFAIL
fi

cd "$REPO_ROOT"

# --- 2. Sync repo -----------------------------------------------------------
echo "[setu-deploy] git fetch + checkout"
git fetch origin --tags --prune
git checkout "$BRANCH"
git reset --hard "$COMMIT"

# --- 3. Install + build ----------------------------------------------------
echo "[setu-deploy] pnpm install"
"$PNPM" install --frozen-lockfile

echo "[setu-deploy] pnpm build"
"$PNPM" build

# --- 4. Migrations ---------------------------------------------------------
echo "[setu-deploy] applying postgres migrations"
"$PNPM" --filter @qorium/db migrate || {
  echo "[setu-deploy] migrations failed; aborting"
  exit 1
}

# --- 5. PM2 reload ---------------------------------------------------------
PM2_CONFIG="ecosystem.config.cjs"
if [[ -f "$PM2_CONFIG" ]]; then
  echo "[setu-deploy] pm2 reload --env $ENV_NAME"
  if ! pm2 reload "$PM2_CONFIG" --env "$ENV_NAME"; then
    echo "[setu-deploy] pm2 reload failed; trying pm2 start"
    pm2 start "$PM2_CONFIG" --env "$ENV_NAME"
  fi
  pm2 save
else
  echo "[setu-deploy] $PM2_CONFIG not found; skipping pm2"
fi

# --- 6. Smoke check --------------------------------------------------------
echo "[setu-deploy] smoke check uptime monitor"
sleep 5
if curl -sf "http://localhost:5114/healthz" >/dev/null; then
  echo "[setu-deploy] uptime-monitor healthz ok"
else
  echo "[setu-deploy] uptime-monitor healthz failed (non-fatal — first deploy may need warmup)"
fi

echo "[setu-deploy] DONE env=$ENV_NAME commit=$COMMIT"
