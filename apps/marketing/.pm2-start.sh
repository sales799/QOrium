#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

export NODE_ENV="${NODE_ENV:-production}"

if [[ -f .env.production.local ]]; then
  set -a
  source .env.production.local
  set +a
fi

export PORT="${PORT:-5110}"
MARKETING_HOST="${QORIUM_MARKETING_HOST:-127.0.0.1}"

exec ./node_modules/next/dist/bin/next start -H "$MARKETING_HOST" -p "$PORT"
