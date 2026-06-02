# CODEX COMPLETION — QOrium Marketing Atomic Deploy Hardening

**Date:** 2026-06-02  
**Lane:** BHIMA backend + ARJUN marketing infra  
**Branch:** `codex/qorium-marketing-atomic-deploy-hardening`  
**Commit:** `7c69d29f7251`  
**Status:** Completed as safe autonomous follow-up to Run #32 deploy-script caveat.

## What Shipped

- Converted `infra/marketing-deploy.sh` from in-place checkout/build/restart to release layout: `releases/<SHA>` -> `current` symlink -> PM2 reload.
- Moved runtime env preservation to `shared/apps/marketing/.env.production`; release env files symlink to shared state.
- Added DB package build before chatbot build so `@qorium/chatbot` can resolve `@qorium/db`.
- Added PM2 handoff logic that reloads current launchers and recreates only legacy launcher processes during migration.
- Reused Cloudflare origin certificate for `qorium.online`.
- Fixed `qorium.in` redirect cert guard to compare DNS against the actual server public IP instead of hardcoded old-origin IP.

## Verification

- Local gates: `bash -n infra/marketing-deploy.sh`, `git diff --check`, marketing build, DB build, chatbot build, and `pnpm secrets:scan` passed.
- Deploy: active origin `187.127.155.150` built `/opt/apps/qorium-marketing/releases/7c69d29f7251`, flipped `/opt/apps/qorium-marketing/current`, reloaded `qorium-chatbot` and `qorium-marketing`, and passed local probes on ports `5110` and `5122`.
- Live URLs: `/`, `/try/jd-forge`, `/resources/sample-packs`, `/trust`, `/compliance-dpdp`, `api.qorium.online/healthz`, and `api.qorium.online/health` returned HTTP `200`.
- JSON-LD: shipped marketing surfaces each returned valid HTML with `2` JSON-LD blocks.
- PM2: active origin default namespace enumerates `12` QOrium processes; marketing/chatbot now point to `/opt/apps/qorium-marketing/current/.../.pm2-start.sh`.
- Cloudflare purge: targeted purge for final-release URLs returned `cloudflare_purge_success=true`.
- Axe: `@axe-core/cli` `4.11.4` found `0` violations across the five checked marketing pages.
- Lighthouse home sample: performance `85`, accessibility `100`, best practices `92`, SEO `92`, FCP `2101ms`, LCP `3635ms`, CLS `0`, TBT `77ms`.
- Rakshak: latest keeper-backed saved run remains `rakshak-qorium_online-mpw46c2z-7bd0` with `GO 94/100`; API/admin saved floors remain `89/100` and `88/100`.

## Caveats

- Active-origin shared env reflects the host env available during deploy. Private integrations such as Resend, corpus rebuild, or lead capture require out-of-band credential re-landing if they are not already present.
