import { describe, expect, it } from 'vitest';
import { exitCodeFor, renderHumanText, renderJsonLine } from '../src/render';
import type { RunSummary } from '../src/checks';
import type { ImportGraphResult } from '../src/import-graph';

const summary = (overrides: Partial<RunSummary> = {}): RunSummary => ({
  results: [],
  passed: 0,
  failed: 0,
  skipped: 0,
  durationMs: 0,
  ...overrides,
});

const passOnly = summary({
  results: [{ name: 'pg.ping', status: 'pass', durationMs: 1 }],
  passed: 1,
});

describe('renderHumanText', () => {
  it('emits the header + a row per check + a summary line', () => {
    const out = renderHumanText(passOnly, []);
    expect(out).toMatch(/QOrium deployment readiness/);
    expect(out).toMatch(/pg\.ping/);
    expect(out).toMatch(/Summary: 1 pass/);
  });

  it('renders skip reason inline', () => {
    const out = renderHumanText(
      summary({
        results: [
          { name: 'redis', status: 'skip', durationMs: 0, skipReason: 'REDIS_URL not set' },
        ],
        skipped: 1,
      }),
      [],
    );
    expect(out).toMatch(/REDIS_URL not set/);
  });

  it('renders fail details inline', () => {
    const out = renderHumanText(
      summary({
        results: [{ name: 'pg', status: 'fail', durationMs: 1, details: 'connection refused' }],
        failed: 1,
      }),
      [],
    );
    expect(out).toMatch(/connection refused/);
  });

  it('renders the import-graph section when given non-empty input', () => {
    const graph: ImportGraphResult[] = [
      { workspace: '@qorium/x', symbol: 'foo', ok: true },
      { workspace: '@qorium/y', symbol: 'bar', ok: false, details: 'boom' },
    ];
    const out = renderHumanText(passOnly, graph);
    expect(out).toMatch(/Import graph/);
    expect(out).toMatch(/@qorium\/x::foo/);
    expect(out).toMatch(/@qorium\/y::bar/);
    expect(out).toMatch(/boom/);
  });
});

describe('renderJsonLine', () => {
  it('emits a single-line JSON document with event tag', () => {
    const out = renderJsonLine(passOnly, []);
    expect(out.includes('\n')).toBe(false);
    expect(JSON.parse(out)).toMatchObject({ event: 'smoke.report' });
  });

  it('includes import-graph results', () => {
    const out = renderJsonLine(passOnly, [{ workspace: 'a', symbol: 'b', ok: true }]);
    const parsed = JSON.parse(out);
    expect(parsed.importGraph).toHaveLength(1);
  });
});

describe('exitCodeFor', () => {
  it('returns 0 when nothing failed', () => {
    expect(exitCodeFor(passOnly, [])).toBe(0);
  });

  it('returns 1 when any check failed', () => {
    expect(
      exitCodeFor(
        summary({
          results: [{ name: 'a', status: 'fail', durationMs: 0 }],
          failed: 1,
        }),
        [],
      ),
    ).toBe(1);
  });

  it('returns 1 when any import-graph entry failed', () => {
    expect(exitCodeFor(passOnly, [{ workspace: 'x', symbol: 'y', ok: false }])).toBe(1);
  });
});
