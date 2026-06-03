# CODEX PENDING — QOrium boot-resilience + observability (leak-crawler, irt-calibration)
**Filed:** 2026-06-02 by Claude (CTO) · **Lane:** BHIMA (backend) · **Origin:** talpro-vps (147.93.103.194) — replicate to active-origin (187.127.155.150)
**Priority:** MED (no live incident — services stable 11–12h, `unstable_restarts=0`)

## Diagnosis (done — do not re-investigate)
`qorium-leak-crawler` (30 restarts/day) and `qorium-irt-calibration` (18/day) looked like flapping in `talpro_qorium_fleet_status`. They are **not** flapping:
- Both have **cron_restart** (leak `0 2 * * *`, irt `0 3 * * *`) — most of the count is the *designed* nightly restart.
- At each nightly restart they hit **~9 boot retries** before catching, then run stable all day. `exp_backoff_restart_delay: 500` is already set, so retries back off (not hammering).
- **Risk:** ~9 of `max_restarts: 10` consumed each night → one slow-dependency night tips them to `errored` and they stay down.
- **Observability hole:** every PM2 out/err log file is **0 bytes** (current + rotated). `pm2-logrotate` is correctly set (`retain 30, compress true`) — nothing to retain because the services emit nothing to stdout/stderr at boot. `irt-calibration/dist/logger.js` exists but routes off-stream/silent at idle. So the boot-retry cause is currently **undiagnosable**.

## What Claude already did (staged, NOT yet live)
- Edited `/opt/qorium/infra/B10-ecosystem.config.js`: `max_restarts: 10 → 25` for `qorium-leak-crawler` (line 278) and `qorium-irt-calibration` (line 336). Backup: `B10-ecosystem.config.js.bak.cto-<ts>`. Config parses (`node -e require(...)` OK).
- **Not reloaded** — deliberately did not hot-reload 38-instance prod for a benign self-healing pattern. The edit is effective at the **next planned fleet reload**.

## Tasks for BHIMA (apply at next planned reload — do not hot-reload prod off-hours)
1. **Apply the staged headroom** — at next deploy, `pm2 reload /opt/qorium/ecosystem.config.cjs --only qorium-leak-crawler,qorium-irt-calibration --update-env` (verify `--only` scopes correctly first via `pm2 prettylist`), confirm both return `online` with the new `max_restarts: 25`. Mirror the same edit on active-origin.
2. **Add a boot heartbeat to stdout** in `services/leak-crawler/src/index.ts` and `services/irt-calibration/src/index.ts`: a single `logger.info({ev:'boot', svc, deps:'ok'})` AND ensure the Pino transport also writes to stdout so PM2 captures it. Goal: next 02:00/03:00 cycle leaves a diagnosable trail.
3. **Add a startup readiness wait** before the main loop: await Postgres + Redis reachable with bounded exponential backoff (e.g., 10 tries / 30s) instead of crash-on-first-connect-fail. This eliminates the root cause (boot dependency race) rather than just widening the cap.
4. **Verify:** after next nightly cron cycle, `total_restarts_today` for both should drop to ≈ cron-only (1–3), and out logs should be non-empty.

## Exit criteria
Both services: `unstable_restarts=0`, nightly `total_restarts` ≤ 3, non-empty boot log line captured by PM2, `max_restarts: 25` live on both origins.

## Closeout proof — 2026-06-03 Codex/BHIMA

### Completed
- Old-origin `talpro-vps` worker code shipped and pushed on `codex/qorium-boot-resilience-20260602` at `abba78e` (`Flush QOrium worker boot logs`), following `d97b19a` readiness waits and `0ba60ef` CLI watch-mode entrypoints.
- `qorium-leak-crawler` and `qorium-irt-calibration` now run through `/opt/qorium/services/*/dist/cli.js --watch --interval 86400`, with `max_restarts=25`, `NODE_ENV=production`, `unstable_restarts=0`, and `pm2 save --force` complete.
- Fresh old-origin build proof passed: `pnpm --filter @qorium/leak-crawler run build`, `pnpm --filter @qorium/irt-calibration run build`, and PM2 config parse for `infra/B10-ecosystem.config.js` plus `ecosystem.config.cjs`.
- PM2 boot observability is live: `/var/log/pm2/qorium-leak-crawler-out-295.log` and `/var/log/pm2/qorium-irt-calibration-out-296.log` are non-empty and contain `{"ev":"boot","svc":...,"deps":"ok"}` lines.
- The natural `02:00 UTC` leak-crawler cron cycle ran at `2026-06-03 02:00:06 +00:00`, wrote the boot heartbeat, and stayed online with restart count `3`.
- Active-origin crawler headroom is live: PM2 `qorium-leak-crawler` id `33` is `online`, `unstable_restarts=0`, `max_restarts=25`, cron `0 2 * * *`, with saved PM2 state. Active-origin has no matching `qorium-irt-calibration` service.
- Public `https://qorium.online/healthz` returned HTTP `200` with security headers; forced old-origin returned HTTP `200`; forced active-origin returned HTTP `200` when bypassing Cloudflare cert validation for direct-origin inspection.

### Remaining proof/watch items
- Natural IRT cron proof remains pending until its `0 3 * * *` UTC cycle runs. Pre-cron state is already live-safe: `online`, `unstable_restarts=0`, `max_restarts=25`, non-empty boot logs.
- Active-origin file commit `55975cd` (`Fix active anti-leak PM2 headroom`) is server-local because `git push origin HEAD` failed with `Permission to sales799/QOrium.git denied to deploy key`.
- Leak-crawler boot resilience is fixed, but the crawler currently logs `SERPER_API_KEY unset in production; crawl will be a no-op`; real provider crawling needs the approved provider key through the secret channel.
