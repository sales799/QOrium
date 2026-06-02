# QOrium — Project CLAUDE.md

**Brand:** QOrium
**Domain:** qorium.online (live since 2026-05-31; latest Rakshak 2026-06-02: qorium 94/100, api 89/100, admin 88/100)
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
Current production routing is consolidated to active origin `187.127.155.150` for `qorium.online` and `api.qorium.online`; old origin `147.93.103.194` is retained as manual rollback standby. Use SSH alias `qorium-active-origin` for active production and `talpro-vps` for rollback/legacy fleet inspection. Both origins are hardened for QOrium API/admin headers and `security.txt`.

Active-origin PM2 snapshot from `qorium-active-origin` at 2026-06-02T13:39Z: 12 `qorium-*` processes online, 0 errored, 0 unstable restarts. Processes: `qorium-api` x2, `qorium-jd-forge` x2, `qorium-stack-vault` x2, `qorium-admin` x2, `qorium-chatbot`, `qorium-leak-crawler`, `qorium-keeper`, and `qorium-marketing`.

Old-origin PM2 snapshot from `talpro-vps` at 2026-06-02T13:40Z: 38 `qorium-*` processes online, 0 errored, 0 unstable restarts. Named services include `qorium-api`, `qorium-jd-forge`, `qorium-stack-vault`, `qorium-leak-crawler`, `qorium-irt-calibration`, `qorium-webhooks`, `qorium-sso`, `qorium-audit-log`, `qorium-uptime-monitor`, `qorium-web-v2-preview`, `qorium-admin`, `qorium-billing`, `qorium-api-key-mgmt`, `qorium-secret-rotation`, `qorium-webhooks-delivery-worker`, `qorium-setu`, `qorium-ai-pair-coding-orchestrator`, `qorium-ats-bridge`, `qorium-docs`, `qorium-candidate-portal`, `qorium-leak-rotation`, `qorium-my`, `qorium-chatbot`, and `qorium-marketing` (some run clustered/multiple instances).

Active-origin route fix: `https://api.qorium.online/chatbot/v1/healthz` now returns HTTP 200 through Cloudflare and proxies to `qorium-chatbot` on port 5122. The nginx config backup is under `/root/nginx-config-backups/qorium-marketing.conf.codex-bhima-chatbot-20260602T033900Z.bak` on the active origin.

Active-origin marketing release as of 2026-06-02T13:41Z: branch `codex/saml-live-active-origin-20260602`, SHA `031883a26b9d2ddce41a1711340b095d4bc1d9dc`, release `/opt/apps/qorium-marketing/releases/031883a26b9d`. Public SAML metadata is HTTP 200 XML, SAML login is HTTP 302 to SAMLtest IdP, and the four honest legacy aliases `/product/jd-forge`, `/product/ai-grading`, `/product/assessment-builder`, and `/product/anti-cheating` are HTTP 301 redirects to canonical live pages.

API health-path truth as of 2026-06-02T13:39Z: `https://api.qorium.online/healthz` and `https://api.qorium.online/health` return HTTP 200. `https://api.qorium.online/v1/healthz` and `/v1/health` return HTTP 404 and must not be used by watchdogs until N11 intentionally ships versioned health aliases.

OpenAPI edge resolved: `https://qorium.online/openapi.json` returns HTTP 200 JSON publicly as of 2026-06-02T04:00Z. Cloudflare cache purge still requires a purge-capable token; the available certbot token can find the zone but `purge_cache` returns auth error `10000`.

Latest Rakshak certification: `rakshak-qorium_online-mpw46c2z-7bd0` GO 94/100, `rakshak-api_qorium_online-mpw46c77-a38a` GO 89/100, `rakshak-admin_qorium_online-mpw46ca2-ceb6` GO 88/100. Reports live under `/opt/apps/rakshak-runs/<run-id>/{ceo.md,cto.md}` on `qorium-active-origin`.

**Fleet discovery rule:** run `apps/scripts/qorium-fleet-snapshot.sh` before relying on stale fleet counts. It queries both `qorium-active-origin` and `talpro-vps`, filters raw PM2 names with `^qorium-`, and prints the canonical live fleet. MCP `talpro_pm2_list` and any `talpro_qorium_fleet_status`-style registry can lag or filter namespaces; raw PM2 across both origins is canonical until the registry implementation is patched.

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
- Rakshak baseline `rakshak-qorium_online-mpt7km6c-44a4` (GO 88/100 17/17)
- Rakshak certification 2026-06-02: `rakshak-qorium_online-mpw46c2z-7bd0`, `rakshak-api_qorium_online-mpw46c77-a38a`, `rakshak-admin_qorium_online-mpw46ca2-ceb6`
