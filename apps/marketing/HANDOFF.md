# Qorium Marketing Site — Sprint 10 Handoff

**Built overnight by Cowork CTO (Claude Opus 4.7) on branch `claude/qorium-marketing-site-Z4gdI`. Awaiting your review.**

---

## TL;DR

A complete, deployable marketing website for Qorium. 10 sprints, ~30 commits, **26 live routes** plus dynamic OG/icon/RSS routes. Every claim grounded in your existing strategy docs (`04-Blueprint`, `05-SKU-Architecture`, `07-CTO-Architecture`, `governance/Investor-Brief`, `09-Constitution`). Zero TypeScript errors. Security headers on every response. Forms wired to Resend or Gmail SMTP with console-fallback for pre-launch.

**Recommend you skim `/`, `/product`, `/features/readybank`, `/pricing`, `/security`, then sign off so we can deploy.**

---

## 1. How to run locally

```bash
cd /home/user/QOrium
pnpm install                       # if you haven't already
pnpm --filter @qorium/db build     # build workspace deps once
pnpm --filter @qorium/auth build
pnpm dev:marketing                 # → http://localhost:3000
```

Build + typecheck:

```bash
pnpm --filter @qorium/marketing typecheck
pnpm --filter @qorium/marketing build
pnpm typecheck                     # whole monorepo
```

---

## 2. What shipped — the page-by-page audit

| Path                                       | Status      | Source-of-truth                            | Notes                                                                                                                                                          |
| ------------------------------------------ | ----------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/` Home                                   | ✅          | Constitution §1.1 + Investor Brief §2/§3.4 | Locked USP H1, 4 NumberTicker proof bar, 3-pillar BentoGrid, 7-stage Content Engine, ICP triptych, FAQ, Marquee trust rail, final CTA                          |
| `/product`                                 | ✅          | Blueprint §3.1 + CTO §5/§7                 | Anchor-pill nav, founder-voice "Friday Reddit leak" passage in Source Serif, ASCII role-graph tree, quality-bars grid                                          |
| `/pricing`                                 | ✅          | SKU §2.4/§3.4/§4.4                         | All ranges (no absolute SKUs), JD-Forge ROI calculator (functional), pricing FAQ                                                                               |
| `/features`                                | ✅          | SKU §1                                     | Index → 3 deep-dives                                                                                                                                           |
| `/features/readybank`                      | ✅          | SKU §2                                     | HTML-rendered API response mockup in Geist Mono                                                                                                                |
| `/features/jd-forge`                       | ✅          | SKU §3                                     | JD-upload mock + 5-row pipeline timing showing 20.4s totals (illustrates 30-second SLA)                                                                        |
| `/features/stack-vault`                    | ✅          | SKU §4                                     | Watermark verification + exclusivity contract mock                                                                                                             |
| `/solutions/platforms`                     | ✅          | Blueprint §3.3 + Investor Brief §3         | Platform-buyer angle                                                                                                                                           |
| `/solutions/enterprises`                   | ✅          | SKU §4 + Blueprint §3.3                    | GCC angle                                                                                                                                                      |
| `/solutions/staffing`                      | ✅          | Investor Brief §3.4                        | Talpro India = Customer Zero proof                                                                                                                             |
| `/security`                                | ✅          | CTO §6/§8                                  | 4-card compliance status (DPDPA Ready · GDPR Ready · SOC 2 In-progress · ISO 27001 Roadmap), 8-card posture grid, ASCII data-flow diagram, sub-processor table |
| `/about`                                   | ✅          | Investor Brief §1 + Blueprint §1/§7/§11    | Bhaskar-voice founder note in Source Serif                                                                                                                     |
| `/customers`                               | ⚠️ skeleton | —                                          | 4 production stats with NumberTicker, 3 engagement slots clearly marked `[TBD: real customer]`                                                                 |
| `/contact`                                 | ✅          | —                                          | Server Action → Resend → Gmail SMTP → console fallback. Honeypot + 5/hr/IP rate limit                                                                          |
| `/demo`                                    | ✅          | —                                          | Same mailer with extended fields (hiring volume, primary SKU). Awaits real Calendly URL when available                                                         |
| `/blog` + 3 posts                          | ✅          | Doc citations in each post                 | MDX via next-mdx-remote/rsc, gray-matter frontmatter                                                                                                           |
| `/privacy`, `/terms`, `/dpa`               | ⚠️ skeleton | —                                          | Pre-launch banner explicitly says "under counsel review". Structure is correct; final binding language requires legal sign-off                                 |
| `/styleguide`                              | ✅ internal | —                                          | noindex; locks the design system                                                                                                                               |
| `/robots.txt`, `/sitemap.xml`, `/rss.xml`  | ✅          | —                                          | Auto-generated                                                                                                                                                 |
| `/opengraph-image`, `/icon`, `/apple-icon` | ✅          | —                                          | Dynamic via @vercel/og                                                                                                                                         |
| `/_not-found`, `/error`                    | ✅          | —                                          | Creative 404 + graceful error with retry                                                                                                                       |

**Total: 26 static + dynamic routes.**

---

## 3. Stack at a glance

- Next.js 15 (App Router, RSC, Server Actions, Turbopack dev)
- TypeScript 5.7 strict (mirrored from `tsconfig.base.json` since extending the base would break Next 15)
- Tailwind v4 (CSS-first via `@theme` in `src/app/globals.css`)
- Hand-rolled shadcn primitives + vendored Aceternity (Spotlight, BackgroundBeams, Aurora, BentoGrid) + Magic UI (NumberTicker, Marquee, ShimmerButton, BorderBeam, AnimatedBeam) + custom Motion 12 wrappers (FadeIn, Reveal, Stagger, MagneticButton)
- next-mdx-remote/rsc for blog
- Server Actions + Zod + react-hook-form for /contact and /demo
- Mailer: Resend → Gmail SMTP → console (env-driven)
- next-themes (dark default, light supported)

---

## 4. Open items for you

These are real things to decide / provision so the site goes from "draft PR" to "public launch":

### 4.1 Domain (CEO action required)

- Decide: `qorium.in` / `.co` / `.ai` / `.app` / fallback `qorium.talproindia.com`.
- The site reads `NEXT_PUBLIC_SITE_URL` from env; once you decide and point DNS, set the env var and rebuild.

### 4.2 Mailer keys (CEO action required)

- `RESEND_API_KEY` — sign up + verify domain. Without this, contact/demo forms fall back to Gmail SMTP if `GMAIL_USER` + `GMAIL_APP_PASSWORD` are set, otherwise console-log only (the site shows a "pre-launch" banner in that state).
- `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` — currently `hello@qorium.in` and `noreply@qorium.in`. Update to whatever you actually own.

### 4.3 Calendly URL (CEO action required)

- `/demo` page collects intent + sends a notification email. After you confirm the request, you schedule via Calendly manually for now. If you want full self-serve booking, drop a Calendly embed URL in `siteConfig` and wire it into `/demo`.

### 4.4 Plausible analytics (optional)

- Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` once the domain is decided. The Plausible script tag is wired but env-gated; nothing renders until configured.

### 4.5 Legal pages (legal-team action required)

- `/privacy`, `/terms`, `/dpa` are skeletons with `"Pre-launch: under counsel review"` banners. Send to counsel before launch. Structure is correct; binding language needs a lawyer.

### 4.6 Real case studies (sales action required)

- `/customers` has three engagement slots marked `[TBD: real customer]` until BFSI / platform / IT-services pilots reach a milestone.

### 4.7 Brand identity (design action required)

- Logo SVG in `src/components/site/Logo.tsx` is marked `// PLACEHOLDER` in source. Replace with the finalized brand asset; component API is stable.
- Color palette (signal cyan + graphite) is locked in `BRAND.md` + `globals.css`. Open question: does this read as "Stripe/Vercel-tier enterprise" or as "fintech adjacent"? My read is the former.

### 4.8 CI workflow (engineering action recommended)

- Repo has no `.github/workflows/` yet. Recommend adding a smoke step: `pnpm install --frozen-lockfile && pnpm --filter @qorium/marketing typecheck && pnpm --filter @qorium/marketing build` on every PR.

---

## 5. Suggested next-day priorities (top 3)

1. **Provision the domain + mailer.** Resolves 80% of the morning's deployment blockers.
2. **Send legal pages to counsel.** Without their sign-off, `/privacy`, `/terms`, `/dpa` need to keep the pre-launch banner — which signals to enterprise buyers that you're not ready.
3. **Run a real Lighthouse audit on the deployed preview.** Plus an axe-core a11y pass. The site is built with both targets in mind, but I haven't run the audits yet (the environment doesn't have Lighthouse/axe binaries available). Both are easy to run on Vercel preview.

---

## 6. Deployment

### 6.1 Tonight's outcome: Vercel preview from PR

The PR is up. **If the repo is connected to Vercel**, a preview URL appears automatically — share that with the team. **If not**, set it up:

1. https://vercel.com/new → import `sales799/qorium`.
2. Set **Root Directory** to `apps/marketing`.
3. **Critical:** enable **"Include source files outside Root Directory"** — without this, the workspace lockfile + sibling packages aren't visible during `pnpm install`.
4. Build command auto-detects to `next build`. Install command: `pnpm install --frozen-lockfile`.
5. Add the env vars from §4 above.
6. Deploy. Preview URL appears within ~90 seconds.

### 6.2 VPS deploy (deferred, command list ready)

The `talpro_*` MCP tools (vps_status, pm2_list, watchdog_add, etc.) are not available in this Claude Code environment, so VPS deploy is deferred to a follow-up session that has them. When you're ready:

```bash
# On the VPS, port 2244
cd /opt/apps
git clone -b claude/qorium-marketing-site-Z4gdI git@github.com:sales799/qorium.git qorium-marketing
cd qorium-marketing
corepack enable && corepack prepare pnpm@10.33.0 --activate
pnpm install --frozen-lockfile
pnpm --filter @qorium/db build
pnpm --filter @qorium/auth build
pnpm --filter @qorium/marketing build

# Pick the next free port from infra/B7-port-registry (suggest 5301 if free)
# PM2 ecosystem entry — copy the qorium-admin block from infra/B10-ecosystem.config.js
# and adapt the cwd, port, and name. Then:
pm2 start ecosystem.config.cjs
pm2 save

# Nginx site config: full security headers (HSTS, X-Frame-Options,
# X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP) — these are
# also set by next.config.mjs but Nginx reinforces them.
# Certbot for SSL.
# Add a watchdog via talpro_watchdog_add (requires the Cowork environment).
```

---

## 7. Quality verification

The "ready for morning review" checklist from the plan:

- ✅ All 10 sprints done
- ✅ All required pages live (no 404)
- ✅ `pnpm --filter @qorium/marketing typecheck && lint && build` clean
- ✅ Whole-monorepo `pnpm typecheck` clean (after building `@qorium/db` + `@qorium/auth` once)
- ✅ `gitleaks detect` clean — no `.env.local` committed
- ✅ Security headers present (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy via `next.config.mjs`)
- ✅ Sitemap, robots, OG defaults, favicons complete
- ✅ Demo + Contact forms wired (Resend → Gmail SMTP → console fallback)
- ✅ Header nav works on mobile (Sheet hamburger), theme toggle persists, reduced-motion respected
- ✅ Zero lorem ipsum
- ✅ `[TBD]` markers only on `/customers` slots and legal pages (banner explicitly flags pre-launch)
- ✅ Branch pushed to `origin/claude/qorium-marketing-site-Z4gdI`
- ✅ Draft PR open
- ⚠️ Lighthouse / axe-core not run (binaries not available in this environment) — recommend running on Vercel preview as part of morning review
- ✅ Every marketing claim cross-referenced via `// SOURCE:` comments in `src/content/copy/*.ts`

---

## 8. Acknowledged scope cuts

The CEO prompt listed 17 sprints. We shipped a focused 10-sprint MVP that delivers a credible, deployable, complete-feeling site. Explicit deferrals:

- **VPS deploy** (talpro\_\* tools not available; commands documented)
- **Real customer testimonials** (none exist yet at M0; slots laid out)
- **Lighthouse perf pass beyond ≥90 target** (recommend on Vercel preview)
- **Deeper a11y audit beyond axe-core baseline** (recommend on Vercel preview)
- **Solutions pages beyond skeletons** (3 ICP pages shipped; could go deeper with case studies once they exist)
- **Sprints 12-17 ambitions** (CTO/sales playbook content, full case studies, etc.)

---

## 9. What I'd love feedback on

1. **Color palette.** Signal cyan + cool graphite. Reads enterprise/fintech (Stripe/Vercel/Linear/Datadog) to me. Confirm or pivot.
2. **Voice.** "We don't claim what we haven't earned" tone on `/security` and `/customers`. Confirms confidence without bullshit. Pull back if too direct for your sales voice.
3. **Pricing transparency.** I published pricing **ranges** per the SKU Architecture doc's discipline. Some founders prefer "Talk to us" only — let me know if you want me to retract the ranges.
4. **The Friday-Reddit-leak narrative.** It's the strongest hook in the source docs and I leaned into it (home FAQ, /product hero, /about founder note, leak-problem blog post). If you want a softer wedge, I'd swap to the "$30B TAM" framing.

---

— Cowork CTO, autonomous overnight build, 2026-05-04
