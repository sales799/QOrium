#!/usr/bin/env bash
# qorium-marketing — VPS 1 deploy bootstrap.
#
# Run once on VPS 1 (147.93.103.194) as root via SSH from the CEO MacBook:
#   ssh -p 2244 root@147.93.103.194
#   curl -sfL https://raw.githubusercontent.com/sales799/qorium/claude/qorium-marketing-site-Z4gdI/infra/marketing-deploy.sh | bash
#
# If the repo is private, instead:
#   git clone -b claude/qorium-marketing-site-Z4gdI https://<USER>:<PAT>@github.com/sales799/qorium.git /opt/apps/qorium-marketing
#   cd /opt/apps/qorium-marketing && bash infra/marketing-deploy.sh
#
# Idempotent. Safe to re-run on every deploy. Does NOT touch existing services
# (n8n, ReadyBank API, Postgres, Redis). Only adds:
#   - PM2 process: qorium-marketing on port 5110
#   - nginx vhost: qorium.online (apex + www)
#   - Let's Encrypt cert for qorium.online + www.qorium.online

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/sales799/qorium.git}"
BRANCH="${BRANCH:-claude/qorium-marketing-site-Z4gdI}"
APP_DIR="/opt/apps/qorium-marketing"
APP_PORT="5110"
DOMAIN_PRIMARY="qorium.online"
DOMAIN_WWW="www.qorium.online"
CONTACT_EMAIL="hello@qorium.online"
NODE_MAJOR="22"
PNPM_VERSION="10.33.0"

log() { printf "\n\033[1;36m▶ %s\033[0m\n" "$*"; }
ok()  { printf "  \033[1;32m✓\033[0m %s\n" "$*"; }
warn(){ printf "  \033[1;33m!\033[0m %s\n" "$*"; }
die() { printf "\n\033[1;31m✗ %s\033[0m\n" "$*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || die "Must run as root (use sudo)."

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
  npm install -g "pnpm@$PNPM_VERSION" >/dev/null
fi
command -v pm2 >/dev/null || npm install -g pm2 >/dev/null
ok "pnpm $(pnpm --version) · pm2 $(pm2 --version 2>/dev/null | tail -1)"

# ── 4. Clone / pull ────────────────────────────────────────────────────────
log "Syncing repo to $APP_DIR (branch: $BRANCH)"
mkdir -p /opt/apps
if [[ -d "$APP_DIR/.git" ]]; then
  cd "$APP_DIR"
  git fetch --depth=1 origin "$BRANCH"
  git reset --hard "origin/$BRANCH"
  git clean -fd
else
  if [[ -d "$APP_DIR" ]] && [[ -n "$(ls -A "$APP_DIR" 2>/dev/null)" ]]; then
    die "$APP_DIR exists and is not empty. Move it aside or delete it before rerunning."
  fi
  git clone --depth=1 --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi
ok "checkout: $(git rev-parse --short HEAD) — $(git log -1 --format=%s)"

# ── 5. Install + build ─────────────────────────────────────────────────────
log "Installing workspace dependencies"
pnpm install --frozen-lockfile --prefer-offline 2>&1 | tail -20
ok "deps installed"

log "Building marketing app (Next.js 15)"
pnpm --filter @qorium/marketing build 2>&1 | tail -25
[[ -d "$APP_DIR/apps/marketing/.next" ]] || die "build did not produce .next/ — check log above"
ok "build complete · $(du -sh "$APP_DIR/apps/marketing/.next" | cut -f1)"

# ── 6. Env file ────────────────────────────────────────────────────────────
ENV_FILE="$APP_DIR/apps/marketing/.env.production"
if [[ ! -f "$ENV_FILE" ]]; then
  log "Creating $ENV_FILE (you'll edit Resend / Plausible / Calendly later)"
  cat > "$ENV_FILE" <<EOF
NEXT_PUBLIC_SITE_URL=https://${DOMAIN_PRIMARY}
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=${DOMAIN_PRIMARY}
NODE_ENV=production
PORT=${APP_PORT}
HOSTNAME=127.0.0.1

# Fill in when ready:
# RESEND_API_KEY=
# CONTACT_TO_EMAIL=${CONTACT_EMAIL}
# CONTACT_FROM_EMAIL=noreply@${DOMAIN_PRIMARY}
# GMAIL_USER=
# GMAIL_APP_PASSWORD=
EOF
  chmod 600 "$ENV_FILE"
  ok "$ENV_FILE created (chmod 600)"
else
  ok "$ENV_FILE already exists, leaving untouched"
fi

# ── 7. PM2 process ─────────────────────────────────────────────────────────
log "Configuring PM2"

# Tiny launcher script — most reliable across PM2 versions, avoids the
# ecosystem-file format brittleness we hit earlier.
LAUNCHER="$APP_DIR/apps/marketing/.pm2-start.sh"
cat > "$LAUNCHER" <<LAUNCHER_EOF
#!/usr/bin/env bash
set -e
cd "$APP_DIR/apps/marketing"
export NODE_ENV=production
export PORT=${APP_PORT}
export HOSTNAME=127.0.0.1
# Next.js 15 auto-loads .env.production from cwd
exec ./node_modules/next/dist/bin/next start -H 127.0.0.1 -p ${APP_PORT}
LAUNCHER_EOF
chmod +x "$LAUNCHER"

# If a previous attempt left a broken entry, clean it up.
pm2 delete qorium-marketing >/dev/null 2>&1 || true
# Remove any stale ecosystem file from the previous version of this script.
rm -f "$APP_DIR/infra/qorium-marketing.pm2.cjs"

pm2 start "$LAUNCHER" \
  --name qorium-marketing \
  --max-memory-restart 600M \
  --log-date-format 'YYYY-MM-DD HH:mm:ss' \
  --merge-logs \
  --time \
  --output /var/log/qorium-marketing.out.log \
  --error /var/log/qorium-marketing.err.log

pm2 save >/dev/null
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true
sleep 3
pm2 describe qorium-marketing | grep -E "status|pid|uptime|memory" | head -5 || true
curl -s -m 5 -o /dev/null -w "  local probe :${APP_PORT} → HTTP %{http_code}\n" "http://127.0.0.1:${APP_PORT}" || warn "local probe failed"

# ── 8. nginx vhost ─────────────────────────────────────────────────────────
log "Configuring nginx vhost for ${DOMAIN_PRIMARY}"
NGINX_VHOST="/etc/nginx/sites-available/qorium-marketing.conf"
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

    # SSL certificates installed by certbot below
    ssl_certificate     /etc/letsencrypt/live/${DOMAIN_PRIMARY}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN_PRIMARY}/privkey.pem;
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

    ssl_certificate     /etc/letsencrypt/live/${DOMAIN_PRIMARY}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN_PRIMARY}/privkey.pem;

    return 301 https://${DOMAIN_PRIMARY}\$request_uri;
}
NGINX

mkdir -p /var/www/certbot
ln -sf "$NGINX_VHOST" /etc/nginx/sites-enabled/qorium-marketing.conf

# ── 9. Issue Let's Encrypt cert (only if missing) ──────────────────────────
if [[ ! -d "/etc/letsencrypt/live/${DOMAIN_PRIMARY}" ]]; then
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

# ── 10. Smoke tests ────────────────────────────────────────────────────────
log "Smoke tests"
sleep 2
for path in "/" "/product" "/pricing" "/security" "/blog"; do
  code=$(curl -s -m 10 -o /dev/null -w "%{http_code}" "https://${DOMAIN_PRIMARY}${path}" || echo "000")
  printf "  https://${DOMAIN_PRIMARY}%-12s → %s\n" "$path" "$code"
done

log "DONE"
echo ""
echo "  Live URL:    https://${DOMAIN_PRIMARY}"
echo "  PM2 process: pm2 logs qorium-marketing"
echo "  nginx vhost: $NGINX_VHOST"
echo "  app dir:     $APP_DIR"
echo "  env:         $ENV_FILE  (edit Resend/Calendly later, then: pm2 restart qorium-marketing)"
echo ""
echo "  To redeploy after a git push:"
echo "    cd $APP_DIR && bash infra/marketing-deploy.sh"
