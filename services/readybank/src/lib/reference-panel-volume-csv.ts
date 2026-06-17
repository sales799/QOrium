// Pure CSV serialisation of the per-skill-family reference-panel ingestion
// VOLUME report (lib/reference-panel-volume.ts) for the admin console (N8) and
// the calibration-volume program (N19).
//
// The operator already has the JSON endpoint /v1/admin/reference-panel-volume;
// this companion shaper turns the SAME panel-ingestion report into an RFC 4180
// CSV so the per-family panel-data progress meter — total panel responses and
// how many released items each family's panel data touches — can be pulled
// straight into a spreadsheet for calibration-volume planning. One row per
// buyer-facing family (already sorted by panel_responses descending in the
// report) plus a TOTAL row carrying the platform-wide distinct-panelist count
// that is not family-additive.
//
// DB-free and side-effect-free so it can be unit-tested exhaustively without a
// pool; the route stays a thin adapter that fetches the report and serialises.

import type { ReferencePanelVolumeReport } from './reference-panel-volume.js';

/** Column headers, in emit order. Stable — downstream sheets key off these. */
export const REFERENCE_PANEL_VOLUME_CSV_HEADERS = [
  'family',
  'family_name',
  'released',
  'panel_responses',
  'questions_with_panel',
  'questions_coverage_pct',
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
 * Serialise a ReferencePanelVolumeReport to CSV text.
 *
 * Layout: a header row, one row per family (already sorted by panel_responses
 * descending — where calibration data is concentrated first — in the report),
 * then a final TOTAL row whose `family` is `TOTAL` and whose `family_name`
 * echoes both the platform-wide distinct_panelists count and the generated_at
 * timestamp so the export is self-describing (distinct panelists span skills
 * and are not family-additive, so they are reported only on the TOTAL row).
 * Lines are joined with CRLF per RFC 4180 and the document ends with a trailing
 * CRLF.
 */
export function referencePanelVolumeToCsv(report: ReferencePanelVolumeReport): string {
  const lines: string[] = [];
  lines.push(rowToCsv([...REFERENCE_PANEL_VOLUME_CSV_HEADERS]));

  for (const fam of report.families) {
    lines.push(
      rowToCsv([
        fam.family,
        fam.family_name,
        fam.released,
        fam.panel_responses,
        fam.questions_with_panel,
        fam.questions_coverage_pct,
      ]),
    );
  }

  const t = report.totals;
  lines.push(
    rowToCsv([
      'TOTAL',
      `distinct_panelists=${t.distinct_panelists};generated_at=${report.generated_at}`,
      t.released,
      t.panel_responses,
      t.questions_with_panel,
      t.questions_coverage_pct,
    ]),
  );

  return lines.join('\r\n') + '\r\n';
}
