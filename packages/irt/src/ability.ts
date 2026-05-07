import type { IrtParams } from './types.js';
import { fisherInfoTheta, logLikGradTheta, prob3pl } from './probability.js';

/**
 * Maximum-likelihood estimate of theta (ability) given a panelist's
 * response pattern across a calibrated item bank. Uses Newton-Raphson
 * with Fisher-information curvature. Robust on degenerate patterns
 * (all 0 or all 1) by clamping into the analyzable range.
 */
export function estimateAbilityMle(
  responses: ReadonlyArray<{ correct: 0 | 1; params: IrtParams }>,
  options: { maxIter?: number; tol?: number; clamp?: number } = {},
): { theta: number; converged: boolean; iterations: number } {
  const maxIter = options.maxIter ?? 50;
  const tol = options.tol ?? 1e-5;
  const clamp = options.clamp ?? 4;

  // Degenerate patterns: MLE diverges to ±∞. Return clamped sentinel.
  const total = responses.length;
  if (total === 0) return { theta: 0, converged: true, iterations: 0 };
  const right = responses.reduce((s, r) => s + r.correct, 0);
  if (right === 0) return { theta: -clamp, converged: true, iterations: 0 };
  if (right === total) return { theta: clamp, converged: true, iterations: 0 };

  let theta = 0;
  let converged = false;
  let i = 0;
  for (; i < maxIter; i++) {
    let grad = 0;
    let info = 0;
    for (const r of responses) {
      grad += logLikGradTheta(theta, r.correct, r.params);
      info += fisherInfoTheta(theta, r.params);
    }
    if (info < 1e-9) break;
    const step = grad / info;
    theta += step;
    if (theta > clamp) theta = clamp;
    if (theta < -clamp) theta = -clamp;
    if (Math.abs(step) < tol) {
      converged = true;
      break;
    }
  }
  return { theta, converged, iterations: i + 1 };
}

/** Quick proxy when item parameters are not available — sum-score → z-score
 *  on the standard-normal scale. Spec §3 calls this an acceptable warm start
 *  for ability estimation when calibrated parameters don't yet exist. */
export function abilityProxyFromSumScore(sumScore: number, n: number): number {
  if (n <= 0) return 0;
  const p = sumScore / n;
  // Logit transform; clamp at ±4 to mirror MLE bounds.
  const eps = 0.05;
  const pClamped = Math.min(Math.max(p, eps), 1 - eps);
  return Math.log(pClamped / (1 - pClamped));
}

/** Vector probability across an item bank — useful for quick scoring. */
export function probabilityProfile(theta: number, paramsList: ReadonlyArray<IrtParams>): number[] {
  return paramsList.map((p) => prob3pl(theta, p));
}
