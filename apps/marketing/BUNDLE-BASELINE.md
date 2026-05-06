# Marketing App — Bundle Size Baseline

**Captured:** 2026-05-06 · **Branch:** `claude/qorium-marketing-site-Z4gdI` · **Commit:** `8a5256c` (CTO operating folder)
**How captured:** `ANALYZE=true pnpm --filter @qorium/marketing build`
**Tool:** `@next/bundle-analyzer` plugged into `next.config.mjs` per ADR 0006 / Phase 1.6 of Completion Sprint v1.
**Owner:** CTO Office · **Authority:** SO-3 (Quality Gate Discipline)
**Resolves:** TD-009 in `cto/tech-debt.md`

---

## Why this baseline matters

The marketing site's bundle size is a Lighthouse-Performance input AND a real cost paid by every visitor on first page load. Capturing a baseline lets us:

1. **Detect regressions** — any future PR that bumps a route's gzip size by >20% triggers a CTO review.
2. **Justify dependency additions** — when a new dependency is proposed, the cost shows up here.
3. **Tune for real metrics** — once Plausible Performance plugin is wired (TD-002), we'll correlate bundle size with measured TTFB.

---

## Shared baseline

```
First Load JS shared by all routes        102 kB
  ├ chunks/5468-3b5fdc31dd438250.js       46.3 kB
  ├ chunks/89187a07-c7fd39d8d514685a.js   54.2 kB
  └ other shared chunks (total)            1.94 kB
```

**Interpretation:** every route ships ~102 kB of shared JavaScript. This is the React + Next.js + Motion 12 + cobe globe + shared Tailwind utilities baseline. Heavy but expected for a Next 15 + RSC + heavy-motion app.

---

## Per-route bundle sizes

(Sorted by **First Load JS** descending — total bytes the browser must execute on first visit.)

| Route                                                                                                                | Type   | Route-specific | First Load JS | Notes                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------- | ------ | -------------- | ------------- | --------------------------------------------------------------------------------------------------------------------- |
| `/styleguide`                                                                                                        | static | 8.21 kB        | **181 kB**    | Heaviest. Internal-only (noindex); ships every shadcn primitive in light + dark. Acceptable.                          |
| `/`                                                                                                                  | static | 9.89 kB        | **177 kB**    | Home page. Heaviest customer-facing route — bento + cobe globe + OrbitingCircles + FlickeringGrid + 4 animated cells. |
| `/pricing`                                                                                                           | static | 3.76 kB        | **171 kB**    | ROI calculator (client component) drives the route-specific bytes.                                                    |
| `/features/jd-forge`                                                                                                 | static | 137 B          | **169 kB**    | FeaturePageLayout shared across 3 SKU pages.                                                                          |
| `/features/readybank`                                                                                                | static | 137 B          | **169 kB**    | Same FeaturePageLayout.                                                                                               |
| `/features/stack-vault`                                                                                              | static | 137 B          | **169 kB**    | Same.                                                                                                                 |
| `/customers`                                                                                                         | static | 3.11 kB        | **163 kB**    | Customer Zero detail section + engagement-slot cards.                                                                 |
| `/demo`                                                                                                              | static | 7.12 kB        | **163 kB**    | DemoForm with react-hook-form + Zod runtime + future Calendly embed (lazy).                                           |
| `/product`                                                                                                           | static | 2.44 kB        | **162 kB**    | Long-form scrollytelling page.                                                                                        |
| `/solutions/enterprises`                                                                                             | static | 2.35 kB        | **162 kB**    | SolutionPageLayout shared across 3 ICP pages.                                                                         |
| `/solutions/platforms`                                                                                               | static | 2.35 kB        | **162 kB**    | Same.                                                                                                                 |
| `/solutions/staffing`                                                                                                | static | 2.35 kB        | **162 kB**    | Same.                                                                                                                 |
| `/about`                                                                                                             | static | 1.44 kB        | **161 kB**    | Founder note + M0→M21 trajectory.                                                                                     |
| `/blog`                                                                                                              | static | 1.29 kB        | **161 kB**    | Index reads MDX from `content/blog/`.                                                                                 |
| `/contact`                                                                                                           | static | 4.98 kB        | **161 kB**    | ContactForm with react-hook-form + Zod.                                                                               |
| `/features`                                                                                                          | static | 1.29 kB        | **161 kB**    | Index page for 3 SKU deep-dives.                                                                                      |
| `/press-kit`                                                                                                         | static | 1.29 kB        | **161 kB**    | Locked USP + brand assets + founder note.                                                                             |
| `/security`                                                                                                          | static | 1.44 kB        | **161 kB**    | Compliance posture grid + sub-processors table.                                                                       |
| `/changelog`                                                                                                         | static | 1.27 kB        | **157 kB**    | Append-only timeline; lighter than other content pages (no Stagger).                                                  |
| `/blog/[slug]`                                                                                                       | SSG    | 171 B          | **106 kB**    | MDX-rendered post. 3 pre-rendered: leak-problem, role-graph, seven-stages.                                            |
| `/dpa`, `/privacy`, `/terms`                                                                                         | static | 161 B          | **103 kB**    | Legal pages — bare layout + content; no animations.                                                                   |
| `/_not-found`, `/icon`, `/apple-icon`, `/opengraph-image`, `/sitemap.xml`, `/robots.txt`, `/api/brand/*`, `/rss.xml` | mixed  | 137-161 B      | **103 kB**    | System routes + brand SVG endpoints + dynamic OG.                                                                     |

**Total prerendered routes:** 21 static + 3 SSG (blog posts) + 5 dynamic (system routes + brand SVG + RSS).

---

## Highlights + observations

### What's heavy (and why)

- **Home page (177 kB First Load JS).** This is by far the most expensive customer-facing route. The cost is concentrated in:
  - cobe globe (~45 kB after lazy-load — but cobe IS lazy-loaded, so it doesn't show here. The 9.89 kB route-specific number on `/` is mostly the bento layout + OrbitingCircles + FlickeringGrid.)
  - Motion 12 animation primitives shared via the top of `/`
  - OrbitingCircles + FlickeringGrid + bento components
- **/styleguide (181 kB).** Internal-only, noindex. Acceptable that it's heavy — it ships every primitive. Not customer-facing.
- **3 feature pages (169 kB each).** FeaturePageLayout is the culprit; it imports Tabs (Radix) + Motion + Stagger + the hereVisual variants. Some of this could be split per SKU but the savings would be ~5-10 kB per route — not worth the maintenance overhead until/unless Lighthouse Performance drops.

### What's lean (and why)

- **Legal pages (103 kB).** No animations + no Stagger + no Spotlight. Just layout. Confirms ADR 0002's "no animation on legal pages" rule is working.
- **`/blog/[slug]` (106 kB).** MDX-rendered; the per-post payload is tiny because MDX compiles at build time to optimized server-side rendering.
- **Brand SVG endpoints + system routes (103 kB).** Pure server-side; client receives just the SVG/text. No JS.

### Cost of the redesign (vs original 10-sprint dark theme)

The MagicUI Agent-style redesign added cobe globe + OrbitingCircles + FlickeringGrid to the home page. Bundle cost: ~30 kB on `/` over the original. Decision was justified by CEO design preference (per session history); cost documented here for future revisit.

---

## Action thresholds

Per `cto/sli-slo.md` Lighthouse Performance ≥85:

- **Any route's First Load JS grows by >20% in a single PR** → CTO review required (large dep added; justify in ADR).
- **`/` First Load JS exceeds 220 kB** → P1 — Lighthouse Performance will tank. Investigate.
- **Shared baseline exceeds 130 kB** → CTO review of `experimental.optimizePackageImports` config; consider chunking strategy.

---

## Re-baseline cadence

- **Quarterly** — re-run `pnpm --filter @qorium/marketing build:analyze` and append a new dated section below.
- **Per major dep upgrade** — Next 15 → 16, React 19 → 20, Tailwind v4 minor — re-baseline same day.
- **Per architectural change** — any change that affects bundle composition (new heavy dependency, code splitting refactor) — re-baseline in the same PR.

---

## Append history

### 2026-05-06 — initial baseline (this commit)

- Branch: `claude/qorium-marketing-site-Z4gdI`
- Commit: `8a5256c`
- Build tool: `next 15.1.4` + Turbopack
- Numbers as captured above.

(Future entries append here.)

---

_Cross-references: ADR 0002 (Tailwind v4 — affects shared baseline), ADR 0006 (marketing decoupled — keeps `@qorium/auth` + `@qorium/db` out of marketing bundle). Resolves TD-009 in `cto/tech-debt.md`. SLO link: `cto/sli-slo.md` (Lighthouse Performance ≥85)._
