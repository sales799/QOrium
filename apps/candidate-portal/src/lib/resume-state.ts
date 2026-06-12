// N11 resume-after-disconnect: pure presenter that turns the sanitized attempt
// state returned by readybank's GET /v1/attempts/:id/state into a plan the
// candidate-portal runner can act on when it (re)mounts — e.g. after a refresh,
// a dropped connection, or the candidate reopening the tab.
//
// The endpoint is leak-safe by construction (only positions / counts / status /
// time, never a response body, score, correctness flag, or question content), so
// this presenter likewise only ever touches positions, counts, timing and status.
// It is pure — no React, no fetch, no DOM — so it is unit-testable in CI, and it
// is defensive: any missing, non-numeric, or out-of-range field degrades to a
// safe fresh-start plan rather than throwing.

export interface AttemptStateResponse {
  status?: unknown;
  total_questions?: unknown;
  current_idx?: unknown;
  answered_count?: unknown;
  answered_indices?: unknown;
  resume_idx?: unknown;
  remaining_sec?: unknown;
  time_limit_sec?: unknown;
  expired?: unknown;
}

export interface ResumePlan {
  /** True when a usable state was parsed; false means "behave exactly as a fresh start". */
  ok: boolean;
  /** Question index the runner should open on (0-based, clamped into range). */
  startIdx: number;
  /**
   * Seconds left on the clock, or null when the attempt is untimed or the value
   * could not be parsed. When null the runner keeps its own default countdown
   * (the invitation time limit) instead of overriding it.
   */
  remainingSec: number | null;
  /** The attempt is already over (timer elapsed or status terminal) — finalize, do not resume. */
  expired: boolean;
  answeredCount: number;
  /** Positions (0-based) that already have a saved answer, sorted unique. */
  answeredIndices: number[];
  totalQuestions: number;
}

const FRESH: ResumePlan = {
  ok: false,
  startIdx: 0,
  remainingSec: null,
  expired: false,
  answeredCount: 0,
  answeredIndices: [],
  totalQuestions: 0,
};

// Statuses at which the test is finished and must not be re-entered for answering.
const TERMINAL_STATUSES = new Set(['submitted', 'graded', 'grading', 'expired', 'cancelled']);

function intOrNull(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.trunc(value);
}

/**
 * Build the runner's resume plan from the attempt-state payload.
 *
 * - A null / non-object payload (or an unparseable total) returns FRESH so the
 *   runner opens question 0 with its default clock — i.e. no behavioural change.
 * - `expired` is true when the API flags `expired`, or when the status is
 *   terminal; the runner should finalize rather than resume.
 * - `startIdx` prefers the API's `resume_idx` (first unanswered position). When
 *   every question is answered (`resume_idx >= total`) it lands on the last
 *   question so the candidate can review and submit. It is always clamped into
 *   `[0, total - 1]`.
 * - `remainingSec` is surfaced only when a finite, non-negative number is
 *   present; untimed attempts (null) leave the runner's default untouched.
 */
export function buildResumePlan(view: AttemptStateResponse | null | undefined): ResumePlan {
  if (!view || typeof view !== 'object') return FRESH;

  const total = intOrNull(view.total_questions);
  if (total === null || total <= 0) return FRESH;

  const lastIdx = total - 1;
  const status = typeof view.status === 'string' ? view.status.toLowerCase() : '';
  const remainingRaw = intOrNull(view.remaining_sec);
  const remainingSec = remainingRaw !== null && remainingRaw >= 0 ? remainingRaw : null;
  const expired = view.expired === true || TERMINAL_STATUSES.has(status);

  // Prefer resume_idx (first unanswered); fall back to the persisted cursor.
  let target = intOrNull(view.resume_idx);
  if (target === null) target = intOrNull(view.current_idx);
  if (target === null) target = 0;
  // resume_idx === total means "all answered" — land on the final question.
  const startIdx = Math.max(0, Math.min(target, lastIdx));

  const answeredCount = Math.max(0, intOrNull(view.answered_count) ?? 0);
  const answeredIndices = parseAnsweredIndices(view.answered_indices, total);

  return {
    ok: true,
    startIdx,
    remainingSec,
    expired,
    answeredCount,
    answeredIndices,
    totalQuestions: total,
  };
}

/**
 * Parse the leak-safe `answered_indices` array: keep only finite integers in
 * `[0, total - 1]`, de-duplicated and sorted ascending. Any non-array or
 * malformed entry is dropped, never thrown.
 */
function parseAnsweredIndices(value: unknown, total: number): number[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<number>();
  for (const raw of value) {
    const i = intOrNull(raw);
    if (i !== null && i >= 0 && i < total) seen.add(i);
  }
  return Array.from(seen).sort((a, b) => a - b);
}

/**
 * Whole-number completion percentage (0..100) for the runner's progress
 * affordance. Defensive: a non-positive total or non-finite input yields a
 * clamped 0..100 result, never NaN.
 */
export function progressPercent(answered: number, total: number): number {
  if (!Number.isFinite(answered) || !Number.isFinite(total) || total <= 0) return 0;
  const t = Math.trunc(total);
  const a = Math.max(0, Math.min(Math.trunc(answered), t));
  return Math.round((a / t) * 100);
}
