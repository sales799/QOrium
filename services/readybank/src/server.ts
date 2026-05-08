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
import { adminRouter } from './routes/admin.js';
import { referencePanelRouter } from './routes/reference-panel.js';
import { stackVaultRouter } from './routes/stack-vault.js';
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

  // Convenience redirects so operators can land on /admin without
  // remembering the dashboard.html suffix. Mount BEFORE express.static so
  // serve-static's default 301-to-trailing-slash redirect doesn't preempt.
  app.get('/admin', (_req, res) => res.redirect(302, '/admin/dashboard.html'));
  app.get('/admin/', (_req, res) => res.redirect(302, '/admin/dashboard.html'));

  // Static recruiter + admin portals — login.html + companion css/js.
  // Served from <serviceRoot>/public; harmless when missing. `redirect:
  // false` disables the default trailing-slash 301 so our explicit /admin
  // and /admin/ handlers above retain authority.
  app.use(express.static(path.join(__dirname, '..', 'public'), { index: false, redirect: false }));

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

    // Admin console API (Sprint 1.8d) — gated by recruiter cookie auth
    // (no separate API key). Mounted at /v1/admin/* via its own router
    // so each route applies recruiterAuth individually; static admin
    // pages live at /admin/*.
    app.use(adminRouter({ pool: deps.pool, config: deps.config }));

    // Reference Panel ingestion (Sprint 1.8b) — its own bearer-token
    // middleware against `app.reference_panel_tokens`. Mounted BEFORE the
    // API-key gate so the panel-token rejection messages (RFC 7807
    // problem types prefixed `reference-panel/*`) win over the generic
    // `apiKeyAuth` 401. Pepper shared with /v1/* to avoid a second
    // secret to rotate.
    app.use(referencePanelRouter({ pool: deps.pool, config: deps.config }));

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

    // Stack-Vault routes (SKU 3): per-tenant exclusive library. Layered on
    // top of api-key auth; vault-membership + per-vault pepper are
    // enforced by `requireActiveVault` inside the router.
    app.use('/v1', auth, stackVaultRouter({ pool: deps.pool }));

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
