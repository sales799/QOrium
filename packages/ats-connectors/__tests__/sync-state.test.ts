import { describe, expect, it } from 'vitest';
import {
  IllegalSyncTransitionError,
  TERMINAL_STATUSES,
  ZERO_COUNTS,
  addCounts,
  canTransition,
  isTerminalStatus,
  transitionOrThrow,
} from '../src/sync-state.js';

describe('SyncStateMachine', () => {
  it('allows idle → running', () => {
    expect(canTransition('idle', 'running')).toBe(true);
  });

  it('disallows idle → succeeded', () => {
    expect(canTransition('idle', 'succeeded')).toBe(false);
    expect(() => transitionOrThrow('idle', 'succeeded')).toThrow(IllegalSyncTransitionError);
  });

  it('allows running → succeeded and running → failed', () => {
    expect(canTransition('running', 'succeeded')).toBe(true);
    expect(canTransition('running', 'failed')).toBe(true);
  });

  it('terminal statuses cannot transition further', () => {
    for (const t of TERMINAL_STATUSES) {
      for (const to of ['idle', 'running', 'succeeded', 'failed'] as const) {
        expect(canTransition(t, to)).toBe(false);
      }
    }
  });

  it('isTerminalStatus matches the catalog', () => {
    expect(isTerminalStatus('succeeded')).toBe(true);
    expect(isTerminalStatus('failed')).toBe(true);
    expect(isTerminalStatus('idle')).toBe(false);
    expect(isTerminalStatus('running')).toBe(false);
  });
});

describe('counts arithmetic', () => {
  it('ZERO_COUNTS is all zeroes', () => {
    expect(ZERO_COUNTS).toEqual({ rows_in: 0, rows_out: 0, rows_skipped: 0 });
  });

  it('addCounts sums fields and tolerates partial input', () => {
    const a = { rows_in: 10, rows_out: 8, rows_skipped: 2 };
    const sum = addCounts(a, { rows_out: 3 });
    expect(sum).toEqual({ rows_in: 10, rows_out: 11, rows_skipped: 2 });
  });
});
