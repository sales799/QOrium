import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { pino } from 'pino';
import argon2 from 'argon2';
import type { Pool, PoolClient } from '@qorium/db';
import { createServer } from '../src/server.js';
import type { Config } from '../src/config.js';
import { MockMailer } from '../src/mailer/index.js';

/**
 * Sprint 1.6: invite + accept flow. Uses a stub Pool with a stub PoolClient
 * so we can exercise BEGIN/COMMIT branches without a real Postgres.
 */

const silentLogger = pino({ level: 'silent' });

function testConfig(): Config {
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
    mailerDriver: 'mock',
    mailerFromAddress: 'no-reply@qorium.test',
    mailerReplyToAddress: undefined,
    recruiterPortalUrl: 'http://localhost:5101',
    sesRegion: undefined,
    sesAccessKeyId: undefined,
    sesSecretAccessKey: undefined,
    sendgridApiKey: undefined,
  };
}

interface InvitationRow {
  id: string;
  recruiter_id: string;
  token_hash: string;
  email: string;
  expires_at: Date;
  accepted_at: Date | null;
  revoked_at: Date | null;
}

interface RecruiterStubRow {
  id: string;
  tenant_id: string;
  email: string;
  name: string;
  password_hash: string | null;
  status: 'active' | 'disabled' | 'pending';
  failed_login_count: number;
  locked_until: Date | null;
}

interface FakeDb {
  recruiters: Map<string, RecruiterStubRow>;
  invitations: Map<string, InvitationRow>;
}

function buildFakeDb(): FakeDb {
  return { recruiters: new Map(), invitations: new Map() };
}

/**
 * Stub Pool/PoolClient. Only matches the SQL substrings the routes use.
 * Each transaction is a no-op COMMIT/ROLLBACK at the stub level — we mutate
 * the fake DB synchronously and don't model rollback. That's adequate for
 * route-level tests; real DB integration is covered by end-to-end suites.
 */
function buildStubPool(db: FakeDb): Pool {
  function findRecruiterById(id: string): RecruiterStubRow | undefined {
    return db.recruiters.get(id);
  }

  async function runQuery(sql: string, params: readonly unknown[] = []) {
    if (sql.includes('BEGIN') || sql.includes('COMMIT') || sql.includes('ROLLBACK')) {
      return { rows: [], rowCount: 0 };
    }
    if (
      sql.includes('FROM app.recruiters') &&
      sql.includes('email = $1') &&
      sql.includes('LIMIT 1')
    ) {
      const email = String(params[0]).toLowerCase();
      const row = [...db.recruiters.values()].find((r) => r.email.toLowerCase() === email);
      return row ? { rows: [{ ...row }], rowCount: 1 } : { rows: [], rowCount: 0 };
    }
    if (sql.includes('SELECT id, status FROM app.recruiters WHERE email = $1')) {
      const email = String(params[0]).toLowerCase();
      const row = [...db.recruiters.values()].find((r) => r.email.toLowerCase() === email);
      return row
        ? { rows: [{ id: row.id, status: row.status }], rowCount: 1 }
        : { rows: [], rowCount: 0 };
    }
    if (sql.includes('INSERT INTO app.recruiters')) {
      const id = `r-${db.recruiters.size + 1}`;
      const row: RecruiterStubRow = {
        id,
        tenant_id: String(params[0]),
        email: String(params[1]),
        name: String(params[2]),
        password_hash: null,
        status: 'pending',
        failed_login_count: 0,
        locked_until: null,
      };
      db.recruiters.set(id, row);
      return { rows: [{ id }], rowCount: 1 };
    }
    if (sql.includes('INSERT INTO app.recruiter_invitations')) {
      const id = `inv-${db.invitations.size + 1}`;
      const inv: InvitationRow = {
        id,
        recruiter_id: String(params[0]),
        token_hash: String(params[1]),
        email: String(params[2]),
        expires_at: params[5] as Date,
        accepted_at: null,
        revoked_at: null,
      };
      db.invitations.set(id, inv);
      return { rows: [], rowCount: 1 };
    }
    if (sql.includes('FROM app.recruiter_invitations') && sql.includes('token_hash = $1')) {
      const tokenHash = String(params[0]);
      const inv = [...db.invitations.values()].find(
        (i) => i.token_hash === tokenHash && i.accepted_at === null && i.revoked_at === null,
      );
      return inv
        ? {
            rows: [{ id: inv.id, recruiter_id: inv.recruiter_id, expires_at: inv.expires_at }],
            rowCount: 1,
          }
        : { rows: [], rowCount: 0 };
    }
    if (sql.includes('UPDATE app.recruiter_invitations') && sql.includes('accepted_at = NOW()')) {
      const inv = db.invitations.get(String(params[0]));
      if (inv) inv.accepted_at = new Date();
      return { rows: [], rowCount: 1 };
    }
    if (sql.includes('UPDATE app.recruiters') && sql.includes("status = 'active'")) {
      const row = findRecruiterById(String(params[0]));
      if (row) {
        row.password_hash = String(params[1]);
        row.status = 'active';
        row.failed_login_count = 0;
        row.locked_until = null;
      }
      return { rows: [], rowCount: 1 };
    }
    if (sql.includes('INSERT INTO audit.events')) {
      return { rows: [], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  const client = {
    query: runQuery,
    release: () => {
      /* noop */
    },
  } as unknown as PoolClient;

  return {
    query: runQuery,
    connect: async () => client,
  } as unknown as Pool;
}

function buildApp(db: FakeDb) {
  const mailer = new MockMailer();
  const pool = buildStubPool(db);
  const { app } = createServer({
    config: testConfig(),
    pool,
    mailer,
    logger: silentLogger,
    authMiddleware: (req, _res, next) => {
      // Pretend to be an authenticated API key for /v1/auth/invite tests.
      (req as unknown as { auth: { apiKeyId: string; tenantId: string } }).auth = {
        apiKeyId: '00000000-0000-4000-8000-000000000001',
        tenantId: 'tenant-1',
      };
      next();
    },
  });
  return { app, pool, mailer };
}

describe('POST /v1/auth/invite', () => {
  it('mints an invitation, sends email, returns 201 + delivery metadata', async () => {
    const db = buildFakeDb();
    const { app, mailer } = buildApp(db);

    const res = await request(app).post('/v1/auth/invite').send({
      email: 'newby@example.com',
      name: 'New Recruiter',
      tenant_id: '22222222-2222-4222-8222-222222222222',
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      email: 'newby@example.com',
      mailer: { driver: 'mock' },
    });
    expect(res.body.recruiter_id).toMatch(/^r-/);
    expect(res.body.expires_at).toEqual(expect.any(String));

    const sent = mailer.lastSentTo('newby@example.com');
    expect(sent).toBeDefined();
    expect(sent?.subject).toMatch(/invited/i);
    expect(sent?.text).toMatch(/accept-invite\.html\?token=/);

    expect(db.recruiters.size).toBe(1);
    const recruiter = [...db.recruiters.values()][0];
    expect(recruiter?.status).toBe('pending');
    expect(recruiter?.password_hash).toBeNull();

    expect(db.invitations.size).toBe(1);
  });

  it('returns 400 on malformed body', async () => {
    const { app } = buildApp(buildFakeDb());
    const res = await request(app)
      .post('/v1/auth/invite')
      .send({ email: 'not-an-email', name: '', tenant_id: 'not-a-uuid' });
    expect(res.status).toBe(400);
    expect(res.body.violations).toBeDefined();
  });

  it('returns 409 when the email already belongs to an active recruiter', async () => {
    const db = buildFakeDb();
    db.recruiters.set('existing', {
      id: 'existing',
      tenant_id: 't1',
      email: 'taken@example.com',
      name: 'Taken',
      password_hash: 'x',
      status: 'active',
      failed_login_count: 0,
      locked_until: null,
    });
    const { app } = buildApp(db);

    const res = await request(app).post('/v1/auth/invite').send({
      email: 'taken@example.com',
      name: 'Taken',
      tenant_id: '22222222-2222-4222-8222-222222222222',
    });

    expect(res.status).toBe(409);
  });
});

describe('POST /v1/auth/accept', () => {
  async function inviteAndExtractToken(
    app: ReturnType<typeof buildApp>['app'],
    mailer: MockMailer,
  ) {
    await request(app).post('/v1/auth/invite').send({
      email: 'newby@example.com',
      name: 'New Recruiter',
      tenant_id: '22222222-2222-4222-8222-222222222222',
    });
    const sent = mailer.lastSentTo('newby@example.com');
    expect(sent).toBeDefined();
    const match = sent!.text.match(/accept-invite\.html\?token=([^\s]+)/);
    expect(match).not.toBeNull();
    return decodeURIComponent(match![1]!);
  }

  it('redeems the token, hashes the password, and activates the recruiter', async () => {
    const db = buildFakeDb();
    const { app, mailer } = buildApp(db);
    const token = await inviteAndExtractToken(app, mailer);

    const res = await request(app)
      .post('/v1/auth/accept')
      .send({ token, password: 'a-strong-passphrase-1234' });

    expect(res.status).toBe(204);

    const recruiter = [...db.recruiters.values()][0];
    expect(recruiter?.status).toBe('active');
    expect(recruiter?.password_hash).toBeTruthy();
    // verify the stored hash was produced by argon2id
    const ok = await argon2.verify(recruiter!.password_hash!, 'a-strong-passphrase-1234');
    expect(ok).toBe(true);

    const inv = [...db.invitations.values()][0];
    expect(inv?.accepted_at).not.toBeNull();
  });

  it('returns 404 for an unknown token', async () => {
    const { app } = buildApp(buildFakeDb());
    const res = await request(app)
      .post('/v1/auth/accept')
      .send({ token: 'nope'.repeat(8), password: 'a-strong-passphrase-1234' });
    expect(res.status).toBe(404);
  });

  it('returns 410 for an expired token', async () => {
    const db = buildFakeDb();
    const { app, mailer } = buildApp(db);
    const token = await inviteAndExtractToken(app, mailer);

    // Simulate expiry by rewinding the invitation row.
    const inv = [...db.invitations.values()][0]!;
    inv.expires_at = new Date(Date.now() - 60_000);

    const res = await request(app)
      .post('/v1/auth/accept')
      .send({ token, password: 'a-strong-passphrase-1234' });
    expect(res.status).toBe(410);
  });

  it('returns 400 when password is too short', async () => {
    const db = buildFakeDb();
    const { app, mailer } = buildApp(db);
    const token = await inviteAndExtractToken(app, mailer);

    const res = await request(app).post('/v1/auth/accept').send({ token, password: 'short' });
    expect(res.status).toBe(400);
  });

  it('rejects re-use of an already-accepted token', async () => {
    const db = buildFakeDb();
    const { app, mailer } = buildApp(db);
    const token = await inviteAndExtractToken(app, mailer);

    const first = await request(app)
      .post('/v1/auth/accept')
      .send({ token, password: 'a-strong-passphrase-1234' });
    expect(first.status).toBe(204);

    const second = await request(app)
      .post('/v1/auth/accept')
      .send({ token, password: 'a-strong-passphrase-1234' });
    expect(second.status).toBe(404);
  });
});
