# Codex Completion — QOrium State Correction Wave-2 Partial

**Date:** 2026-06-02
**Status:** SC-1, SC-2, and SC-4 complete. SC-3 partial because the MCP fleet-status implementation is outside this repository/tool surface in this Codex session.

## Completed

- Updated `CLAUDE.md` with current routing and PM2 fleet truth:
  - Active production origin: `qorium-active-origin` / `187.127.155.150`.
  - Old origin: `talpro-vps` / `147.93.103.194`, retained as rollback/legacy fleet standby.
  - Active-origin QOrium PM2: `12` services online, unstable restarts `0`.
  - Old-origin QOrium PM2: `38` services online, unstable restarts `0`.
- Added `apps/scripts/qorium-fleet-snapshot.sh`.
- Probed public API health paths:
  - `https://api.qorium.online/healthz` -> HTTP `200`.
  - `https://api.qorium.online/health` -> HTTP `200`.
  - `https://api.qorium.online/v1/healthz` -> HTTP `404`.
  - `https://api.qorium.online/v1/health` -> HTTP `404`.
- Created `infra/NIRANTAR-Replacement-Plan-v0.md` after live NIRANTAR headers confirmed `deprecation: true` and `sunset: Mon, 31 Aug 2026 00:00:00 GMT`.

## Remaining

- Patch `talpro_qorium_fleet_status` in the Talpro MCP registry/service so it uses raw PM2 across both origins or the same canonical source as the new snapshot script.
- Decide NIRANTAR sunset path after a 360-audit:
  - extend current service, or
  - replace with `nirantar-v2` (current default).

## Founder Action Required

- Sentry DSN/client-key blocker remains separate from this shard.
- NIRANTAR sunset path needs CEO/CTO decision after the planned 360-audit.
