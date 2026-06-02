#!/usr/bin/env bash
set -e
cd "/opt/apps/qorium-marketing"
if [[ -f "/opt/apps/qorium-marketing/apps/marketing/.env.production" ]]; then
  set -a
  source "/opt/apps/qorium-marketing/apps/marketing/.env.production"
  set +a
fi
export NODE_ENV=production
export CHATBOT_PORT=5122
export PORT=5122
export QORIUM_PUBLIC_BASE_URL=https://qorium.online
export CHATBOT_SYSTEM_PROMPT_PATH="/opt/apps/qorium-marketing/services/chatbot/prompts/system.v1.md"
exec node services/chatbot/dist/index.js
