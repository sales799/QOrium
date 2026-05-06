# CTO-DELTA: 2PL fit with format-derived `c` for v0; full 3PL deferred

**Date:** 2026-05-03
**Author:** Claude Code (parallel build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `infra/IRT-Calibration-Pipeline-v0-Spec.md` §2 (3PL model) + §13 Q3 (open question on c)

## Background

Spec §2 defines a 3PL model: `P(θ) = c + (1-c)/(1+exp(-a(θ-b)))` with
parameters (a, b, c). §13 explicitly flags as an open question:

> **Guessing parameter c:** For MCQ, typical c ≈ 0.25 (random chance on 4
> options). For coding, c ≈ 0.0 (can't guess). Should we pre-set c per
> format, or estimate from data?

Estimating c from data at N = 30 is statistically unstable: the c parameter
is identified primarily by the lower asymptote of the response curve, which
requires many low-ability responses. With N = 30 from a relatively
homogeneous Reference Panel (Talpro Customer Zero is mostly senior
engineers), the lower-tail signal is too thin to estimate c reliably.

## Adaptation in `services/irt-calibration`

`src/model.ts::defaultGuessingForFormat` returns a per-format default:

| Format      | c      | Rationale                                      |
| ----------- | ------ | ---------------------------------------------- |
| `mcq`       | 0.25   | 4-option MCQ, random-chance floor              |
| `msq`       | 0.0625 | (½)⁴ = 0.0625 random for 4-option multi-select |
| `truefalse` | 0.5    | 2-option binary                                |
| `coding`    | 0.0    | Cannot guess code execution                    |
| `design`    | 0.0    | Open-ended                                     |
| `sjt`       | 0.0    | Situational judgment, no numeric chance        |
| `casestudy` | 0.0    | Open-ended                                     |
| (fallback)  | 0.0    | Conservative default                           |

`src/fit2pl.ts` performs MLE on (a, b) only, with c held fixed at this
format-derived value. The function signature accepts a `cFixed` argument so
the same code can be re-used when the upgraded fitter estimates c from data
in v1 (M6+ when paid panel reaches the spec's N=300 target).

## Reconciliation request to CTO Office

Four options:

1. **Ratify per-format defaults** (recommended for v0). Pros: stable at low
   N; simple to operate; matches §13 Q3's first listed option. Cons: locks c
   to a coarse approximation (real MCQ guessing varies with distractor quality).
2. **Estimate c from data** — full 3PL MLE. Cons: unstable at N = 30; would
   reject many fits as `invalid_params` and stall calibration.
3. **Hybrid**: format default until N ≥ 100, then estimate from data. Adds
   complexity but is statistically defensible.
4. **Reject** — block v0 calibration on full 3PL even at low N. Forces all
   nightly fits to fail until N ≥ 100, defeats SO-21 which requires Day-1
   IRT scoring.

Default action if no reconciliation by next sprint review: assume **option 1
(per-format defaults)** with a planned upgrade to option 3 once panel
acquisition (M2–M4) raises typical N above 100.

## Constitutional alignment

- **SO-21 (IRT mandatory):** ✓ Every released question has 3PL parameters
  (a estimated, b estimated, c per format default). The model retains its
  3-parameter shape; v0 just fixes one of the three at a principled default.
- **Article VII phase gates:** ✓ A question cannot transition from
  `calibrating` to `released` without `converged === true` and a non-drift
  flag — same gate as full 3PL would impose.

## Verification

`services/irt-calibration/__tests__/model.test.ts` covers `defaultGuessingForFormat`
parametrically. `fit2pl.test.ts` verifies that the fitter respects the
supplied `cFixed` and never mutates it during optimization.
