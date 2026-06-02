# CODEX COMPLETION — QORIUM BHIMA — ACTIVE ORIGIN BLOCKER — 2026-06-01

## Status

RESOLVED on 2026-06-02 for the chatbot health route.

## Finding

The `talpro-vps` SSH alias points to `147.93.103.194`, but `QUEUE-QOrium.md` Run #17 records Cloudflare live origin for `qorium.online` and `api.qorium.online` as `187.127.155.150`. On 2026-06-02, the `qorium-active-origin` alias successfully reached `187.127.155.150`.

## Evidence

- Old origin `147.93.103.194`: SSH works, PM2 has 38 `qorium-*` processes online, and the chatbot/nginx repair was completed there.
- Active origin `187.127.155.150`: `qorium-active-origin` SSH works as root on port 2244.
- Active-origin PM2: 12/12 `qorium-*` processes online, including `qorium-chatbot` on port 5122.
- Public API hostname: `https://api.qorium.online/healthz` returns ReadyBank production JSON from the active Cloudflare origin.
- Public chatbot hostname: `https://api.qorium.online/chatbot/v1/healthz` now returns HTTP 200 chatbot JSON.

## Required CEO/Infra Action

No remaining CEO/infra action for the chatbot health route. Separate follow-up remains for public `https://qorium.online/openapi.json`, which is 200 at active-origin nginx but still 404 at the Cloudflare-fronted edge.
