// N11 candidate-UX (WCAG AA): pure presenter that builds a single, concise
// screen-reader status line for the attempt runner. The visible runner already
// shows "Question N / M", a countdown, an answered-progress bar, and a low-time
// alert -- but a non-sighted candidate navigating between questions never gets a
// consolidated spoken announcement of WHERE they are. This closes WCAG 2.1
// SC 4.1.3 (Status Messages) + SC 1.3.1 (Info & Relationships) by feeding a
// visually-hidden aria-live="polite" region in the runner.
//
// Pure -- no React, no DOM, no fetch -- so it is unit-testable in CI. It is
// deliberately leak-safe: it only ever describes POSITION, the question FORMAT
// (a human label, never the prompt body), and ANSWERED status. It never carries
// a response body, score, correctness flag, or any question content.
//
// Timing is intentionally excluded: the runner re-announces only on question
// (or answered-state) change, so folding the per-second countdown in here would
// turn the polite live region into a once-a-second screen-reader spam machine.
// Time urgency is already handled by the dedicated role="alert" warning banner.

export interface A11yStatusArgs {
  /** Zero-based index of the current question. */
  idx: number;
  /** Total questions in the attempt. */
  total: number;
  /** Raw question format string (e.g. "mcq", "sql"); mapped to a spoken label. */
  format?: string | null;
  /** Whether the current question already has a saved response. */
  answered: boolean;
}

/**
 * Map a raw question format string to a screen-reader-friendly label.
 * Unknown / missing formats degrade to the generic "question" so the
 * announcement is always grammatical.
 */
export function formatLabelFor(format: string | null | undefined): string {
  const f = (format ?? '').trim().toLowerCase();
  if (!f) return 'question';
  if (f.includes('code') || f === 'sql') return 'coding question';
  if (f === 'msq') return 'multiple select question';
  if (f === 'mcq' || f.startsWith('mcq') || f === 'sjt-mcq') return 'multiple choice question';
  if (f === 'text' || f === 'essay' || f === 'short-answer' || f.includes('text')) {
    return 'written response question';
  }
  return 'question';
}

function intOrNull(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.trunc(value);
}

/**
 * Build the spoken status line, e.g.
 *   "Question 3 of 10, coding question, not yet answered."
 *
 * Defensive by construction:
 * - A non-finite or non-positive `total` yields '' (nothing to announce).
 * - `idx` is clamped to the inclusive 1..total human position, so an out-of-range
 *   or negative index never produces "Question 0 of 10" or "Question 11 of 10".
 */
export function buildA11yStatus(args: A11yStatusArgs): string {
  const total = intOrNull(args.total);
  if (total === null || total <= 0) return '';

  const idx = intOrNull(args.idx) ?? 0;
  const pos = Math.min(Math.max(idx + 1, 1), total);

  const label = formatLabelFor(args.format);
  const answered = args.answered ? 'answered' : 'not yet answered';

  return `Question ${pos} of ${total}, ${label}, ${answered}.`;
}
