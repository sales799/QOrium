#!/usr/bin/env bash
#
# Setu one-shot bootstrap — turns a fresh Linux VPS at 147.93.103.194 into
# a fully-running QOrium production environment in a single command:
#
#   # 1. Generate a fine-grained GitHub PAT with Contents:read for sales799/QOrium
#   # 2. SSH to the VPS, then:
#   export GITHUB_TOKEN=ghp_yourtoken
#   URL="https://api.github.com/repos/sales799/QOrium/contents/services/setu/bin/setu-bootstrap.sh"
#   curl -fsSL -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github.raw" \
#        "$URL?ref=claude/setup-qorium-build-agent-zA0l5" -o /tmp/qorium-bootstrap
#   sudo -E bash /tmp/qorium-bootstrap
#
# Notes:
#   - The repo is private; raw.githubusercontent.com 404s without auth even
#     though the file exists. The api.github.com `/repos/.../contents/...`
#     endpoint with `Accept: application/vnd.github.raw` is the canonical
#     way to fetch a single file from a private repo with a PAT.
#   - `sudo -E` preserves GITHUB_TOKEN through to the script so the inner
#     git clone can authenticate against the private repo.
#   - The script persists the credential helper at /root/.git-credentials
#     (chmod 600, root only) so Setu's deploy worker can later `git fetch`
#     without re-supplying the token.
#   - Temp-file `qorium-bootstrap` (no `.sh` suffix) avoids a gotcha where
#     some chat clients auto-linkify `*.sh` filenames during paste.
#   - Once PR #9 merges to main, swap `?ref=claude/...` for `?ref=main`.
#
# Idempotent: re-runs are safe (skip-if-installed, skip-if-configured).
# What it does:
#   1. Detects Linux distro (Ubuntu/Debian assumed; Alpine/CentOS coverage TBD)
#   2. Installs missing dependencies (Node 20, pnpm 10, Postgres 16, Redis,
#      PM2, nginx, certbot, git, build-essential)
#   3. Clones the QOrium repo to /opt/qorium (or fast-forwards if present)
#   4. Generates fresh secrets for /opt/qorium/.env (idempotent: keeps
#      existing values if file already exists)
#   5. Configures Postgres role + database
#   6. Installs nginx server block from infra/nginx/qorium.conf
#   7. Provisions Let's Encrypt cert via certbot --nginx (only if DNS resolves)
#   8. Installs systemd unit so PM2 restarts on reboot
#   9. pnpm install + pnpm build + apply migrations + pm2 start
#  10. Prints the GitHub repo settings the CEO must paste once

set -euo pipefail

REPO_OWNER="sales799"
REPO_NAME="QOrium"
# If GITHUB_TOKEN is set (recommended for private repos), embed it in the
# clone URL so git operations don't prompt. Empty token = anonymous clone
# (only works if the repo is public).
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  REPO_URL="${SETU_BOOTSTRAP_REPO:-https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO_OWNER}/${REPO_NAME}.git}"
else
  REPO_URL="${SETU_BOOTSTRAP_REPO:-https://github.com/${REPO_OWNER}/${REPO_NAME}.git}"
fi
REPO_BRANCH="${SETU_BOOTSTRAP_BRANCH:-main}"
REPO_ROOT="${SETU_BOOTSTRAP_ROOT:-/opt/qorium}"
APEX_DOMAIN="${QORIUM_DOMAIN:-qorium.online}"
PRIMARY_HOST="${QORIUM_PRIMARY_HOST:-api.${APEX_DOMAIN}}"
LE_EMAIL="${LETSENCRYPT_EMAIL:-ceo@${APEX_DOMAIN}}"

log() { echo "[setu-bootstrap] $*" >&2; }
trap 'log "FAILED at line ${LINENO}; rerun is safe"' ERR

# --- 0. sudo / root check ----------------------------------------------------
if [[ $EUID -ne 0 ]]; then
  log "rerun as root: 'sudo bash $0'"
  exit 1
fi

# --- 1. Distro detection -----------------------------------------------------
if ! command -v apt-get >/dev/null; then
  log "apt-get not found; this bootstrap supports Debian/Ubuntu only"
  log "see infra/runbooks/customer-zero-day-1.md for manual setup"
  exit 1
fi

# --- 2. System dependencies --------------------------------------------------
log "installing system packages"
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
  curl ca-certificates gnupg git build-essential ufw unzip jq \
  postgresql-16 redis-server nginx certbot python3-certbot-nginx \
  >/dev/null

# Node 20 via NodeSource if missing or wrong major.
if ! command -v node >/dev/null || [[ "$(node -v 2>/dev/null | cut -c2- | cut -d. -f1)" -lt 20 ]]; then
  log "installing Node 20"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null
  apt-get install -y -qq nodejs >/dev/null
fi

if ! command -v pnpm >/dev/null; then
  log "installing pnpm 10"
  npm install -g pnpm@10.33.0 >/dev/null
fi

if ! command -v pm2 >/dev/null; then
  log "installing PM2"
  npm install -g pm2 >/dev/null
fi

systemctl enable --now postgresql redis-server nginx >/dev/null 2>&1 || true

# --- 3. Clone or update the repo --------------------------------------------
# Persist a credential helper if we have a token, so Setu's deploy worker
# can later run `git fetch` non-interactively without re-embedding the
# token in the remote URL (which would leak it via `git remote -v`).
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  install -m 600 -o root -g root /dev/null /root/.git-credentials
  echo "https://x-access-token:${GITHUB_TOKEN}@github.com" > /root/.git-credentials
  git config --global credential.helper "store --file=/root/.git-credentials"
fi

if [[ ! -d "$REPO_ROOT/.git" ]]; then
  log "cloning ${REPO_OWNER}/${REPO_NAME} (branch: $REPO_BRANCH) → $REPO_ROOT"
  if ! git clone --branch "$REPO_BRANCH" "$REPO_URL" "$REPO_ROOT" 2>/tmp/clone.err; then
    log "git clone failed:"
    sed -E 's|x-access-token:[^@]+@|x-access-token:***REDACTED***@|g' /tmp/clone.err >&2
    log ""
    log "If this is a private repo, set GITHUB_TOKEN before running:"
    log "   export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxx"
    log "   sudo -E bash $0     # -E preserves the env var through sudo"
    log "(Generate at https://github.com/settings/tokens — fine-grained, Contents: read for ${REPO_OWNER}/${REPO_NAME})"
    exit 1
  fi
  # Sanitise the remote URL so the on-disk repo doesn't store the token.
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    git -C "$REPO_ROOT" remote set-url origin "https://github.com/${REPO_OWNER}/${REPO_NAME}.git"
  fi
else
  log "fast-forwarding $REPO_ROOT to origin/$REPO_BRANCH"
  git -C "$REPO_ROOT" fetch origin --tags --prune
  git -C "$REPO_ROOT" checkout "$REPO_BRANCH"
  git -C "$REPO_ROOT" reset --hard "origin/$REPO_BRANCH"
fi

# --- 4. .env generation (idempotent) ----------------------------------------
ENV_FILE="$REPO_ROOT/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  log "generating fresh .env at $ENV_FILE"
  PG_PASSWORD="$(openssl rand -hex 24)"
  PEPPER="$(openssl rand -hex 32)"
  WEBHOOK_SECRET="$(openssl rand -hex 32)"
  MANUAL_DEPLOY_TOKEN="$(openssl rand -hex 24)"
  JWT_SIGNING_SECRET="$(openssl rand -hex 32)"
  NEXTAUTH_SECRET="$(openssl rand -hex 32)"

  # Postgres role + db
  sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='qorium'" 2>/dev/null | grep -q 1 \
    || sudo -u postgres psql -c "CREATE ROLE qorium LOGIN PASSWORD '${PG_PASSWORD}'"
  sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='qorium'" 2>/dev/null | grep -q 1 \
    || sudo -u postgres psql -c "CREATE DATABASE qorium OWNER qorium"

  cp "$REPO_ROOT/infra/deployment/production.env.template" "$ENV_FILE"
  sed -i "s|^DATABASE_URL_PROD=.*|DATABASE_URL_PROD=postgres://qorium:${PG_PASSWORD}@127.0.0.1:5432/qorium|" "$ENV_FILE"
  sed -i "s|^REDIS_URL=.*|REDIS_URL=redis://127.0.0.1:6379|" "$ENV_FILE"
  sed -i "s|^API_KEY_PEPPER=.*|API_KEY_PEPPER=${PEPPER}|" "$ENV_FILE"
  sed -i "s|^SSO_JWT_SIGNING_SECRET=.*|SSO_JWT_SIGNING_SECRET=${JWT_SIGNING_SECRET}|" "$ENV_FILE"
  sed -i "s|^NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=${NEXTAUTH_SECRET}|" "$ENV_FILE"
  echo "" >> "$ENV_FILE"
  echo "# --- Setu auto-deploy (Sprint 2.12 + 2.16.5) ---" >> "$ENV_FILE"
  echo "SETU_DEPLOY_ENABLED=true" >> "$ENV_FILE"
  echo "SETU_WEBHOOK_SECRET=${WEBHOOK_SECRET}" >> "$ENV_FILE"
  echo "SETU_MANUAL_DEPLOY_TOKEN=${MANUAL_DEPLOY_TOKEN}" >> "$ENV_FILE"
  echo "SETU_REPO_ROOT=${REPO_ROOT}" >> "$ENV_FILE"
  echo "SETU_DEPLOY_SCRIPT_PATH=${REPO_ROOT}/services/setu/bin/setu-deploy.sh" >> "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  chown root:root "$ENV_FILE"

  CEO_GITHUB_VARIABLES="$REPO_ROOT/.SETU_GITHUB_PASTE_ME.txt"
  cat > "$CEO_GITHUB_VARIABLES" <<EOF
# Paste these into GitHub → Repository settings → Secrets and variables → Actions.
#
# Variables (Repository variables):
#   SETU_WEBHOOK_URL=https://${PRIMARY_HOST}/setu/v1/setu/deploys/webhook
#
# Secrets (Repository secrets):
#   SETU_WEBHOOK_SECRET=${WEBHOOK_SECRET}
#
# Optional (manual deploy convenience):
#   SETU_MANUAL_DEPLOY_TOKEN=${MANUAL_DEPLOY_TOKEN}
#   (curl -X POST -H "Authorization: Bearer \$SETU_MANUAL_DEPLOY_TOKEN" \\
#       https://${PRIMARY_HOST}/setu/v1/setu/deploys/manual \\
#       -d '{"env":"production","branch":"main","commit":"HEAD"}')
EOF
  chmod 600 "$CEO_GITHUB_VARIABLES"
  log ".env generated; secrets written to $CEO_GITHUB_VARIABLES"
else
  log ".env already exists; preserving (no secrets regenerated)"
fi

# --- 5. nginx server block --------------------------------------------------
NGINX_CONF="/etc/nginx/sites-available/qorium.conf"
NGINX_LINK="/etc/nginx/sites-enabled/qorium.conf"
if [[ ! -f "$NGINX_CONF" ]]; then
  log "installing nginx server block"
  cp "$REPO_ROOT/infra/nginx/qorium.conf" "$NGINX_CONF"
  sed -i "s|qorium.online|${APEX_DOMAIN}|g" "$NGINX_CONF"
  ln -sf "$NGINX_CONF" "$NGINX_LINK"
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx
fi

# --- 6. Let's Encrypt cert (only if DNS resolves to this box) ---------------
THIS_IP="$(curl -sf https://ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
RESOLVED_IP="$(getent hosts "${PRIMARY_HOST}" | awk '{print $1}' | head -n1)"
if [[ -n "$RESOLVED_IP" && "$RESOLVED_IP" == "$THIS_IP" ]]; then
  if [[ ! -d "/etc/letsencrypt/live/${PRIMARY_HOST}" ]]; then
    log "provisioning TLS cert for ${PRIMARY_HOST}"
    certbot --nginx --non-interactive --agree-tos -m "${LE_EMAIL}" -d "${PRIMARY_HOST}" || \
      log "certbot failed; rerun manually after DNS propagates"
  fi
else
  log "DNS for ${PRIMARY_HOST} does not yet resolve to ${THIS_IP} (got '${RESOLVED_IP:-nothing}'); skipping certbot"
  log "rerun this script after publishing the A record"
fi

# --- 7. systemd unit so PM2 starts on reboot --------------------------------
SYSTEMD_UNIT="/etc/systemd/system/qorium-pm2.service"
if [[ ! -f "$SYSTEMD_UNIT" ]]; then
  log "installing systemd unit"
  cp "$REPO_ROOT/infra/systemd/qorium-pm2.service" "$SYSTEMD_UNIT"
  systemctl daemon-reload
  systemctl enable qorium-pm2.service
fi

# --- 8. pnpm install + build + migrate + pm2 start --------------------------
cd "$REPO_ROOT"
log "pnpm install"
pnpm install --frozen-lockfile

log "pnpm build"
pnpm build

log "applying postgres migrations"
set -a; source "$ENV_FILE"; set +a
DATABASE_URL="$DATABASE_URL_PROD" pnpm --filter @qorium/db migrate || \
  log "migrations failed (perhaps first-run; rerun after Postgres warm-up)"

log "pm2 start ecosystem"
pm2 start "$REPO_ROOT/ecosystem.config.cjs" --env production || pm2 reload "$REPO_ROOT/ecosystem.config.cjs" --env production
pm2 save
systemctl start qorium-pm2.service || true

# --- 9. Final report --------------------------------------------------------
log "---------------------------------------------------------------"
log "BOOTSTRAP COMPLETE"
log ""
log "Repo:       $REPO_ROOT (branch $REPO_BRANCH)"
log "Domain:     ${PRIMARY_HOST}"
log "PM2 apps:   $(pm2 jlist 2>/dev/null | jq -r '.[].name' | tr '\n' ' ')"
log ""
log "Next CEO action (paste once into GitHub):"
log "  cat $REPO_ROOT/.SETU_GITHUB_PASTE_ME.txt"
log ""
log "After paste, every push to claude/* or main auto-deploys via Setu."
log "---------------------------------------------------------------"
