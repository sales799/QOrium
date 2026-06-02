/**
 * Programmatic entry point for callers that want to invoke a crawl pass
 * directly (e.g., admin "trigger now" button in a future sprint, or another
 * service in-process). The CLI in `cli.ts` is the operational entry point
 * driven by PM2's daily cron-restart.
 */

import net from 'node:net';

import { createPool, resolveDatabaseUrl } from '@qorium/db';
import { loadConfig, type LeakCrawlerConfig } from './config.js';
import { buildLogger } from './logger.js';
import { runCrawl, type CrawlReport } from './orchestrator.js';
import { recordAlertIfNew } from './repositories/alerts.js';
import { listReleasedQuestions } from './repositories/questions.js';
import { SerperPoller } from './sources/serper.js';
import { StubPoller } from './sources/stub.js';
import type { SourcePoller } from './sources/types.js';
import type { Logger } from 'pino';

const SERVICE_NAME = 'qorium-leak-crawler';
const STARTUP_READY_ATTEMPTS = 10;
const STARTUP_READY_INITIAL_DELAY_MS = 250;
const STARTUP_READY_MAX_DELAY_MS = 4_000;
const STARTUP_READY_TIMEOUT_MS = 2_000;

interface StartupDependency {
  name: 'postgres' | 'redis';
  check: () => Promise<void>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nextBackoffDelay(attempt: number): number {
  return Math.min(
    STARTUP_READY_INITIAL_DELAY_MS * 2 ** Math.max(0, attempt - 1),
    STARTUP_READY_MAX_DELAY_MS,
  );
}

function resolveOptionalDatabaseUrl(): string | undefined {
  try {
    return resolveDatabaseUrl();
  } catch {
    return undefined;
  }
}

async function assertPostgresReady(databaseUrl: string): Promise<void> {
  const pool = createPool({
    connectionString: databaseUrl,
    max: 1,
    connectionTimeoutMillis: STARTUP_READY_TIMEOUT_MS,
    applicationName: `${SERVICE_NAME}-startup`,
  });
  try {
    const ok = await pool.query<{ ok: number }>('SELECT 1 AS ok');
    if (ok.rows[0]?.ok !== 1) {
      throw new Error('Postgres readiness query returned an unexpected result');
    }
  } finally {
    await pool.end();
  }
}

function assertRedisReady(redisUrl: string): Promise<void> {
  const parsed = new URL(redisUrl);
  const host = parsed.hostname || '127.0.0.1';
  const port = parsed.port ? Number.parseInt(parsed.port, 10) : 6379;
  const password = parsed.password ? decodeURIComponent(parsed.password) : undefined;
  const username = parsed.username ? decodeURIComponent(parsed.username) : undefined;
  const database =
    parsed.pathname && parsed.pathname !== '/' ? parsed.pathname.slice(1) : undefined;

  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error('Redis readiness check timed out'));
    }, STARTUP_READY_TIMEOUT_MS);

    let buffer = '';
    const cleanup = (): void => {
      clearTimeout(timer);
      socket.removeAllListeners();
      socket.destroy();
    };

    socket.on('connect', () => {
      const commands: string[] = [];
      if (password) {
        if (username) {
          commands.push(
            `*3\r\n$4\r\nAUTH\r\n$${Buffer.byteLength(username)}\r\n${username}\r\n$${Buffer.byteLength(password)}\r\n${password}\r\n`,
          );
        } else {
          commands.push(`*2\r\n$4\r\nAUTH\r\n$${Buffer.byteLength(password)}\r\n${password}\r\n`);
        }
      }
      if (database) {
        commands.push(`*2\r\n$6\r\nSELECT\r\n$${Buffer.byteLength(database)}\r\n${database}\r\n`);
      }
      commands.push('*1\r\n$4\r\nPING\r\n');
      socket.write(commands.join(''));
    });

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      if (buffer.includes('+PONG')) {
        cleanup();
        resolve();
      } else if (buffer.includes('\r\n-')) {
        cleanup();
        reject(new Error('Redis readiness check returned an error'));
      }
    });

    socket.on('error', (err) => {
      cleanup();
      reject(err);
    });
  });
}

async function waitForDependency(dep: StartupDependency, logger: Logger): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= STARTUP_READY_ATTEMPTS; attempt++) {
    try {
      await dep.check();
      if (attempt > 1) {
        logger.info({ ev: 'boot_dep_ready', svc: SERVICE_NAME, dep: dep.name, attempt });
      }
      return;
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      logger.warn({ ev: 'boot_dep_wait', svc: SERVICE_NAME, dep: dep.name, attempt, message });
      if (attempt < STARTUP_READY_ATTEMPTS) {
        await sleep(nextBackoffDelay(attempt));
      }
    }
  }

  const message = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`${dep.name} was not ready after ${STARTUP_READY_ATTEMPTS} attempts: ${message}`);
}

async function waitForStartupDependencies(options: {
  databaseUrl: string;
  redisUrl: string | undefined;
  logger: Logger;
}): Promise<void> {
  const dependencies: StartupDependency[] = [
    {
      name: 'postgres',
      check: () => assertPostgresReady(options.databaseUrl),
    },
  ];

  const redisUrl = options.redisUrl;
  if (redisUrl) {
    dependencies.push({
      name: 'redis',
      check: () => assertRedisReady(redisUrl),
    });
  } else {
    options.logger.warn({ ev: 'boot_dep_skip', svc: SERVICE_NAME, dep: 'redis', reason: 'unset' });
  }

  for (const dep of dependencies) {
    await waitForDependency(dep, options.logger);
  }

  options.logger.info({ ev: 'boot', svc: SERVICE_NAME, deps: 'ok' });
}

export async function runOnce(
  overrides: { config?: LeakCrawlerConfig } = {},
): Promise<CrawlReport> {
  const config = overrides.config ?? loadConfig();
  const logger = buildLogger();
  const databaseUrl = config.databaseUrl ?? resolveOptionalDatabaseUrl();

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

  if (!databaseUrl) {
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

  await waitForStartupDependencies({
    databaseUrl,
    redisUrl: process.env.REDIS_URL || undefined,
    logger,
  });

  const pool = createPool({ connectionString: databaseUrl, max: 4 });
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
