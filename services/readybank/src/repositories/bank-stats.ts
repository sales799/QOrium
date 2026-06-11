// N8 admin console — read-only question-bank health stats.
//
// Surfaces the shape of the live item bank to the admin console: how many
// questions exist, their status/SKU breakdown, calibration coverage, and how
// many of the 13 consolidated skill families (N7) actually carry released
// items. No tenant breakdown, no question content, no PII — pure bank shape.

import type { Pool } from '@qorium/db';
import { SKILL_FAMILIES, familyForSkill, type SkillFamilyId } from '../lib/skill-families.js';

export interface BankStats {
  questions_total: number;
  questions_released: number;
  /** calibration_n >= 30 — the BR-4 IRT-refit threshold (honest about defensibility). */
  questions_calibrated: number;
  /** calibrated as a percentage of released, rounded to 1 decimal. */
  calibration_pct: number;
  by_status: Record<string, number>;
  by_sku: Record<string, number>;
  skills_total: number;
  families_total: number;
  families_with_released: number;
  generated_at: string;
}

const num = (v: string | null | undefined): number => (v != null ? Number(v) : 0);

const toMap = (rows: { k: string | null; n: string }[]): Record<string, number> =>
  rows.reduce<Record<string, number>>((acc, r) => {
    if (r.k != null) acc[r.k] = Number(r.n);
    return acc;
  }, {});

export async function getBankStats(pool: Pool): Promise<BankStats> {
  const [scalars, byStatus, bySku, releasedSkills] = await Promise.all([
    pool.query<{
      questions_total: string | null;
      questions_released: string | null;
      questions_calibrated: string | null;
      skills_total: string | null;
    }>(
      `SELECT
         (SELECT count(*) FROM content.questions)                                   AS questions_total,
         (SELECT count(*) FROM content.questions WHERE status = 'released')         AS questions_released,
         (SELECT count(*) FROM content.questions WHERE calibration_n >= 30)         AS questions_calibrated,
         (SELECT count(*) FROM content.skills)                                      AS skills_total`,
    ),
    pool.query<{ k: string | null; n: string }>(
      `SELECT status AS k, count(*)::text AS n FROM content.questions GROUP BY status`,
    ),
    pool.query<{ k: string | null; n: string }>(
      `SELECT sku AS k, count(*)::text AS n FROM content.questions GROUP BY sku`,
    ),
    pool.query<{ name: string }>(
      `SELECT DISTINCT s.name
         FROM content.skills s
         JOIN content.questions q ON q.skill_id = s.id AND q.status = 'released'`,
    ),
  ]);

  const row = scalars.rows[0];
  const released = num(row?.questions_released);
  const calibrated = num(row?.questions_calibrated);

  const families = new Set<SkillFamilyId>();
  for (const r of releasedSkills.rows) families.add(familyForSkill(r.name));

  return {
    questions_total: num(row?.questions_total),
    questions_released: released,
    questions_calibrated: calibrated,
    calibration_pct: released > 0 ? Math.round((calibrated / released) * 1000) / 10 : 0,
    by_status: toMap(byStatus.rows),
    by_sku: toMap(bySku.rows),
    skills_total: num(row?.skills_total),
    families_total: SKILL_FAMILIES.length,
    families_with_released: families.size,
    generated_at: new Date().toISOString(),
  };
}
