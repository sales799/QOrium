import { describe, expect, it } from 'vitest';
import { buildAttemptState } from '../src/lib/attempt-state.js';

const START = new Date('2026-06-12T10:00:00.000Z');
const Q = ['q0', 'q1', 'q2', 'q3'];

describe('buildAttemptState', () => {
  it('fresh attempt: nothing answered, resume at 0', () => {
    const v = buildAttemptState({
      attemptId: 'a1',
      status: 'in_progress',
      questionOrder: Q,
      currentIdx: 0,
      startedAt: START,
      answeredQuestionIds: [],
      timeLimitSec: 3600,
      now: new Date('2026-06-12T10:00:30.000Z'),
    });
    expect(v.total_questions).toBe(4);
    expect(v.answered_count).toBe(0);
    expect(v.answered_indices).toEqual([]);
    expect(v.resume_idx).toBe(0);
    expect(v.elapsed_sec).toBe(30);
    expect(v.remaining_sec).toBe(3570);
    expect(v.expired).toBe(false);
  });

  it('partial, non-contiguous answers: resume at first gap', () => {
    const v = buildAttemptState({
      attemptId: 'a1',
      status: 'in_progress',
      questionOrder: Q,
      currentIdx: 2,
      startedAt: START,
      answeredQuestionIds: ['q0', 'q2'],
      timeLimitSec: 3600,
      now: new Date('2026-06-12T10:05:00.000Z'),
    });
    expect(v.answered_indices).toEqual([0, 2]);
    expect(v.answered_count).toBe(2);
    expect(v.resume_idx).toBe(1); // first unanswered position
    expect(v.current_idx).toBe(2);
  });

  it('all answered: resume_idx === total_questions', () => {
    const v = buildAttemptState({
      attemptId: 'a1',
      status: 'in_progress',
      questionOrder: Q,
      currentIdx: 3,
      startedAt: START,
      answeredQuestionIds: ['q3', 'q1', 'q0', 'q2'],
      timeLimitSec: 3600,
      now: new Date('2026-06-12T10:10:00.000Z'),
    });
    expect(v.answered_count).toBe(4);
    expect(v.resume_idx).toBe(4);
  });

  it('untimed assessment: remaining_sec null, never expired', () => {
    const v = buildAttemptState({
      attemptId: 'a1',
      status: 'in_progress',
      questionOrder: Q,
      currentIdx: 0,
      startedAt: START,
      answeredQuestionIds: [],
      timeLimitSec: 0,
      now: new Date('2026-06-12T15:00:00.000Z'),
    });
    expect(v.remaining_sec).toBeNull();
    expect(v.expired).toBe(false);
    expect(v.time_limit_sec).toBe(0);
  });

  it('over the time budget: remaining 0 and expired', () => {
    const v = buildAttemptState({
      attemptId: 'a1',
      status: 'in_progress',
      questionOrder: Q,
      currentIdx: 1,
      startedAt: START,
      answeredQuestionIds: ['q0'],
      timeLimitSec: 600,
      now: new Date('2026-06-12T10:30:00.000Z'), // 1800s > 600s
    });
    expect(v.elapsed_sec).toBe(1800);
    expect(v.remaining_sec).toBe(0);
    expect(v.expired).toBe(true);
  });

  it('ignores answered ids not in question_order (defensive)', () => {
    const v = buildAttemptState({
      attemptId: 'a1',
      status: 'in_progress',
      questionOrder: Q,
      currentIdx: 0,
      startedAt: START,
      answeredQuestionIds: ['ghost', 'q1'],
      timeLimitSec: 3600,
      now: new Date('2026-06-12T10:01:00.000Z'),
    });
    expect(v.answered_indices).toEqual([1]);
    expect(v.answered_count).toBe(1);
    expect(v.resume_idx).toBe(0);
  });

  it('never leaks answer content — only the known position/time keys', () => {
    const v = buildAttemptState({
      attemptId: 'a1',
      status: 'submitted',
      questionOrder: Q,
      currentIdx: 4,
      startedAt: START,
      answeredQuestionIds: ['q0', 'q1', 'q2', 'q3'],
      timeLimitSec: 3600,
      now: new Date('2026-06-12T10:20:00.000Z'),
    });
    expect(Object.keys(v).sort()).toEqual(
      [
        'answered_count',
        'answered_indices',
        'attempt_id',
        'current_idx',
        'elapsed_sec',
        'expired',
        'remaining_sec',
        'resume_idx',
        'started_at',
        'status',
        'time_limit_sec',
        'total_questions',
      ].sort(),
    );
    // The whitelist above is the real guarantee; assert the dangerous content
    // keys are absent explicitly (answered_count/_indices are positions, safe).
    const keys = Object.keys(v) as string[];
    for (const forbidden of ['response_body', 'score', 'correct', 'reasoning']) {
      expect(keys).not.toContain(forbidden);
    }
    expect(v.status).toBe('submitted');
  });

  it('clamps a future/negative clock to non-negative elapsed', () => {
    const v = buildAttemptState({
      attemptId: 'a1',
      status: 'in_progress',
      questionOrder: Q,
      currentIdx: 0,
      startedAt: START,
      answeredQuestionIds: [],
      timeLimitSec: 600,
      now: new Date('2026-06-12T09:59:00.000Z'), // before start
    });
    expect(v.elapsed_sec).toBe(0);
    expect(v.remaining_sec).toBe(600);
    expect(v.expired).toBe(false);
  });
});
