# ADR 0002 — Tailwind v4 CSS-first @theme adoption (no tailwind.config.js)

**Status:** Accepted
**Date:** 2026-04-30 (backfilled 2026-05-06)
**Authors:** CTO Office
**Constitutional anchor:** SO-13 (Tech Stack — deviations require CTO approval); also relevant to brand-aesthetic "Stripe/Vercel/Linear/Datadog tier" positioning per Customer Sniff Test feedback
**Reviewers:** CTO (sole, Y1)

---

## Context

The marketing site needed a design system. Tailwind v3 (the JS-config standard at the time) was the obvious choice: large ecosystem, well-known, integrates with shadcn/ui out of the box.

Tailwind v4 (released Jan 2025) removed `tailwind.config.js` and introduced `@theme` blocks in CSS. Tokens are CSS variables defined directly in `globals.css`; the build runs through `@tailwindcss/postcss`. This is a meaningful change in mental model: design tokens become first-class CSS, not a JS-object that compiles to CSS.

For the marketing site, we picked one but it wasn't free.

## Decision

**Adopt Tailwind v4 CSS-first via `@theme` in `apps/marketing/src/app/globals.css`.** No `tailwind.config.js`. Use `@tailwindcss/postcss` plugin in `postcss.config.mjs`.

OKLCH color space for tokens (per the design-system decision in `apps/marketing/BRAND.md`). Custom variables registered in the `@theme` block; legacy aliases (graphite-_, surface-_, signal-\*) preserved for backward compat with vendored Aceternity/MagicUI components.

## Consequences

### Positive

- Single source of truth for design tokens: read `globals.css`, you have the system.
- Smaller bundle (no JS-config tree-shaking gymnastics).
- Next 15 + Turbopack happy with the new pipeline.
- Easier theme overrides per-component (you can scope `@theme` to a CSS selector).

### Negative

- Vendored components (Aceternity, MagicUI v3-era) sometimes hardcode v3 `theme.extend` references — required ~5min/component refactor on the way in.
- Smaller pool of Tailwind v4 examples online (mid-2025 still v3-dominant); team has to derive solutions.
- shadcn/ui CLI quirks: at adoption, the CLI assumed v3 — manual fixups for v4 token names.

### Neutral / observations

- Plugin ecosystem for v4 is rapidly maturing; quarterly check on v3 components blocks our v4 path.
- The brand color system uses OKLCH — modern, correct, but team needs to learn it.

## Alternatives considered

### Alternative 1: Tailwind v3 with `tailwind.config.js`

Rejected. While safer (more examples online, more vendored components compatible out of the box), v3 is the past. Building a new site in 2026 on a deprecated major is buying technical debt on day 1.

### Alternative 2: CSS Modules + hand-rolled design system (no Tailwind)

Rejected. shadcn/ui depends on Tailwind classes; not using Tailwind means re-implementing 30+ Radix primitives ourselves. Poor leverage.

### Alternative 3: Vanilla Extract or Linaria

Rejected. Both are excellent CSS-in-JS libraries but they're a different mental model from utility-first. The team has Tailwind muscle memory; not worth retraining for marginal gain.

## Implementation notes

- **File:** `apps/marketing/src/app/globals.css` — `@theme` block with OKLCH tokens
- **PostCSS config:** `apps/marketing/postcss.config.mjs` — uses `@tailwindcss/postcss` plugin
- **No file:** there is intentionally NO `tailwind.config.js` in the marketing app
- **Vendored components:** Aceternity (`src/components/aceternity/`) and MagicUI (`src/components/magicui/`) refactored to v4 tokens at vendor time
- **Commit:** `3797b4f` (Sprint 2 design system)

## Verification

- **CI build:** if v4 tokens are missing or misnamed, `next build` fails with PostCSS errors.
- **Visual check:** `/styleguide` route renders all primitives in light + dark modes; broken tokens are visually obvious.
- **Quarterly v3-component audit:** any newly vendored component checked for v3 hardcodes; refactor or reject.

## References

- Constitution SO-13
- `apps/marketing/BRAND.md` — locked design-system decisions
- Tailwind v4 release notes (Jan 2025)
- ADR 0001 (parallel decision on tsconfig — both are about app-local configs that don't extend root)
