import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import type { Express, RequestHandler } from 'express';
import cookieParser from 'cookie-parser';
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
import { adminAuthRouter, authRouter } from './routes/auth.js';
import { sessionsRouter } from './routes/sessions.js';
import { takeRouter } from './routes/take.js';
import { resultsRouter } from './routes/results.js';
import type { Mailer } from './mailer/index.js';
import type { Logger } from 'pino';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ServerDeps {
  config: Config;
  pool?: Pool;
  /** Override for tests; injects a pre-built logger so test output stays quiet. */
  logger?: Logger;
  /** Override the auth middleware (e.g., open access in tests). */
  authMiddleware?: RequestHandler;
  /** Override the mailer (tests use MockMailer). When omitted, built from config. */
  mailer?: Mailer;
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
  app.use(cookieParser());

  // Static recruiter portal entry point — login.html + companion css/js.
  // Served from <serviceRoot>/public; harmless when missing.
  app.use(express.static(path.join(__dirname, '..', 'public'), { index: false }));

  // Health endpoints are unauthenticated (PM2 / load balancer probes).
  app.use(healthRouter({ config: deps.config, pool: deps.pool }));

  // /v1/* gated routes. Auth + repository routes are skipped when no pool is
  // configured (dev / smoke runs without a DB) so /healthz still works.
  if (deps.pool) {
    // Recruiter session auth (Surface 6) — public login/logout, gated whoami,
    // public token-gated /auth/accept. Mounted before the API-key gate so
    // /v1/auth/login is reachable without an API key.
    if (!deps.config.jwtSecret) {
      throw new Error(
        'JWT_SECRET environment variable is required to enable recruiter auth. ' +
          'Set it to a 32+ character random string.',
      );
    }
    app.use('/v1', authRouter({ pool: deps.pool, config: deps.config }));

    // Recruiter-cookie-gated APIs (Sprints 1.2/1.3/1.4) — public login is
    // mounted above; these mount their own recruiterAuth internally so
    // they're reachable WITHOUT the API-key gate (cookie suffices).
    app.use('/v1', sessionsRouter({ pool: deps.pool, config: deps.config }));
    app.use('/v1', resultsRouter({ pool: deps.pool, config: deps.config }));

    // Public candidate take flow (Sprint 1.3) — token-cookie gated.
    // Mounted at the root so /take/:token and /api/* are reachable without
    // any /v1 prefix; matches the dashboard spec.
    app.use(takeRouter({ pool: deps.pool, config: deps.config }));

    // /recruiter/* → dashboard.html (the single-page app). The dashboard's
    // own JS calls /v1/auth/whoami to verify the cookie and redirects to
    // /login.html on 401.
    app.get(/^\/recruiter(\/.*)?$/, (_req, res) => {
      res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html'), (err) => {
        if (err) res.status(404).type('text/plain').send('Recruiter dashboard not found.');
      });
    });

    const auth = deps.authMiddleware ?? buildAuthMiddleware(deps.config, deps.pool);

    // Admin-only auth endpoints (Sprint 1.6): /v1/auth/invite. Gated by API
    // key so only recruiter ops with a valid key can mint invitations. Skipped
    // when no mailer is configured (tests omit it; index.ts builds it).
    if (deps.mailer) {
      app.use(
        '/v1',
        auth,
        adminAuthRouter({ pool: deps.pool, config: deps.config, mailer: deps.mailer }),
      );
    }

    app.use('/v1', auth, questionsRouter({ pool: deps.pool }), packsRouter({ pool: deps.pool }));
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
