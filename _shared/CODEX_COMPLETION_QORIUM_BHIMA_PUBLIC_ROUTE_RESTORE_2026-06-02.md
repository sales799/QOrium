# CODEX COMPLETION - QORIUM BHIMA - PUBLIC ROUTE RESTORE - 2026-06-02

## Status

COMPLETE.

## What Changed

- Configured and verified active-origin SSH alias `qorium-active-origin` for `187.127.155.150`.
- Deployed the active origin to the production merge that contains `/openapi.json` and chatbot proxy routes.
- Recreated the active-origin chatbot PM2 launcher after the branch switch exposed the missing runtime file.
- Verified active-origin local and origin-bypass probes for `/openapi.json`, `/api/chatbot/session`, and chatbot health.
- Rebuilt and reloaded old-origin marketing at `147.93.103.194` because Cloudflare apex `qorium.online` routed there at the time.
- Left Cloudflare DNS unchanged.

## Production Evidence

- Active origin `187.127.155.150`: `/opt/apps/qorium-marketing` on branch `codex/prod-merge-3256dd5`, HEAD `3256dd5`.
- Old origin `147.93.103.194`: `/opt/apps/qorium-marketing` on branch `codex/qorium-marketing-phase4-main`, HEAD `6ac741c`.
- Old-origin marketing verification passed: frozen install, 50 marketing tests, Next production build, PM2 reload, and local route probes.
- `https://qorium.online/openapi.json` returned HTTP `200` `application/json` with OpenAPI `3.1.0`.
- `POST https://qorium.online/api/chatbot/session` returned HTTP `200` JSON with a session greeting.
- `https://api.qorium.online/chatbot/v1/healthz` returned HTTP `200` chatbot health JSON.

## Remaining Infra Notes

- Cloudflare purge-capable token is now installed and verified. Token name: `QOrium Cache Purge`; scope: `qorium.online - Cache Purge:Purge`; local secret file: `/Users/talprouniversepro/.qorium-cloudflare-cache-purge.env` mode `600`.
- Verification proof from 2026-06-02: Cloudflare token verify returned success, zone lookup found exactly one `qorium.online` zone, and single-URL purge for `https://qorium.online/openapi.json` returned success.
- Later CEO decision on 2026-06-02: consolidation approved via `START 1` / `PROVE`.
- Apex consolidation is now complete: Cloudflare proxied `A qorium.online` points to active origin `187.127.155.150`; cache purge succeeded; 6 spaced public watch samples returned HTTP `200`.
- Old-origin `147.93.103.194` was reviewed after consolidation and remains useful manual rollback capacity. Forced-origin rollback smoke passed after controlled restart of old-origin `qorium-marketing` and `qorium-chatbot`.
- Old-origin durability caveat: `pm2-root.service` is enabled but failed, and disk is `82%` used; fix those before treating old origin as reboot-durable standby.
