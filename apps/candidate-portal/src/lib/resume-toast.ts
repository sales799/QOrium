// N11 resume toast: pure presenter that turns a ResumePlan (from
// buildResumePlan) into a one-line, screen-reader-announceable notice shown
// when the candidate genuinely resumes a partially-answered attempt after a
// refresh or dropped connection.
//
// Pure — no React, no DOM, no fetch — so it is unit-testable in CI. It only
// ever touches positions / counts / timing already present in the leak-safe
// ResumePlan; it never reads a response body, score, correctness flag, or
// question content. It degrades to { show:false } for fresh starts, expired
// attempts, a null/garbage plan, or any plan with nothing answered yet (there
// is nothing to "resume" until at least one answer exists).

import type { ResumePlan } from './resume-state';

export interface ResumeToast {
  /** True only when the runner should announce a resume. */
  show: boolean;
  /** Polite, PII-free announcement, e.g. "Resumed where you left off — question 3 of 10, 04:05 left." */
  message: string;
}

const HIDDEN: ResumeToast = { show: false, message: '' };

function intOrZero(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.trunc(value));
}

function formatClock(totalSec: number): string {
  const safe = Math.max(0, Math.trunc(totalSec));
  const mm = String(Math.floor(safe / 60)).padStart(2, '0');
  const ss = String(safe % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

/**
 * Build the resume-toast view model from a ResumePlan.
 *
 * - Hidden unless `plan.ok` is true, the attempt is not `expired`, and at least
 *   one answer already exists (`answeredCount > 0`) — a fresh start announces
 *   nothing.
 * - The position is `startIdx + 1` (1-based), clamped to `[1, totalQuestions]`
 *   when a positive total is known.
 * - The time clause is "mm:ss left" when a finite, non-negative `remainingSec`
 *   is present, otherwise "no time limit" (untimed or unparseable clock).
 */
export function buildResumeToast(plan: ResumePlan | null | undefined): ResumeToast {
  if (!plan || typeof plan !== 'object') return HIDDEN;
  if (!plan.ok || plan.expired) return HIDDEN;

  const answered = intOrZero(plan.answeredCount);
  if (answered <= 0) return HIDDEN;

  const total = intOrZero(plan.totalQuestions);
  const rawPosition = intOrZero(plan.startIdx) + 1;
  const position = total > 0 ? Math.min(Math.max(rawPosition, 1), total) : Math.max(rawPosition, 1);
  const where = total > 0 ? `question ${position} of ${total}` : `question ${position}`;

  const timePart =
    typeof plan.remainingSec === 'number' &&
    Number.isFinite(plan.remainingSec) &&
    plan.remainingSec >= 0
      ? `${formatClock(plan.remainingSec)} left`
      : 'no time limit';

  return { show: true, message: `Resumed where you left off — ${where}, ${timePart}.` };
}
