/**
 * Express service for API key issuance + revocation per
 * `infra/D3-Talpro-Internal-API-Key-Spec.md`.
 *
 * Endpoints (v0):
 *   GET  /healthz
 *   POST /v1/api-keys                 — issue a key (admin scope required)
 *   GET  /v1/api-keys                 — list keys for the tenant
 *   POST /v1/api-keys/:id/revoke      — revoke a key
 *   GET  /v1/api-keys/rotation-due    — list keys past their rotation window
 *
 * The actual scope-enforcement middleware (`enforceScope`) is exported
 * from this package so consumer services can wire it.
 */

import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { Logger } from 'pino';
import { z } from 'zod';
import type { Pool } from '@qorium/db';
import { createAuditEmitter, type AuditEmitter } from '@qorium/audit-emitter';
import type { ApiKeyMgmtConfig } from './config.js';
import { issueKey, nextRotationDueAt } from './issuance.js';
import { insertKey, listKeys, listKeysDueForRotation, revokeKey } from './repositories/keys.js';
import { bundleScopes, isScope, type Scope, type ScopeBundle } from './scopes.js';

export interface CreateServerOptions {
  config: ApiKeyMgmtConfig;
  logger: Logger;
  pool?: Pool;
  resolveTenantId?: (req: Request) => string | null;
  authoriseAdmin?: (req: Request) => boolean;
  /**
   * Optional pre-built audit emitter. If omitted, a stub is created so
   * dev/test runs do not require a live audit-log service. Set
   * `AUDIT_LOG_BASE_URL` + `AUDIT_LOG_ADMIN_TOKEN` in production +
   * pass a real emitter from index.ts.
   */
  auditEmitter?: AuditEmitter;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const issueSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    family: z.enum(['live', 'test', 'internal']),
    tenant_prefix: z
      .string()
      .regex(/^[a-z0-9-]{8,32}$/)
      .optional(),
    bundle: z.enum(['talpro_internal', 'readybank_customer', 'readonly', 'full_admin']).optional(),
    scopes: z.array(z.string()).optional(),
    rate_limit_per_min: z.number().int().positive().max(100_000).optional(),
    rate_limit_burst: z.number().int().positive().max(100_000).optional(),
    expires_at: z.string().datetime().optional(),
  })
  .refine((v) => v.bundle !== undefined || v.scopes !== undefined, {
    message: 'either bundle or scopes is required',
  });

export function createServer(opts: CreateServerOptions): express.Express {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '64kb' }));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(pinoHttp({ logger: opts.logger }));

  const audit = opts.auditEmitter ?? createAuditEmitter({ mode: 'stub' });

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', service: 'qorium-api-key-mgmt' });
  });

  app.post('/v1/api-keys', (req, res) => {
    void handleIssue(opts, audit, req, res);
  });
  app.get('/v1/api-keys', (req, res) => {
    void handleList(opts, req, res);
  });
  app.post('/v1/api-keys/:id/revoke', (req, res) => {
    void handleRevoke(opts, audit, req, res);
  });
  app.get('/v1/api-keys/rotation-due', (req, res) => {
    void handleRotationDue(opts, req, res);
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

async function handleIssue(
  opts: CreateServerOptions,
  audit: AuditEmitter,
  req: Request,
  res: Response,
): Promise<void> {
  const ctx = ensureAdminContext(opts, req, res);
  if (!ctx) return;
  const parsed = issueSchema.safeParse(req.body);
  if (!parsed.success) {
    sendProblem(res, 400, 'Bad Request', parsed.error.issues.map((i) => i.message).join('; '));
    return;
  }
  if (parsed.data.family === 'internal' && !parsed.data.tenant_prefix) {
    sendProblem(res, 400, 'tenant_prefix is required for internal family');
    return;
  }
  const scopes: Scope[] =
    parsed.data.bundle !== undefined
      ? bundleScopes(parsed.data.bundle as ScopeBundle)
      : (parsed.data.scopes ?? []).filter(isScope);
  if (scopes.length === 0) {
    sendProblem(res, 400, 'no valid scopes provided');
    return;
  }

  let issued: ReturnType<typeof issueKey>;
  try {
    const issueInputs: Parameters<typeof issueKey>[0] = {
      family: parsed.data.family,
      pepper: opts.config.pepper,
    };
    if (parsed.data.tenant_prefix) issueInputs.tenantPrefix = parsed.data.tenant_prefix;
    issued = issueKey(issueInputs);
  } catch (err) {
    sendProblem(res, 400, err instanceof Error ? err.message : 'issuance failed');
    return;
  }

  const now = new Date();
  const rotationDueAt = nextRotationDueAt(now, parsed.data.family);
  const stored = await insertKey(ctx.pool, {
    tenantId: ctx.tenantId,
    name: parsed.data.name ?? null,
    prefix: issued.prefix,
    hashedKey: issued.hash,
    scopes,
    rateLimitPerMin: parsed.data.rate_limit_per_min ?? 60,
    rateLimitBurst: parsed.data.rate_limit_burst ?? 120,
    rotationDueAt,
    expiresAt: parsed.data.expires_at ? new Date(parsed.data.expires_at) : null,
  });

  await audit.emit({
    tenantId: ctx.tenantId,
    actorId: resolveActorId(req),
    actorType: 'admin',
    action: 'api_key.created',
    resourceType: 'api_key',
    resourceId: stored.id,
    payload: {
      family: parsed.data.family,
      name: parsed.data.name ?? null,
      scopes,
      rate_limit_per_min: stored.rateLimitPerMin,
      rate_limit_burst: stored.rateLimitBurst,
      rotation_due_at: stored.rotationDueAt,
    },
  });

  res.status(201).json({
    key: stored,
    raw: issued.raw,
    note: 'The raw key is shown only once. Persist it now.',
  });
}

async function handleList(opts: CreateServerOptions, req: Request, res: Response): Promise<void> {
  const ctx = ensureContext(opts, req, res);
  if (!ctx) return;
  const includeRevoked = String(req.query.include_revoked ?? '').toLowerCase() === 'true';
  const keys = await listKeys(ctx.pool, ctx.tenantId, { includeRevoked });
  res.json({ count: keys.length, keys });
}

async function handleRevoke(
  opts: CreateServerOptions,
  audit: AuditEmitter,
  req: Request,
  res: Response,
): Promise<void> {
  const ctx = ensureAdminContext(opts, req, res);
  if (!ctx) return;
  const id = String(req.params.id ?? '');
  if (!UUID_REGEX.test(id)) {
    sendProblem(res, 400, 'Invalid key id');
    return;
  }
  const row = await revokeKey(ctx.pool, ctx.tenantId, id);
  if (!row) {
    sendProblem(res, 404, 'Key not found or already revoked');
    return;
  }
  await audit.emit({
    tenantId: ctx.tenantId,
    actorId: resolveActorId(req),
    actorType: 'admin',
    action: 'api_key.revoked',
    resourceType: 'api_key',
    resourceId: row.id,
    payload: { prefix: row.prefix, revoked_at: row.revokedAt },
  });
  res.json(row);
}

async function handleRotationDue(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): Promise<void> {
  const ctx = ensureAdminContext(opts, req, res);
  if (!ctx) return;
  const cutoffDays = Number.parseInt(String(req.query.within_days ?? '14'), 10) || 14;
  const cutoff = new Date(Date.now() + cutoffDays * 86_400_000);
  const keys = await listKeysDueForRotation(ctx.pool, cutoff);
  res.json({ count: keys.length, within_days: cutoffDays, keys });
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

function ensureAdminContext(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): RequestContext | null {
  const ctx = ensureContext(opts, req, res);
  if (!ctx) return null;
  const auth = opts.authoriseAdmin ?? (() => false);
  if (!auth(req)) {
    sendProblem(res, 403, 'Admin scope required');
    return null;
  }
  return ctx;
}

function defaultResolveTenant(req: Request): string | null {
  const auth = (req as Request & { auth?: { tenantId?: string } }).auth;
  if (auth?.tenantId) return auth.tenantId;
  const header = req.headers['x-tenant-id'];
  return typeof header === 'string' && UUID_REGEX.test(header) ? header : null;
}

function resolveActorId(req: Request): string | null {
  const auth = (req as Request & { auth?: { actorId?: string; userId?: string } }).auth;
  if (auth?.actorId) return auth.actorId;
  if (auth?.userId) return auth.userId;
  const header = req.headers['x-actor-id'];
  return typeof header === 'string' ? header : null;
}

function sendProblem(res: Response, status: number, title: string, detail?: string): void {
  const body: Record<string, unknown> = { type: 'about:blank', title, status };
  if (detail !== undefined) body.detail = detail;
  res.status(status).contentType('application/problem+json').json(body);
}
