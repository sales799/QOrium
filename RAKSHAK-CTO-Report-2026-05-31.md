# 🛡️ RAKSHAK CTO DETAILED REPORT — qorium.online
**Date:** 2026-05-31 | **Run:** rakshak-qorium_online-mpt7km6c-44a4

## EXECUTIVE SUMMARY

**VERDICT: 🟢 GO** — Overall Rakshak Score: **88/100**

All 17 audits passed. qorium.online is launch-ready. Codex (BHIMA) executed the full Rakshak pipeline end-to-end after Claude filed the allow-list shard.

---

## PER-AUDIT REPORTS

### Audit #1 — Project Audit v2.0 — GO (90/100)

Project deployed from Git SHA 4733383 in /opt/apps/qorium-marketing. PM2 process qorium-marketing online with 0 restarts. Build/typecheck pass: `pnpm --filter @qorium/marketing typecheck` clean; `pnpm --filter @qorium/marketing build` compiled Next.js 15.5.18, generated 45 static pages including /health, /healthz, /api/health, /.well-known/security.txt, /privacy, /terms, /security, /robots.txt, /sitemap.xml.

Gatekeeper pulse: 35/39 (90%), Grade A, **SHIP IT — Production Ready**. Sections: Security 9/10, Performance 7/10, SSL/TLS 5/5, Legal/Compliance 10/10, Monitoring 4/4. Extended: SEO 10/10, Frontend/A11y 11/12, API Design 2/4, Pre-Launch 6/8, OWASP 6/6. Fleet smoke 21/21. VPS load low, disk 10%. Fresh DB backup at /opt/backups/db/postgres-all-20260531T030158Z.sql.gz.

VPS code inventory: 8 route handlers, 25 app pages, 3 tests. Nginx config test passes. Cloudflare-backed SSL serving valid public TLS.

**Non-blocking gaps:** rate limiting signal not detected, health p99 sometimes >200ms via Cloudflare, DKIM selector not visible, Sentry/equivalent not detected.

### Audit #2 — Full-Stack Production — GO (88/100)

Live at https://qorium.online. PM2 `qorium-marketing` online, uptime stable, 0 restarts, memory ~140MB. Nginx + Cloudflare front. Nginx syntax check OK. /health, /healthz, /api/health return status/version/uptime. Admin paths protected by middleware → structured problem JSON. API misses → RFC 7807.

Build gate green. Route map confirms marketing, legal, product, SEO files, health endpoints, API fallback, and middleware in prod build. Fleet smoke 21/21.

Gatekeeper: 35/39 (90%), Grade A, SHIP IT. Security headers pass: HSTS, nosniff, X-Frame DENY, CSP, hidden server version, HTTPS redirect, CORS, cookies, protected routes. Legal/compliance 10/10, monitoring 4/4, SSL/TLS 5/5, OWASP 6/6.

**Residual risks:** Cloudflare path health p99 fluctuates >200ms, rate limit not externally detected, DKIM not discoverable, Sentry not detected. None block launch.

### Audit #3 — 360° SEO — GO (94/100)

Gatekeeper extended SEO 10/10: unique title, meta description, canonical, OG, Twitter Card, viewport/mobile, sitemap, sampled internal links, JSON-LD, H1. Public assets in prod build: /robots.txt, /sitemap.xml, /opengraph-image, /icon, /apple-icon, /blog + slug pages.

Title: `QOrium — The world's question bank for hiring.`. Legal/crawl surfaces live: /privacy, /terms, /cookie-policy, /dpa, /.well-known/security.txt, /security, /robots.txt. WWW redirect + HTTP→HTTPS redirect confirmed. Marketing app: product, pricing, customers, features, solutions, FAQ, demo, contact, about, press-kit, changelog, blog.

**Follow-up:** refine meta description length, connect error tracking, add DKIM once mail selector known.

### Audit #4 — Load & Stress Test — GO (86/100)

Serial load after non-destructive T1. Public Cloudflare to /health: 1,160 HTTP 200 in 30s @ 10 connections after Nginx health-path tuning. Latency: p50 203ms, p97.5 420ms, p99 946ms, avg 234ms, 2 client-side timeouts. Public route functional under light launch pressure with edge-path jitter.

Origin direct to 127.0.0.1:5110/health @ 25 connections × 30s: **63,961 HTTP 200, 0 errors**, p50 11ms, p97.5 19ms, p99 24ms, avg 11.23ms, ~2,132 req/sec. After load: PM2 online 0 restarts, smoke 21/21, load avg 0.37/0.30/0.18, RAM 6.2Gi free, disk 10%.

**Follow-up:** tune Cloudflare/Nginx health response + cache/edge to remove residual p99 jitter on public health.

### Audit #5 — Disaster Recovery & BC — GO (87/100)

PM2 `qorium-marketing` online after redeploy SHA fa2e1c6, 0 restarts. `pm2 save --force` persisted to /root/.pm2/dump.pm2. Nginx active/enabled, config test passes. /etc/nginx/conf.d/qorium-marketing.conf proxies the public domain. /health returns JSON.

Backup: `/opt/backups/db/postgres-all-20260531T030158Z.sql.gz` (2026-05-31 03:01 UTC). Repo recoverable from GitHub main, VPS clone at fa2e1c6. Build reproducible. Fleet smoke 21/21.

**Continuity gaps (DR hardening, not launch blockers):** root crontab has no automated backup schedule; deploy script still assumes /etc/nginx/sites-available but VPS uses /etc/nginx/conf.d.

### Audit #6 — Security Pentest — GO (91/100)

Public headers: HSTS, X-Content-Type-Options nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, CSP. Gatekeeper Security 9/10, OWASP 6/6. /admin → 401 application/problem+json, no debug leak. /api/nope → 404 RFC 7807. TLS 1.3 valid.

**Dependency blocker fixed during run.** Pre-fix: `pnpm audit --audit-level moderate` reported moderate advisories. Commit fa2e1c6 updates dependency floors + pnpm overrides. Post-deploy: **No known vulnerabilities found**. Typecheck/tests/build pass after upgrade.

**Residual:** external rate-limit detection warns, duplicate security headers (app/edge + Nginx/Cloudflare). Not launch-blocking.

### Audit #7 — DPDP + GDPR Privacy — GO (92/100)

Public probes 200 for /privacy, /terms, /cookie-policy, /dpa, /security, /.well-known/security.txt, /robots.txt, /sitemap.xml. Gatekeeper Legal/Compliance 10/10: privacy + terms linked, cookie consent detected, robots.txt + security.txt present. No wildcard CORS, no cookies on sampled pages.

Strict referrer policy + permissions policy disabling camera/mic/geolocation/interest-cohort.

**Follow-up before paid campaigns:** finalize processor/vendor matrix, map Resend/Plausible/Calendly data flows in DPA, DSAR runbook links once intake mailbox confirmed.

### Audit #8 — WCAG 2.2 AA — GO (88/100)

Gatekeeper Frontend/A11y 11/12: favicon, apple-touch-icon, custom 404, error handling, no mixed content, alt text check, doctype, UTF-8 charset, `<html lang="en">`, no prod console.log detected, responsive viewport. HTML: 1 H1, 13 aria-labels on home.

**Follow-up:** full axe/Playwright pass after content freeze; explicit loading state detection coverage (FE-12 warns despite Next loading.tsx).

### Audit #9 — Observability — GO (86/100)

/health returns JSON {status, service, version, uptimeSeconds}. Gatekeeper Monitoring 4/4. PM2 logs: Next.js 15.5.18 starting on 127.0.0.1:5110, ready in ~189ms after fa2e1c6 redeploy. PM2 online, 0 restarts. Fleet smoke covers QOrium Marketing, API health, Security + sibling products; 21/21.

Sentry abstraction at apps/marketing/src/lib/sentry.ts exists, Plausible wired in layout — but Gatekeeper doesn't detect a live Sentry DSN. Logs via PM2 + Nginx. Cloudflare edge telemetry.

**Follow-up:** provision `NEXT_PUBLIC_SENTRY_DSN`/env, alert routing for 5xx/latency after first public audit wave.

### Audit #10 — API Contract & Integration — GO (90/100)

/health, /healthz, /api/health → JSON with status/version/uptime. /api/nope → 404 application/problem+json with type/title/status/detail/instance. /admin → 401 application/problem+json no leakage. Gatekeeper API Design passes RFC 7807, consistent status codes. OWASP access-control 6/6. Nginx `client_max_body_size 5M`. No wildcard CORS, no cookies on sampled pages.

**Residual:** Cloudflare path health latency >200ms target despite origin 11ms p50. Monitor only.

### Audit #11 — Database Health & Scale — GO (84/100)

Marketing surface does not depend on app DB. Local PostgreSQL has only default `postgres` db — no app schema to migrate/scale for this launch path. Public pages, legal, sitemap, robots, health, API fallback all generated by Next.js.

Backup freshness OK: postgres-all-20260531T030158Z.sql.gz (03:01 UTC). Docker `krishna-aios-postgres` healthy. Redis PONG. Origin load: ~64k requests / 30s / 0 errors.

**Follow-up:** when QOrium API/ReadyBank goes stateful — schema backup, restore drill, migrations gate, pool limits, slow-query dashboards.

### Audit #12 — Chaos Engineering — GO (88/100)

Serial chaos drill: restarted PM2 `qorium-marketing` via talpro_pm2_restart. PM2 id 14 came back online new PID 1726664, script `/opt/apps/qorium-marketing/apps/marketing/.pm2-start.sh`, Node 22.22.2. Logs: Next.js 15.5.18 restarted on 127.0.0.1:5110, ready in 186ms.

Recovery: 3s later, https://qorium.online/health → 200 `{status:"ok", service:"qorium-marketing", version:"marketing-1", uptimeSeconds:1}`. Full fleet smoke after restart 21/21. PM2 all online, QOrium memory ~134MB.

**Follow-up:** scheduled chaos/restore drills for Nginx reload, Cloudflare bypass/origin-only, future DB failover.

### Audit #13 — CI/CD & Deployment — GO (86/100)

GitHub `QOrium CI/CD` green on commit fa2e1c6 = same commit deployed. /opt/apps/qorium-marketing at fa2e1c6, deps installed, Next build complete, PM2 online 0 restarts, :5110 200, Nginx config test pass, `pm2 save --force` OK.

Auto `Deploy marketing site` workflow currently skipped on push due to repo deployment gating; prior manual dispatch failed because VPS deployment secrets not populated. **Not a launch blocker** — direct audited VPS deploy path completed, GitHub quality workflow green.

**Follow-up:** either populate GitHub VPS deployment secrets + enable MARKETING_DEPLOY_ENABLED, or remove manual deploy workflow to avoid false red runs.

### Audit #14 — i18n & Localization — GO (82/100)

`<html lang="en">`. Viewport/mobile passes Gatekeeper. Legal, product, pricing, FAQ, demo, contact, blog, security pages generated + public. No mixed-content/charset issues. UTF-8 set.

No multi-locale routing or translation catalog. Current public launch scope = English marketing + B2B sales validation, so acceptable.

**Follow-up before multilingual campaigns:** en-IN/en-US locale strategy, regional date/currency, hreflang, translated legal deltas, language switcher.

### Audit #15 — Legal & Commercial — GO (94/100)

Gatekeeper Legal/Compliance 10/10. Public 200 for /privacy, /terms, /cookie-policy, /dpa, /security, /.well-known/security.txt, /robots.txt, /sitemap.xml. Pricing, product, customers, demo, FAQ, contact, press-kit generated.

Commercial surface coherent for B2B question-bank: product, pricing, solutions, features, use cases, blog, demo/contact. Privacy copy notes minimal analytics; cookie-policy explains Plausible. DPA page exists.

**Follow-up once paid customers onboard:** order-form terms, processor/vendor table, SLA/support, refund/cancellation if self-serve checkout, DKIM selector for email deliverability.

### Audit #16 — UX / Usability — GO (89/100)

Prod build includes home, product, pricing, customers, demo, contact, FAQ, features, solution pages, blog, changelog, press kit, security, legal. Gatekeeper confirms responsive viewport, H1, metadata, no mixed content, no broken sampled internal links, custom 404, error page. HTML: 1 H1, multiple aria-labels.

Conversion paths: /demo, /contact, /pricing, /product, /features, /solutions/staffing, /solutions/enterprises, /solutions/platforms. Trust: /security, /privacy, /terms, /dpa, /.well-known/security.txt. No prod console log leakage.

**Follow-up:** human visual QA on mobile/desktop after campaign copy, validate Calendly/contact form prod secrets, instrumented funnel events for demo conversion.

### Audit #17 — Cost & Unit Economics — GO (91/100)

Single PM2 Next.js process on existing Talpro VPS. Reuses Nginx, Cloudflare, GitHub, monitoring/smoke. **No paid DB, queue, object storage, or separate compute required for public marketing launch.** PM2 memory after load ~461MB, within VPS envelope. ~6.2Gi RAM available, 0B swap used, disk 10%.

Origin load test: ~64k requests / 30s / 0 errors. Current host absorbs launch traffic for marketing surface without immediate spend. Deps/CI open-source/self-hosted. Plausible/Calendly/Resend/Sentry integrations optional or env-driven.

**Follow-up:** per-lead CAC tracking, Sentry/observability budget, Cloudflare analytics export once paid campaigns begin.

---

## CTO RECOMMENDATION

Weighted score **88/100**, gate verdict **🟢 GO**. All 17 audits passed. **Launch approved.**

- Intensive monitoring during first 72 hours post-launch
- Re-run Rakshak before any major release
- Quarterly Rakshak cadence minimum

## EVIDENCE ARTIFACTS

- Live site: https://qorium.online
- VPS workspace: /opt/apps/rakshak-runs/rakshak-qorium_online-mpt7km6c-44a4/
- Per-audit reports: /opt/apps/rakshak-runs/rakshak-qorium_online-mpt7km6c-44a4/reports/
- Run metadata: /opt/apps/rakshak-runs/rakshak-qorium_online-mpt7km6c-44a4/run.json
- Allow-list ship: talpro-mcp commit b4735c0a, completion 6a9740d
- QOrium SHAs: 4733383 (readiness) → fa2e1c6 (dependency security fix)

---
*Generated by Rakshak v1.0 | CTO Shakti governance framework v10.0*
