#!/usr/bin/env bash
# deploy.sh — Top-level installer for the qorium-mailer side-deploy.
# ----------------------------------------------------------------------------
# Run as root on the VPS, AFTER:
#   1. Deploy-key fix from governance/email-bootstrap/2026-05-10-deploy-handoff.md
#   2. /opt/qorium-mailer/.env populated from .env.example
#
# Usage:
#   bash /opt/qorium-mailer/infra/side-deploy/qorium-mailer/deploy.sh
#
# This script is IDEMPOTENT. Safe to re-run; it skips work already done.
# It DOES NOT touch /opt/qorium or the running qorium-api process.
# ----------------------------------------------------------------------------

set -euo pipefail

# ----- Configurable defaults (env vars override) -----------------------------
INSTALL_DIR="${INSTALL_DIR:-/opt/qorium-mailer}"
GIT_REPO="${GIT_REPO:-git@github-qorium:sales799/qorium.git}"   # uses SSH host alias
GIT_BRANCH="${GIT_BRANCH:-main}"
DB_NAME="${DB_NAME:-qorium_mailer}"
PM2_PROCESS="${PM2_PROCESS:-qorium-mailer}"
NGINX_SITE="${NGINX_SITE:-/etc/nginx/sites-enabled/qorium.conf}"

ts() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }
log() { echo "[$(ts)] $*"; }

log "→ qorium-mailer side-deploy starting"
log "  INSTALL_DIR = $INSTALL_DIR"
log "  GIT_REPO    = $GIT_REPO"
log "  GIT_BRANCH  = $GIT_BRANCH"

# ----- 0. Pre-flight ---------------------------------------------------------
log "→ Pre-flight checks"

# Confirm we're root (or have sudo). Postgres CREATE DATABASE needs it.
if [[ $EUID -ne 0 ]]; then
  log "✗ Run as root (or via sudo)."
  exit 1
fi

# Confirm running qorium-api won't be disturbed (port 5101 stays bound).
if ! pm2 list 2>/dev/null | grep -q qorium-api; then
  log "⚠ Warning: qorium-api not seen in pm2 list. Continuing anyway."
fi

# Confirm port 5150 is free.
if ss -ltn | awk '{print $4}' | grep -qE ':5150$'; then
  log "✗ Port 5150 already in use. Refusing to start."
  exit 1
fi

# Confirm github-qorium SSH alias works (deploy key step done).
if ! ssh -T -o BatchMode=yes -o ConnectTimeout=5 github-qorium 2>&1 | grep -q "sales799/qorium"; then
  log "✗ SSH alias 'github-qorium' does not authenticate to sales799/qorium."
  log "  Run the Paste 1 steps from governance/email-bootstrap/2026-05-10-deploy-handoff.md first."
  exit 1
fi

# ----- 1. Clone or update -----------------------------------------------------
if [[ -d "$INSTALL_DIR/.git" ]]; then
  log "→ $INSTALL_DIR exists — fetching + fast-forwarding $GIT_BRANCH"
  cd "$INSTALL_DIR"
  git fetch origin "$GIT_BRANCH"
  git checkout "$GIT_BRANCH"
  git pull --ff-only origin "$GIT_BRANCH"
else
  log "→ Cloning $GIT_REPO ($GIT_BRANCH) into $INSTALL_DIR"
  git clone -b "$GIT_BRANCH" "$GIT_REPO" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

CURRENT_SHA="$(git rev-parse HEAD)"
log "  HEAD = $CURRENT_SHA"

# ----- 2. .env check ---------------------------------------------------------
if [[ ! -f "$INSTALL_DIR/.env" ]]; then
  log "→ No .env yet — copying .env.example as a starting point"
  cp "$INSTALL_DIR/infra/side-deploy/qorium-mailer/.env.example" "$INSTALL_DIR/.env"
  log "✗ .env created with PLACEHOLDER values. Edit $INSTALL_DIR/.env then re-run."
  log "  Required: POSTGRES_PASSWORD, JWT_SECRET, API_KEY_PEPPER (copy from /opt/qorium/.env)"
  log "           SES_ACCESS_KEY_ID, SES_SECRET_ACCESS_KEY (from AWS bootstrap secrets)"
  exit 1
fi

# Verify no placeholder bracket markers remain in .env.
if grep -q '\[' "$INSTALL_DIR/.env"; then
  log "✗ $INSTALL_DIR/.env still has [bracketed] placeholders — not ready."
  log "  Lines with placeholders:"
  grep -n '\[' "$INSTALL_DIR/.env" | sed 's/^/    /'
  exit 1
fi

# ----- 3. Install + build ----------------------------------------------------
log "→ pnpm install --frozen-lockfile"
pnpm install --frozen-lockfile

log "→ Building @qorium/db, @qorium/auth, @qorium/readybank"
pnpm --filter @qorium/db build
pnpm --filter @qorium/auth build
pnpm --filter @qorium/readybank build

# ----- 4. Provision DB + run migrations --------------------------------------
log "→ Running migrate-mailer.sh"
bash "$INSTALL_DIR/infra/side-deploy/qorium-mailer/migrate-mailer.sh"

# ----- 5. Start under PM2 (or restart if already there) ----------------------
if pm2 list 2>/dev/null | grep -q "$PM2_PROCESS"; then
  log "→ $PM2_PROCESS already in pm2 — restarting with --update-env"
  pm2 restart "$PM2_PROCESS" --update-env
else
  log "→ Starting $PM2_PROCESS"
  pm2 start "$INSTALL_DIR/infra/side-deploy/qorium-mailer/ecosystem.config.cjs" --only "$PM2_PROCESS"
fi

# Persist pm2 list across reboots.
pm2 save

# ----- 6. nginx wiring -------------------------------------------------------
INCLUDE_LINE="    include $INSTALL_DIR/infra/side-deploy/qorium-mailer/nginx-locations.conf;  # qorium-mailer-locations"
if [[ -f "$NGINX_SITE" ]]; then
  if grep -q "qorium-mailer-locations" "$NGINX_SITE"; then
    log "→ nginx already includes qorium-mailer-locations — skipping"
  else
    log "→ Adding nginx include line to $NGINX_SITE"
    # Insert BEFORE the catch-all `location /` block to ensure /v1/auth/*
    # matches first.
    sed -i.bak "/location\s*\/\s*{/i\\
$INCLUDE_LINE
" "$NGINX_SITE"
    if nginx -t; then
      nginx -s reload
      log "  ✓ nginx reloaded"
    else
      log "✗ nginx -t failed — restoring backup"
      mv "${NGINX_SITE}.bak" "$NGINX_SITE"
      exit 1
    fi
  fi
else
  log "⚠ $NGINX_SITE not found — skipping nginx step. Add the include line manually."
fi

# ----- 7. Smoke test ---------------------------------------------------------
log "→ Smoke test"
sleep 3
if curl -fsS http://127.0.0.1:5150/healthz >/dev/null 2>&1; then
  log "  ✓ qorium-mailer /healthz returned 200"
else
  log "✗ qorium-mailer /healthz did NOT return 200"
  log "  pm2 logs $PM2_PROCESS --lines 30 --nostream :"
  pm2 logs "$PM2_PROCESS" --lines 30 --nostream | tail -30 || true
  exit 1
fi

if pm2 logs "$PM2_PROCESS" --lines 50 --nostream 2>/dev/null | grep -qiE "mailer initialized|driver=ses"; then
  log "  ✓ Mailer initialized log seen"
else
  log "  ⚠ Mailer-init log NOT seen yet — check pm2 logs $PM2_PROCESS manually"
fi

log "✓ Side-deploy complete. SHA $CURRENT_SHA. PM2 process: $PM2_PROCESS."
log ""
log "Next: send a test invitation:"
log "  curl -X POST https://api.qorium.online/v1/auth/invite \\"
log "    -H \"Authorization: Bearer \$ADMIN_API_KEY\" \\"
log "    -H \"Content-Type: application/json\" \\"
log "    -d '{\"email\":\"bhaskar@talpro.in\",\"name\":\"Bhaskar (test)\",\"tenant_id\":\"\$TENANT_ID\"}'"
