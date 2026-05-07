import { describe, expect, it } from 'vitest';
import { createHmac } from 'node:crypto';
import request from 'supertest';
import { pino } from 'pino';
import type { Pool } from '@qorium/db';
import { createServer } from '../src/server.js';
import type { Config } from '../src/config.js';

const silentLogger = pino({ level: 'silent' });

const PEPPER = 'test_panel_pepper_at_least_thirty_two_characters_long_xx';

function testConfig(overrides: Partial<Config> = {}): Config {
  return {
    serviceName: 'qorium-readybank',
    nodeEnv: 'test',
    port: 0,
    logLevel: 'silent',
    version: '0.0.0-test',
    gitSha: 'testsha',
    sentryDsn: undefined,
    apiKeyPepper: PEPPER,
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
    ...overrides,
  };
}

interface TokenFixture {
  id: string;
  tenant_id: string;
  panelist_id_hash: Buffer;
  scopes: string[];
  expires_at: Date | null;
  revoked_at: Date | null;
}

interface StubPool {
  pool: Pool;
  token: TokenFixture;
  queries: Array<{ sql: string; params: unknown[] }>;
  inserted: { responses: number; auditEvents: number };
}

function hashToken(raw: string): Buffer {
  return createHmac('sha256', PEPPER).update(raw, 'utf8').digest();
}

function buildStubPool(overrides: Partial<TokenFixture> = {}): StubPool {
  const token: TokenFixture = {
    id: '11111111-1111-1111-1111-111111111111',
    tenant_id: '22222222-2222-2222-2222-222222222222',
    panelist_id_hash: Buffer.from('aabbccdd'.repeat(8), 'hex'),
    scopes: ['reference-panel:write'],
    expires_at: new Date(Date.now() + 86_400_000),
    revoked_at: null,
    ...overrides,
  };

  const queries: Array<{ sql: string; params: unknown[] }> = [];
  const inserted = { responses: 0, auditEvents: 0 };

  const pool = {
    async query(sql: string, params: unknown[] = []) {
      queries.push({ sql, params });

      if (sql.includes('FROM app.reference_panel_tokens')) {
        const probedHash = params[0] as Buffer;
        if (Buffer.isBuffer(probedHash) && probedHash.equals(hashToken('valid-token'))) {
          return { rows: [token], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      }

      if (sql.includes('UPDATE app.reference_panel_tokens')) {
        return { rows: [], rowCount: 1 };
      }

      if (sql.includes('INSERT INTO content.responses')) {
        inserted.responses += 1;
        return {
          rows: [{ id: '33333333-3333-3333-3333-333333333333' }],
          rowCount: 1,
        };
      }

      if (sql.includes('INSERT INTO audit.events')) {
        inserted.auditEvents += 1;
        return { rows: [], rowCount: 1 };
      }

      return { rows: [], rowCount: 0 };
    },
  } as unknown as Pool;

  return { pool, token, queries, inserted };
}

describe('POST /v1/reference-panel/responses', () => {
  it('rejects requests without an Authorization header (401)', async () => {
    const stub = buildStubPool();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silentLogger,
    });

    const res = await request(app)
      .post('/v1/reference-panel/responses')
      .send({
        question_id: '00000000-0000-0000-0000-000000000000',
        response_body: { answer: 'B' },
      });

    expect(res.status).toBe(401);
    expect(res.body.title).toBe('reference-panel/missing-token');
  });

  it('rejects an unknown bearer token (401)', async () => {
    const stub = buildStubPool();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silentLogger,
    });

    const res = await request(app)
      .post('/v1/reference-panel/responses')
      .set('Authorization', 'Bearer nope')
      .send({
        question_id: '00000000-0000-0000-0000-000000000000',
        response_body: { answer: 'B' },
      });

    expect(res.status).toBe(401);
    expect(res.body.title).toBe('reference-panel/invalid-token');
  });

  it('rejects a revoked token (401)', async () => {
    const stub = buildStubPool({ revoked_at: new Date(Date.now() - 1000) });
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silentLogger,
    });

    const res = await request(app)
      .post('/v1/reference-panel/responses')
      .set('Authorization', 'Bearer valid-token')
      .send({
        question_id: '00000000-0000-0000-0000-000000000000',
        response_body: { answer: 'B' },
      });

    expect(res.status).toBe(401);
    expect(res.body.title).toBe('reference-panel/token-revoked');
  });

  it('rejects an expired token (401)', async () => {
    const stub = buildStubPool({ expires_at: new Date(Date.now() - 1000) });
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silentLogger,
    });

    const res = await request(app)
      .post('/v1/reference-panel/responses')
      .set('Authorization', 'Bearer valid-token')
      .send({
        question_id: '00000000-0000-0000-0000-000000000000',
        response_body: { answer: 'B' },
      });

    expect(res.status).toBe(401);
    expect(res.body.title).toBe('reference-panel/token-expired');
  });

  it('rejects a token without the required scope (403)', async () => {
    const stub = buildStubPool({ scopes: ['reference-panel:read'] });
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silentLogger,
    });

    const res = await request(app)
      .post('/v1/reference-panel/responses')
      .set('Authorization', 'Bearer valid-token')
      .send({
        question_id: '00000000-0000-0000-0000-000000000000',
        response_body: { answer: 'B' },
      });

    expect(res.status).toBe(403);
    expect(res.body.title).toBe('reference-panel/insufficient-scope');
  });

  it('rejects a malformed body (400)', async () => {
    const stub = buildStubPool();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silentLogger,
    });

    const res = await request(app)
      .post('/v1/reference-panel/responses')
      .set('Authorization', 'Bearer valid-token')
      .send({ question_id: 'not-a-uuid' });

    expect(res.status).toBe(400);
    expect(res.body.title).toBe('reference-panel/invalid-body');
  });

  it('records a valid response (201) and writes both content.responses and audit.events', async () => {
    const stub = buildStubPool();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silentLogger,
    });

    const res = await request(app)
      .post('/v1/reference-panel/responses')
      .set('Authorization', 'Bearer valid-token')
      .send({
        question_id: '00000000-0000-0000-0000-000000000001',
        response_body: { answer: 'B' },
        correct: true,
        time_taken_ms: 12000,
      });

    expect(res.status).toBe(201);
    expect(res.body.question_id).toBe('00000000-0000-0000-0000-000000000001');
    expect(res.body.id).toBe('33333333-3333-3333-3333-333333333333');
    expect(stub.inserted.responses).toBe(1);

    // Verify the row was tagged is_reference_panel = TRUE in the SQL.
    const insertCall = stub.queries.find((q) => q.sql.includes('INSERT INTO content.responses'))!;
    expect(insertCall.sql).toContain('TRUE');

    // Audit-log fires async via void; allow microtasks to flush.
    await new Promise((r) => setTimeout(r, 5));
    expect(stub.inserted.auditEvents).toBeGreaterThanOrEqual(1);
  });

  it('uses score 100 / 0 when only `correct` is provided', async () => {
    const stub = buildStubPool();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silentLogger,
    });

    await request(app)
      .post('/v1/reference-panel/responses')
      .set('Authorization', 'Bearer valid-token')
      .send({
        question_id: '00000000-0000-0000-0000-000000000002',
        response_body: { answer: 'C' },
        correct: false,
      });

    const insertCall = stub.queries.find((q) => q.sql.includes('INSERT INTO content.responses'))!;
    expect(insertCall.params).toContain(0);
  });
});
