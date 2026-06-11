import { describe, expect, it } from 'vitest';
import { summarizeIntegrity } from '../src/lib/integrity.js';

// N10 proctoring slice 2: the recruiter review route surfaces an attempt-level
// integrity summary built from each response's suspicious_signals, at parity
// with the admin review endpoint. This locks that aggregation contract.
describe('recruiter review integrity summary (N10 slice 2)', () => {
  it('aggregates per-response suspicious_signals into one attempt summary', () => {
    const responses = [
      { suspicious_signals: { tab_switches: 2, paste_events: 1 } },
      { suspicious_signals: { tab_switches: 1, focus_loss: 3 } },
      { suspicious_signals: null },
    ];
    const summary = summarizeIntegrity(responses.map((r) => r.suspicious_signals));
    expect(summary.by_type.tab_switches).toBe(3);
    expect(summary.by_type.paste_events).toBe(1);
    expect(summary.by_type.focus_loss).toBe(3);
    expect(summary.total).toBe(7);
    expect(summary.risk_score).toBeGreaterThan(0);
    expect(['low', 'medium', 'high']).toContain(summary.risk_level);
  });

  it('returns a clean low-risk summary when no signals are present', () => {
    const summary = summarizeIntegrity([null, {}, undefined]);
    expect(summary.total).toBe(0);
    expect(summary.risk_score).toBe(0);
    expect(summary.risk_level).toBe('low');
    expect(summary.flagged).toBe(false);
  });
});
