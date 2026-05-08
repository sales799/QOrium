# Marketing Apex — `qorium.online/`

Static marketing landing page for the apex domain.

## What's here

- `index.html` — single-file landing page (inline CSS, no JS, no external deps)
- (future) `privacy.html`, `dpdpa.html` — referenced from footer; legal docs to be authored
- (future) `og-image.png` — Open Graph preview for LinkedIn / Twitter shares

## Why apex landing exists separately from `services/readybank/public/`

`api.qorium.online` is the production API + recruiter SPA + admin console + candidate take flow. It's behind authentication for everything except `/healthz`. We don't want crawlers, marketing visitors, or share-link previews hitting the API host.

`qorium.online` (apex) is the marketing front door. Different content, different cache strategy, different DNS target.

## How to deploy

Three options, ordered by ease for non-tech CEO + future ops:

### Option A — Cloudflare Pages (recommended; free; CDN-edge cached globally)

1. Install Wrangler CLI on your dev machine: `npm install -g wrangler`
2. From repo root: `cd marketing/apex`
3. Authenticate: `wrangler login` (opens browser; CEO clicks Allow once)
4. Deploy: `wrangler pages deploy . --project-name=qorium-apex`
5. Cloudflare assigns a `*.pages.dev` URL.
6. Custom domain: Cloudflare Pages → qorium-apex project → Custom domains → Add `qorium.online`. Cloudflare auto-creates the CNAME (gray cloud) and provisions a TLS cert.

After Option A, `qorium.online` (no www) and `www.qorium.online` both serve this page. `api.qorium.online` is unaffected.

### Option B — Hostinger same-VPS-as-API (cheaper but adds nginx config)

1. SCP the `marketing/apex/` contents to Hostinger VPS at `/var/www/qorium-apex/`
2. Add an nginx server block listening on port 80/443 for `qorium.online` and `www.qorium.online` with `root /var/www/qorium-apex; index index.html;`
3. Add `qorium.online` to Certbot:
   `certbot --nginx -d qorium.online -d www.qorium.online`
4. Add A records in Cloudflare (orange cloud):
   - `@` → `147.93.103.194`
   - `www` already exists; verify it CNAMEs to `qorium.online`

This option requires nginx surgery; Cloudflare Pages is cleaner for marketing-only content.

### Option C — Stay parked (current state)

If we're not ready to point apex anywhere, qorium.online resolves but returns Cloudflare's "Web Server is Down" or similar. Not great for trust signals during a sales cycle. Defer Option C; pick A or B before the first cold-email campaign.

## Editing copy

Anyone can `git checkout -b feature/marketing-copy-update` and edit `index.html`. Pricing values are sourced from Constitution §1.2 — do not change pricing without an Article XI amendment.

## Watermark / attribution

Footer references `legal/Privacy-Notice-v1.md` (forthcoming) and `legal/DPDPA-Compliance-Statement.md` (forthcoming). These are authored as separate Lane B6 deliverables and rendered via simple HTML wrappers when deployed.

---

Author: CTO Office (autonomous agent), 2026-05-08 · Sprint 4.4 Lane B4
