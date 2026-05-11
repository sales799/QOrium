# ADR 0006 — Marketing app does NOT import @qorium/auth or @qorium/db (deliberate decoupling)

**Status:** Accepted
**Date:** 2026-04-29 (backfilled 2026-05-06)
**Authors:** CTO Office
**Constitutional anchor:** SO-13 (Tech Stack discipline — but applied as an exception via this ADR), SO-3 (Quality Gate Discipline)
**Reviewers:** CTO (sole, Y1)

---

## Context

The pnpm 10 monorepo has shared workspace packages: `packages/auth` (`@qorium/auth` — API keys + rate limit + audit) and `packages/db` (`@qorium/db` — PostgreSQL migrations + connection pool). The natural assumption when scaffolding `apps/marketing` would be to import these workspace packages, since they're already shipped, tested, and version-controlled together.

Two scenarios appeared plausible at scaffold time:

1. The marketing site collects form submissions → maybe writes them to the same Postgres as ReadyBank for cross-product analytics.
2. The marketing site has rate-limited forms → maybe uses the same `@qorium/auth` rate limiter that ReadyBank uses.

Both are seductive on Day 1. Both create a bidirectional coupling between the public-facing marketing site (high traffic, low security context, third-party dependencies like Resend + Calendly + Plausible) and the production-critical ReadyBank API (low traffic, high security context, customer-data-handling).

A coupling decision was needed before scaffolding the workspace.

## Decision

**The marketing app workspace (`@qorium/marketing`) does NOT depend on `@qorium/auth` or `@qorium/db` (or any other monorepo workspace package).** The marketing app's `package.json` lists only third-party dependencies; no `@qorium/*` workspace imports.

If the marketing site needs to communicate with ReadyBank (e.g., a future "lookup our public API status" widget on `/security`), it does so via **HTTP fetch** to the public ReadyBank API endpoint, not via direct workspace import. Same security context as any external customer of the API.

Form submissions land in the mailer (per ADR 0003) — NOT in any QOrium database.

## Consequences

### Positive

- **Blast radius isolated.** A breaking change in `@qorium/db` migration runner doesn't break the marketing build. A vulnerability in a marketing app dependency (e.g., a vulnerable Calendly SDK) doesn't escalate to ReadyBank.
- **Build-time decoupling.** Marketing app builds without needing to first build `@qorium/db` for type emit. Faster CI matrix.
- **Tsconfig decoupling.** ADR 0001 standalone tsconfig works without dragging in `@qorium/db`'s NodeNext resolution. Both ADRs reinforce each other.
- **Deploy decoupling.** Marketing app deploys (PM2 restart on VPS 1) don't require redeploying ReadyBank. ReadyBank deploys don't require redeploying marketing.
- **Public-vs-private surface clarity.** The marketing app handles ONLY public-internet-facing concerns (forms, content, SEO). Customer data lives elsewhere.

### Negative

- **No type-sharing for response shapes.** If the marketing site ever calls a ReadyBank endpoint, the response shape isn't auto-typed. Mitigated by treating the API call like any third-party API (manually typed via Zod schemas at the boundary).
- **No code reuse for utilities.** Helpers like `cn` (classnames) are duplicated in `apps/marketing/src/lib/cn.ts`. Acceptable cost for the isolation gain.
- **Form submissions don't auto-flow to a CRM.** Mitigated by mailer dispatch + manual CRM entry for now. A future webhook to CRM is a separate decision (would be its own ADR, NOT a workspace import).

### Neutral / observations

- The `pnpm-workspace.yaml` glob `apps/*` includes the marketing app; it participates in `pnpm typecheck`, `pnpm lint`, `pnpm build` from the root. The decoupling is at the import level, not the workspace level.
- Future apps (e.g., `apps/qorium-admin` for the admin dashboard) MAY depend on `@qorium/auth` and `@qorium/db` because they're internal-facing and need the same security context as ReadyBank. The decoupling rule applies to PUBLIC-facing apps only.

## Alternatives considered

### Alternative 1: Import `@qorium/auth` for the rate limiter

Rejected. The marketing app's rate limiting needs are different (per-IP throttle on form submissions; not API-key-based). Implementing them inline (or via `@upstash/ratelimit` directly) is simpler than coupling to `@qorium/auth`'s richer model.

### Alternative 2: Import `@qorium/db` to write form submissions to a `marketing_submissions` table

Rejected. Adding a public-facing app's writes to the same Postgres as ReadyBank violates the security-context separation. Form spam attacks would hit the same database that holds customer data. Mitigation: write to mailer instead; CRM is the system of record for sales conversations.

### Alternative 3: Create a new `packages/shared-marketing` workspace for shared utilities

Rejected. YAGNI. We have one marketing app; sharing utilities to nowhere is premature abstraction. If a second public-facing app appears, revisit this then.

## Implementation notes

- **File:** `apps/marketing/package.json` — verify no `@qorium/*` entries in dependencies/devDependencies
- **Lint enforcement:** the app-local `eslint.config.js` could enforce this with an import-restriction rule (TBD if drift becomes a problem)
- **Architectural rule documented in:** `apps/marketing/HANDOFF.md` + this ADR
- **Commit:** `b24e588` (Sprint 1 scaffold)

## Verification

- **CI build:** if a `@qorium/*` import is accidentally added, `pnpm install` works (workspace packages resolve) but the spirit of the ADR is violated. Mitigated by:
  1. **Manual code review** on every PR touching `apps/marketing/package.json` — flag any new `@qorium/*` entry.
  2. **(Future) ESLint `import/no-restricted-paths` rule** in `apps/marketing/eslint.config.js` — added if drift becomes recurrent.
- **Quarterly audit:** CTO checks `apps/marketing/package.json` for `@qorium/*` entries during the ADR audit pass.

## Related ADRs

- ADR 0001 (standalone tsconfig — parallel decoupling pattern)
- ADR 0002 (Tailwind v4 CSS-first — same "app-local config" philosophy)
- ADR 0003 (mailer fallback chain — what form submissions go through INSTEAD of `@qorium/db`)

## References

- Constitution SO-13 (Tech Stack discipline)
- Constitution SO-3 (Quality Gate Discipline — security context separation is a Quality Gate concern)
- `apps/marketing/package.json` (current dependencies — verify no `@qorium/*`)
- `pnpm-workspace.yaml` (workspace globs — include marketing but coupling is at import level)
