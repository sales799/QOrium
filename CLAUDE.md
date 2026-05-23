# QOrium Codex Notes

## Deployment

- Use `safe-deploy qorium-marketing` for regular production redeploys of `/opt/apps/qorium-marketing`.
- `infra/marketing-deploy.sh` remains a first-host bootstrap script when `/opt/apps/qorium-marketing/.git` does not exist. On an existing checkout it queues through GBS by default.
- The raw install/build/PM2/nginx/certbot body only runs when `TALPRO_GBS_RAW_DEPLOY=1` is set by the queued deploy command.
- Use `safe-pm2 restart qorium-marketing` for emergency process restarts. Do not run direct `pnpm build`, `pm2 restart`, or `bash infra/marketing-deploy.sh` from `/opt/apps/qorium-marketing`.
