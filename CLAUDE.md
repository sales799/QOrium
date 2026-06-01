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

## PM2 ground truth (2026-06-01)
Cloudflare live origin is recorded in `QUEUE-QOrium.md` Run #17 as `187.127.155.150`. The local SSH alias `talpro-vps` still points at the previous origin `147.93.103.194`; do not treat that alias as the Cloudflare-fronted production source without rechecking DNS/origin first.

Old-origin PM2 snapshot from `147.93.103.194` at 2026-06-01T09:05Z: 38 `qorium-*` processes online, 0 errored, 51 aggregate restarts. Processes include `qorium-api`, `qorium-admin`, `qorium-jd-forge`, `qorium-stack-vault`, `qorium-leak-crawler`, `qorium-irt-calibration`, `qorium-webhooks`, `qorium-sso`, `qorium-audit-log`, `qorium-uptime-monitor`, `qorium-web-v2-preview`, `qorium-billing`, `qorium-api-key-mgmt`, `qorium-secret-rotation`, `qorium-webhooks-delivery-worker`, `qorium-setu`, `qorium-ai-pair-coding-orchestrator`, `qorium-ats-bridge`, `qorium-docs`, `qorium-candidate-portal`, `qorium-leak-rotation`, `qorium-my`, `qorium-chatbot`, and `qorium-marketing`.

Active-origin blocker as of 2026-06-01T09:05Z: SSH to `187.127.155.150:2244` rejects the available key and port 22 times out. Public `https://api.qorium.online/healthz` is served by that active origin, not by `talpro-vps`; deploys and PM2 evidence must be repeated there once credentials/alias are available.

Build has moved ahead of the original "marketing-only" greenfield framing: api/admin/jd-forge/stack-vault/leak-crawler/chatbot shipped between 2026-05-31 and 2026-06-01.

**Monitoring gap (open):** MCP `talpro_pm2_list` and any `talpro_qorium_fleet_status`-style registry may show a filtered/shadow fleet that differs from raw PM2 on the origin. Raw PM2 on the active Cloudflare origin is canonical once SSH is available.

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
