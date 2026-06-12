// N11 candidate-UX: pure presenter that decides whether the runner should show a
// low-time warning banner as a timed attempt nears its deadline. It complements
// the existing header countdown (which already turns red under 60s) by surfacing
// an explicit, accessible banner so a candidate who is heads-down on a question
// is not surprised by the auto-submit at expiry.
//
// Pure -- no React, no DOM, no fetch -- so it is unit-testable in CI. It only ever
// touches timing values (never a response body, score, or question content) and
// is defensive: untimed attempts, non-finite inputs, or non-positive limits all
// degrade to a silent "none" level rather than throwing.

export type TimeWarningLevel = 'none' | 'warning' | 'critical';

export interface TimeWarning {
  level: TimeWarningLevel;
  /** Human-readable banner text, or null when level is 'none'. */
  message: string | null;
  /** Remaining seconds, clamped to >= 0, for callers that want to render it. */
  remainingSec: number;
}

// Show the amber warning at 2 minutes, escalate to the red critical band at 1
// minute. Critical mirrors the existing sub-60s red countdown colour.
export const WARNING_THRESHOLD_SEC = 120;
export const CRITICAL_THRESHOLD_SEC = 60;

const NONE: TimeWarning = { level: 'none', message: null, remainingSec: 0 };

function intOrNull(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.trunc(value);
}

function fmt(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m <= 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

/**
 * Decide the warning level for the runner banner.
 *
 * - Untimed attempts (`timeLimitSec` missing or <= 0) never warn.
 * - A non-finite or negative `remainingSec` degrades to 'none'.
 * - remaining <= CRITICAL_THRESHOLD_SEC -> 'critical' (auto-submit imminent).
 * - remaining <= WARNING_THRESHOLD_SEC  -> 'warning'.
 * - otherwise 'none'.
 *
 * The critical threshold is clamped so it can never exceed the warning
 * threshold even if the constants are edited inconsistently.
 */
export function buildTimeWarning(remainingSec: unknown, timeLimitSec?: unknown): TimeWarning {
  const limit = intOrNull(timeLimitSec);
  if (limit !== null && limit <= 0) return NONE; // explicitly untimed

  const remRaw = intOrNull(remainingSec);
  if (remRaw === null || remRaw < 0) return NONE;

  const critical = Math.min(CRITICAL_THRESHOLD_SEC, WARNING_THRESHOLD_SEC);

  if (remRaw <= critical) {
    return {
      level: 'critical',
      message: `Less than ${fmt(remRaw)} left -- your attempt will submit automatically when the timer reaches zero.`,
      remainingSec: remRaw,
    };
  }
  if (remRaw <= WARNING_THRESHOLD_SEC) {
    return {
      level: 'warning',
      message: `About ${fmt(remRaw)} remaining. Finish and review your answers before time runs out.`,
      remainingSec: remRaw,
    };
  }
  return { level: 'none', message: null, remainingSec: remRaw };
}
