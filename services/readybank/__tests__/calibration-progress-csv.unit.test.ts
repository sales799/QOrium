import { describe, expect, it } from 'vitest';
import {
  calibrationProgressToCsv,
  CALIBRATION_PROGRESS_CSV_HEADERS,
} from '../src/lib/calibration-progress-csv.js';
import { computeCalibrationProgress } from '../src/lib/calibration-progress.js';
import type { CalibrationBacklogReport } from '../src/lib/calibration-backlog.js';
import type { CalibrationProgress } from '../src/lib/calibration-progress.js';

/**
 * N19/N14 calibration-progress CSV — pure RFC 4180 serialisation of the public
 * calibration-progress aggregate produced by computeCalibrationProgress(). No
 * DB needed: the tests prove the CSV is well-formed (a header row + exactly one
 * data row), CRLF-framed, trailing-CRLF-terminated, that every cell is
 * RFC-4180-safe, and that the aggregate's counts/percentages/timestamp are
 * carried through faithfully.
 */

const GEN_AT = '2026-06-13T00:00:00.000Z';

/** Build a backlog report fixture; the public shaper only reads totals + generated_at. */
function report(totals: Partial<CalibrationBacklogReport['totals']>): CalibrationBacklogReport {
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

function parseLines(csv: string): string[] {
  // Drop the single trailing CRLF, then split on CRLF.
  expect(csv.endsWith('\r\n')).toBe(true);
  return csv.slice(0, -2).split('\r\n');
}

/** Count RFC 4180 fields in one CSV record, honouring double-quoted fields. */
function countCsvFields(line: string): number {
  let fields = 1;
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        i++; // escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields++;
    }
  }
  return fields;
}

describe('calibrationProgressToCsv', () => {
  it('emits exactly a header row and one data row', () => {
    const csv = calibrationProgressToCsv(
      computeCalibrationProgress(report({ released: 1000, calibratable: 900, seeded: 300 })),
    );
    const lines = parseLines(csv);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(CALIBRATION_PROGRESS_CSV_HEADERS.join(','));
  });

  it('both lines have exactly seven columns', () => {
    const csv = calibrationProgressToCsv(
      computeCalibrationProgress(report({ released: 10, calibratable: 8, seeded: 2 })),
    );
    for (const line of parseLines(csv)) {
      expect(countCsvFields(line)).toBe(CALIBRATION_PROGRESS_CSV_HEADERS.length);
    }
  });

  it('carries the raw counts and percentages through faithfully', () => {
    // released=1000, calibratable=900, seeded=300 -> cold_backlog=600,
    // seeded_pct=33, cold_pct=67.
    const progress = computeCalibrationProgress(
      report({ released: 1000, calibratable: 900, seeded: 300 }),
    );
    const csv = calibrationProgressToCsv(progress);
    expect(csv).toContain('1000,900,300,600,33,67,');
  });

  it('echoes the generated_at timestamp in the data row', () => {
    const csv = calibrationProgressToCsv(
      computeCalibrationProgress(report({ released: 1, calibratable: 1, seeded: 1 })),
    );
    expect(csv).toContain(`,${GEN_AT}\r\n`);
  });

  it('emits an all-zero data row for an empty bank', () => {
    const csv = calibrationProgressToCsv(computeCalibrationProgress(report({})));
    const lines = parseLines(csv);
    expect(lines[1]).toBe(`0,0,0,0,0,0,${GEN_AT}`);
  });

  it('RFC 4180-quotes a generated_at value containing a comma', () => {
    // Defensive: csvField must quote any field with a comma even though a real
    // ISO timestamp never contains one. Construct the aggregate directly.
    const progress: CalibrationProgress = {
      released: 2,
      calibratable: 2,
      seeded: 1,
      cold_backlog: 1,
      seeded_pct: 50,
      cold_pct: 50,
      generated_at: 'June 13, 2026',
    };
    const csv = calibrationProgressToCsv(progress);
    expect(csv).toContain('"June 13, 2026"');
  });

  it('produces output round-trippable into equal-length records', () => {
    const csv = calibrationProgressToCsv(
      computeCalibrationProgress(report({ released: 7, calibratable: 7, seeded: 3 })),
    );
    const lines = parseLines(csv);
    const headerCols = countCsvFields(lines[0]);
    expect(headerCols).toBe(7);
    for (const line of lines.slice(1)) {
      expect(countCsvFields(line)).toBe(headerCols);
    }
  });
});
