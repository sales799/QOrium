import { describe, expect, it, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { apiKeyAuth } from '../src/middleware.js';
import { hashApiKey } from '../src/api-key.js';
import { createMemoryRateLimiter } from '../src/rate-limit.js';
import type { AuthenticatedRequest } from '../src/types.js';

const PEPPER = 'test_pepper_must_be_at_least_thirty_two_chars_long_yo';
const VALID_KEY = 'qor_live_a7f3b2c1e8d4f9a6b2c5e1d8a9f3b2c1';
const VALID_KEY_HASH = hashApiKey(VALID_KEY, PEPPER);

const FIXED_API_KEY_ID = '11111111-1111-1111-1111-111111111111';
const FIXED_TENANT_ID = '22222222-2222-2222-2222-222222222222';

interface MockPoolOptions {
  /** Override the row returned by the lookup. `null` means "no match". */
  row?: {
    id: string;
    tenant_id: string;
    name: string | null;
    prefix: string;
    scopes: string[];
    expires_at: Date | null;
    revoked_at: Date | null;
    last_used_at: Date | null;
  } | null;
}

/**
 * Minimal pool stub. Only implements `query` for the two SQL paths the
 * middleware exercises (SELECT from app.api_keys, UPDATE last_used_at,
 * INSERT into audit.events).
 */
function makeMockPool(opts: MockPoolOptions = {}) {
  const defaultRow = {
    id: FIXED_API_KEY_ID,
    tenant_id: FIXED_TENANT_ID,
    name: 'test key',
    prefix: 'qor_live',
    scopes: ['read', 'write'],
    expires_at: null,
    revoked_at: null,
    last_used_at: null,
  };
  const row = opts.row === undefined ? defaultRow : opts.row;

  const auditInserts: Array<{ event_type: string; values: unknown[] }> = [];

  const pool = {
    async query(sql: string, values?: unknown[]) {
      if (sql.trim().startsWith('SELECT id, tenant_id')) {
        const hashed = (values ?? [])[0];
        if (row !== null && hashed === VALID_KEY_HASH) {
          return { rows: [row], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      }
      if (sql.trim().startsWith('UPDATE app.api_keys SET last_used_at')) {
        return { rows: [], rowCount: 1 };
      }
      if (sql.includes('audit.events')) {
        const event_type = String((values ?? [])[3] ?? 'unknown');
        auditInserts.push({ event_type, values: values ?? [] });
        return { rows: [], rowCount: 1 };
      }
      throw new Error(`Unhandled SQL: ${sql}`);
    },
  };

  return { pool: pool as unknown as Parameters<typeof apiKeyAuth>[0]['pool'], auditInserts };
}

function makeApp(opts: {
  pool: Parameters<typeof apiKeyAuth>[0]['pool'];
  rateLimiter?: Parameters<typeof apiKeyAuth>[0]['rateLimiter'];
  requiredScopes?: string[];
}) {
  const app = express();
  app.use(
    apiKeyAuth({
      pool: opts.pool,
      pepper: PEPPER,
      ...(opts.rateLimiter !== undefined ? { rateLimiter: opts.rateLimiter } : {}),
      ...(opts.requiredScopes !== undefined ? { requiredScopes: opts.requiredScopes } : {}),
    }),
  );
  app.get('/protected', (req, res) => {
    const auth = (req as AuthenticatedRequest).auth;
    res.json({ ok: true, auth });
  });
  return app;
}

describe('apiKeyAuth middleware', () => {
  describe('happy path', () => {
    it('attaches AuthContext on valid Authorization: Bearer', async () => {
      const { pool } = makeMockPool();
      const app = makeApp({ pool });

      const res = await request(app).get('/protected').set('authorization', `Bearer ${VALID_KEY}`);

      expect(res.status).toBe(200);
      expect(res.body.auth).toMatchObject({
        apiKeyId: FIXED_API_KEY_ID,
        tenantId: FIXED_TENANT_ID,
        prefix: 'qor_live',
        scopes: ['read', 'write'],
      });
    });

    it('accepts the X-Talpro-API-Key alias header', async () => {
      const { pool } = makeMockPool();
      const app = makeApp({ pool });
      const res = await request(app).get('/protected').set('x-talpro-api-key', VALID_KEY);
      expect(res.status).toBe(200);
    });

    it('records api_key.auth.success in audit log', async () => {
      const { pool, auditInserts } = makeMockPool();
      const app = makeApp({ pool });
      await request(app).get('/protected').set('authorization', `Bearer ${VALID_KEY}`);
      expect(auditInserts.find((e) => e.event_type === 'api_key.auth.success')).toBeDefined();
    });
  });

  describe('failure modes', () => {
    it('returns 401 when no header is supplied', async () => {
      const { pool } = makeMockPool();
      const app = makeApp({ pool });
      const res = await request(app).get('/protected');
      expect(res.status).toBe(401);
      expect(res.headers['content-type']).toContain('application/problem+json');
      expect(res.body).toMatchObject({ status: 401, title: 'Unauthorized' });
    });

    it('returns 401 on malformed key', async () => {
      const { pool } = makeMockPool();
      const app = makeApp({ pool });
      const res = await request(app)
        .get('/protected')
        .set('authorization', 'Bearer not_a_real_key');
      expect(res.status).toBe(401);
    });

    it('returns 401 on unknown key', async () => {
      const { pool } = makeMockPool({ row: null });
      const app = makeApp({ pool });
      const res = await request(app)
        .get('/protected')
        .set('authorization', `Bearer qor_live_b7f3b2c1e8d4f9a6b2c5e1d8a9f3b2c1`);
      expect(res.status).toBe(401);
      expect(res.body.title).toBe('Invalid Credentials');
    });

    it('returns 403 when key lacks required scope', async () => {
      const { pool } = makeMockPool();
      const app = makeApp({ pool, requiredScopes: ['admin'] });
      const res = await request(app).get('/protected').set('authorization', `Bearer ${VALID_KEY}`);
      expect(res.status).toBe(403);
      expect(res.body.missing_scopes).toEqual(['admin']);
    });
  });

  describe('rate limiting', () => {
    let pool: ReturnType<typeof makeMockPool>['pool'];

    beforeEach(() => {
      pool = makeMockPool().pool;
    });

    it('allows up to `points` requests then 429s with Retry-After', async () => {
      const limiter = createMemoryRateLimiter({ points: 2, duration: 60 });
      const app = makeApp({ pool, rateLimiter: limiter });

      const r1 = await request(app).get('/protected').set('authorization', `Bearer ${VALID_KEY}`);
      const r2 = await request(app).get('/protected').set('authorization', `Bearer ${VALID_KEY}`);
      const r3 = await request(app).get('/protected').set('authorization', `Bearer ${VALID_KEY}`);

      expect(r1.status).toBe(200);
      expect(r2.status).toBe(200);
      expect(r3.status).toBe(429);
      expect(r3.headers['retry-after']).toBeDefined();
      expect(r3.body).toMatchObject({ status: 429, title: 'Too Many Requests' });
    });

    it('emits RateLimit-* headers on success', async () => {
      const limiter = createMemoryRateLimiter({ points: 5, duration: 60 });
      const app = makeApp({ pool, rateLimiter: limiter });
      const res = await request(app).get('/protected').set('authorization', `Bearer ${VALID_KEY}`);
      expect(res.headers['ratelimit-limit']).toBe('5');
      expect(res.headers['ratelimit-remaining']).toBe('4');
      expect(res.headers['ratelimit-reset']).toBeDefined();
    });
  });
});
