#!/usr/bin/env bash
# Re-deploy the qorium v2 marketing preview from web/redesign-v2-magicui.
# Usage: bash /opt/apps/qorium-web-v2-preview/redeploy-preview.sh
set -euo pipefail
cd /opt/apps/qorium-web-v2-preview
git fetch origin web/redesign-v2-magicui
git reset --hard origin/web/redesign-v2-magicui
pnpm install --no-frozen-lockfile --prefer-offline
QORIUM_PREVIEW_BASE_PATH=/qorium-v2 pnpm --filter @qorium/web build
pm2 delete qorium-web-v2-preview >/dev/null 2>&1 || true
cd apps/web
QORIUM_PREVIEW_BASE_PATH=/qorium-v2 NODE_ENV=production PORT=4310 \
  pm2 start node_modules/next/dist/bin/next --name qorium-web-v2-preview -- start -H 127.0.0.1 -p 4310
cd ../..
sleep 2
curl -fsS -o /dev/null -w 'preview URL: code=%{http_code} size=%{size_download}\n' https://preview.talprouniverse.com/qorium-v2
echo 'Re-deploy complete.'
