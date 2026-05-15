# `qorium-mailer` side-deploy

A second `readybank` instance running alongside the production `qorium-api`, dedicated to serving `/v1/auth/invite` and `/v1/auth/accept`. Exists to ship the recruiter invitation pipeline (PR #51) without touching the running `/opt/qorium` service while the migration-divergence reconciliation is still pending (`governance/incidents/2026-05-10-migration-divergence.md`).

## Why side-deploy

- The running `/opt/qorium` runs branch `claude/setup-qorium-build-agent-zA0l5` whose postgres has migrations `0001-0014` from that branch's numbering.
- `main` (post PR #51) has incompatible migrations at the same numbers.
- A side-deploy on a **separate database** lets `main` run cleanly without touching `/opt/qorium`'s schema.
- nginx routes only `/v1/auth/invite` + `/v1/auth/accept` to the side-deploy; everything else still hits `qorium-api`.

## Layout once deployed

```
/opt/qorium             ← existing, untouched, runs sibling branch on port 5101
/opt/qorium-mailer      ← clone of `main`, runs on port 5150
└── (this repo)         ← these files live at infra/side-deploy/qorium-mailer/
```

```
postgres:
  qorium                ← existing DB used by /opt/qorium (sibling-branch schema)
  qorium_mailer         ← NEW DB created by deploy.sh, holds main-branch schema
```

```
nginx api.qorium.online:
  /v1/auth/invite  → :5150 (qorium-mailer)
  /v1/auth/accept  → :5150 (qorium-mailer)
  / (everything else)  → :5101 (qorium-api)
```

## Deploy

Run as root on the VPS, **after** the deploy-key fix from `governance/email-bootstrap/2026-05-10-deploy-handoff.md`:

```bash
bash /opt/qorium-mailer/infra/side-deploy/qorium-mailer/deploy.sh
```

The script is idempotent: re-running it is safe. It will refuse to start if a name collision exists.

## Files in this directory

| File                   | Purpose                                                                         |
| ---------------------- | ------------------------------------------------------------------------------- |
| `deploy.sh`            | Top-level installer (clone, install, build, migrate, env, start, nginx, smoke)  |
| `migrate-mailer.sh`    | Stand-alone postgres provisioning + migration runner against `qorium_mailer` DB |
| `ecosystem.config.cjs` | PM2 config for the `qorium-mailer` process (port 5150, fork mode)              |
| `nginx-locations.conf` | nginx `location` blocks to drop into `api.qorium.online` server config          |
| `.env.example`         | Template for `/opt/qorium-mailer/.env` (CEO fills in SES creds)                 |

## Smoke test (after deploy)

```bash
# Health
curl -s https://api.qorium.online/healthz | jq .
# (expect 200 from upstream qorium-api — unchanged)

# Mailer init log
pm2 logs qorium-mailer --lines 5 --nostream | grep -i mailer
# (expect: "mailer initialized driver=ses region=ap-south-1")

# First send (replace API_KEY + tenant_id from app.api_keys + app.tenants)
curl -X POST https://api.qorium.online/v1/auth/invite \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"bhaskar@talpro.in","name":"Bhaskar (test)","tenant_id":"'$TENANT_ID'"}'
# (expect 201 with mailer.driver:"ses" and mailer.message_id:"<aws-id>")
```

## Rollback

```bash
pm2 stop qorium-mailer && pm2 delete qorium-mailer
# Remove nginx include line, reload nginx
sed -i '/qorium-mailer-locations/d' /etc/nginx/sites-enabled/api.qorium.online && nginx -s reload
# Drop the side database (data loss — only invitation rows from this side-deploy)
sudo -u postgres dropdb qorium_mailer
rm -rf /opt/qorium-mailer
```
