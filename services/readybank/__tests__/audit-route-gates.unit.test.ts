import { describe, expect, it } from 'vitest';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import type { Pool } from '@qorium/db';
import { auditRouter } from '../src/routes/audit.js';
import {
  JWT_AUDIENCE,
  JWT_ISSUER,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from '../src/middleware/recruiter-auth.js';
import { problemHandler } from '../src/middleware/problem.js';
import type { Config } from '../src/config.js';

/**
 * N17 test-storm -- route-level coverage for the Audit Log API
 * /v1/audit/* endpoints' DB-free gates. Every branch asserted here rejects a
 * request BEFORE any repository call, so Postgres is never touched:
 *
 *   GET  /v1/audit/events                  -> 401 (no session cookie)
 *   GET  /v1/audit/events/:id              -> 401 (no session cookie)
 *   GET  /v1/audit/summary (forged JWT)    -> 401 (invalid session)
 *   POST /v1/audit/events/export           -> 401 (no session cookie)
 *   GET  /v1/audit/events (authed)         -> 400 (Zod query: limit > 200)
 *   GET  /v1/audit/events (authed)         -> 400 (start_date > end_date refine)
 *   GET  /v1/audit/events/:id (authed)     -> 400 (non-UUID id, before query)
 *   GET  /v1/audit/summary (authed)        -> 400 (Zod query: top_n > 50)
 *   GET  /v1/audit/verify (authed)         -> 400 (Zod query: bad date format)
 *   POST /v1/audit/events/export (authed)  -> 400 (Zod body: bad format enum)
 *   GET  /v1/audit/exports/:id (authed)    -> 400 (non-UUID id, before query)
 *   GET  /v1/audit/exports/:id/download    -> 400 (non-UUID id, before query)
 *
 * The audit router is gated by the same cookie-based recruiterAuth() session
 * (qor_session JWT) used by the recruiter portal and recruiter-billing routes,
 * so this suite mints a real HS256 session token to reach the validation gates
 * while the DB stays untouched. A throwing stub Pool proves every gate above
 * short-circuits before Postgres. auditRouter surfaces problems via
 * next(HttpProblem), so problemHandler() is mounted, and a tiny inline
 * Cookie-header parser mirrors the production parseCookieHeader so req.cookies
 * is populated exactly as the live server does. First route-integration
 * coverage of src/routes/audit.ts (previously only the audit-events /
 * audit-exports repositories were exercised), mirroring the recruiter /
 * billing-recruiter / assessments route-gate pattern (PRs #200/#202/#206).
 */

const TEST_JWT_SECRET = 'route-gate-test-secret-audit';

// A pool that fails loudly if any handler reaches the DB on these gate paths.
const throwingPool = {
  query: async () => {
    throw new Error('DB must not be queried on the /v1/audit auth/validation gates');
  },
} as unknown as Pool;

// Minimal config slice the audit router actually reads.
const config = {
  jwtSecret: TEST_JWT_SECRET,
  cookieSecure: false,
} as unknown as Config;

const VALID_UUID = '00000000-0000-4000-8000-0000000000d1';

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
  app.use(auditRouter({ pool: throwingPool, config }));
  app.use(problemHandler());
  return app;
}

// Mint a valid recruiter session JWT matching issueSessionCookie's claim shape.
function validSessionToken(): string {
  return jwt.sign(
    {
      tenant_id: '00000000-0000-4000-8000-0000000000b1',
      email: 'rec@example.com',
      name: 'Test Recruiter',
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

describe('audit log API -- session gate (no DB)', () => {
  const app = buildApp();

  it('GET /v1/audit/events without cookie -> 401 application/problem+json', async () => {
    const res = await request(app).get('/v1/audit/events');
    expect(res.status).toBe(401);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(401);
  });

  it('GET /v1/audit/events/:id without cookie -> 401 (no DB)', async () => {
    const res = await request(app).get(`/v1/audit/events/${VALID_UUID}`);
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
  });

  it('GET /v1/audit/summary with a forged JWT -> 401 invalid session (no DB)', async () => {
    const forged = jwt.sign({ tenant_id: 'x', role: 'recruiter' }, 'wrong-secret', {
      algorithm: 'HS256',
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      subject: 'x',
    });
    const res = await request(app)
      .get('/v1/audit/summary')
      .set('Cookie', `${SESSION_COOKIE_NAME}=${forged}`);
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
  });

  it('POST /v1/audit/events/export without cookie -> 401 (no DB)', async () => {
    const res = await request(app).post('/v1/audit/events/export').send({ format: 'csv' });
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
  });
});

describe('GET /v1/audit/events -- query validation gate (authed, no DB)', () => {
  const app = buildApp();

  it('limit above max (201) -> 400 before any query', async () => {
    const res = await request(app).get('/v1/audit/events?limit=201').set('Cookie', authCookie());
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });

  it('start_date after end_date -> 400 refine (no DB)', async () => {
    const res = await request(app)
      .get('/v1/audit/events?start_date=2026-02-01&end_date=2026-01-01')
      .set('Cookie', authCookie());
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });
});

describe('GET /v1/audit/events/:id -- UUID gate (authed, no DB)', () => {
  const app = buildApp();

  it('non-UUID id -> 400 before any query', async () => {
    const res = await request(app).get('/v1/audit/events/not-a-uuid').set('Cookie', authCookie());
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });
});

describe('GET /v1/audit/summary -- query validation gate (authed, no DB)', () => {
  const app = buildApp();

  it('top_n above max (51) -> 400 before any query', async () => {
    const res = await request(app).get('/v1/audit/summary?top_n=51').set('Cookie', authCookie());
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });
});

describe('GET /v1/audit/verify -- query validation gate (authed, no DB)', () => {
  const app = buildApp();

  it('malformed start_date -> 400 before any query', async () => {
    const res = await request(app)
      .get('/v1/audit/verify?start_date=not-a-date')
      .set('Cookie', authCookie());
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });
});

describe('POST /v1/audit/events/export -- body validation gate (authed, no DB)', () => {
  const app = buildApp();

  it('bad format enum -> 400 before any query', async () => {
    const res = await request(app)
      .post('/v1/audit/events/export')
      .set('Cookie', authCookie())
      .send({ format: 'pdf' });
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });
});

describe('audit export job endpoints -- UUID gate (authed, no DB)', () => {
  const app = buildApp();

  it('GET /v1/audit/exports/:id non-UUID -> 400 before any query', async () => {
    const res = await request(app).get('/v1/audit/exports/not-a-uuid').set('Cookie', authCookie());
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('GET /v1/audit/exports/:id/download non-UUID -> 400 before any query', async () => {
    const res = await request(app)
      .get('/v1/audit/exports/not-a-uuid/download')
      .set('Cookie', authCookie());
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });
});
