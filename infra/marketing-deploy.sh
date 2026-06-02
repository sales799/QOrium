#!/usr/bin/env bash
# qorium-marketing - VPS 1 bootstrap and atomic GBS-routed redeploy.
#
# Run once on VPS 1 (147.93.103.194) as root via SSH from the CEO MacBook:
#   ssh -p 2244 root@147.93.103.194
#   curl -sfL https://raw.githubusercontent.com/sales799/qorium/main/infra/marketing-deploy.sh | bash
#
# If the repo is private, instead:
#   git clone -b main https://<USER>:<PAT>@github.com/sales799/qorium.git /opt/apps/qorium-marketing
#   cd /opt/apps/qorium-marketing && safe-deploy qorium-marketing
#
# Idempotent. Safe to re-run on every deploy. Does NOT touch existing services
# (n8n, ReadyBank API, Postgres, Redis). Only adds:
#   - PM2 process: qorium-marketing on port 5110
#   - PM2 process: qorium-chatbot on port 5122
#   - nginx vhost: qorium.online (apex + www)
#   - optional nginx redirect vhost: qorium.in + www.qorium.in
#
# Atomic release layout:
#   /opt/apps/qorium-marketing        coordinator git checkout
#   /opt/apps/qorium-marketing/shared runtime env and durable files
#   /opt/apps/qorium-marketing/releases/<sha> immutable built releases
#   /opt/apps/qorium-marketing/current -> releases/<sha>

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/sales799/qorium.git}"
BRANCH="${BRANCH:-main}"
APP_DIR="${APP_DIR:-/opt/apps/qorium-marketing}"
RELEASES_DIR="${RELEASES_DIR:-$APP_DIR/releases}"
SHARED_DIR="${SHARED_DIR:-$APP_DIR/shared}"
CURRENT_LINK="${CURRENT_LINK:-$APP_DIR/current}"
APP_PORT="5110"
CHATBOT_PORT="5122"
DOMAIN_PRIMARY="qorium.online"
DOMAIN_WWW="www.qorium.online"
DOMAIN_REDIRECT="qorium.in"
DOMAIN_REDIRECT_WWW="www.qorium.in"
CONTACT_EMAIL="hello@qorium.online"
NODE_MAJOR="22"
PNPM_VERSION="10.33.0"
SAFE_DEPLOY_BIN="${SAFE_DEPLOY_BIN:-/usr/local/bin/safe-deploy}"

if [[ "${TALPRO_GBS_RAW_DEPLOY:-0}" != "1" && -d "$APP_DIR/.git" ]]; then
  exec "$SAFE_DEPLOY_BIN" qorium-marketing "$@"
fi

log() { printf "\n\033[1;36m▶ %s\033[0m\n" "$*"; }
ok()  { printf "  \033[1;32m✓\033[0m %s\n" "$*"; }
warn(){ printf "  \033[1;33m!\033[0m %s\n" "$*"; }
die() { printf "\n\033[1;31m✗ %s\033[0m\n" "$*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || die "Must run as root (use sudo)."

SHARED_ENV_FILE="$SHARED_DIR/apps/marketing/.env.production"
LEGACY_ENV_FILE="$APP_DIR/apps/marketing/.env.production"

pm2_start_or_reload() {
  local process_name="$1"
  local launcher="$2"
  local memory_limit="$3"
  local stdout_log="$4"
  local stderr_log="$5"
  local configured_script=""
  local launcher_real=""
  local configured_real=""

  if command pm2 describe "$process_name" >/dev/null 2>&1; then
    configured_script="$(command pm2 jlist | PM2_PROCESS_NAME="$process_name" node -e "
const name = process.env.PM2_PROCESS_NAME;
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const rows = JSON.parse(input || '[]');
    const proc = rows.find(row => row && row.name === name);
    process.stdout.write(proc?.pm2_env?.pm_exec_path || '');
  } catch {}
});
" || true)"
    launcher_real="$(readlink -f "$launcher" 2>/dev/null || printf '%s' "$launcher")"
    configured_real="$(readlink -f "$configured_script" 2>/dev/null || printf '%s' "$configured_script")"

    if [[ "$configured_real" == "$launcher_real" ]]; then
      command pm2 reload "$process_name" --update-env >/dev/null || return
      ok "pm2 reloaded $process_name"
      return
    fi

    warn "pm2 $process_name uses legacy launcher ${configured_script:-unknown}; recreating process on current release"
    command pm2 delete "$process_name" >/dev/null || return
  fi

  command pm2 start "$launcher" \
      --name "$process_name" \
      --max-memory-restart "$memory_limit" \
      --log-date-format 'YYYY-MM-DD HH:mm:ss' \
      --merge-logs \
      --time \
      --output "$stdout_log" \
      --error "$stderr_log" >/dev/null || return
  ok "pm2 started $process_name"
}

rollback_current() {
  local previous_release="$1"
  if [[ -n "$previous_release" && -d "$previous_release" ]]; then
    warn "rolling back current symlink to $previous_release"
    ln -sfn "$previous_release" "$CURRENT_LINK.next"
    mv -Tf "$CURRENT_LINK.next" "$CURRENT_LINK"
    if command pm2 describe qorium-chatbot >/dev/null 2>&1; then
      command pm2 reload qorium-chatbot --update-env >/dev/null || true
    fi
    if command pm2 describe qorium-marketing >/dev/null 2>&1; then
      command pm2 reload qorium-marketing --update-env >/dev/null || true
    fi
  fi
}

write_default_env() {
  local env_file="$1"
  cat > "$env_file" <<EOF
NEXT_PUBLIC_SITE_URL=https://${DOMAIN_PRIMARY}
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=${DOMAIN_PRIMARY}
NODE_ENV=production
PORT=${APP_PORT}
HOSTNAME=127.0.0.1

# Fill in when ready:
# RESEND_API_KEY=
# CONTACT_TO_EMAIL=${CONTACT_EMAIL}
# CONTACT_FROM_EMAIL=noreply@${DOMAIN_PRIMARY}
# CHATBOT_SERVICE_URL=http://127.0.0.1:5122
# CHATBOT_LEAD_HMAC_SECRET=
# DATABASE_URL=
# GMAIL_USER=
# GMAIL_APP_PASSWORD=
EOF
  chmod 600 "$env_file"
}

link_release_env() {
  local release_dir="$1"
  mkdir -p "$release_dir/apps/marketing"
  ln -sfn "$SHARED_ENV_FILE" "$release_dir/apps/marketing/.env.production"
}

write_launchers() {
  local release_dir="$1"
  local marketing_launcher="$release_dir/apps/marketing/.pm2-start.sh"
  local chatbot_launcher="$release_dir/services/chatbot/.pm2-start.sh"

  cat > "$marketing_launcher" <<LAUNCHER_EOF
#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
cd "\$SCRIPT_DIR"
export NODE_ENV=production
export PORT=${APP_PORT}
export HOSTNAME=127.0.0.1
# Next.js auto-loads .env.production from cwd; this file is a symlink to shared env.
exec ./node_modules/next/dist/bin/next start -H 127.0.0.1 -p ${APP_PORT}
LAUNCHER_EOF
  chmod +x "$marketing_launcher"

  cat > "$chatbot_launcher" <<CHATBOT_LAUNCHER_EOF
#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
RELEASE_DIR="\$(cd "\$SCRIPT_DIR/../.." && pwd)"
cd "\$RELEASE_DIR"
if [[ -f "$SHARED_ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$SHARED_ENV_FILE"
  set +a
fi
export NODE_ENV=production
export CHATBOT_PORT=${CHATBOT_PORT}
export PORT=${CHATBOT_PORT}
export QORIUM_PUBLIC_BASE_URL=https://${DOMAIN_PRIMARY}
export CHATBOT_SYSTEM_PROMPT_PATH="\$RELEASE_DIR/services/chatbot/prompts/system.v1.md"
exec node services/chatbot/dist/index.js
CHATBOT_LAUNCHER_EOF
  chmod +x "$chatbot_launcher"
}

local_probe() {
  local url="$1"
  curl -s -m 10 -o /dev/null -w "%{http_code}" "$url" || echo "000"
}

# ── 1. System prereqs ──────────────────────────────────────────────────────
log "Installing system prerequisites"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl ca-certificates gnupg git build-essential nginx certbot python3-certbot-nginx >/dev/null
ok "apt deps installed"

# ── 2. Node.js 22 LTS via NodeSource ───────────────────────────────────────
if ! command -v node >/dev/null || [[ "$(node -v 2>/dev/null | cut -c2- | cut -d. -f1)" -lt "$NODE_MAJOR" ]]; then
  log "Installing Node.js $NODE_MAJOR LTS"
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash - >/dev/null
  apt-get install -y -qq nodejs >/dev/null
fi
ok "node $(node -v) · npm $(npm -v)"

# ── 3. pnpm + pm2 (npm globals) ────────────────────────────────────────────
if ! command -v pnpm >/dev/null || [[ "$(pnpm --version 2>/dev/null)" != "$PNPM_VERSION" ]]; then
  log "Installing pnpm $PNPM_VERSION"
  command npm install -g "pnpm@$PNPM_VERSION" >/dev/null
fi
command -v pm2 >/dev/null || command npm install -g pm2 >/dev/null
ok "pnpm $(pnpm --version) · pm2 $(pm2 --version 2>/dev/null | tail -1)"

# ── 4. Clone / fetch coordinator checkout ─────────────────────────────────
log "Syncing coordinator repo to $APP_DIR (branch: $BRANCH)"
mkdir -p /opt/apps
if [[ -d "$APP_DIR/.git" ]]; then
  cd "$APP_DIR"
  git fetch --depth=1 origin "+${BRANCH}:refs/remotes/origin/${BRANCH}"
  git reset --hard "origin/$BRANCH"
  git clean -fd -e releases -e shared -e current -e apps/marketing/.env.production
else
  if [[ -d "$APP_DIR" ]] && [[ -n "$(ls -A "$APP_DIR" 2>/dev/null)" ]]; then
    die "$APP_DIR exists and is not empty. Move it aside or delete it before rerunning."
  fi
  git clone --depth=1 --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi
ok "checkout: $(git rev-parse --short HEAD) — $(git log -1 --format=%s)"

# ── 5. Shared runtime state ────────────────────────────────────────────────
log "Preparing shared runtime state"
mkdir -p "$RELEASES_DIR" "$SHARED_DIR/apps/marketing"
if [[ ! -f "$SHARED_ENV_FILE" && -f "$LEGACY_ENV_FILE" ]]; then
  cp "$LEGACY_ENV_FILE" "$SHARED_ENV_FILE"
  chmod 600 "$SHARED_ENV_FILE"
  ok "migrated existing env to $SHARED_ENV_FILE"
elif [[ ! -f "$SHARED_ENV_FILE" ]]; then
  write_default_env "$SHARED_ENV_FILE"
  ok "$SHARED_ENV_FILE created (chmod 600)"
else
  chmod 600 "$SHARED_ENV_FILE"
  ok "$SHARED_ENV_FILE already exists, leaving untouched"
fi

set -a
# shellcheck disable=SC1090
source "$SHARED_ENV_FILE"
set +a

# ── 6. Build immutable release ─────────────────────────────────────────────
RELEASE_SHA="$(git rev-parse --short=12 "origin/$BRANCH")"
RELEASE_DIR="$RELEASES_DIR/$RELEASE_SHA"
PREVIOUS_RELEASE="$(readlink -f "$CURRENT_LINK" 2>/dev/null || true)"

if [[ -d "$RELEASE_DIR" && -d "$RELEASE_DIR/apps/marketing/.next" && -f "$RELEASE_DIR/services/chatbot/dist/index.js" ]]; then
  log "Release $RELEASE_SHA already built; reusing $RELEASE_DIR"
  link_release_env "$RELEASE_DIR"
  write_launchers "$RELEASE_DIR"
elif [[ -e "$RELEASE_DIR" ]]; then
  die "$RELEASE_DIR exists but is incomplete; move it aside after inspection, then rerun deploy"
else
  log "Creating release $RELEASE_SHA"
  TMP_RELEASE="$RELEASES_DIR/.${RELEASE_SHA}.tmp.$$"
  [[ ! -e "$TMP_RELEASE" ]] || die "$TMP_RELEASE already exists; move it aside after inspection, then rerun deploy"
  mkdir -p "$TMP_RELEASE"
  git archive "origin/$BRANCH" | tar -x -C "$TMP_RELEASE"
  link_release_env "$TMP_RELEASE"

  log "Installing workspace dependencies in release"
  (
    cd "$TMP_RELEASE"
    command pnpm install --frozen-lockfile --prefer-offline 2>&1 | tail -20
  )
  ok "deps installed"

  log "Building workspace packages"
  (
    cd "$TMP_RELEASE"
    command pnpm run build:packages 2>&1 | tail -25
  )
  ok "workspace packages built"

  log "Building marketing app (Next.js 15)"
  (
    cd "$TMP_RELEASE"
    command pnpm --filter @qorium/marketing build 2>&1 | tail -25
  )
  [[ -d "$TMP_RELEASE/apps/marketing/.next" ]] || die "build did not produce .next/ — check log above"
  ok "build complete · $(du -sh "$TMP_RELEASE/apps/marketing/.next" | cut -f1)"

  [[ -f "$TMP_RELEASE/packages/db/dist/index.js" ]] || die "database build did not produce dist/index.js — check log above"
  ok "database package build complete"

  log "Building chatbot service"
  (
    cd "$TMP_RELEASE"
    command pnpm --filter @qorium/chatbot build 2>&1 | tail -25
  )
  [[ -f "$TMP_RELEASE/services/chatbot/dist/index.js" ]] || die "chatbot build did not produce dist/index.js — check log above"
  ok "chatbot build complete"

  write_launchers "$TMP_RELEASE"
  mv "$TMP_RELEASE" "$RELEASE_DIR"
  ok "release staged at $RELEASE_DIR"
fi

if [[ -n "${DATABASE_URL:-}" ]]; then
  log "Rebuilding chatbot corpus"
  (
    cd "$RELEASE_DIR"
    command pnpm --filter @qorium/chatbot corpus:rebuild 2>&1 | tail -20
  )
  ok "chatbot corpus refreshed"
else
  warn "DATABASE_URL not present in deploy environment; skipping chatbot corpus rebuild"
fi

# ── 7. Atomic symlink flip + PM2 reload ───────────────────────────────────
log "Flipping current release"
ln -sfn "$RELEASE_DIR" "$CURRENT_LINK.next"
mv -Tf "$CURRENT_LINK.next" "$CURRENT_LINK"
ok "current -> $(readlink -f "$CURRENT_LINK")"

log "Configuring PM2"
if ! pm2_start_or_reload qorium-chatbot "$CURRENT_LINK/services/chatbot/.pm2-start.sh" 512M /var/log/qorium-chatbot.out.log /var/log/qorium-chatbot.err.log; then
  rollback_current "$PREVIOUS_RELEASE"
  die "pm2 failed to start or reload qorium-chatbot"
fi
if ! pm2_start_or_reload qorium-marketing "$CURRENT_LINK/apps/marketing/.pm2-start.sh" 600M /var/log/qorium-marketing.out.log /var/log/qorium-marketing.err.log; then
  rollback_current "$PREVIOUS_RELEASE"
  die "pm2 failed to start or reload qorium-marketing"
fi

command pm2 save >/dev/null
command pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true
sleep 3
command pm2 describe qorium-marketing | grep -E "status|pid|uptime|memory" | head -5 || true
command pm2 describe qorium-chatbot | grep -E "status|pid|uptime|memory" | head -5 || true

MARKETING_PROBE="$(local_probe "http://127.0.0.1:${APP_PORT}")"
CHATBOT_PROBE="$(local_probe "http://127.0.0.1:${CHATBOT_PORT}/v1/chatbot/health")"
printf "  local probe :%s → HTTP %s\n" "$APP_PORT" "$MARKETING_PROBE"
printf "  local probe :%s → HTTP %s\n" "$CHATBOT_PORT" "$CHATBOT_PROBE"
if [[ "$MARKETING_PROBE" != "200" || "$CHATBOT_PROBE" != "200" ]]; then
  rollback_current "$PREVIOUS_RELEASE"
  die "local smoke failed after release flip (marketing=$MARKETING_PROBE chatbot=$CHATBOT_PROBE)"
fi

# ── 8. nginx vhost ─────────────────────────────────────────────────────────
log "Configuring nginx vhost for ${DOMAIN_PRIMARY}"
NGINX_VHOST="/etc/nginx/sites-available/qorium-marketing.conf"
PRIMARY_LE_CERT_DIR="/etc/letsencrypt/live/${DOMAIN_PRIMARY}"
CLOUDFLARE_ORIGIN_CERT="/etc/ssl/qorium/origin.pem"
CLOUDFLARE_ORIGIN_KEY="/etc/ssl/qorium/origin.key"
SSL_CERTIFICATE="${PRIMARY_LE_CERT_DIR}/fullchain.pem"
SSL_CERTIFICATE_KEY="${PRIMARY_LE_CERT_DIR}/privkey.pem"
PRIMARY_CERT_SOURCE="letsencrypt"

if [[ -f "$CLOUDFLARE_ORIGIN_CERT" && -f "$CLOUDFLARE_ORIGIN_KEY" ]]; then
  SSL_CERTIFICATE="$CLOUDFLARE_ORIGIN_CERT"
  SSL_CERTIFICATE_KEY="$CLOUDFLARE_ORIGIN_KEY"
  PRIMARY_CERT_SOURCE="cloudflare-origin"
fi

cat > "$NGINX_VHOST" <<NGINX
# Managed by infra/marketing-deploy.sh — re-runs overwrite this file.

# 1) Plain HTTP — Let's Encrypt + redirect
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN_PRIMARY} ${DOMAIN_WWW};

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        default_type "text/plain";
    }

    location / {
        return 301 https://${DOMAIN_PRIMARY}\$request_uri;
    }
}

# 2) HTTPS apex — proxy to Next.js
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN_PRIMARY};

    ssl_certificate     ${SSL_CERTIFICATE};
    ssl_certificate_key ${SSL_CERTIFICATE_KEY};
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # Talpro standard security headers (the Next.js app sets these too; nginx
    # reinforces in case Next ever drops them).
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), interest-cohort=()" always;

    # gzip on for HTML/CSS/JS — Next already handles for static assets but vhost
    # safety net for any uncompressed response.
    gzip on;
    gzip_proxied any;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_vary on;
    gzip_min_length 256;

    client_max_body_size 5M;
    limit_req zone=talpro_global burst=30 nodelay;
    limit_req_status 429;
    add_header X-RateLimit-Policy "10r/s + 30 burst per IP" always;

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }

    # Long cache for Next static assets
    location /_next/static/ {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_set_header Host \$host;
        expires 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}

# 3) HTTPS www — 301 to apex
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN_WWW};

    ssl_certificate     ${SSL_CERTIFICATE};
    ssl_certificate_key ${SSL_CERTIFICATE_KEY};

    return 301 https://${DOMAIN_PRIMARY}\$request_uri;
}
NGINX

mkdir -p /var/www/certbot
rm -f /etc/nginx/sites-enabled/qorium-marketing-bootstrap.conf
ln -sf "$NGINX_VHOST" /etc/nginx/sites-enabled/qorium-marketing.conf

# ── 9. Issue Let's Encrypt cert (only if missing) ──────────────────────────
if [[ "$PRIMARY_CERT_SOURCE" == "cloudflare-origin" ]]; then
  ok "using existing Cloudflare origin certificate for ${DOMAIN_PRIMARY}; skipping Let's Encrypt issuance"
elif [[ ! -d "$PRIMARY_LE_CERT_DIR" ]]; then
  log "Issuing Let's Encrypt certificate for ${DOMAIN_PRIMARY} + ${DOMAIN_WWW}"
  # Temporarily swap to an HTTP-only vhost so certbot can validate.
  cat > /etc/nginx/sites-available/qorium-marketing-bootstrap.conf <<NGINX_BOOT
server {
    listen 80;
    server_name ${DOMAIN_PRIMARY} ${DOMAIN_WWW};
    location ^~ /.well-known/acme-challenge/ { root /var/www/certbot; default_type "text/plain"; }
    location / { return 200 "qorium bootstrap"; add_header Content-Type "text/plain"; }
}
NGINX_BOOT
  ln -sf /etc/nginx/sites-available/qorium-marketing-bootstrap.conf /etc/nginx/sites-enabled/qorium-marketing-bootstrap.conf
  rm -f /etc/nginx/sites-enabled/qorium-marketing.conf
  nginx -t && systemctl reload nginx

  certbot certonly --webroot -w /var/www/certbot \
    -d "${DOMAIN_PRIMARY}" -d "${DOMAIN_WWW}" \
    --email "${CONTACT_EMAIL}" --agree-tos --non-interactive --no-eff-email

  rm -f /etc/nginx/sites-enabled/qorium-marketing-bootstrap.conf
  ln -sf "$NGINX_VHOST" /etc/nginx/sites-enabled/qorium-marketing.conf
fi

# Validate + reload
nginx -t || die "nginx config invalid — check above"
systemctl reload nginx
ok "nginx reloaded"

# ── 9b. qorium.in 301-redirect vhost + cert ────────────────────────────────
# Redirect every request on qorium.in (and www.qorium.in) → https://qorium.online
# Idempotent: re-runs reuse the same vhost path and cert (renewed on schedule
# by certbot's systemd timer / cron).
REDIRECT_VHOST="/etc/nginx/sites-available/qorium-in-redirect.conf"
REDIRECT_DNS_A=$(getent hosts "${DOMAIN_REDIRECT}" 2>/dev/null | awk '{print $1; exit}')
SERVER_PUBLIC_IP="${SERVER_PUBLIC_IP:-$(curl -fsS --max-time 5 https://api.ipify.org 2>/dev/null || true)}"
if [[ -z "$SERVER_PUBLIC_IP" ]]; then
  warn "could not detect this server's public IP; skipping ${DOMAIN_REDIRECT} redirect vhost until SERVER_PUBLIC_IP is provided"
elif [[ "${REDIRECT_DNS_A}" == "$SERVER_PUBLIC_IP" ]]; then
  log "Configuring 301 redirect vhost for ${DOMAIN_REDIRECT} → ${DOMAIN_PRIMARY}"

  if [[ ! -d "/etc/letsencrypt/live/${DOMAIN_REDIRECT}" ]]; then
    log "Issuing Let's Encrypt certificate for ${DOMAIN_REDIRECT} + ${DOMAIN_REDIRECT_WWW}"
    # HTTP-only bootstrap vhost so certbot can validate.
    cat > /etc/nginx/sites-available/qorium-in-bootstrap.conf <<NGINX_BOOT
server {
    listen 80;
    server_name ${DOMAIN_REDIRECT} ${DOMAIN_REDIRECT_WWW};
    location ^~ /.well-known/acme-challenge/ { root /var/www/certbot; default_type "text/plain"; }
    location / { return 200 "qorium.in bootstrap"; add_header Content-Type "text/plain"; }
}
NGINX_BOOT
    ln -sf /etc/nginx/sites-available/qorium-in-bootstrap.conf /etc/nginx/sites-enabled/qorium-in-bootstrap.conf
    nginx -t && systemctl reload nginx

    if certbot certonly --webroot -w /var/www/certbot \
      -d "${DOMAIN_REDIRECT}" -d "${DOMAIN_REDIRECT_WWW}" \
      --email "${CONTACT_EMAIL}" --agree-tos --non-interactive --no-eff-email; then
      ok "qorium.in cert issued"
    else
      warn "certbot failed for qorium.in — DNS may still be propagating; will retry on next deploy run"
      rm -f /etc/nginx/sites-enabled/qorium-in-bootstrap.conf
      systemctl reload nginx
    fi
    rm -f /etc/nginx/sites-enabled/qorium-in-bootstrap.conf
  fi

  if [[ -d "/etc/letsencrypt/live/${DOMAIN_REDIRECT}" ]]; then
    cat > "$REDIRECT_VHOST" <<NGINX
# Managed by infra/marketing-deploy.sh — re-runs overwrite this file.
# 301-redirect vhost: qorium.in + www.qorium.in → https://qorium.online

server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN_REDIRECT} ${DOMAIN_REDIRECT_WWW};
    location ^~ /.well-known/acme-challenge/ { root /var/www/certbot; default_type "text/plain"; }
    location / { return 301 https://${DOMAIN_PRIMARY}\$request_uri; }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN_REDIRECT} ${DOMAIN_REDIRECT_WWW};

    ssl_certificate     /etc/letsencrypt/live/${DOMAIN_REDIRECT}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN_REDIRECT}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    return 301 https://${DOMAIN_PRIMARY}\$request_uri;
}
NGINX

    ln -sf "$REDIRECT_VHOST" /etc/nginx/sites-enabled/qorium-in-redirect.conf
    nginx -t || die "nginx config invalid after qorium.in vhost"
    systemctl reload nginx
    ok "qorium.in 301-redirect vhost active"
  fi
else
  warn "${DOMAIN_REDIRECT} DNS not yet pointing at this server (${SERVER_PUBLIC_IP}); currently resolves to ${REDIRECT_DNS_A:-unresolved}; skipping redirect vhost. Re-run after DNS propagates (TTL 300s)."
fi

# ── 10. Smoke tests ────────────────────────────────────────────────────────
log "Smoke tests"
sleep 2
for path in "/" "/product" "/pricing" "/security" "/blog"; do
  code=$(curl -s -m 10 -o /dev/null -w "%{http_code}" "https://${DOMAIN_PRIMARY}${path}" || echo "000")
  printf "  https://${DOMAIN_PRIMARY}%-12s → %s\n" "$path" "$code"
done
curl -s -m 10 -o /dev/null -w "  http://127.0.0.1:${CHATBOT_PORT}/v1/chatbot/health → HTTP %{http_code}\n" "http://127.0.0.1:${CHATBOT_PORT}/v1/chatbot/health" || warn "chatbot health smoke failed"
# qorium.in redirect smoke (only if cert exists)
if [[ -d "/etc/letsencrypt/live/${DOMAIN_REDIRECT}" ]]; then
  code=$(curl -s -m 10 -o /dev/null -w "%{http_code}" -I "https://${DOMAIN_REDIRECT}/" || echo "000")
  loc=$(curl -s -m 10 -I "https://${DOMAIN_REDIRECT}/" 2>/dev/null | grep -i ^location: | tr -d '\r' | awk '{print $2}')
  printf "  https://%s/  → %s  (Location: %s)\n" "${DOMAIN_REDIRECT}" "$code" "${loc:-—}"
fi

log "DONE"
echo ""
echo "  Live URL:     https://${DOMAIN_PRIMARY}"
echo "  PM2 process:  pm2 logs qorium-marketing"
echo "  Chatbot:      pm2 logs qorium-chatbot · http://127.0.0.1:${CHATBOT_PORT}/v1/chatbot/health"
echo "  nginx vhost:  $NGINX_VHOST"
echo "  app dir:      $APP_DIR"
echo "  current:      $CURRENT_LINK -> $(readlink -f "$CURRENT_LINK")"
echo "  release:      $RELEASE_DIR"
echo "  shared env:   $SHARED_ENV_FILE  (edit Resend/Calendly later, then: safe-pm2 restart qorium-marketing)"
echo ""
echo "  To redeploy after a git push:"
echo "    cd $APP_DIR && safe-deploy qorium-marketing"
