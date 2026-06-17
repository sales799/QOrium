import { describe, expect, it } from 'vitest';
import { proofStatsToCsv, PROOF_STATS_CSV_HEADERS } from '../src/lib/proof-stats-csv.js';
import type { ProofStats } from '../src/repositories/proof-stats.js';

/**
 * N19/N14 proof-stats CSV — pure RFC 4180 serialisation of the public proof
 * funnel aggregate (repositories/proof-stats.ts -> ProofStats). No DB needed:
 * the tests prove the CSV is well-formed (a header row + exactly one data row),
 * CRLF-framed, trailing-CRLF-terminated, that every cell is RFC-4180-safe, and
 * that the aggregate's counts and timestamp are carried through faithfully.
 */

const GEN_AT = '2026-06-13T00:00:00.000Z';

function stats(overrides: Partial<ProofStats> = {}): ProofStats {
  return {
    assessments_created: 0,
    candidates_invited: 0,
    assessments_taken: 0,
    attempts_graded: 0,
    questions_released: 0,
    questions_calibrated: 0,
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

describe('proofStatsToCsv', () => {
  it('emits exactly a header row and one data row', () => {
    const csv = proofStatsToCsv(stats({ assessments_created: 12, assessments_taken: 7 }));
    const lines = parseLines(csv);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(PROOF_STATS_CSV_HEADERS.join(','));
  });

  it('both lines have exactly seven columns', () => {
    const csv = proofStatsToCsv(stats({ candidates_invited: 5, attempts_graded: 3 }));
    for (const line of parseLines(csv)) {
      expect(countCsvFields(line)).toBe(PROOF_STATS_CSV_HEADERS.length);
    }
  });

  it('carries the raw funnel counts through faithfully in header order', () => {
    const csv = proofStatsToCsv(
      stats({
        assessments_created: 42,
        candidates_invited: 130,
        assessments_taken: 96,
        attempts_graded: 88,
        questions_released: 1417,
        questions_calibrated: 5,
      }),
    );
    expect(csv).toContain('42,130,96,88,1417,5,');
  });

  it('echoes the generated_at timestamp in the data row', () => {
    const csv = proofStatsToCsv(stats({ assessments_created: 1 }));
    expect(csv).toContain(`,${GEN_AT}\r\n`);
  });

  it('emits an all-zero data row for an empty platform', () => {
    const csv = proofStatsToCsv(stats());
    const lines = parseLines(csv);
    expect(lines[1]).toBe(`0,0,0,0,0,0,${GEN_AT}`);
  });

  it('RFC 4180-quotes a generated_at value containing a comma', () => {
    // Defensive: csvField must quote any field with a comma even though a real
    // ISO timestamp never contains one.
    const csv = proofStatsToCsv(stats({ generated_at: 'June 13, 2026' }));
    expect(csv).toContain('"June 13, 2026"');
  });

  it('produces output round-trippable into equal-length records', () => {
    const csv = proofStatsToCsv(
      stats({ assessments_created: 9, candidates_invited: 9, assessments_taken: 9 }),
    );
    const lines = parseLines(csv);
    const widths = lines.map(countCsvFields);
    expect(new Set(widths).size).toBe(1);
  });
});
