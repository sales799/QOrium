import { describe, expect, it } from 'vitest';
import {
  MAX_ATTEMPTS,
  MAX_DELIVERY_AGE_SECONDS,
  RETRY_SCHEDULE_SECONDS,
  computeNextRetryAt,
  isWithinRetryWindow,
} from '../src/retry.js';

describe('RETRY_SCHEDULE_SECONDS', () => {
  it('matches the spec §6 schedule', () => {
    expect(RETRY_SCHEDULE_SECONDS).toEqual([0, 60, 5 * 60, 30 * 60, 4 * 60 * 60, 24 * 60 * 60]);
  });

  it('exposes MAX_ATTEMPTS = schedule length', () => {
    expect(MAX_ATTEMPTS).toBe(RETRY_SCHEDULE_SECONDS.length);
    expect(MAX_ATTEMPTS).toBe(6);
  });

  it('exposes MAX_DELIVERY_AGE_SECONDS = 35 hours', () => {
    expect(MAX_DELIVERY_AGE_SECONDS).toBe(35 * 60 * 60);
  });
});

describe('computeNextRetryAt', () => {
  const base = new Date('2026-05-09T12:00:00Z');

  it('returns base for first attempt (immediate)', () => {
    expect(computeNextRetryAt(0, base)?.toISOString()).toBe(base.toISOString());
  });

  it('returns base + 60s for second attempt', () => {
    const next = computeNextRetryAt(1, base);
    expect(next?.getTime()).toBe(base.getTime() + 60_000);
  });

  it('returns base + 24h for sixth attempt', () => {
    const next = computeNextRetryAt(5, base);
    expect(next?.getTime()).toBe(base.getTime() + 24 * 60 * 60_000);
  });

  it('returns null after MAX_ATTEMPTS', () => {
    expect(computeNextRetryAt(MAX_ATTEMPTS, base)).toBeNull();
    expect(computeNextRetryAt(MAX_ATTEMPTS + 5, base)).toBeNull();
  });

  it('throws on negative attempt count', () => {
    expect(() => computeNextRetryAt(-1, base)).toThrow(RangeError);
  });
});

describe('isWithinRetryWindow', () => {
  it('returns true within 35 hours', () => {
    const created = new Date('2026-05-09T00:00:00Z');
    const now = new Date('2026-05-10T10:00:00Z'); // 34 hr later
    expect(isWithinRetryWindow(created, now)).toBe(true);
  });

  it('returns false beyond 35 hours', () => {
    const created = new Date('2026-05-09T00:00:00Z');
    const now = new Date('2026-05-10T12:00:00Z'); // 36 hr later
    expect(isWithinRetryWindow(created, now)).toBe(false);
  });

  it('returns true at exactly 35 hours', () => {
    const created = new Date('2026-05-09T00:00:00Z');
    const now = new Date(created.getTime() + MAX_DELIVERY_AGE_SECONDS * 1000);
    expect(isWithinRetryWindow(created, now)).toBe(true);
  });
});
