/**
 * Runtime config for the leak-crawler service. Like other QOrium services,
 * env validation is done at boot; missing pieces produce a helpful message
 * rather than letting the program limp on.
 */

export interface LeakCrawlerConfig {
  nodeEnv: 'development' | 'test' | 'staging' | 'production';
  databaseUrl: string | undefined;
  searchProvider: 'serper' | 'apify' | 'stub' | undefined;
  serperApiKey: string | undefined;
  apifyToken: string | undefined;
  apifyActorId: string;
  apifyCountryCode: string | undefined;
  apifyLanguageCode: string | undefined;
  /** Per-Apify request timeout. The sync actor endpoint can exceed 60s under load. */
  apifyTimeoutMs: number;
  anthropicApiKey: string | undefined;
  /** Maximum questions scanned per crawl pass. Per spec §10 v0 default is 5,000. */
  maxQuestions: number;
  /** Top-K most distinctive n-grams to query per question (spec §2.1). */
  ngramsPerQuestion: number;
  /** Soft per-source rate limit (queries per minute). Spec §2.1: Serper = 60. */
  queriesPerMinute: number;
  /** Maximum results per query to scrape (spec §2.1: top 3). */
  resultsPerQuery: number;
  /** Hard provider-query cap per run. Keeps paid providers canary-safe. */
  maxQueriesPerRun: number;
  /** Lexical-only short-circuit: don't even score below this. */
  minLexicalToScore: number;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

function parseFraction(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n < 0 || n > 1) return fallback;
  return n;
}

function parseProvider(
  raw: string | undefined,
  env: NodeJS.ProcessEnv,
): LeakCrawlerConfig['searchProvider'] {
  if (raw === 'serper' || raw === 'apify' || raw === 'stub') return raw;
  if (env.SERPER_API_KEY) return 'serper';
  if (env.APIFY_TOKEN || env.APIFY_API_TOKEN) return 'apify';
  return undefined;
}

export function loadConfig(): LeakCrawlerConfig {
  const nodeEnv = (process.env.NODE_ENV ?? 'development') as LeakCrawlerConfig['nodeEnv'];
  return {
    nodeEnv,
    databaseUrl: process.env.DATABASE_URL || undefined,
    searchProvider: parseProvider(process.env.LEAK_CRAWLER_PROVIDER, process.env),
    serperApiKey: process.env.SERPER_API_KEY || undefined,
    apifyToken: process.env.APIFY_TOKEN || process.env.APIFY_API_TOKEN || undefined,
    apifyActorId: process.env.APIFY_ACTOR_ID || 'apify/google-search-scraper',
    apifyCountryCode: process.env.APIFY_COUNTRY_CODE || undefined,
    apifyLanguageCode: process.env.APIFY_LANGUAGE_CODE || undefined,
    apifyTimeoutMs: parsePositiveInt(
      process.env.LEAK_CRAWLER_APIFY_TIMEOUT_MS || process.env.APIFY_TIMEOUT_MS,
      120_000,
    ),
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || undefined,
    maxQuestions: parsePositiveInt(process.env.LEAK_CRAWLER_MAX_QUESTIONS, 5_000),
    ngramsPerQuestion: parsePositiveInt(process.env.LEAK_CRAWLER_NGRAMS_PER_QUESTION, 5),
    queriesPerMinute: parsePositiveInt(process.env.LEAK_CRAWLER_QPM, 60),
    resultsPerQuery: parsePositiveInt(process.env.LEAK_CRAWLER_RESULTS_PER_QUERY, 3),
    maxQueriesPerRun: parsePositiveInt(process.env.LEAK_CRAWLER_MAX_QUERIES_PER_RUN, 25),
    minLexicalToScore: parseFraction(process.env.LEAK_CRAWLER_MIN_LEXICAL, 0.6),
  };
}
