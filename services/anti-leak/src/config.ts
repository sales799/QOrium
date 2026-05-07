/**
 * Anti-Leak worker configuration. Resolved at boot from env vars; fail
 * loudly on bad input rather than silently misbehaving.
 */

export interface AntiLeakConfig {
  serviceName: string;
  nodeEnv: 'development' | 'test' | 'production';
  logLevel: string;

  /** Provider for the crawler. `mock` uses an in-memory fixture set;
   *  `serper` calls Serper.dev (requires SERPER_API_KEY). */
  provider: 'mock' | 'serper';
  serperApiKey: string | undefined;

  /** Per-question query budget. Defaults to 5 queries (top-5 longest
   *  unique n-grams) per spec §2.1. */
  queriesPerQuestion: number;
  /** Top-K results to harvest per query. Defaults to 3. */
  resultsPerQuery: number;
  /** Hard upper bound on the number of questions scanned per run.
   *  Set low in dev/test; ramp up in production once SLA verified. */
  maxQuestions: number;

  /** Severity thresholds (cosine here is approximated by Jaccard until
   *  embeddings land — see DELTA in build log). Source: spec §6. */
  thresholdAutoRotate: number; // similarity >= → critical / auto-rotate
  thresholdHighReview: number; // >= → high / SME review
  thresholdMediumReview: number; // >= → medium / SME review
}

function parseProvider(raw: string | undefined): AntiLeakConfig['provider'] {
  if (raw === 'serper') return 'serper';
  return 'mock';
}

function parseEnv(raw: string | undefined): AntiLeakConfig['nodeEnv'] {
  if (raw === 'production' || raw === 'test') return raw;
  return 'development';
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function parseFraction(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : fallback;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AntiLeakConfig {
  const provider = parseProvider(env.ANTILEAK_PROVIDER);
  if (provider === 'serper' && !env.SERPER_API_KEY) {
    throw new Error(
      'ANTILEAK_PROVIDER=serper requires SERPER_API_KEY to be set. ' +
        'Drop the key into .env or switch to ANTILEAK_PROVIDER=mock for dev.',
    );
  }
  return {
    serviceName: 'qorium-anti-leak',
    nodeEnv: parseEnv(env.NODE_ENV),
    logLevel: env.LOG_LEVEL ?? 'info',
    provider,
    serperApiKey: env.SERPER_API_KEY,
    queriesPerQuestion: parsePositiveInt(env.ANTILEAK_QUERIES_PER_Q, 5),
    resultsPerQuery: parsePositiveInt(env.ANTILEAK_RESULTS_PER_QUERY, 3),
    maxQuestions: parsePositiveInt(env.ANTILEAK_MAX_QUESTIONS, 100),
    thresholdAutoRotate: parseFraction(env.ANTILEAK_THRESHOLD_AUTO, 0.92),
    thresholdHighReview: parseFraction(env.ANTILEAK_THRESHOLD_HIGH, 0.85),
    thresholdMediumReview: parseFraction(env.ANTILEAK_THRESHOLD_MEDIUM, 0.7),
  };
}
