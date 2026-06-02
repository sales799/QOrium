# CODEX COMPLETION — QORIUM BHIMA — C1 MARKETING CHATBOT — 2026-06-01

## Status

LIVE on active origin as of 2026-06-02.

## Commits

- `9c12788` — `fix(marketing): harden chatbot and gated proof fallbacks`
- `6ac741c` — `fix(marketing): move chatbot off ats bridge port`

## Verification

- `npm run build` — PASS
- `npx tsc --noEmit` — PASS
- `npm test` — PASS
- `npm --prefix apps/marketing run build` — PASS
- `npm --prefix apps/marketing run test:e2e` — PASS, 10/10
- Active-origin PM2: `qorium-chatbot` online on port 5122.
- Active-origin nginx: `/chatbot/v1/healthz` proxies to `/v1/chatbot/health`.
- Public Cloudflare route: `https://api.qorium.online/chatbot/v1/healthz` returned HTTP 200 chatbot JSON on 2026-06-02.

## Notes

The prior active-origin SSH blocker is resolved via alias `qorium-active-origin`. Public OpenAPI edge freshness is a separate follow-up and does not block C1 chatbot health.
