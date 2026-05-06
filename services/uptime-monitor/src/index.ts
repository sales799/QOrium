import pino from 'pino';
import { runChecks, httpHealth, postgresPing, postgresSchema, tcpReachable } from '@qorium/smoke';
import { createServer } from './server.js';
import { applyRun, createInitialState, type MonitorState } from './state.js';

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

export async function start() {
  const logger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    base: { service: 'qorium-uptime-monitor' },
  });
  const port = parsePositiveInt(process.env.UPTIME_PORT ?? process.env.PORT, 5114);
  const tickIntervalMs = parsePositiveInt(process.env.UPTIME_TICK_INTERVAL_MS, 60_000);

  const checks = [
    postgresPing({ databaseUrl: process.env.DATABASE_URL }),
    postgresSchema({ databaseUrl: process.env.DATABASE_URL }),
    tcpReachable('redis', { host: 'localhost', port: 6379 }),
    httpHealth('readybank', { url: 'http://localhost:5101/healthz' }),
    httpHealth('jd_forge', { url: 'http://localhost:5102/healthz' }),
    httpHealth('stack_vault', { url: 'http://localhost:5103/healthz' }),
    httpHealth('admin', { url: 'http://localhost:5104/healthz' }),
    httpHealth('ats_bridge', { url: 'http://localhost:5105/healthz' }),
    httpHealth('webhooks', { url: 'http://localhost:5106/healthz' }),
    httpHealth('sso', { url: 'http://localhost:5107/healthz' }),
    httpHealth('audit_log', { url: 'http://localhost:5111/healthz' }),
    httpHealth('billing', { url: 'http://localhost:5112/healthz' }),
    httpHealth('api_key_mgmt', { url: 'http://localhost:5113/healthz' }),
  ];

  let state: MonitorState = createInitialState();
  const tick = async () => {
    try {
      const summary = await runChecks(checks);
      state = applyRun(state, summary);
      logger.info(
        { passed: summary.passed, failed: summary.failed, skipped: summary.skipped },
        'uptime tick',
      );
    } catch (err) {
      logger.error({ err }, 'uptime tick failed');
    }
  };
  await tick();
  const handle = setInterval(() => void tick(), tickIntervalMs);
  handle.unref?.();

  const app = createServer({ logger, getState: () => state });
  const server = app.listen(port, () => {
    logger.info({ port }, 'qorium-uptime-monitor listening');
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'shutting down qorium-uptime-monitor');
    clearInterval(handle);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
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
      JSON.stringify({ event: 'uptime-monitor.fatal', error: String(err) }) + '\n',
    );
    process.exit(1);
  });
}

export { createServer } from './server.js';
export {
  applyRun,
  computeSlo,
  createInitialState,
  ONE_DAY_MS,
  ONE_HOUR_MS,
  type MonitorState,
  type UptimeSnapshot,
  type SloWindow,
} from './state.js';
