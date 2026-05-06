/**
 * Express service for the Wave 3 AI pair-coding orchestrator.
 *
 * Endpoints (v0):
 *   GET  /healthz
 *   POST /v1/ai-pair-coding/sessions             — start a session
 *   GET  /v1/ai-pair-coding/sessions/:id         — read session
 *   POST /v1/ai-pair-coding/sessions/:id/turn    — submit a candidate turn
 *   POST /v1/ai-pair-coding/sessions/:id/submit  — finalise + grade
 */

import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { Logger } from 'pino';
import { z } from 'zod';
import type { Pool } from '@qorium/db';
import { gradeSession, type SessionSignals } from './grader.js';
import { stubAnthropicClient, type AnthropicClient } from './anthropic.js';
import {
  appendMessage,
  createSession,
  getSession,
  submitSession,
} from './repositories/sessions.js';

export interface CreateServerOptions {
  logger: Logger;
  pool?: Pool;
  anthropic?: AnthropicClient;
  resolveTenantId?: (req: Request) => string | null;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const createSchema = z.object({
  question_id: z.string().regex(UUID_REGEX).nullish(),
  candidate_id: z.string().min(1).max(128),
});

const turnSchema = z.object({
  candidate_message: z.string().min(1).max(4000),
});

const submitSchema = z.object({
  final_code_text: z.string().max(50_000),
  signals: z.object({
    typedChars: z.number().int().nonnegative(),
    pastedChars: z.number().int().nonnegative(),
    editTestCycles: z.number().int().nonnegative(),
    candidateMessageCount: z.number().int().nonnegative(),
    acceptedVerbatimCount: z.number().int().nonnegative(),
    acceptedModifiedCount: z.number().int().nonnegative(),
    rejectedCount: z.number().int().nonnegative(),
    seededErrorsCaught: z.number().int().nonnegative(),
    seededErrorsTotal: z.number().int().nonnegative(),
    codeQualityScore: z.number().min(0).max(5),
    timeToFirstCodeSec: z.number().nonnegative(),
    durationSec: z.number().nonnegative(),
  }),
});

export function createServer(opts: CreateServerOptions): express.Express {
  const anthropic = opts.anthropic ?? stubAnthropicClient();
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '256kb' }));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(pinoHttp({ logger: opts.logger }));

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', service: 'qorium-ai-pair-coding-orchestrator' });
  });

  app.post('/v1/ai-pair-coding/sessions', (req, res) => {
    void handleCreate(opts, req, res);
  });
  app.get('/v1/ai-pair-coding/sessions/:id', (req, res) => {
    void handleGet(opts, req, res);
  });
  app.post('/v1/ai-pair-coding/sessions/:id/turn', (req, res) => {
    void handleTurn(opts, anthropic, req, res);
  });
  app.post('/v1/ai-pair-coding/sessions/:id/submit', (req, res) => {
    void handleSubmit(opts, req, res);
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

async function handleCreate(opts: CreateServerOptions, req: Request, res: Response): Promise<void> {
  const ctx = ensureContext(opts, req, res);
  if (!ctx) return;
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    sendProblem(res, 400, 'Bad Request', parsed.error.issues.map((i) => i.message).join('; '));
    return;
  }
  const session = await createSession(ctx.pool, {
    questionId: parsed.data.question_id ?? null,
    candidateId: parsed.data.candidate_id,
    tenantId: ctx.tenantId,
  });
  res.status(201).json(session);
}

async function handleGet(opts: CreateServerOptions, req: Request, res: Response): Promise<void> {
  if (!opts.pool) {
    sendProblem(res, 503, 'Database unavailable');
    return;
  }
  const id = String(req.params.id ?? '');
  if (!UUID_REGEX.test(id)) {
    sendProblem(res, 400, 'Invalid session id');
    return;
  }
  const row = await getSession(opts.pool, id);
  if (!row) {
    sendProblem(res, 404, 'Session not found');
    return;
  }
  res.json(row);
}

async function handleTurn(
  opts: CreateServerOptions,
  anthropic: AnthropicClient,
  req: Request,
  res: Response,
): Promise<void> {
  if (!opts.pool) {
    sendProblem(res, 503, 'Database unavailable');
    return;
  }
  const id = String(req.params.id ?? '');
  if (!UUID_REGEX.test(id)) {
    sendProblem(res, 400, 'Invalid session id');
    return;
  }
  const parsed = turnSchema.safeParse(req.body);
  if (!parsed.success) {
    sendProblem(res, 400, 'Bad Request', parsed.error.issues.map((i) => i.message).join('; '));
    return;
  }
  const session = await getSession(opts.pool, id);
  if (!session || session.status !== 'in_progress') {
    sendProblem(res, 404, 'Session not in progress');
    return;
  }
  await appendMessage(opts.pool, {
    sessionId: id,
    role: 'candidate',
    text: parsed.data.candidate_message,
    containedCode: parsed.data.candidate_message.includes('```'),
  });

  const completion = await anthropic.complete({
    messages: [{ role: 'user', content: parsed.data.candidate_message }],
  });
  await appendMessage(opts.pool, {
    sessionId: id,
    role: 'ai_assistant',
    text: completion.text,
    containedCode: completion.text.includes('```'),
  });

  res.status(201).json({
    ai_message: completion.text,
    usage: completion.usage,
    model_id: completion.modelId,
  });
}

async function handleSubmit(opts: CreateServerOptions, req: Request, res: Response): Promise<void> {
  if (!opts.pool) {
    sendProblem(res, 503, 'Database unavailable');
    return;
  }
  const id = String(req.params.id ?? '');
  if (!UUID_REGEX.test(id)) {
    sendProblem(res, 400, 'Invalid session id');
    return;
  }
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    sendProblem(res, 400, 'Bad Request', parsed.error.issues.map((i) => i.message).join('; '));
    return;
  }
  const signals = parsed.data.signals as SessionSignals;
  const grades = gradeSession(signals);
  const out = await submitSession(opts.pool, id, {
    finalCodeText: parsed.data.final_code_text,
    signals: signals as unknown as Record<string, unknown>,
    grades,
    aiMessagesCount: signals.candidateMessageCount,
    candidateTypedChars: signals.typedChars,
    candidatePastedChars: signals.pastedChars,
    editTestCycles: signals.editTestCycles,
  });
  if (!out) {
    sendProblem(res, 404, 'Session not found');
    return;
  }
  res.status(200).json(out);
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
  const header = req.headers['x-tenant-id'];
  return typeof header === 'string' && UUID_REGEX.test(header) ? header : null;
}

function sendProblem(res: Response, status: number, title: string, detail?: string): void {
  const body: Record<string, unknown> = { type: 'about:blank', title, status };
  if (detail !== undefined) body.detail = detail;
  res.status(status).contentType('application/problem+json').json(body);
}
