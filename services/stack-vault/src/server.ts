/**
 * Express service for Stack-Vault per CTO Architecture §6.3
 * (`/v1/vaults/me/*`).
 *
 * Endpoints (v0):
 *   GET  /healthz
 *   GET  /v1/vaults/me                       — vault metadata (public view)
 *   GET  /v1/vaults/me/questions/search      — search within the customer's vault
 *   GET  /v1/vaults/me/questions/:uuid       — fetch single watermarked variant
 *   POST /v1/vaults/me/refresh-request       — request out-of-cycle refresh
 *   POST /v1/vaults/me/leak-report           — customer reports suspected leak
 *
 * The factory takes a fully-built dependency graph so unit tests can swap
 * any piece (pool, logger) for a fixture.
 */

import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { Logger } from 'pino';
import { z } from 'zod';
import type { Pool } from '@qorium/db';
import {
  getReleasedQuestion,
  searchVaultQuestions,
  type SearchOptions,
} from './repositories/questions.js';
import { getVaultByTenant, toPublicView, type VaultRow } from './repositories/vaults.js';
import { recordAccess } from './repositories/access-log.js';
import { buildVariant, type VaultIdentity } from './variant.js';
import type { StackVaultConfig } from './config.js';

export interface CreateServerOptions {
  config: StackVaultConfig;
  pool?: Pool;
  logger: Logger;
  /** Override the tenant resolver; default extracts from req.auth (apiKeyAuth). */
  resolveTenantId?: (req: Request) => string | null;
}

const searchSchema = z.object({
  format: z.string().optional(),
  difficulty_min: z.coerce.number().optional(),
  difficulty_max: z.coerce.number().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
  candidate_id: z.string().min(1).max(100).optional(),
});

const refreshRequestSchema = z.object({
  reason: z.string().min(10).max(2_000),
  scope: z.enum(['full_library', 'role_subset', 'specific_questions']).default('full_library'),
  question_ids: z.array(z.string().uuid()).max(100).optional(),
});

const leakReportSchema = z.object({
  question_uuid: z.string().uuid(),
  source_url: z.string().url(),
  evidence: z.string().min(10).max(8_000),
  detected_at: z.string().datetime().optional(),
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function createServer(opts: CreateServerOptions): express.Express {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '256kb' }));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(pinoHttp({ logger: opts.logger }));

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', service: 'qorium-stack-vault' });
  });

  app.get('/v1/vaults/me', (req, res) => {
    void handleVaultMetadata(opts, req, res);
  });

  app.get('/v1/vaults/me/questions/search', (req, res) => {
    void handleSearch(opts, req, res);
  });

  app.get('/v1/vaults/me/questions/:uuid', (req, res) => {
    void handleGetQuestion(opts, req, res);
  });

  app.post('/v1/vaults/me/refresh-request', (req, res) => {
    void handleRefreshRequest(opts, req, res);
  });

  app.post('/v1/vaults/me/leak-report', (req, res) => {
    void handleLeakReport(opts, req, res);
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

async function handleVaultMetadata(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): Promise<void> {
  const ctx = await resolveContext(opts, req, res);
  if (!ctx) return;
  res.json(toPublicView(ctx.vault));
}

async function handleSearch(opts: CreateServerOptions, req: Request, res: Response): Promise<void> {
  const ctx = await resolveContext(opts, req, res);
  if (!ctx) return;
  const parsed = searchSchema.safeParse(req.query);
  if (!parsed.success) {
    sendProblem(res, 400, 'Bad Request', parsed.error.issues.map((i) => i.message).join('; '));
    return;
  }
  const queryOpts: SearchOptions = {};
  if (parsed.data.format !== undefined) queryOpts.format = parsed.data.format;
  if (parsed.data.difficulty_min !== undefined)
    queryOpts.difficultyMin = parsed.data.difficulty_min;
  if (parsed.data.difficulty_max !== undefined)
    queryOpts.difficultyMax = parsed.data.difficulty_max;
  if (parsed.data.limit !== undefined) queryOpts.limit = parsed.data.limit;
  const masters = await searchVaultQuestions(ctx.pool, queryOpts);
  const identity: VaultIdentity = {
    vaultId: ctx.vault.id,
    tenantId: ctx.vault.tenantId,
    watermarkSecret: ctx.vault.watermarkSecret,
  };
  const variants = masters.map((m) => buildVariant(identity, m));
  // Per spec §4.7 (technical access logging), every search is recorded —
  // but we only log the variants the customer actually retrieved (not the
  // full library scan), so the log stays bounded.
  for (const v of variants) {
    await recordAccess(ctx.pool, {
      vaultId: ctx.vault.id,
      tenantId: ctx.vault.tenantId,
      questionId: v.id,
      watermarkId: v.watermarkId,
      ...(parsed.data.candidate_id !== undefined ? { candidateId: parsed.data.candidate_id } : {}),
      ...(req.ip !== undefined ? { requestIp: req.ip } : {}),
      ...(req.headers['user-agent'] !== undefined
        ? { userAgent: String(req.headers['user-agent']) }
        : {}),
    });
  }
  res.json({ count: variants.length, results: variants });
}

async function handleGetQuestion(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): Promise<void> {
  const ctx = await resolveContext(opts, req, res);
  if (!ctx) return;
  const uuidParam = req.params.uuid;
  const uuid =
    typeof uuidParam === 'string' ? uuidParam : Array.isArray(uuidParam) ? uuidParam[0] : '';
  if (!uuid || !UUID_REGEX.test(uuid)) {
    sendProblem(res, 400, 'Invalid question uuid');
    return;
  }
  const master = await getReleasedQuestion(ctx.pool, uuid);
  if (!master) {
    sendProblem(res, 404, 'Question not found');
    return;
  }
  const identity: VaultIdentity = {
    vaultId: ctx.vault.id,
    tenantId: ctx.vault.tenantId,
    watermarkSecret: ctx.vault.watermarkSecret,
  };
  const variant = buildVariant(identity, master);
  await recordAccess(ctx.pool, {
    vaultId: ctx.vault.id,
    tenantId: ctx.vault.tenantId,
    questionId: variant.id,
    watermarkId: variant.watermarkId,
    ...(req.query['candidate_id'] !== undefined
      ? { candidateId: String(req.query['candidate_id']) }
      : {}),
    ...(req.ip !== undefined ? { requestIp: req.ip } : {}),
    ...(req.headers['user-agent'] !== undefined
      ? { userAgent: String(req.headers['user-agent']) }
      : {}),
  });
  res.json(variant);
}

async function handleRefreshRequest(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): Promise<void> {
  const ctx = await resolveContext(opts, req, res);
  if (!ctx) return;
  const parsed = refreshRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    sendProblem(res, 400, 'Bad Request', parsed.error.issues.map((i) => i.message).join('; '));
    return;
  }
  // v0 just acknowledges. The refresh worker (Sprint ≥2.1.x) consumes
  // these requests asynchronously alongside the quarterly cron.
  res.status(202).json({
    status: 'accepted',
    vault_id: ctx.vault.id,
    scope: parsed.data.scope,
    received_at: new Date().toISOString(),
  });
}

async function handleLeakReport(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): Promise<void> {
  const ctx = await resolveContext(opts, req, res);
  if (!ctx) return;
  const parsed = leakReportSchema.safeParse(req.body);
  if (!parsed.success) {
    sendProblem(res, 400, 'Bad Request', parsed.error.issues.map((i) => i.message).join('; '));
    return;
  }
  // v0 acknowledges. The Anti-Leak orchestrator (Sprint 1.4) is the
  // canonical consumer; in a follow-up sprint we'll insert a
  // `content.leak_alerts` row directly here so the customer-reported
  // signal joins the crawler's automated signal.
  res.status(202).json({
    status: 'accepted',
    vault_id: ctx.vault.id,
    received_at: new Date().toISOString(),
  });
}

interface RequestContext {
  pool: Pool;
  vault: VaultRow;
}

async function resolveContext(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): Promise<RequestContext | null> {
  if (!opts.pool) {
    sendProblem(res, 503, 'Database unavailable');
    return null;
  }
  const tenantId = (opts.resolveTenantId ?? defaultResolveTenantId)(req);
  if (!tenantId) {
    sendProblem(res, 401, 'Unauthorized');
    return null;
  }
  const vault = await getVaultByTenant(opts.pool, tenantId);
  if (!vault) {
    sendProblem(res, 404, 'No Stack-Vault for this tenant');
    return null;
  }
  if (vault.status !== 'active') {
    sendProblem(res, 403, `Vault is ${vault.status}`);
    return null;
  }
  return { pool: opts.pool, vault };
}

function defaultResolveTenantId(req: Request): string | null {
  const auth = (req as Request & { auth?: { tenantId?: string } }).auth;
  return auth?.tenantId ?? null;
}

function sendProblem(res: Response, status: number, title: string, detail?: string): void {
  const body: Record<string, unknown> = {
    type: 'about:blank',
    title,
    status,
  };
  if (detail !== undefined) body.detail = detail;
  res.status(status).contentType('application/problem+json').json(body);
}
