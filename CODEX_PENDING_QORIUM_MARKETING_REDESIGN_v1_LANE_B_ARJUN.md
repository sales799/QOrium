# CODEX PENDING — QOrium Marketing Redesign v1 — LANE B (ARJUN, marketing)

**Queued by:** CTO (Claude, Super Brain). **Executor:** Codex ARJUN (marketing lane). **Apex rule:** Codex writes ALL code; Claude does not.
**Date queued:** 2026-06-01
**Master spec:** `MARKETING_REDESIGN_360_v1.md` (read it fully before starting — IA, mega-menu §5, sitemap §6, blueprint §7)
**Design direction:** LOCKED — A+B+C synthesis (spec §0.1). Dark "Trust Infrastructure" shell + bright "Skills Shown" product/proof zones + India-credibility modules. ONE token system, three contextual surface treatments.
**Honesty hard-rule:** evidence-gating is mandatory. No logo we don't have, no stat we can't instrument, no cert we don't hold. Gated components hidden entirely until their feature flag flips — never "coming soon."

## Stack (per CTO UI Design Bible — non-negotiable)
shadcn/ui + Tailwind v4 · Aceternity/Magic UI effects · Motion v12 · per-product color identity. Banned: Inter/Roboto/system primary, default shadcn theme, purple-gradient-on-white, sections without entrance animation. Extensionless imports in apps/web. Atomic release (build /tmp → releases/<SHA> → flip symlink → pm2 reload). `next build` clean, security headers, WCAG 2.1 AA, CWV green in gate. Rakshak floor 80/80.

## Build order (exit-criteria gated, no dates)

### Phase 1 — Design system + mega-menu
- Tailwind v4 token system encoding the A+B+C zones (dark-shell tokens, bright-product tokens, india-credibility accent). Parameterize so a CEO "exact design" drop can re-tune palette/type/motif without structural rework.
- Header with full-width mega-menu per spec §5: Platform / Solutions / Why QOrium / Resources / Pricing / Book a demo / Sign in. Keyboard-navigable (WCAG), 150ms hover-intent, mobile = accordion, right-rail promo per panel, icons per product. Footer with full sitemap §6.
- **Exit:** mega-menu + header/footer shipped to prod, keyboard + mobile verified, Rakshak ≥ 80/80.

### Phase 2 — Core pages
- Homepage v2 narrative spine §7.1 (hero → villain/leak-timeline → 3 products → 8-dimension moat strip → proof zone → buyer routing → evidence-gated trust strip → CTA).
- 3 SKU pages `/platform/{readybank,jd-forge,stack-vault}` — copy from `sales/Pricing-Pages-3-SKUs-Copy.md`.
- 3 Solutions-by-buyer pages `/solutions/{assessment-platforms,enterprises-gcc,staffing-firms}`.
- **Exit:** all 7 pages live, atomic release, headers + a11y pass.

### Phase 3 — Trust + Method shell (A-mode, dark)
- `/method /science /anti-leak /authoring /trust /security /compliance-dpdp /responsible-ai` — research-as-marketing (CodeSignal/Vanta pattern). `/responsible-ai` carries the "Shipped / Beta / Roadmap" honesty table.
- **Exit:** 8 pages live; honesty status-table wired to a real flag source.

### Phase 4 — Interactive proof (B-mode) — coordinate with Lane A (BHIMA) for api hooks
- JD→test demo widget, graded-answer/sample-question viewer, Sample-Pack gated lead magnet (source packs: `sales/Sample-Pack-*`).
- **Exit:** widgets live + email capture wired.

### Phase 5 — Programmatic SEO factory — primarily Lane A (BHIMA), ARJUN renders
- role-graph-driven page generation: `/library/{skill}` (1,000+), `/solutions/role/*`, `/solutions/stack/*` (India edge), `/vs/{vervoe,hackerrank,mettl,imocha,coderbyte}`. JSON-LD + sitemap.
- **Exit:** generators live, sitemap submitted, JSON-LD valid.

### Phase 6 — Proof population (evidence-gated)
- logo rail / case-study / outcome-stat components built behind flags; flip only as evidence lands. Components must render nothing (not placeholders) when flag is off.

## Parallel-work guard
Before any new-package PR: `gh pr list --state all --search "qorium"`. Multiple sessions ship to qorium repos by design. `project_work_lock` before mutating shared state.

## Open input (non-blocking)
CEO may drop an "exact design" reference; if it lands, re-tune Phase-1 visual tokens only. Do not block structural work waiting for it.
