// Pure shaping for the public machine-readable proof surface (N14 AEO / N13).
//
// QOrium's public proof funnel (/v1/proof/stats) already exposes honest,
// aggregate, anonymous platform activity. This helper re-expresses those same
// counts as a schema.org `Dataset` JSON-LD document so AI answer engines and
// search crawlers can discover and cite "how much real assessing has happened
// on QOrium" without scraping HTML. It adds NO new data — it is a presenter
// over the existing ProofStats — and is deliberately DB-free so it can be
// unit-tested exhaustively without a pool.

import type { ProofStats } from '../repositories/proof-stats.js';

/** Canonical public origin for the platform. */
const QORIUM_URL = 'https://qorium.online';

/** Clamp to a non-negative integer; treats NaN / negatives / junk as 0. */
function clampCount(v: number): number {
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
}

/** One schema.org PropertyValue measurement. */
interface JsonLdMeasurement {
  '@type': 'PropertyValue';
  name: string;
  description: string;
  value: number;
}

/** The schema.org Dataset document shape we emit (typed, not `any`). */
export interface ProofStatsJsonLd {
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

const measure = (name: string, description: string, value: number): JsonLdMeasurement => ({
  '@type': 'PropertyValue',
  name,
  description,
  value: clampCount(value),
});

/**
 * Re-express the public proof funnel as schema.org JSON-LD. Every count is
 * sanitized to a non-negative integer so the published document is always
 * well-formed even if the upstream query returns nulls, negatives, or junk.
 * `dateModified` carries the snapshot timestamp from ProofStats when present so
 * the JSON-LD and the JSON surface agree, falling back to now.
 */
export function buildProofStatsJsonLd(stats: ProofStats, now: Date = new Date()): ProofStatsJsonLd {
  const dateModified =
    typeof stats.generated_at === 'string' && stats.generated_at.length > 0
      ? stats.generated_at
      : now.toISOString();

  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'QOrium platform assessment activity',
    description:
      'Aggregate, anonymous proof-of-activity for QOrium — India-built, ' +
      'psychometrically-defensible, AI-graded skills assessments. Platform-wide ' +
      'funnel counts with no tenant breakdown, candidate PII, or question content.',
    url: `${QORIUM_URL}/proof`,
    creator: {
      '@type': 'Organization',
      name: 'QOrium',
      url: QORIUM_URL,
    },
    isAccessibleForFree: true,
    dateModified,
    variableMeasured: [
      measure(
        'assessments_created',
        'Total assessments created across the platform.',
        stats.assessments_created,
      ),
      measure(
        'candidates_invited',
        'Total candidate invitations issued.',
        stats.candidates_invited,
      ),
      measure(
        'assessments_taken',
        'Total attempts started (assessments taken).',
        stats.assessments_taken,
      ),
      measure('attempts_graded', 'Attempts that reached a graded state.', stats.attempts_graded),
      measure(
        'questions_released',
        'Released, readybank-SKU items in the live bank.',
        stats.questions_released,
      ),
      measure(
        'questions_calibrated',
        'Items past the IRT-refit threshold (calibration_n >= 30).',
        stats.questions_calibrated,
      ),
    ],
  };
}
