import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { Pool } from '@qorium/db';
import { InvalidApiKeyFormatError, lookupApiKey, parseApiKey, touchLastUsed } from './api-key.js';
import type { ApiKeyRow } from './api-key.js';
import { recordAuditEvent } from './audit.js';
import type { RateLimiterAbstract, RateLimiterRes } from './rate-limit.js';
import type { AuthenticatedRequest, AuthContext } from './types.js';

const PROBLEM_TYPE_BASE = 'https://qorium.online/problems/';
const BEARER_PREFIX = 'bearer ';
const ALIAS_HEADER = 'x-talpro-api-key';

export interface ApiKeyAuthOptions {
  pool: Pool;
  /** HMAC pepper read from env (`API_KEY_PEPPER`) at boot. ≥32 chars. */
  pepper: string;
  /** Rate limiter (Redis-backed in prod, in-memory in tests). Optional — skips rate limit if omitted. */
  rateLimiter?: RateLimiterAbstract;
  /** Optional: when true (default), records audit events. Disable for tests. */
  audit?: boolean;
  /** Optional: required scopes; request rejected with 403 if not all granted. */
  requiredScopes?: readonly string[];
}

function clientIp(req: Request): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim();
  }
  return req.ip;
}

function extractRawKey(req: Request): string | null {
  const auth = req.headers.authorization;
  if (typeof auth === 'string' && auth.toLowerCase().startsWith(BEARER_PREFIX)) {
    const candidate = auth.slice(BEARER_PREFIX.length).trim();
    if (candidate.length > 0) return candidate;
  }
  const alias = req.headers[ALIAS_HEADER];
  if (typeof alias === 'string' && alias.length > 0) return alias.trim();
  return null;
}

function setRateLimitHeaders(
  res: Response,
  limiter: RateLimiterAbstract,
  info: RateLimiterRes,
): void {
  res.setHeader('RateLimit-Limit', String(limiter.points));
  res.setHeader('RateLimit-Remaining', String(Math.max(0, info.remainingPoints)));
  res.setHeader('RateLimit-Reset', String(Math.ceil(info.msBeforeNext / 1000)));
}

function problem(
  res: Response,
  status: number,
  title: string,
  detail: string,
  req: Request,
  extra?: Record<string, unknown>,
): void {
  res
    .status(status)
    .type('application/problem+json')
    .json({
      type: `${PROBLEM_TYPE_BASE}${title.toLowerCase().replace(/\s+/g, '-')}`,
      title,
      status,
      detail,
      instance: req.originalUrl,
      ...extra,
    });
}

/**
 * Express middleware factory.
 *
 *   app.use('/v1', apiKeyAuth({ pool, pepper, rateLimiter }));
 *
 * On success: attaches `req.auth = AuthContext` and calls `next()`.
 * Failure paths return RFC 7807 `application/problem+json` per architecture §6:
 *   401 Unauthorized — missing or unparseable key
 *   401 Invalid Credentials — key not found / hash mismatch
 *   403 Forbidden — revoked, expired, or missing required scope
 *   429 Too Many Requests — rate limit exceeded; includes Retry-After
 *
 * Audit log events are recorded fire-and-forget for both success and failure
 * paths so the audit table reflects every authenticated attempt.
 */
export function apiKeyAuth(options: ApiKeyAuthOptions): RequestHandler {
  const auditEnabled = options.audit ?? true;
  const requiredScopes = options.requiredScopes ?? [];

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = clientIp(req);
    const ua = (req.headers['user-agent'] as string | undefined) ?? undefined;

    const recordEvent = (
      eventType: string,
      apiKeyId: string | null,
      payload: Record<string, unknown>,
    ): void => {
      if (!auditEnabled) return;
      void recordAuditEvent({
        pool: options.pool,
        event: {
          actor_type: 'api_key',
          actor_id: apiKeyId,
          event_type: eventType,
          entity_type: 'api_key',
          entity_id: apiKeyId ?? undefined,
          payload,
          ip_address: ip,
          user_agent: ua,
        },
      });
    };

    const raw = extractRawKey(req);
    if (raw === null) {
      recordEvent('api_key.auth.missing', null, {
        endpoint: `${req.method} ${req.originalUrl}`,
      });
      problem(res, 401, 'Unauthorized', 'API key required', req);
      return;
    }

    let parsed;
    try {
      parsed = parseApiKey(raw);
    } catch (err) {
      const reason = err instanceof InvalidApiKeyFormatError ? err.message : 'invalid format';
      recordEvent('api_key.auth.invalid_format', null, {
        endpoint: `${req.method} ${req.originalUrl}`,
        reason,
      });
      problem(res, 401, 'Unauthorized', 'API key format invalid', req);
      return;
    }

    let row: ApiKeyRow | null;
    try {
      row = await lookupApiKey(options.pool, raw, options.pepper);
    } catch (err) {
      next(err);
      return;
    }
    if (row === null) {
      recordEvent('api_key.auth.unknown', null, {
        endpoint: `${req.method} ${req.originalUrl}`,
        prefix: parsed.prefix,
      });
      problem(res, 401, 'Invalid Credentials', 'API key not recognised', req);
      return;
    }

    if (requiredScopes.length > 0) {
      const have = new Set(row.scopes);
      const missing = requiredScopes.filter((s) => !have.has(s));
      if (missing.length > 0) {
        recordEvent('api_key.auth.scope_denied', row.id, {
          endpoint: `${req.method} ${req.originalUrl}`,
          required: requiredScopes,
          missing,
        });
        problem(res, 403, 'Forbidden', 'Missing required scope', req, { missing_scopes: missing });
        return;
      }
    }

    if (options.rateLimiter) {
      try {
        const info = await options.rateLimiter.consume(row.id, 1);
        setRateLimitHeaders(res, options.rateLimiter, info);
      } catch (rateErr) {
        const info = rateErr as RateLimiterRes;
        if (info && typeof info.msBeforeNext === 'number') {
          setRateLimitHeaders(res, options.rateLimiter, info);
          res.setHeader('Retry-After', String(Math.ceil(info.msBeforeNext / 1000)));
          recordEvent('api_key.auth.rate_limited', row.id, {
            endpoint: `${req.method} ${req.originalUrl}`,
            retry_after_ms: info.msBeforeNext,
          });
          problem(res, 429, 'Too Many Requests', 'Rate limit exceeded', req, {
            retry_after_seconds: Math.ceil(info.msBeforeNext / 1000),
          });
          return;
        }
        next(rateErr);
        return;
      }
    }

    void touchLastUsed(options.pool, row.id);

    const authContext: AuthContext = {
      apiKeyId: row.id,
      tenantId: row.tenant_id,
      prefix: row.prefix,
      scopes: row.scopes,
      name: row.name,
    };
    (req as AuthenticatedRequest).auth = authContext;

    recordEvent('api_key.auth.success', row.id, {
      endpoint: `${req.method} ${req.originalUrl}`,
    });

    next();
  };
}
