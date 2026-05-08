# @qorium/web — v2 marketing site

Source of truth for `qorium.online` (and future `.com` / `.ai`).

Lives inside the qorium pnpm-workspace as `apps/web`. Builds and runs
independently from the backend services. Uses Next.js 15 App Router,
Tailwind 4, Framer Motion, and Magic UI Pro components.

## Quickstart

```bash
# from the repo root
pnpm install
pnpm --filter @qorium/web dev      # http://localhost:3010
pnpm --filter @qorium/web build
pnpm --filter @qorium/web start
```

## What this site is

A v2 rebuild specced in the MAYA audit (`sales799/maya`, branch
`claude/maya-website-audit-analysis-NUcPe`). Brief, gap list, competitor
benchmark, and §14 sign-off log live there. **Do not relitigate the brief
inside this repo** — propose changes in MAYA, get founder sign-off, then
amend here.

Locked decisions you must respect:

- **Hero (locked merge α)** — eyebrow `YOUR ASSESSMENT WAS BUILT BEFORE AI.`,
  headline `AI-proof technical assessment.`, 4-anchor sub. See
  `components/landing/hero-section.tsx`.
- **Signature accent — Electric Violet `#8B5CF6`** (Palette A). See
  `app/globals.css`.
- **5-page IA** — `/`, `/method`, `/pricing`, `/customers`, `/about`. See
  `components/site-header.tsx`.
- **Live mini-widget on ReadyBank `seed-001`** (P0-2, in flight).
- **Comparison table names HackerRank, CodeSignal, Mettl, Karat directly.**
- **No fixed deadline** — continuous build, full P0+P1+P2.

## Tooling boundary

`apps/web/` is excluded from the root prettier and root eslint configs
(see root `.prettierignore` and `eslint.config.js`). The marketing site
owns its own lint via `next lint` and its own formatting. The backend
monorepo's stricter tools (no-explicit-any error, etc.) do not apply here.

## Build order

Per `audit/GAP-LIST.md` in the MAYA repo. P0 is critical-path; P1 is
"competitive, not just live"; P2 is post-launch.
