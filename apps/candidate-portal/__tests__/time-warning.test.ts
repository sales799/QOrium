import { describe, expect, it } from 'vitest';
import {
  buildTimeWarning,
  CRITICAL_THRESHOLD_SEC,
  WARNING_THRESHOLD_SEC,
} from '../src/lib/time-warning';

describe('buildTimeWarning', () => {
  it('returns none when plenty of time remains', () => {
    const w = buildTimeWarning(600, 1800);
    expect(w.level).toBe('none');
    expect(w.message).toBeNull();
    expect(w.remainingSec).toBe(600);
  });

  it('warns at the warning threshold boundary', () => {
    const w = buildTimeWarning(WARNING_THRESHOLD_SEC, 1800);
    expect(w.level).toBe('warning');
    expect(w.message).toContain('remaining');
  });

  it('stays none just above the warning threshold', () => {
    expect(buildTimeWarning(WARNING_THRESHOLD_SEC + 1, 1800).level).toBe('none');
  });

  it('escalates to critical at the critical threshold boundary', () => {
    const w = buildTimeWarning(CRITICAL_THRESHOLD_SEC, 1800);
    expect(w.level).toBe('critical');
    expect(w.message).toContain('automatically');
  });

  it('is critical at zero seconds remaining', () => {
    const w = buildTimeWarning(0, 1800);
    expect(w.level).toBe('critical');
    expect(w.remainingSec).toBe(0);
  });

  it('treats a non-positive time limit as untimed -> none', () => {
    expect(buildTimeWarning(10, 0).level).toBe('none');
    expect(buildTimeWarning(10, -5).level).toBe('none');
  });

  it('warns when timeLimitSec is omitted (timed by remaining alone)', () => {
    expect(buildTimeWarning(30).level).toBe('critical');
    expect(buildTimeWarning(90).level).toBe('warning');
  });

  it('degrades non-finite or negative remaining to none', () => {
    expect(buildTimeWarning(Number.NaN, 1800).level).toBe('none');
    expect(buildTimeWarning(-1, 1800).level).toBe('none');
    expect(buildTimeWarning('30' as unknown, 1800).level).toBe('none');
    expect(buildTimeWarning(undefined, 1800).level).toBe('none');
  });

  it('formats minutes-and-seconds in the message', () => {
    const w = buildTimeWarning(95, 1800);
    expect(w.message).toContain('1m 35s');
  });

  it('truncates fractional seconds before deciding', () => {
    const w = buildTimeWarning(60.9, 1800);
    expect(w.level).toBe('critical');
    expect(w.remainingSec).toBe(60);
  });
});
