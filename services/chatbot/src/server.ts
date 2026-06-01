import crypto from 'node:crypto';
import express from 'express';
import type { Express, RequestHandler } from 'express';
import helmet from 'helmet';
import type { Logger } from 'pino';
import { z, ZodError } from 'zod';
import type { Config } from './config.js';
import { ok, fail } from './api/envelope.js';
import { ChatbotService } from './service.js';
import type { ChatModel } from './llm/types.js';
import type { Retriever } from './rag/types.js';
import type { ConversationStore } from './store/memory.js';
import type { LeadNotifier } from './notify.js';

export interface ServerDeps {
  config: Config;
  logger: Logger;
  store: ConversationStore;
  retriever: Retriever;
  model: ChatModel;
  notifier?: LeadNotifier;
}

export interface ServerHandle {
  app: Express;
  service: ChatbotService;
}

const sessionSchema = z.object({
  pagePath: z.string().min(1).max(300).optional(),
});

const messageSchema = z.object({
  sessionId: z.string().min(8).max(80),
  message: z.string().min(1).max(1000),
  pagePath: z.string().min(1).max(300).optional(),
});

const leadSchema = z.object({
  sessionId: z.string().min(8).max(80).optional(),
  email: z.string().email(),
  company: z.string().min(1).max(120),
  role: z.string().min(1).max(120),
  need: z.string().min(1).max(500),
  pagePath: z.string().min(1).max(300).optional(),
});

export function createServer(deps: ServerDeps): ServerHandle {
  const app = express();
  const service = new ChatbotService({
    store: deps.store,
    retriever: deps.retriever,
    model: deps.model,
    ...(deps.notifier ? { notifier: deps.notifier } : {}),
  });

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          frameAncestors: ["'none'"],
          objectSrc: ["'none'"],
        },
      },
    }),
  );
  app.use(requestLogger(deps.logger));
  app.use(express.json({ limit: '64kb' }));
  app.use(
    rateLimit({
      requestLimitPerMinute: deps.config.requestLimitPerMinute,
      sessionLimitPerDay: deps.config.sessionLimitPerDay,
    }),
  );

  app.get('/v1/chatbot/health', (_req, res) => {
    res.status(200).json(
      ok({
        service: deps.config.serviceName,
        version: deps.config.version,
        git_sha: deps.config.gitSha,
        env: deps.config.nodeEnv,
        uptime_seconds: Math.floor(process.uptime()),
      }),
    );
  });

  app.post('/v1/chatbot/session', async (req, res) => {
    try {
      const body = sessionSchema.parse(req.body);
      const result = await service.createSession(body);
      res.status(200).json(ok(result));
    } catch (err) {
      sendError(res, err);
    }
  });

  app.post('/v1/chatbot/message', async (req, res) => {
    try {
      const body = messageSchema.parse(req.body);
      const result = await service.handleMessage(body);
      res.status(200).json(ok(result));
    } catch (err) {
      sendError(res, err);
    }
  });

  app.post('/v1/chatbot/leadCapture', verifyLeadSignature(deps.config), async (req, res) => {
    try {
      const body = leadSchema.parse(req.body);
      const result = await service.captureLead(body);
      res.status(200).json(ok(result));
    } catch (err) {
      sendError(res, err);
    }
  });

  app.use((_req, res) => {
    res.status(404).json(fail('not_found', 'No chatbot route matches this request.'));
  });

  return { app, service };
}

function sendError(res: import('express').Response, err: unknown): void {
  if (err instanceof ZodError) {
    res
      .status(400)
      .json(fail('validation_error', 'Request validation failed.', err.flatten().fieldErrors));
    return;
  }
  const message = err instanceof Error ? err.message : 'Unexpected chatbot error.';
  res.status(500).json(fail('internal_error', message));
}

function verifyLeadSignature(config: Config): RequestHandler {
  return (req, res, next) => {
    if (!config.leadHmacSecret) {
      if (config.nodeEnv === 'production') {
        res
          .status(503)
          .json(
            fail(
              'missing_signature_secret',
              'Lead capture is not configured for signed internal requests.',
            ),
          );
        return;
      }
      next();
      return;
    }

    const signature = req.get('x-qor-signature');
    const payload = JSON.stringify(req.body ?? {});
    const expected = crypto
      .createHmac('sha256', config.leadHmacSecret)
      .update(payload)
      .digest('hex');
    if (!signature || !safeEqual(signature, expected)) {
      res.status(401).json(fail('invalid_signature', 'Lead capture signature is invalid.'));
      return;
    }
    next();
  };
}

function rateLimit(config: {
  requestLimitPerMinute: number;
  sessionLimitPerDay: number;
}): RequestHandler {
  const ipBuckets = new Map<string, { count: number; resetAt: number }>();
  const sessionBuckets = new Map<string, { count: number; resetAt: number }>();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip ?? 'unknown';
    const bucket = ipBuckets.get(key);
    if (!incrementBucket(ipBuckets, key, now, 60_000, config.requestLimitPerMinute, bucket)) {
      res.status(429).json(fail('rate_limit_exceeded', 'Too many chatbot requests.'));
      return;
    }

    const sessionId = typeof req.body?.sessionId === 'string' ? req.body.sessionId : undefined;
    if (
      sessionId &&
      !incrementBucket(
        sessionBuckets,
        sessionId,
        now,
        24 * 60 * 60 * 1000,
        config.sessionLimitPerDay,
        sessionBuckets.get(sessionId),
      )
    ) {
      res.status(429).json(fail('rate_limit_exceeded', 'Too many chatbot requests.'));
      return;
    }

    next();
  };
}

function incrementBucket(
  buckets: Map<string, { count: number; resetAt: number }>,
  key: string,
  now: number,
  windowMs: number,
  limit: number,
  bucket: { count: number; resetAt: number } | undefined,
): boolean {
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function requestLogger(logger: Logger): RequestHandler {
  return (req, res, next) => {
    const requestId = req.headers['x-request-id']?.toString() ?? crypto.randomUUID();
    res.setHeader('x-request-id', requestId);
    const startedAt = Date.now();
    res.on('finish', () => {
      logger.info(
        {
          request_id: requestId,
          method: req.method,
          path: req.originalUrl,
          status_code: res.statusCode,
          duration_ms: Date.now() - startedAt,
        },
        'chatbot request completed',
      );
    });
    next();
  };
}
