/**
 * Express service surface per spec §6 (`POST /v1/jd-forge/generate`,
 * `GET /v1/jd-forge/requests/{id}`, `POST /requests/{id}/feedback`).
 *
 * The factory takes a fully-built dependency graph so unit tests can swap
 * any piece (parser, mapper, generator, pool, logger) for a fixture.
 */

import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { Logger } from 'pino';
import { z } from 'zod';
import type { Pool } from '@qorium/db';
import { runOrder, type OrchestratorPipeline } from './orchestrator.js';
import { createOrder, getOrder, markCompleted, markFailed } from './repositories/orders.js';
import type { JdForgeConfig } from './config.js';
import type { ExportFormat, OrderInput, Tier } from './types.js';

export interface CreateServerOptions {
  config: JdForgeConfig;
  pool?: Pool;
  pipeline: OrchestratorPipeline;
  logger: Logger;
}

const generateSchema = z.object({
  tier: z.enum(['standard', 'reviewed', 'enterprise']).default('standard'),
  jd_text: z.string().min(50, 'jd_text must be at least 50 characters'),
  export_format: z.enum(['json', 'csv', 'mettl-csv', 'hackerrank-yaml', 'pdf']).default('json'),
  tenant_id: z.string().uuid().optional(),
  total_questions: z.number().int().positive().max(100).optional(),
});

const feedbackSchema = z.object({
  score: z.number().int().min(1).max(5),
  comments: z.string().max(2_000).optional(),
});

export function createServer(opts: CreateServerOptions): express.Express {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '512kb' }));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(pinoHttp({ logger: opts.logger }));

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', service: 'qorium-jd-forge' });
  });

  app.post('/v1/jd-forge/generate', (req, res) => {
    void handleGenerate(opts, req, res);
  });

  app.get('/v1/jd-forge/requests/:id', (req, res) => {
    void handleGet(opts, req, res);
  });

  app.post('/v1/jd-forge/requests/:id/feedback', (req, res) => {
    void handleFeedback(req, res);
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

async function handleGenerate(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = generateSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .contentType('application/problem+json')
      .json({
        type: 'about:blank',
        title: 'Bad Request',
        status: 400,
        detail: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      });
    return;
  }
  if (!opts.pool) {
    res.status(503).contentType('application/problem+json').json({
      type: 'about:blank',
      title: 'Database unavailable',
      status: 503,
    });
    return;
  }
  const { tier, jd_text, export_format, tenant_id, total_questions } = parsed.data;
  const tenantId = tenant_id ?? deriveTenantFromAuth(req);

  let order;
  try {
    order = await createOrder(opts.pool, {
      tenantId,
      tier: tier as Tier,
      jdText: jd_text,
      exportFormat: export_format as ExportFormat,
    });
  } catch (err) {
    opts.logger.error({ err }, 'failed to create JD-Forge order');
    res.status(500).contentType('application/problem+json').json({
      type: 'about:blank',
      title: 'Failed to create order',
      status: 500,
    });
    return;
  }

  // For v0 we run the pipeline synchronously and respond with the result.
  // A future BullMQ split will return 202 + poll-URL per spec §6.
  const orderInput: OrderInput = {
    orderId: order.id,
    tenantId: order.tenantId,
    tier: order.tier,
    jdText: jd_text,
    exportFormat: order.exportFormat,
  };
  if (total_questions !== undefined) orderInput.totalQuestions = total_questions;

  try {
    const outcome = await runOrder(opts.pipeline, orderInput);
    if (outcome.status === 'completed') {
      await markCompleted(opts.pool, {
        orderId: order.id,
        parsedSpec: { parsedJd: outcome.parsedJd, mapping: outcome.mapping, spec: outcome.spec },
        questionIds: outcome.questions.map((q) => q.id),
      });
      res.status(201).json({
        order_id: order.id,
        status: 'completed',
        rejected_count: outcome.rejectedCount,
        questions: outcome.questions,
      });
    } else {
      await markFailed(opts.pool, order.id, outcome.failureReason ?? 'unknown');
      res
        .status(422)
        .contentType('application/problem+json')
        .json({
          type: 'about:blank',
          title: 'Generation failed',
          status: 422,
          detail: outcome.failureReason ?? 'unknown',
          order_id: order.id,
        });
    }
  } catch (err) {
    opts.logger.error({ err, orderId: order.id }, 'orchestrator threw');
    await markFailed(opts.pool, order.id, err instanceof Error ? err.message : String(err));
    res.status(500).contentType('application/problem+json').json({
      type: 'about:blank',
      title: 'Internal error',
      status: 500,
    });
  }
}

async function handleGet(opts: CreateServerOptions, req: Request, res: Response): Promise<void> {
  if (!opts.pool) {
    res.status(503).contentType('application/problem+json').json({
      type: 'about:blank',
      title: 'Database unavailable',
      status: 503,
    });
    return;
  }
  const idParam = req.params.id;
  const id = typeof idParam === 'string' ? idParam : Array.isArray(idParam) ? idParam[0] : '';
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    res.status(400).contentType('application/problem+json').json({
      type: 'about:blank',
      title: 'Invalid order id',
      status: 400,
    });
    return;
  }
  const order = await getOrder(opts.pool, id);
  if (!order) {
    res.status(404).contentType('application/problem+json').json({
      type: 'about:blank',
      title: 'Order not found',
      status: 404,
    });
    return;
  }
  res.json(order);
}

function handleFeedback(req: Request, res: Response): void {
  const parsed = feedbackSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .contentType('application/problem+json')
      .json({
        type: 'about:blank',
        title: 'Bad Request',
        status: 400,
        detail: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      });
    return;
  }
  // v0 just accepts and acknowledges. Persisting + retraining loop is M3+.
  res.status(202).json({ status: 'accepted' });
}

function deriveTenantFromAuth(req: Request): string {
  // Placeholder: in prod the apiKeyAuth middleware (Sprint 1.0) attaches
  // req.auth with tenantId. v0 falls back to a synthetic uuid for tests.
  const auth = (req as Request & { auth?: { tenantId?: string } }).auth;
  return auth?.tenantId ?? '00000000-0000-0000-0000-000000000000';
}
