// Pure per-skill-family calibration BACKLOG shaping for the admin console (N8)
// and the calibration-volume program (N19).
//
// The sibling lib/calibration-coverage.ts answers "how many released items HAVE
// empirical data". Operators planning where to seed real response volume need
// the inverse, actionable view: of the items that are calibration-ELIGIBLE
// (released AND already carry an IRT difficulty parameter), how many still have
// ZERO empirical responses — i.e. the cold backlog that is ready to calibrate
// the moment responses arrive. This helper folds raw per-skill counts into the
// 13 canonical buyer-facing families via the pure familyForSkill() mapper and
// emits each family's backlog plus a cold_pct (un-seeded share of its
// calibratable items), sorted worst-first so seeding effort targets the
// families with the largest cold backlog.
//
// DB-free so it can be unit-tested exhaustively without a pool; the route stays
// a thin adapter over the repository's grouped counts.

import {
  SKILL_FAMILIES,
  familyForSkill,
  familyName,
  type SkillFamilyId,
} from './skill-families.js';
import { coveragePct } from './psychometrics-coverage.js';

/** Raw released-item counts for a single skill, pulled by the repository. */
export interface SkillBacklogRow {
  /** content.skills.name — mapped to a family via familyForSkill(). */
  skill: string;
  /** Released, readybank-SKU questions for this skill. */
  released: number;
  /** Of those, how many carry an IRT difficulty parameter (calibratable). */
  with_irt_params: number;
  /** Of those, how many already have any empirical response data (calibration_n > 0). */
  with_empirical_data: number;
}

export interface FamilyCalibrationBacklog {
  family: SkillFamilyId;
  family_name: string;
  /** Released readybank items in this family. */
  released: number;
  /** Of those, how many are calibration-eligible (carry an IRT param). */
  calibratable: number;
  /** Of the calibratable items, how many already have empirical data. */
  seeded: number;
  /** Of the calibratable items, how many still have ZERO empirical data (the backlog). */
  cold_backlog: number;
  /** Un-seeded share of calibratable items, integer 0–100 (higher = colder). */
  cold_pct: number;
}

export interface CalibrationBacklogReport {
  families: FamilyCalibrationBacklog[];
  totals: {
    released: number;
    calibratable: number;
    seeded: number;
    cold_backlog: number;
    cold_pct: number;
  };
  generated_at: string;
}

/** Clamp to a non-negative integer; treats NaN / negatives / junk as 0. */
function clampCount(v: number): number {
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
}

interface Acc {
  released: number;
  calibratable: number;
  seeded: number;
}

function emptyAcc(): Acc {
  return { released: 0, calibratable: 0, seeded: 0 };
}

/**
 * Fold raw per-skill counts into the 13 canonical families. Every family is
 * present even with zero released items, so the operator sees a family with no
 * calibratable items (cold_pct 0, nothing to do) distinctly from a fully cold
 * family (cold_pct 100). Sub-counts are clamped so they never exceed the
 * enclosing count (seeded ≤ calibratable ≤ released), so cold_backlog is never
 * negative and cold_pct never exceeds 100. Result is sorted by cold_backlog
 * descending (largest seeding opportunity first), tie-broken by family id for
 * deterministic output.
 */
export function computeCalibrationBacklog(
  rows: SkillBacklogRow[],
  now: Date = new Date(),
): CalibrationBacklogReport {
  const byFamily = new Map<SkillFamilyId, Acc>();
  for (const fam of SKILL_FAMILIES) byFamily.set(fam.id, emptyAcc());

  for (const row of rows) {
    const acc = byFamily.get(familyForSkill(row.skill));
    if (!acc) continue;
    const released = clampCount(row.released);
    // A sub-count can never exceed its enclosing count, regardless of what the
    // upstream query returns: calibratable ≤ released, seeded ≤ calibratable.
    const calibratable = Math.min(clampCount(row.with_irt_params), released);
    const seeded = Math.min(clampCount(row.with_empirical_data), calibratable);
    acc.released += released;
    acc.calibratable += calibratable;
    acc.seeded += seeded;
  }

  const totals = emptyAcc();
  const families: FamilyCalibrationBacklog[] = [];
  for (const fam of SKILL_FAMILIES) {
    const acc = byFamily.get(fam.id);
    if (!acc) continue;
    const coldBacklog = acc.calibratable - acc.seeded;
    totals.released += acc.released;
    totals.calibratable += acc.calibratable;
    totals.seeded += acc.seeded;
    families.push({
      family: fam.id,
      family_name: familyName(fam.id),
      released: acc.released,
      calibratable: acc.calibratable,
      seeded: acc.seeded,
      cold_backlog: coldBacklog,
      cold_pct: coveragePct(coldBacklog, acc.calibratable),
    });
  }

  families.sort((a, b) => b.cold_backlog - a.cold_backlog || a.family.localeCompare(b.family));

  const totalColdBacklog = totals.calibratable - totals.seeded;
  return {
    families,
    totals: {
      released: totals.released,
      calibratable: totals.calibratable,
      seeded: totals.seeded,
      cold_backlog: totalColdBacklog,
      cold_pct: coveragePct(totalColdBacklog, totals.calibratable),
    },
    generated_at: now.toISOString(),
  };
}
