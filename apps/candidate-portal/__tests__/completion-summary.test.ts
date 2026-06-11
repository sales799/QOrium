import { describe, expect, it } from 'vitest';
import { buildCompletionSummary, formatDuration } from '../src/lib/completion-summary';

describe('formatDuration', () => {
  it('formats sub-hour durations as m:ss', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(725)).toBe('12:05');
  });

  it('formats hour-plus durations as h:mm:ss', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3800)).toBe('1:03:20');
  });

  it('clamps negative or non-finite input to 0:00', () => {
    expect(formatDuration(-10)).toBe('0:00');
    expect(formatDuration(Number.NaN)).toBe('0:00');
    expect(formatDuration(Number.POSITIVE_INFINITY)).toBe('0:00');
  });
});

describe('buildCompletionSummary', () => {
  it('computes completion percentage and average per question', () => {
    const s = buildCompletionSummary({ answered: 4, total: 5, durationSec: 600 });
    expect(s.answered).toBe(4);
    expect(s.total).toBe(5);
    expect(s.completionPct).toBe(80);
    expect(s.durationLabel).toBe('10:00');
    expect(s.avgPerQuestionLabel).toBe('2:30');
  });

  it('omits duration labels when timestamps are missing', () => {
    const s = buildCompletionSummary({ answered: 3, total: 3 });
    expect(s.completionPct).toBe(100);
    expect(s.durationLabel).toBeNull();
    expect(s.avgPerQuestionLabel).toBeNull();
  });

  it('shows the total time but no average when nothing was answered', () => {
    const s = buildCompletionSummary({ answered: 0, total: 5, durationSec: 120 });
    expect(s.completionPct).toBe(0);
    expect(s.durationLabel).toBe('2:00');
    expect(s.avgPerQuestionLabel).toBeNull();
  });

  it('never reports more than 100% when answered exceeds total', () => {
    const s = buildCompletionSummary({ answered: 7, total: 5, durationSec: null });
    expect(s.completionPct).toBe(100);
    expect(s.durationLabel).toBeNull();
  });

  it('clamps malformed counts to zero', () => {
    const s = buildCompletionSummary({ answered: Number.NaN, total: -3, durationSec: 90 });
    expect(s.answered).toBe(0);
    expect(s.total).toBe(0);
    expect(s.completionPct).toBe(0);
    expect(s.durationLabel).toBe('1:30');
    expect(s.avgPerQuestionLabel).toBeNull();
  });
});
