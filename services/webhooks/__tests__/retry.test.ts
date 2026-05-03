import { describe, expect, it } from 'vitest';
import {
  ATTEMPT_DELAYS_MS,
  MAX_ATTEMPTS,
  MAX_AGE_MS,
  classifyHttpStatus,
  nextAttempt,
} from '../src/retry.js';

describe('webhooks retry', () => {
  it('exposes the spec §6 backoff schedule', () => {
    expect(ATTEMPT_DELAYS_MS).toEqual([0, 60_000, 300_000, 1_800_000, 14_400_000, 86_400_000]);
    expect(MAX_ATTEMPTS).toBe(6);
  });

  it('classifies HTTP statuses per spec', () => {
    expect(classifyHttpStatus(200)).toBe('success');
    expect(classifyHttpStatus(202)).toBe('success');
    expect(classifyHttpStatus(204)).toBe('success');
    expect(classifyHttpStatus(400)).toBe('permanent');
    expect(classifyHttpStatus(404)).toBe('permanent');
    expect(classifyHttpStatus(410)).toBe('permanent');
    expect(classifyHttpStatus(500)).toBe('retry');
    expect(classifyHttpStatus(503)).toBe('retry');
    expect(classifyHttpStatus(429)).toBe('retry');
  });

  it('schedules retries on the spec backoff curve', () => {
    const start = Date.parse('2026-05-01T12:00:00Z');
    const after1 = nextAttempt({ attemptCount: 1, firstAttemptAt: start, now: () => start });
    expect(after1.kind).toBe('retry');
    expect(after1.retryAt).toBe(start + 60_000);
    const after5 = nextAttempt({ attemptCount: 5, firstAttemptAt: start, now: () => start });
    expect(after5.kind).toBe('retry');
    expect(after5.retryAt).toBe(start + 86_400_000);
  });

  it('abandons after the max attempt count', () => {
    const start = Date.parse('2026-05-01T12:00:00Z');
    const after6 = nextAttempt({ attemptCount: 6, firstAttemptAt: start, now: () => start });
    expect(after6.kind).toBe('abandon');
  });

  it('abandons once the message is older than MAX_AGE_MS', () => {
    const start = Date.parse('2026-05-01T12:00:00Z');
    const out = nextAttempt({
      attemptCount: 2,
      firstAttemptAt: start,
      now: () => start + MAX_AGE_MS + 1,
    });
    expect(out.kind).toBe('abandon');
  });
});
