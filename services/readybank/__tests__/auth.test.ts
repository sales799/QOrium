import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { pino } from 'pino';
import argon2 from 'argon2';
import type { Pool } from '@qorium/db';
import { createServer } from '../src/server.js';
import type { Config } from '../src/config.js';

/**
 * Unit-level tests for Surface 6 recruiter auth. Uses a stub Pool that
 * captures queries by SQL substring — no Postgres required.
 */

const silentLogger = pino({ level: 'silent' });

function testConfig(overrides: Partial<Config> = {}): Config {
  return {
    serviceName: 'qorium-readybank',
    nodeEnv: 'test',
    port: 0,
    logLevel: 'silent',
    version: '0.0.0-test',
    gitSha: 'testsha',
    sentryDsn: undefined,
    apiKeyPepper: undefined,
    redisUrl: undefined,
    jwtSecret: 'test_jwt_secret_at_least_thirty_two_characters_long_xx',
    cookieSecure: false,
    recruiterLockoutMinutes: 15,
    ...overrides,
  };
}

interface RecruiterFixture {
  id: string;
  tenant_id: string;
  email: string;
  name: string;
  password_hash: string;
  failed_login_count: number;
  locked_until: Date | null;
  status: 'active' | 'disabled';
}

interface StubPool {
  pool: Pool;
  recruiter: RecruiterFixture;
  queries: Array<{ sql: string; params: unknown[] }>;
}

function buildStubPool(seed: Partial<RecruiterFixture> & { password: string }): StubPool {
  const recruiter: RecruiterFixture = {
    id: seed.id ?? '11111111-1111-4111-8111-111111111111',
    tenant_id: seed.tenant_id ?? '22222222-2222-4222-8222-222222222222',
    email: seed.email ?? 'recruiter@example.com',
    name: seed.name ?? 'Test Recruiter',
    password_hash: '', // populated below
    failed_login_count: seed.failed_login_count ?? 0,
    locked_until: seed.locked_until ?? null,
    status: seed.status ?? 'active',
  };

  const queries: Array<{ sql: string; params: unknown[] }> = [];
  const pool = {
    query: async (sql: string, params: unknown[] = []) => {
      queries.push({ sql, params });
      if (sql.includes('FROM app.recruiters')) {
        const email = (params[0] as string)?.toLowerCase();
        if (email === recruiter.email.toLowerCase()) {
          return { rows: [{ ...recruiter }], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      }
      if (sql.includes('UPDATE app.recruiters')) {
        if (sql.includes('failed_login_count = $2')) {
          recruiter.failed_login_count = params[1] as number;
          recruiter.locked_until = params[2] as Date | null;
        } else if (sql.includes('failed_login_count = 0')) {
          recruiter.failed_login_count = 0;
          recruiter.locked_until = null;
        }
        return { rows: [], rowCount: 1 };
      }
      if (sql.includes('INSERT INTO audit.events')) {
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    },
  } as unknown as Pool;

  return { pool, recruiter, queries };
}

async function buildApp(seed: Partial<RecruiterFixture> & { password: string }) {
  const passwordHash = await argon2.hash(seed.password, { type: argon2.argon2id });
  const stub = buildStubPool(seed);
  stub.recruiter.password_hash = passwordHash;
  const { app } = createServer({
    config: testConfig(),
    pool: stub.pool,
    logger: silentLogger,
    authMiddleware: (_req, _res, next) => next(), // bypass API-key gate (not under test)
  });
  return { app, stub };
}

function extractCookie(setCookie: string | string[] | undefined): string | undefined {
  if (!setCookie) return undefined;
  const arr = Array.isArray(setCookie) ? setCookie : [setCookie];
  const session = arr.find((c) => c.startsWith('qor_session='));
  return session?.split(';')[0];
}

describe('POST /v1/auth/login', () => {
  it('returns 200 + sets HttpOnly session cookie on valid credentials', async () => {
    const { app } = await buildApp({ password: 'correct horse battery staple' });
    const res = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'recruiter@example.com', password: 'correct horse battery staple' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      recruiter: {
        email: 'recruiter@example.com',
        name: 'Test Recruiter',
        role: 'recruiter',
      },
    });
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    const cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
    expect(cookie).toContain('qor_session=');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Max-Age=28800');
  });

  it('returns 401 on wrong password and increments failed counter', async () => {
    const { app, stub } = await buildApp({ password: 'right' });
    const res = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'recruiter@example.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(stub.recruiter.failed_login_count).toBe(1);
    expect(stub.recruiter.locked_until).toBeNull();
  });

  it('locks the account and returns 423 on the 5th consecutive failure', async () => {
    const { app, stub } = await buildApp({
      password: 'right',
      failed_login_count: 4,
    });
    const res = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'recruiter@example.com', password: 'wrong' });

    expect(res.status).toBe(423);
    expect(res.body).toMatchObject({ status: 423, title: 'Locked' });
    expect(stub.recruiter.locked_until).toBeInstanceOf(Date);
    expect(stub.recruiter.failed_login_count).toBe(0);
    expect(res.body.locked_until).toEqual(expect.any(String));
  });

  it('returns 423 immediately when account is already locked', async () => {
    const { app } = await buildApp({
      password: 'right',
      locked_until: new Date(Date.now() + 5 * 60_000),
    });
    const res = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'recruiter@example.com', password: 'right' });

    expect(res.status).toBe(423);
  });

  it('returns 401 (not 404) on unknown email — no user enumeration', async () => {
    const { app } = await buildApp({ password: 'right' });
    const res = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'whatever' });

    expect(res.status).toBe(401);
    expect(res.body.detail).toMatch(/incorrect/i);
  });

  it('returns 400 with violations on malformed body', async () => {
    const { app } = await buildApp({ password: 'right' });
    const res = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'not-an-email', password: '' });

    expect(res.status).toBe(400);
    expect(res.body.violations).toBeDefined();
  });

  it('returns 403 when account status is disabled', async () => {
    const { app } = await buildApp({ password: 'right', status: 'disabled' });
    const res = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'recruiter@example.com', password: 'right' });

    expect(res.status).toBe(403);
  });
});

describe('GET /v1/auth/whoami', () => {
  it('returns 401 without a session cookie', async () => {
    const { app } = await buildApp({ password: 'right' });
    const res = await request(app).get('/v1/auth/whoami');
    expect(res.status).toBe(401);
  });

  it('returns 200 + recruiter identity with valid cookie and slides expiry', async () => {
    const { app } = await buildApp({ password: 'right' });

    const login = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'recruiter@example.com', password: 'right' });
    const cookie = extractCookie(login.headers['set-cookie']);
    expect(cookie).toBeDefined();

    const res = await request(app).get('/v1/auth/whoami').set('Cookie', cookie!);
    expect(res.status).toBe(200);
    expect(res.body.recruiter.email).toBe('recruiter@example.com');

    // Sliding window: whoami re-issues the cookie.
    const refreshed = res.headers['set-cookie'];
    expect(refreshed).toBeDefined();
    const refreshedCookie = Array.isArray(refreshed) ? refreshed[0] : refreshed;
    expect(refreshedCookie).toContain('qor_session=');
    expect(refreshedCookie).toContain('Max-Age=28800');
  });

  it('returns 401 with a bogus cookie', async () => {
    const { app } = await buildApp({ password: 'right' });
    const res = await request(app)
      .get('/v1/auth/whoami')
      .set('Cookie', 'qor_session=not-a-real-jwt');
    expect(res.status).toBe(401);
  });
});

describe('POST /v1/auth/logout', () => {
  it('returns 204 and clears the session cookie', async () => {
    const { app } = await buildApp({ password: 'right' });
    const res = await request(app).post('/v1/auth/logout');
    expect(res.status).toBe(204);
    const setCookie = res.headers['set-cookie'];
    const cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
    expect(cookie).toContain('qor_session=;');
    expect(cookie).toMatch(/Expires=Thu, 01 Jan 1970/i);
  });
});
