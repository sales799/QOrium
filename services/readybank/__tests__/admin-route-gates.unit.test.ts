import { describe, expect, it } from 'vitest';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import type { Pool } from '@qorium/db';
import { adminRouter } from '../src/routes/admin.js';
import {
  JWT_AUDIENCE,
  JWT_ISSUER,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from '../src/middleware/recruiter-auth.js';
import { problemHandler } from '../src/middleware/problem.js';
import type { Config } from '../src/config.js';

/**
 * N17 test-storm -- route-level coverage for the admin-console /v1/admin/*
 * endpoints' DB-free gates. Authenticated branches allow the single internal
 * tenant lookup required by the admin session guard, then reject the request
 * BEFORE any repository query:
 *
 *   GET  /v1/admin/leak-alerts                  -> 401 (no session cookie)
 *   POST /v1/admin/leak-alerts/:id/review       -> 401 (no session cookie)
 *   GET  /v1/admin/overview                     -> 401 (no session cookie)
 *   GET  /v1/admin/leak-alerts (forged JWT)     -> 401 (invalid session)
 *   GET  /v1/admin/leak-alerts (authed, bad status) -> 400 (Zod query)
 *   GET  /v1/admin/leak-alerts (authed, limit>200)  -> 400 (Zod query)
 *   GET  /v1/admin/tenants (authed, bad status)     -> 400 (Zod query)
 *   GET  /v1/admin/attempts (authed, limit=0)       -> 400 (Zod query)
 *   GET  /v1/admin/audit-events (authed, limit>200) -> 400 (Zod query)
 *   POST /v1/admin/leak-alerts/:id/review (authed, non-UUID id) -> 400
 *   POST /v1/admin/leak-alerts/:id/review (authed, bad decision) -> 400 (Zod body)
 *   POST /v1/admin/panel-tokens (authed, bad hex) -> 400 (Zod body)
 *
 * The admin router reuses the same cookie-based recruiterAuth() session gate
 * as the recruiter portal (admin == recruiter; RBAC sub-roles deferred), so
 * this suite mints a real HS256 qor_session token to reach the validation
 * gates while the route-data DB stays untouched. A guarded stub Pool proves
 * every gate above short-circuits before handler queries. adminRouter surfaces problems via
 * next(HttpProblem) / thrown HttpProblem, so problemHandler() is mounted, and
 * a tiny inline Cookie-header parser mirrors the production parseCookieHeader
 * so req.cookies is populated exactly as the live server does. First
 * route-integration coverage of src/routes/admin.ts (previously only the
 * admin happy paths via a stub-data pool in admin.test.ts), mirroring the
 * recruiter / assessments / a4 / audit route-gate pattern
 * (PRs #200/#202/#206/#207).
 */

const TEST_JWT_SECRET = 'route-gate-test-secret-admin';

const ADMIN_TENANT_ID = '00000000-0000-4000-8000-0000000000b1';

function isAdminTenantLookup(sql: unknown): boolean {
  return (
    typeof sql === 'string' &&
    sql.includes('FROM app.tenants') &&
    sql.includes('WHERE id = $1') &&
    sql.includes('LIMIT 1')
  );
}

// A pool that only permits the admin auth tenant lookup. If any handler reaches
// a route-data query on these validation paths, the test fails loudly.
const guardedPool = {
  query: async (sql: unknown, params?: unknown[]) => {
    if (isAdminTenantLookup(sql) && params?.[0] === ADMIN_TENANT_ID) {
      return { rows: [{ type: 'internal', status: 'active' }] };
    }
    throw new Error('Route data DB must not be queried on the /v1/admin validation gates');
  },
} as unknown as Pool;

// Minimal config slice the admin router actually reads (jwtSecret + cookieSecure
// for recruiterAuth; apiKeyPepper present so the panel-tokens 503 pepper guard
// is not the branch under test -- we assert the Zod body gate fires first).
const config = {
  jwtSecret: TEST_JWT_SECRET,
  cookieSecure: false,
  apiKeyPepper: 'test_admin_pepper_at_least_thirty_two_chars_long_xxxx',
} as unknown as Config;

const VALID_UUID = '00000000-0000-4000-8000-0000000000c1';

// Mirror of the production parseCookieHeader (src/server.ts) so the test app
// populates req.cookies identically to the live server.
function cookieParser(): express.RequestHandler {
  return (req, _res, next) => {
    const header = req.headers.cookie;
    const cookies: Record<string, string> = {};
    if (header) {
      for (const part of header.split(';')) {
        const sep = part.indexOf('=');
        if (sep === -1) continue;
        const name = part.slice(0, sep).trim();
        if (!name) continue;
        const raw = part.slice(sep + 1).trim();
        try {
          cookies[name] = decodeURIComponent(raw);
        } catch {
          cookies[name] = raw;
        }
      }
    }
    (req as express.Request & { cookies?: Record<string, string> }).cookies = cookies;
    next();
  };
}

function buildApp(): express.Express {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(adminRouter({ pool: guardedPool, config }));
  app.use(problemHandler());
  return app;
}

// Mint a valid recruiter session JWT matching issueSessionCookie's claim shape.
function validSessionToken(): string {
  return jwt.sign(
    {
      tenant_id: ADMIN_TENANT_ID,
      email: 'admin@example.com',
      name: 'Test Admin',
      role: 'recruiter',
    },
    TEST_JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: SESSION_TTL_SECONDS,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      subject: '00000000-0000-4000-8000-0000000000a1',
    },
  );
}

function authCookie(): string {
  return `${SESSION_COOKIE_NAME}=${validSessionToken()}`;
}

describe('admin console -- session gate (no DB)', () => {
  const app = buildApp();

  it('GET /v1/admin/leak-alerts without cookie -> 401 application/problem+json', async () => {
    const res = await request(app).get('/v1/admin/leak-alerts');
    expect(res.status).toBe(401);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(401);
  });

  it('POST /v1/admin/leak-alerts/:id/review without cookie -> 401 (no DB)', async () => {
    const res = await request(app)
      .post(`/v1/admin/leak-alerts/${VALID_UUID}/review`)
      .send({ decision: 'dismissed' });
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
  });

  it('GET /v1/admin/overview without cookie -> 401 (no DB)', async () => {
    const res = await request(app).get('/v1/admin/overview');
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
  });

  it('GET /v1/admin/leak-alerts with a forged JWT -> 401 invalid session (no DB)', async () => {
    const forged = jwt.sign({ tenant_id: 'x', role: 'recruiter' }, 'wrong-secret', {
      algorithm: 'HS256',
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      subject: 'x',
    });
    const res = await request(app)
      .get('/v1/admin/leak-alerts')
      .set('Cookie', `${SESSION_COOKIE_NAME}=${forged}`);
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
  });
});

describe('admin read endpoints -- query validation gate (authed, no DB)', () => {
  const app = buildApp();

  it('GET /v1/admin/leak-alerts invalid status enum -> 400 before any query', async () => {
    const res = await request(app)
      .get('/v1/admin/leak-alerts?status=not-a-status')
      .set('Cookie', authCookie());
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });

  it('GET /v1/admin/leak-alerts limit over max (201) -> 400 (Zod, no DB)', async () => {
    const res = await request(app)
      .get('/v1/admin/leak-alerts?limit=201')
      .set('Cookie', authCookie());
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('GET /v1/admin/tenants invalid status enum -> 400 (Zod, no DB)', async () => {
    const res = await request(app)
      .get('/v1/admin/tenants?status=bogus')
      .set('Cookie', authCookie());
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('GET /v1/admin/attempts limit=0 (below min) -> 400 (Zod, no DB)', async () => {
    const res = await request(app).get('/v1/admin/attempts?limit=0').set('Cookie', authCookie());
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('GET /v1/admin/audit-events limit over max (500) -> 400 (Zod, no DB)', async () => {
    const res = await request(app)
      .get('/v1/admin/audit-events?limit=500')
      .set('Cookie', authCookie());
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });
});

describe('POST /v1/admin/leak-alerts/:id/review -- id + body gates (authed, no DB)', () => {
  const app = buildApp();

  it('non-UUID id -> 400 before any query', async () => {
    const res = await request(app)
      .post('/v1/admin/leak-alerts/not-a-uuid/review')
      .set('Cookie', authCookie())
      .send({ decision: 'dismissed' });
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });

  it('valid UUID + invalid decision enum -> 400 (Zod body, before query)', async () => {
    const res = await request(app)
      .post(`/v1/admin/leak-alerts/${VALID_UUID}/review`)
      .set('Cookie', authCookie())
      .send({ decision: 'not-a-decision' });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });
});

describe('POST /v1/admin/panel-tokens -- body validation gate (authed, no DB)', () => {
  const app = buildApp();

  it('malformed panelist_id_hash_hex -> 400 before any query', async () => {
    const res = await request(app)
      .post('/v1/admin/panel-tokens')
      .set('Cookie', authCookie())
      .send({ panelist_id_hash_hex: 'not-hex!!' });
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });
});
