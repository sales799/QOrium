import type { IrtParams } from './types.js';

/** Numerically stable sigmoid. */
export function sigmoid(z: number): number {
  if (z >= 0) {
    const e = Math.exp(-z);
    return 1 / (1 + e);
  }
  const e = Math.exp(z);
  return e / (1 + e);
}

/**
 * 3PL response probability:
 *   P(theta) = c + (1 - c) * sigmoid(a * (theta - b))
 *
 * Setting c = 0 yields the 2PL model.
 * Setting c = 0 and a = 1 yields the Rasch (1PL) model.
 */
export function prob3pl(theta: number, params: IrtParams): number {
  const { a, b, c } = params;
  const p2 = sigmoid(a * (theta - b));
  return c + (1 - c) * p2;
}

/** Convenience for the 2PL case. */
export function prob2pl(theta: number, a: number, b: number): number {
  return sigmoid(a * (theta - b));
}

/**
 * First derivative of 3PL log-likelihood w.r.t. theta — used by the ability
 * MLE Newton step. For a single item with response u ∈ {0, 1}:
 *
 *     d/dtheta log L = a * (1 - c) * P_2pl * (1 - P_2pl) * (u - P) / (P * (1 - P))
 *
 * which simplifies for c = 0 to a * (u - P) and is what the 2PL Newton
 * iteration uses.
 */
export function logLikGradTheta(theta: number, u: 0 | 1, params: IrtParams): number {
  const { a, b, c } = params;
  const p2 = sigmoid(a * (theta - b));
  const p = c + (1 - c) * p2;
  // Avoid log(0) issues near the asymptotes.
  const eps = 1e-12;
  const pSafe = Math.min(Math.max(p, eps), 1 - eps);
  const dPdTheta = a * (1 - c) * p2 * (1 - p2);
  return (dPdTheta * (u - pSafe)) / (pSafe * (1 - pSafe));
}

/** Second derivative (Hessian element) for theta — Fisher information based. */
export function fisherInfoTheta(theta: number, params: IrtParams): number {
  const { a, b, c } = params;
  const p2 = sigmoid(a * (theta - b));
  const p = c + (1 - c) * p2;
  const eps = 1e-12;
  const pSafe = Math.min(Math.max(p, eps), 1 - eps);
  const dPdTheta = a * (1 - c) * p2 * (1 - p2);
  return (dPdTheta * dPdTheta) / (pSafe * (1 - pSafe));
}
