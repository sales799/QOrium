import { describe, expect, it } from 'vitest';
import { computeCalibrationProgress } from '../src/lib/calibration-progress.js';
import type { CalibrationBacklogReport } from '../src/lib/calibration-backlog.js';

/**
 * N19 calibration-progress — pure shaping for the PUBLIC aggregate
 * calibration-progress surface (/v1/proof/calibration). These tests need no DB:
 * they prove the public aggregate is always well-formed (percentages never
 * NaN/Infinity/>100), that junk upstream totals are sanitized, that sub-counts
 * can never exceed their enclosing count (seeded <= calibratable <= released),
 * that cold_backlog is never negative, and that the report's generated_at is
 * carried through unchanged.
 */

const GEN_AT = '2026-06-13T00:00:00.000Z';

function report(totals: Partial<CalibrationBacklogReport['totals']>): CalibrationBacklogReport {
  // The public shaper only reads `.totals` and `.generated_at`; `families` is
  // irrelevant to it, so an empty array is a faithful fixture.
  return {
    families: [],
    totals: {
      released: 0,
      calibratable: 0,
      seeded: 0,
      cold_backlog: 0,
      cold_pct: 0,
      ...totals,
    },
    generated_at: GEN_AT,
  };
}

describe('computeCalibrationProgress', () => {
  it('distils the report totals into a public aggregate with rounded percentages', () => {
    const out = computeCalibrationProgress(
      report({ released: 1000, calibratable: 900, seeded: 300, cold_backlog: 600 }),
    );
    expect(out.released).toBe(1000);
    expect(out.calibratable).toBe(900);
    expect(out.seeded).toBe(300);
    expect(out.cold_backlog).toBe(600);
    // 300/900 = 33%, 600/900 = 67%.
    expect(out.seeded_pct).toBe(33);
    expect(out.cold_pct).toBe(67);
    expect(out.generated_at).toBe(GEN_AT);
  });

  it('derives cold_backlog from calibratable - seeded, not from the report field', () => {
    // Upstream cold_backlog is deliberately wrong (negative); the shaper must
    // recompute it as calibratable - seeded so the public payload is coherent.
    const out = computeCalibrationProgress(
      report({ released: 50, calibratable: 40, seeded: 10, cold_backlog: -999 }),
    );
    expect(out.cold_backlog).toBe(30);
    expect(out.cold_pct).toBe(75);
    expect(out.seeded_pct).toBe(25);
  });

  it('caps sub-counts so seeded <= calibratable <= released', () => {
    const out = computeCalibrationProgress(
      report({ released: 100, calibratable: 250, seeded: 400, cold_backlog: 0 }),
    );
    expect(out.calibratable).toBe(100); // capped at released
    expect(out.seeded).toBe(100); // capped at calibratable
    expect(out.cold_backlog).toBe(0); // 100 - 100
    expect(out.seeded_pct).toBe(100);
    expect(out.cold_pct).toBe(0);
  });

  it('returns 0 percentages (never NaN/Infinity) when nothing is calibratable', () => {
    const out = computeCalibrationProgress(report({ released: 20, calibratable: 0, seeded: 0 }));
    expect(out.seeded_pct).toBe(0);
    expect(out.cold_pct).toBe(0);
    expect(out.cold_backlog).toBe(0);
  });

  it('sanitizes negative / non-finite totals to 0', () => {
    const out = computeCalibrationProgress(
      report({
        released: -5,
        calibratable: Number.NaN,
        seeded: Number.POSITIVE_INFINITY,
        cold_backlog: Number.NaN,
      }),
    );
    expect(out.released).toBe(0);
    expect(out.calibratable).toBe(0);
    expect(out.seeded).toBe(0);
    expect(out.cold_backlog).toBe(0);
    expect(out.seeded_pct).toBe(0);
    expect(out.cold_pct).toBe(0);
  });

  it('floors fractional counts to integers', () => {
    const out = computeCalibrationProgress(
      report({ released: 10.9, calibratable: 8.7, seeded: 2.3, cold_backlog: 0 }),
    );
    expect(out.released).toBe(10);
    expect(out.calibratable).toBe(8);
    expect(out.seeded).toBe(2);
    expect(out.cold_backlog).toBe(6);
  });

  it('reports a fully-seeded bank as 100% seeded / 0% cold', () => {
    const out = computeCalibrationProgress(
      report({ released: 500, calibratable: 500, seeded: 500, cold_backlog: 0 }),
    );
    expect(out.seeded_pct).toBe(100);
    expect(out.cold_pct).toBe(0);
    expect(out.cold_backlog).toBe(0);
  });

  it('reports a fully-cold bank as 0% seeded / 100% cold', () => {
    const out = computeCalibrationProgress(
      report({ released: 500, calibratable: 500, seeded: 0, cold_backlog: 500 }),
    );
    expect(out.seeded_pct).toBe(0);
    expect(out.cold_pct).toBe(100);
    expect(out.cold_backlog).toBe(500);
  });
});
