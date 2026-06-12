// Pure per-skill-family calibration-coverage shaping for the admin console (N8)
// and the calibration-volume program (N19).
//
// The public psychometrics-coverage surface (lib/psychometrics-coverage.ts)
// reports ONE platform-wide number per metric. Operators planning where to seed
// real response volume need the same four counts broken down BY buyer-facing
// skill family, so they can see which families carry IRT parameters but still
// have no empirical data yet (the cold-loop). This helper folds raw per-skill
// counts into the 13 canonical families via the pure familyForSkill() mapper
// and emits honest integer coverage percentages.
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
export interface SkillCalibrationRow {
  /** content.skills.name — mapped to a family via familyForSkill(). */
  skill: string;
  /** Released, readybank-SKU questions for this skill. */
  released: number;
  /** Of those, how many carry an IRT difficulty parameter. */
  with_irt_params: number;
  /** Of those, how many have any empirical response data (calibration_n > 0). */
  with_empirical_data: number;
  /** Of those, how many cross the BR-4 refit threshold (calibration_n >= 30). */
  refit_ready: number;
}

export interface FamilyCalibrationCoverage {
  family: SkillFamilyId;
  family_name: string;
  released: number;
  with_irt_params: number;
  with_empirical_data: number;
  refit_ready: number;
  irt_params_pct: number;
  empirical_pct: number;
  refit_ready_pct: number;
}

export interface CalibrationCoverageReport {
  families: FamilyCalibrationCoverage[];
  totals: {
    released: number;
    with_irt_params: number;
    with_empirical_data: number;
    refit_ready: number;
    irt_params_pct: number;
    empirical_pct: number;
    refit_ready_pct: number;
  };
  generated_at: string;
}

/** Clamp to a non-negative integer; treats NaN / negatives / junk as 0. */
function clampCount(v: number): number {
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
}

interface Acc {
  released: number;
  with_irt_params: number;
  with_empirical_data: number;
  refit_ready: number;
}

function emptyAcc(): Acc {
  return { released: 0, with_irt_params: 0, with_empirical_data: 0, refit_ready: 0 };
}

/**
 * Fold raw per-skill counts into the 13 canonical families. Every family is
 * present even with zero released items, so the operator sees coverage gaps (a
 * family at 0% empirical) rather than a silently-absent row. Sub-counts are
 * clamped to the family's released total so percentages never exceed 100, and
 * the result is sorted by released volume descending (largest families first),
 * tie-broken by family id for deterministic output.
 */
export function computeCalibrationCoverage(
  rows: SkillCalibrationRow[],
  now: Date = new Date(),
): CalibrationCoverageReport {
  const byFamily = new Map<SkillFamilyId, Acc>();
  for (const fam of SKILL_FAMILIES) byFamily.set(fam.id, emptyAcc());

  for (const row of rows) {
    const acc = byFamily.get(familyForSkill(row.skill));
    if (!acc) continue;
    acc.released += clampCount(row.released);
    acc.with_irt_params += clampCount(row.with_irt_params);
    acc.with_empirical_data += clampCount(row.with_empirical_data);
    acc.refit_ready += clampCount(row.refit_ready);
  }

  const totals = emptyAcc();
  const families: FamilyCalibrationCoverage[] = [];
  for (const fam of SKILL_FAMILIES) {
    const acc = byFamily.get(fam.id);
    if (!acc) continue;
    const released = acc.released;
    const withIrt = Math.min(acc.with_irt_params, released);
    const withEmpirical = Math.min(acc.with_empirical_data, released);
    const refitReady = Math.min(acc.refit_ready, released);
    totals.released += released;
    totals.with_irt_params += withIrt;
    totals.with_empirical_data += withEmpirical;
    totals.refit_ready += refitReady;
    families.push({
      family: fam.id,
      family_name: familyName(fam.id),
      released,
      with_irt_params: withIrt,
      with_empirical_data: withEmpirical,
      refit_ready: refitReady,
      irt_params_pct: coveragePct(withIrt, released),
      empirical_pct: coveragePct(withEmpirical, released),
      refit_ready_pct: coveragePct(refitReady, released),
    });
  }

  families.sort((a, b) => b.released - a.released || a.family.localeCompare(b.family));

  return {
    families,
    totals: {
      released: totals.released,
      with_irt_params: totals.with_irt_params,
      with_empirical_data: totals.with_empirical_data,
      refit_ready: totals.refit_ready,
      irt_params_pct: coveragePct(totals.with_irt_params, totals.released),
      empirical_pct: coveragePct(totals.with_empirical_data, totals.released),
      refit_ready_pct: coveragePct(totals.refit_ready, totals.released),
    },
    generated_at: now.toISOString(),
  };
}
