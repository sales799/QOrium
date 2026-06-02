# CODEX COMPLETION — QORIUM BHIMA — ACTIVE ORIGIN CHATBOT ROUTE — 2026-06-02

## Status

DONE.

## Scope

Fixed the active-origin nginx route for the deployed `qorium-chatbot` service on `187.127.155.150`.

## Evidence

- SSH alias: `qorium-active-origin`
- Active origin: `187.127.155.150`
- Active checkout: `/opt/apps/qorium-marketing`
- Active checkout HEAD: `3256dd5` (`merge: deploy current QOrium marketing tip`)
- Chatbot service: `qorium-chatbot`, port `5122`
- PM2: 12 `qorium-*` processes online, 0 errored, 36 aggregate restarts
- Nginx backup: `/root/nginx-config-backups/qorium-marketing.conf.codex-bhima-chatbot-20260602T033900Z.bak`

## Verification

- `https://api.qorium.online/chatbot/v1/healthz` → HTTP 200 chatbot JSON
- `https://api.qorium.online/healthz` → HTTP 200 ReadyBank JSON
- `https://qorium.online/` → HTTP 200 HTML
- `https://admin.qorium.online/api/health` → HTTP 200 admin JSON

## Remaining Follow-Up

- `https://qorium.online/openapi.json` is HTTP 200 at active-origin nginx but still HTTP 404 through the public Cloudflare edge. This requires Cloudflare purge/edge-route repair, not chatbot service work.
