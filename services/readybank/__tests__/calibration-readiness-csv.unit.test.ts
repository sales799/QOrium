import { describe, expect, it } from 'vitest';
import {
  calibrationReadinessToCsv,
  CALIBRATION_READINESS_CSV_HEADERS,
} from '../src/lib/calibration-readiness-csv.js';
import {
  computeCalibrationReadiness,
  REFIT_THRESHOLD,
  type CalibrationReadinessReport,
  type SkillReadinessRow,
} from '../src/lib/calibration-readiness.js';
import { SKILL_FAMILIES } from '../src/lib/skill-families.js';

/**
 * N8/N19 calibration-readiness CSV — pure RFC 4180 serialisation of the worst-
 * first readiness-tiering report produced by computeCalibrationReadiness(). No
 * DB needed: the tests prove the CSV is well-formed (header + one row per family
 * + a TOTAL row), CRLF-framed, trailing-CRLF-terminated, that the worst-first
 * (needs_responses descending) family order is preserved, that the calibrated/
 * thin/cold tier counts and calibrated_pct ride through faithfully, that the
 * refit_threshold + generated_at are echoed in the TOTAL row, and that every
 * cell is RFC-4180-safe even when a family_name contains a comma or quote.
 */

const FIXED = new Date('2026-06-13T00:00:00.000Z');

function row(skill: string, partial: Partial<SkillReadinessRow> = {}): SkillReadinessRow {
  return {
    skill,
    released: 0,
    with_irt_params: 0,
    refit_ready: 0,
    thin: 0,
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

describe('calibrationReadinessToCsv', () => {
  it('emits a header row, one row per family, and a TOTAL row', () => {
    const report = computeCalibrationReadiness([], FIXED);
    const lines = parseLines(calibrationReadinessToCsv(report));
    // header + every family + TOTAL
    expect(lines).toHaveLength(1 + SKILL_FAMILIES.length + 1);
    expect(lines[0]).toBe(CALIBRATION_READINESS_CSV_HEADERS.join(','));
    const last = lines[lines.length - 1];
    expect(last.startsWith('TOTAL,')).toBe(true);
  });

  it('every line has exactly nine columns', () => {
    const report = computeCalibrationReadiness(
      [
        row('AWS Lambda', { released: 10, with_irt_params: 10, refit_ready: 4, thin: 3 }),
        row('React', { released: 4, with_irt_params: 4 }),
      ],
      FIXED,
    );
    for (const line of parseLines(calibrationReadinessToCsv(report))) {
      // Quote-aware: 'Data Science, ML & AI' has an embedded comma that must be quoted.
      expect(countCsvFields(line)).toBe(CALIBRATION_READINESS_CSV_HEADERS.length);
    }
  });

  it('carries the tier counts and calibrated_pct through faithfully', () => {
    // released=10, calibratable=10, calibrated=4, thin=3 -> cold=3,
    // needs_responses=cold+thin=6, calibrated_pct=round(4/10*100)=40
    const report = computeCalibrationReadiness(
      [row('AWS Lambda', { released: 10, with_irt_params: 10, refit_ready: 4, thin: 3 })],
      FIXED,
    );
    const csv = calibrationReadinessToCsv(report);
    const target = report.families.find((f) => f.released === 10);
    expect(target).toBeDefined();
    // family,family_name,released,calibratable,calibrated,thin,cold,needs_responses,calibrated_pct
    expect(csv).toContain(`,10,10,4,3,3,6,40`);
  });

  it('preserves the report worst-first family order in row order', () => {
    const report = computeCalibrationReadiness(
      [
        // calibratable 10, calibrated 0, thin 0 -> needs_responses 10
        row('AWS Lambda', { released: 10, with_irt_params: 10 }),
        // calibratable 5, calibrated 2, thin 0 -> cold 3, needs_responses 3
        row('React', { released: 5, with_irt_params: 5, refit_ready: 2 }),
      ],
      FIXED,
    );
    const lines = parseLines(calibrationReadinessToCsv(report));
    // The data rows (between header and TOTAL) must echo report.families order.
    const dataRows = lines.slice(1, -1);
    const csvFirstCols = dataRows.map((l) => l.split(',')[0]);
    const reportFamilyOrder = report.families.map((f) => f.family);
    expect(csvFirstCols).toEqual(reportFamilyOrder);
  });

  it('echoes the refit_threshold and generated_at in the TOTAL row family_name column', () => {
    const report = computeCalibrationReadiness([], FIXED);
    const csv = calibrationReadinessToCsv(report);
    expect(csv).toContain(
      `TOTAL,refit_threshold=${REFIT_THRESHOLD};generated_at=${FIXED.toISOString()},`,
    );
  });

  it('RFC 4180-quotes a family_name containing a comma or quote', () => {
    const report: CalibrationReadinessReport = {
      refit_threshold: REFIT_THRESHOLD,
      families: [
        {
          family: 'other',
          family_name: 'Other, "misc"',
          released: 1,
          calibratable: 1,
          calibrated: 0,
          thin: 0,
          cold: 1,
          needs_responses: 1,
          calibrated_pct: 0,
        },
      ],
      totals: {
        released: 1,
        calibratable: 1,
        calibrated: 0,
        thin: 0,
        cold: 1,
        needs_responses: 1,
        calibrated_pct: 0,
      },
      generated_at: FIXED.toISOString(),
    };
    const csv = calibrationReadinessToCsv(report);
    // comma + doubled embedded quotes, wrapped in quotes
    expect(csv).toContain('"Other, ""misc"""');
  });

  it('produces output round-trippable into equal-length records', () => {
    const report = computeCalibrationReadiness(
      [
        row('Kubernetes', {
          released: 7,
          with_irt_params: 7,
          refit_ready: 3,
          thin: 2,
        }),
      ],
      FIXED,
    );
    const lines = parseLines(calibrationReadinessToCsv(report));
    const headerCols = countCsvFields(lines[0]);
    expect(headerCols).toBe(9);
    // Every row matches the header width once quote-aware field counting is used.
    for (const line of lines.slice(1)) {
      expect(countCsvFields(line)).toBe(headerCols);
    }
  });
});
