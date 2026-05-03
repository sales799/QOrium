/**
 * Exponential-backoff retry schedule per `infra/Webhooks-Service-v0-Spec.md` §6.
 *
 *   Attempt 1: immediate
 *   Attempt 2: 1 minute
 *   Attempt 3: 5 minutes
 *   Attempt 4: 30 minutes
 *   Attempt 5: 4 hours
 *   Attempt 6: 24 hours
 *   Max age: 35 hours total
 *
 * Pure logic. The delivery worker calls `nextAttempt(attemptCount)` to
 * decide when to retry.
 */

export const ATTEMPT_DELAYS_MS: ReadonlyArray<number> = [
  0,
  1 * 60 * 1_000,
  5 * 60 * 1_000,
  30 * 60 * 1_000,
  4 * 60 * 60 * 1_000,
  24 * 60 * 60 * 1_000,
];

export const MAX_ATTEMPTS = ATTEMPT_DELAYS_MS.length;
export const MAX_AGE_MS = 35 * 60 * 60 * 1_000;

export interface NextAttemptInputs {
  attemptCount: number;
  firstAttemptAt: number; // unix ms
  now?: () => number;
}

export interface NextAttemptDecision {
  kind: 'retry' | 'abandon';
  /** When to attempt next (unix ms). Only meaningful when kind === 'retry'. */
  retryAt?: number;
  reason?: string;
}

export function nextAttempt(inputs: NextAttemptInputs): NextAttemptDecision {
  const now = inputs.now ? inputs.now() : Date.now();
  if (inputs.attemptCount >= MAX_ATTEMPTS) {
    return { kind: 'abandon', reason: `max attempts (${MAX_ATTEMPTS}) reached` };
  }
  if (now - inputs.firstAttemptAt >= MAX_AGE_MS) {
    return { kind: 'abandon', reason: `max age (${MAX_AGE_MS / 3_600_000}h) reached` };
  }
  const delay =
    ATTEMPT_DELAYS_MS[inputs.attemptCount] ?? ATTEMPT_DELAYS_MS[ATTEMPT_DELAYS_MS.length - 1] ?? 0;
  return { kind: 'retry', retryAt: now + delay };
}

/**
 * HTTP status → terminal? Spec §6: 200–299 success, 4xx (except 429) +
 * timeout = terminal, 5xx + 429 = retry.
 */
export function classifyHttpStatus(status: number): 'success' | 'retry' | 'permanent' {
  if (status >= 200 && status < 300) return 'success';
  if (status === 429 || status >= 500) return 'retry';
  return 'permanent';
}
