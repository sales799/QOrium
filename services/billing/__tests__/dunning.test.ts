import { describe, expect, it } from 'vitest';
import { CANCEL_AFTER_DAYS, RETRY_SCHEDULE_DAYS, evaluateDunning } from '../src/dunning';

describe('evaluateDunning', () => {
  it('keeps an open invoice within the grace period', () => {
    const out = evaluateDunning({ status: 'open', daysSinceIssued: 1, failedAttempts: 0 });
    expect(out.nextStatus).toBe('open');
    expect(out.retryInDays).toBe(null);
  });

  it('moves to past_due after 3 days unpaid', () => {
    const out = evaluateDunning({ status: 'open', daysSinceIssued: 4, failedAttempts: 0 });
    expect(out.nextStatus).toBe('past_due');
    expect(out.retryInDays).toBe(RETRY_SCHEDULE_DAYS[0]);
  });

  it('cycles through the retry schedule on repeated failures', () => {
    const out = evaluateDunning({ status: 'past_due', daysSinceIssued: 5, failedAttempts: 1 });
    expect(out.retryInDays).toBe(RETRY_SCHEDULE_DAYS[1]);
  });

  it('caps at the longest retry slot for many failed attempts', () => {
    const out = evaluateDunning({
      status: 'past_due',
      daysSinceIssued: 5,
      failedAttempts: 99,
    });
    expect(out.retryInDays).toBe(RETRY_SCHEDULE_DAYS[RETRY_SCHEDULE_DAYS.length - 1]);
  });

  it(`cancels after ${CANCEL_AFTER_DAYS} days`, () => {
    const out = evaluateDunning({
      status: 'past_due',
      daysSinceIssued: CANCEL_AFTER_DAYS,
      failedAttempts: 3,
    });
    expect(out.nextStatus).toBe('canceled');
    expect(out.retryInDays).toBe(null);
  });

  it('is a no-op for paid invoices', () => {
    const out = evaluateDunning({ status: 'paid', daysSinceIssued: 100, failedAttempts: 0 });
    expect(out.nextStatus).toBe('paid');
    expect(out.retryInDays).toBe(null);
  });

  it('is a no-op for refunded invoices', () => {
    const out = evaluateDunning({ status: 'refunded', daysSinceIssued: 100, failedAttempts: 0 });
    expect(out.nextStatus).toBe('refunded');
  });
});
