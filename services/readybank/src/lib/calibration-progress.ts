// Pure shaping for the PUBLIC calibration-progress surface (N19 / N13).
//
// The public /v1/proof/psychometrics surface already answers "how calibrated is
// the bank" (released items + IRT / empirical / refit coverage). What it does
// NOT expose publicly is the honest "actively calibrating" signal: of the items
// that are calibration-ELIGIBLE (released AND already carrying an IRT
// parameter), how many still have ZERO empirical responses — the cold backlog —
// versus how many are already seeded. The admin endpoints break this down per
// skill family; this helper distils it to a single aggregate, no-PII object
// suitable for an anonymous, edge-cacheable proof endpoint.
//
// It deliberately reuses the already-computed totals from the per-family
// CalibrationBacklogReport so the public aggregate reconciles exactly with the
// admin per-family view (same released + readybank universe, same shaping). It
// is DB-free so it can be unit-tested exhaustively without a pool, and so the
// route stays a thin adapter over the existing repository.

import { coveragePct } from './psychometrics-coverage.js';
import type { CalibrationBacklogReport } from './calibration-backlog.js';

export interface CalibrationProgress {
  /** Released, readybank-SKU questions in the live bank. */
  released: number;
  /** Of those, how many are calibration-eligible (carry an IRT parameter). */
  calibratable: number;
  /** Of the calibratable items, how many already have empirical response data. */
  seeded: number;
  /** Of the calibratable items, how many still have ZERO empirical data. */
  cold_backlog: number;
  /** Seeded share of calibratable items, integer 0-100 (higher = more progress). */
  seeded_pct: number;
  /** Un-seeded share of calibratable items, integer 0-100 (higher = colder). */
  cold_pct: number;
  /** ISO timestamp the snapshot was shaped. */
  generated_at: string;
}

/** Clamp to a non-negative integer; treats NaN / negatives / junk as 0. */
function clampCount(v: number): number {
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
}

/**
 * Distil a per-family CalibrationBacklogReport into a single public aggregate.
 * Every count is re-sanitized (the report totals are already clamped, but this
 * stays defensive so the public payload is well-formed regardless of upstream),
 * and sub-counts are capped so they never exceed the enclosing count:
 * seeded <= calibratable <= released, which keeps cold_backlog non-negative and
 * both percentages in [0, 100]. seeded_pct + cold_pct may not sum to exactly
 * 100 because each is independently rounded; that is intentional and matches
 * the coveragePct contract used across every calibration surface. The report's
 * own generated_at is carried through so the public snapshot timestamp matches
 * the admin one.
 */
export function computeCalibrationProgress(report: CalibrationBacklogReport): CalibrationProgress {
  const released = clampCount(report.totals.released);
  const calibratable = Math.min(clampCount(report.totals.calibratable), released);
  const seeded = Math.min(clampCount(report.totals.seeded), calibratable);
  const coldBacklog = calibratable - seeded;
  return {
    released,
    calibratable,
    seeded,
    cold_backlog: coldBacklog,
    seeded_pct: coveragePct(seeded, calibratable),
    cold_pct: coveragePct(coldBacklog, calibratable),
    generated_at: report.generated_at,
  };
}
