# CODEX COMPLETION - QORIUM BHIMA - PUBLIC ROUTE RESTORE - 2026-06-02

## Status

COMPLETE.

## What Changed

- Configured and verified active-origin SSH alias `qorium-active-origin` for `187.127.155.150`.
- Deployed the active origin to the production merge that contains `/openapi.json` and chatbot proxy routes.
- Recreated the active-origin chatbot PM2 launcher after the branch switch exposed the missing runtime file.
- Verified active-origin local and origin-bypass probes for `/openapi.json`, `/api/chatbot/session`, and chatbot health.
- Rebuilt and reloaded old-origin marketing at `147.93.103.194` because Cloudflare apex `qorium.online` routes there.
- Left Cloudflare DNS unchanged.

## Production Evidence

- Active origin `187.127.155.150`: `/opt/apps/qorium-marketing` on branch `codex/prod-merge-3256dd5`, HEAD `3256dd5`.
- Old origin `147.93.103.194`: `/opt/apps/qorium-marketing` on branch `codex/qorium-marketing-phase4-main`, HEAD `6ac741c`.
- Old-origin marketing verification passed: frozen install, 50 marketing tests, Next production build, PM2 reload, and local route probes.
- `https://qorium.online/openapi.json` returned HTTP `200` `application/json` with OpenAPI `3.1.0`.
- `POST https://qorium.online/api/chatbot/session` returned HTTP `200` JSON with a session greeting.
- `https://api.qorium.online/chatbot/v1/healthz` returned HTTP `200` chatbot health JSON.

## Remaining Infra Notes

- Cloudflare purge-capable token is still unavailable. This is no longer blocking the current public route, but it remains useful for future purge-only repairs.
- CEO decision on 2026-06-02: `KEEP NOW`. Apex `qorium.online` and API `api.qorium.online` intentionally remain on different origins for now because both tested public surfaces are operational.
- Consolidation to `187.127.155.150` remains a future infra cleanup, not an urgent production repair.
