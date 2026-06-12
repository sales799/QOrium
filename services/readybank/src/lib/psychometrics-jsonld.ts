// Pure shaping for the public machine-readable psychometrics surface (N14 AEO / N19).
//
// QOrium's core positioning is "psychometrically-defensible": every released
// item should carry IRT parameters and accumulate real response data until it
// can be refit. The public /v1/proof/psychometrics endpoint already exposes
// that honest coverage report; this helper re-expresses the same numbers as a
// schema.org `Dataset` JSON-LD document so AI answer engines and search
// crawlers can discover and cite how calibrated QOrium's live bank actually is
// without scraping HTML. It adds NO new data -- it is a presenter over the
// existing PsychometricsCoverage -- and is deliberately DB-free so it can be
// unit-tested exhaustively without a pool.

import type { PsychometricsCoverage } from './psychometrics-coverage.js';

/** Canonical public origin for the platform. */
const QORIUM_URL = 'https://qorium.online';

/** Clamp to a non-negative integer; treats NaN / negatives / junk as 0. */
function clampCount(v: number): number {
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
}

/** Clamp a percentage to an integer in [0, 100]; junk becomes 0. */
function clampPct(v: number): number {
  if (!Number.isFinite(v) || v <= 0) return 0;
  return Math.min(100, Math.floor(v));
}

/** One schema.org PropertyValue measurement. */
interface JsonLdMeasurement {
  '@type': 'PropertyValue';
  name: string;
  description: string;
  value: number;
  unitText?: 'percent';
}

/** The schema.org Dataset document shape we emit (typed, not `any`). */
export interface PsychometricsJsonLd {
  '@context': 'https://schema.org';
  '@type': 'Dataset';
  name: string;
  description: string;
  url: string;
  creator: {
    '@type': 'Organization';
    name: string;
    url: string;
  };
  isAccessibleForFree: true;
  dateModified: string;
  variableMeasured: JsonLdMeasurement[];
}

const count = (name: string, description: string, value: number): JsonLdMeasurement => ({
  '@type': 'PropertyValue',
  name,
  description,
  value: clampCount(value),
});

const percent = (name: string, description: string, value: number): JsonLdMeasurement => ({
  '@type': 'PropertyValue',
  name,
  description,
  value: clampPct(value),
  unitText: 'percent',
});

/**
 * Re-express the public psychometrics-coverage report as schema.org JSON-LD.
 * Counts are sanitized to non-negative integers and percentages to integers in
 * [0, 100], so the published document is always well-formed even if the upstream
 * shaper somehow carries nulls, negatives, or junk. `dateModified` carries the
 * snapshot timestamp from the coverage report when present so the JSON-LD and
 * the JSON surface agree, falling back to the supplied clock.
 */
export function buildPsychometricsJsonLd(
  coverage: PsychometricsCoverage,
  now: Date = new Date(),
): PsychometricsJsonLd {
  const dateModified =
    typeof coverage.generated_at === 'string' && coverage.generated_at.length > 0
      ? coverage.generated_at
      : now.toISOString();

  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'QOrium psychometric calibration coverage',
    description:
      'Aggregate, anonymous psychometric coverage for QOrium — India-built, ' +
      'psychometrically-defensible, AI-graded skills assessments. How many ' +
      'released items carry IRT parameters, hold empirical response data, and ' +
      'cross the IRT-refit threshold, with no question content or candidate PII.',
    url: `${QORIUM_URL}/proof`,
    creator: {
      '@type': 'Organization',
      name: 'QOrium',
      url: QORIUM_URL,
    },
    isAccessibleForFree: true,
    dateModified,
    variableMeasured: [
      count(
        'questions_released',
        'Released, readybank-SKU items in the live bank.',
        coverage.questions_released,
      ),
      count(
        'with_irt_params',
        'Released items carrying an IRT difficulty parameter.',
        coverage.with_irt_params,
      ),
      count(
        'with_empirical_data',
        'Released items with any empirical response data (calibration_n > 0).',
        coverage.with_empirical_data,
      ),
      count(
        'refit_ready',
        'Released items past the IRT-refit threshold (calibration_n >= 30).',
        coverage.refit_ready,
      ),
      percent(
        'irt_params_pct',
        'Percent of released items carrying IRT parameters.',
        coverage.irt_params_pct,
      ),
      percent(
        'empirical_pct',
        'Percent of released items with any empirical response data.',
        coverage.empirical_pct,
      ),
      percent(
        'refit_ready_pct',
        'Percent of released items past the IRT-refit threshold.',
        coverage.refit_ready_pct,
      ),
    ],
  };
}
