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

## Pre-flight 0 — generate a GitHub PAT (one-time, 60 seconds)

The QOrium repo is **private**, so the bootstrap script must
authenticate to fetch its own source. Generate a fine-grained
Personal Access Token:

1. Open <https://github.com/settings/tokens?type=beta>
2. **Fine-grained tokens → Generate new token**
3. Name: `qorium-vps-bootstrap`
4. Expiration: 90 days (or your org's policy)
5. Repository access: **Only select repositories → sales799/QOrium**
6. Repository permissions:
   - **Contents: Read-only**
   - **Metadata: Read-only** (auto-enabled)
7. Generate token, copy `github_pat_xxxxx...`

This single token covers both the initial script download AND the
subsequent `git clone` performed by the bootstrap.

## Step 1 — One command on the VPS (10 minutes, mostly waiting)

SSH into `147.93.103.194` as `root` (or any user with sudo) and run:

```bash
export GITHUB_TOKEN=github_pat_paste_yours_here
URL="https://api.github.com/repos/sales799/QOrium/contents/services/setu/bin/setu-bootstrap.sh"
curl -fsSL -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github.raw" \
     "$URL?ref=claude/setup-qorium-build-agent-zA0l5" -o /tmp/qorium-bootstrap
sudo -E bash /tmp/qorium-bootstrap
```

Three important details that earlier attempts tripped over:

1. **`api.github.com/repos/.../contents/...` (not raw.githubusercontent.com).**
   For private repos, the `/contents` API endpoint with
   `Accept: application/vnd.github.raw` is the canonical way to fetch
   a single file with a PAT. raw.githubusercontent.com returns a bare
   404 for private repos (even with the right path) to avoid leaking
   their existence.
2. **Repo name casing matters.** Canonical is `sales799/QOrium`
   (capital Q + O). The api.github.com endpoint is _less_ strict
   (case-insensitive on owner/repo), but always use the canonical
   case to be safe.
3. **`sudo -E` preserves `GITHUB_TOKEN` through sudo.** Without `-E`,
   sudo strips most env vars; the script would then fail at the
   inner `git clone` of the private repo.

After PR #9 merges to `main`, swap `ref=claude/setup-qorium-build-agent-zA0l5`
for `ref=main` in the URL above.

The temp-file name `qorium-bootstrap` (no `.sh` suffix) avoids a
gotcha where some chat clients auto-linkify `*.sh` filenames as URLs
when you copy them, mangling the paste into markdown link syntax.

### Alternative: make the repo public for the bootstrap window

If you'd rather not handle a PAT, the simplest unblock is:

1. <https://github.com/sales799/QOrium/settings> → **Change visibility → Public**
2. Run the original (no-token) bootstrap command
3. Change visibility back to Private

The bootstrap is idempotent, so even partial runs are safe to retry.

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

Open <https://github.com/sales799/QOrium/settings/secrets/actions> and add:

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
