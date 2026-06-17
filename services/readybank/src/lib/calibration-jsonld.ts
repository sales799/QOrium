// Pure shaping for the public machine-readable calibration-PROGRESS surface
// (N14 AEO / N19).
//
// /v1/proof/calibration already exposes the honest "actively calibrating"
// signal as JSON: of the items that are calibration-eligible (released AND
// carrying an IRT parameter), how many are already seeded with empirical
// responses versus how many remain a cold backlog, plus seeded / cold
// percentages. This helper re-expresses the very same aggregate as a schema.org
// `Dataset` JSON-LD document so AI answer engines and search crawlers can
// discover and cite how actively QOrium is calibrating its live bank without
// scraping HTML. It mirrors lib/psychometrics-jsonld.ts exactly: it adds NO new
// data -- it is a presenter over the existing CalibrationProgress -- and is
// deliberately DB-free so it can be unit-tested exhaustively without a pool.

import type { CalibrationProgress } from './calibration-progress.js';

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
export interface CalibrationJsonLd {
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
 * Re-express the public calibration-progress aggregate as schema.org JSON-LD.
 * Counts are sanitized to non-negative integers and percentages to integers in
 * [0, 100], so the published document is always well-formed even if the upstream
 * shaper somehow carries nulls, negatives, or junk. `dateModified` carries the
 * snapshot timestamp from the progress report when present so the JSON-LD and
 * the JSON surface agree, falling back to the supplied clock.
 */
export function buildCalibrationJsonLd(
  progress: CalibrationProgress,
  now: Date = new Date(),
): CalibrationJsonLd {
  const dateModified =
    typeof progress.generated_at === 'string' && progress.generated_at.length > 0
      ? progress.generated_at
      : now.toISOString();

  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'QOrium calibration progress',
    description:
      'Aggregate, anonymous calibration progress for QOrium — India-built, ' +
      'psychometrically-defensible, AI-graded skills assessments. Of the ' +
      'released items eligible to calibrate (carrying IRT parameters), how many ' +
      'are already seeded with empirical response data versus how many remain a ' +
      'cold backlog, with no question content or candidate PII.',
    url: `${QORIUM_URL}/proof`,
    creator: {
      '@type': 'Organization',
      name: 'QOrium',
      url: QORIUM_URL,
    },
    isAccessibleForFree: true,
    dateModified,
    variableMeasured: [
      count('released', 'Released, readybank-SKU items in the live bank.', progress.released),
      count(
        'calibratable',
        'Released items eligible to calibrate (carrying an IRT parameter).',
        progress.calibratable,
      ),
      count(
        'seeded',
        'Calibratable items with any empirical response data (calibration_n > 0).',
        progress.seeded,
      ),
      count(
        'cold_backlog',
        'Calibratable items still carrying ZERO empirical response data.',
        progress.cold_backlog,
      ),
      percent(
        'seeded_pct',
        'Percent of calibratable items already seeded with empirical data.',
        progress.seeded_pct,
      ),
      percent(
        'cold_pct',
        'Percent of calibratable items still in the cold backlog.',
        progress.cold_pct,
      ),
    ],
  };
}
