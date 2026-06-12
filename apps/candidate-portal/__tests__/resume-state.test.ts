import { describe, expect, it } from 'vitest';
import { buildResumePlan, progressPercent } from '../src/lib/resume-state';

const FRESH = {
  ok: false,
  startIdx: 0,
  remainingSec: null,
  expired: false,
  answeredCount: 0,
  answeredIndices: [],
  totalQuestions: 0,
};

describe('buildResumePlan', () => {
  it('returns a fresh-start plan for null/undefined/non-object input', () => {
    expect(buildResumePlan(null)).toEqual(FRESH);
    expect(buildResumePlan(undefined)).toEqual(FRESH);
    // @ts-expect-error intentionally wrong type
    expect(buildResumePlan(42)).toEqual(FRESH);
  });

  it('falls back to fresh when total_questions is missing or non-positive', () => {
    expect(buildResumePlan({ resume_idx: 3 })).toEqual(FRESH);
    expect(buildResumePlan({ total_questions: 0, resume_idx: 0 })).toEqual(FRESH);
    expect(buildResumePlan({ total_questions: -5 })).toEqual(FRESH);
    expect(buildResumePlan({ total_questions: 'five' })).toEqual(FRESH);
  });

  it('resumes a partially-answered timed attempt at the first unanswered position', () => {
    const plan = buildResumePlan({
      status: 'in_progress',
      total_questions: 5,
      current_idx: 2,
      answered_count: 2,
      resume_idx: 2,
      remaining_sec: 540,
      expired: false,
    });
    expect(plan.ok).toBe(true);
    expect(plan.startIdx).toBe(2);
    expect(plan.remainingSec).toBe(540);
    expect(plan.expired).toBe(false);
    expect(plan.answeredCount).toBe(2);
    expect(plan.totalQuestions).toBe(5);
  });

  it('clamps resume_idx === total (all answered) to the last question', () => {
    const plan = buildResumePlan({
      status: 'in_progress',
      total_questions: 4,
      resume_idx: 4,
      answered_count: 4,
      remaining_sec: 60,
    });
    expect(plan.startIdx).toBe(3);
    expect(plan.expired).toBe(false);
  });

  it('clamps an out-of-range / negative resume_idx into bounds', () => {
    expect(buildResumePlan({ total_questions: 3, resume_idx: 99 }).startIdx).toBe(2);
    expect(buildResumePlan({ total_questions: 3, resume_idx: -7 }).startIdx).toBe(0);
  });

  it('leaves remainingSec null for an untimed attempt so the runner keeps its default', () => {
    const plan = buildResumePlan({
      status: 'in_progress',
      total_questions: 6,
      resume_idx: 1,
      remaining_sec: null,
    });
    expect(plan.ok).toBe(true);
    expect(plan.startIdx).toBe(1);
    expect(plan.remainingSec).toBeNull();
  });

  it('treats remaining_sec === 0 as expired-eligible but still a number', () => {
    const plan = buildResumePlan({
      status: 'in_progress',
      total_questions: 3,
      resume_idx: 0,
      remaining_sec: 0,
      expired: true,
    });
    expect(plan.remainingSec).toBe(0);
    expect(plan.expired).toBe(true);
  });

  it('marks the plan expired when the API flags expired even if status is in_progress', () => {
    const plan = buildResumePlan({
      status: 'in_progress',
      total_questions: 3,
      resume_idx: 1,
      remaining_sec: 0,
      expired: true,
    });
    expect(plan.expired).toBe(true);
  });

  it('marks the plan expired for a terminal status regardless of the expired flag', () => {
    for (const status of ['submitted', 'graded', 'grading', 'expired', 'cancelled']) {
      const plan = buildResumePlan({
        status,
        total_questions: 3,
        resume_idx: 0,
        remaining_sec: 120,
        expired: false,
      });
      expect(plan.expired, `status=${status}`).toBe(true);
    }
  });

  it('falls back to current_idx when resume_idx is absent', () => {
    const plan = buildResumePlan({
      status: 'in_progress',
      total_questions: 5,
      current_idx: 3,
      remaining_sec: 100,
    });
    expect(plan.startIdx).toBe(3);
  });

  it('ignores a non-numeric remaining_sec and reports null', () => {
    const plan = buildResumePlan({
      status: 'in_progress',
      total_questions: 4,
      resume_idx: 1,
      remaining_sec: 'lots',
    });
    expect(plan.remainingSec).toBeNull();
  });
});

describe('answeredIndices parsing', () => {
  it('keeps only in-range finite integers, de-duplicated and sorted', () => {
    const plan = buildResumePlan({
      total_questions: 5,
      resume_idx: 3,
      answered_count: 3,
      answered_indices: [2, 0, 2, 1, 9, -1, 3.7, 'x', null],
    });
    expect(plan.answeredIndices).toEqual([0, 1, 2, 3]);
  });

  it('degrades a non-array answered_indices to an empty list', () => {
    const plan = buildResumePlan({ total_questions: 4, answered_indices: 'nope' as unknown });
    expect(plan.answeredIndices).toEqual([]);
  });

  it('returns [] for answeredIndices on a fresh-start plan', () => {
    expect(buildResumePlan(null).answeredIndices).toEqual([]);
  });
});

describe('progressPercent', () => {
  it('computes a rounded whole percentage', () => {
    expect(progressPercent(0, 5)).toBe(0);
    expect(progressPercent(2, 5)).toBe(40);
    expect(progressPercent(5, 5)).toBe(100);
    expect(progressPercent(1, 3)).toBe(33);
  });

  it('clamps over-count and ignores negatives', () => {
    expect(progressPercent(9, 5)).toBe(100);
    expect(progressPercent(-3, 5)).toBe(0);
  });

  it('returns 0 for a non-positive or non-finite total', () => {
    expect(progressPercent(2, 0)).toBe(0);
    expect(progressPercent(2, -4)).toBe(0);
    expect(progressPercent(2, Number.NaN)).toBe(0);
    expect(progressPercent(Number.POSITIVE_INFINITY, 5)).toBe(0);
  });
});
