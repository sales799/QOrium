import express from 'express';
import type { Express } from 'express';
import * as Sentry from '@sentry/node';
import type { Pool } from '@qorium/db';
import type { Config } from './config.js';
import { createHttpLogger, createLogger } from './logger.js';
import { securityHeaders } from './middleware/security-headers.js';
import { notFound, problemHandler } from './middleware/problem.js';
import { healthRouter } from './routes/health.js';
import type { Logger } from 'pino';

export interface ServerDeps {
  config: Config;
  pool?: Pool;
  /** Override for tests; injects a pre-built logger so test output stays quiet. */
  logger?: Logger;
}

export interface ServerHandle {
  app: Express;
  logger: Logger;
}

/**
 * Build the Express app. Idempotent and stateless — exported for tests so
 * supertest can attach without booting a real listener.
 */
export function createServer(deps: ServerDeps): ServerHandle {
  const logger = deps.logger ?? createLogger(deps.config);

  // Sentry init is a no-op when SENTRY_DSN is unset; keeps service runnable
  // in dev/test without external accounts. Real DSN comes from CI env.
  if (deps.config.sentryDsn) {
    Sentry.init({
      dsn: deps.config.sentryDsn,
      environment: deps.config.nodeEnv,
      release: `${deps.config.serviceName}@${deps.config.version}`,
    });
  }

  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1); // Behind Nginx in production

  app.use(securityHeaders());
  app.use(createHttpLogger(logger));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));

  app.use(healthRouter({ config: deps.config, pool: deps.pool }));

  // 404 + RFC 7807 problem handler must be last.
  app.use(notFound);
  app.use(problemHandler());

  return { app, logger };
}
