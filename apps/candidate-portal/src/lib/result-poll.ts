// N11 candidate UX: decide whether the result page should auto-refresh while
// grading is still in progress. Pure + deterministic so it is unit-testable
// without a DOM. The result page renders the auto-refresh component only when
// the attempt is not yet graded; this helper bounds how long we keep checking
// so a stuck/ungraded attempt does not poll forever.

export const DEFAULT_MAX_POLLS = 6;
export const DEFAULT_DELAY_MS = 8_000;

export interface PollDecision {
  /** Whether to schedule another refresh. */
  poll: boolean;
  /** Delay before the next refresh, in milliseconds. */
  delayMs: number;
  /** 1-based number of the refresh just scheduled (0 when not polling). */
  attempt: number;
}

/**
 * Given how many refreshes have already happened, decide whether to schedule
 * one more and after how long. `attemptsDone` is the count of refreshes already
 * fired (0 on first mount).
 */
export function nextPoll(
  attemptsDone: number,
  maxPolls: number = DEFAULT_MAX_POLLS,
  delayMs: number = DEFAULT_DELAY_MS,
): PollDecision {
  const done = Number.isFinite(attemptsDone) && attemptsDone > 0 ? Math.floor(attemptsDone) : 0;
  const cap = Number.isFinite(maxPolls) && maxPolls > 0 ? Math.floor(maxPolls) : 0;
  if (done >= cap) {
    return { poll: false, delayMs: 0, attempt: 0 };
  }
  return { poll: true, delayMs: Math.max(0, delayMs), attempt: done + 1 };
}
