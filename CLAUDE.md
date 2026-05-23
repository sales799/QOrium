# QOrium Web Preview Codex Notes

## Deployment

- Use `safe-deploy qorium-web-v2-preview` for every preview redeploy.
- `redeploy-preview.sh` is a GBS wrapper by default. Its raw fetch/reset/install/build/PM2 body only runs when `TALPRO_GBS_RAW_DEPLOY=1` is set by the queued deploy command.
- Use `safe-pm2 restart qorium-web-v2-preview` for emergency preview restarts. Do not run direct `pnpm build`, `pm2 start`, or `bash redeploy-preview.sh` from `/opt/apps/qorium-web-v2-preview`.
