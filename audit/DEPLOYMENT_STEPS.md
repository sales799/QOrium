# Deployment Steps

Generated: 2026-06-18

## Pre-Deploy Verification

Run from repo root:

```bash
pnpm --filter @qorium/marketing typecheck
pnpm --filter @qorium/marketing test
pnpm --filter @qorium/marketing build
pnpm --filter @qorium/marketing test:e2e
```

Optional but recommended before merge:

```bash
pnpm secrets:scan
pnpm dlx @lhci/cli@0.13.x autorun --config=apps/marketing/lighthouserc.json
```

The local QA server uses `QORIUM_E2E=1` through Playwright/Lighthouse config so browser audits do not trip the public rate limiter. Production deploys must not set that variable.

## Deploy

Use the repo-approved production path:

```bash
safe-deploy qorium-marketing
```

## Post-Deploy Smoke

```bash
curl -sSI https://qorium.online/
curl -sS https://qorium.online/sitemap.xml | rg 'solutions/(platforms|enterprises|staffing)<'
curl -sSI https://qorium.online/solutions/platforms
curl -sSI https://qorium.online/privacy
```

Expected:

- `/` returns 200 with security headers.
- Legacy solution URLs return 301 to canonical routes.
- `sitemap.xml` no longer lists legacy solution URLs.
- `/privacy` no longer contains the old "Pre-launch" notice.
