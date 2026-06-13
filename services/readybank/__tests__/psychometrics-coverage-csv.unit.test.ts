import { describe, expect, it } from 'vitest';
import {
  psychometricsCoverageToCsv,
  PSYCHOMETRICS_COVERAGE_CSV_HEADERS,
} from '../src/lib/psychometrics-coverage-csv.js';
import type { PsychometricsCoverage } from '../src/lib/psychometrics-coverage.js';

/**
 * N19/N14 psychometrics-coverage CSV — pure RFC 4180 serialisation of the public
 * psychometrics-coverage aggregate (lib/psychometrics-coverage.ts ->
 * PsychometricsCoverage). No DB needed: the tests prove the CSV is well-formed
 * (a header row + exactly one data row), CRLF-framed, trailing-CRLF-terminated,
 * that every cell is RFC-4180-safe, and that the aggregate's counts,
 * percentages, and timestamp are carried through faithfully.
 */

const GEN_AT = '2026-06-13T00:00:00.000Z';

function coverage(overrides: Partial<PsychometricsCoverage> = {}): PsychometricsCoverage {
  return {
    questions_released: 0,
    with_irt_params: 0,
    with_empirical_data: 0,
    refit_ready: 0,
    irt_params_pct: 0,
    empirical_pct: 0,
    refit_ready_pct: 0,
    generated_at: GEN_AT,
    ...overrides,
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

describe('psychometricsCoverageToCsv', () => {
  it('emits exactly a header row and one data row', () => {
    const csv = psychometricsCoverageToCsv(
      coverage({ questions_released: 1417, with_irt_params: 1200 }),
    );
    const lines = parseLines(csv);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(PSYCHOMETRICS_COVERAGE_CSV_HEADERS.join(','));
  });

  it('both lines have exactly eight columns', () => {
    const csv = psychometricsCoverageToCsv(coverage({ with_empirical_data: 5, refit_ready: 2 }));
    for (const line of parseLines(csv)) {
      expect(countCsvFields(line)).toBe(PSYCHOMETRICS_COVERAGE_CSV_HEADERS.length);
    }
  });

  it('carries the raw counts and percentages through faithfully in header order', () => {
    const csv = psychometricsCoverageToCsv(
      coverage({
        questions_released: 1417,
        with_irt_params: 1417,
        with_empirical_data: 70,
        refit_ready: 3,
        irt_params_pct: 100,
        empirical_pct: 5,
        refit_ready_pct: 0,
      }),
    );
    expect(csv).toContain('1417,1417,70,3,100,5,0,');
  });

  it('echoes the generated_at timestamp in the data row', () => {
    const csv = psychometricsCoverageToCsv(coverage({ questions_released: 1 }));
    expect(csv).toContain(`,${GEN_AT}\r\n`);
  });

  it('emits an all-zero data row for an empty bank', () => {
    const csv = psychometricsCoverageToCsv(coverage());
    const lines = parseLines(csv);
    expect(lines[1]).toBe(`0,0,0,0,0,0,0,${GEN_AT}`);
  });

  it('RFC 4180-quotes a generated_at value containing a comma', () => {
    // Defensive: csvField must quote any field with a comma even though a real
    // ISO timestamp never contains one.
    const csv = psychometricsCoverageToCsv(coverage({ generated_at: 'June 13, 2026' }));
    expect(csv).toContain('"June 13, 2026"');
  });

  it('produces output round-trippable into equal-length records', () => {
    const csv = psychometricsCoverageToCsv(
      coverage({ questions_released: 9, with_irt_params: 9, with_empirical_data: 9 }),
    );
    const lines = parseLines(csv);
    const widths = lines.map(countCsvFields);
    expect(new Set(widths).size).toBe(1);
  });
});
