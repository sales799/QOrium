#!/usr/bin/env node
/**
 * Persistent PM2 worker for the anti-leak scanner.
 *
 * The CLI in scripts/scan.ts is intentionally one-shot. PM2 must run this
 * long-lived wrapper so a successful scan does not look like a crash loop.
 */
import { createPool, type Pool } from '@qorium/db';
import { pino } from 'pino';

import { loadConfig, type AntiLeakConfig } from './config.js';
import { MockSearchProvider } from './providers/mock.js';
import { SerperSearchProvider } from './providers/serper.js';
import { runScan } from './scanner.js';
import { parseScanIntervalMs } from './schedule.js';
import type { SearchProvider } from './types.js';

function hasDatabaseConfig(env: NodeJS.ProcessEnv): boolean {
  return Boolean(
    env.DATABASE_URL ||
    (env.POSTGRES_HOST &&
      env.POSTGRES_PORT &&
      env.POSTGRES_USER &&
      env.POSTGRES_PASSWORD &&
      env.POSTGRES_DB),
  );
}

function createProvider(config: AntiLeakConfig): SearchProvider {
  if (config.provider === 'serper') {
    return new SerperSearchProvider({ apiKey: config.serperApiKey! });
  }

  return new MockSearchProvider();
}

async function closePool(pool: Pool | null): Promise<void> {
  if (pool) await pool.end();
}

async function main(): Promise<void> {
  const config = loadConfig(process.env);
  const logger = pino({ level: config.logLevel });
  const intervalMs = parseScanIntervalMs(
    process.env.ANTILEAK_SCAN_INTERVAL ?? process.env.ANTILEAK_SCAN_INTERVAL_MS,
  );
  const pool = hasDatabaseConfig(process.env)
    ? createPool({ max: 2, applicationName: 'qorium-anti-leak-worker' })
    : null;
  const provider = createProvider(config);
  let running = false;
  let stopping = false;

  async function runOnce(reason: 'boot' | 'interval'): Promise<void> {
    if (running || stopping) return;
    running = true;
    try {
      logger.info(
        { reason, provider: provider.name, intervalMs, dbEnabled: Boolean(pool) },
        'anti-leak worker: scan starting',
      );
      await runScan({ pool, provider, config, logger });
    } catch (err) {
      logger.error({ err }, 'anti-leak worker: scan failed');
    } finally {
      running = false;
    }
  }

  await runOnce('boot');
  const timer = setInterval(() => {
    void runOnce('interval');
  }, intervalMs);

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    stopping = true;
    logger.info({ signal }, 'anti-leak worker: shutting down');
    clearInterval(timer);
    await closePool(pool);
    process.exit(0);
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);

  logger.info({ intervalMs }, 'anti-leak worker: waiting for next scan');
}

main().catch((err) => {
  process.stderr.write(`anti-leak worker failed to boot: ${(err as Error).message}\n`);
  process.exit(1);
});
