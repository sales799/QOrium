# FINDING — qorium_fleet_status registry blindspot

**Filed:** 2026-06-01
**Severity:** MED (observability gap, not an outage — no customer impact)
**Origin:** CTO live-state review of qorium.online
**Owner of fix:** Codex lane (apex rule — Claude specs, Codex codes)
**Status:** OPEN — awaiting Codex execution

## Symptom
`talpro_qorium_fleet_status` returns:
```json
{ "total": 0, "services_count": 0, "online": 0, "errored": 0, "by_service": [] }
```
…while `talpro_pm2_list` shows the qorium-* fleet online and healthy:
`qorium-marketing`, `qorium-api` ×2, `qorium-admin` ×2, `qorium-jd-forge` ×2,
`qorium-stack-vault` ×2, `qorium-leak-crawler` — all `status: online`, restarts ↺=2, mem normal.

## Root-cause hypothesis
The fleet-status tool enumerates a hardcoded/registered list of "43 Qorium ATS
microservices" against a namespace or service registry that the **live** qorium-*
PM2 processes are NOT registered in. They run under PM2 namespace `default`.
Two likely causes (verify before coding):
1. Registry expects a dedicated `qorium` PM2 namespace; live procs are in `default`.
2. Registry is a static manifest of 43 planned services, none of which match the
   actual deployed process names, so the matcher returns 0.

## Required fix (direction, not prescription)
- Enumerate qorium-* by **process-name prefix match** against `pm2 jlist`
  (`name LIKE 'qorium-%'`), not against a static 43-service manifest.
- Reconcile the "43 expected" denominator with reality: either register the live
  services into the expected manifest, or compute `expected` from the deployment
  manifest the build actually ships.
- Keep PM2 as the canonical source until the registry matches it.

## Verification (definition of done)
- `talpro_qorium_fleet_status.online` matches the count of `online` qorium-* procs
  in `talpro_pm2_list` (currently 11 process instances across 7 service types).
- `errored_list` / `high_restart` populate correctly when a qorium-* proc degrades.
- Add a NIRANTAR endpoint-health entry (or watchdog) for the live qorium-* set so
  a future drop is caught automatically.

## Why not filed directly into NIRANTAR
NIRANTAR's write endpoints (`/api/scanners/:name/run`, POST) return **403 (nginx)**
from the talpro-cto MCP path, and findings are scanner-emitted (no manual-inject
API). This file is the actionable artifact for the Codex lane; admin notified via
Telegram. When the registry fix lands, NIRANTAR's endpoint-health scanner will
enumerate the qorium-* set on its own cadence.
