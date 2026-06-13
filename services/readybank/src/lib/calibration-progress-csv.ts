// Pure CSV serialisation of the PUBLIC calibration-progress aggregate
// (lib/calibration-progress.ts) for the calibration-volume program (N19) and
// AEO / data-portability (N14).
//
// The public surface already exposes the calibration-progress aggregate as JSON
// (/v1/proof/calibration) and as schema.org Dataset JSON-LD
// (/v1/proof/calibration.jsonld). This companion shaper turns the SAME
// aggregate into an RFC 4180 CSV so an anonymous verifier, analyst, or crawler
// can pull the live "how actively is QOrium calibrating" snapshot straight into
// a spreadsheet — completing the public proof export trio (JSON + JSON-LD +
// CSV) for the calibration surface, exactly as the admin coverage/backlog/
// readiness surfaces each ship a JSON twin and a CSV twin.
//
// Unlike the per-family admin exports this aggregate is a SINGLE record, so the
// CSV is intentionally two lines: a header row and one data row. It is DB-free
// and side-effect-free so it can be unit-tested exhaustively without a pool; the
// route stays a thin adapter that fetches the backlog, distils the progress, and
// serialises.

import type { CalibrationProgress } from './calibration-progress.js';

/** Column headers, in emit order. Stable — downstream sheets key off these. */
export const CALIBRATION_PROGRESS_CSV_HEADERS = [
  'released',
  'calibratable',
  'seeded',
  'cold_backlog',
  'seeded_pct',
  'cold_pct',
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
 * Serialise a CalibrationProgress aggregate to CSV text.
 *
 * Layout: a header row followed by exactly one data row carrying the five raw
 * counts/percentages and the snapshot timestamp (the timestamp is RFC-4180
 * quoted by csvField only if it ever contained a comma — an ISO-8601 instant
 * does not, so in practice it passes through bare). Lines are joined with CRLF
 * per RFC 4180 and the document ends with a trailing CRLF, matching every other
 * calibration CSV export on the platform.
 */
export function calibrationProgressToCsv(progress: CalibrationProgress): string {
  const lines: string[] = [];
  lines.push(rowToCsv([...CALIBRATION_PROGRESS_CSV_HEADERS]));
  lines.push(
    rowToCsv([
      progress.released,
      progress.calibratable,
      progress.seeded,
      progress.cold_backlog,
      progress.seeded_pct,
      progress.cold_pct,
      progress.generated_at,
    ]),
  );
  return lines.join('\r\n') + '\r\n';
}
