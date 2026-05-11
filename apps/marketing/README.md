# @qorium/marketing

The QOrium public marketing website. Lives inside the QOrium pnpm monorepo at `apps/marketing/`. The backend services it points to live in `services/*` of the same repo.

## Run locally

From repo root:

```bash
pnpm install
pnpm dev:marketing
# or: pnpm --filter @qorium/marketing dev
```

App boots on `http://localhost:3000`.

## Stack

- Next.js 15 (App Router, RSC, Server Actions, Turbopack dev)
- TypeScript 5.7 strict (mirroring `tsconfig.base.json` flags; see top of `tsconfig.json`)
- Tailwind CSS v4 (CSS-first via `@theme` in `src/app/globals.css`)
- shadcn/ui + Aceternity UI + Magic UI + Motion 12 (`motion/react`)
- MDX blog via `next-mdx-remote/rsc`
- Forms: Server Actions + Zod + react-hook-form
- Mailer: Resend primary, Gmail SMTP fallback (env-driven)

See `BRAND.md` for design tokens, voice rules, and component governance.

## Adding a blog post

1. Create `src/content/blog/your-slug.mdx`.
2. Frontmatter:
   ```yaml
   ---
   title: 'Your title'
   description: 'A 1-line description.'
   date: '2026-05-05'
   author: 'QOrium Engineering'
   tags: ['anti-leak', 'irt']
   hero: '/og/your-hero.svg' # optional
   ---
   ```
3. Visit `/blog/your-slug` locally.

## Updating copy

Page strings live in `src/content/copy/<page>.ts` as typed `as const` objects. Each claim should carry a `// SOURCE: <doc> §<section>` comment for the audit trail. Never copy-paste long-form prose from internal strategy docs — distill, don't transcribe.

## Quality bars (root `tsconfig.base.json` + this app's standalone config)

- Zero TypeScript errors.
- Zero ESLint warnings (`--max-warnings 0`).
- gitleaks must pass on pre-commit.
- All animations gate on `useReducedMotion()`.
- a11y: zero axe-core critical violations on every shipped page.
