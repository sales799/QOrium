// Pure shaping for the public psychometrics-coverage surface (N19 / N13).
//
// QOrium's positioning is "psychometrically-defensible": every released item
// should carry IRT parameters and accumulate real response data until it can be
// refit. This helper turns four raw bank counts into an honest, publishable
// coverage report — total released items, how many carry IRT parameters, how
// many have ANY empirical response data, and how many cross the BR-4 refit
// threshold (calibration_n >= 30) — plus integer coverage percentages.
//
// It is deliberately DB-free so it can be unit-tested exhaustively without a
// pool, and so the route stays a thin adapter over the repository counts.

/** Raw, non-negative bank counts pulled by the repository in one query. */
export interface PsychometricsCounts {
  /** Released, readybank-SKU questions available in the live bank. */
  questions_released: number;
  /** Released items with an IRT difficulty parameter (difficulty_b not null). */
  with_irt_params: number;
  /** Released items with any empirical response data (calibration_n > 0). */
  with_empirical_data: number;
  /** Released items past the BR-4 IRT-refit threshold (calibration_n >= 30). */
  refit_ready: number;
}

export interface PsychometricsCoverage extends PsychometricsCounts {
  /** Percent of released items carrying IRT parameters (0-100, rounded). */
  irt_params_pct: number;
  /** Percent of released items with any empirical response data (0-100). */
  empirical_pct: number;
  /** Percent of released items past the refit threshold (0-100). */
  refit_ready_pct: number;
  /** ISO timestamp the snapshot was shaped. */
  generated_at: string;
}

/** Clamp to a non-negative integer; treats NaN / negatives / junk as 0. */
function clampCount(v: number): number {
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
}

/**
 * Integer percentage of `part` out of `whole`, clamped to [0, 100]. A zero or
 * missing denominator yields 0 (never NaN or Infinity), and a numerator that
 * somehow exceeds the denominator is capped at 100 rather than reported as a
 * nonsensical >100% coverage figure.
 */
export function coveragePct(part: number, whole: number): number {
  const p = clampCount(part);
  const w = clampCount(whole);
  if (w === 0) return 0;
  return Math.min(100, Math.round((p / w) * 100));
}

/**
 * Shape raw bank counts into the public coverage report. Every count is
 * sanitized first so the published percentages are always well-formed even if
 * the upstream query returns nulls, negatives, or a sub-count that exceeds the
 * released total.
 */
export function computeCoverage(
  counts: PsychometricsCounts,
  now: Date = new Date(),
): PsychometricsCoverage {
  const released = clampCount(counts.questions_released);
  const withIrt = Math.min(clampCount(counts.with_irt_params), released);
  const withEmpirical = Math.min(clampCount(counts.with_empirical_data), released);
  const refitReady = Math.min(clampCount(counts.refit_ready), released);
  return {
    questions_released: released,
    with_irt_params: withIrt,
    with_empirical_data: withEmpirical,
    refit_ready: refitReady,
    irt_params_pct: coveragePct(withIrt, released),
    empirical_pct: coveragePct(withEmpirical, released),
    refit_ready_pct: coveragePct(refitReady, released),
    generated_at: now.toISOString(),
  };
}
