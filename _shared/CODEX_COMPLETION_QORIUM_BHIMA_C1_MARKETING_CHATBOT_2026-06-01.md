# CODEX COMPLETION — QORIUM BHIMA — C1 MARKETING CHATBOT — 2026-06-01

## Status

PARTIAL LIVE: code, tests, old-origin PM2, and old-origin nginx are complete. Cloudflare active-origin deploy is blocked by SSH credentials for `187.127.155.150`.

## Commits

- `9c12788` — `fix(marketing): harden chatbot and gated proof fallbacks`
- `6ac741c` — `fix(marketing): move chatbot off ats bridge port`

## Verification

- `npm run build` — PASS
- `npx tsc --noEmit` — PASS
- `npm test` — PASS
- `npm --prefix apps/marketing run build` — PASS
- `npm --prefix apps/marketing run test:e2e` — PASS, 10/10
- Old-origin PM2: `qorium-chatbot` online on port 5122 with 0 restarts.
- Old-origin direct nginx: `/chatbot/v1/healthz` returned 200 when resolved to the repaired origin.

## Blocker

Public `https://api.qorium.online/chatbot/v1/healthz` is served by the active Cloudflare origin `187.127.155.150`, not the old `talpro-vps` alias. SSH to `187.127.155.150:2244` rejected the available key.
