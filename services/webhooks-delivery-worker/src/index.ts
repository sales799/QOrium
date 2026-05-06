import pino from 'pino';
import { createPool, resolveDatabaseUrl, type Pool } from '@qorium/db';
import { realHttpPoster, stubHttpPoster } from './poster.js';
import { runTick } from './runner.js';

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

function parseBool(raw: string | undefined, fallback: boolean): boolean {
  if (!raw) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(raw.toLowerCase());
}

export async function start() {
  const tickIntervalMs = parsePositiveInt(process.env.WEBHOOKS_DELIVERY_TICK_MS, 5_000);
  const batchSize = parsePositiveInt(process.env.WEBHOOKS_DELIVERY_BATCH_SIZE, 50);
  const usePoster = parseBool(process.env.WEBHOOKS_DELIVERY_REAL_POSTER, false);
  const logger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    base: { service: 'qorium-webhooks-delivery-worker' },
  });

  let pool: Pool | undefined;
  try {
    pool = createPool({ connectionString: resolveDatabaseUrl(), max: 4 });
  } catch (err) {
    logger.warn({ err }, 'DATABASE_URL not configured — worker idles');
    return;
  }

  const poster = usePoster ? realHttpPoster() : stubHttpPoster();
  logger.info({ usePoster, tickIntervalMs, batchSize }, 'qorium-webhooks-delivery-worker starting');

  const tick = async (): Promise<void> => {
    if (!pool) return;
    try {
      const report = await runTick({ pool, poster, batchSize });
      if (report.attempted > 0) logger.info({ report }, 'delivery tick complete');
    } catch (err) {
      logger.error({ err }, 'delivery tick failed');
    }
  };

  await tick();
  const handle = setInterval(() => void tick(), tickIntervalMs);
  handle.unref?.();

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'shutting down qorium-webhooks-delivery-worker');
    clearInterval(handle);
    if (pool) await pool.end();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

// PM2 cluster mode wraps the script, so process.argv[1] points at the
// wrapper, not index.js. Always invoke start(); tests import specific
// helpers, never this entry point.
{
  void start().catch((err) => {
    process.stderr.write(
      JSON.stringify({ event: 'webhooks-delivery.fatal', error: String(err) }) + '\n',
    );
    process.exit(1);
  });
}

export { runTick, type TickInputs, type TickReport } from './runner.js';
export {
  deliverOne,
  type PendingDelivery,
  type NextState,
  type DeliverResult,
} from './orchestrator.js';
export {
  realHttpPoster,
  stubHttpPoster,
  type HttpPoster,
  type PostInputs,
  type PostOutcome,
  type StubPosterState,
} from './poster.js';
export {
  matchEventType,
  matchSubscriptions,
  prepareEvent,
  type DomainEvent,
  type SubscriptionMatch,
  type PreparedEvent,
} from './emit.js';
export {
  listPendingDeliveries,
  markDelivered,
  markRetry,
  markAbandoned,
  emitEvent,
  type PendingDeliveryRow,
} from './repository.js';
