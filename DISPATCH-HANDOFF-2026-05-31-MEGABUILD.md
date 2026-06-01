# QOrium Dispatch Handoff — Mega Build — 2026-05-31

> **Purpose:** single canonical operating doc for `qorium-pipeline-keeper` while CEO is travelling. Supersedes single-thread dispatch from earlier today; both Codex lanes now monitored.

## 1. WHO IS RUNNING

| Lane | Codex Session ID | Machine | Account | Scope |
|---|---|---|---|---|
| A — Backend | `019e7c65-dfff-7023-8214-8bb5302ea424` | Mac Pro (BHIMA) | `bhaskar@talpro.in` | M1.A, M1.B, M2, M4, M11, M12, M13, M14, M21, infra B-track |
| B — Marketing | `019e7c65-5a2a-7df1-ba91-cd2ffff36f4b` | Mac Mini (ARJUN) | `bhaskar@talproindia.com` | W1–W15 (qorium.online site rebuild + programmatic SEO + LLM-info wedge) |

## 2. WHAT CLAUDE DISPATCH OWNS

- Read the pipeline queue every 30 min via the keeper.
- Surface true blockers (consolidated, capped per protocol).
- Expand the next AUTO item into a `CODEX_PENDING_*` shard when prerequisites clear.
- Emit `talpro_notify` only when something is actionable.
- Update the status log (`DISPATCH-STATUS-LOG.md`).

## 3. WHAT CLAUDE DISPATCH DOES NOT OWN

- Production code (Codex lanes do).
- Mid-mission PROVE prompts back to CEO — these get a doctrine reminder back to Codex instead.
- Financial actions, NEVER_TOUCH items, deleting live products.

## 4. ESCALATION CHANNELS

| Severity | Channel | Cap |
|---|---|---|
| info | `talpro_notify level=info` | 2 / hour |
| warn | `talpro_notify level=warn` (consolidated CEO asks) | 1 / 2 hours |
| crit | `talpro_notify level=crit` | immediate, no cap |
| founder_request | `mcp__talpro-cto__founder_request` | one consolidated ask per session |

## 5. CANON PRECEDENCE (read before any decision)

1. `09-QOrium-Constitution-v2.0.md` — RATIFIED operating system (Articles I–XI)
2. `04-QOrium-Blueprint-v1.md` — GTM + product
3. `07-CTO-Architecture-v1.md` — system design + tech stack
4. `task_plan_phase0_phase1.md` — Phase 0 + Phase 1 punchlist (canonical status)
5. `infra/*-v0-*.md` — per-module v0 designs (JD-Forge, IRT, Anti-Leak, Judge0, Audit-Log, Webhooks, SSO/SAML, ATS, Billing)
6. `QORIUM_MEGA_BUILD_v1.0.md` — **DELTA only** (added 2026-05-31: competitor crawl, gap matrix, marketing site IA, programmatic-SEO play, LLM-info wedge, two-lane KARYA framing)

**If Mega Build v1.0 conflicts with any item 1–5 above, items 1–5 win.** v1.0 maps M-numbered modules to existing v0-Spec docs and reuses the 3 SKUs (ReadyBank, JD-Forge, Stack-Vault). It does NOT introduce new SKUs.

## 6. WHERE FILES LIVE

| File | Path |
|---|---|
| Handoff (this doc) | `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/DISPATCH-HANDOFF-2026-05-31-MEGABUILD.md` |
| Pipeline queue (keeper fuel) | `_shared/QORIUM_PIPELINE_QUEUE_2026-05-31.md` (via MCP) → `/opt/mcp-shadow/.../projects/_shared/` |
| Lane A brief | `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/CODEX_PENDING_QORIUM_MEGA_BUILD_v1_LANE_A_BHIMA.md` |
| Lane B brief | `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/CODEX_PENDING_QORIUM_MEGA_BUILD_v1_LANE_B_ARJUN.md` |
| Status log | `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/DISPATCH-STATUS-LOG.md` |
| Keeper skill | `/Users/talprouniversepro/Claude/Scheduled/qorium-pipeline-keeper/SKILL.md` |
| Memory (handoff) | `project_qorium_dispatch_handoff_2026_05_31_megabuild` |

## 7. CEO INTERVENTION POINTS

CEO can intervene any time via Claude Dispatch by:
- **Approving an ASK item** → send the answer; dispatch expands the AUTO downstream.
- **Pausing a lane** → reply "pause BHIMA" or "pause ARJUN"; dispatch sets the keeper to skip expanding shards for that lane and notifies the running Codex session via a `CODEX_PENDING_PAUSE_<lane>.md` shard.
- **Force-prioritizing an item** → reply "promote A.N" or "promote B.N"; dispatch reorders the queue.
- **Killing a lane** → reply "kill lane A" or "kill lane B"; dispatch files `CODEX_PENDING_HALT_<lane>.md` and stops watching that session.
- **Adding new work** → reply "add to queue: <description>"; dispatch appends to QORIUM_PIPELINE_QUEUE_2026-05-31.md with default priority MED.

## 8. WHAT YOU GET PINGED FOR (CEO summary)

| Event | Ping | Cap |
|---|---|---|
| Either lane ships a module | info | 2 / hr |
| Open CEO asks consolidated | warn | 1 / 2hr |
| qorium-* service errored after one heal attempt | crit | immediate |
| Pipeline stalled (8h no completions, both lanes) | crit | immediate |
| Disk >85% or sudhaarak crit | crit | immediate |

## 9. QUEUE DEPTH AT HANDOFF

- **Lane A (BHIMA):** 12 items (A.1 → A.13), 8 immediate AUTO, 1 DEFERRED, mapping to existing v0-Specs where they exist.
- **Lane B (ARJUN):** 12 items (B.1 → B.12), 10 immediate AUTO, 2 ASK (B.5 pricing, B.7 JD list), 1 DEFERRED.
- **Lane C (cross-cutting):** 4 items.

Estimated runway before queue drains: 4–7 days of continuous Codex execution. Keeper refills opportunistically as items complete; rebrief reminder before then.

## 10. RESUME COMMAND (when CEO returns)

> "Resume QOrium dispatch"

Dispatch will: (a) read this handoff, (b) read the pipeline queue, (c) read status log, (d) summarize what happened while CEO was away, (e) list any open consolidated `founder_request` items, (f) hand control back.

---

**Filed:** 2026-05-31
**Author:** Claude (Apex Brain), dispatch role
**Approval:** auto-execute under autonomous mode (Constitution Article II) unless CEO replies STOP
