import { describe, expect, it } from 'vitest';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import type { Pool } from '@qorium/db';
import { recruiterPortalRouter } from '../src/routes/recruiter.js';
import {
  JWT_AUDIENCE,
  JWT_ISSUER,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from '../src/middleware/recruiter-auth.js';
import { problemHandler } from '../src/middleware/problem.js';
import type { Config } from '../src/config.js';

/**
 * N17 test-storm -- route-level coverage for the recruiter-portal
 * /recruiter/* endpoints' DB-free gates. Every branch asserted here rejects a
 * request BEFORE any repository call, so Postgres is never touched:
 *
 *   GET  /recruiter/assessments                -> 401 (no session cookie)
 *   POST /recruiter/assessments                -> 401 (no session cookie)
 *   GET  /recruiter/assessments (forged JWT)   -> 401 (invalid session)
 *   POST /recruiter/assessments (authed)       -> 400 (Zod body, before query)
 *   POST /recruiter/assessments/:id/invite     -> 400 (non-UUID id, before query)
 *   POST /recruiter/assessments/:id/invite     -> 400 (authed + UUID + bad email)
 *   GET  /recruiter/assessments/:id/attempts   -> 400 (non-UUID id, before query)
 *   GET  /recruiter/attempts/:id/review        -> 400 (non-UUID id, before query)
 *
 * Unlike the apiKeyAuth routes (/v1/assessments etc.), the recruiter portal is
 * gated by the cookie-based recruiterAuth() session (qor_session JWT), so this
 * suite mints a real HS256 session token to reach the validation gates while
 * the DB stays untouched. A throwing stub Pool proves every gate above
 * short-circuits before Postgres. recruiterPortalRouter surfaces problems via
 * next(HttpProblem), so problemHandler() is mounted, and a tiny inline
 * Cookie-header parser mirrors the production parseCookieHeader so req.cookies
 * is populated exactly as the live server does. First route-integration
 * coverage of src/routes/recruiter.ts (previously only the recruiter
 * repository was exercised), mirroring the assessments / a4 / proof route-gate
 * pattern (PRs #198/#201/#202).
 */

const TEST_JWT_SECRET = 'route-gate-test-secret-recruiter';

// A pool that fails loudly if any handler reaches the DB on these gate paths.
const throwingPool = {
  query: async () => {
    throw new Error('DB must not be queried on the /recruiter auth/validation gates');
  },
} as unknown as Pool;

// Minimal config slice the recruiter router actually reads.
const config = {
  jwtSecret: TEST_JWT_SECRET,
  cookieSecure: false,
  proofSecret: 'proof-test-secret',
  a4TokenSecret: 'a4-test-secret',
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
  app.use(recruiterPortalRouter({ pool: throwingPool, config }));
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

describe('recruiter portal -- session gate (no DB)', () => {
  const app = buildApp();

  it('GET /recruiter/assessments without cookie -> 401 application/problem+json', async () => {
    const res = await request(app).get('/recruiter/assessments');
    expect(res.status).toBe(401);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(401);
  });

  it('POST /recruiter/assessments without cookie -> 401 (no DB)', async () => {
    const res = await request(app)
      .post('/recruiter/assessments')
      .send({ title: 'T', skill_id: VALID_UUID, question_count: 5 });
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
  });

  it('GET /recruiter/skills with a forged JWT -> 401 invalid session (no DB)', async () => {
    const forged = jwt.sign({ tenant_id: 'x', role: 'recruiter' }, 'wrong-secret', {
      algorithm: 'HS256',
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      subject: 'x',
    });
    const res = await request(app)
      .get('/recruiter/skills')
      .set('Cookie', `${SESSION_COOKIE_NAME}=${forged}`);
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
  });
});

describe('POST /recruiter/assessments -- body validation gate (authed, no DB)', () => {
  const app = buildApp();

  it('empty title -> 400 before any query', async () => {
    const res = await request(app)
      .post('/recruiter/assessments')
      .set('Cookie', authCookie())
      .send({ title: '', skill_id: VALID_UUID, question_count: 5 });
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });

  it('non-UUID skill_id -> 400 (Zod, no DB)', async () => {
    const res = await request(app)
      .post('/recruiter/assessments')
      .set('Cookie', authCookie())
      .send({ title: 'Good', skill_id: 'not-a-uuid', question_count: 5 });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('question_count out of range (0) -> 400 (Zod, no DB)', async () => {
    const res = await request(app)
      .post('/recruiter/assessments')
      .set('Cookie', authCookie())
      .send({ title: 'Good', skill_id: VALID_UUID, question_count: 0 });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });
});

describe('POST /recruiter/assessments/:id/invite -- UUID + body gates (authed, no DB)', () => {
  const app = buildApp();

  it('non-UUID assessment id -> 400 before any query', async () => {
    const res = await request(app)
      .post('/recruiter/assessments/not-a-uuid/invite')
      .set('Cookie', authCookie())
      .send({ candidate_email: 'c@example.com' });
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });

  it('valid UUID + malformed body (bad email) -> 400 before any query', async () => {
    const res = await request(app)
      .post(`/recruiter/assessments/${VALID_UUID}/invite`)
      .set('Cookie', authCookie())
      .send({ candidate_email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });
});

describe('recruiter read endpoints -- UUID gate (authed, no DB)', () => {
  const app = buildApp();

  it('GET /recruiter/assessments/:id/attempts non-UUID -> 400 before any query', async () => {
    const res = await request(app)
      .get('/recruiter/assessments/not-a-uuid/attempts')
      .set('Cookie', authCookie());
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('GET /recruiter/attempts/:id/review non-UUID -> 400 before any query', async () => {
    const res = await request(app)
      .get('/recruiter/attempts/not-a-uuid/review')
      .set('Cookie', authCookie());
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });
});
