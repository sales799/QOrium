import { describe, expect, it } from 'vitest';
import request from 'supertest';
import pino from 'pino';
import type { Pool } from '@qorium/db';
import { createServer } from '../src/server';

const silent = pino({ level: 'silent' });

const config = {
  nodeEnv: 'test' as const,
  port: 0,
  databaseUrl: undefined,
  apiKeyPepper: undefined,
};

interface FixtureRow {
  match: (sql: string) => boolean;
  rows: unknown[];
}

function fixturePool(fixtures: FixtureRow[]): Pool {
  return {
    query: async (sql: string) => {
      for (const f of fixtures) if (f.match(sql)) return { rows: f.rows };
      return { rows: [] };
    },
    end: async () => {},
    connect: async () => {
      throw new Error('connect not stubbed');
    },
  } as unknown as Pool;
}

const ACTIVE_VAULT_ROW = {
  id: 'vault-bosch',
  tenant_id: 'tenant-bosch',
  tier: 'enterprise',
  library_size: 2_000,
  watermark_secret: 'stack-vault-watermark-secret-32-chars-min',
  status: 'active',
  contract_start_date: new Date('2026-05-03'),
  contract_end_date: new Date('2027-05-03'),
  refresh_new_per_quarter: 200,
  refresh_retired_per_quarter: 100,
};

const SAMPLE_QUESTION = {
  id: 'q-1',
  uuid: '11111111-2222-3333-4444-555555555555',
  format: 'mcq',
  body_md: 'Sample question stem',
  body_json: { options: ['A', 'B', 'C', 'D'], correctIndex: 1 },
  answer_key: { correctIndex: 1 },
  test_cases: null,
  reference_solution: null,
  difficulty_b: '0.500',
  discrimination_a: '1.200',
  guessing_c: '0.250',
};

const resolveTenantId = () => 'tenant-bosch';

describe('stack-vault express server', () => {
  it('GET /healthz returns ok', async () => {
    const app = createServer({ config, logger: silent });
    const r = await request(app).get('/healthz');
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ status: 'ok', service: 'qorium-stack-vault' });
  });

  it('GET /v1/vaults/me returns 503 when no DB pool is configured', async () => {
    const app = createServer({ config, logger: silent, resolveTenantId });
    const r = await request(app).get('/v1/vaults/me');
    expect(r.status).toBe(503);
  });

  it('GET /v1/vaults/me returns 401 when tenant is unknown', async () => {
    const pool = fixturePool([]);
    const app = createServer({ config, logger: silent, pool, resolveTenantId: () => null });
    const r = await request(app).get('/v1/vaults/me');
    expect(r.status).toBe(401);
  });

  it('GET /v1/vaults/me returns 404 when no vault exists', async () => {
    const pool = fixturePool([{ match: (sql) => sql.includes('app.stack_vaults'), rows: [] }]);
    const app = createServer({ config, logger: silent, pool, resolveTenantId });
    const r = await request(app).get('/v1/vaults/me');
    expect(r.status).toBe(404);
  });

  it('GET /v1/vaults/me returns the public view (without watermark_secret)', async () => {
    const pool = fixturePool([
      { match: (sql) => sql.includes('app.stack_vaults'), rows: [ACTIVE_VAULT_ROW] },
    ]);
    const app = createServer({ config, logger: silent, pool, resolveTenantId });
    const r = await request(app).get('/v1/vaults/me');
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({
      id: 'vault-bosch',
      tier: 'enterprise',
      librarySize: 2_000,
      status: 'active',
    });
    expect(JSON.stringify(r.body)).not.toContain('watermark_secret');
    expect(JSON.stringify(r.body)).not.toContain(ACTIVE_VAULT_ROW.watermark_secret);
  });

  it('GET /v1/vaults/me returns 403 when vault is not active', async () => {
    const pool = fixturePool([
      {
        match: (sql) => sql.includes('app.stack_vaults'),
        rows: [{ ...ACTIVE_VAULT_ROW, status: 'suspended' }],
      },
    ]);
    const app = createServer({ config, logger: silent, pool, resolveTenantId });
    const r = await request(app).get('/v1/vaults/me');
    expect(r.status).toBe(403);
  });

  it('GET /v1/vaults/me/questions/search returns variants with watermarkId', async () => {
    const pool = fixturePool([
      { match: (sql) => sql.includes('app.stack_vaults'), rows: [ACTIVE_VAULT_ROW] },
      {
        match: (sql) =>
          sql.includes('FROM content.questions') && sql.includes("status = 'released'"),
        rows: [SAMPLE_QUESTION],
      },
    ]);
    const app = createServer({ config, logger: silent, pool, resolveTenantId });
    const r = await request(app).get('/v1/vaults/me/questions/search?limit=10');
    expect(r.status).toBe(200);
    expect(r.body.count).toBe(1);
    expect(r.body.results[0]).toMatchObject({ format: 'mcq', uuid: SAMPLE_QUESTION.uuid });
    expect(r.body.results[0].watermarkId).toMatch(/^[0-9a-f]{16}$/);
    expect(JSON.stringify(r.body)).not.toContain('watermark_secret');
  });

  it('GET /v1/vaults/me/questions/:uuid returns the variant with watermarkId', async () => {
    const pool = fixturePool([
      { match: (sql) => sql.includes('app.stack_vaults'), rows: [ACTIVE_VAULT_ROW] },
      {
        match: (sql) => sql.includes('FROM content.questions') && sql.includes('uuid = $1'),
        rows: [SAMPLE_QUESTION],
      },
    ]);
    const app = createServer({ config, logger: silent, pool, resolveTenantId });
    const r = await request(app).get(`/v1/vaults/me/questions/${SAMPLE_QUESTION.uuid}`);
    expect(r.status).toBe(200);
    expect(r.body.uuid).toBe(SAMPLE_QUESTION.uuid);
    expect(r.body.watermarkId).toMatch(/^[0-9a-f]{16}$/);
  });

  it('GET /v1/vaults/me/questions/:uuid returns 400 on a non-uuid id', async () => {
    const pool = fixturePool([
      { match: (sql) => sql.includes('app.stack_vaults'), rows: [ACTIVE_VAULT_ROW] },
    ]);
    const app = createServer({ config, logger: silent, pool, resolveTenantId });
    const r = await request(app).get('/v1/vaults/me/questions/not-a-uuid');
    expect(r.status).toBe(400);
  });

  it('GET /v1/vaults/me/questions/:uuid returns 404 when not found', async () => {
    const pool = fixturePool([
      { match: (sql) => sql.includes('app.stack_vaults'), rows: [ACTIVE_VAULT_ROW] },
      { match: (sql) => sql.includes('FROM content.questions'), rows: [] },
    ]);
    const app = createServer({ config, logger: silent, pool, resolveTenantId });
    const r = await request(app).get(`/v1/vaults/me/questions/${SAMPLE_QUESTION.uuid}`);
    expect(r.status).toBe(404);
  });

  it('POST /v1/vaults/me/refresh-request returns 202 with valid body', async () => {
    const pool = fixturePool([
      { match: (sql) => sql.includes('app.stack_vaults'), rows: [ACTIVE_VAULT_ROW] },
    ]);
    const app = createServer({ config, logger: silent, pool, resolveTenantId });
    const r = await request(app)
      .post('/v1/vaults/me/refresh-request')
      .send({ reason: 'Need fresh content for Q3 hiring drive', scope: 'full_library' });
    expect(r.status).toBe(202);
    expect(r.body).toMatchObject({ status: 'accepted', vault_id: 'vault-bosch' });
  });

  it('POST /v1/vaults/me/refresh-request returns 400 on invalid body', async () => {
    const pool = fixturePool([
      { match: (sql) => sql.includes('app.stack_vaults'), rows: [ACTIVE_VAULT_ROW] },
    ]);
    const app = createServer({ config, logger: silent, pool, resolveTenantId });
    const r = await request(app).post('/v1/vaults/me/refresh-request').send({});
    expect(r.status).toBe(400);
  });

  it('POST /v1/vaults/me/leak-report returns 202 with valid body', async () => {
    const pool = fixturePool([
      { match: (sql) => sql.includes('app.stack_vaults'), rows: [ACTIVE_VAULT_ROW] },
    ]);
    const app = createServer({ config, logger: silent, pool, resolveTenantId });
    const r = await request(app).post('/v1/vaults/me/leak-report').send({
      question_uuid: SAMPLE_QUESTION.uuid,
      source_url: 'https://www.geeksforgeeks.org/some-leak/',
      evidence: 'Found a near-duplicate posted by user X on 2026-05-01.',
    });
    expect(r.status).toBe(202);
  });

  it('POST /v1/vaults/me/leak-report returns 400 on invalid url', async () => {
    const pool = fixturePool([
      { match: (sql) => sql.includes('app.stack_vaults'), rows: [ACTIVE_VAULT_ROW] },
    ]);
    const app = createServer({ config, logger: silent, pool, resolveTenantId });
    const r = await request(app).post('/v1/vaults/me/leak-report').send({
      question_uuid: SAMPLE_QUESTION.uuid,
      source_url: 'not-a-url',
      evidence: 'short evidence',
    });
    expect(r.status).toBe(400);
  });

  it('returns 404 RFC 7807 on unknown routes', async () => {
    const app = createServer({ config, logger: silent });
    const r = await request(app).get('/v1/nope');
    expect(r.status).toBe(404);
    expect(r.headers['content-type']).toMatch(/application\/problem\+json/);
  });
});
