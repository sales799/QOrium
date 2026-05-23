#!/usr/bin/env bash
# Re-deploy the qorium v2 marketing preview from web/redesign-v2-magicui.
# Usage: safe-deploy qorium-web-v2-preview
set -euo pipefail
SAFE_DEPLOY_BIN="${SAFE_DEPLOY_BIN:-/usr/local/bin/safe-deploy}"

if [[ "${TALPRO_GBS_RAW_DEPLOY:-0}" != "1" ]]; then
  exec "$SAFE_DEPLOY_BIN" qorium-web-v2-preview "$@"
fi

cd /opt/apps/qorium-web-v2-preview
command git fetch origin web/redesign-v2-magicui
command git reset --hard origin/web/redesign-v2-magicui
command pnpm install --no-frozen-lockfile --prefer-offline
QORIUM_PREVIEW_BASE_PATH=/qorium-v2 command pnpm --filter @qorium/web build
command pm2 delete qorium-web-v2-preview >/dev/null 2>&1 || true
cd apps/web
QORIUM_PREVIEW_BASE_PATH=/qorium-v2 NODE_ENV=production PORT=4310 \
  command pm2 start node_modules/next/dist/bin/next --name qorium-web-v2-preview -- start -H 127.0.0.1 -p 4310
cd ../..
sleep 2
curl -fsS -o /dev/null -w 'preview URL: code=%{http_code} size=%{size_download}\n' https://preview.talprouniverse.com/qorium-v2
echo 'Re-deploy complete.'
