import express from 'express';
import type { Express, Request, RequestHandler } from 'express';
import * as Sentry from '@sentry/node';
import type { Pool } from '@qorium/db';
import { apiKeyAuth, createMemoryRateLimiter, createRedisRateLimiter } from '@qorium/auth';
import type { RateLimiterAbstract } from '@qorium/auth';
import { Redis } from 'ioredis';
import type { Config } from './config.js';
import { createHttpLogger, createLogger } from './logger.js';
import { securityHeaders } from './middleware/security-headers.js';
import { notFound, problemHandler } from './middleware/problem.js';
import { healthRouter } from './routes/health.js';
import { questionsRouter } from './routes/questions.js';
import { packsRouter } from './routes/packs.js';
import { authRouter, adminAuthRouter } from './routes/auth.js';
import { adminRouter } from './routes/admin.js';
import { auditRouter } from './routes/audit.js';
import { referencePanelRouter } from './routes/reference-panel.js';
import { stackVaultRouter } from './routes/stack-vault.js';
import type { Mailer } from './mailer/index.js';
import type { Logger } from 'pino';

export interface ServerDeps {
  config: Config;
  pool?: Pool;
  /** Override for tests; injects a pre-built logger so test output stays quiet. */
  logger?: Logger;
  /** Optional mailer for invitation routes; production index builds it when DB exists. */
  mailer?: Mailer;
  /** Override the auth middleware (e.g., open access in tests). */
  authMiddleware?: RequestHandler;
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
  app.use(parseCookies());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));

  // Health endpoints are unauthenticated (PM2 / load balancer probes).
  app.use(healthRouter({ config: deps.config, pool: deps.pool }));
  app.get('/admin', (_req, res) => res.redirect(302, '/admin/dashboard.html'));
  app.get('/admin/', (_req, res) => res.redirect(302, '/admin/dashboard.html'));

  // /v1/* requires API key auth + per-key rate limiting.
  // Auth + repository routes are skipped when no pool is configured (dev /
  // smoke runs without a DB) so /healthz still works.
  if (deps.pool) {
    const auth = deps.authMiddleware ?? buildAuthMiddleware(deps.config, deps.pool);
    app.use('/v1', authRouter({ pool: deps.pool, config: deps.config }));
    app.use(adminRouter({ pool: deps.pool, config: deps.config }));
    app.use(auditRouter({ pool: deps.pool, config: deps.config }));
    app.use(referencePanelRouter({ pool: deps.pool, config: deps.config }));

    app.use(
      '/v1',
      auth,
      questionsRouter({ pool: deps.pool }),
      packsRouter({ pool: deps.pool }),
      stackVaultRouter({ pool: deps.pool }),
    );

    if (deps.mailer) {
      app.use(
        '/v1',
        auth,
        adminAuthRouter({ pool: deps.pool, config: deps.config, mailer: deps.mailer }),
      );
    }
  }

  // 404 + RFC 7807 problem handler must be last.
  app.use(notFound);
  app.use(problemHandler());

  return { app, logger };
}

/**
 * Wire the auth middleware from config. If `API_KEY_PEPPER` is unset the
 * service refuses to start /v1 routes — fail-loud rather than ship an
 * unauthenticated API in production.
 */
function buildAuthMiddleware(config: Config, pool: Pool): RequestHandler {
  if (!config.apiKeyPepper) {
    throw new Error(
      'API_KEY_PEPPER environment variable is required to enable /v1 routes. ' +
        'Set it to a 32+ character random string.',
    );
  }

  let rateLimiter: RateLimiterAbstract;
  if (config.redisUrl) {
    const redis = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });
    rateLimiter = createRedisRateLimiter(redis);
  } else {
    // Fallback so dev / single-instance deployments still rate-limit.
    // Production should always provide REDIS_URL — tracked in build log.
    rateLimiter = createMemoryRateLimiter();
  }

  return apiKeyAuth({ pool, pepper: config.apiKeyPepper, rateLimiter });
}

function parseCookies(): RequestHandler {
  return (req, _res, next) => {
    (req as Request & { cookies?: Record<string, string> }).cookies = parseCookieHeader(
      req.headers.cookie,
    );
    next();
  };
}

function parseCookieHeader(header: string | undefined): Record<string, string> {
  if (!header) return {};

  return header.split(';').reduce<Record<string, string>>((cookies, part) => {
    const separator = part.indexOf('=');
    if (separator === -1) return cookies;

    const name = part.slice(0, separator).trim();
    if (!name) return cookies;

    const rawValue = part.slice(separator + 1).trim();
    try {
      cookies[name] = decodeURIComponent(rawValue);
    } catch {
      cookies[name] = rawValue;
    }
    return cookies;
  }, {});
}
