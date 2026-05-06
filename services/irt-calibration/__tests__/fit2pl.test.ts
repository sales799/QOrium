import { describe, expect, it } from 'vitest';
import { fit2PL, isAtBounds } from '../src/fit2pl';
import { probability3PL } from '../src/model';

/**
 * Synthetic-data tests. We pick a true (a, b, c=0) and generate responses
 * deterministically — no randomness, no flakiness — by drawing y=1 when
 * P(θ) > 0.5 + tiny shift to make the boundary unambiguous.
 *
 * Real-world data would be noisier; these tests check that the optimizer
 * recovers parameters under clean conditions, which is the floor of what
 * we'd expect a numerical fitter to do.
 */

function syntheticResponses(
  trueParams: { a: number; b: number; c: number },
  thetas: readonly number[],
): number[] {
  return thetas.map((t) => (probability3PL(t, trueParams) >= 0.5 ? 1 : 0));
}

describe('fit2PL — basic correctness', () => {
  it('returns invalid-data for empty input', () => {
    const result = fit2PL([], [], { cFixed: 0 });
    expect(result.reason).toBe('invalid-data');
    expect(result.converged).toBe(false);
  });

  it('throws on mismatched arrays', () => {
    expect(() => fit2PL([0, 0], [1], { cFixed: 0 })).toThrow();
  });

  it('clamps initial parameters within bounds', () => {
    const result = fit2PL([0, 1, -1], [1, 1, 0], {
      cFixed: 0,
      initial: { a: 999, b: 999 },
    });
    expect(result.params.a).toBeLessThanOrEqual(3);
    expect(result.params.b).toBeLessThanOrEqual(4);
  });

  it('keeps c fixed at the supplied value', () => {
    const thetas = [-2, -1, 0, 1, 2];
    const ys = [0, 0, 1, 1, 1];
    const result = fit2PL(thetas, ys, { cFixed: 0.25 });
    expect(result.params.c).toBe(0.25);
  });
});

describe('fit2PL — synthetic recovery', () => {
  it('recovers b ≈ 0 for a centered question', () => {
    const truth = { a: 1.5, b: 0, c: 0 };
    const thetas = Array.from({ length: 60 }, (_, i) => -2.5 + (5 * i) / 59);
    const ys = syntheticResponses(truth, thetas);
    const result = fit2PL(thetas, ys, { cFixed: 0, maxIterations: 80 });
    expect(result.params.b).toBeGreaterThanOrEqual(-0.5);
    expect(result.params.b).toBeLessThanOrEqual(0.5);
    expect(result.params.a).toBeGreaterThan(0.3);
  });

  it('recovers b > 0 for a hard question', () => {
    const truth = { a: 1.5, b: 1.2, c: 0 };
    const thetas = Array.from({ length: 80 }, (_, i) => -2 + (4 * i) / 79);
    const ys = syntheticResponses(truth, thetas);
    const result = fit2PL(thetas, ys, { cFixed: 0, maxIterations: 80 });
    expect(result.params.b).toBeGreaterThan(0.5);
  });

  it('recovers b < 0 for an easy question', () => {
    const truth = { a: 1.2, b: -1.0, c: 0 };
    const thetas = Array.from({ length: 80 }, (_, i) => -2 + (4 * i) / 79);
    const ys = syntheticResponses(truth, thetas);
    const result = fit2PL(thetas, ys, { cFixed: 0, maxIterations: 80 });
    expect(result.params.b).toBeLessThan(-0.3);
  });

  it('does not crash when all responses are 1 (everyone passed)', () => {
    const thetas = [-1, 0, 1, 2, 3, 4];
    const ys = thetas.map(() => 1);
    const result = fit2PL(thetas, ys, { cFixed: 0, maxIterations: 30 });
    // Either converges to b at the lower bound or doesn't converge — both ok
    expect(result.params).toBeDefined();
    if (result.converged) {
      expect(result.params.b).toBeLessThanOrEqual(4);
    }
  });

  it('does not crash when all responses are 0', () => {
    const thetas = [-2, -1, 0, 1, 2, 3];
    const ys = thetas.map(() => 0);
    const result = fit2PL(thetas, ys, { cFixed: 0, maxIterations: 30 });
    expect(result.params).toBeDefined();
  });
});

describe('isAtBounds', () => {
  it('detects parameters at the box edges', () => {
    expect(isAtBounds({ a: 0, b: 0, c: 0 })).toBe(true);
    expect(isAtBounds({ a: 3, b: 0, c: 0 })).toBe(true);
    expect(isAtBounds({ a: 1, b: -4, c: 0 })).toBe(true);
    expect(isAtBounds({ a: 1, b: 4, c: 0 })).toBe(true);
  });

  it('returns false for healthy interior params', () => {
    expect(isAtBounds({ a: 1.5, b: 0.2, c: 0.1 })).toBe(false);
  });
});
