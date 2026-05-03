/**
 * Express webhook receiver per spec §5.1. Per ATS, the route shape is:
 *
 *   POST /webhooks/:platform/:tenantId
 *
 * The bridge:
 *   1. Captures the raw request body for signature verification.
 *   2. Looks up the (tenant, platform) integration.
 *   3. Verifies the inbound signature using the integration's webhook secret.
 *   4. Derives an idempotency key + records the webhook (UNIQUE constraint
 *      enforces replay safety).
 *   5. Maps the payload via the registered adapter; returns the outcome.
 */

import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { Logger } from 'pino';
import {
  ConnectorRegistry,
  defaultRegistry,
  deriveIdempotencyKey,
  type AtsPlatform,
  type InboundWebhook,
} from '@qorium/ats-connectors';
import type { Pool } from '@qorium/db';
import {
  getIntegrationByTenantPlatform,
  recordWebhook,
  markWebhookProcessed,
  toCredentials,
  type CipherDecoder,
} from './repositories/integrations.js';
import type { AtsBridgeConfig } from './config.js';

export interface CreateServerOptions {
  config: AtsBridgeConfig;
  logger: Logger;
  pool?: Pool;
  registry?: ConnectorRegistry;
  /** KMS decoder used to turn the cipher columns into plaintext credentials. */
  decodeCipher?: CipherDecoder;
}

const SUPPORTED_PLATFORMS: ReadonlySet<AtsPlatform> = new Set([
  'greenhouse',
  'ashby',
  'darwinbox',
  'workday',
]);

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function createServer(opts: CreateServerOptions): express.Express {
  const registry = opts.registry ?? defaultRegistry();
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(pinoHttp({ logger: opts.logger }));

  app.get('/healthz', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'qorium-ats-bridge',
      adapters: registry.platforms(),
    });
  });

  // Webhook route uses raw body to preserve signature integrity.
  app.post(
    '/webhooks/:platform/:tenantId',
    express.raw({ type: '*/*', limit: '512kb' }),
    (req, res) => {
      void handleWebhook(opts, registry, req, res);
    },
  );

  app.use(express.json({ limit: '256kb' }));

  app.use((_req, res) => {
    res.status(404).contentType('application/problem+json').json({
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
    });
  });

  return app;
}

async function handleWebhook(
  opts: CreateServerOptions,
  registry: ConnectorRegistry,
  req: Request,
  res: Response,
): Promise<void> {
  const platformParam = String(req.params.platform ?? '').toLowerCase();
  if (!SUPPORTED_PLATFORMS.has(platformParam as AtsPlatform)) {
    sendProblem(res, 404, 'Unknown ATS platform');
    return;
  }
  const platform = platformParam as AtsPlatform;
  const tenantId = String(req.params.tenantId ?? '');
  if (!UUID_REGEX.test(tenantId)) {
    sendProblem(res, 400, 'Invalid tenant id');
    return;
  }
  if (!opts.pool) {
    sendProblem(res, 503, 'Database unavailable');
    return;
  }
  if (!registry.has(platform)) {
    sendProblem(res, 404, `No adapter registered for ${platform}`);
    return;
  }

  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(String(req.body ?? ''));
  let parsedBody: unknown;
  try {
    parsedBody = rawBody.length > 0 ? JSON.parse(rawBody.toString('utf8')) : null;
  } catch {
    sendProblem(res, 400, 'Webhook body is not valid JSON');
    return;
  }

  const integration = await getIntegrationByTenantPlatform(opts.pool, tenantId, platform);
  if (!integration) {
    sendProblem(res, 404, 'No integration for this tenant + platform');
    return;
  }
  if (integration.status !== 'active') {
    sendProblem(res, 403, `Integration is ${integration.status}`);
    return;
  }

  const adapter = registry.get(platform);
  const decode = opts.decodeCipher ?? ((c: string) => c);
  const creds = toCredentials(integration, decode);
  const webhook: InboundWebhook = {
    rawBody,
    parsedBody,
    headers: normaliseHeaders(req.headers),
  };

  const sig = adapter.verifySignature(webhook, creds.webhookSecret ?? '');
  const idempotencyKey = deriveIdempotencyKey({
    platform,
    rawBody,
    headers: webhook.headers,
  });
  const eventType = readString(parsedBody, 'action', 'eventType', 'event');

  const log = await recordWebhook(opts.pool, {
    integrationId: integration.id,
    atsPlatform: platform,
    idempotencyKey,
    eventType: eventType ?? 'unknown',
    signatureValid: sig.valid,
    payload: parsedBody,
  });
  if (!log.inserted) {
    res.status(200).json({ status: 'duplicate', idempotency_key: idempotencyKey });
    return;
  }
  if (!sig.valid) {
    if (log.logId)
      await markWebhookProcessed(opts.pool, log.logId, 401, sig.reason ?? 'invalid signature');
    sendProblem(res, 401, sig.reason ?? 'Invalid webhook signature');
    return;
  }

  const event = adapter.receiveWebhook(webhook);
  if (event.kind === 'error') {
    if (log.logId) await markWebhookProcessed(opts.pool, log.logId, 422, event.reason);
    sendProblem(res, 422, event.reason);
    return;
  }
  if (log.logId) await markWebhookProcessed(opts.pool, log.logId, 202, null);
  res.status(202).json({
    status: 'accepted',
    idempotency_key: idempotencyKey,
    event_kind: event.kind,
  });
}

function normaliseHeaders(
  headers: Request['headers'],
): Record<string, string | string[] | undefined> {
  const out: Record<string, string | string[] | undefined> = {};
  for (const [k, v] of Object.entries(headers)) {
    out[k.toLowerCase()] = v;
  }
  return out;
}

function readString(body: unknown, ...keys: string[]): string | undefined {
  if (typeof body !== 'object' || body === null) return undefined;
  const obj = body as Record<string, unknown>;
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === 'string' && v.length > 0) return v;
  }
  return undefined;
}

function sendProblem(res: Response, status: number, title: string): void {
  res.status(status).contentType('application/problem+json').json({
    type: 'about:blank',
    title,
    status,
  });
}
