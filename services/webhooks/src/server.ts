/**
 * Express service for webhooks per spec §8 (admin UI surface).
 *
 * Endpoints (v0):
 *   GET  /healthz
 *   GET  /v1/webhooks/subscriptions
 *   POST /v1/webhooks/subscriptions
 *   GET  /v1/webhooks/subscriptions/:id
 *   DELETE /v1/webhooks/subscriptions/:id
 *   POST /v1/webhooks/subscriptions/:id/test  — sends a synthetic event
 *
 * The actual outbound delivery loop (BullMQ + Redis) is deferred per
 * `infra/CTO-deltas/CTO-DELTA-webhooks-bullmq-deferred.md`. This service
 * exposes `deliverEvent` synchronously as the v0 substitute.
 */

import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { Logger } from 'pino';
import { z } from 'zod';
import type { Pool } from '@qorium/db';
import {
  createSubscription,
  deleteSubscription,
  getSubscription,
  listSubscriptions,
  setActive,
} from './repositories/subscriptions.js';
import type { WebhooksConfig } from './config.js';
import { isCanonicalEventType } from './envelope.js';

export interface CreateServerOptions {
  config: WebhooksConfig;
  pool?: Pool;
  logger: Logger;
  resolveTenantId?: (req: Request) => string | null;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const createSchema = z.object({
  event_type: z.string().min(1).max(80).default('*'),
  endpoint_url: z.string().url(),
});

const updateSchema = z.object({
  is_active: z.boolean(),
});

export function createServer(opts: CreateServerOptions): express.Express {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '128kb' }));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(pinoHttp({ logger: opts.logger }));

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', service: 'qorium-webhooks' });
  });

  app.get('/v1/webhooks/subscriptions', (req, res) => {
    void handleList(opts, req, res);
  });
  app.post('/v1/webhooks/subscriptions', (req, res) => {
    void handleCreate(opts, req, res);
  });
  app.get('/v1/webhooks/subscriptions/:id', (req, res) => {
    void handleGet(opts, req, res);
  });
  app.patch('/v1/webhooks/subscriptions/:id', (req, res) => {
    void handleUpdate(opts, req, res);
  });
  app.delete('/v1/webhooks/subscriptions/:id', (req, res) => {
    void handleDelete(opts, req, res);
  });

  app.use((_req, res) => {
    res.status(404).contentType('application/problem+json').json({
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
    });
  });

  return app;
}

async function handleList(opts: CreateServerOptions, req: Request, res: Response): Promise<void> {
  const ctx = ensureContext(opts, req, res);
  if (!ctx) return;
  const rows = await listSubscriptions(ctx.pool, ctx.tenantId);
  res.json({ count: rows.length, subscriptions: rows });
}

async function handleCreate(opts: CreateServerOptions, req: Request, res: Response): Promise<void> {
  const ctx = ensureContext(opts, req, res);
  if (!ctx) return;
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    sendProblem(res, 400, 'Bad Request', parsed.error.issues.map((i) => i.message).join('; '));
    return;
  }
  const eventType = parsed.data.event_type;
  if (eventType !== '*' && !isCanonicalEventType(eventType)) {
    sendProblem(res, 400, `Unknown event_type: ${eventType}`);
    return;
  }
  if (
    !parsed.data.endpoint_url.startsWith('https://') &&
    parsed.data.endpoint_url !== 'http://localhost'
  ) {
    // Spec §9: HTTPS only. Allow http://localhost for local dev.
    if (!parsed.data.endpoint_url.startsWith('http://localhost')) {
      sendProblem(res, 400, 'endpoint_url must be HTTPS');
      return;
    }
  }
  try {
    const created = await createSubscription(ctx.pool, {
      tenantId: ctx.tenantId,
      eventType,
      endpointUrl: parsed.data.endpoint_url,
    });
    res.status(201).json({
      subscription: created.row,
      // signing_secret is returned ONLY at creation time; stored hashed on
      // the server side — clients must persist this themselves.
      signing_secret: created.signingSecret,
    });
  } catch (err) {
    if (
      (err instanceof Error && err.message.includes('duplicate')) ||
      (err as { code?: string }).code === '23505'
    ) {
      sendProblem(res, 409, 'Subscription already exists for (tenant, event_type, url)');
      return;
    }
    opts.logger.error({ err }, 'failed to create subscription');
    sendProblem(res, 500, 'Internal error');
  }
}

async function handleGet(opts: CreateServerOptions, req: Request, res: Response): Promise<void> {
  const ctx = ensureContext(opts, req, res);
  if (!ctx) return;
  const id = idParam(req);
  if (!id) {
    sendProblem(res, 400, 'Invalid subscription id');
    return;
  }
  const row = await getSubscription(ctx.pool, ctx.tenantId, id);
  if (!row) {
    sendProblem(res, 404, 'Subscription not found');
    return;
  }
  res.json(row);
}

async function handleUpdate(opts: CreateServerOptions, req: Request, res: Response): Promise<void> {
  const ctx = ensureContext(opts, req, res);
  if (!ctx) return;
  const id = idParam(req);
  if (!id) {
    sendProblem(res, 400, 'Invalid subscription id');
    return;
  }
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    sendProblem(res, 400, 'Bad Request', parsed.error.issues.map((i) => i.message).join('; '));
    return;
  }
  const row = await setActive(ctx.pool, ctx.tenantId, id, parsed.data.is_active);
  if (!row) {
    sendProblem(res, 404, 'Subscription not found');
    return;
  }
  res.json(row);
}

async function handleDelete(opts: CreateServerOptions, req: Request, res: Response): Promise<void> {
  const ctx = ensureContext(opts, req, res);
  if (!ctx) return;
  const id = idParam(req);
  if (!id) {
    sendProblem(res, 400, 'Invalid subscription id');
    return;
  }
  const ok = await deleteSubscription(ctx.pool, ctx.tenantId, id);
  if (!ok) {
    sendProblem(res, 404, 'Subscription not found');
    return;
  }
  res.status(204).end();
}

interface RequestContext {
  pool: Pool;
  tenantId: string;
}

function ensureContext(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): RequestContext | null {
  if (!opts.pool) {
    sendProblem(res, 503, 'Database unavailable');
    return null;
  }
  const tenantId = (opts.resolveTenantId ?? defaultResolveTenant)(req);
  if (!tenantId) {
    sendProblem(res, 401, 'Unauthorized');
    return null;
  }
  return { pool: opts.pool, tenantId };
}

function defaultResolveTenant(req: Request): string | null {
  const auth = (req as Request & { auth?: { tenantId?: string } }).auth;
  return auth?.tenantId ?? null;
}

function idParam(req: Request): string | null {
  const v = req.params.id;
  const id = typeof v === 'string' ? v : Array.isArray(v) ? v[0] : '';
  if (!id || !UUID_REGEX.test(id)) return null;
  return id;
}

function sendProblem(res: Response, status: number, title: string, detail?: string): void {
  const body: Record<string, unknown> = { type: 'about:blank', title, status };
  if (detail !== undefined) body.detail = detail;
  res.status(status).contentType('application/problem+json').json(body);
}
