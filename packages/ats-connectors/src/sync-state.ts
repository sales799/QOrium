/**
 * ATS Connector Framework v0 — sync-run state machine.
 *
 * Maps to `ats.sync_runs.status`:
 *   idle      — created but not yet picked up by the worker
 *   running   — worker is mid-flight
 *   succeeded — terminal
 *   failed    — terminal
 *
 * Forward-only transitions; idempotent terminal states.
 */

export type SyncStatus = 'idle' | 'running' | 'succeeded' | 'failed';

export const TERMINAL_STATUSES: readonly SyncStatus[] = Object.freeze(['succeeded', 'failed']);

const TRANSITIONS: Record<SyncStatus, readonly SyncStatus[]> = {
  idle: ['running'],
  running: ['succeeded', 'failed'],
  succeeded: [],
  failed: [],
};

export class IllegalSyncTransitionError extends Error {
  constructor(from: SyncStatus, to: SyncStatus) {
    super(`Illegal sync transition: ${from} -> ${to}`);
    this.name = 'IllegalSyncTransitionError';
  }
}

export function isTerminalStatus(s: SyncStatus): boolean {
  return TERMINAL_STATUSES.includes(s);
}

export function canTransition(from: SyncStatus, to: SyncStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function transitionOrThrow(from: SyncStatus, to: SyncStatus): SyncStatus {
  if (!canTransition(from, to)) throw new IllegalSyncTransitionError(from, to);
  return to;
}

export interface SyncCounts {
  rows_in: number;
  rows_out: number;
  rows_skipped: number;
}

export const ZERO_COUNTS: SyncCounts = { rows_in: 0, rows_out: 0, rows_skipped: 0 };

export function addCounts(a: SyncCounts, b: Partial<SyncCounts>): SyncCounts {
  return {
    rows_in: a.rows_in + (b.rows_in ?? 0),
    rows_out: a.rows_out + (b.rows_out ?? 0),
    rows_skipped: a.rows_skipped + (b.rows_skipped ?? 0),
  };
}
