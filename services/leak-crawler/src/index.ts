/**
 * Programmatic entry point for callers that want to invoke a crawl pass
 * directly (e.g., admin "trigger now" button in a future sprint, or another
 * service in-process). PM2 runs this file directly and owns the daily
 * cron-restart; `cli.ts` remains a manual wrapper.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPool, resolveDatabaseUrl } from '@qorium/db';
import { loadConfig, type LeakCrawlerConfig } from './config.js';
import { buildLogger } from './logger.js';
import { runCrawl, type CrawlReport } from './orchestrator.js';
import { recordAlertIfNew } from './repositories/alerts.js';
import { listReleasedQuestions } from './repositories/questions.js';
import { waitForStartupDependencies } from './readiness.js';
import { SerperPoller } from './sources/serper.js';
import { StubPoller } from './sources/stub.js';
import type { SourcePoller } from './sources/types.js';

const SERVICE_NAME = 'qorium-leak-crawler';
const KEEPALIVE_INTERVAL_MS = 60_000;

export async function runOnce(
  overrides: { config?: LeakCrawlerConfig } = {},
): Promise<CrawlReport> {
  const config = overrides.config ?? loadConfig();
  const logger = buildLogger({ serviceName: SERVICE_NAME });

  const pollers: SourcePoller[] = [];
  if (config.serperApiKey) {
    pollers.push(new SerperPoller({ apiKey: config.serperApiKey }));
    logger.info('serper poller enabled');
  } else if (config.nodeEnv !== 'production') {
    pollers.push(new StubPoller());
    logger.info('SERPER_API_KEY unset — using stub poller (dev/test only)');
  } else {
    logger.warn('SERPER_API_KEY unset in production; crawl will be a no-op');
  }

  if (!config.databaseUrl) {
    try {
      resolveDatabaseUrl();
    } catch {
      logger.warn('DATABASE_URL is not configured; crawl will exit without scanning');
      return {
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        questionsScanned: 0,
        queriesIssued: 0,
        resultsScored: 0,
        alertsCreated: 0,
        alertsSkippedDuplicate: 0,
        errors: 0,
      };
    }
  }

  const pool = createPool({
    connectionString: resolveDatabaseUrl(),
    max: 4,
    connectionTimeoutMillis: 1_000,
    applicationName: SERVICE_NAME,
  });
  try {
    await waitForStartupDependencies({
      logger,
      pool,
      redisUrl: process.env.REDIS_URL,
      serviceName: SERVICE_NAME,
    });
    logger.info({ ev: 'boot', svc: SERVICE_NAME, deps: 'ok' });

    return await runCrawl({
      listQuestions: () => listReleasedQuestions(pool, { limit: config.maxQuestions }),
      recordAlert: (input) => recordAlertIfNew(pool, input),
      pollers,
      logger,
      ngramsPerQuestion: config.ngramsPerQuestion,
      resultsPerQuery: config.resultsPerQuery,
    });
  } finally {
    await pool.end();
  }
}

export async function start(): Promise<void> {
  const report = await runOnce();
  process.stdout.write(JSON.stringify({ event: 'crawl.report', ...report }) + '\n');

  // Keep the worker online between PM2 cron restarts; the cron owns cadence.
  const handle = setInterval(() => undefined, KEEPALIVE_INTERVAL_MS);
  const shutdown = (signal: string): void => {
    clearInterval(handle);
    process.stdout.write(JSON.stringify({ event: 'crawl.shutdown', signal }) + '\n');
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

const currentFile = fileURLToPath(import.meta.url);
const entryFile = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (entryFile === currentFile) {
  void start().catch((err) => {
    process.stderr.write(
      JSON.stringify({
        event: 'crawl.fatal',
        error: err instanceof Error ? err.message : String(err),
      }) + '\n',
    );
    process.exit(1);
  });
}

export { runCrawl } from './orchestrator.js';
export { loadConfig } from './config.js';
export { buildLogger } from './logger.js';
export { extractDistinctiveNGrams, normaliseTextForNGrams } from './ngrams.js';
export { scoreEvidence, jaccardSimilarity, lexicalOverlap, tokeniseToSet } from './similarity.js';
export { classifyEvidence, compositeSimilarity } from './severity.js';
export {
  deriveWatermarkSeed,
  deriveWatermarkMarkers,
  attributeLeak,
  type VariantMarkers,
  type WatermarkInputs,
} from './watermark.js';
