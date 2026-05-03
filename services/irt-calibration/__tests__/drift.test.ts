import { describe, expect, it } from 'vitest';
import { classifyDrift, expectedPassRateAtMeanAbility, nextStatusForFlag } from '../src/drift';

describe('expectedPassRateAtMeanAbility', () => {
  it('returns 0.5 for a centered logistic with c=0', () => {
    expect(expectedPassRateAtMeanAbility({ a: 1, b: 0, c: 0 })).toBeCloseTo(0.5);
  });

  it('respects the c floor', () => {
    expect(expectedPassRateAtMeanAbility({ a: 2, b: 5, c: 0.25 })).toBeCloseTo(0.25, 2);
  });
});

describe('classifyDrift', () => {
  it('returns the preflag if it is non-none', () => {
    expect(
      classifyDrift({
        estimated: { a: 1, b: 0, c: 0 },
        prior: { a: 1, b: 0 },
        empiricalPassRate: 0.5,
        preflag: 'no_convergence',
      }),
    ).toBe('no_convergence');
  });

  it('returns invalid_params when a <= 0', () => {
    expect(
      classifyDrift({
        estimated: { a: 0, b: 0, c: 0 },
        prior: { a: 1, b: 0 },
        empiricalPassRate: null,
      }),
    ).toBe('invalid_params');
  });

  it('returns invalid_params on NaN', () => {
    expect(
      classifyDrift({
        estimated: { a: Number.NaN, b: 0, c: 0 },
        prior: { a: 1, b: 0 },
        empiricalPassRate: null,
      }),
    ).toBe('invalid_params');
  });

  it('flags drift_b when |Δb| > 0.5', () => {
    expect(
      classifyDrift({
        estimated: { a: 1, b: 0.8, c: 0 },
        prior: { a: 1, b: 0 },
        empiricalPassRate: 0.5,
      }),
    ).toBe('drift_b');
  });

  it('flags drift_a when |Δa| > 0.3 (and b is unchanged)', () => {
    expect(
      classifyDrift({
        estimated: { a: 1.5, b: 0, c: 0 },
        prior: { a: 1, b: 0 },
        empiricalPassRate: 0.5,
      }),
    ).toBe('drift_a');
  });

  it('flags extreme_pass_rate when empirical and predicted pass rates diverge >0.20', () => {
    // params predict ~0.5, empirical = 0.85 → divergence 0.35
    expect(
      classifyDrift({
        estimated: { a: 1, b: 0, c: 0 },
        prior: { a: 1, b: 0 },
        empiricalPassRate: 0.85,
      }),
    ).toBe('extreme_pass_rate');
  });

  it('returns none when within tolerances', () => {
    expect(
      classifyDrift({
        estimated: { a: 1.05, b: 0.1, c: 0 },
        prior: { a: 1.0, b: 0 },
        empiricalPassRate: 0.5,
      }),
    ).toBe('none');
  });

  it('returns none when prior is null (first calibration)', () => {
    expect(
      classifyDrift({
        estimated: { a: 1.4, b: 1.5, c: 0 },
        prior: { a: null, b: null },
        empiricalPassRate: null,
      }),
    ).toBe('none');
  });
});

describe('nextStatusForFlag', () => {
  it.each([
    ['none', true, 'released'],
    ['drift_b', true, 'sme_review'],
    ['drift_a', true, 'sme_review'],
    ['extreme_pass_rate', true, 'sme_review'],
    ['low_n', true, 'calibrating'],
    ['no_convergence', true, 'calibrating'],
    ['invalid_params', true, 'calibrating'],
    ['none', false, 'calibrating'],
  ] as const)('flag=%s minN=%s → %s', (flag, hasMin, expected) => {
    expect(nextStatusForFlag({ flag, hasMinResponses: hasMin })).toBe(expected);
  });
});
