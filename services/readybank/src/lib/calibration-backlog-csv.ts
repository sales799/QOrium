// Pure CSV serialisation of the per-skill-family calibration BACKLOG report
// (lib/calibration-backlog.ts) for the admin console (N8) and the
// calibration-volume program (N19).
//
// The operator already has the JSON endpoint /v1/admin/calibration-backlog;
// this companion shaper turns the SAME worst-first cold-backlog report into an
// RFC 4180 CSV so the reference-panel seeding to-do list can be pulled straight
// into a spreadsheet for calibration-volume planning — one row per buyer-facing
// family (already sorted worst-first in the report) plus a TOTAL row, with the
// four raw counts and the cold_pct integer percentage.
//
// DB-free and side-effect-free so it can be unit-tested exhaustively without a
// pool; the route stays a thin adapter that fetches the report and serialises.

import type { CalibrationBacklogReport } from './calibration-backlog.js';

/** Column headers, in emit order. Stable — downstream sheets key off these. */
export const CALIBRATION_BACKLOG_CSV_HEADERS = [
  'family',
  'family_name',
  'released',
  'calibratable',
  'seeded',
  'cold_backlog',
  'cold_pct',
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
 * Serialise a CalibrationBacklogReport to CSV text.
 *
 * Layout: a header row, one row per family (already sorted worst-first — largest
 * cold backlog first — in the report), then a final TOTAL row whose `family` is
 * `TOTAL` and whose `family_name` echoes the generated_at timestamp so the
 * export is self-describing. Lines are joined with CRLF per RFC 4180 and the
 * document ends with a trailing CRLF.
 */
export function calibrationBacklogToCsv(report: CalibrationBacklogReport): string {
  const lines: string[] = [];
  lines.push(rowToCsv([...CALIBRATION_BACKLOG_CSV_HEADERS]));

  for (const fam of report.families) {
    lines.push(
      rowToCsv([
        fam.family,
        fam.family_name,
        fam.released,
        fam.calibratable,
        fam.seeded,
        fam.cold_backlog,
        fam.cold_pct,
      ]),
    );
  }

  const t = report.totals;
  lines.push(
    rowToCsv([
      'TOTAL',
      `generated_at=${report.generated_at}`,
      t.released,
      t.calibratable,
      t.seeded,
      t.cold_backlog,
      t.cold_pct,
    ]),
  );

  return lines.join('\r\n') + '\r\n';
}
