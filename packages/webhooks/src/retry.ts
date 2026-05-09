/**
 * Sprint 4.5 v0 — Webhook delivery retry schedule per spec §6.
 *
 *   Attempt 1: immediate
 *   Attempt 2: 1 minute delay
 *   Attempt 3: 5 minutes delay
 *   Attempt 4: 30 minutes delay
 *   Attempt 5: 4 hours delay
 *   Attempt 6: 24 hours delay
 *   Max age:   35 hours total
 *
 * After attempt 6, the delivery is moved to dead-letter
 * (`webhooks.deliveries.status = 'failed'`).
 */

export const RETRY_SCHEDULE_SECONDS: readonly number[] = Object.freeze([
  0, // attempt 1: immediate
  60, // attempt 2: 1 min
  5 * 60, // attempt 3: 5 min
  30 * 60, // attempt 4: 30 min
  4 * 60 * 60, // attempt 5: 4 hr
  24 * 60 * 60, // attempt 6: 24 hr
]);

export const MAX_ATTEMPTS = RETRY_SCHEDULE_SECONDS.length;
export const MAX_DELIVERY_AGE_SECONDS = 35 * 60 * 60;

/**
 * Compute the next retry timestamp given the current attempt count.
 * Returns null when the delivery has exhausted all retries (caller moves
 * to dead-letter).
 *
 * `attemptsCompleted` is the count of failed attempts so far (0 means
 * "never tried"; on first failure call with 1; etc.).
 */
export function computeNextRetryAt(
  attemptsCompleted: number,
  baseTime: Date = new Date(),
): Date | null {
  if (attemptsCompleted < 0) {
    throw new RangeError('attemptsCompleted must be ≥ 0');
  }
  if (attemptsCompleted >= MAX_ATTEMPTS) return null;
  const delaySec = RETRY_SCHEDULE_SECONDS[attemptsCompleted]!;
  return new Date(baseTime.getTime() + delaySec * 1000);
}

/**
 * Whether a delivery initiated at `eventCreatedAt` is still within the
 * 35-hour delivery window. Once outside, even retryable failures move
 * to dead-letter.
 */
export function isWithinRetryWindow(eventCreatedAt: Date, now: Date = new Date()): boolean {
  const ageSec = (now.getTime() - eventCreatedAt.getTime()) / 1000;
  return ageSec <= MAX_DELIVERY_AGE_SECONDS;
}
