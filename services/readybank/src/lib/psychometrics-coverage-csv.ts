// Pure CSV serialisation of the PUBLIC psychometrics-coverage aggregate
// (lib/psychometrics-coverage.ts -> PsychometricsCoverage) for the
// calibration-volume program (N19) and AEO / data-portability (N14).
//
// The public surface already exposes the psychometrics-coverage aggregate as
// JSON (/v1/proof/psychometrics) and as schema.org Dataset JSON-LD
// (/v1/proof/psychometrics.jsonld). This companion shaper turns the SAME
// aggregate into an RFC 4180 CSV so an anonymous verifier, analyst, or crawler
// can pull the live "how psychometrically-calibrated is QOrium's bank" snapshot
// straight into a spreadsheet — completing the public proof export trio
// (JSON + JSON-LD + CSV) for the psychometrics surface, exactly as the stats and
// calibration surfaces already ship all three and as the admin coverage/backlog/
// readiness surfaces each ship a JSON twin and a CSV twin.
//
// Like the proof-stats and calibration-progress CSVs this aggregate is a SINGLE
// record, so the CSV is intentionally two lines: a header row and one data row.
// It is DB-free and side-effect-free so it can be unit-tested exhaustively
// without a pool; the route stays a thin adapter that fetches the coverage and
// serialises.

import type { PsychometricsCoverage } from './psychometrics-coverage.js';

/** Column headers, in emit order. Stable — downstream sheets key off these. */
export const PSYCHOMETRICS_COVERAGE_CSV_HEADERS = [
  'questions_released',
  'with_irt_params',
  'with_empirical_data',
  'refit_ready',
  'irt_params_pct',
  'empirical_pct',
  'refit_ready_pct',
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
 * Serialise a PsychometricsCoverage aggregate to CSV text.
 *
 * Layout: a header row followed by exactly one data row carrying the four raw
 * counts, the three integer coverage percentages, and the snapshot timestamp
 * (the timestamp is RFC-4180 quoted by csvField only if it ever contained a
 * comma — an ISO-8601 instant does not, so in practice it passes through bare).
 * Lines are joined with CRLF per RFC 4180 and the document ends with a trailing
 * CRLF, matching every other proof / calibration CSV export on the platform.
 */
export function psychometricsCoverageToCsv(coverage: PsychometricsCoverage): string {
  const lines: string[] = [];
  lines.push(rowToCsv([...PSYCHOMETRICS_COVERAGE_CSV_HEADERS]));
  lines.push(
    rowToCsv([
      coverage.questions_released,
      coverage.with_irt_params,
      coverage.with_empirical_data,
      coverage.refit_ready,
      coverage.irt_params_pct,
      coverage.empirical_pct,
      coverage.refit_ready_pct,
      coverage.generated_at,
    ]),
  );
  return lines.join('\r\n') + '\r\n';
}
