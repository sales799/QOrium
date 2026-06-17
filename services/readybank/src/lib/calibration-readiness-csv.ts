// Pure CSV serialisation of the per-skill-family calibration READINESS report
// (lib/calibration-readiness.ts) for the admin console (N8) and the
// calibration-volume program (N19).
//
// The operator already has the JSON endpoint /v1/admin/calibration-readiness;
// this companion shaper turns the SAME worst-first readiness-tiering report
// into an RFC 4180 CSV so the reference-panel seeding to-do list — split into
// calibrated / thin / cold tiers against the BR-4 refit threshold — can be
// pulled straight into a spreadsheet for calibration-volume planning. One row
// per buyer-facing family (already sorted worst-first by needs_responses in the
// report) plus a TOTAL row, carrying the released/calibratable/calibrated/thin/
// cold/needs_responses raw counts and the calibrated_pct integer percentage.
//
// The report's refit_threshold is not a per-family column; it is emitted in the
// TOTAL row's family_name alongside generated_at so the export is fully self-
// describing without widening every data row.
//
// DB-free and side-effect-free so it can be unit-tested exhaustively without a
// pool; the route stays a thin adapter that fetches the report and serialises.

import type { CalibrationReadinessReport } from './calibration-readiness.js';

/** Column headers, in emit order. Stable — downstream sheets key off these. */
export const CALIBRATION_READINESS_CSV_HEADERS = [
  'family',
  'family_name',
  'released',
  'calibratable',
  'calibrated',
  'thin',
  'cold',
  'needs_responses',
  'calibrated_pct',
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
 * Serialise a CalibrationReadinessReport to CSV text.
 *
 * Layout: a header row, one row per family (already sorted worst-first — largest
 * needs_responses first — in the report), then a final TOTAL row whose `family`
 * is `TOTAL` and whose `family_name` echoes the refit_threshold and generated_at
 * timestamp so the export is self-describing. Lines are joined with CRLF per RFC
 * 4180 and the document ends with a trailing CRLF.
 */
export function calibrationReadinessToCsv(report: CalibrationReadinessReport): string {
  const lines: string[] = [];
  lines.push(rowToCsv([...CALIBRATION_READINESS_CSV_HEADERS]));

  for (const fam of report.families) {
    lines.push(
      rowToCsv([
        fam.family,
        fam.family_name,
        fam.released,
        fam.calibratable,
        fam.calibrated,
        fam.thin,
        fam.cold,
        fam.needs_responses,
        fam.calibrated_pct,
      ]),
    );
  }

  const t = report.totals;
  lines.push(
    rowToCsv([
      'TOTAL',
      `refit_threshold=${report.refit_threshold};generated_at=${report.generated_at}`,
      t.released,
      t.calibratable,
      t.calibrated,
      t.thin,
      t.cold,
      t.needs_responses,
      t.calibrated_pct,
    ]),
  );

  return lines.join('\r\n') + '\r\n';
}
