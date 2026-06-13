import { describe, expect, it } from 'vitest';
import {
  calibrationBacklogToCsv,
  CALIBRATION_BACKLOG_CSV_HEADERS,
} from '../src/lib/calibration-backlog-csv.js';
import {
  computeCalibrationBacklog,
  type CalibrationBacklogReport,
  type SkillBacklogRow,
} from '../src/lib/calibration-backlog.js';
import { SKILL_FAMILIES } from '../src/lib/skill-families.js';

/**
 * N8/N19 calibration-backlog CSV — pure RFC 4180 serialisation of the worst-
 * first cold-backlog report produced by computeCalibrationBacklog(). No DB
 * needed: the tests prove the CSV is well-formed (header + one row per family +
 * a TOTAL row), CRLF-framed, trailing-CRLF-terminated, that the worst-first
 * family order is preserved, and that every cell is RFC-4180-safe even when a
 * family_name contains a comma or quote.
 */

const FIXED = new Date('2026-06-13T00:00:00.000Z');

function row(skill: string, partial: Partial<SkillBacklogRow> = {}): SkillBacklogRow {
  return {
    skill,
    released: 0,
    with_irt_params: 0,
    with_empirical_data: 0,
    ...partial,
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

describe('calibrationBacklogToCsv', () => {
  it('emits a header row, one row per family, and a TOTAL row', () => {
    const report = computeCalibrationBacklog([], FIXED);
    const lines = parseLines(calibrationBacklogToCsv(report));
    // header + every family + TOTAL
    expect(lines).toHaveLength(1 + SKILL_FAMILIES.length + 1);
    expect(lines[0]).toBe(CALIBRATION_BACKLOG_CSV_HEADERS.join(','));
    const last = lines[lines.length - 1];
    expect(last.startsWith('TOTAL,')).toBe(true);
  });

  it('every line has exactly seven columns', () => {
    const report = computeCalibrationBacklog(
      [
        row('AWS Lambda', { released: 10, with_irt_params: 10, with_empirical_data: 2 }),
        row('React', { released: 4, with_irt_params: 4 }),
      ],
      FIXED,
    );
    for (const line of parseLines(calibrationBacklogToCsv(report))) {
      // Quote-aware: 'Data Science, ML & AI' has an embedded comma that must be quoted.
      expect(countCsvFields(line)).toBe(CALIBRATION_BACKLOG_CSV_HEADERS.length);
    }
  });

  it('carries the raw counts and cold_pct through faithfully', () => {
    // released=4, calibratable=3, seeded=1 -> cold_backlog=2, cold_pct=round(2/3*100)=67
    const report = computeCalibrationBacklog(
      [row('AWS Lambda', { released: 4, with_irt_params: 3, with_empirical_data: 1 })],
      FIXED,
    );
    const csv = calibrationBacklogToCsv(report);
    const target = report.families.find((f) => f.released === 4);
    expect(target).toBeDefined();
    expect(csv).toContain(`,4,3,1,2,67`);
  });

  it('preserves the report worst-first family order in row order', () => {
    const report = computeCalibrationBacklog(
      [
        row('AWS Lambda', { released: 10, with_irt_params: 10, with_empirical_data: 0 }), // cold_backlog 10
        row('React', { released: 5, with_irt_params: 5, with_empirical_data: 2 }), // cold_backlog 3
      ],
      FIXED,
    );
    const lines = parseLines(calibrationBacklogToCsv(report));
    // The data rows (between header and TOTAL) must echo report.families order.
    const dataRows = lines.slice(1, -1);
    const csvFirstCols = dataRows.map((l) => l.split(',')[0]);
    const reportFamilyOrder = report.families.map((f) => f.family);
    expect(csvFirstCols).toEqual(reportFamilyOrder);
  });

  it('echoes generated_at in the TOTAL row family_name column', () => {
    const report = computeCalibrationBacklog([], FIXED);
    const csv = calibrationBacklogToCsv(report);
    expect(csv).toContain(`TOTAL,generated_at=${FIXED.toISOString()},`);
  });

  it('RFC 4180-quotes a family_name containing a comma or quote', () => {
    const report: CalibrationBacklogReport = {
      families: [
        {
          family: 'other',
          family_name: 'Other, "misc"',
          released: 1,
          calibratable: 1,
          seeded: 0,
          cold_backlog: 1,
          cold_pct: 100,
        },
      ],
      totals: {
        released: 1,
        calibratable: 1,
        seeded: 0,
        cold_backlog: 1,
        cold_pct: 100,
      },
      generated_at: FIXED.toISOString(),
    };
    const csv = calibrationBacklogToCsv(report);
    // comma + doubled embedded quotes, wrapped in quotes
    expect(csv).toContain('"Other, ""misc"""');
  });

  it('produces output round-trippable into equal-length records', () => {
    const report = computeCalibrationBacklog(
      [
        row('Kubernetes', {
          released: 7,
          with_irt_params: 7,
          with_empirical_data: 3,
        }),
      ],
      FIXED,
    );
    const lines = parseLines(calibrationBacklogToCsv(report));
    const headerCols = countCsvFields(lines[0]);
    expect(headerCols).toBe(7);
    // Every row matches the header width once quote-aware field counting is used.
    for (const line of lines.slice(1)) {
      expect(countCsvFields(line)).toBe(headerCols);
    }
  });
});
