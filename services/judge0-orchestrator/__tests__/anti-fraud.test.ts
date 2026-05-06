import { describe, expect, it } from 'vitest';
import { computeAntiFraudSignals } from '../src/anti-fraud';

describe('computeAntiFraudSignals', () => {
  it('returns zero ratio + no flags for empty inputs', () => {
    const s = computeAntiFraudSignals({});
    expect(s.pasteVsTypedRatio).toBe(0);
    expect(s.flags).toEqual([]);
  });

  it('high paste ratio raises high_paste_ratio flag', () => {
    const s = computeAntiFraudSignals({ pasteEventCount: 9, typedEventCount: 1 });
    expect(s.pasteVsTypedRatio).toBeCloseTo(0.9);
    expect(s.flags).toContain('high_paste_ratio');
  });

  it('paste ratio at or below threshold (0.7) does NOT raise the flag', () => {
    const s = computeAntiFraudSignals({ pasteEventCount: 7, typedEventCount: 3 });
    expect(s.pasteVsTypedRatio).toBeCloseTo(0.7);
    expect(s.flags).not.toContain('high_paste_ratio');
  });

  it('time-on-task < 60s raises time_on_task_too_low', () => {
    const s = computeAntiFraudSignals({ timeOnTaskMs: 30_000 });
    expect(s.flags).toContain('time_on_task_too_low');
  });

  it('time-on-task >= 60s does NOT raise the flag', () => {
    const s = computeAntiFraudSignals({ timeOnTaskMs: 120_000 });
    expect(s.flags).not.toContain('time_on_task_too_low');
  });

  it('time-on-task = 0 (unknown) does NOT raise the flag', () => {
    const s = computeAntiFraudSignals({ timeOnTaskMs: 0 });
    expect(s.flags).not.toContain('time_on_task_too_low');
  });

  it('language mismatch + ip change + identical submission all raise their flags', () => {
    const s = computeAntiFraudSignals({
      languageMismatch: true,
      suspiciousIpChange: true,
      identicalSubmissionCount: 2,
    });
    expect(s.flags).toEqual(
      expect.arrayContaining(['language_mismatch', 'suspicious_ip_change', 'identical_submission']),
    );
  });

  it('execution_failed raised when executionSuccess === false', () => {
    const s = computeAntiFraudSignals({ executionSuccess: false });
    expect(s.flags).toContain('execution_failed');
  });

  it('execution_failed NOT raised when executionSuccess undefined (default true)', () => {
    const s = computeAntiFraudSignals({});
    expect(s.flags).not.toContain('execution_failed');
  });

  it('clamps pasteVsTypedRatio to [0, 1]', () => {
    const s = computeAntiFraudSignals({ pasteEventCount: 100, typedEventCount: 0 });
    expect(s.pasteVsTypedRatio).toBe(1);
  });

  it('non-finite or negative numbers fall back to 0', () => {
    const s = computeAntiFraudSignals({
      pasteEventCount: -5,
      typedEventCount: Number.NaN,
      timeOnTaskMs: -1,
      identicalSubmissionCount: -3,
    });
    expect(s.pasteVsTypedRatio).toBe(0);
    expect(s.timeOnTaskMs).toBe(0);
    expect(s.identicalSubmissionCount).toBe(0);
  });
});
