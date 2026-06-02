#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

export NODE_ENV="${NODE_ENV:-production}"
export PORT="${PORT:-5110}"
export HOSTNAME="${HOSTNAME:-127.0.0.1}"

exec ./node_modules/next/dist/bin/next start -H "$HOSTNAME" -p "$PORT"
