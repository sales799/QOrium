/**
 * Dunning state machine per `infra/Billing-Service-v0-Spec.md` §8.
 *
 * State transitions:
 *   open → past_due (after 3 days unpaid)
 *   past_due → past_due (retry up to 3 times)
 *   past_due → canceled (after 14 days unpaid)
 *   open → paid (on captured payment)
 *
 * Pure logic — caller persists the new state + scheduled-retry-at.
 */

export type InvoiceStatus =
  | 'draft'
  | 'open'
  | 'paid'
  | 'void'
  | 'failed'
  | 'refunded'
  | 'past_due'
  | 'canceled';

export interface DunningInputs {
  status: InvoiceStatus;
  daysSinceIssued: number;
  failedAttempts: number;
  /** Override `now` for tests (currently unused but reserved). */
  now?: () => Date;
}

export interface DunningDecision {
  /** New invoice status. */
  nextStatus: InvoiceStatus;
  /** Days from now to retry payment, or null if no retry. */
  retryInDays: number | null;
  /** Customer-facing message for the dunning email. */
  message: string;
}

export const RETRY_SCHEDULE_DAYS = [3, 7, 14] as const;
export const CANCEL_AFTER_DAYS = 14;

export function evaluateDunning(inputs: DunningInputs): DunningDecision {
  if (inputs.status === 'paid' || inputs.status === 'void' || inputs.status === 'refunded') {
    return { nextStatus: inputs.status, retryInDays: null, message: 'no action required' };
  }
  if (inputs.daysSinceIssued >= CANCEL_AFTER_DAYS) {
    return {
      nextStatus: 'canceled',
      retryInDays: null,
      message: 'invoice canceled — subscription will be paused',
    };
  }
  if (inputs.daysSinceIssued >= 3) {
    const idx = Math.min(inputs.failedAttempts, RETRY_SCHEDULE_DAYS.length - 1);
    const retryInDays =
      RETRY_SCHEDULE_DAYS[idx] ?? RETRY_SCHEDULE_DAYS[RETRY_SCHEDULE_DAYS.length - 1] ?? 14;
    return {
      nextStatus: 'past_due',
      retryInDays,
      message: 'invoice past due — payment will be retried',
    };
  }
  return { nextStatus: 'open', retryInDays: null, message: 'invoice open — within grace period' };
}
