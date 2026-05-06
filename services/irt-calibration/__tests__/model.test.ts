import { describe, expect, it } from 'vitest';
import {
  clampParameters,
  defaultGuessingForFormat,
  itemLogLikelihood,
  PARAM_BOUNDS,
  probability3PL,
  sigmoid,
} from '../src/model';

describe('sigmoid', () => {
  it.each([
    [0, 0.5],
    [-1000, 0],
    [1000, 1],
  ])('σ(%s) ≈ %s', (z, expected) => {
    expect(sigmoid(z)).toBeCloseTo(expected, 6);
  });

  it('is symmetric: σ(-z) = 1 - σ(z)', () => {
    for (const z of [-3, -1.2, -0.4, 0.8, 2.7]) {
      expect(sigmoid(-z)).toBeCloseTo(1 - sigmoid(z), 9);
    }
  });
});

describe('probability3PL', () => {
  it('reduces to logistic when c = 0', () => {
    expect(probability3PL(0, { a: 1, b: 0, c: 0 })).toBeCloseTo(0.5);
    expect(probability3PL(2, { a: 1, b: 0, c: 0 })).toBeCloseTo(sigmoid(2));
  });

  it('floors at c when ability is far below difficulty', () => {
    const p = probability3PL(-10, { a: 1.5, b: 0, c: 0.25 });
    expect(p).toBeCloseTo(0.25, 3);
  });

  it('approaches 1 as ability rises far above difficulty', () => {
    const p = probability3PL(10, { a: 1.5, b: 0, c: 0.25 });
    expect(p).toBeGreaterThan(0.99);
    expect(p).toBeLessThanOrEqual(1);
  });

  it('is monotonically increasing in θ', () => {
    const params = { a: 1.2, b: 0.4, c: 0.1 };
    const p1 = probability3PL(-1, params);
    const p2 = probability3PL(0, params);
    const p3 = probability3PL(1, params);
    expect(p2).toBeGreaterThan(p1);
    expect(p3).toBeGreaterThan(p2);
  });
});

describe('clampParameters', () => {
  it('respects PARAM_BOUNDS', () => {
    const c = clampParameters({ a: 99, b: -99, c: 99 });
    expect(c.a).toBe(PARAM_BOUNDS.a.max);
    expect(c.b).toBe(PARAM_BOUNDS.b.min);
    expect(c.c).toBe(PARAM_BOUNDS.c.max);
  });

  it('NaN snaps to lower bound', () => {
    expect(clampParameters({ a: Number.NaN, b: 0, c: 0 }).a).toBe(PARAM_BOUNDS.a.min);
  });
});

describe('defaultGuessingForFormat', () => {
  it.each([
    ['mcq', 0.25],
    ['msq', 0.0625],
    ['truefalse', 0.5],
    ['coding', 0],
    ['design', 0],
    ['sjt', 0],
    ['casestudy', 0],
    ['unknown-format', 0],
  ])('format %s → c = %s', (fmt, expected) => {
    expect(defaultGuessingForFormat(fmt)).toBe(expected);
  });
});

describe('itemLogLikelihood', () => {
  it('throws when arrays have mismatched lengths', () => {
    expect(() => itemLogLikelihood([0, 0], [1], { a: 1, b: 0, c: 0 })).toThrow();
  });

  it('returns -∞-ish for an impossible response (clipped to log(EPS))', () => {
    // Response y=1 but P(θ|params) ≈ 0
    const ll = itemLogLikelihood([-5], [1], { a: 2, b: 5, c: 0 });
    expect(ll).toBeLessThan(-10);
  });

  it('returns higher LL for params that match the data', () => {
    // Synthetic: θ ranging from -2 to 2, easy item (b=-1) → most respondents pass
    const thetas = [-2, -1, 0, 1, 2];
    const ys = [0, 1, 1, 1, 1];
    const goodFit = itemLogLikelihood(thetas, ys, { a: 1.5, b: -1, c: 0 });
    const badFit = itemLogLikelihood(thetas, ys, { a: 1.5, b: 3, c: 0 });
    expect(goodFit).toBeGreaterThan(badFit);
  });
});
