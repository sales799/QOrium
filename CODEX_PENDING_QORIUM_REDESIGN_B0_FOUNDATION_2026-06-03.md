# CODEX PENDING — QORIUM Redesign · B0 Foundation

**Lane:** ARJUN (Mac Mini, bhaskar@talproindia.com) · Codex Pro — marketing repo `qorium-marketing`
**Priority:** P0 · **Blocks:** B1, B2, B4 · **Depends on:** nothing
**Planner source:** `QORIUM_WEBSITE_REDESIGN_BLUEPRINT_v1.md` §2 (voice), §3 (IA/301), §4 (tokens), §5.4 (CTA registry)
**Guardrail:** ARJUN writes this branch → BHIMA reviews → GBS merge. Author lane never self-approves. Atomic-release only; never `next build` in a live dir. Source `NEXT_PUBLIC_*` before build.

---

## Goal
Lay the foundation every later branch depends on: locked design tokens, one global nav + footer, a CTA registry, a banned-words CI gate that fails the build on build-voice, and the 301 map that closes IA defects D1/D2/D4 without losing SEO equity.

## Live state grounding (verified 2026-06-03 — do not re-assume)
- D1 `/features`, `/features/readybank`, `/features/jd-forge`, `/features/stack-vault` → **all 200** (true duplicates of `/platform/*`). **Action: 301 → matching `/platform/*`.**
- D2 `/vs/*` → **200 (live canonical)**; `/compare/qorium-vs-*` → **308 → /vs/***. **Decision (CTO): keep `/vs/*` as canonical** (10 complete pages, already the redirect target). Harden `/compare/*` 308→**301**, drop `/compare/*` from `sitemap.ts`. *(This overrides blueprint D2's `/compare` preference — rationale: less SEO churn, `/vs/*` is complete and already canonical.)*
- D3 `/product`, `/product/api`, `/product/assessment-library` → **200**. **Do NOT merge in B0** — decision-gated, low urgency. Add `rel=canonical` only; full merge deferred to a later branch with CEO sign-off.
- D4 `/solutions/role/python-developer`, `-2`, `-3` → **all 200** (thin-content dupes). **Action: 301 `-2`/`-3` → base role; audit the generator so dupes stop regenerating.**

## Tasks

### B0.1 — Design token lock
- Treat `apps/web/src/app/globals.css` token system as authoritative (Ink `#11130f`, Paper `#f6f8f4`, Green `#0d4c3a`/`#0f6a4c`, Saffron `#d4892f`, Cyan `#187a86`, serif display + sans UI + mono eyebrow). Export as a single `tokens.ts`/CSS-var source; remove any stray Inter/Space-Grotesk/navy references. No new fonts/colors.

### B0.2 — Global nav + footer (one component each)
- Mega-menu per blueprint §3.2 (Platform ▾ · Solutions ▾ · Why QOrium ▾ · Resources ▾ · Pricing + `Sign in` / `Book a demo`). Evidence-gated items render only when their flag is live; **never** render "coming soon"/"hidden" labels.
- Full footer §3.4: 4 link columns + Company + Legal & Trust, attribution line **"QOrium™ is a product of Talpro India Private Limited."**, `security.txt` link. Badges only when earned (no ISO/SOC until M15/M22).

### B0.3 — CTA registry
- One typed registry mapping every CTA label → canonical href (fixes D7 label≠href). Components import from it; lint rule forbids inline CTA hrefs.

### B0.4 — Banned-words CI gate (hard fail)
- Scanner over **rendered** copy. Fail the build on any hit from blueprint §2 banned list: meta references ("the site/page/redesign", "sitemap routes", "proof architecture"), implementation leak ("flag", "founder-locked", "coming soon", "beta" as visible label), funnel jargon ("buyer routing", "conversion story"), taxonomy-as-headline ("eight-dimension moat"), empty intensifiers ("world-class", "cutting-edge", "seamless", "leverage", "unlock", "supercharge"). Wire into existing CI alongside `next build`/`tsc`/axe/lighthouse.

### B0.5 — 301 map (D1/D2/D4)
- Implement in the **canonical-source nginx config** (`/etc/nginx/conf.d/qorium-marketing.conf` is precedence-winner — also patch `infra/marketing-deploy.sh` source so it survives redeploys; note the source-of-truth consolidation debt).
  - D1: `/features` → `/platform`; `/features/readybank|jd-forge|stack-vault` → `/platform/<same>` (301).
  - D2: `/compare/qorium-vs-*` 308 → **301** → `/vs/*`; remove `/compare/*` from `sitemap.ts`.
  - D4: `/solutions/role/*-2`, `*-3` → base role (301); fix generator dedupe.
- `nginx -t` clean → `systemctl reload nginx`. Back up every edited conf with timestamp before writing.

## Acceptance gates (all must pass)
1. `next build` + `tsc --noEmit` clean; CI banned-words gate **green on compliant copy, red on a planted violation** (prove it fires).
2. `curl -I` shows: `/features*` → 301 `/platform/*`; `/compare/qorium-vs-vervoe` → 301 `/vs/vervoe`; `/solutions/role/python-developer-2` → 301 base. `/`, `/platform`, `/product`, `/vs/vervoe` stay 200.
3. One nav + one footer rendered site-wide; CTA registry is the only CTA href source.
4. Security headers unchanged (HSTS/CSP/X-Frame intact). Rakshak SEO sub-audit not regressed.
5. PR opened by ARJUN; **BHIMA reviews + approves**; GBS merges to main; atomic-release deploy; smoke `/`, `/platform/readybank`, `/vs/vervoe`, `/pricing` = 200.

## Out of scope for B0 (do not touch)
- `/product/*` merge (D3) — decision-gated. Pricing numbers (founder). Page bodies/copy recreate (that's B1+). DB/content (B5).

## Report back
Update `QORIUM_REDESIGN_BRANCH_DAG_2026-06-03.md` QUEUE line to DONE with PR # + merge SHA + the 5 acceptance curls.
