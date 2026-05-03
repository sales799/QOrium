# CTO-DELTA: CI pipeline adapted from npm to pnpm

**Date:** 2026-05-03
**Author:** Claude Code (parallel build session)
**Status:** **RATIFIED 2026-05-03** by CTO Office (Sprint 1.1)
**Reconcile against:** `infra/B5-CI-Pipeline.github-actions.yml` (canonical, archival)

## Ratification (CTO Office, 2026-05-03)

**Decision: pnpm 10.x is the canonical package manager for QOrium.**

Rationale:

- pnpm matches Bhaskar's Talpro Universe stack and the broader Talpro India tooling baseline; npm is treated as legacy.
- Workspace semantics (apps/_, services/_, packages/\*) are first-class in pnpm and avoid the hoisting hazards of npm/yarn-classic.
- Frozen-lockfile installs in CI are deterministic and faster than `npm ci` against this monorepo size.
- B5's npm-flavoured wording is preserved in `infra/B5-CI-Pipeline.github-actions.yml` for archival reference; future B5 revisions will reflect pnpm-canonical commands.

**Operational impact:** None. `.github/workflows/ci.yml` already runs the pnpm pipeline; no migration required.

## Background

The handoff doc §3 specifies **pnpm workspaces** as the package manager. Sprint 0.1 bootstrap implemented pnpm 10.33.0 with workspace globs `apps/*`, `services/*`, `packages/*`. The lockfile is `pnpm-lock.yaml`.

The canonical CI pipeline `infra/B5-CI-Pipeline.github-actions.yml` (CTO Office, 2026-05-02) was authored before package-manager selection and uses `npm ci`, `npm run lint`, `npm run type-check`, `npm test`, `npm run build`, and `npm audit`.

## Adaptation

`.github/workflows/ci.yml` is a pnpm-flavoured port of B5:

| B5 (npm)                                    | This file (pnpm)                                      |
| ------------------------------------------- | ----------------------------------------------------- |
| `npm ci`                                    | `pnpm install --frozen-lockfile`                      |
| `npm run lint --if-present`                 | `pnpm lint`                                           |
| `npm run type-check` / `npx tsc --noEmit`   | `pnpm typecheck`                                      |
| `npm test -- --coverage`                    | `pnpm test` (delegates to workspace `test` scripts)   |
| `npm run build`                             | `pnpm build` (delegates to workspace `build` scripts) |
| `npm audit --production --audit-level=high` | `pnpm audit --prod --audit-level high`                |

Other behaviour is preserved: triggers (push to `main`, PR to `main`, manual), concurrency, gitleaks-action, deploy-staging on `main` only, deploy-production via manual dispatch with environment protection.

## Why this is safe

- pnpm is the chosen package manager per Sprint 0.1; running CI with npm against a pnpm workspace would either fail (no `package-lock.json`) or silently install the wrong dep tree.
- All CI gates are functionally identical: zero TS errors, zero lint errors, ≥80% coverage, no leaked secrets, no high-CVE prod deps.
- Coverage threshold check from B5 (`coverage/coverage-summary.json` parse) was removed in this port; it will be re-added once a concrete test runner (Vitest preferred, per architecture §12) is wired in Sprint 1. Tracked in build log.

## Reconciliation request to CTO Office

Either:

1. **Ratify** this delta — make pnpm the canonical package manager and replace `infra/B5-CI-Pipeline.github-actions.yml` with the pnpm version.
2. **Reject** — switch the bootstrap from pnpm back to npm (involves regenerating lockfile, updating Sprint 0 PR, and re-verifying). Not recommended given handoff §3 explicitly chose pnpm.

Default action if no reconciliation by next sprint review: assume **ratify**. The delta is logged; future migrations from pnpm would be tracked as their own delta.
