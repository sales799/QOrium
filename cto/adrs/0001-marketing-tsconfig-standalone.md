# ADR 0001 — Marketing app uses standalone tsconfig (not extending tsconfig.base.json)

**Status:** Accepted
**Date:** 2026-04-29 (backfilled 2026-05-06)
**Authors:** CTO Office
**Constitutional anchor:** SO-13 (Talpro Universe Tech Stack — deviations require CTO approval + Architecture document update)
**Reviewers:** CTO (sole, Y1)

---

## Context

QOrium is a pnpm 10 monorepo with three workspace folders: `apps/*`, `services/*`, `packages/*`. The root `tsconfig.base.json` is tuned for Node service code (`module: NodeNext`, `moduleResolution: NodeNext`, declaration emit on, `noEmit: false`).

The marketing app is the first `apps/*` workspace. It uses Next.js 15 (App Router + RSC + Server Actions). Next.js 15 has hard requirements on tsconfig:

- `module: esnext`
- `moduleResolution: bundler`
- `noEmit: true`
- `jsx: preserve`
- `incremental: true`
- A `plugins: [{ "name": "next" }]` entry

These conflict with the base config's Node-tuned settings. Extending the base would either require overriding most of these (defeating the purpose of extending) or break the Next 15 build.

A decision was needed before scaffolding the marketing app.

## Decision

**The marketing app's `tsconfig.json` does NOT extend `tsconfig.base.json`.** It is a standalone tsconfig matching the `create-next-app` shape.

To preserve type-strictness parity with services/packages, the marketing app's standalone tsconfig **manually mirrors** these strict flags from the base:

- `strict`, `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`
- `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- `forceConsistentCasingInFileNames`, `isolatedModules: true`, `skipLibCheck: true`

A top-of-file comment in `apps/marketing/tsconfig.json` lists the source-of-truth flags it mirrors so future drift is easy to spot.

## Consequences

### Positive

- Next.js 15 build works without surgery on the root config.
- Marketing app participates in `pnpm typecheck` from the root (no special-casing needed).
- Strict-flag parity preserved manually — CI catches the same class of errors across all workspaces.

### Negative

- Drift risk: if `tsconfig.base.json` adds a new strict flag, the marketing app may silently miss it. Mitigated by a quarterly drift audit (see Verification below).
- Two configs to maintain instead of one inheritance chain.

### Neutral / observations

- The `apps/*` glob in `pnpm-workspace.yaml` works either way; no workspace-config changes needed.
- Future `apps/*` workspaces using Next.js (e.g., a future admin dashboard) follow the same pattern — copy this app's tsconfig as the template.

## Alternatives considered

### Alternative 1: Extend `tsconfig.base.json` and override

Rejected. Overriding `module`, `moduleResolution`, `noEmit`, `jsx`, `incremental`, AND `plugins` removes the value of extending. Net result: the same strict flags, but with brittle override logic that future contributors will mis-merge.

### Alternative 2: Change `tsconfig.base.json` to be Next-compatible

Rejected. This would break the existing service workspaces (`services/readybank`, `packages/auth`, `packages/db`) which require the Node-tuned config. We don't break working code to accommodate a new workspace.

### Alternative 3: Two base configs (`tsconfig.base.node.json` + `tsconfig.base.next.json`)

Considered for Y2+ when there are >1 Next.js apps. Rejected for Y1 because we have exactly one Next.js app and the maintenance overhead of two bases isn't justified yet.

## Implementation notes

- **File:** `apps/marketing/tsconfig.json`
- **Top-of-file comment:** lists the 11 mirrored strict flags + reference to `tsconfig.base.json` as the source-of-truth
- **Commit:** `b24e588` (Sprint 1 scaffold)
- **Companion:** `apps/marketing/eslint.config.js` similarly stays app-local (doesn't extend root) — see ADR 0002 for the parallel reasoning on Tailwind v4

## Verification

- **CI:** root `pnpm typecheck` runs the marketing app's tsconfig as part of the workspace pass; failures surface in CI.
- **Quarterly drift audit:** CTO reviews `apps/marketing/tsconfig.json` against `tsconfig.base.json`. Any new strict flag added to the base must be mirrored manually. Audit logged in monthly business review.
- **Constitutional check:** SO-13 says "deviations require CTO approval + Architecture document update." This ADR IS the architecture document update. Approved by CTO, sole authority Y1.

## References

- Constitution SO-13 (Talpro Universe Tech Stack)
- Next.js 15 docs on tsconfig requirements
- `tsconfig.base.json` (root) — current source-of-truth for strict flags
- `apps/marketing/tsconfig.json` — the standalone config in this ADR
