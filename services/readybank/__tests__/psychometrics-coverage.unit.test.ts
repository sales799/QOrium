import { describe, expect, it } from 'vitest';
import {
  coveragePct,
  computeCoverage,
  type PsychometricsCounts,
} from '../src/lib/psychometrics-coverage.js';

/**
 * N19 psychometrics-coverage — pure shaping for the public calibration-coverage
 * surface. These tests need no DB: they prove the percentages are always
 * well-formed (never NaN/Infinity/>100), that junk upstream counts are
 * sanitized, and that sub-counts can never exceed the released denominator.
 */

const FIXED = new Date('2026-06-12T00:00:00.000Z');

describe('coveragePct', () => {
  it('computes a rounded integer percentage', () => {
    expect(coveragePct(1, 3)).toBe(33);
    expect(coveragePct(2, 3)).toBe(67);
    expect(coveragePct(1, 2)).toBe(50);
  });

  it('returns 0 for a zero or missing denominator (never NaN/Infinity)', () => {
    expect(coveragePct(0, 0)).toBe(0);
    expect(coveragePct(5, 0)).toBe(0);
  });

  it('caps at 100 when the numerator exceeds the denominator', () => {
    expect(coveragePct(7, 3)).toBe(100);
  });

  it('treats negative / non-finite inputs as 0', () => {
    expect(coveragePct(-4, 10)).toBe(0);
    expect(coveragePct(Number.NaN, 10)).toBe(0);
    expect(coveragePct(5, Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe('computeCoverage', () => {
  it('shapes a healthy bank into consistent counts and percentages', () => {
    const counts: PsychometricsCounts = {
      questions_released: 1000,
      with_irt_params: 1000,
      with_empirical_data: 250,
      refit_ready: 40,
    };
    const out = computeCoverage(counts, FIXED);
    expect(out.questions_released).toBe(1000);
    expect(out.with_irt_params).toBe(1000);
    expect(out.with_empirical_data).toBe(250);
    expect(out.refit_ready).toBe(40);
    expect(out.irt_params_pct).toBe(100);
    expect(out.empirical_pct).toBe(25);
    expect(out.refit_ready_pct).toBe(4);
    expect(out.generated_at).toBe('2026-06-12T00:00:00.000Z');
  });

  it('reports an empty bank as all zeros, no division blow-up', () => {
    const out = computeCoverage(
      { questions_released: 0, with_irt_params: 0, with_empirical_data: 0, refit_ready: 0 },
      FIXED,
    );
    expect(out.questions_released).toBe(0);
    expect(out.irt_params_pct).toBe(0);
    expect(out.empirical_pct).toBe(0);
    expect(out.refit_ready_pct).toBe(0);
  });

  it('clamps a sub-count that exceeds the released total to the total', () => {
    const out = computeCoverage(
      { questions_released: 10, with_irt_params: 99, with_empirical_data: 12, refit_ready: 50 },
      FIXED,
    );
    expect(out.with_irt_params).toBe(10);
    expect(out.with_empirical_data).toBe(10);
    expect(out.refit_ready).toBe(10);
    expect(out.irt_params_pct).toBe(100);
    expect(out.refit_ready_pct).toBe(100);
  });

  it('sanitizes nulls / negatives / fractions in raw counts', () => {
    const out = computeCoverage(
      {
        questions_released: 100.7,
        with_irt_params: -5 as unknown as number,
        with_empirical_data: Number.NaN as unknown as number,
        refit_ready: 12.9,
      },
      FIXED,
    );
    expect(out.questions_released).toBe(100);
    expect(out.with_irt_params).toBe(0);
    expect(out.with_empirical_data).toBe(0);
    expect(out.refit_ready).toBe(12);
    expect(out.refit_ready_pct).toBe(12);
  });

  it('defaults generated_at to now when no clock is injected', () => {
    const before = Date.now();
    const out = computeCoverage({
      questions_released: 1,
      with_irt_params: 1,
      with_empirical_data: 0,
      refit_ready: 0,
    });
    const ts = Date.parse(out.generated_at);
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(Date.now());
  });
});
