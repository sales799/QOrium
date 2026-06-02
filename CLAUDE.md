# QOrium — Project CLAUDE.md

**Brand:** QOrium
**Domain:** qorium.online (live since 2026-05-31, Rakshak GO 88/100 17/17)
**Position (working):** India-built, psychometrically-defensible, AI-graded skills assessments
**Customer Zero:** Talpro India
**Apex doctrine:** Claude writes specs; Codex BHIMA + ARJUN write code in parallel KARYA lanes.

## Master spec
`/Users/talprouniversepro/Documents/Claude/Projects/QOrium/QORIUM_MEGA_BUILD_v1.0.md`

## Companion specs
- `GAP_ANALYSIS_2026-05-31.md` — competitive gap matrix (Vervoe, CoderByte, TechCurators, Brainstack)
- `MARKETING_SITE_IA_v1.md` — Track A site map + copy direction
- `BACKEND_MODULES_360_v1.md` — Track B 23-module spec
- `CODEX_PENDING_QORIUM_MEGA_BUILD_v1_LANE_A_BHIMA.md` — backend executor brief
- `CODEX_PENDING_QORIUM_MEGA_BUILD_v1_LANE_B_ARJUN.md` — marketing executor brief

## MANTHAN session
`9194eed8` (started 2026-05-31) — full lifecycle of the Mega Build

## PM2 ground truth (2026-06-02)
Cloudflare live origin is `187.127.155.150`; use SSH alias `qorium-active-origin`. The older `talpro-vps` alias points at `147.93.103.194` and is not the Cloudflare-fronted production source.

Active-origin PM2 snapshot from `qorium-active-origin` at 2026-06-02T03:39Z: 12 `qorium-*` processes online, 0 errored, 36 aggregate restarts. Processes: `qorium-api` x2, `qorium-jd-forge` x2, `qorium-stack-vault` x2, `qorium-admin` x2, `qorium-chatbot`, `qorium-leak-crawler`, `qorium-keeper`, and `qorium-marketing`.

Active-origin route fix: `https://api.qorium.online/chatbot/v1/healthz` now returns HTTP 200 through Cloudflare and proxies to `qorium-chatbot` on port 5122. The nginx config backup is under `/root/nginx-config-backups/qorium-marketing.conf.codex-bhima-chatbot-20260602T033900Z.bak` on the active origin.

Open follow-up: `https://qorium.online/openapi.json` is 200 at active-origin nginx but still 404 at the Cloudflare-fronted public edge as of 2026-06-02T03:41Z. Treat this as a separate Cloudflare cache/purge or edge-route issue, not a chatbot blocker.

**Monitoring gap (open):** MCP `talpro_pm2_list` and any `talpro_qorium_fleet_status`-style registry may show a filtered/shadow fleet that differs from raw PM2 on the origin. Raw PM2 on `qorium-active-origin` is canonical.

## Phase order (no calendar — exit-criteria gated)
1. Foundation lock (this doc set + CEO ratify)
2. Core assessment loop (M1.A, M1.B seed, M2, M4 v0.1)
3. Wedges: JD-Forge (M13) + IRT (M14)
4. Trust shell (M11, M16, M21)
5. Marketing v2 (W1–W15)
6. External pilots (3 logos)
7. Enterprise hardening (M15, M17, M18, M19, M20)
8. Scale wedges (M6, M7, M9, M10, M22, M23)

## Decision scorecard
4.35 / 5 — APPROVE (CTO Constitution P1–P5 weighted).

## Sources
- vervoe.com homepage + /pricing crawled 2026-05-31
- coderbyte.com homepage crawled 2026-05-31
- techcurators.in homepage + /skill-library crawled 2026-05-31
- brainstack.net crawled and excluded (wrong category)
- Rakshak run `rakshak-qorium_online-mpt7km6c-44a4` (GO 88/100 17/17)
