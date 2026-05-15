#!/usr/bin/env bash
set -e
cd "/opt/apps/qorium-marketing/apps/marketing"
export NODE_ENV=production
export PORT=5110
export HOSTNAME=127.0.0.1
# Next.js 15 auto-loads .env.production from cwd
exec ./node_modules/next/dist/bin/next start -H 127.0.0.1 -p 5110
