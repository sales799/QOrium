/**
 * Express service for the audit log read API per spec §3.
 *
 * Endpoints (v0):
 *   GET  /healthz
 *   GET  /v1/audit/events                    — list with pagination + filters
 *   GET  /v1/audit/events/:id                — single event
 *   GET  /v1/audit/summary                   — top-N action counts in window
 *   POST /v1/audit/events                    — system-only insert (requires admin scope)
 *
 * The async export endpoint + GDPR/DPDPA workflows are deferred per
 * `infra/CTO-deltas/CTO-DELTA-audit-log-export-deferred.md`.
 */

import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { Logger } from 'pino';
import { z } from 'zod';
import type { Pool } from '@qorium/db';
import type { AuditLogConfig } from './config.js';
import {
  getEventById,
  listEvents,
  recordEvent,
  summarise,
  type RecordEventInput,
} from './repositories/events.js';
import { parseListInputs, type ListQueryInputs } from './query.js';

export interface CreateServerOptions {
  config: AuditLogConfig;
  logger: Logger;
  pool?: Pool;
  resolveTenantId?: (req: Request) => string | null;
  /** Authorise system writes — by default rejects unless caller passes their own auth. */
  authoriseSystemWrite?: (req: Request) => boolean;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const recordSchema = z.object({
  tenant_id: z.string().regex(UUID_REGEX).nullable().optional(),
  actor_id: z.string().regex(UUID_REGEX).nullable().optional(),
  actor_type: z.string().min(1).max(50).optional(),
  action: z.string().min(1).max(100),
  resource_type: z.string().max(50).nullable().optional(),
  resource_id: z.string().max(100).nullable().optional(),
  changes: z.unknown().optional(),
  payload: z.unknown().optional(),
  ip_address: z.string().nullable().optional(),
  user_agent: z.string().nullable().optional(),
});

export function createServer(opts: CreateServerOptions): express.Express {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '256kb' }));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(pinoHttp({ logger: opts.logger }));

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', service: 'qorium-audit-log' });
  });

  app.get('/v1/audit/events', (req, res) => {
    void handleList(opts, req, res);
  });
  app.get('/v1/audit/events/:id', (req, res) => {
    void handleGet(opts, req, res);
  });
  app.get('/v1/audit/summary', (req, res) => {
    void handleSummary(opts, req, res);
  });
  app.post('/v1/audit/events', (req, res) => {
    void handleRecord(opts, req, res);
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
  const parsed = parseListInputs({
    tenantId: ctx.tenantId,
    ...readListQuery(req),
    defaultLimit: opts.config.defaultLimit,
    maxLimit: opts.config.maxLimit,
  });
  if (parsed.errors.length > 0) {
    sendProblem(res, 400, 'Bad Request', parsed.errors.join('; '));
    return;
  }
  const { errors: _errors, ...inputs } = parsed;
  const result = await listEvents(ctx.pool, inputs as ListQueryInputs);
  res.json(result);
}

async function handleGet(opts: CreateServerOptions, req: Request, res: Response): Promise<void> {
  const ctx = ensureContext(opts, req, res);
  if (!ctx) return;
  const id = idParam(req);
  if (!id) {
    sendProblem(res, 400, 'Invalid event id');
    return;
  }
  const row = await getEventById(ctx.pool, ctx.tenantId, id);
  if (!row) {
    sendProblem(res, 404, 'Event not found');
    return;
  }
  res.json(row);
}

async function handleSummary(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): Promise<void> {
  const ctx = ensureContext(opts, req, res);
  if (!ctx) return;
  const { startDate, endDate } = readListQuery(req);
  const topN = clampInt(toInt(req.query.top), 1, 50, 10);
  const rows = await summarise(ctx.pool, ctx.tenantId, startDate, endDate, topN);
  res.json({ window: { start: startDate ?? null, end: endDate ?? null }, top: rows });
}

async function handleRecord(opts: CreateServerOptions, req: Request, res: Response): Promise<void> {
  if (!opts.pool) {
    sendProblem(res, 503, 'Database unavailable');
    return;
  }
  const auth = opts.authoriseSystemWrite ?? (() => false);
  if (!auth(req)) {
    sendProblem(res, 403, 'System writes require admin scope');
    return;
  }
  const parsed = recordSchema.safeParse(req.body);
  if (!parsed.success) {
    sendProblem(res, 400, 'Bad Request', parsed.error.issues.map((i) => i.message).join('; '));
    return;
  }
  const input: RecordEventInput = {
    tenantId: parsed.data.tenant_id ?? null,
    actorId: parsed.data.actor_id ?? null,
    action: parsed.data.action,
  };
  if (parsed.data.actor_type !== undefined) input.actorType = parsed.data.actor_type;
  if (parsed.data.resource_type !== undefined) input.resourceType = parsed.data.resource_type;
  if (parsed.data.resource_id !== undefined) input.resourceId = parsed.data.resource_id;
  if (parsed.data.changes !== undefined) input.changes = parsed.data.changes;
  if (parsed.data.payload !== undefined) input.payload = parsed.data.payload;
  if (parsed.data.ip_address !== undefined) input.ipAddress = parsed.data.ip_address;
  if (parsed.data.user_agent !== undefined) input.userAgent = parsed.data.user_agent;
  const row = await recordEvent(opts.pool, input);
  res.status(201).json(row);
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
  if (auth?.tenantId) return auth.tenantId;
  const header = req.headers['x-tenant-id'];
  return typeof header === 'string' && UUID_REGEX.test(header) ? header : null;
}

function readListQuery(req: Request): {
  startDate?: string;
  endDate?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  actorId?: string;
  limit?: number;
  offset?: number;
} {
  const q = req.query;
  const out: ReturnType<typeof readListQuery> = {};
  const start = q.start_date;
  if (typeof start === 'string') out.startDate = start;
  const end = q.end_date;
  if (typeof end === 'string') out.endDate = end;
  if (typeof q.action === 'string') out.action = q.action;
  if (typeof q.resource_type === 'string') out.resourceType = q.resource_type;
  if (typeof q.resource_id === 'string') out.resourceId = q.resource_id;
  if (typeof q.actor_id === 'string') out.actorId = q.actor_id;
  const limit = toInt(q.limit);
  if (typeof limit === 'number') out.limit = limit;
  const offset = toInt(q.offset);
  if (typeof offset === 'number') out.offset = offset;
  return out;
}

function idParam(req: Request): string | null {
  const v = req.params.id;
  const id = typeof v === 'string' ? v : Array.isArray(v) ? v[0] : '';
  if (!id || !UUID_REGEX.test(id)) return null;
  return id;
}

function toInt(value: unknown): number | undefined {
  if (typeof value !== 'string' && typeof value !== 'number') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function clampInt(value: number | undefined, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number') return fallback;
  return Math.min(Math.max(Math.trunc(value), min), max);
}

function sendProblem(res: Response, status: number, title: string, detail?: string): void {
  const body: Record<string, unknown> = { type: 'about:blank', title, status };
  if (detail !== undefined) body.detail = detail;
  res.status(status).contentType('application/problem+json').json(body);
}
