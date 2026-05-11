# Qorium Marketing — VPS 1 Bootstrap (one-time)

The deploy needs **one manual SSH session from your MacBook** to VPS 1, because the Claude Code container's egress is firewalled to ports 80/443 only (no SSH outbound). After this one-time bootstrap, all future deploys are zero-touch via GitHub Actions.

## Prerequisites you already have

- ✅ VPS 1 provisioned at `147.93.103.194` (port 2244)
- ✅ Your MacBook SSH key (`bhaskaranand@Bhaskars-MacBook-Air.local`) is authorized on the box
- ✅ `qorium.online` apex A record now points to `147.93.103.194` (set 2026-05-04 via API)
- ✅ Branch `claude/qorium-marketing-site-Z4gdI` ready on GitHub (PR #10)

## Step 1 — SSH from your MacBook (one terminal session)

```bash
ssh -p 2244 root@147.93.103.194
```

## Step 2 — Run the deploy script

The qorium repo is currently private. Pick **one** option:

### Option A — Make repo public temporarily (simplest)

In a browser: github.com/sales799/qorium → Settings → Danger Zone → Change visibility → Public. Then on the VPS:

```bash
curl -sfL https://raw.githubusercontent.com/sales799/qorium/claude/qorium-marketing-site-Z4gdI/infra/marketing-deploy.sh \
  | bash
```

You can flip the repo back to private once the deploy is done (GitHub Actions will still work afterwards because it uses the repo's own token).

### Option B — Use a GitHub Personal Access Token (keeps repo private)

Generate a `repo:read` PAT at github.com/settings/tokens (classic, scope `repo`). Then on the VPS:

```bash
GH_USER="sales799"
GH_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"   # paste your PAT
git clone --depth=1 -b claude/qorium-marketing-site-Z4gdI \
  "https://${GH_USER}:${GH_TOKEN}@github.com/sales799/qorium.git" \
  /opt/apps/qorium-marketing
cd /opt/apps/qorium-marketing
bash infra/marketing-deploy.sh
```

Either option runs the same script. It will:

1. Install Node 22 LTS + pnpm 10 + pm2 if missing
2. Clone or pull to `/opt/apps/qorium-marketing`
3. `pnpm install --frozen-lockfile`
4. `pnpm --filter @qorium/marketing build`
5. Create `apps/marketing/.env.production` (you'll edit later)
6. Start under PM2 on port `5110` (named `qorium-marketing`)
7. Write nginx vhost for `qorium.online` + `www.qorium.online`
8. Issue Let's Encrypt cert via certbot
9. Reload nginx
10. Smoke-test 5 routes against `https://qorium.online`

## Step 3 — Verify

After the script prints `DONE`, from your laptop:

```bash
curl -I https://qorium.online
curl -I https://www.qorium.online   # should 301 → https://qorium.online
curl -I https://qorium.online/sitemap.xml
```

Expected: all 200/301. The site is live.

## Step 4 — Wire Resend + Calendly (when you have the keys)

```bash
ssh -p 2244 root@147.93.103.194
nano /opt/apps/qorium-marketing/apps/marketing/.env.production
# fill in: RESEND_API_KEY=…  (or GMAIL_USER + GMAIL_APP_PASSWORD)
pm2 restart qorium-marketing
```

For Calendly, paste the scheduling URL into `apps/marketing/src/content/site.config.ts` and let GitHub Actions redeploy.

## Step 5 — Enable zero-touch redeploys (optional, recommended)

In github.com/sales799/qorium → Settings → Secrets and variables → Actions, add:

| Type     | Name                       | Value                                                |
| -------- | -------------------------- | ---------------------------------------------------- |
| Variable | `MARKETING_DEPLOY_ENABLED` | `true`                                               |
| Secret   | `VPS_HOST`                 | `147.93.103.194`                                     |
| Secret   | `VPS_USER`                 | `root`                                               |
| Secret   | `VPS_PORT`                 | `2244`                                               |
| Secret   | `VPS_SSH_KEY`              | private key paired with a pubkey authorized on VPS 1 |

For `VPS_SSH_KEY`, easiest path: on your MacBook, `cat ~/.ssh/id_ed25519` (the one you SSH with) and paste. Or generate a fresh keypair on VPS 1, paste private into the secret, append public to `~/.ssh/authorized_keys`.

After that, every push to `main` that touches `apps/marketing/**` triggers `.github/workflows/deploy-marketing.yml`, which SSHes to VPS 1 and re-runs `marketing-deploy.sh`. Idempotent. Includes its own smoke tests.

## Step 6 — Connect `qorium.in` later (when you're ready)

Once `qorium.online` is stable, redirect `qorium.in` → `qorium.online`:

```bash
# On VPS 1
cat > /etc/nginx/sites-available/qorium-in-redirect.conf <<'NGINX'
server {
    listen 80;
    listen 443 ssl http2;
    server_name qorium.in www.qorium.in;
    ssl_certificate     /etc/letsencrypt/live/qorium.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/qorium.in/privkey.pem;
    return 301 https://qorium.online$request_uri;
}
NGINX
ln -sf /etc/nginx/sites-available/qorium-in-redirect.conf /etc/nginx/sites-enabled/

# Update qorium.in DNS apex → 147.93.103.194 (currently 2.57.91.91 / Hostinger parking)
# This must be done via Hostinger DNS API or the panel.

# Then issue cert + reload:
certbot certonly --webroot -w /var/www/certbot -d qorium.in -d www.qorium.in \
  --email hello@qorium.online --agree-tos --non-interactive
nginx -t && systemctl reload nginx
```

## What the script does NOT do

- Does **not** touch n8n, ReadyBank API, Postgres, or anything else on VPS 1
- Does **not** modify the firewall (ports 22/2244/80/443/5432 already open)
- Does **not** modify the existing two account-level SSH keys (Antigravity, MacBook-Air)
- Does **not** change root password or any user account

## If something breaks

```bash
pm2 logs qorium-marketing --lines 100      # app logs
journalctl -u nginx -n 100 --no-pager      # nginx logs
nginx -T 2>/dev/null | grep -A 30 qorium   # full vhost config
ls -la /etc/letsencrypt/live/qorium.online # cert files
curl -I http://127.0.0.1:5110              # is the Next.js app responding locally?
```

To roll back: `pm2 stop qorium-marketing && pm2 delete qorium-marketing && rm /etc/nginx/sites-enabled/qorium-marketing.conf && systemctl reload nginx`. The `/opt/apps/qorium-marketing` directory can be deleted independently.

## Security notes for this session

- A throwaway SSH key labeled `claude-cowork-deploy-2026-05-04` was added to your Hostinger account (id `499763`). It is NOT attached to any VPS, so it has no effect until you choose to use it. You can safely delete it from the Hostinger panel anytime.
- The Hostinger API key you shared in chat is exposed in the conversation transcript. **Rotate it** in the Hostinger dashboard once we're done with deploy.
