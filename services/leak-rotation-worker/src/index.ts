import pino from 'pino';
import { createPool, resolveDatabaseUrl } from '@qorium/db';
import { createAuditEmitter, type AuditEmitter } from '@qorium/audit-emitter';
import { runTick } from './runner.js';

function parseIntEnv(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function parseFloatEnv(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

export async function start(): Promise<void> {
  const logger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    base: { service: 'qorium-leak-rotation-worker' },
  });

  const tickIntervalMs = parseIntEnv(process.env.LEAK_ROTATION_TICK_MS, 5 * 60_000);
  const scanLimit = parseIntEnv(process.env.LEAK_ROTATION_SCAN_LIMIT, 200);
  const confidenceFloor = parseFloatEnv(process.env.LEAK_ROTATION_CONFIDENCE_FLOOR, 0.85);

  const pool = createPool({ connectionString: resolveDatabaseUrl(), max: 4 });

  let audit: AuditEmitter;
  if (process.env.AUDIT_LOG_BASE_URL && process.env.AUDIT_LOG_ADMIN_TOKEN) {
    audit = createAuditEmitter({
      mode: 'real',
      baseUrl: process.env.AUDIT_LOG_BASE_URL,
      adminToken: process.env.AUDIT_LOG_ADMIN_TOKEN,
    });
  } else {
    logger.warn(
      'AUDIT_LOG_BASE_URL + AUDIT_LOG_ADMIN_TOKEN not set; rotations will not be audited remotely',
    );
    audit = createAuditEmitter({ mode: 'stub' });
  }

  let stopping = false;

  async function tick(): Promise<void> {
    if (stopping) return;
    try {
      await runTick({ pool, audit, logger, confidenceFloor, scanLimit });
    } catch (err) {
      logger.error({ err }, 'leak-rotation-worker tick failed');
    }
  }

  // Run an initial tick on boot, then on interval.
  await tick();
  const handle = setInterval(() => {
    void tick();
  }, tickIntervalMs);

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'shutting down qorium-leak-rotation-worker');
    stopping = true;
    clearInterval(handle);
    await pool.end();
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
      JSON.stringify({ event: 'leak-rotation-worker.fatal', error: String(err) }) + '\n',
    );
    process.exit(1);
  });
}

export { runTick } from './runner.js';
export {
  decideRotation,
  selectAlertsForRotation,
  hoursUntilSlaBreach,
  SLA_HOURS,
  DEFAULT_CONFIDENCE_FLOOR,
  type LeakAlert,
  type LeakSeverity,
  type LeakStatus,
  type RotationDecision,
} from './policy.js';
