import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import express, { type Request, type RequestHandler } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import type { Pool } from '@qorium/db';
import { billingRecruiterRouter } from '../src/routes/billing.js';
import { problemHandler } from '../src/middleware/problem.js';
import { SESSION_COOKIE_NAME, JWT_ISSUER, JWT_AUDIENCE } from '../src/middleware/recruiter-auth.js';

/**
 * N17 test-storm — route-level coverage for the RECRUITER-authed billing
 * endpoints' DB-free auth gate. routes/billing.ts mounts recruiterAuth() ahead
 * of every /recruiter/billing/* handler, so an unauthenticated (or
 * invalid-token) request MUST be rejected with RFC 7807 401 BEFORE any
 * repository call — i.e. before Postgres is ever touched.
 *
 * Three reject paths are exercised across all three handlers
 * (GET status, POST subscribe, POST cancel):
 *   1. Missing qor_session cookie            -> 401 missing-session.
 *   2. Garbage / non-JWT cookie value        -> 401 invalid-session.
 *   3. JWT signed with the WRONG secret       -> 401 invalid-session.
 *      (also covers wrong issuer / wrong audience — same verify() failure)
 *
 * A complementary positive control proves the gate is not over-rejecting: a
 * correctly-signed session token PASSES recruiterAuth, so the handler proceeds
 * to the repository and the throwing stub Pool fires (surfaced as 500) — i.e.
 * the request got *past* the 401 gate and reached the DB layer.
 *
 * The stub Pool THROWS if queried, proving the 401 gate paths never reach the
 * DB. Handlers surface problems via next(HttpProblem), so problemHandler() is
 * mounted. recruiterAuth reads req.cookies, which production populates with a
 * tiny header parser ahead of the router; this test mounts the equivalent
 * inline so the wiring matches production exactly.
 *
 * Lib-level recruiter-auth/JWT correctness is covered by auth.test.ts; this
 * file is strictly about the billing route wiring + reject-before-DB contract,
 * mirroring billing-webhook-route-gates.unit.test.ts for the public webhooks.
 */

const JWT_SECRET = 'test_jwt_secret_at_least_thirty_two_characters_long_xx';
const SAVED = { ...process.env };

// A pool that fails loudly if any handler reaches the DB on a gate path.
const throwingPool = {
  query: async () => {
    throw new Error('DB must not be queried before the recruiter auth gate passes');
  },
} as unknown as Pool;

// Mirror of the production cookie parser (server.ts parseCookieHeader) so the
// recruiterAuth middleware sees req.cookies exactly as it does in prod.
function parseCookies(): RequestHandler {
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
    (req as Request & { cookies?: Record<string, string> }).cookies = cookies;
    next();
  };
}

function app(): express.Express {
  const a = express();
  a.use(express.json());
  a.use(parseCookies());
  a.use(
    '/v1',
    billingRecruiterRouter({
      pool: throwingPool,
      config: { jwtSecret: JWT_SECRET, cookieSecure: false } as never,
    }),
  );
  a.use(problemHandler());
  return a;
}

// A correctly-signed recruiter session token (issuer/audience/HS256 as the
// middleware requires). Used only by the positive control.
function validSessionToken(): string {
  return jwt.sign(
    {
      tenant_id: '22222222-2222-4222-8222-222222222222',
      email: 'recruiter@example.com',
      name: 'Test Recruiter',
      role: 'recruiter',
    },
    JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: 3600,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      subject: '11111111-1111-4111-8111-111111111111',
    },
  );
}

function cookie(token: string): string {
  return `${SESSION_COOKIE_NAME}=${token}`;
}

beforeEach(() => {
  // Provider env is irrelevant on the 401 gate paths; keep it clean anyway.
  delete process.env.RAZORPAY_PLAN_GROWTH;
  delete process.env.CASHFREE_PG_PLAN_GROWTH;
});

afterEach(() => {
  process.env = { ...SAVED };
});

// Each recruiter-authed endpoint, with the HTTP verb used to reach it.
const ENDPOINTS: Array<{ name: string; call: (a: express.Express) => request.Test }> = [
  {
    name: 'GET /v1/recruiter/billing/status',
    call: (a) => request(a).get('/v1/recruiter/billing/status'),
  },
  {
    name: 'POST /v1/recruiter/billing/subscribe',
    call: (a) => request(a).post('/v1/recruiter/billing/subscribe').send({ plan: 'growth' }),
  },
  {
    name: 'POST /v1/recruiter/billing/cancel',
    call: (a) => request(a).post('/v1/recruiter/billing/cancel').send({}),
  },
];

describe('recruiter billing routes — auth gate rejects before DB', () => {
  for (const ep of ENDPOINTS) {
    describe(ep.name, () => {
      it('rejects a missing session cookie with 401 problem+json (no DB hit)', async () => {
        const res = await ep.call(app());
        expect(res.status).toBe(401);
        expect(res.headers['content-type']).toContain('application/problem+json');
        expect(res.body.status).toBe(401);
      });

      it('rejects a garbage (non-JWT) session cookie with 401 (no DB hit)', async () => {
        const res = await ep.call(app()).set('Cookie', cookie('not-a-jwt'));
        expect(res.status).toBe(401);
        expect(res.body.status).toBe(401);
      });

      it('rejects a token signed with the wrong secret with 401 (no DB hit)', async () => {
        const forged = jwt.sign(
          {
            tenant_id: '22222222-2222-4222-8222-222222222222',
            email: 'attacker@example.com',
            name: 'Mallory',
            role: 'recruiter',
          },
          'a_different_secret_at_least_thirty_two_chars_long_xx',
          {
            algorithm: 'HS256',
            expiresIn: 3600,
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
            subject: '33333333-3333-4333-8333-333333333333',
          },
        );
        const res = await ep.call(app()).set('Cookie', cookie(forged));
        expect(res.status).toBe(401);
        expect(res.body.status).toBe(401);
      });
    });
  }

  // Positive control: a valid token PASSES the 401 gate, so the handler reaches
  // the repository and the throwing Pool fires (500). This proves the gate is
  // not the thing rejecting valid sessions.
  it('lets a correctly-signed session past the gate to the DB layer (500 from throwing Pool, not 401)', async () => {
    const res = await request(app())
      .get('/v1/recruiter/billing/status')
      .set('Cookie', cookie(validSessionToken()));
    expect(res.status).not.toBe(401);
    expect(res.status).toBe(500);
  });
});
