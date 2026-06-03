# NIRANTAR Replacement Plan v0 (Stub)

**Status:** Stub for CTO + CEO sign-off. Full design follows after 360-audit of NIRANTAR's actual surface area + caller list.
**Trigger:** NIRANTAR returns `deprecation: true; sunset: Mon, 31 Aug 2026 00:00:00 GMT` headers on `/api/health` (verified 2026-06-02). Without action, the Talpro ecosystem loses its continuous-audit + codex-queue plane on 2026-08-31.
**Authored:** 2026-06-02 by Claude (CTO Super Brain). Originating shard: `CODEX_PENDING_QORIUM_STATE_CORRECTION_WAVE_2_2026-06-02.md` SC-4.
**Apex rule:** Claude writes specs; Codex BHIMA + ARJUN write code.

## Background

NIRANTAR is the continuous-audit + codex-queue plane for the Talpro Universe. As of 2026-06-02, it runs on `talpro-vps` at `/opt/apps/nirantar` (port 11445 loopback, public-fronted at `nirantar.talpro.in` with Basic auth). Public health endpoint is open, internal endpoints (`/api/status`, `/api/recap`, `/api/findings`) are auth-gated.

Live version: `v0.8.4`. Code certified ARCHIVE-READY 2026-05-25 (memory key `project_nirantar_archive_ready_2026_05_25`). Loopback queue holds 990+ items across 23 projects; 87 pending as of 2026-06-02T12:01Z.

## Why a replacement (not just header removal)

The sunset header could in theory be deleted to extend life. But three signals suggest a replacement is the right call:

1. **Architectural debt.** NIRANTAR conflates 5 concerns (codex-queue, scanner registry, findings DB, recap generator, Telegram veto listener). A replacement can split these cleanly.
2. **MCP observability gap.** `nirantar_status` / `nirantar_recap` / `nirantar_findings` MCP tools return 401 against the public origin (loopback works). The replacement should expose canonical internal endpoints + first-class MCP authentication.
3. **Coverage gap.** NIRANTAR scanners (`i18n-link-coverage`, `nirantar-self-audit`, `sitemap-coverage`) miss PM2 fleet drift — the 38 qorium-* services are not monitored. NR-02 brief queued; replacement should make this the first-class case.

## Required capabilities to preserve

The replacement MUST preserve every consumer touch-point currently in production:

| Capability | Current surface | Consumer count |
|---|---|---|
| Codex queue push | `POST /api/codex/push` (loopback no-auth, public Basic auth) | Multi-project — qorium-keeper, qorium-active-origin Codex sessions, ad-hoc CEO pushes |
| Codex queue read | `GET /api/codex/queue` | Codex BHIMA/ARJUN sweep cycles |
| Findings | `GET /api/findings` (auth) | MCP tools, ad-hoc audit |
| Recap | `GET /api/recap` (auth) | CTO session recap pulls |
| Status | `GET /api/status` (auth) | Monitor + Telegram digest |
| Health | `GET /api/health` (public) | External watchdogs |
| Scanner registry | i18n-link-coverage, nirantar-self-audit, sitemap-coverage | NIRANTAR internal |
| Telegram veto listener | runs as PM2 process | Founder mobile workflow |
| Brahma/Karya/Heartbeat triad | runs as PM2 processes on `qorium-active-origin` (NOT talpro-vps) | Cross-ecosystem |
| Codex push smart-routing | NIRANTAR's `pushBriefs()` routes by content into `_shared/CODEX_PENDING_<project>.md` | Multi-project queues |

## Three replacement options

### Option A — Extend NIRANTAR life

Delete the `deprecation` and `sunset` response headers. Continue maintaining the codebase indefinitely. Address coverage gaps (NR-02) within the existing scanner suite. Address MCP observability gap (NR-01) by repointing the MCP tools at loopback or injecting Basic auth.

**Pros:** Lowest effort. No migration risk. Preserves caller contracts.

**Cons:** Doesn't address architectural debt. Scanner suite remains overloaded. No catalyst to refactor.

**Effort:** 1–2 hours for header removal + scanner extensions.

### Option B — Build `nirantar-v2`

A clean rebuild that preserves all current endpoint contracts (URL paths, request shapes, response envelopes) but factors the 5 concerns into a small set of services. Suggested split:

- `nirantar-v2-queue` — Codex queue (push, read, dedupe, smart-router)
- `nirantar-v2-scanners` — pluggable scanner registry (i18n, sitemap, PM2-fleet, security headers)
- `nirantar-v2-findings` — findings DB + read API
- `nirantar-v2-recap` — recap generator
- `nirantar-v2-listener` — Telegram veto + alerts

Each runs as its own PM2 process. Public-facing edge stays at `nirantar.talpro.in` with the same routes. MCP tools either tunnel via SSH loopback (preferred) or use canonical Basic auth (fallback).

**Pros:** Clean separation. First-class PM2-fleet scanner. MCP works out of the box. Refactor catalyst.

**Cons:** Higher migration risk. More moving parts in production. Caller contracts must be preserved bug-for-bug to avoid breaking the qorium-keeper or any of the 23 currently-active project queues.

**Effort:** 2–3 weeks of BHIMA + ARJUN work. Migration cutover window of 1 week with both versions running in parallel.

### Option C — Split capabilities across Rakshak + Prahari + thin gateway

Push scanner duties to Rakshak (which already runs audit-driven scans). Push veto/notification to Prahari. Keep only the Codex queue as a thin standalone gateway. Findings + recap moved into Rakshak's domain.

**Pros:** Reuses existing infrastructure. Fewer new services.

**Cons:** Forces Rakshak to grow continuous-scan responsibility (it's currently event-driven). Requires gateway to stand up cleanly. Caller surface shifts across 2 services instead of 1 — higher integration risk.

**Effort:** 3–4 weeks across multiple service teams.

## Recommendation (CTO default)

**Option B — Build `nirantar-v2`.** Rationale:

1. The architectural debt cleanup is overdue; the deprecation header is the natural catalyst.
2. NR-01 and NR-02 (MCP repoint + PM2-fleet scanner) are easier to land in a refactored codebase than retrofitted into NIRANTAR v0.8.x.
3. The migration risk is manageable: caller contracts are well-documented in `reference_nirantar_codex_push_endpoint` memory; the smart-router shape is stable; running both versions in parallel during cutover is straightforward.
4. NIRANTAR currently runs on talpro-vps not qorium-active-origin — a refactor is a natural opportunity to relocate to the right host topology (host choice TBD at full-spec time).

**CEO override expected** if cost / pipeline pressure makes Option A preferable. Both paths preserve consumer contracts.

## Timeline (if Option B approved)

| Date | Milestone |
|---|---|
| 2026-06-15 | 360-audit of NIRANTAR caller surface complete (BHIMA) |
| 2026-07-01 | `nirantar-v2` full spec ratified (CTO + CEO) |
| 2026-07-15 | `nirantar-v2-queue` + `nirantar-v2-scanners` shipped to staging |
| 2026-08-01 | All 5 services on staging; parallel-run with v0.8.x begins |
| 2026-08-15 | Cutover: nirantar.talpro.in flips to v2 routes |
| 2026-08-31 | v0.8.x decommissioned (matches sunset header) |

## Open questions for full spec

1. Host topology — keep on talpro-vps, move to qorium-active-origin, or split?
2. Caller authentication — keep Basic auth on public origin, or move to API-key auth (matching N11 Wave-2 enterprise direction)?
3. Scanner SDK — define a stable plugin interface so new scanners (PM2-fleet, certificate-expiry, secret-rotation-due) can be added without core changes.
4. Codex queue back-pressure — current `pushBriefs()` dedupes by `task.id`. v2 should handle queue-burst rate limiting and dead-letter on poison tasks.
5. Findings retention — current model is implicit; v2 should have explicit retention + archive policies.

## Related

- Memory key `project_nirantar_archive_ready_2026_05_25` — current archive-ready certification
- Memory key `reference_nirantar_codex_push_endpoint` — Codex queue protocol
- `CODEX_PENDING_QORIUM_STATE_CORRECTION_WAVE_2_2026-06-02.md` SC-4 — originating brief
- NIRANTAR queue items NR-01 (MCP repoint) and NR-02 (PM2-fleet scanner) — both relevant to v2 design
