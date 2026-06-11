import { describe, expect, it } from 'vitest';
import { summarizeIntegrity } from '../src/lib/integrity.js';

describe('summarizeIntegrity', () => {
  it('returns an empty low-risk summary for no signals', () => {
    const s = summarizeIntegrity([null, {}, undefined]);
    expect(s.total).toBe(0);
    expect(s.risk_score).toBe(0);
    expect(s.risk_level).toBe('low');
    expect(s.flagged).toBe(false);
  });

  it('aggregates known counters across responses', () => {
    const s = summarizeIntegrity([
      { tab_switches: 1, paste_events: 2 },
      { tab_switches: 1, focus_loss: 3 },
    ]);
    expect(s.by_type.tab_switches).toBe(2);
    expect(s.by_type.paste_events).toBe(2);
    expect(s.by_type.focus_loss).toBe(3);
    expect(s.total).toBe(7);
  });

  it('weights high-risk events and caps the score at 100', () => {
    const s = summarizeIntegrity([{ fullscreen_exits: 50 }]);
    expect(s.risk_score).toBe(100);
    expect(s.risk_level).toBe('high');
    expect(s.flagged).toBe(true);
  });

  it('classifies medium risk', () => {
    const s = summarizeIntegrity([{ tab_switches: 4 }]); // 4 * 8 = 32
    expect(s.risk_score).toBe(32);
    expect(s.risk_level).toBe('medium');
    expect(s.flagged).toBe(true);
  });

  it('counts arrays and booleans defensively', () => {
    const s = summarizeIntegrity([{ events: [1, 2, 3], copy: true }]);
    expect(s.by_type.events).toBe(3);
    expect(s.by_type.copy).toBe(1);
  });
});
