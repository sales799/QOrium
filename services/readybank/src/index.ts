import { createPool } from '@qorium/db';
import type { Pool } from '@qorium/db';
import { loadConfig } from './config.js';
import { createServer } from './server.js';
import { createMailer, type Mailer } from './mailer/index.js';

async function main(): Promise<void> {
  const config = loadConfig();

  // The pool is optional at the readybank skeleton stage — services that need
  // it (search, retrieve) will fail at first query if DATABASE_URL is unset.
  // We attempt to construct the pool but tolerate absence in dev / smoke runs.
  let pool: Pool | undefined;
  try {
    pool = createPool({ applicationName: config.serviceName });
  } catch {
    pool = undefined;
  }

  let mailer: Mailer | undefined;
  if (pool) {
    mailer = await createMailer({
      driver: config.mailerDriver,
      ...(config.sesRegion ? { sesRegion: config.sesRegion } : {}),
      ...(config.sesAccessKeyId ? { sesAccessKeyId: config.sesAccessKeyId } : {}),
      ...(config.sesSecretAccessKey ? { sesSecretAccessKey: config.sesSecretAccessKey } : {}),
      ...(config.sendgridApiKey ? { sendgridApiKey: config.sendgridApiKey } : {}),
    });
  }

  const server = createServer(pool ? { config, pool, ...(mailer ? { mailer } : {}) } : { config });

  const httpServer = server.app.listen(config.port, () => {
    server.logger.info(
      { port: config.port, env: config.nodeEnv, db: pool ? 'configured' : 'not-configured' },
      `${config.serviceName} listening`,
    );
  });

  // Graceful shutdown — PM2 sends SIGINT (kill_timeout 30s per B10).
  const shutdown = async (signal: string): Promise<void> => {
    server.logger.info({ signal }, 'shutdown initiated');
    httpServer.close(() => {
      server.logger.info('http server closed');
    });
    if (pool) {
      await pool.end();
      server.logger.info('pg pool drained');
    }
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('fatal: failed to start readybank service', err);
  process.exit(1);
});
