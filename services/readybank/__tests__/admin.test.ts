import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { pino } from 'pino';
import jwt from 'jsonwebtoken';
import type { Pool } from '@qorium/db';
import { createServer } from '../src/server.js';
import type { Config } from '../src/config.js';

/**
 * Admin console API tests (Sprint 1.8d). Stub Pool, signed JWT cookie,
 * supertest. No Postgres required.
 */

const silent = pino({ level: 'silent' });
const PEPPER = 'test_admin_pepper_at_least_thirty_two_chars_long_xxxx';
const JWT_SECRET = 'test_jwt_secret_at_least_thirty_two_characters_long_xx';
const TENANT_REF_ID = '00000000-0000-0000-0000-000000000001';
const RECRUITER_ID = '11111111-1111-1111-1111-111111111111';

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
    jwtSecret: JWT_SECRET,
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

interface StubPool {
  pool: Pool;
  queries: Array<{ sql: string; params: unknown[] }>;
  state: {
    leakAlerts: Array<{
      id: string;
      question_id: string;
      source_url: string;
      source_type: string;
      detected_at: Date;
      similarity_score: string;
      severity: string;
      status: string;
      rotated_to_question_id: string | null;
      evidence_jsonb: Record<string, unknown>;
      reviewed_by: string | null;
      review_notes: string | null;
    }>;
    questions: Array<{
      id: string;
      sku: string;
      format: string;
      status: string;
      difficulty_b: string | null;
      discrimination_a: string | null;
      empirical_pass_rate: string | null;
      body_md: string;
      authored_by: string;
      bloom_level: string | null;
      bloom_dimension: string | null;
      created_at: Date;
    }>;
    inserts: { tokens: number; auditEvents: number };
  };
}

function buildStub(): StubPool {
  const queries: StubPool['queries'] = [];
  const state: StubPool['state'] = {
    leakAlerts: [
      {
        id: '22222222-2222-2222-2222-222222222222',
        question_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        source_url: 'https://example.com/leak/1',
        source_type: 'mock',
        detected_at: new Date('2026-05-07T01:00:00Z'),
        similarity_score: '0.940',
        severity: 'critical',
        status: 'detected',
        rotated_to_question_id: null,
        evidence_jsonb: { snippet: 'verbatim copy', matched_ngrams: [] },
        reviewed_by: null,
        review_notes: null,
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        question_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        source_url: 'https://example.com/leak/2',
        source_type: 'mock',
        detected_at: new Date('2026-05-06T12:00:00Z'),
        similarity_score: '0.760',
        severity: 'medium',
        status: 'under_review',
        rotated_to_question_id: null,
        evidence_jsonb: {},
        reviewed_by: null,
        review_notes: null,
      },
    ],
    questions: [
      {
        id: 'q1',
        sku: 'readybank',
        format: 'mcq',
        status: 'sme_review',
        difficulty_b: '0.50',
        discrimination_a: '1.20',
        empirical_pass_rate: null,
        body_md: 'Sample question body for SME review',
        authored_by: 'claude-opus-4-7',
        bloom_level: 'analyze',
        bloom_dimension: 'conceptual',
        created_at: new Date('2026-05-01T00:00:00Z'),
      },
    ],
    inserts: { tokens: 0, auditEvents: 0 },
  };

  const pool = {
    async query(sql: string, params: unknown[] = []) {
      queries.push({ sql, params });

      if (sql.includes('FROM content.leak_alerts')) {
        let rows = [...state.leakAlerts];
        // Apply status / severity filters from params (very loose).
        if (sql.includes('status = $1')) {
          rows = rows.filter((r) => r.status === params[0]);
        } else if (sql.includes('severity = $1')) {
          rows = rows.filter((r) => r.severity === params[0]);
        }
        return { rows, rowCount: rows.length };
      }

      if (sql.startsWith('UPDATE content.leak_alerts')) {
        const status = params[0] as string;
        const id = params[3] as string;
        const target = state.leakAlerts.find((a) => a.id === id);
        if (!target) return { rows: [], rowCount: 0 };
        target.status = status;
        target.review_notes = (params[1] as string | null) ?? target.review_notes;
        target.reviewed_by = (params[2] as string | null) ?? target.reviewed_by;
        return {
          rows: [{ id: target.id, question_id: target.question_id }],
          rowCount: 1,
        };
      }

      if (sql.includes('FROM content.questions') && sql.includes('LEFT(body_md')) {
        return { rows: state.questions, rowCount: state.questions.length };
      }

      if (sql.includes('FROM content.questions q')) {
        return { rows: [], rowCount: 0 };
      }

      if (sql.includes("FROM app.tenants WHERE slug = 'reference-panel'")) {
        return { rows: [{ id: TENANT_REF_ID }], rowCount: 1 };
      }

      if (sql.includes('INSERT INTO app.reference_panel_tokens')) {
        state.inserts.tokens += 1;
        return {
          rows: [{ id: '44444444-4444-4444-4444-444444444444' }],
          rowCount: 1,
        };
      }

      if (sql.includes('INSERT INTO audit.events')) {
        state.inserts.auditEvents += 1;
        return { rows: [], rowCount: 1 };
      }

      if (sql.includes('FROM app.tenants t')) {
        const rows = [
          {
            id: '00000000-0000-0000-0000-0000000000aa',
            name: 'Talpro India',
            slug: 'talpro',
            type: 'internal',
            plan: 'enterprise',
            status: 'active',
            created_at: new Date('2026-05-31T00:00:00Z'),
            assessments: '4',
            attempts: '2',
          },
          {
            id: '00000000-0000-0000-0000-0000000000bb',
            name: 'Paused Co',
            slug: 'paused-co',
            type: 'customer-recruiter',
            plan: 'growth',
            status: 'paused',
            created_at: new Date('2026-06-01T00:00:00Z'),
            assessments: '0',
            attempts: '0',
          },
        ];
        const filtered = sql.includes('t.status = $1')
          ? rows.filter((r) => r.status === params[0])
          : rows;
        return { rows: filtered, rowCount: filtered.length };
      }

      if (sql.includes('FROM content.assessments a')) {
        const rows = [
          {
            id: 'aa',
            tenant_id: 't1',
            tenant_name: 'Talpro India',
            title: 'Backend Screen',
            status: 'active',
            total_questions: 5,
            created_at: new Date('2026-06-05T00:00:00Z'),
            invitations: '3',
            attempts: '2',
          },
          {
            id: 'bb',
            tenant_id: 't2',
            tenant_name: 'Paused Co',
            title: 'Draft Test',
            status: 'draft',
            total_questions: 0,
            created_at: new Date('2026-06-06T00:00:00Z'),
            invitations: '0',
            attempts: '0',
          },
        ];
        const filtered = sql.includes('a.status = $1')
          ? rows.filter((r) => r.status === params[0])
          : rows;
        return { rows: filtered, rowCount: filtered.length };
      }
      return { rows: [], rowCount: 0 };
    },
  } as unknown as Pool;

  return { pool, queries, state };
}

function adminCookie(): string {
  const token = jwt.sign(
    {
      sub: RECRUITER_ID,
      tenant_id: '99999999-9999-9999-9999-999999999999',
      email: 'admin@qorium.test',
      name: 'Admin Recruiter',
    },
    JWT_SECRET,
    {
      algorithm: 'HS256',
      issuer: 'qorium-readybank',
      audience: 'qorium-recruiter',
      expiresIn: '8h',
    },
  );
  return `qor_session=${token}`;
}

describe('GET /v1/admin/leak-alerts', () => {
  it('rejects without a session cookie (401)', async () => {
    const stub = buildStub();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silent,
      authMiddleware: (_req, _res, next) => next(),
    });
    const res = await request(app).get('/v1/admin/leak-alerts');
    expect(res.status).toBe(401);
  });

  it('returns leak alerts for an authenticated admin', async () => {
    const stub = buildStub();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silent,
      authMiddleware: (_req, _res, next) => next(),
    });
    const res = await request(app).get('/v1/admin/leak-alerts').set('Cookie', adminCookie());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.alerts)).toBe(true);
    expect(res.body.alerts.length).toBeGreaterThan(0);
    expect(typeof res.body.alerts[0].similarity_score).toBe('number');
  });

  it('filters by status when query param is set', async () => {
    const stub = buildStub();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silent,
      authMiddleware: (_req, _res, next) => next(),
    });
    const res = await request(app)
      .get('/v1/admin/leak-alerts?status=detected')
      .set('Cookie', adminCookie());
    expect(res.status).toBe(200);
    // Stub returns rows where status='detected' only for the filtered query.
    expect(res.body.alerts.every((a: { status: string }) => a.status === 'detected')).toBe(true);
  });

  it('rejects invalid status query (400)', async () => {
    const stub = buildStub();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silent,
      authMiddleware: (_req, _res, next) => next(),
    });
    const res = await request(app)
      .get('/v1/admin/leak-alerts?status=bogus')
      .set('Cookie', adminCookie());
    expect(res.status).toBe(400);
    expect(res.body.title).toBe('admin/invalid-query');
  });
});

describe('POST /v1/admin/leak-alerts/:id/review', () => {
  it('updates the alert status and audit-logs', async () => {
    const stub = buildStub();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silent,
      authMiddleware: (_req, _res, next) => next(),
    });
    const res = await request(app)
      .post('/v1/admin/leak-alerts/22222222-2222-2222-2222-222222222222/review')
      .set('Cookie', adminCookie())
      .send({ decision: 'dismissed', notes: 'Pre-existing public knowledge.' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: '22222222-2222-2222-2222-222222222222',
      decision: 'dismissed',
      reviewed_by: RECRUITER_ID,
    });
    const target = stub.state.leakAlerts.find(
      (a) => a.id === '22222222-2222-2222-2222-222222222222',
    );
    expect(target?.status).toBe('dismissed');
    expect(target?.review_notes).toBe('Pre-existing public knowledge.');

    await new Promise((r) => setTimeout(r, 5));
    expect(stub.state.inserts.auditEvents).toBeGreaterThanOrEqual(1);
  });

  it('rejects unknown ids (404)', async () => {
    const stub = buildStub();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silent,
      authMiddleware: (_req, _res, next) => next(),
    });
    const res = await request(app)
      .post('/v1/admin/leak-alerts/55555555-5555-5555-5555-555555555555/review')
      .set('Cookie', adminCookie())
      .send({ decision: 'dismissed' });
    expect(res.status).toBe(404);
  });

  it('rejects invalid decision values (400)', async () => {
    const stub = buildStub();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silent,
      authMiddleware: (_req, _res, next) => next(),
    });
    const res = await request(app)
      .post('/v1/admin/leak-alerts/22222222-2222-2222-2222-222222222222/review')
      .set('Cookie', adminCookie())
      .send({ decision: 'rotated' }); // not allowed via this endpoint
    expect(res.status).toBe(400);
  });
});

describe('GET /v1/admin/sme-queue', () => {
  it('returns questions in the SME-review status bucket', async () => {
    const stub = buildStub();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silent,
      authMiddleware: (_req, _res, next) => next(),
    });
    const res = await request(app)
      .get('/v1/admin/sme-queue?status=sme_review')
      .set('Cookie', adminCookie());
    expect(res.status).toBe(200);
    expect(res.body.questions.length).toBe(1);
    expect(res.body.questions[0].status).toBe('sme_review');
  });
});

describe('POST /v1/admin/panel-tokens', () => {
  it('mints a token, audit-logs, and returns the raw token once', async () => {
    const stub = buildStub();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silent,
      authMiddleware: (_req, _res, next) => next(),
    });

    const idHex = 'abcdef0123456789'.repeat(4); // 64 hex chars
    const res = await request(app)
      .post('/v1/admin/panel-tokens')
      .set('Cookie', adminCookie())
      .send({
        panelist_id_hash_hex: idHex,
        ttl_days: 30,
        metadata: { cohort: 'wave-1-test' },
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toMatch(/^qrp_[A-Za-z0-9_-]+$/);
    expect(res.body.id).toBe('44444444-4444-4444-4444-444444444444');
    expect(stub.state.inserts.tokens).toBe(1);

    await new Promise((r) => setTimeout(r, 5));
    expect(stub.state.inserts.auditEvents).toBeGreaterThanOrEqual(1);
  });

  it('rejects invalid panelist_id_hash_hex (400)', async () => {
    const stub = buildStub();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silent,
      authMiddleware: (_req, _res, next) => next(),
    });

    const res = await request(app)
      .post('/v1/admin/panel-tokens')
      .set('Cookie', adminCookie())
      .send({ panelist_id_hash_hex: 'too-short', ttl_days: 30 });

    expect(res.status).toBe(400);
    expect(res.body.title).toBe('admin/invalid-body');
  });

  it('returns 503 when API_KEY_PEPPER is not configured', async () => {
    const stub = buildStub();
    const { app } = createServer({
      config: testConfig({ apiKeyPepper: undefined }),
      pool: stub.pool,
      logger: silent,
      authMiddleware: (_req, _res, next) => next(),
    });

    const idHex = 'abcdef0123456789'.repeat(4);
    const res = await request(app)
      .post('/v1/admin/panel-tokens')
      .set('Cookie', adminCookie())
      .send({ panelist_id_hash_hex: idHex });

    expect(res.status).toBe(503);
    expect(res.body.title).toBe('admin/pepper-not-configured');
  });
});

describe('GET /admin redirect', () => {
  it('redirects /admin → /admin/dashboard.html', async () => {
    const stub = buildStub();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silent,
      authMiddleware: (_req, _res, next) => next(),
    });
    const res = await request(app).get('/admin');
    expect(res.status).toBe(302);
    expect(res.headers['location']).toBe('/admin/dashboard.html');
  });

  it('redirects /admin/ → /admin/dashboard.html', async () => {
    const stub = buildStub();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silent,
      authMiddleware: (_req, _res, next) => next(),
    });
    const res = await request(app).get('/admin/');
    expect(res.status).toBe(302);
    expect(res.headers['location']).toBe('/admin/dashboard.html');
  });
});

describe('GET /v1/admin/tenants', () => {
  it('rejects without a session cookie (401)', async () => {
    const stub = buildStub();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silent,
      authMiddleware: (_req, _res, next) => next(),
    });
    const res = await request(app).get('/v1/admin/tenants');
    expect(res.status).toBe(401);
  });

  it('returns tenants with numeric rollups for an authenticated admin', async () => {
    const stub = buildStub();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silent,
      authMiddleware: (_req, _res, next) => next(),
    });
    const res = await request(app).get('/v1/admin/tenants').set('Cookie', adminCookie());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tenants)).toBe(true);
    expect(res.body.tenants.length).toBe(2);
    expect(typeof res.body.tenants[0].assessments).toBe('number');
    expect(res.body.tenants[0].assessments).toBe(4);
    expect(typeof res.body.tenants[0].attempts).toBe('number');
  });

  it('filters by status when query param is set', async () => {
    const stub = buildStub();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silent,
      authMiddleware: (_req, _res, next) => next(),
    });
    const res = await request(app)
      .get('/v1/admin/tenants?status=paused')
      .set('Cookie', adminCookie());
    expect(res.status).toBe(200);
    expect(res.body.tenants.every((t: { status: string }) => t.status === 'paused')).toBe(true);
  });

  it('rejects an invalid status query (400)', async () => {
    const stub = buildStub();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silent,
      authMiddleware: (_req, _res, next) => next(),
    });
    const res = await request(app)
      .get('/v1/admin/tenants?status=bogus')
      .set('Cookie', adminCookie());
    expect(res.status).toBe(400);
    expect(res.body.title).toBe('admin/invalid-query');
  });
});

describe('GET /v1/admin/assessments', () => {
  it('rejects without a session cookie (401)', async () => {
    const stub = buildStub();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silent,
      authMiddleware: (_req, _res, next) => next(),
    });
    const res = await request(app).get('/v1/admin/assessments');
    expect(res.status).toBe(401);
  });
  it('returns cross-tenant assessments with numeric rollups', async () => {
    const stub = buildStub();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silent,
      authMiddleware: (_req, _res, next) => next(),
    });
    const res = await request(app).get('/v1/admin/assessments').set('Cookie', adminCookie());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.assessments)).toBe(true);
    expect(res.body.assessments.length).toBe(2);
    expect(typeof res.body.assessments[0].invitations).toBe('number');
    expect(res.body.assessments[0].invitations).toBe(3);
    expect(res.body.assessments[0].tenant_name).toBe('Talpro India');
  });
  it('filters by status', async () => {
    const stub = buildStub();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silent,
      authMiddleware: (_req, _res, next) => next(),
    });
    const res = await request(app)
      .get('/v1/admin/assessments?status=draft')
      .set('Cookie', adminCookie());
    expect(res.status).toBe(200);
    expect(res.body.assessments.every((a: { status: string }) => a.status === 'draft')).toBe(true);
  });
  it('rejects an invalid status (400)', async () => {
    const stub = buildStub();
    const { app } = createServer({
      config: testConfig(),
      pool: stub.pool,
      logger: silent,
      authMiddleware: (_req, _res, next) => next(),
    });
    const res = await request(app)
      .get('/v1/admin/assessments?status=bogus')
      .set('Cookie', adminCookie());
    expect(res.status).toBe(400);
    expect(res.body.title).toBe('admin/invalid-query');
  });
});
