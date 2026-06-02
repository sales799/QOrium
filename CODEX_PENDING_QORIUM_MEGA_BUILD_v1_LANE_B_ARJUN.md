# CODEX_PENDING — QORIUM MEGA BUILD v1.0 — LANE B — ARJUN (Marketing)

**You are:** Codex ARJUN (Mac Mini M4 Pro, account `bhaskar@talproindia.com`).
**Counterpart:** Codex BHIMA runs Lane A (backend) in parallel. Stay out of `qorium-app` / `qorium-api`. BHIMA stays out of `qorium-marketing`.
**You will not ask Claude or the CEO for permission per task.** Read this shard, plan, execute, prove. Single consolidated `founder_request` only for true blockers.

---

## 0. APEX READS (do these first, every session)

1. `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/QORIUM_MEGA_BUILD_v1.0.md` — master spec
2. `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/MARKETING_SITE_IA_v1.md` — your sitemap + per-section spec
3. `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/GAP_ANALYSIS_2026-05-31.md` — what competitors do
4. `_shared/TALPRO-UI-DESIGN-BIBLE.md` — visual rules (no purple gradients on white; no Inter/Roboto; banned UI libs: MUI/Ant/Chakra)
5. Rakshak last GO report — `/opt/apps/rakshak-runs/rakshak-qorium_online-mpt7km6c-44a4/cto.md` — baseline (88/100 GO on 2026-05-31)
6. MANTHAN session `9194eed8`

---

## 1. PHASE 4 SCOPE — Marketing site v2 (gated by Phase 1 backend exit)

**Trigger:** BHIMA marks Phase 1 backend done.
**You may start Phase 4 prep work earlier** — IA, copy drafts, programmatic-SEO templates — but **do not publish capability claims** until the backend ships them.

**In scope this run:** W1 hero rewrite · W2 customer logos · W3 outcome stats (placeholder slots, only fill after instrumented) · W4 product tour loop · W5 pricing page · W6 assessment library landing + per-skill programmatic pages · W7 solutions matrix · W8 customer-stories index (seed: Talpro India) · W9 resources hub (blog + 6 guides + JD library) · W10 API docs landing · W11 compare-vs pages (5 competitors) · W12 LLM-info + llms.txt · W13 trust strip (badges populate as evidence lands) · W14 FAQ schema everywhere · W15 SEO hygiene pass.

**Out of scope this run:** customer-story videos · interactive product tour · Indian-language localization · community surface.

---

## 2. REPO SETUP

- Repo: `qorium-marketing` (currently live as PM2 service `qorium-marketing`).
- Stack: Next.js (validate current version), Tailwind v4, shadcn/ui + Aceternity + Magic UI, Motion v12. Match TALPRO-UI-DESIGN-BIBLE per-product color identity.
- Atomic-release pattern (build /tmp → mv to `releases/<SHA>/` → flip `current` symlink → `pm2 reload --update-env`).
- NEXT_PUBLIC_* env sourced BEFORE `next build`.
- CI must run `next build` for `apps/web`, not just tsc (Turnstile-incident lesson).
- Sanity CMS or Contentlayer for blog/guides content (your call; prefer Sanity if a connector exists per skill `sanity:sanity-best-practices`).

---

## 3. PER-DELIVERABLE EXECUTION

For each W deliverable: build → screenshot → Rakshak SEO sub-audit per page → push to staging → CEO review (in-context, via `present_files`) → push to prod.

### W12 — LLM-info + llms.txt (do FIRST — owns SEO 2026 wedge)
1. `/llm-info` static page: plain-prose product brief (modules, pricing in text, CTA, terms-of-use note for AI assistants).
2. `/llms.txt` at site root — follow llmstxt.org spec.
3. Both reachable, both indexable, both linked from footer.

### W6 — Assessment Library landing + programmatic `/skill/:slug`
1. Library landing at `/product/assessment-library` with filter sidebar (category, role, difficulty, duration).
2. Server-side rendered cards (no client-only fetch — SEO).
3. Per-skill programmatic page `/skill/:slug` for all 150 skill slugs from M12 taxonomy seed (poll backend `/api/v1/skills` once ready; until then, render from local seed JSON synced from `packages/taxonomy/seed.json` in BHIMA's repo).
4. Sample questions (≤3), calibration status, FAQ schema, cross-link to `/job-descriptions/:skill-role-overlap`.
5. Page meta tags + Open Graph + Twitter Cards per page.

### W9 — Resources hub + programmatic JD library
1. `/resources/blog` (Sanity-backed).
2. Six guides as gated lead magnets (first 25% open):
   - "The Talpro Guide to Skills Testing in India"
   - "How to evaluate AI hiring vendors under India DPDP Act"
   - "Building a hiring rubric that survives an HR tribunal"
   - "Skills-gap analysis template (Excel)"
   - "Shortlisting matrix template (Excel)"
   - "30-60-90 hiring plan template (Docx)"
3. `/job-descriptions/:slug` programmatic — seed 50 roles (CEO/Lakshmi to source list; otherwise seed from Naukri public taxonomy).
4. Schema: Article + FAQ + Breadcrumb on every doc.

### W11 — Compare-vs pages (5)
- `/compare/qorium-vs-vervoe`
- `/compare/qorium-vs-coderbyte`
- `/compare/qorium-vs-hackerrank`
- `/compare/qorium-vs-mercer-mettl`
- `/compare/qorium-vs-imocha`
Pattern per spec §6 of MARKETING_SITE_IA. Honest, no smearing, cite competitor docs.

### W5 — Pricing
Recommended tier structure per IA §3. Numbers (₹X, ₹Y) ARE FOUNDER LOCKS — file ONE `founder_request` with proposed tier numbers + ask CEO + Lakshmi-Kosh to confirm. Until confirmed, render "Talk to sales" on all paid tiers and only enable the Free Customer-Zero tier.

### W1, W2, W3, W4, W13 — Homepage
Apply IA §2 section-by-section.
- W3 outcome stats: leave 3 slots **empty/placeholder** until instrumented evidence exists (Phase 5). Do not publish unverifiable numbers.
- W13 trust badges: render only the ones that have evidence (DPDP-aligned from Rakshak; the others render in greyscale "coming" state until M15/M16 ship).

### W7 — Solutions matrix
Build 3 × N grid of pages per IA sitemap. Per-page template = persona-led copy + 3 wedge blocks + CTA.

### W8 — Customer stories
Build index + 1 detail page seed: Talpro India as Customer Zero. Stub the rest.

### W10 — API marketing landing
Link to forthcoming OpenAPI docs (BHIMA M20). Until M20 ships, render "API docs in beta — request access" + waitlist form.

### W14 + W15 — SEO hygiene pass
- FAQ schema on home, pricing, product pages, compare pages
- Product schema on product pages
- Article schema on blog
- BreadcrumbList everywhere
- Canonicals every page
- robots.txt allows crawlers; disallows /api/, /_next/, admin
- Sitemap auto-generated, includes programmatic pages
- Core Web Vitals: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1

---

## 4. QUALITY GATES (before claiming Phase 4 done)

- `npm run build` and `next build` clean
- Lighthouse 90+ on Perf/Acc/Best-Practices/SEO for `/`, `/pricing`, `/product/assessment-library`, one `/skill/:slug`, one `/compare/*`
- Rakshak re-audit — target ≥ 90/100 (current baseline 88/100 from 2026-05-31)
- Atomic-release pattern verified
- Screenshots saved at `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/screenshots/<slug>.png`
- All schema markup validates in Google's Rich Results test (or equivalent)
- Watchdog: `qorium-marketing` health-check on `/` returning 200, TLS expiry > 30 days

---

## 5. FORBIDDEN

- ❌ Claiming a capability the backend hasn't shipped (e.g., don't say "AI grading" if M4 isn't live)
- ❌ Inter / Roboto / Arial / system fonts as primary
- ❌ MUI / Ant Design / Chakra / Bootstrap / Daisy UI
- ❌ Purple-gradient-on-white
- ❌ Sections without entrance animations
- ❌ Default shadcn theme colors (use TALPRO-UI-DESIGN-BIBLE per-product palette)
- ❌ `next build` inside live `/opt/apps/qorium-marketing` dir
- ❌ Sourcing env after build
- ❌ Touching BHIMA's repos (qorium-app, qorium-api, etc.)

---

## 6. COORDINATION WITH LANE A (BHIMA)

- `project_work_lock` on any `_shared/` file
- Poll BHIMA's `/api/v1/skills` after M12 ships to power dynamic library
- If you need a backend endpoint that doesn't exist yet, render the page in "coming soon" state — don't block

---

## 7. CHECKPOINT CADENCE

- After each W deliverable: `manthan_save(sessionId="9194eed8", stage="arjun-progress-W<n>.md", content=<evidence>)`
- After Phase 4 full exit: append to `blueprint.md` via `manthan_save`
- After every session: `session_save_state` with project="qorium", phase="phase4-marketing", summary, currentTask, nextAction

---

## 8. EVIDENCE-FIRST CLOSE

Final CEO report at Phase 4 exit must include:
- Sitemap of all live pages
- Lighthouse report per key page
- Rakshak re-audit score (target ≥ 90/100)
- Screenshots folder
- Live URLs for the 5 compare-vs pages
- `/llms.txt` and `/llm-info` reachable
- One `founder_request` consolidating: pricing numbers, role-source list for JD library, customer-story Talpro pilot questions

That is the bar. Ship it. Then resume Phase 5 (pilots support) without asking.
