import { describe, expect, it } from 'vitest';
import type { CheckResult, RunSummary } from '@qorium/smoke';
import { applyRun, computeSlo, createInitialState, ONE_DAY_MS, ONE_HOUR_MS } from '../src/state';

function makeSummary(results: CheckResult[]): RunSummary {
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  for (const r of results) {
    if (r.status === 'pass') passed++;
    else if (r.status === 'fail') failed++;
    else skipped++;
  }
  return { results, passed, failed, skipped, durationMs: 5 };
}

describe('applyRun', () => {
  it('captures latest results + tracks consecutive failures', () => {
    let state = createInitialState();
    state = applyRun(
      state,
      makeSummary([
        { name: 'http.readybank', status: 'pass', durationMs: 1 },
        { name: 'http.billing', status: 'fail', durationMs: 1 },
      ]),
      () => new Date('2026-05-03T00:00:00Z'),
    );
    expect(state.snapshot?.consecutiveFailures['http.billing']).toBe(1);
    expect(state.snapshot?.consecutiveFailures['http.readybank']).toBe(0);
    state = applyRun(
      state,
      makeSummary([{ name: 'http.billing', status: 'fail', durationMs: 1 }]),
      () => new Date('2026-05-03T00:01:00Z'),
    );
    expect(state.snapshot?.consecutiveFailures['http.billing']).toBe(2);
  });

  it('resets consecutive failures on a pass', () => {
    let state = createInitialState();
    state = applyRun(state, makeSummary([{ name: 'x', status: 'fail', durationMs: 1 }]));
    state = applyRun(state, makeSummary([{ name: 'x', status: 'fail', durationMs: 1 }]));
    state = applyRun(state, makeSummary([{ name: 'x', status: 'pass', durationMs: 1 }]));
    expect(state.snapshot?.consecutiveFailures.x).toBe(0);
  });

  it('trims history older than 24h', () => {
    let state = createInitialState();
    const oldDate = new Date('2026-05-01T00:00:00Z');
    state = applyRun(
      state,
      makeSummary([{ name: 'old', status: 'fail', durationMs: 1 }]),
      () => oldDate,
    );
    expect(state.history).toHaveLength(1);
    state = applyRun(
      state,
      makeSummary([{ name: 'new', status: 'pass', durationMs: 1 }]),
      () => new Date('2026-05-03T00:00:00Z'),
    );
    expect(state.history.find((h) => h.check === 'old')).toBeUndefined();
  });
});

describe('computeSlo', () => {
  it('returns 100% availability with no history', () => {
    const slo = computeSlo(createInitialState(), ONE_HOUR_MS);
    expect(slo.availability).toBe(1);
    expect(slo.totalChecks).toBe(0);
  });

  it('computes the failed/total ratio across the window', () => {
    const state = createInitialState();
    state.history.push({ ts: Date.now() - 1_000, failed: false, check: 'a' });
    state.history.push({ ts: Date.now() - 1_000, failed: true, check: 'b' });
    state.history.push({ ts: Date.now() - 1_000, failed: true, check: 'c' });
    state.history.push({ ts: Date.now() - 1_000, failed: false, check: 'd' });
    const slo = computeSlo(state, ONE_HOUR_MS);
    expect(slo.totalChecks).toBe(4);
    expect(slo.failedChecks).toBe(2);
    expect(slo.availability).toBe(0.5);
  });

  it('honours the window boundary', () => {
    const state = createInitialState();
    state.history.push({ ts: Date.now() - ONE_DAY_MS - 60_000, failed: true, check: 'old' });
    state.history.push({ ts: Date.now() - 60_000, failed: false, check: 'new' });
    const slo = computeSlo(state, ONE_HOUR_MS);
    expect(slo.totalChecks).toBe(1);
    expect(slo.availability).toBe(1);
  });
});
