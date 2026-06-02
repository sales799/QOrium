# CODEX PENDING — QOrium State Correction Wave-2

**Queued by:** CTO (Claude, Super Brain). **Executors:** Codex BHIMA (registry + watchdog fixes) + ARJUN (CLAUDE.md doc update) — joint.
**Apex rule:** Codex writes ALL code; Claude does not.
**Date queued:** 2026-06-02
**Trigger:** Live-state pull on 2026-06-02 surfaced 3 drifts between recorded canon and reality. This shard closes them.
**Honesty hard-rule:** the canon (CLAUDE.md + watchdog registry + status tools) MUST match reality. Stale canon is a doctrine violation. Every Claude session that pulls stale state then makes decisions on it is a leak — close the leak.

## What this ships

3 housekeeping corrections + 1 forward-looking spec stub:

| Item | Type | Owner |
|---|---|---|
| SC-1 | Update QOrium project `CLAUDE.md` to reflect real PM2 fleet (38 procs, 13+ named services) | ARJUN |
| SC-2 | Fix `api.qorium.online` health-path drift (likely `/healthz` not `/health` or `/v1/health`) + update watchdogs | BHIMA |
| SC-3 | Fix `talpro_qorium_fleet_status` registry to report all live qorium-* services (currently reports 0/43; should report ≥ 38) | BHIMA |
| SC-4 | NIRANTAR sunset planning shard stub — `infra/NIRANTAR-Replacement-Plan-v0.md` outline | BHIMA |

## SC-1 — QOrium CLAUDE.md fleet correction

### Drift evidence (verified 2026-06-02 12:01 UTC)
- CLAUDE.md (project file) says: "12 `qorium-*` processes online" on active-origin (active-origin snapshot at 2026-06-02T04:04Z).
- Reality on talpro-vps PM2 list (2026-06-02 12:01 UTC): **38 qorium-* processes online** across at least these named services: `qorium-admin, qorium-ai-pair-coding-orchestrator, qorium-api, qorium-api-key-mgmt, qorium-ats-bridge, qorium-audit-log, qorium-billing, qorium-candidate-portal, qorium-chatbot, qorium-docs, qorium-irt-calibration, qorium-jd-forge, qorium-leak-crawler, qorium-stack-vault` (plus likely more).
- The 12-proc number was the active-origin only; CLAUDE.md correctly notes dual-origin but does not enumerate the full talpro-vps fleet.

### Fix
- Update CLAUDE.md "PM2 ground truth" section to enumerate ALL qorium-* services across BOTH origins (active-origin + talpro-vps).
- Add a fleet-discovery footnote: "Future sessions: run `ssh talpro-vps 'pm2 jlist | python3 -c ...'` to confirm the fleet rather than trust this section blindly."
- Reference the live discovery script (write to `apps/scripts/qorium-fleet-snapshot.sh` if missing).

### Exit
- CLAUDE.md committed with corrected fleet enumeration.
- Discovery script committed at the path above.
- Future CTO sessions will see accurate canon on first read.

## SC-2 — api.qorium.online health-path drift

### Drift evidence (verified 2026-06-02 12:06 UTC)
- `curl -I https://api.qorium.online/v1/health` → **404** with `application/problem+json`.
- The qorium-api service is up (PM2 #1 cluster, 6D uptime, 0 errored).
- Likely correct paths: `/healthz` (typical Node convention), `/health` (no v1), or `/v1/healthz`. Codex must probe and document the truth.

### Fix
- Probe the qorium-api service to find the actual health-path. Likely candidates: `/healthz`, `/health`, `/v1/healthz`.
- Update every reference in:
  - CLAUDE.md (project file)
  - watchdog registry (whatever `mcp__talpro-cto__talpro_watchdog_*` tools point at)
  - N11 OpenAPI docs (when N11 shard ships)
  - Rakshak audit checks (so api.qorium.online sub-score doesn't get a false flag)
- Add a route alias if backward-compat is needed (alias old path → new path, return 200 from both).

### Exit
- `curl -I https://api.qorium.online/<correct-path>` → 200.
- All watchdogs green on the correct path.
- CLAUDE.md cites the correct path.
- Future Rakshak runs don't false-flag the api endpoint.

## SC-3 — qorium-fleet-status registry fix

### Drift evidence
- CLAUDE.md notes: "MCP `talpro_pm2_list` and any `talpro_qorium_fleet_status`-style registry may show a filtered/shadow fleet that differs from raw PM2 on the origin. Raw PM2 on `qorium-active-origin` is canonical."
- Live state 2026-06-02: 38 qorium-* PM2 procs visible via `pm2 jlist`; `talpro_qorium_fleet_status` tool (when last invoked) reported 0/43 services.
- Root cause hypothesis: registry enumerates a named PM2 namespace that does not include `default`; OR registry only polls qorium-active-origin and skips talpro-vps.

### Fix
- Locate `talpro_qorium_fleet_status` implementation (likely in talpro-mcp-server repo).
- Replace namespace-filter logic with: `pm2 jlist | filter name ~ ^qorium-` across BOTH origins (active + talpro-vps).
- Verify: tool returns ≥ 38 live services post-fix.
- Cross-reference with NIRANTAR PM2-fleet scanner (NR-02 already queued — same root issue, deduplicate work if both touch the same code).

### Exit
- `talpro_qorium_fleet_status` reports ≥ 38 services.
- Watchdog list matches PM2 list (no orphans).
- NR-02 NIRANTAR scanner consumes the same canonical data source (single source of truth).

## SC-4 — NIRANTAR sunset replacement plan stub

### Drift evidence
- `curl -I https://nirantar.talpro.in/api/health` returns 200 with headers `deprecation: true` and `sunset: Mon, 31 Aug 2026 00:00:00 GMT`.
- NIRANTAR is QOrium's (and broader Talpro fleet's) continuous-audit + codex-queue plane. 90-day sunset window without a replacement plan = ecosystem risk.
- Memory key `project_nirantar_archive_ready_2026_05_25` certified archive-ready; sunset is a separate, newer concern.

### Fix (this shard creates a stub spec; full spec is its own Wave-3 effort)
- Author `infra/NIRANTAR-Replacement-Plan-v0.md` with:
  - Required capabilities to preserve: codex-push queue (`/api/codex/push`), continuous-audit scanners, findings API, recap generator, Telegram veto listener.
  - Migration options: (a) extend NIRANTAR life by removing `deprecation` header + maintaining indefinitely, (b) port to new service `nirantar-v2`, (c) split capabilities across Rakshak + Prahari + a thin codex-queue gateway.
  - Recommendation: BHIMA decides after a 360-audit of NIRANTAR's actual surface area + caller list. CTO sign-off required.
  - Timeline: spec by 2026-07-01; implementation by 2026-08-15; full cutover by 2026-08-31 sunset.

### Exit
- Stub spec committed.
- Memory key `nirantar_sunset_replacement_plan_2026_08_31` created with reference.
- Brief surfaces to founder via T3-style Roadmap row when T3 ships.

## Coordination

- BHIMA owns SC-2, SC-3, SC-4.
- ARJUN owns SC-1 (CLAUDE.md edit + script).
- Joint: both lanes consult on NR-02 NIRANTAR scanner overlap with SC-3.

## Parallel-work guard

`gh pr list --state all --search "state-correction"`. Lock `project-lock:qorium-state-correction-w2`.

## Open input (non-blocking)

- CEO: NIRANTAR sunset decision (extend life vs replace) — CTO recommendation comes with the full spec stub above. Default if no CEO input: replace via 360-audit-driven nirantar-v2.

## Reference

Sister Wave-2 shards (Codex picks these up alongside):
- `CODEX_PENDING_QORIUM_ASSESSMENT_FORMATS_WAVE_2_2026-06-02.md` (F2, F3, F6, F9)
- `CODEX_PENDING_QORIUM_ENTERPRISE_SURFACE_WAVE_2_2026-06-02.md` (X4, R2, N11, E4)
- `CODEX_PENDING_QORIUM_FLAG_POINTERS_WAVE_2_2026-06-02.md` (E1, N12, E3)
- Wave-1 (already shipped on `qorium/specs`):
  - `CODEX_PENDING_QORIUM_C1_MARKETING_CHATBOT_2026-06-01.md`
  - `CODEX_PENDING_QORIUM_PROGRAMMATIC_SEO_FACTORY_2026-06-01.md`
  - `CODEX_PENDING_QORIUM_TRUST_SHELL_2026-06-01.md`
  - `CODEX_PENDING_QORIUM_INTERACTIVE_PROOF_2026-06-01.md`
