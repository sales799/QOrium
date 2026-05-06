# QOrium Marketing — Pre-Launch Checklist

**Owner:** CEO (Bhaskar Anand) for business gates · CTO for technical gates
**Status target:** all items ✅ before flipping PR #10 from draft → ready and announcing externally.
**Last updated:** 2026-05-06 (Completion Sprint v1)

---

## A. Live & Operating ✅ (already done)

- [x] **A1** — `qorium.online` live on VPS 1, PM2 + nginx, Let's Encrypt TLS
- [x] **A2** — `qorium.in` issued cert, 301-redirects to `qorium.online`
- [x] **A3** — All 21 routes return `200` (smoke-tested)
- [x] **A4** — Security headers on every response (HSTS, CSP, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) · CSP allows Calendly origins
- [x] **A5** — Sitemap (21 URLs incl. /changelog + /press-kit), robots, RSS (3 posts), dynamic OG/icon/apple-icon
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

(Reconciles names with `.github/workflows/deploy-marketing.yml` actual env vars.)

- [ ] **C3.1** — Add repo secret `VPS_HOST` (VPS 1 IP — `147.93.103.194`)
- [ ] **C3.2** — Add repo secret `VPS_USER` (`root` or deploy user)
- [ ] **C3.3** — Add repo secret `VPS_PORT` (`2244`)
- [ ] **C3.4** — Add repo secret `VPS_SSH_KEY` (private key whose pubkey is in VPS `~/.ssh/authorized_keys`)
- [ ] **C3.5** — Set repo variable `MARKETING_DEPLOY_ENABLED=true` (or trigger the workflow via `workflow_dispatch`)
- [ ] **C3.6** — (Optional) Add `RESEND_API_KEY`, `NEXT_PUBLIC_CALENDLY_URL`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `GMAIL_USER`, `GMAIL_APP_PASSWORD` as repo secrets — populated automatically into `apps/marketing/.env.local` on VPS during deploy.
- [ ] **C3.7** — Test the `deploy-marketing.yml` workflow with a manual `workflow_dispatch` once C3.1-C3.6 are set.

---

## D. Content Gates (CEO authority required)

> **Bucket 4 — post-launch async.** Per the Completion Sprint v1 plan (2026-05-06), these items inherently cannot complete in 1-2 days. They are explicitly tracked as post-launch async with owner + ETA. The site launches with these still open.

- [ ] **D1** — **Counsel review of legal pages.** `/privacy /terms /dpa` ship with the "Pre-launch: under counsel review" banner. Owner: CEO + external counsel. ETA: 3-10 business days.
- [ ] **D2** — **Real case-studies for `/customers`.** Three slots scoped, marked `[TBD: real customer]`. Owner: CEO + Bali (sales). ETA: 1-4 weeks (per pilot milestones). Per Constitution SO-12, ask before quoting any reference; offer prospects a 15-min Customer Zero (Talpro India) reference call in the meantime.
- [ ] **D3** — **Replace placeholder logo SVG** (`apps/marketing/src/components/site/Logo.tsx` + `app/api/brand/logo.svg/route.ts` + `app/api/brand/wordmark.svg/route.ts`). Currently composite role-graph mark, marked `// PLACEHOLDER`. Owner: CEO + design. ETA: 3-5 days. Final asset drops in without API changes.
- [ ] **D4** — **Add real Day-0 cohort logos to the hero trust rail** when contractually allowed. Owner: CEO + sales. ETA: 1-3 weeks per contractual permission.

---

## G. Completion Sprint v1 — Phase 1 ops completeness ✅ (2026-05-06)

Phase-1 autonomous work shipped in commits `dc20c1c → d72a08a → [next push]`:

- [x] **G1** — Bali ops folder completed: `bali/templates/win-loss-debrief.md` (Constitution §675 Friday cadence), `bali/templates/monthly-business-review.md` (Constitution §671 monthly cadence)
- [x] **G2** — JSON-LD breadcrumbs (`BreadcrumbJsonLd` in `seo/JsonLd.tsx`) wired across all 3 feature pages, all 3 solution pages, and `/blog/[slug]`
- [x] **G3** — `/changelog` page with 11 grounded entries from M0 → 2026-05-06 (typed content in `src/content/changelog.ts`)
- [x] **G4** — `/press-kit` page (locked USP verbatim, 75-word boilerplate, founder note, brand asset downloads)
- [x] **G5** — Brand asset endpoints `/api/brand/logo.svg` + `/api/brand/wordmark.svg` (still PLACEHOLDER per D3)
- [x] **G6** — `@next/bundle-analyzer` plumbed via `pnpm --filter @qorium/marketing build:analyze`
- [x] **G7** — Calendly embed wired: `CalendlyEmbed.tsx` component, `/demo` falls back gracefully, CSP updated to allow `https://calendly.com` + `https://assets.calendly.com`
- [x] **G8** — `NEXT_PUBLIC_CALENDLY_URL` documented in `.env.example`
- [x] **G9** — Blog posts expanded to ≥1,000 words: `leak-problem.mdx` adds Adaface 24h benchmark + WeCP/Byteboard acquisitions + Customer Zero proof; `role-graph.mdx` adds Spring Security → JWT worked example + cross-SKU role-graph reuse + M3 vs M12 trajectory
- [x] **G10** — Playwright E2E smoke test suite (5 critical-route tests in `apps/marketing/e2e/smoke.spec.ts`); CI job runs on every PR via `marketing-quality.yml`
- [x] **G11** — `deploy-marketing.yml` accepts new optional secrets (`RESEND_API_KEY`, `NEXT_PUBLIC_CALENDLY_URL`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`); injects to VPS `.env.local` via stdin (secrets never in process listings); smoke test extended to 6 routes
- [x] **G12** — Announce copy drafted in `governance/launch/`: `linkedin-launch-post.md`, `twitter-launch-thread.md`, `bosch-gcc-followup.md` — all use locked USP from Constitution §1.1 verbatim, ready for CEO publish

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
- [ ] **F3** — Smoke-test 6 critical routes on prod immediately post-deploy (workflow does this automatically).
- [ ] **F4** — Submit sitemap to Google Search Console + Bing Webmaster (`infra/seo-submission-helper.md` for steps when ready).
- [ ] **F5** — Announce internally to Talpro Universe team.
- [ ] **F6** — Post `governance/launch/linkedin-launch-post.md` (CEO) + `governance/launch/twitter-launch-thread.md` (5-tweet thread). All use locked USP from Constitution §1.1 verbatim.
- [ ] **F7** — Send `governance/launch/bosch-gcc-followup.md` to the Bosch GCC discovery thread.
- [ ] **F8** — Monitor PM2 logs for 24h post-launch (`pm2 logs qorium-marketing`).

---

## Acceptance for "ship it"

A row is **complete** only when ✅ checked.

**Blocking launch (must be ✅ to flip PR draft → ready):** A · B · G · C2 · C3 · F1.

**Launching with known gaps (honest):** D1, D2, D3, D4 are Bucket 4 — post-launch async. Documented in this file with owner + ETA. The site goes live with these open. We do not falsify legal copy, fabricate logos, or wait months for SOC 2.

**Sequencing:**

1. A + B + G are CTO-owned, complete as of 2026-05-06.
2. C1 + C2 + C3 are CEO-owned, in flight in parallel (per the 4-question scope clarification in Completion Sprint v1).
3. C is unblocked → run E (pre-announce QA from MacBook) → F1 (flip PR ready) → F2-F8 (launch day ops).
4. Bucket 4 (D + parts of F) continues post-launch under explicit owners and ETAs.

---

_Generated by the autonomous marketing-site build, branch `claude/qorium-marketing-site-Z4gdI`._
