# NIRANTAR Replacement Plan v0

**Status:** Stub plan created 2026-06-02 after live headers confirmed `deprecation: true` and `sunset: Mon, 31 Aug 2026 00:00:00 GMT`.

## Why This Exists

NIRANTAR is still live at `https://nirantar.talpro.in/api/health`, but the service advertises a sunset date of 2026-08-31. QOrium and the broader Talpro fleet depend on NIRANTAR for continuous audit, codex queue intake, scanner findings, recaps, and Telegram veto listening. A sunset window without a migration plan is an operational risk.

## Capabilities To Preserve

- Codex push queue: `/api/codex/push`.
- Scanner findings API and queue API.
- Continuous audit scanners: endpoint health, PM2 restart rate, VPS pressure, stale task plans, TypeScript drift, gitleaks, schema drift, npm audit, eslint drift.
- Recap generator for CEO/CTO state pulls.
- Telegram veto listener and founder escalation loop.
- Watchdog/fleet snapshot source of truth.

## Migration Options

1. **Extend NIRANTAR life:** remove the deprecation/sunset headers and maintain the current service indefinitely.
2. **Port to `nirantar-v2`:** keep the product boundary intact but rebuild the service with cleaner scanner and queue contracts.
3. **Split capabilities:** move scanners into Rakshak/Prahari and keep a thin codex-queue gateway for task intake and founder recaps.

## CTO Recommendation

Run a 360-audit of NIRANTAR's current callers and API surface before deciding. Default path is `nirantar-v2` if no CEO decision arrives, because it preserves the operational boundary while allowing the scanner registry and PM2 fleet source-of-truth issues to be fixed cleanly.

## Timeline

- 2026-07-01: complete NIRANTAR surface/caller audit and choose path.
- 2026-08-15: replacement implementation or life-extension patch complete.
- 2026-08-31: full cutover before the advertised sunset.

## Open Decisions

- CEO/CTO: extend current NIRANTAR or replace with `nirantar-v2`.
- CTO: whether QOrium fleet status should be sourced from NIRANTAR v2, MCP, or a shared PM2 registry service.
- Security: confirm whether Telegram veto listener secrets remain valid during migration.
