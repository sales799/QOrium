import { describe, expect, it } from 'vitest';
import {
  computeCalibrationReadiness,
  REFIT_THRESHOLD,
  type SkillReadinessRow,
} from '../src/lib/calibration-readiness.js';
import { SKILL_FAMILIES } from '../src/lib/skill-families.js';

const FIXED = new Date('2026-06-13T00:00:00.000Z');

function row(skill: string, partial: Partial<SkillReadinessRow> = {}): SkillReadinessRow {
  return {
    skill,
    released: 0,
    with_irt_params: 0,
    refit_ready: 0,
    thin: 0,
    ...partial,
  };
}

describe('computeCalibrationReadiness', () => {
  it('pins the refit threshold to the canonical BR-4 bar (30)', () => {
    expect(REFIT_THRESHOLD).toBe(30);
    expect(computeCalibrationReadiness([], FIXED).refit_threshold).toBe(30);
  });

  it('emits exactly one row per canonical family, even with no input', () => {
    const report = computeCalibrationReadiness([], FIXED);
    expect(report.families).toHaveLength(SKILL_FAMILIES.length);
    const ids = new Set(report.families.map((f) => f.family));
    expect(ids.size).toBe(SKILL_FAMILIES.length);
    for (const fam of report.families) {
      expect(fam.released).toBe(0);
      expect(fam.calibratable).toBe(0);
      expect(fam.calibrated).toBe(0);
      expect(fam.thin).toBe(0);
      expect(fam.cold).toBe(0);
      expect(fam.needs_responses).toBe(0);
      expect(fam.calibrated_pct).toBe(0);
    }
    expect(report.totals).toEqual({
      released: 0,
      calibratable: 0,
      calibrated: 0,
      thin: 0,
      cold: 0,
      needs_responses: 0,
      calibrated_pct: 0,
    });
    expect(report.generated_at).toBe('2026-06-13T00:00:00.000Z');
  });

  it('tiers calibratable items into calibrated / thin / cold with cold as the remainder', () => {
    // AWS -> cloud-devops. 100 released, 80 calibratable, 30 refit-ready, 20 thin => 30 cold.
    const report = computeCalibrationReadiness(
      [
        row('AWS Solutions Architect', {
          released: 100,
          with_irt_params: 80,
          refit_ready: 30,
          thin: 20,
        }),
      ],
      FIXED,
    );
    const cloud = report.families.find((f) => f.family === 'cloud-devops');
    expect(cloud).toBeDefined();
    expect(cloud?.released).toBe(100);
    expect(cloud?.calibratable).toBe(80);
    expect(cloud?.calibrated).toBe(30);
    expect(cloud?.thin).toBe(20);
    expect(cloud?.cold).toBe(30); // 80 - 30 - 20
    expect(cloud?.needs_responses).toBe(50); // cold 30 + thin 20
    // 30 of 80 calibratable past the refit bar => 37.5% -> rounds to 38.
    expect(cloud?.calibrated_pct).toBe(38);
    // Tiers partition calibratable exactly.
    expect(cloud!.calibrated + cloud!.thin + cloud!.cold).toBe(cloud!.calibratable);
  });

  it('surfaces the thin tier the cold-only backlog view hides (all items seeded but none calibrated)', () => {
    // 50 calibratable items, ALL with 0 < calibration_n < 30 (thin), none cold, none calibrated.
    // The cold-only backlog report would show cold_backlog 0 ("nothing to do");
    // readiness correctly reports needs_responses = 50 and calibrated_pct 0.
    const report = computeCalibrationReadiness(
      [row('AWS Lambda', { released: 50, with_irt_params: 50, refit_ready: 0, thin: 50 })],
      FIXED,
    );
    const cloud = report.families.find((f) => f.family === 'cloud-devops');
    expect(cloud?.calibratable).toBe(50);
    expect(cloud?.calibrated).toBe(0);
    expect(cloud?.thin).toBe(50);
    expect(cloud?.cold).toBe(0);
    expect(cloud?.needs_responses).toBe(50);
    expect(cloud?.calibrated_pct).toBe(0);
  });

  it('clamps tiers so calibrated + thin never exceed calibratable and cold never goes negative', () => {
    // Upstream junk: more IRT params than released, more refit_ready + thin than calibratable.
    const report = computeCalibrationReadiness(
      [row('SAP ABAP', { released: 10, with_irt_params: 99, refit_ready: 99, thin: 99 })],
      FIXED,
    );
    const erp = report.families.find((f) => f.family === 'enterprise-erp');
    expect(erp?.released).toBe(10);
    expect(erp?.calibratable).toBe(10); // clamped to released
    expect(erp?.calibrated).toBe(10); // clamped to calibratable
    expect(erp?.thin).toBe(0); // no room left after calibrated
    expect(erp?.cold).toBe(0); // remainder, never negative
    expect(erp?.needs_responses).toBe(0);
    expect(erp?.calibrated_pct).toBe(100);
    expect(erp!.calibrated + erp!.thin + erp!.cold).toBe(erp!.calibratable);
  });

  it('reports a fully cold family (IRT params, zero refit-ready, zero thin) as all cold', () => {
    const report = computeCalibrationReadiness(
      [row('Azure DevOps', { released: 50, with_irt_params: 50, refit_ready: 0, thin: 0 })],
      FIXED,
    );
    const cloud = report.families.find((f) => f.family === 'cloud-devops');
    expect(cloud?.calibratable).toBe(50);
    expect(cloud?.calibrated).toBe(0);
    expect(cloud?.thin).toBe(0);
    expect(cloud?.cold).toBe(50);
    expect(cloud?.needs_responses).toBe(50);
    expect(cloud?.calibrated_pct).toBe(0);
  });

  it('treats a family with no calibratable items as nothing-to-do', () => {
    // Released but zero IRT params => not calibration-eligible => no tiers.
    const report = computeCalibrationReadiness(
      [row('AWS EC2', { released: 40, with_irt_params: 0, refit_ready: 0, thin: 0 })],
      FIXED,
    );
    const cloud = report.families.find((f) => f.family === 'cloud-devops');
    expect(cloud?.released).toBe(40);
    expect(cloud?.calibratable).toBe(0);
    expect(cloud?.needs_responses).toBe(0);
    expect(cloud?.calibrated_pct).toBe(0);
  });

  it('sanitizes NaN / negative / fractional junk counts to non-negative integers', () => {
    const report = computeCalibrationReadiness(
      [
        row('AWS', {
          released: Number.NaN,
          with_irt_params: -5,
          refit_ready: 3.9,
          thin: -2,
        }),
      ],
      FIXED,
    );
    const cloud = report.families.find((f) => f.family === 'cloud-devops');
    expect(cloud?.released).toBe(0);
    expect(cloud?.calibratable).toBe(0);
    expect(cloud?.calibrated).toBe(0);
    expect(cloud?.thin).toBe(0);
    expect(cloud?.cold).toBe(0);
    expect(cloud?.needs_responses).toBe(0);
    expect(cloud?.calibrated_pct).toBe(0);
  });

  it('routes unknown skills to the "other" family', () => {
    const report = computeCalibrationReadiness(
      [
        row('Underwater Basket Weaving', {
          released: 7,
          with_irt_params: 7,
          refit_ready: 1,
          thin: 2,
        }),
      ],
      FIXED,
    );
    const other = report.families.find((f) => f.family === 'other');
    expect(other?.released).toBe(7);
    expect(other?.calibratable).toBe(7);
    expect(other?.calibrated).toBe(1);
    expect(other?.thin).toBe(2);
    expect(other?.cold).toBe(4);
    expect(other?.needs_responses).toBe(6);
  });

  it('sorts families by needs_responses descending, tie-broken by family id', () => {
    const report = computeCalibrationReadiness(
      [
        // cloud: 100 calibratable, 10 calibrated, 0 thin => 90 cold => needs 90
        row('AWS', { released: 100, with_irt_params: 100, refit_ready: 10, thin: 0 }),
        // erp: 100 calibratable, 70 calibrated, 0 thin => 30 cold => needs 30
        row('SAP', { released: 100, with_irt_params: 100, refit_ready: 70, thin: 0 }),
      ],
      FIXED,
    );
    const nonZero = report.families.filter((f) => f.needs_responses > 0).map((f) => f.family);
    expect(nonZero[0]).toBe('cloud-devops'); // 90 > 30 comes first
    expect(nonZero[1]).toBe('enterprise-erp');
    // needs_responses descending overall.
    const needs = report.families.map((f) => f.needs_responses);
    for (let i = 1; i < needs.length; i++) {
      expect(needs[i - 1]).toBeGreaterThanOrEqual(needs[i]);
    }
  });

  it('aggregates multiple skills in the same family and reconciles totals', () => {
    const report = computeCalibrationReadiness(
      [
        row('AWS', { released: 30, with_irt_params: 20, refit_ready: 5, thin: 5 }),
        row('Azure', { released: 30, with_irt_params: 30, refit_ready: 0, thin: 10 }),
      ],
      FIXED,
    );
    const cloud = report.families.find((f) => f.family === 'cloud-devops');
    expect(cloud?.released).toBe(60);
    expect(cloud?.calibratable).toBe(50); // 20 + 30
    expect(cloud?.calibrated).toBe(5); // 5 + 0
    expect(cloud?.thin).toBe(15); // 5 + 10
    expect(cloud?.cold).toBe(30); // 50 - 5 - 15
    expect(cloud?.needs_responses).toBe(45); // 30 + 15
    // Totals equal the sum across all families.
    const sum = (
      k: 'released' | 'calibratable' | 'calibrated' | 'thin' | 'cold' | 'needs_responses',
    ) => report.families.reduce((acc, f) => acc + f[k], 0);
    expect(report.totals.released).toBe(sum('released'));
    expect(report.totals.calibratable).toBe(sum('calibratable'));
    expect(report.totals.calibrated).toBe(sum('calibrated'));
    expect(report.totals.thin).toBe(sum('thin'));
    expect(report.totals.cold).toBe(sum('cold'));
    expect(report.totals.needs_responses).toBe(sum('needs_responses'));
  });
});
