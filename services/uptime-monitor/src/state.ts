/**
 * Uptime monitor in-memory state. Keeps the latest check results +
 * a rolling window of failures for SLO calculation.
 */

import type { CheckResult, RunSummary } from '@qorium/smoke';

export interface UptimeSnapshot {
  generatedAt: string;
  summary: RunSummary;
  /** Map of check name → most recent result. */
  latest: Record<string, CheckResult>;
  /** Number of consecutive failures per check. */
  consecutiveFailures: Record<string, number>;
}

export interface SloWindow {
  /** Window length in milliseconds. */
  windowMs: number;
  /** Total checks observed within the window. */
  totalChecks: number;
  /** Failed checks observed within the window. */
  failedChecks: number;
  /** Computed availability fraction in [0, 1]. */
  availability: number;
}

export interface MonitorState {
  snapshot: UptimeSnapshot | null;
  history: { ts: number; failed: boolean; check: string }[];
}

export function createInitialState(): MonitorState {
  return { snapshot: null, history: [] };
}

export function applyRun(
  state: MonitorState,
  summary: RunSummary,
  now: () => Date = () => new Date(),
): MonitorState {
  const generatedAt = now();
  const latest: Record<string, CheckResult> = state.snapshot?.latest ?? {};
  const consecutiveFailures: Record<string, number> = state.snapshot?.consecutiveFailures ?? {};
  const history: typeof state.history = [...state.history];
  for (const r of summary.results) {
    latest[r.name] = r;
    history.push({ ts: generatedAt.getTime(), failed: r.status === 'fail', check: r.name });
    consecutiveFailures[r.name] = r.status === 'fail' ? (consecutiveFailures[r.name] ?? 0) + 1 : 0;
  }
  // Trim history to last 24h to keep memory bounded.
  const cutoff = generatedAt.getTime() - 24 * 3_600_000;
  while (history.length > 0 && (history[0]?.ts ?? cutoff) < cutoff) {
    history.shift();
  }
  return {
    snapshot: {
      generatedAt: generatedAt.toISOString(),
      summary,
      latest,
      consecutiveFailures,
    },
    history,
  };
}

export function computeSlo(state: MonitorState, windowMs: number): SloWindow {
  const cutoff = Date.now() - windowMs;
  const inWindow = state.history.filter((h) => h.ts >= cutoff);
  const totalChecks = inWindow.length;
  const failedChecks = inWindow.filter((h) => h.failed).length;
  const availability = totalChecks === 0 ? 1 : (totalChecks - failedChecks) / totalChecks;
  return { windowMs, totalChecks, failedChecks, availability };
}

export const ONE_HOUR_MS = 3_600_000;
export const ONE_DAY_MS = 24 * ONE_HOUR_MS;
