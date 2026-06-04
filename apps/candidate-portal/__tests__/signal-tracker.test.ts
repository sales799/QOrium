import { describe, expect, it } from 'vitest';
import { applyEvent, createTracker, toSignalsInput } from '../src/lib/signal-tracker';

describe('createTracker', () => {
  it('starts with zeroed counters', () => {
    const t = createTracker({ startedAtMs: 0 });
    expect(t.typedChars).toBe(0);
    expect(t.pastedChars).toBe(0);
    expect(t.candidateMessageCount).toBe(0);
    expect(t.codeQualityScore).toBe(3);
  });

  it('honours seededErrorsTotal', () => {
    const t = createTracker({ seededErrorsTotal: 2 });
    expect(t.seededErrorsTotal).toBe(2);
  });
});

describe('applyEvent', () => {
  it('typed accumulates and seeds firstCodeAtMs', () => {
    const t0 = createTracker({ startedAtMs: 0 });
    const t1 = applyEvent(t0, { kind: 'typed', chars: 50, nowMs: 1000 });
    expect(t1.typedChars).toBe(50);
    expect(t1.firstCodeAtMs).toBe(1000);
    const t2 = applyEvent(t1, { kind: 'typed', chars: 25, nowMs: 2000 });
    expect(t2.typedChars).toBe(75);
    expect(t2.firstCodeAtMs).toBe(1000);
  });

  it('pasted accumulates separately', () => {
    const t = applyEvent(createTracker({ startedAtMs: 0 }), { kind: 'pasted', chars: 200 });
    expect(t.pastedChars).toBe(200);
    expect(t.typedChars).toBe(0);
  });

  it('edit_test_cycle increments', () => {
    let t = createTracker({ startedAtMs: 0 });
    t = applyEvent(t, { kind: 'edit_test_cycle' });
    t = applyEvent(t, { kind: 'edit_test_cycle' });
    expect(t.editTestCycles).toBe(2);
  });

  it('candidate_message increments', () => {
    let t = createTracker({ startedAtMs: 0 });
    t = applyEvent(t, { kind: 'candidate_message' });
    t = applyEvent(t, { kind: 'candidate_message' });
    expect(t.candidateMessageCount).toBe(2);
  });

  it('accepted_verbatim/modified/rejected increments separately', () => {
    let t = createTracker({ startedAtMs: 0 });
    t = applyEvent(t, { kind: 'accepted_verbatim' });
    t = applyEvent(t, { kind: 'accepted_modified' });
    t = applyEvent(t, { kind: 'accepted_modified' });
    t = applyEvent(t, { kind: 'rejected' });
    expect(t.acceptedVerbatimCount).toBe(1);
    expect(t.acceptedModifiedCount).toBe(2);
    expect(t.rejectedCount).toBe(1);
  });

  it('seeded_error_seen with caught=true bumps both totals', () => {
    let t = createTracker({ startedAtMs: 0, seededErrorsTotal: 0 });
    t = applyEvent(t, { kind: 'seeded_error_seen', total: 2, caught: true });
    expect(t.seededErrorsTotal).toBe(2);
    expect(t.seededErrorsCaught).toBe(1);
    t = applyEvent(t, { kind: 'seeded_error_seen', total: 2, caught: false });
    expect(t.seededErrorsCaught).toBe(1);
  });

  it('tick computes durationSec from startedAtMs', () => {
    const t0 = createTracker({ startedAtMs: 0 });
    const t1 = applyEvent(t0, { kind: 'tick', nowMs: 30_000 });
    expect(t1.durationSec).toBe(30);
  });

  it('tick after typed measures timeToFirstCodeSec', () => {
    let t = createTracker({ startedAtMs: 0 });
    t = applyEvent(t, { kind: 'typed', chars: 1, nowMs: 5_000 });
    t = applyEvent(t, { kind: 'tick', nowMs: 30_000 });
    expect(t.timeToFirstCodeSec).toBe(5);
  });

  it('set_code_quality clamps to 0-5', () => {
    expect(
      applyEvent(createTracker({ startedAtMs: 0 }), { kind: 'set_code_quality', score: -2 })
        .codeQualityScore,
    ).toBe(0);
    expect(
      applyEvent(createTracker({ startedAtMs: 0 }), { kind: 'set_code_quality', score: 10 })
        .codeQualityScore,
    ).toBe(5);
    expect(
      applyEvent(createTracker({ startedAtMs: 0 }), { kind: 'set_code_quality', score: 4 })
        .codeQualityScore,
    ).toBe(4);
  });
});

describe('toSignalsInput', () => {
  it('projects tracker to the orchestrator-shaped signals payload', () => {
    let t = createTracker({ startedAtMs: 0, seededErrorsTotal: 1 });
    t = applyEvent(t, { kind: 'typed', chars: 100, nowMs: 1000 });
    t = applyEvent(t, { kind: 'pasted', chars: 50, nowMs: 1500 });
    t = applyEvent(t, { kind: 'edit_test_cycle' });
    t = applyEvent(t, { kind: 'candidate_message' });
    t = applyEvent(t, { kind: 'tick', nowMs: 60_000 });

    const out = toSignalsInput(t);
    expect(out.typedChars).toBe(100);
    expect(out.pastedChars).toBe(50);
    expect(out.editTestCycles).toBe(1);
    expect(out.candidateMessageCount).toBe(1);
    expect(out.durationSec).toBe(60);
    expect(out.codeQualityScore).toBe(3);
  });
});
