/**
 * SO-9 Anti-Leak Continuous Operation policy (pure logic).
 *
 * Constitution v2.0 §SO-9:
 *   "Anti-Leak Engine runs 24/7 with 24-hour-or-better detect-and-rotate
 *    cycle for Critical-severity leaks. ... High-severity leaks rotate
 *    within 7 days. No question deemed Critical-severity-leaked remains
 *    in active library beyond the rotation SLA."
 *
 * This module decides, given a leak alert + the current time, whether
 * the affected question must be rotated. It does NOT touch the database;
 * see `repository.ts` for the SQL layer and `runner.ts` for the loop.
 */

export type LeakSeverity = 'low' | 'medium' | 'high' | 'critical';
export type LeakStatus = 'detected' | 'under_review' | 'rotated' | 'dismissed' | 'false_positive';

export interface LeakAlert {
  id: string;
  questionId: string;
  severity: LeakSeverity;
  similarityScore: number;
  status: LeakStatus;
  detectedAt: string;
  sourceUrl: string;
  sourceType: string | null;
}

export interface RotationDecision {
  rotate: boolean;
  /** When the SLA threshold was/will be crossed. */
  slaCutoff: string;
  /** Why we did or did not rotate. */
  reason:
    | 'within_sla'
    | 'sla_breached'
    | 'severity_below_threshold'
    | 'already_handled'
    | 'similarity_below_confidence_floor';
}

/**
 * SO-9 SLA windows by severity.
 * - Critical: 24 hours (Adaface-benchmark parity)
 * - High:     7 days
 * - Medium / Low: not auto-rotated; queued for SME review only
 */
export const SLA_HOURS: Readonly<Record<LeakSeverity, number | null>> = {
  critical: 24,
  high: 7 * 24,
  medium: null,
  low: null,
};

/**
 * Confidence floor — below this similarity score, we never auto-rotate
 * even at Critical severity. The crawler's similarity model is
 * imperfect; we want SME review on borderline cases. Per CTO Office
 * default; tunable via env var in `runner.ts`.
 */
export const DEFAULT_CONFIDENCE_FLOOR = 0.85;

export interface DecisionInputs {
  alert: LeakAlert;
  /** ms since epoch — defaults to Date.now() in production. */
  now?: number;
  /** Override the confidence floor for this decision. */
  confidenceFloor?: number;
}

/**
 * Decide whether the given alert should trigger rotation right now.
 * Pure: no I/O, deterministic.
 */
export function decideRotation(inputs: DecisionInputs): RotationDecision {
  const { alert, now = Date.now(), confidenceFloor = DEFAULT_CONFIDENCE_FLOOR } = inputs;
  const slaHours = SLA_HOURS[alert.severity];
  const detectedMs = Date.parse(alert.detectedAt);
  const slaCutoffMs = slaHours === null ? Infinity : detectedMs + slaHours * 3_600_000;
  const slaCutoff = slaHours === null ? 'n/a' : new Date(slaCutoffMs).toISOString();

  // Already handled — never re-rotate.
  if (alert.status !== 'detected' && alert.status !== 'under_review') {
    return { rotate: false, slaCutoff, reason: 'already_handled' };
  }

  // Severity below auto-rotate threshold.
  if (slaHours === null) {
    return { rotate: false, slaCutoff, reason: 'severity_below_threshold' };
  }

  // Borderline similarity — queue for SME review, don't auto-rotate.
  if (alert.similarityScore < confidenceFloor) {
    return { rotate: false, slaCutoff, reason: 'similarity_below_confidence_floor' };
  }

  // Within SLA — let it ride; the engine will check again on the next tick.
  if (now < slaCutoffMs) {
    return { rotate: false, slaCutoff, reason: 'within_sla' };
  }

  // Past SLA cutoff — rotate.
  return { rotate: true, slaCutoff, reason: 'sla_breached' };
}

/**
 * Filter a batch of alerts down to the ones requiring rotation right now.
 * Used by the runner's per-tick scan.
 */
export function selectAlertsForRotation(
  alerts: ReadonlyArray<LeakAlert>,
  now: number = Date.now(),
  confidenceFloor: number = DEFAULT_CONFIDENCE_FLOOR,
): ReadonlyArray<LeakAlert> {
  return alerts.filter((alert) => decideRotation({ alert, now, confidenceFloor }).rotate);
}

/**
 * Returns hours-of-rotation-budget remaining for an alert. Useful for
 * dashboard visibility. Negative = SLA already breached (rotate now).
 * `null` = severity not auto-rotated.
 */
export function hoursUntilSlaBreach(alert: LeakAlert, now: number = Date.now()): number | null {
  const slaHours = SLA_HOURS[alert.severity];
  if (slaHours === null) return null;
  const detectedMs = Date.parse(alert.detectedAt);
  const slaCutoffMs = detectedMs + slaHours * 3_600_000;
  return (slaCutoffMs - now) / 3_600_000;
}
