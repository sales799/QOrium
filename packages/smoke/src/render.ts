/**
 * Output formatters for the smoke runner. Two flavours:
 *   - `renderHumanText` — multi-line ASCII; what `make smoke` prints
 *   - `renderJsonLine` — single-line JSON; what CI consumes
 *
 * Pure functions of `RunSummary` + `ImportGraphResult[]`, so they're trivial
 * to unit-test without spinning up the runner.
 */

import type { CheckResult, RunSummary } from './checks.js';
import type { ImportGraphResult } from './import-graph.js';

const SYMBOLS = { pass: '✓', fail: '✗', skip: '·' } as const;

export function renderHumanText(summary: RunSummary, graph: ImportGraphResult[] = []): string {
  const lines: string[] = [];
  lines.push('QOrium deployment readiness — smoke report');
  lines.push('-'.repeat(60));
  for (const r of summary.results) {
    lines.push(formatLine(r));
  }
  if (graph.length > 0) {
    lines.push('');
    lines.push('Import graph (cross-workspace public APIs)');
    lines.push('-'.repeat(60));
    for (const g of graph) {
      const sym = g.ok ? SYMBOLS.pass : SYMBOLS.fail;
      const detail = g.details ? `  ← ${g.details}` : '';
      lines.push(`  ${sym}  ${g.workspace}::${g.symbol}${detail}`);
    }
  }
  lines.push('');
  lines.push(
    `Summary: ${summary.passed} pass, ${summary.failed} fail, ${summary.skipped} skip — ${summary.durationMs} ms`,
  );
  return lines.join('\n');
}

function formatLine(r: CheckResult): string {
  const sym = SYMBOLS[r.status];
  const tag = `[${r.status.toUpperCase().padEnd(4)}]`;
  const name = r.name.padEnd(28);
  const dur = `${r.durationMs} ms`.padStart(8);
  const skip = r.status === 'skip' && r.skipReason ? `  ← ${r.skipReason}` : '';
  const detail = r.status === 'fail' && r.details ? `  ← ${r.details}` : '';
  return `  ${sym}  ${tag}  ${name}  ${dur}${skip}${detail}`;
}

export function renderJsonLine(summary: RunSummary, graph: ImportGraphResult[] = []): string {
  return JSON.stringify({
    event: 'smoke.report',
    summary: {
      passed: summary.passed,
      failed: summary.failed,
      skipped: summary.skipped,
      durationMs: summary.durationMs,
    },
    checks: summary.results,
    importGraph: graph,
  });
}

/** Exit code derived from a summary: 0 iff no failures. */
export function exitCodeFor(summary: RunSummary, graph: ImportGraphResult[] = []): number {
  if (summary.failed > 0) return 1;
  if (graph.some((g) => !g.ok)) return 1;
  return 0;
}
