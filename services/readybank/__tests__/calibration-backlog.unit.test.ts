import { describe, expect, it } from 'vitest';
import { computeCalibrationBacklog, type SkillBacklogRow } from '../src/lib/calibration-backlog.js';
import { SKILL_FAMILIES } from '../src/lib/skill-families.js';

const FIXED = new Date('2026-06-13T00:00:00.000Z');

function row(skill: string, partial: Partial<SkillBacklogRow> = {}): SkillBacklogRow {
  return {
    skill,
    released: 0,
    with_irt_params: 0,
    with_empirical_data: 0,
    ...partial,
  };
}

describe('computeCalibrationBacklog', () => {
  it('emits exactly one row per canonical family, even with no input', () => {
    const report = computeCalibrationBacklog([], FIXED);
    expect(report.families).toHaveLength(SKILL_FAMILIES.length);
    const ids = new Set(report.families.map((f) => f.family));
    expect(ids.size).toBe(SKILL_FAMILIES.length);
    for (const fam of report.families) {
      expect(fam.released).toBe(0);
      expect(fam.calibratable).toBe(0);
      expect(fam.seeded).toBe(0);
      expect(fam.cold_backlog).toBe(0);
      expect(fam.cold_pct).toBe(0);
    }
    expect(report.totals).toEqual({
      released: 0,
      calibratable: 0,
      seeded: 0,
      cold_backlog: 0,
      cold_pct: 0,
    });
    expect(report.generated_at).toBe('2026-06-13T00:00:00.000Z');
  });

  it('computes cold backlog = calibratable - seeded and cold_pct as the un-seeded share', () => {
    // AWS -> cloud-devops family. 100 released, 80 carry IRT params, 20 seeded.
    const report = computeCalibrationBacklog(
      [
        row('AWS Solutions Architect', {
          released: 100,
          with_irt_params: 80,
          with_empirical_data: 20,
        }),
      ],
      FIXED,
    );
    const cloud = report.families.find((f) => f.family === 'cloud-devops');
    expect(cloud).toBeDefined();
    expect(cloud?.released).toBe(100);
    expect(cloud?.calibratable).toBe(80);
    expect(cloud?.seeded).toBe(20);
    expect(cloud?.cold_backlog).toBe(60);
    // 60 of 80 calibratable un-seeded => 75%.
    expect(cloud?.cold_pct).toBe(75);
  });

  it('clamps sub-counts so seeded <= calibratable <= released and backlog never goes negative', () => {
    // Upstream junk: more IRT params than released, more seeded than calibratable.
    const report = computeCalibrationBacklog(
      [row('SAP ABAP', { released: 10, with_irt_params: 99, with_empirical_data: 99 })],
      FIXED,
    );
    const erp = report.families.find((f) => f.family === 'enterprise-erp');
    expect(erp?.released).toBe(10);
    expect(erp?.calibratable).toBe(10); // clamped to released
    expect(erp?.seeded).toBe(10); // clamped to calibratable
    expect(erp?.cold_backlog).toBe(0);
    expect(erp?.cold_pct).toBe(0);
  });

  it('reports a fully cold family (IRT params but zero empirical) at cold_pct 100', () => {
    const report = computeCalibrationBacklog(
      [row('AWS Lambda', { released: 50, with_irt_params: 50, with_empirical_data: 0 })],
      FIXED,
    );
    const cloud = report.families.find((f) => f.family === 'cloud-devops');
    expect(cloud?.cold_backlog).toBe(50);
    expect(cloud?.cold_pct).toBe(100);
  });

  it('treats a family with no calibratable items as nothing-to-do (cold_pct 0)', () => {
    // Released but zero IRT params => not calibration-eligible => no backlog.
    const report = computeCalibrationBacklog(
      [row('AWS EC2', { released: 40, with_irt_params: 0, with_empirical_data: 0 })],
      FIXED,
    );
    const cloud = report.families.find((f) => f.family === 'cloud-devops');
    expect(cloud?.released).toBe(40);
    expect(cloud?.calibratable).toBe(0);
    expect(cloud?.cold_backlog).toBe(0);
    expect(cloud?.cold_pct).toBe(0);
  });

  it('sanitizes NaN / negative / fractional junk counts to non-negative integers', () => {
    const report = computeCalibrationBacklog(
      [
        row('AWS', {
          released: Number.NaN,
          with_irt_params: -5,
          with_empirical_data: 3.9,
        }),
      ],
      FIXED,
    );
    const cloud = report.families.find((f) => f.family === 'cloud-devops');
    expect(cloud?.released).toBe(0);
    expect(cloud?.calibratable).toBe(0);
    expect(cloud?.seeded).toBe(0);
    expect(cloud?.cold_backlog).toBe(0);
    expect(cloud?.cold_pct).toBe(0);
  });

  it('routes unknown skills to the "other" family', () => {
    const report = computeCalibrationBacklog(
      [
        row('Underwater Basket Weaving', {
          released: 7,
          with_irt_params: 7,
          with_empirical_data: 1,
        }),
      ],
      FIXED,
    );
    const other = report.families.find((f) => f.family === 'other');
    expect(other?.released).toBe(7);
    expect(other?.calibratable).toBe(7);
    expect(other?.seeded).toBe(1);
    expect(other?.cold_backlog).toBe(6);
  });

  it('sorts families by cold_backlog descending, tie-broken by family id', () => {
    const report = computeCalibrationBacklog(
      [
        row('AWS', { released: 100, with_irt_params: 100, with_empirical_data: 10 }), // cloud: 90 cold
        row('SAP', { released: 100, with_irt_params: 100, with_empirical_data: 70 }), // erp: 30 cold
      ],
      FIXED,
    );
    const nonZero = report.families.filter((f) => f.cold_backlog > 0).map((f) => f.family);
    expect(nonZero[0]).toBe('cloud-devops'); // 90 > 30 comes first
    expect(nonZero[1]).toBe('enterprise-erp');
    // Backlog descending overall.
    const backlogs = report.families.map((f) => f.cold_backlog);
    for (let i = 1; i < backlogs.length; i++) {
      expect(backlogs[i - 1]).toBeGreaterThanOrEqual(backlogs[i]);
    }
  });

  it('aggregates multiple skills in the same family and reconciles totals', () => {
    const report = computeCalibrationBacklog(
      [
        row('AWS', { released: 30, with_irt_params: 20, with_empirical_data: 5 }),
        row('Azure', { released: 30, with_irt_params: 30, with_empirical_data: 0 }),
      ],
      FIXED,
    );
    const cloud = report.families.find((f) => f.family === 'cloud-devops');
    expect(cloud?.released).toBe(60);
    expect(cloud?.calibratable).toBe(50);
    expect(cloud?.seeded).toBe(5);
    expect(cloud?.cold_backlog).toBe(45);
    // Totals equal the sum across all families.
    const sum = (k: 'released' | 'calibratable' | 'seeded' | 'cold_backlog') =>
      report.families.reduce((acc, f) => acc + f[k], 0);
    expect(report.totals.released).toBe(sum('released'));
    expect(report.totals.calibratable).toBe(sum('calibratable'));
    expect(report.totals.seeded).toBe(sum('seeded'));
    expect(report.totals.cold_backlog).toBe(sum('cold_backlog'));
    // 45 of 50 calibratable un-seeded => 90%.
    expect(report.totals.cold_pct).toBe(90);
  });
});
