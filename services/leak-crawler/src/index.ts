/**
 * Programmatic entry point for callers that want to invoke a crawl pass
 * directly (e.g., admin "trigger now" button in a future sprint, or another
 * service in-process). The CLI in `cli.ts` is the operational entry point
 * driven by PM2's daily cron-restart.
 */

import { createPool, resolveDatabaseUrl } from '@qorium/db';
import { loadConfig, type LeakCrawlerConfig } from './config.js';
import { buildLogger } from './logger.js';
import { runCrawl, type CrawlReport } from './orchestrator.js';
import { recordAlertIfNew } from './repositories/alerts.js';
import { listReleasedQuestions } from './repositories/questions.js';
import { SerperPoller } from './sources/serper.js';
import { StubPoller } from './sources/stub.js';
import type { SourcePoller } from './sources/types.js';

export async function runOnce(
  overrides: { config?: LeakCrawlerConfig } = {},
): Promise<CrawlReport> {
  const config = overrides.config ?? loadConfig();
  const logger = buildLogger();

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

  const pool = createPool({ connectionString: resolveDatabaseUrl(), max: 4 });
  try {
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
