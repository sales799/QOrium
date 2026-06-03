# CODEX COMPLETION — QOrium Active Hub Routes Deploy

Date: 2026-06-03
Lane: BHIMA / Codex
Scope: purge live `/try` and `/research` parent-route 404s; verify OpenAPI edge and production health.

## Result

DONE. Active origin now serves `/try` and `/research` with HTTP 200.

## Commits

- `57ac60a4e836b8285be187f5b3a332d28250acf1` — closeout branch state/evidence and local app build-root fix.
- `4531629d5950e33c517441c9327e035f5025963f` — active production hub-route fix; pushed to `codex/qorium-active-hub-routes-20260603` and fast-forwarded to `codex/qorium-active-proof-merge-20260602`.

## Verification

- Local active-branch gates passed:
  - `pnpm install --frozen-lockfile --prefer-offline`
  - `pnpm run build:packages`
  - `pnpm --filter @qorium/marketing lint`
  - `pnpm --filter @qorium/marketing typecheck`
  - `pnpm --filter @qorium/marketing test` (`13` files / `60` tests)
  - `pnpm --filter @qorium/marketing build`
  - `pnpm test`
  - `pnpm run build`
  - `git diff --cached --check`
  - `gitleaks protect --staged --redact`
- Live HTTP 200 with HSTS, XCTO, XFO, and CSP:
  - `https://qorium.online/`
  - `https://qorium.online/try`
  - `https://qorium.online/research`
  - `https://qorium.online/openapi.json`
  - `https://qorium.online/sitemap.xml`
  - `https://api.qorium.online/chatbot/v1/healthz`
  - `https://api.qorium.online/healthz`
  - `https://admin.qorium.online/api/health`
- Sitemap contains both `https://qorium.online/try` and `https://qorium.online/research`.
- Active-origin local probes returned HTTP 200 for `:5110/try`, `:5110/research`, and `:5122/v1/chatbot/health`.
- PM2 QOrium fleet: `12/12` online, `0` errored, `0` unstable; `pm2 save --force` completed.
- Nginx config test passed; remaining warnings are deprecated `listen ... http2` syntax only.

## Runtime Cleanup

- Restored tracked `apps/marketing/.pm2-start.sh` after legacy deploy script generated an absolute launcher.
- Recreated `current -> .` compatibility symlink for the chatbot PM2 path.
- Restored `shared/apps/marketing/.env.production` from the runtime env copy without printing secrets.
- Added runtime `services/chatbot/.pm2-start.sh` launcher so chatbot restarts cleanly from the current coordinator checkout.
- Active-origin tracked tree is clean after cleanup.

## Remaining Blockers

- Non-author review/merge remains required before author-owned branches are merged to `main`.
- `qorium.in` Let's Encrypt issuance failed because ACME HTTP challenge returned 404. Primary `qorium.online` is healthy; fix the redirect/cert vhost only if the secondary domain redirect is required.
- Live anti-leak provider credentials remain external-secret work; current crawler boot is healthy but provider-backed crawling still needs approved secrets.
