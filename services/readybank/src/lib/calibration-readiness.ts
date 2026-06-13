// Pure per-skill-family calibration READINESS tiering for the calibration-volume
// program (N19).
//
// The sibling lib/calibration-backlog.ts answers a binary question — of the
// calibration-ELIGIBLE items (released AND carrying an IRT difficulty param),
// how many have ZERO empirical responses (cold) vs any (seeded). But "seeded"
// is a low bar: an item with a single empirical response counts as seeded even
// though it is nowhere near reliably calibrated. The canonical reliability bar
// established across the psychometrics surface is the BR-4 IRT-refit threshold,
// calibration_n >= 30 (see lib/psychometrics-coverage.ts and
// lib/psychometrics-jsonld.ts). An operator deciding where to direct the next
// batch of real responses needs the three-way split, not the binary one:
//
//   - cold       : calibratable items with calibration_n == 0
//   - thin       : calibratable items with 0 < calibration_n < 30
//   - calibrated : calibratable items with calibration_n >= 30 (refit-ready)
//
// The actionable backlog is needs_responses = cold + thin (everything short of
// the refit threshold), which the cold-only backlog view misses entirely: a
// family whose items all sit at calibration_n == 1 shows cold_backlog 0 in the
// backlog report ("nothing to do") yet has zero calibrated items here. Families
// are emitted worst-first by needs_responses so seeding effort targets the
// families furthest from a usable calibration.
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

/**
 * BR-4 IRT-refit threshold: empirical responses an item needs before its IRT
 * parameters can be reliably re-fit. Mirrors the calibration_n >= 30 bar used
 * by the public psychometrics coverage surface so every calibration view
 * reconciles on the same definition of "calibrated".
 */
export const REFIT_THRESHOLD = 30;

/** Raw released-item counts for a single skill, pulled by the repository. */
export interface SkillReadinessRow {
  /** content.skills.name — mapped to a family via familyForSkill(). */
  skill: string;
  /** Released, readybank-SKU questions for this skill. */
  released: number;
  /** Of those, how many carry an IRT difficulty parameter (calibratable). */
  with_irt_params: number;
  /** Of the calibratable items, how many have calibration_n >= REFIT_THRESHOLD. */
  refit_ready: number;
  /** Of the calibratable items, how many have 0 < calibration_n < REFIT_THRESHOLD. */
  thin: number;
}

export interface FamilyCalibrationReadiness {
  family: SkillFamilyId;
  family_name: string;
  /** Released readybank items in this family. */
  released: number;
  /** Of those, how many are calibration-eligible (carry an IRT param). */
  calibratable: number;
  /** Of the calibratable items, how many have calibration_n >= REFIT_THRESHOLD. */
  calibrated: number;
  /** Of the calibratable items, how many have 0 < calibration_n < REFIT_THRESHOLD. */
  thin: number;
  /** Of the calibratable items, how many have calibration_n == 0. */
  cold: number;
  /** Calibratable items short of the refit threshold: cold + thin. */
  needs_responses: number;
  /** Calibrated share of calibratable items, integer 0–100 (higher = readier). */
  calibrated_pct: number;
}

export interface CalibrationReadinessReport {
  /** The refit threshold this report tiers against, echoed for clients. */
  refit_threshold: number;
  families: FamilyCalibrationReadiness[];
  totals: {
    released: number;
    calibratable: number;
    calibrated: number;
    thin: number;
    cold: number;
    needs_responses: number;
    calibrated_pct: number;
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
  calibrated: number;
  thin: number;
}

function emptyAcc(): Acc {
  return { released: 0, calibratable: 0, calibrated: 0, thin: 0 };
}

/**
 * Fold raw per-skill counts into the 13 canonical families and tier each
 * family's calibratable items into calibrated / thin / cold. Every family is
 * present even with zero released items, so a family with nothing to calibrate
 * (calibrated_pct 0, needs_responses 0) reads distinctly from a fully cold
 * family (calibrated_pct 0, needs_responses == calibratable). Sub-counts are
 * clamped against each other so the tiers never overlap or go negative:
 * refit_ready and thin are each capped at calibratable, then thin is further
 * capped at (calibratable - calibrated) so calibrated + thin <= calibratable,
 * and cold is the remainder (calibratable - calibrated - thin) — never below 0.
 * Result is sorted by needs_responses descending (largest seeding opportunity
 * first), tie-broken by family id for deterministic output.
 */
export function computeCalibrationReadiness(
  rows: SkillReadinessRow[],
  now: Date = new Date(),
): CalibrationReadinessReport {
  const byFamily = new Map<SkillFamilyId, Acc>();
  for (const fam of SKILL_FAMILIES) byFamily.set(fam.id, emptyAcc());

  for (const row of rows) {
    const acc = byFamily.get(familyForSkill(row.skill));
    if (!acc) continue;
    const released = clampCount(row.released);
    // A sub-count can never exceed its enclosing count: calibratable <= released.
    const calibratable = Math.min(clampCount(row.with_irt_params), released);
    // calibrated <= calibratable; thin <= remaining room after calibrated, so
    // calibrated + thin <= calibratable and the cold remainder is never negative.
    const calibrated = Math.min(clampCount(row.refit_ready), calibratable);
    const thin = Math.min(clampCount(row.thin), calibratable - calibrated);
    acc.released += released;
    acc.calibratable += calibratable;
    acc.calibrated += calibrated;
    acc.thin += thin;
  }

  const totals = emptyAcc();
  const families: FamilyCalibrationReadiness[] = [];
  for (const fam of SKILL_FAMILIES) {
    const acc = byFamily.get(fam.id);
    if (!acc) continue;
    const cold = acc.calibratable - acc.calibrated - acc.thin;
    const needsResponses = cold + acc.thin;
    totals.released += acc.released;
    totals.calibratable += acc.calibratable;
    totals.calibrated += acc.calibrated;
    totals.thin += acc.thin;
    families.push({
      family: fam.id,
      family_name: familyName(fam.id),
      released: acc.released,
      calibratable: acc.calibratable,
      calibrated: acc.calibrated,
      thin: acc.thin,
      cold,
      needs_responses: needsResponses,
      calibrated_pct: coveragePct(acc.calibrated, acc.calibratable),
    });
  }

  families.sort(
    (a, b) => b.needs_responses - a.needs_responses || a.family.localeCompare(b.family),
  );

  const totalCold = totals.calibratable - totals.calibrated - totals.thin;
  const totalNeeds = totalCold + totals.thin;
  return {
    refit_threshold: REFIT_THRESHOLD,
    families,
    totals: {
      released: totals.released,
      calibratable: totals.calibratable,
      calibrated: totals.calibrated,
      thin: totals.thin,
      cold: totalCold,
      needs_responses: totalNeeds,
      calibrated_pct: coveragePct(totals.calibrated, totals.calibratable),
    },
    generated_at: now.toISOString(),
  };
}
