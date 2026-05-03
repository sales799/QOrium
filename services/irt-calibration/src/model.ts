/**
 * 3-Parameter Logistic IRT model. Per IRT-Calibration-Pipeline-v0-Spec §2:
 *
 *     P(θ) = c + (1 - c) / (1 + exp(-a(θ - b)))
 *
 * with a ∈ [0, 3], b ∈ [-4, 4], c ∈ [0, 0.3].
 *
 * Pure math, no IO. The MLE fitter in `fit2pl.ts` calls these primitives.
 */

export const PARAM_BOUNDS = Object.freeze({
  a: { min: 0, max: 3 },
  b: { min: -4, max: 4 },
  c: { min: 0, max: 0.3 },
});

export interface ItemParameters {
  a: number;
  b: number;
  c: number;
}

/** Logistic σ(z) = 1 / (1 + e^-z), guarded against overflow at the tails. */
export function sigmoid(z: number): number {
  if (z >= 0) {
    const ez = Math.exp(-z);
    return 1 / (1 + ez);
  }
  const ez = Math.exp(z);
  return ez / (1 + ez);
}

export function probability3PL(theta: number, params: ItemParameters): number {
  const z = params.a * (theta - params.b);
  return params.c + (1 - params.c) * sigmoid(z);
}

export function clampParameters(params: ItemParameters): ItemParameters {
  return {
    a: clamp(params.a, PARAM_BOUNDS.a.min, PARAM_BOUNDS.a.max),
    b: clamp(params.b, PARAM_BOUNDS.b.min, PARAM_BOUNDS.b.max),
    c: clamp(params.c, PARAM_BOUNDS.c.min, PARAM_BOUNDS.c.max),
  };
}

function clamp(v: number, lo: number, hi: number): number {
  if (Number.isNaN(v)) return lo;
  if (v < lo) return lo;
  if (v > hi) return hi;
  return v;
}

/** Format-derived guessing parameter c default per spec §13 Q3. */
export function defaultGuessingForFormat(format: string): number {
  switch (format) {
    case 'mcq':
      return 0.25; // 4-option MCQ random-chance floor
    case 'msq':
      return 0.0625; // 4-option multi-select; (½)⁴ = 0.0625 random chance
    case 'truefalse':
      return 0.5;
    case 'coding':
    case 'design':
    case 'sjt':
    case 'casestudy':
      return 0.0;
    default:
      return 0.0;
  }
}

/**
 * Item-level log-likelihood for an observed response vector y ∈ {0,1}ⁿ at
 * fixed candidate abilities θ. Used as the Newton-Raphson objective.
 *
 * Numerically stable: clamps p ∈ [ε, 1-ε] before taking log.
 */
const EPS = 1e-9;

export function itemLogLikelihood(
  thetas: readonly number[],
  responses: readonly number[],
  params: ItemParameters,
): number {
  if (thetas.length !== responses.length) {
    throw new Error('thetas and responses must have matching length');
  }
  let ll = 0;
  for (let i = 0; i < thetas.length; i++) {
    const t = thetas[i];
    const y = responses[i];
    if (t === undefined || y === undefined) continue;
    const p = probability3PL(t, params);
    const pc = clamp(p, EPS, 1 - EPS);
    ll += y === 1 ? Math.log(pc) : Math.log(1 - pc);
  }
  return ll;
}
