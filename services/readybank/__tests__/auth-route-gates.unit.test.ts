import { describe, expect, it } from 'vitest';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import type { Pool } from '@qorium/db';
import { authRouter, adminAuthRouter } from '../src/routes/auth.js';
import {
  JWT_AUDIENCE,
  JWT_ISSUER,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from '../src/middleware/recruiter-auth.js';
import { problemHandler } from '../src/middleware/problem.js';
import type { Config } from '../src/config.js';
import type { Mailer } from '../src/mailer/index.js';

/**
 * N17 test-storm -- route-level coverage for the recruiter auth /auth/*
 * endpoints' DB-free gates. Every branch asserted here rejects a request
 * BEFORE any repository call, so Postgres is never touched:
 *
 *   POST /auth/login              -> 400 (Zod body: missing / bad email / empty pw)
 *   GET  /auth/whoami (no cookie) -> 401 (recruiterAuth session gate)
 *   GET  /auth/whoami (forged)    -> 401 (bad-secret JWT)
 *   GET  /auth/whoami (wrong aud) -> 401 (right secret, wrong audience)
 *   GET  /auth/whoami (valid)     -> 200 (positive control: gate passes, no DB)
 *   POST /auth/accept             -> 400 (Zod: missing / short token / short pw)
 *   POST /auth/invite (no apikey) -> 401 (apiKeyAuth gate, before Zod)
 *   POST /auth/invite (authed)    -> 400 (Zod body / non-UUID tenant_id, before query)
 *
 * The /auth/login and /auth/accept gates are pure Zod-before-DB. /auth/whoami
 * is gated by the cookie-based recruiterAuth() session (qor_session JWT), so
 * this suite mints real HS256 tokens (valid, forged-secret, and wrong-claims)
 * to exercise the session gate while the DB stays untouched -- and whoami's
 * own handler never queries Postgres, so a valid session is a clean positive
 * control (200, proving the gate is not over-rejecting).
 *
 * /auth/invite lives on the SEPARATE adminAuthRouter (gated by apiKeyAuth via
 * AuthenticatedRequest.auth, set upstream by the live server, NOT by the
 * router), so the invite block mounts adminAuthRouter and a synthetic auth
 * middleware injects req.auth to reach the Zod gate -- mirroring the
 * assessments / a4 apiKeyAuth pattern. The mailer dep is a throwing stub that
 * must never be reached: every invite assertion rejects at the apiKey or Zod
 * gate, before any mail send or DB connect.
 *
 * A throwing stub Pool whose query() AND connect() both fail proves every gate
 * above short-circuits before Postgres. Both routers surface problems via
 * next(HttpProblem), so problemHandler() is mounted, and a tiny inline
 * Cookie-header parser mirrors the production parseCookieHeader so req.cookies
 * is populated exactly as the live server does. First route-integration
 * coverage of src/routes/auth.ts's gate branches (the existing auth.test.ts
 * exercises the happy/lockout paths with a query-capturing stub), mirroring the
 * recruiter / assessments / a4 / proof route-gate pattern (PRs #206/#202/#201/#198).
 */

const TEST_JWT_SECRET = 'route-gate-test-secret-auth-surface-thirty-two-x';

// A pool that fails loudly if any handler reaches the DB on these gate paths.
const throwingPool = {
  query: async () => {
    throw new Error('DB must not be queried on the /auth validation/session gates');
  },
  connect: async () => {
    throw new Error('DB must not be connected on the /auth validation/session gates');
  },
} as unknown as Pool;

// A mailer that must never be invoked: the invite gates reject before send().
const throwingMailer = {
  send: async () => {
    throw new Error('Mailer must not be invoked on the /auth/invite gate paths');
  },
} as unknown as Mailer;

// Minimal config slice the auth routers actually read.
const config = {
  jwtSecret: TEST_JWT_SECRET,
  cookieSecure: false,
  recruiterLockoutMinutes: 15,
  recruiterPortalUrl: 'http://localhost:5101',
  mailerFromAddress: 'no-reply@qorium.test',
  mailerReplyToAddress: undefined,
} as unknown as Config;

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

// Synthetic apiKeyAuth: injects req.auth so /auth/invite reaches its Zod gate.
// The live server sets this upstream via apiKeyAuth(); the router only reads it.
function injectApiKeyAuth(): express.RequestHandler {
  return (req, _res, next) => {
    (req as express.Request & { auth?: unknown }).auth = {
      apiKeyId: '00000000-0000-4000-8000-0000000000d1',
      tenantId: '00000000-0000-4000-8000-0000000000b1',
      scopes: ['recruiter:write'],
    };
    next();
  };
}

// audit:false keeps recordAuditEvent (which would touch the pool) off the
// gate paths; the gates under test reject before any audit anyway, but this
// removes a background pool.query and keeps the throwingPool assertion crisp.
function buildAuthApp(): express.Express {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(authRouter({ pool: throwingPool, config, audit: false }));
  app.use(problemHandler());
  return app;
}

function buildInviteApp(opts: { withApiKey?: boolean } = {}): express.Express {
  const app = express();
  app.use(express.json());
  if (opts.withApiKey) app.use(injectApiKeyAuth());
  app.use(adminAuthRouter({ pool: throwingPool, config, mailer: throwingMailer, audit: false }));
  app.use(problemHandler());
  return app;
}

const VALID_UUID = '00000000-0000-4000-8000-0000000000c1';

// Mint a recruiter session JWT matching issueSessionCookie's claim shape.
function signSession(opts: { secret?: string; issuer?: string; audience?: string } = {}): string {
  return jwt.sign(
    {
      tenant_id: '00000000-0000-4000-8000-0000000000b1',
      email: 'rec@example.com',
      name: 'Test Recruiter',
      role: 'recruiter',
    },
    opts.secret ?? TEST_JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: SESSION_TTL_SECONDS,
      issuer: opts.issuer ?? JWT_ISSUER,
      audience: opts.audience ?? JWT_AUDIENCE,
      subject: '00000000-0000-4000-8000-0000000000a1',
    },
  );
}

function cookie(token: string): string {
  return `${SESSION_COOKIE_NAME}=${token}`;
}

describe('auth routes -- login Zod gate (no DB)', () => {
  const app = buildAuthApp();

  it('POST /auth/login with empty body -> 400 application/problem+json', async () => {
    const res = await request(app).post('/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });

  it('POST /auth/login with malformed email -> 400 (before DB)', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'not-an-email', password: 'whatever' });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('POST /auth/login with empty password -> 400 (before DB)', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'rec@example.com', password: '' });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });
});

describe('auth routes -- whoami session gate (no DB)', () => {
  const app = buildAuthApp();

  it('GET /auth/whoami without cookie -> 401 application/problem+json', async () => {
    const res = await request(app).get('/auth/whoami');
    expect(res.status).toBe(401);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(401);
  });

  it('GET /auth/whoami with a forged-secret JWT -> 401 (no DB)', async () => {
    const forged = signSession({ secret: 'wrong-secret-not-the-server-one' });
    const res = await request(app).get('/auth/whoami').set('Cookie', cookie(forged));
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
  });

  it('GET /auth/whoami with right secret but wrong audience -> 401 (no DB)', async () => {
    const wrongAud = signSession({ audience: 'qorium-admin' });
    const res = await request(app).get('/auth/whoami').set('Cookie', cookie(wrongAud));
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
  });

  it('GET /auth/whoami with a valid session -> 200 (gate passes, no DB)', async () => {
    const res = await request(app).get('/auth/whoami').set('Cookie', cookie(signSession()));
    expect(res.status).toBe(200);
    expect(res.body.recruiter.role).toBe('recruiter');
    expect(res.body.recruiter.email).toBe('rec@example.com');
  });
});

describe('auth routes -- accept invitation Zod gate (no DB)', () => {
  const app = buildAuthApp();

  it('POST /auth/accept with empty body -> 400 (before pool.connect)', async () => {
    const res = await request(app).post('/auth/accept').send({});
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('POST /auth/accept with too-short token -> 400 (before pool.connect)', async () => {
    const res = await request(app)
      .post('/auth/accept')
      .send({ token: 'short', password: 'a-long-enough-password' });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('POST /auth/accept with too-short password -> 400 (before pool.connect)', async () => {
    const res = await request(app)
      .post('/auth/accept')
      .send({ token: 'a'.repeat(20), password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });
});

describe('admin auth route -- invite apiKey + Zod gate (no DB, no mail)', () => {
  it('POST /auth/invite without api key -> 401 (before Zod, no DB)', async () => {
    const app = buildInviteApp(); // no injected req.auth
    const res = await request(app)
      .post('/auth/invite')
      .send({ email: 'new@example.com', name: 'New Rec', tenant_id: VALID_UUID });
    expect(res.status).toBe(401);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(401);
  });

  it('POST /auth/invite authed with empty body -> 400 (Zod, before pool.connect)', async () => {
    const app = buildInviteApp({ withApiKey: true });
    const res = await request(app).post('/auth/invite').send({});
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('POST /auth/invite authed with non-UUID tenant_id -> 400 (Zod, before pool.connect)', async () => {
    const app = buildInviteApp({ withApiKey: true });
    const res = await request(app)
      .post('/auth/invite')
      .send({ email: 'new@example.com', name: 'New Rec', tenant_id: 'not-a-uuid' });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });
});
