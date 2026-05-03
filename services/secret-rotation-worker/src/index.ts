import pino from 'pino';
import { createPool, resolveDatabaseUrl, type Pool } from '@qorium/db';
import { loadConfig } from './config.js';
import { defaultRotatorRegistry } from './rotators.js';
import { runTick } from './runner.js';
import { DEFAULT_POLICY_DAYS } from './policy.js';

export async function start() {
  const config = loadConfig();
  const logger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    base: { service: 'qorium-secret-rotation' },
  });
  let pool: Pool | undefined;
  try {
    pool = createPool({ connectionString: resolveDatabaseUrl(), max: 4 });
  } catch (err) {
    logger.warn({ err }, 'DATABASE_URL not configured — worker exits 0');
    return;
  }
  const registryOpts: Parameters<typeof defaultRotatorRegistry>[0] = {
    policyDays: DEFAULT_POLICY_DAYS,
  };
  if (config.webhooksAdminToken !== undefined) {
    registryOpts.webhooksAdminToken = config.webhooksAdminToken;
  }
  const registry = defaultRotatorRegistry(registryOpts);

  const tick = async () => {
    try {
      if (!pool) return;
      const report = await runTick({
        pool,
        registry,
        lookAheadDays: config.lookAheadDays,
        performRotation: config.performRotation,
      });
      logger.info({ report }, 'rotation tick complete');
    } catch (err) {
      logger.error({ err }, 'rotation tick failed');
    }
  };

  await tick();
  const handle = setInterval(() => void tick(), config.tickIntervalMs);
  handle.unref?.();

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'shutting down qorium-secret-rotation');
    clearInterval(handle);
    if (pool) await pool.end();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

if (process.argv[1]?.endsWith('index.js') || process.argv[1]?.endsWith('index.ts')) {
  void start().catch((err) => {
    process.stderr.write(
      JSON.stringify({ event: 'secret-rotation.fatal', error: String(err) }) + '\n',
    );
    process.exit(1);
  });
}

export { runTick, type TickReport, type TickInputs } from './runner.js';
export {
  evaluatePolicy,
  nextDueDate,
  DEFAULT_POLICY_DAYS,
  type SecretStatus,
  type PolicyInputs,
  type PolicyDecision,
} from './policy.js';
export {
  stubRotator,
  webhookSubscriptionRotator,
  defaultRotatorRegistry,
  type Rotator,
  type RotatorRegistry,
  type RotationContext,
  type RotationOutcome,
} from './rotators.js';
export {
  listAll,
  listDueOrSoon,
  markRotated,
  markStatus,
  emitLog,
  type SecretRotationRow,
} from './repository.js';
export { loadConfig, type SecretRotationConfig } from './config.js';
