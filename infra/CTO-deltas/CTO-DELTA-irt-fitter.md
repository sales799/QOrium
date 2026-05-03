# CTO-DELTA: IRT fitter — TypeScript-native MLE in v0; girth (Python) on the roadmap

**Date:** 2026-05-03
**Author:** Claude Code (parallel build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `infra/IRT-Calibration-Pipeline-v0-Spec.md` §8 (Library & Tooling)

## Background

Spec §8 names the canonical fitter:

> **Primary tool:** `girth` Python library (MIT licensed, well-maintained, supports 3PL).
> **Fallback:** R `mirt` package (more mature, more options, but requires R runtime).

The QOrium monorepo is otherwise pure Node.js + TypeScript. Adding a Python
worker for v0 would require:

- Cross-language packaging (PM2 `interpreter: 'python3'`)
- A separate dependency surface (`girth`, `numpy`, `pandas`, `scipy`)
- IPC contract between TS services and the Python fitter
- Different test runners and CI lanes

…all to deliver a 2-PL/3-PL MLE that is ~80 lines of stable numerical code.

## Adaptation in `services/irt-calibration`

`src/fit2pl.ts` ships a TypeScript-native fitter:

- Newton-Raphson on the bivariate (a, b) log-likelihood, with backtracking
  line search and a safe gradient-ascent fallback when the Hessian is
  ill-conditioned
- Box constraints (PARAM_BOUNDS from spec §2) enforced by clamping after
  each step
- Convergence on |Δll| < tolerance (default 1e-6); max 50 iterations
- `c` (guessing) is held at the format-derived default (CTO-DELTA-irt-2pl-with-format-c)

The fitter passes synthetic-recovery tests for centred, hard, and easy
items, and behaves gracefully on degenerate corpora (all-pass, all-fail).
Fit quality on real responses will be benchmarked against girth once the
I/O Psychologist contractor is onboarded.

## Reconciliation request to CTO Office

Three options:

1. **Ratify TS-native v0** (recommended). Pros: zero cross-language complexity;
   keeps the build/test/deploy story uniform; the same module is usable in
   the admin IRT panel without IPC. Cons: a future swap to girth (e.g., for
   3PL with c estimated, or for advanced DIF tests) is non-trivial; we own
   the numeric behaviour.
2. **Reject** — switch to a Python `qorium-irt-calibration-py` worker before
   shipping v0. Cons: drags Phase 1 schedule; the v0 spec already classifies
   girth as "M6+ I/O Psych contractor work."
3. **Hybrid** — keep TS-native for the nightly batch; bring girth in for the
   quarterly DIF tests + I/O Psych QA reports (where its richer feature set
   matters). Recommended forward-path for v1.

Default action if no reconciliation by next sprint review: assume **option 1
(ratify TS v0)**, with a planned hybrid in Phase 2 (option 3).

## Verification

`services/irt-calibration/__tests__/`:

- `model.test.ts` — sigmoid / 3PL probability / clamping / per-format c (5+
  parametrised cases)
- `fit2pl.test.ts` — synthetic-recovery on centred / hard / easy items;
  degenerate corpora; bound clamping; mismatched-array throw; reason codes
- `drift.test.ts` — full §4 stage 4 classifier grid + §4 stage 5 transitions
- `orchestrator.test.ts` — pipeline counts low_n / errors / runId propagation
