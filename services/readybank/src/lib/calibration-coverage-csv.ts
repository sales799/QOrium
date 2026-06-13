// Pure CSV serialisation of the per-skill-family calibration-coverage report
// (lib/calibration-coverage.ts) for the admin console (N8) and the
// calibration-volume program (N19).
//
// The operator already has the JSON endpoint /v1/admin/calibration-coverage;
// this companion shaper turns the SAME report into an RFC 4180 CSV so the
// cold-loop family breakdown can be pulled straight into a spreadsheet for
// calibration-volume planning — one row per buyer-facing family plus a TOTAL
// row, with the four raw counts and the three integer coverage percentages.
//
// DB-free and side-effect-free so it can be unit-tested exhaustively without a
// pool; the route stays a thin adapter that fetches the report and serialises.

import type { CalibrationCoverageReport } from './calibration-coverage.js';

/** Column headers, in emit order. Stable — downstream sheets key off these. */
export const CALIBRATION_COVERAGE_CSV_HEADERS = [
  'family',
  'family_name',
  'released',
  'with_irt_params',
  'with_empirical_data',
  'refit_ready',
  'irt_params_pct',
  'empirical_pct',
  'refit_ready_pct',
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
 * Serialise a CalibrationCoverageReport to CSV text.
 *
 * Layout: a header row, one row per family (already sorted by released volume
 * in the report), then a final TOTAL row whose `family` is `TOTAL` and whose
 * `family_name` echoes the generated_at timestamp so the export is
 * self-describing. Lines are joined with CRLF per RFC 4180 and the document
 * ends with a trailing CRLF.
 */
export function calibrationCoverageToCsv(report: CalibrationCoverageReport): string {
  const lines: string[] = [];
  lines.push(rowToCsv([...CALIBRATION_COVERAGE_CSV_HEADERS]));

  for (const fam of report.families) {
    lines.push(
      rowToCsv([
        fam.family,
        fam.family_name,
        fam.released,
        fam.with_irt_params,
        fam.with_empirical_data,
        fam.refit_ready,
        fam.irt_params_pct,
        fam.empirical_pct,
        fam.refit_ready_pct,
      ]),
    );
  }

  const t = report.totals;
  lines.push(
    rowToCsv([
      'TOTAL',
      `generated_at=${report.generated_at}`,
      t.released,
      t.with_irt_params,
      t.with_empirical_data,
      t.refit_ready,
      t.irt_params_pct,
      t.empirical_pct,
      t.refit_ready_pct,
    ]),
  );

  return lines.join('\r\n') + '\r\n';
}
