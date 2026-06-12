import { describe, expect, it } from 'vitest';
import {
  computeReferencePanelVolume,
  type SkillReleasedRow,
  type SkillPanelRow,
} from '../src/lib/reference-panel-volume.js';
import { SKILL_FAMILIES } from '../src/lib/skill-families.js';

const FIXED = new Date('2026-06-12T00:00:00.000Z');

function rel(skill: string, released: number): SkillReleasedRow {
  return { skill, released };
}
function pan(skill: string, partial: Partial<SkillPanelRow> = {}): SkillPanelRow {
  return { skill, panel_responses: 0, questions_with_panel: 0, ...partial };
}

describe('computeReferencePanelVolume', () => {
  it('emits exactly one row per canonical family, even with no input', () => {
    const report = computeReferencePanelVolume([], [], 0, FIXED);
    expect(report.families).toHaveLength(SKILL_FAMILIES.length);
    const ids = new Set(report.families.map((f) => f.family));
    expect(ids.size).toBe(SKILL_FAMILIES.length);
    for (const fam of report.families) {
      expect(fam.released).toBe(0);
      expect(fam.panel_responses).toBe(0);
      expect(fam.questions_with_panel).toBe(0);
      expect(fam.questions_coverage_pct).toBe(0);
    }
    expect(report.totals.released).toBe(0);
    expect(report.totals.panel_responses).toBe(0);
    expect(report.totals.distinct_panelists).toBe(0);
    expect(report.generated_at).toBe(FIXED.toISOString());
  });

  it('folds skills into the correct families and sums released + panel counts', () => {
    const report = computeReferencePanelVolume(
      [rel('AWS Lambda', 10), rel('Kubernetes', 5), rel('PostgreSQL', 8)],
      [
        pan('AWS Lambda', { panel_responses: 40, questions_with_panel: 4 }),
        pan('Kubernetes', { panel_responses: 10, questions_with_panel: 2 }),
        pan('PostgreSQL', { panel_responses: 6, questions_with_panel: 1 }),
      ],
      7,
      FIXED,
    );
    const byId = new Map(report.families.map((f) => [f.family, f]));
    // AWS + Kubernetes both land in cloud-devops and are summed.
    expect(byId.get('cloud-devops')?.released).toBe(15);
    expect(byId.get('cloud-devops')?.panel_responses).toBe(50);
    expect(byId.get('cloud-devops')?.questions_with_panel).toBe(6);
    expect(byId.get('data-databases')?.released).toBe(8);
    expect(byId.get('data-databases')?.panel_responses).toBe(6);
    expect(report.totals.released).toBe(23);
    expect(report.totals.panel_responses).toBe(56);
    expect(report.totals.questions_with_panel).toBe(7);
    expect(report.totals.distinct_panelists).toBe(7);
  });

  it('clamps questions_with_panel to released so coverage never exceeds 100', () => {
    const report = computeReferencePanelVolume(
      [rel('PostgreSQL', 3)],
      [pan('PostgreSQL', { panel_responses: 99, questions_with_panel: 50 })],
      4,
      FIXED,
    );
    const fam = report.families.find((f) => f.family === 'data-databases');
    expect(fam?.questions_with_panel).toBe(3);
    expect(fam?.questions_coverage_pct).toBe(100);
    // Raw response volume is not clamped — it can exceed item count.
    expect(fam?.panel_responses).toBe(99);
  });

  it('sanitizes junk counts (NaN / negative) to zero', () => {
    const report = computeReferencePanelVolume(
      [rel('PostgreSQL', Number.NaN)],
      [pan('PostgreSQL', { panel_responses: -5, questions_with_panel: Number.NaN })],
      -3,
      FIXED,
    );
    const fam = report.families.find((f) => f.family === 'data-databases');
    expect(fam?.released).toBe(0);
    expect(fam?.panel_responses).toBe(0);
    expect(fam?.questions_with_panel).toBe(0);
    expect(report.totals.distinct_panelists).toBe(0);
  });

  it('sorts families by panel_responses descending', () => {
    const report = computeReferencePanelVolume(
      [rel('PostgreSQL', 5), rel('AWS Lambda', 5)],
      [
        pan('PostgreSQL', { panel_responses: 3, questions_with_panel: 1 }),
        pan('AWS Lambda', { panel_responses: 30, questions_with_panel: 2 }),
      ],
      2,
      FIXED,
    );
    expect(report.families[0]?.family).toBe('cloud-devops');
    expect(report.families[0]?.panel_responses).toBe(30);
  });

  it('ignores unknown skills that map to no family bucket gracefully', () => {
    // familyForSkill always returns a family (fallback), so unknown skills are
    // folded into the fallback family rather than dropped — assert no throw and
    // that totals still reconcile.
    const report = computeReferencePanelVolume(
      [rel('Totally Made Up Skill 9000', 4)],
      [pan('Totally Made Up Skill 9000', { panel_responses: 8, questions_with_panel: 2 })],
      1,
      FIXED,
    );
    expect(report.totals.released).toBe(4);
    expect(report.totals.panel_responses).toBe(8);
    expect(report.totals.questions_with_panel).toBe(2);
  });
});
