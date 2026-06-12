import { describe, expect, it } from 'vitest';

import { buildResumeToast } from '../src/lib/resume-toast';
import type { ResumePlan } from '../src/lib/resume-state';

function plan(overrides: Partial<ResumePlan> = {}): ResumePlan {
  return {
    ok: true,
    startIdx: 2,
    remainingSec: 245,
    expired: false,
    answeredCount: 2,
    answeredIndices: [0, 1],
    totalQuestions: 10,
    ...overrides,
  };
}

describe('buildResumeToast', () => {
  it('announces a timed resume with 1-based position and mm:ss left', () => {
    const t = buildResumeToast(plan());
    expect(t.show).toBe(true);
    expect(t.message).toBe('Resumed where you left off — question 3 of 10, 04:05 left.');
  });

  it('says "no time limit" for an untimed attempt (remainingSec null)', () => {
    const t = buildResumeToast(plan({ remainingSec: null }));
    expect(t.show).toBe(true);
    expect(t.message).toBe('Resumed where you left off — question 3 of 10, no time limit.');
  });

  it('treats a negative remaining clock as untimed rather than emitting a negative timer', () => {
    const t = buildResumeToast(plan({ remainingSec: -5 }));
    expect(t.message).toContain('no time limit');
  });

  it('hides for a fresh start (nothing answered yet)', () => {
    expect(buildResumeToast(plan({ answeredCount: 0 })).show).toBe(false);
  });

  it('hides when the plan is not ok', () => {
    expect(buildResumeToast(plan({ ok: false })).show).toBe(false);
  });

  it('hides when the attempt is expired (runner finalizes instead)', () => {
    expect(buildResumeToast(plan({ expired: true })).show).toBe(false);
  });

  it('hides for a null or non-object plan', () => {
    expect(buildResumeToast(null).show).toBe(false);
    expect(buildResumeToast(undefined).show).toBe(false);
    // @ts-expect-error guarding against non-object input at runtime
    expect(buildResumeToast(42).show).toBe(false);
  });

  it('clamps the position into [1, total] when startIdx is at or past the end', () => {
    const t = buildResumeToast(plan({ startIdx: 9, answeredCount: 10 }));
    expect(t.message).toBe('Resumed where you left off — question 10 of 10, 04:05 left.');
  });

  it('omits the "of N" clause when the total is unknown', () => {
    const t = buildResumeToast(plan({ totalQuestions: 0, startIdx: 1 }));
    expect(t.message).toBe('Resumed where you left off — question 2, 04:05 left.');
  });

  it('pads seconds and minutes to two digits', () => {
    const t = buildResumeToast(plan({ remainingSec: 9, startIdx: 0, answeredCount: 1 }));
    expect(t.message).toBe('Resumed where you left off — question 1 of 10, 00:09 left.');
  });
});
