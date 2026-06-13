// Pure CSV serialisation of the PUBLIC proof-stats aggregate
// (repositories/proof-stats.ts -> ProofStats) for the calibration-volume
// program (N19) and AEO / data-portability (N14).
//
// The public surface already exposes the proof funnel as JSON
// (/v1/proof/stats) and as schema.org Dataset JSON-LD (/v1/proof/stats.jsonld).
// This companion shaper turns the SAME aggregate into an RFC 4180 CSV so an
// anonymous verifier, analyst, or crawler can pull the live Customer-Zero proof
// funnel straight into a spreadsheet — completing the public proof export trio
// (JSON + JSON-LD + CSV) for the stats surface, exactly as the calibration
// surface already ships all three and as the admin coverage/backlog/readiness
// surfaces each ship a JSON twin and a CSV twin.
//
// Like the calibration-progress CSV this aggregate is a SINGLE record, so the
// CSV is intentionally two lines: a header row and one data row. It is DB-free
// and side-effect-free so it can be unit-tested exhaustively without a pool; the
// route stays a thin adapter that fetches the stats and serialises.

import type { ProofStats } from '../repositories/proof-stats.js';

/** Column headers, in emit order. Stable — downstream sheets key off these. */
export const PROOF_STATS_CSV_HEADERS = [
  'assessments_created',
  'candidates_invited',
  'assessments_taken',
  'attempts_graded',
  'questions_released',
  'questions_calibrated',
  'generated_at',
] as const;

/**
 * Quote a single CSV field per RFC 4180: wrap in double quotes and double any
 * embedded quote whenever the value contains a quote, comma, CR or LF; numbers
 * and clean identifiers pass through bare. Always coerces to string first so a
 * stray nullish value can never emit "undefined" mid-row.
 */
function csvField(value: string | number): string {
  const s = String(value ?? '');
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowToCsv(cells: Array<string | number>): string {
  return cells.map(csvField).join(',');
}

/**
 * Serialise a ProofStats aggregate to CSV text.
 *
 * Layout: a header row followed by exactly one data row carrying the six funnel
 * counts and the snapshot timestamp (the timestamp is RFC-4180 quoted by
 * csvField only if it ever contained a comma — an ISO-8601 instant does not, so
 * in practice it passes through bare). Lines are joined with CRLF per RFC 4180
 * and the document ends with a trailing CRLF, matching every other proof /
 * calibration CSV export on the platform.
 */
export function proofStatsToCsv(stats: ProofStats): string {
  const lines: string[] = [];
  lines.push(rowToCsv([...PROOF_STATS_CSV_HEADERS]));
  lines.push(
    rowToCsv([
      stats.assessments_created,
      stats.candidates_invited,
      stats.assessments_taken,
      stats.attempts_graded,
      stats.questions_released,
      stats.questions_calibrated,
      stats.generated_at,
    ]),
  );
  return lines.join('\r\n') + '\r\n';
}
