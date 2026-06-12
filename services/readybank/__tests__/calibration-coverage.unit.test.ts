import { describe, expect, it } from 'vitest';
import {
  computeCalibrationCoverage,
  type SkillCalibrationRow,
} from '../src/lib/calibration-coverage.js';
import { SKILL_FAMILIES } from '../src/lib/skill-families.js';

const FIXED = new Date('2026-06-12T00:00:00.000Z');

function row(skill: string, partial: Partial<SkillCalibrationRow> = {}): SkillCalibrationRow {
  return {
    skill,
    released: 0,
    with_irt_params: 0,
    with_empirical_data: 0,
    refit_ready: 0,
    ...partial,
  };
}

describe('computeCalibrationCoverage', () => {
  it('emits exactly one row per canonical family, even with no input', () => {
    const report = computeCalibrationCoverage([], FIXED);
    expect(report.families).toHaveLength(SKILL_FAMILIES.length);
    const ids = new Set(report.families.map((f) => f.family));
    expect(ids.size).toBe(SKILL_FAMILIES.length);
    for (const fam of report.families) {
      expect(fam.released).toBe(0);
      expect(fam.empirical_pct).toBe(0);
      expect(fam.irt_params_pct).toBe(0);
    }
    expect(report.totals.released).toBe(0);
    expect(report.generated_at).toBe(FIXED.toISOString());
  });

  it('folds skills into the correct families via familyForSkill', () => {
    const report = computeCalibrationCoverage(
      [
        row('AWS Lambda', { released: 10, with_irt_params: 10, with_empirical_data: 2 }),
        row('Kubernetes', { released: 5, with_irt_params: 5 }),
        row('PostgreSQL', { released: 8, with_irt_params: 8, with_empirical_data: 1 }),
        row('TensorFlow', { released: 4, with_irt_params: 3 }),
      ],
      FIXED,
    );
    const byId = new Map(report.families.map((f) => [f.family, f]));
    // AWS + Kubernetes both land in cloud-devops and are summed.
    expect(byId.get('cloud-devops')?.released).toBe(15);
    expect(byId.get('cloud-devops')?.with_irt_params).toBe(15);
    expect(byId.get('cloud-devops')?.with_empirical_data).toBe(2);
    expect(byId.get('data-databases')?.released).toBe(8);
    expect(byId.get('data-science-ml')?.released).toBe(4);
    expect(byId.get('frontend')?.released).toBe(0);
  });

  it('routes unrecognized skills to the "other" family', () => {
    const report = computeCalibrationCoverage(
      [row('Quantum Basket Weaving', { released: 3, with_irt_params: 1 })],
      FIXED,
    );
    const other = report.families.find((f) => f.family === 'other');
    expect(other?.released).toBe(3);
    expect(other?.with_irt_params).toBe(1);
  });

  it('computes honest integer coverage percentages', () => {
    const report = computeCalibrationCoverage(
      [row('AWS', { released: 8, with_irt_params: 4, with_empirical_data: 2, refit_ready: 1 })],
      FIXED,
    );
    const cloud = report.families.find((f) => f.family === 'cloud-devops');
    expect(cloud?.irt_params_pct).toBe(50);
    expect(cloud?.empirical_pct).toBe(25);
    expect(cloud?.refit_ready_pct).toBe(13); // round(1/8 * 100)
  });

  it('clamps junk counts and caps sub-counts at released', () => {
    const report = computeCalibrationCoverage(
      [
        row('AWS', {
          released: 5,
          with_irt_params: 99, // exceeds released -> capped at 5
          with_empirical_data: Number.NaN, // -> 0
          refit_ready: -7, // -> 0
        }),
      ],
      FIXED,
    );
    const cloud = report.families.find((f) => f.family === 'cloud-devops');
    expect(cloud?.with_irt_params).toBe(5);
    expect(cloud?.irt_params_pct).toBe(100);
    expect(cloud?.with_empirical_data).toBe(0);
    expect(cloud?.refit_ready).toBe(0);
    expect(Number.isFinite(cloud?.empirical_pct ?? NaN)).toBe(true);
  });

  it('sorts families by released volume descending, tie-broken by id', () => {
    const report = computeCalibrationCoverage(
      [
        row('PostgreSQL', { released: 20 }),
        row('AWS', { released: 50 }),
        row('React', { released: 10 }),
      ],
      FIXED,
    );
    const released = report.families.map((f) => f.released);
    const sorted = [...released].sort((a, b) => b - a);
    expect(released).toEqual(sorted);
    expect(report.families[0]?.family).toBe('cloud-devops'); // 50, the largest
  });

  it('totals reconcile with the sum of family counts', () => {
    const report = computeCalibrationCoverage(
      [
        row('AWS', { released: 10, with_irt_params: 10, with_empirical_data: 4, refit_ready: 2 }),
        row('PostgreSQL', { released: 6, with_irt_params: 6, with_empirical_data: 1 }),
      ],
      FIXED,
    );
    const sum = (k: 'released' | 'with_irt_params' | 'with_empirical_data' | 'refit_ready') =>
      report.families.reduce((acc, f) => acc + f[k], 0);
    expect(report.totals.released).toBe(sum('released'));
    expect(report.totals.with_irt_params).toBe(sum('with_irt_params'));
    expect(report.totals.with_empirical_data).toBe(sum('with_empirical_data'));
    expect(report.totals.refit_ready).toBe(sum('refit_ready'));
    expect(report.totals.released).toBe(16);
    expect(report.totals.empirical_pct).toBe(31); // round(5/16 * 100)
  });
});
