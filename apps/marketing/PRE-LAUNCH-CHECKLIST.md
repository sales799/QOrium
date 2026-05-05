# QOrium Marketing — Pre-Launch Checklist

**Owner:** CEO (Bhaskar Anand) for business gates · CTO for technical gates
**Status target:** all items ✅ before flipping PR #10 from draft → ready and announcing externally.
**Last updated:** 2026-05-05

---

## A. Live & Operating ✅ (already done)

- [x] **A1** — `qorium.online` live on VPS 1, PM2 + nginx, Let's Encrypt TLS
- [x] **A2** — `qorium.in` issued cert, 301-redirects to `qorium.online`
- [x] **A3** — All 19 routes return `200` (smoke-tested)
- [x] **A4** — Security headers on every response (HSTS, CSP, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- [x] **A5** — Sitemap (19 URLs), robots, RSS (3 posts), dynamic OG/icon/apple-icon
- [x] **A6** — CI green: lint · typecheck · test · secret-scan all passing on `ef29ebe`
- [x] **A7** — `gitleaks detect` clean against full history
- [x] **A8** — Forms wired with Resend → Gmail SMTP → console fallback chain
- [x] **A9** — Reduced-motion + theme-toggle persistence + mobile sheet nav verified
- [x] **A10** — Customer Zero (Talpro India) section grounded in Constitution SO-1, no fabricated logos

---

## B. Quality Gates (automated) ✅

- [x] **B1** — Lighthouse CI workflow (`.github/workflows/marketing-quality.yml`) — runs on every PR touching `apps/marketing/**`, asserts ≥85 perf / ≥90 a11y/best-practices/SEO (warn-mode until baseline)
- [x] **B2** — axe-core CLI workflow — runs on every PR, scans 9 critical routes against WCAG 2.1 A + AA tags
- [x] **B3** — `pnpm audit --prod --audit-level high` in CI (`security-audit` job)

**B-block flips from warn → error after 3 successful PR runs establish a baseline.**

---

## C. User-Action Items (you, not me — needs panel/SSH access)

### C1. Security follow-ups (Hostinger panel + GitHub settings)

- [ ] **C1.1** — **Rotate Hostinger API key** (the one pasted in chat). Hostinger panel → API → revoke + regenerate.
- [ ] **C1.2** — **Flip GitHub repo `sales799/QOrium` back to private**. It was made public to allow VPS clone; now that the deploy script + GH Actions deploy keys can do that, private is appropriate.
- [ ] **C1.3** — **Confirm GitHub PAT used during the build session is revoked.** GitHub → Settings → Developer settings → Personal access tokens.

### C2. Mailer + scheduling provisioning (VPS env via SSH)

- [ ] **C2.1** — Provision `RESEND_API_KEY` and add to `apps/marketing/.env.local` on VPS 1. `pm2 restart qorium-marketing` after.
  - Fallback chain (already wired): Resend → Gmail SMTP (`GMAIL_USER` + `GMAIL_APP_PASSWORD`) → console log.
- [ ] **C2.2** — Decide Calendly URL for `/demo` self-serve booking. Set `NEXT_PUBLIC_CALENDLY_URL` in `.env.local` and restart.
- [ ] **C2.3** — Decide Plausible domain (analytics). Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`. Off-by-default until set.

### C3. GH Actions zero-touch deploy

- [ ] **C3.1** — Add repo secret `MARKETING_DEPLOY_HOST` (VPS 1 IP)
- [ ] **C3.2** — Add repo secret `MARKETING_DEPLOY_USER` (`root` or deploy user)
- [ ] **C3.3** — Add repo secret `MARKETING_DEPLOY_SSH_KEY` (private key whose pubkey is in VPS `~/.ssh/authorized_keys`)
- [ ] **C3.4** — Test the `deploy-marketing.yml` workflow with a manual `workflow_dispatch` once secrets are set.

---

## D. Content Gates (CEO authority required)

- [ ] **D1** — **Counsel review of legal pages.** `/privacy /terms /dpa` ship as skeletons with a "Pre-launch: under counsel review" banner. Do not remove the banner until counsel returns redlines and they're applied.
- [ ] **D2** — **Real case-studies for `/customers`.** Three slots are scoped + marked `[TBD: real customer]`. Per Constitution SO-12, ask before quoting any reference and offer prospects a 15-min reference call.
- [ ] **D3** — **Replace placeholder logo SVG** (`apps/marketing/src/components/site/Logo.tsx`). Currently a composite role-graph + library mark, marked `// PLACEHOLDER`. Final brand asset can drop in without API changes.
- [ ] **D4** — **Add real Day-0 cohort logos to the hero trust rail** when contractually allowed.

---

## E. Pre-Announce QA (after C+D complete)

- [ ] **E1** — Run real Lighthouse from MacBook on `qorium.online` home, `/pricing`, `/features/readybank`, `/security`, `/about`. Confirm all ≥90 (stretch ≥95).
- [ ] **E2** — Run `@axe-core/cli` against the same routes. Confirm zero critical violations.
- [ ] **E3** — Submit `/contact` form (with `RESEND_API_KEY` set). Confirm email arrives.
- [ ] **E4** — Submit `/demo` form. Confirm email arrives.
- [ ] **E5** — Verify mobile nav on real device (not just DevTools emulator).
- [ ] **E6** — Verify theme toggle persists across reload + across pages.
- [ ] **E7** — Hit `/sitemap.xml` and submit to Google Search Console.
- [ ] **E8** — Hit `/opengraph-image` and confirm OG card renders (Twitter card validator + LinkedIn Post Inspector).

---

## F. Launch Day Operations

- [ ] **F1** — Flip PR #10 from draft → ready, request review.
- [ ] **F2** — Merge to `main` (auto-deploys via `deploy-marketing.yml` once C3 is complete).
- [ ] **F3** — Smoke-test 5 critical routes on prod immediately post-deploy.
- [ ] **F4** — Submit sitemap to Google Search Console + Bing Webmaster.
- [ ] **F5** — Announce internally to Talpro Universe team.
- [ ] **F6** — Post to LinkedIn (CEO) + Twitter/X with the canonical USP from Constitution §1.1, verbatim.
- [ ] **F7** — Send the URL to the Bosch GCC discovery call thread.
- [ ] **F8** — Monitor PM2 logs for 24h post-launch (`pm2 logs qorium-marketing`).

---

## Acceptance for "ship it"

A row is **complete** only when ✅ checked. A row is **blocking launch** if it's in **C1**, **D1**, or **F**. Everything else can ship as "v1.0 with known gaps" (which is honest and fine).

**The morning review focus:** A-block proves the site exists; B-block proves it stays good; C+D blocks are explicitly your action items; E+F is the launch-day runbook.

---

_Generated by the autonomous marketing-site build, branch `claude/qorium-marketing-site-Z4gdI`._
