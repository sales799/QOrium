# 100% Auto Mode — Setu bootstrap

**Owner:** CEO + CTO Office · **Last updated:** 2026-05-04 (Sprint 2.16.5)

This runbook turns a fresh Linux VPS at `147.93.103.194` into a fully
running QOrium production environment with **one command**, after which
every push to `main` or `claude/*` auto-deploys via Setu.

## Pre-flight (5 minutes, in the Hostinger / DNS console)

Add ONE wildcard A record (covers every subdomain we use):

```
A    *    147.93.103.194    3600
```

Or, if your provider doesn't support wildcards, add these explicitly:

| Type | Name      | Value          | TTL  |
| ---- | --------- | -------------- | ---- |
| A    | api       | 147.93.103.194 | 3600 |
| A    | admin     | 147.93.103.194 | 3600 |
| A    | docs      | 147.93.103.194 | 3600 |
| A    | candidate | 147.93.103.194 | 3600 |
| A    | my        | 147.93.103.194 | 3600 |

`api.qorium.online` is already published per the screenshot you sent.

## Step 1 — One command on the VPS (10 minutes, mostly waiting)

SSH into `147.93.103.194` as `root` (or any user with sudo) and run:

```bash
curl -fsSL https://raw.githubusercontent.com/sales799/qorium/main/services/setu/bin/setu-bootstrap.sh -o /tmp/setu-bootstrap.sh \
  || curl -fsSL https://raw.githubusercontent.com/sales799/qorium/claude/setup-qorium-build-agent-zA0l5/services/setu/bin/setu-bootstrap.sh -o /tmp/setu-bootstrap.sh
sudo bash /tmp/setu-bootstrap.sh
```

The `-f` flag makes curl exit non-zero on HTTP errors instead of writing
the response body to disk (which would give you the obscure
`404: command not found` if you piped a 404 page directly into `bash`).

The fallback to the feature branch is a belt-and-braces guard for the
window between sprint commits and the merge to `main`. Once PR #9 is
merged, the first URL is the only one you'll need.

What happens (idempotent — re-runs are safe):

1. Installs Node 20, pnpm 10, Postgres 16, Redis, PM2, nginx, certbot, git
2. Clones the repo to `/opt/qorium`
3. Generates fresh secrets (`API_KEY_PEPPER`, `SSO_JWT_SIGNING_SECRET`,
   `SETU_WEBHOOK_SECRET`, `NEXTAUTH_SECRET`, Postgres password) into
   `/opt/qorium/.env` (chmod 600, root only)
4. Creates the `qorium` Postgres role + database
5. Installs the nginx server block from `infra/nginx/qorium.conf`
6. Provisions Let's Encrypt cert via `certbot --nginx -d api.qorium.online`
   (only if DNS resolves to this box)
7. Installs `qorium-pm2.service` systemd unit so PM2 restarts on reboot
8. Runs `pnpm install --frozen-lockfile` + `pnpm build` + migrations
9. `pm2 start ecosystem.config.cjs --env production` + `pm2 save`
10. Prints the GitHub repo settings to paste

## Step 2 — Paste secrets into GitHub (2 minutes)

After step 1, the script writes a `paste-me` file:

```bash
cat /opt/qorium/.SETU_GITHUB_PASTE_ME.txt
```

Open <https://github.com/sales799/qorium/settings/secrets/actions> and add:

- **Repository variable** `SETU_WEBHOOK_URL` =
  `https://api.qorium.online/setu/v1/setu/deploys/webhook`
- **Repository secret** `SETU_WEBHOOK_SECRET` = (value from paste-me file)

Optional convenience:

- **Repository secret** `SETU_MANUAL_DEPLOY_TOKEN` = (value from paste-me)
  Lets you trigger a manual deploy via:

  ```bash
  curl -X POST -H "Authorization: Bearer $TOKEN" \
    https://api.qorium.online/setu/v1/setu/deploys/manual \
    -d '{"env":"production","branch":"main","commit":"HEAD"}'
  ```

## Step 3 — Watch it live

Smoke check — these should all return `{"status":"ok"}`:

```bash
curl https://api.qorium.online/healthz
curl https://api.qorium.online/setu/healthz
curl https://api.qorium.online/v1/uptime/status
```

Setu's status JSON for the dashboard MCP:

```bash
curl https://api.qorium.online/setu/v1/setu/status | jq .
```

## Step 4 — Trigger the first auto-deploy

Push any change to the `claude/setup-qorium-build-agent-zA0l5` branch:

- The webhook fires Setu on the VPS
- Setu validates the HMAC signature
- Setu invokes `bin/setu-deploy.sh` (flock + git fetch + pnpm install +
  pnpm build + pnpm migrate + pm2 reload + smoke check)
- Deploy history shows up at
  <https://api.qorium.online/setu/v1/setu/deploys/latest>

From this point on the entire build agent → GitHub → VPS → live pipeline
is autonomous. **No human is in the loop between commit and live.**

## Failure modes + recovery

| Symptom                                    | Fix                                                                                                                                                       |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `certbot` failed during bootstrap          | DNS hasn't propagated yet. Re-run the bootstrap command after `dig api.qorium.online` shows 147.93.103.194.                                               |
| `migrations failed` during bootstrap       | Postgres may not have warmed up. Re-run `cd /opt/qorium && DATABASE_URL=$(grep DATABASE_URL_PROD .env \| cut -d= -f2-) pnpm --filter @qorium/db migrate`. |
| `pm2 list` shows services in errored state | `pm2 logs <service-name>` for the stack trace. Most likely an env var is missing — fill in `/opt/qorium/.env`.                                            |
| Webhook returns 503 "deploy disabled"      | `SETU_DEPLOY_ENABLED=true` not yet in `/opt/qorium/.env`. Set it + `pm2 restart qorium-setu`.                                                             |
| Push doesn't trigger deploy                | Check GitHub Actions run logs; verify `SETU_WEBHOOK_URL` repo variable matches the actual URL on the VPS.                                                 |

## Reverting to manual mode

If autonomous deploy needs to be paused (e.g. emergency rollback):

```bash
ssh root@147.93.103.194 "sed -i 's/SETU_DEPLOY_ENABLED=true/SETU_DEPLOY_ENABLED=false/' /opt/qorium/.env && pm2 restart qorium-setu"
```

Re-enable with the inverse `sed` + `pm2 restart qorium-setu`.

## What this changes vs the previous state

Before Sprint 2.16.5: deploying required ~7 manual commands, knowledge of
nginx config, Postgres setup, certbot, systemd, secret generation — each
step a CEO or CTO action.

After Sprint 2.16.5: **one curl command** on the VPS does all of that
deterministically. The CEO's only manual touch is pasting two values
into GitHub repo settings — and that's a one-time action.
