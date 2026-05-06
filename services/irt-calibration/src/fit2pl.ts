/**
 * 2-PL MLE fitter for a single item.
 *
 * Per CTO-DELTA-irt-fitter.md the canonical implementation in the spec is
 * the Python `girth.fit_3pl` routine. This v0 ships a TypeScript-native
 * 2-PL fitter (a, b free; c held at the format-derived default per
 * `model.defaultGuessingForFormat`). The 3PL extension is a marginal
 * change in the same code path once N grows enough (~100+ responses) to
 * stabilise c estimation.
 *
 * Algorithm: Newton-Raphson on the bivariate log-likelihood with backtracking
 * line search. Falls back to gradient descent steps when the Hessian is
 * non-invertible. Box constraints (PARAM_BOUNDS) are enforced by clamping
 * after each update.
 */

import {
  clampParameters,
  itemLogLikelihood,
  PARAM_BOUNDS,
  probability3PL,
  type ItemParameters,
} from './model.js';

export interface FitOptions {
  /** Initial guess for (a, b). c is held fixed at `cFixed`. */
  initial?: { a: number; b: number };
  /** Format-derived guessing parameter; held constant for the 2-PL fit. */
  cFixed: number;
  /** Maximum Newton iterations. Default 50. */
  maxIterations?: number;
  /** Convergence threshold on |Δll|. Default 1e-6. */
  tolerance?: number;
}

export interface FitResult {
  params: ItemParameters;
  converged: boolean;
  iterations: number;
  logLikelihood: number;
  reason: 'converged' | 'max-iter' | 'invalid-data';
}

const DEFAULT_INITIAL = { a: 1.0, b: 0.0 };
const DEFAULT_MAX_ITER = 50;
const DEFAULT_TOL = 1e-6;

interface GradHess {
  ll: number;
  ga: number;
  gb: number;
  haa: number;
  hbb: number;
  hab: number;
}

const EPS = 1e-9;

function computeGradHess(
  thetas: readonly number[],
  responses: readonly number[],
  params: ItemParameters,
): GradHess {
  let ll = 0;
  let ga = 0;
  let gb = 0;
  let haa = 0;
  let hbb = 0;
  let hab = 0;
  const oneMinusC = 1 - params.c;

  for (let i = 0; i < thetas.length; i++) {
    const t = thetas[i];
    const y = responses[i];
    if (t === undefined || y === undefined) continue;
    const p = probability3PL(t, params);
    const pc = Math.min(Math.max(p, EPS), 1 - EPS);
    ll += y === 1 ? Math.log(pc) : Math.log(1 - pc);

    const z = params.a * (t - params.b);
    const sig = z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z));
    const sigp = sig * (1 - sig);
    const dPda = oneMinusC * sigp * (t - params.b);
    const dPdb = -oneMinusC * sigp * params.a;

    const denom = pc * (1 - pc);
    const factor = (y - pc) / denom;
    ga += factor * dPda;
    gb += factor * dPdb;

    // 2nd derivatives (Fisher-information approximation: -E[H]). For binary
    // logistic the observed information is (1-c)² · σ' · σ' / (p(1-p)).
    const fisher = (oneMinusC * oneMinusC * sigp * sigp) / denom;
    haa += -fisher * (t - params.b) * (t - params.b);
    hbb += -fisher * params.a * params.a;
    hab += -fisher * (t - params.b) * -params.a - fisher * sigp; // cross term simplified
  }
  return { ll, ga, gb, haa, hbb, hab };
}

function solve2x2(
  haa: number,
  hbb: number,
  hab: number,
  ga: number,
  gb: number,
): [number, number] | null {
  const det = haa * hbb - hab * hab;
  if (!Number.isFinite(det) || Math.abs(det) < 1e-12) return null;
  const inv00 = hbb / det;
  const inv11 = haa / det;
  const inv01 = -hab / det;
  // Newton step: Δ = -H⁻¹ · g
  const da = -(inv00 * ga + inv01 * gb);
  const db = -(inv01 * ga + inv11 * gb);
  if (!Number.isFinite(da) || !Number.isFinite(db)) return null;
  return [da, db];
}

export function fit2PL(
  thetas: readonly number[],
  responses: readonly number[],
  opts: FitOptions,
): FitResult {
  if (thetas.length !== responses.length) {
    throw new Error('thetas and responses must have matching length');
  }
  if (thetas.length === 0) {
    return {
      params: { a: 1, b: 0, c: opts.cFixed },
      converged: false,
      iterations: 0,
      logLikelihood: -Infinity,
      reason: 'invalid-data',
    };
  }
  const init = opts.initial ?? DEFAULT_INITIAL;
  const maxIter = opts.maxIterations ?? DEFAULT_MAX_ITER;
  const tol = opts.tolerance ?? DEFAULT_TOL;

  let params: ItemParameters = clampParameters({ a: init.a, b: init.b, c: opts.cFixed });
  let prevLL = itemLogLikelihood(thetas, responses, params);

  for (let iter = 1; iter <= maxIter; iter++) {
    const gh = computeGradHess(thetas, responses, params);
    let step = solve2x2(gh.haa, gh.hbb, gh.hab, gh.ga, gh.gb);

    // If Hessian degenerate, fall back to a small gradient ascent step.
    if (step === null) {
      step = [0.05 * gh.ga, 0.05 * gh.gb];
    }

    let [da, db] = step;
    // Line search: shrink step until LL improves (max 6 halvings).
    let nextLL = -Infinity;
    let candidate = params;
    for (let s = 0; s < 6; s++) {
      candidate = clampParameters({
        a: params.a + da,
        b: params.b + db,
        c: opts.cFixed,
      });
      nextLL = itemLogLikelihood(thetas, responses, candidate);
      if (nextLL > prevLL || s === 5) break;
      da *= 0.5;
      db *= 0.5;
    }

    const delta = Math.abs(nextLL - prevLL);
    params = candidate;
    prevLL = nextLL;

    if (delta < tol) {
      return {
        params,
        converged: true,
        iterations: iter,
        logLikelihood: prevLL,
        reason: 'converged',
      };
    }
  }

  return {
    params,
    converged: false,
    iterations: maxIter,
    logLikelihood: prevLL,
    reason: 'max-iter',
  };
}

/** Boundary check: an estimate at or beyond the parameter bounds is suspect. */
export function isAtBounds(params: ItemParameters): boolean {
  const aOnEdge = params.a <= PARAM_BOUNDS.a.min + 1e-3 || params.a >= PARAM_BOUNDS.a.max - 1e-3;
  const bOnEdge = params.b <= PARAM_BOUNDS.b.min + 1e-3 || params.b >= PARAM_BOUNDS.b.max - 1e-3;
  return aOnEdge || bOnEdge;
}
