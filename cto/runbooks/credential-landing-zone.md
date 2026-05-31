# Runbook - Credential Landing Zone

Owner: CTO Office  
Scope: QOrium Phase 1 production credentials after Rakshak GO

## Rule

Never paste real secret values into this repository, completion shards, PM2 logs, or chat transcripts. Place real values only in the production secret store or process environment, then verify with:

```bash
cd /opt/apps/qorium-marketing
pnpm run ops:validate-credentials
pnpm run ops:validate-credentials:strict
```

Non-strict mode proves public surfaces and reports missing provider keys as skipped. Strict mode fails until every required production credential is present and valid.

## Required variables

| Capability                  | Variables                                                          | Validation                                                                           |
| --------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| ReadyBank production writes | `DATABASE_URL_PROD` or `DATABASE_URL`                              | Connects and runs `select 1`                                                         |
| Anti-leak live provider     | `SERPER_API_KEY`                                                   | Calls Serper search smoke with one result                                            |
| Server/service Sentry       | `SENTRY_DSN`                                                       | Validates DSN URL shape                                                              |
| Marketing Sentry            | `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_ENV`                 | Validates DSN URL shape at build/runtime                                             |
| Admin preview               | `QORIUM_ADMIN_PREVIEW_TOKEN`                                       | Calls admin root with `x-qorium-admin-preview`; without it public root must stay 401 |
| Greenhouse ATS smoke        | `GREENHOUSE_API_KEY`                                               | Presence gate for sandbox smoke                                                      |
| Ashby ATS smoke             | `ASHBY_API_KEY`                                                    | Presence gate for sandbox smoke                                                      |
| Workday ATS smoke           | `WORKDAY_CLIENT_ID`, `WORKDAY_CLIENT_SECRET`, `WORKDAY_TENANT_URL` | Presence gate for sandbox smoke                                                      |
| Darwinbox ATS smoke         | `DARWINBOX_API_KEY`, `DARWINBOX_BASE_URL`                          | Presence gate for sandbox smoke                                                      |

## Cutover sequence when secrets arrive

1. Load secrets into the production environment without printing values.
2. Run `pnpm run ops:validate-credentials` to confirm current public health remains green.
3. Run `pnpm run ops:validate-credentials:strict` to prove every credential lane is present.
4. Run `safe-deploy qorium-marketing` so PM2 receives updated environment and build-time public vars.
5. Run fleet smoke and focused endpoint probes:

```bash
curl -sk https://qorium.online/healthz
curl -sk https://api.qorium.online/healthz
curl -sk https://api.qorium.online/jdf/v1/health
curl -sk https://api.qorium.online/sv/v1/health
curl -sk https://admin.qorium.online/api/health
```

6. Append the cutover result to the active completion shard and notify CEO.

## GitHub push auth fix

Current diagnosis: HTTPS remote has no token/helper. SSH authenticates, but the key is not authorized for `sales799/QOrium` and cannot see the MCP repo.

Fix options:

1. Add the VPS public SSH key as a write deploy key on `sales799/QOrium` and the MCP repo, then push.
2. Or install a short-lived PAT credential helper for `sales799` with repo write access.
3. Re-test:

```bash
git -C /opt/apps/qorium-marketing push git@github.com:sales799/QOrium.git HEAD:main
git -C /opt/talpro-mcp-server push --set-upstream origin feat/leadhunteriq-signal-intel-2026-05-31
```

## Current safe default

Until `QORIUM_ADMIN_PREVIEW_TOKEN` is present, `https://admin.qorium.online/` must remain 401 with `application/problem+json`, `Cache-Control: no-store`, and `X-Robots-Tag: noindex, nofollow`. `/api/health` remains public for uptime monitoring.
