import { describe, expect, it } from 'vitest';
import {
  calibrationCoverageToCsv,
  CALIBRATION_COVERAGE_CSV_HEADERS,
} from '../src/lib/calibration-coverage-csv.js';
import {
  computeCalibrationCoverage,
  type CalibrationCoverageReport,
  type SkillCalibrationRow,
} from '../src/lib/calibration-coverage.js';
import { SKILL_FAMILIES } from '../src/lib/skill-families.js';

/**
 * N8/N19 calibration-coverage CSV — pure RFC 4180 serialisation of the report
 * produced by computeCalibrationCoverage(). No DB needed: the tests prove the
 * CSV is well-formed (header + one row per family + a TOTAL row), CRLF-framed,
 * trailing-CRLF-terminated, and that every cell is RFC-4180-safe even when a
 * family_name contains a comma or quote.
 */

const FIXED = new Date('2026-06-12T00:00:00.000Z');

function row(skill: string, partial: Partial<SkillCalibrationRow> = {}): SkillCalibrationRow {
  return {
    skill,
    released: 0,
    with_irt_params: 0,
    with_empirical_data: 0,
    refit_ready: 0,
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

describe('calibrationCoverageToCsv', () => {
  it('emits a header row, one row per family, and a TOTAL row', () => {
    const report = computeCalibrationCoverage([], FIXED);
    const lines = parseLines(calibrationCoverageToCsv(report));
    // header + every family + TOTAL
    expect(lines).toHaveLength(1 + SKILL_FAMILIES.length + 1);
    expect(lines[0]).toBe(CALIBRATION_COVERAGE_CSV_HEADERS.join(','));
    const last = lines[lines.length - 1];
    expect(last.startsWith('TOTAL,')).toBe(true);
  });

  it('every line has exactly nine columns', () => {
    const report = computeCalibrationCoverage(
      [
        row('AWS Lambda', { released: 10, with_irt_params: 10, with_empirical_data: 2 }),
        row('React', { released: 4, with_irt_params: 4 }),
      ],
      FIXED,
    );
    for (const line of parseLines(calibrationCoverageToCsv(report))) {
      // Quote-aware: 'Data Science, ML & AI' has an embedded comma that must be quoted.
      expect(countCsvFields(line)).toBe(CALIBRATION_COVERAGE_CSV_HEADERS.length);
    }
  });

  it('carries the raw counts and percentages through faithfully', () => {
    const report = computeCalibrationCoverage(
      [row('AWS Lambda', { released: 4, with_irt_params: 3, with_empirical_data: 1 })],
      FIXED,
    );
    const csv = calibrationCoverageToCsv(report);
    const target = report.families.find((f) => f.released === 4);
    expect(target).toBeDefined();
    // released=4, irt=3 -> 75%, empirical=1 -> 25%
    expect(csv).toContain(`,4,3,1,0,75,25,0`);
  });

  it('echoes generated_at in the TOTAL row family_name column', () => {
    const report = computeCalibrationCoverage([], FIXED);
    const csv = calibrationCoverageToCsv(report);
    expect(csv).toContain(`TOTAL,generated_at=${FIXED.toISOString()},`);
  });

  it('RFC 4180-quotes a family_name containing a comma or quote', () => {
    const report: CalibrationCoverageReport = {
      families: [
        {
          family: 'other',
          family_name: 'Other, "misc"',
          released: 1,
          with_irt_params: 1,
          with_empirical_data: 0,
          refit_ready: 0,
          irt_params_pct: 100,
          empirical_pct: 0,
          refit_ready_pct: 0,
        },
      ],
      totals: {
        released: 1,
        with_irt_params: 1,
        with_empirical_data: 0,
        refit_ready: 0,
        irt_params_pct: 100,
        empirical_pct: 0,
        refit_ready_pct: 0,
      },
      generated_at: FIXED.toISOString(),
    };
    const csv = calibrationCoverageToCsv(report);
    // comma + doubled embedded quotes, wrapped in quotes
    expect(csv).toContain('"Other, ""misc"""');
  });

  it('produces output round-trippable into equal-length records', () => {
    const report = computeCalibrationCoverage(
      [
        row('Kubernetes', {
          released: 7,
          with_irt_params: 7,
          with_empirical_data: 3,
          refit_ready: 1,
        }),
      ],
      FIXED,
    );
    const lines = parseLines(calibrationCoverageToCsv(report));
    const headerCols = countCsvFields(lines[0]);
    expect(headerCols).toBe(9);
    // Every row matches the header width once quote-aware field counting is used.
    for (const line of lines.slice(1)) {
      expect(countCsvFields(line)).toBe(headerCols);
    }
  });
});
