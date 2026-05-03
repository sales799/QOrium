import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import express from 'express';
import { pino } from 'pino';
import yaml from 'js-yaml';
import { createPool, ping } from '@qorium/db';
import type { Pool } from '@qorium/db';
import { hashApiKey, apiKeyAuth, createMemoryRateLimiter } from '@qorium/auth';
import { createServer } from '../src/server.js';
import type { Config } from '../src/config.js';

/**
 * Live integration of the full pack generate → export flow against
 * Postgres. Auto-skips when DATABASE_URL is unset.
 */

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.QORIUM_TEST_DATABASE_URL;
const PEPPER = 'pack_integration_pepper_at_least_thirty_two_chars';
const TEST_KEY = 'qor_live_b7f3b2c1e8d4f9a6b2c5e1d8a9f3b2c1';
const TEST_KEY_HASH = hashApiKey(TEST_KEY, PEPPER);

const skipReason = !DATABASE_URL ? 'DATABASE_URL unset' : null;
const describeOrSkip = skipReason ? describe.skip : describe;

interface SeededIds {
  tenantId: string;
  apiKeyId: string;
  skillId: string;
  questionIds: string[];
  packIds: string[];
}

async function seedFixtures(pool: Pool): Promise<SeededIds> {
  const tenant = await pool.query<{ id: string }>(
    `INSERT INTO app.tenants (name, slug, type) VALUES ('Pack Integration', $1, 'internal') RETURNING id`,
    [`pack-integration-${Date.now()}`],
  );
  const tenantId = tenant.rows[0]!.id;

  const apiKey = await pool.query<{ id: string }>(
    `INSERT INTO app.api_keys (tenant_id, name, prefix, hashed_key, scopes)
     VALUES ($1, 'pack-integration', 'qor_live', $2, ARRAY['read','write'])
     RETURNING id`,
    [tenantId, TEST_KEY_HASH],
  );
  const apiKeyId = apiKey.rows[0]!.id;

  const skill = await pool.query<{ id: string }>(
    `INSERT INTO content.skills (slug, name, family) VALUES ($1, 'Pack Skill', 'tech') RETURNING id`,
    [`pack-skill-${Date.now()}`],
  );
  const skillId = skill.rows[0]!.id;

  const baseTime = new Date('2026-04-01T10:00:00Z').getTime();
  const questionIds: string[] = [];
  for (let i = 0; i < 4; i++) {
    const inserted = await pool.query<{ id: string }>(
      `INSERT INTO content.questions
        (sku, format, skill_id, body_md, body_json, status, language,
         difficulty_b, authored_by, released_at)
       VALUES
        ('readybank', 'mcq', $1, $2, $3::jsonb, 'released', 'en', 0.0, 'pack-test', $4)
       RETURNING id`,
      [
        skillId,
        `Pack question body ${i}`,
        JSON.stringify({ options: ['a', 'b', 'c', 'd'], correct_index: i % 4 }),
        new Date(baseTime + i * 60_000).toISOString(),
      ],
    );
    questionIds.push(inserted.rows[0]!.id);
  }

  return { tenantId, apiKeyId, skillId, questionIds, packIds: [] };
}

async function cleanup(pool: Pool, ids: SeededIds): Promise<void> {
  if (ids.packIds.length > 0) {
    await pool.query(`DELETE FROM app.packs WHERE id = ANY($1::uuid[])`, [ids.packIds]);
  }
  await pool.query(`DELETE FROM content.questions WHERE id = ANY($1::uuid[])`, [ids.questionIds]);
  await pool.query(`DELETE FROM content.skills WHERE id = $1`, [ids.skillId]);
  await pool.query(`DELETE FROM app.api_keys WHERE id = $1`, [ids.apiKeyId]);
  await pool.query(`DELETE FROM app.tenants WHERE id = $1`, [ids.tenantId]);
  await pool.query(`DELETE FROM audit.events WHERE actor_id = $1`, [ids.apiKeyId]);
}

function testConfig(): Config {
  return {
    serviceName: 'qorium-readybank',
    nodeEnv: 'test',
    port: 0,
    logLevel: 'silent',
    version: '0.0.0-test',
    gitSha: 'pack-int',
    sentryDsn: undefined,
    apiKeyPepper: PEPPER,
    redisUrl: undefined,
  };
}

const silentLogger = pino({ level: 'silent' });

describeOrSkip('readybank /v1/packs integration', () => {
  let pool: Pool;
  let ids: SeededIds;
  let app: express.Express;

  beforeAll(async () => {
    pool = createPool({
      ...(DATABASE_URL !== undefined ? { connectionString: DATABASE_URL } : {}),
      max: 4,
    });
    expect(await ping(pool)).toBe(true);

    ids = await seedFixtures(pool);

    const auth = apiKeyAuth({
      pool,
      pepper: PEPPER,
      rateLimiter: createMemoryRateLimiter({ points: 1000, duration: 60 }),
      audit: false,
    });

    const server = createServer({
      config: testConfig(),
      pool,
      logger: silentLogger,
      authMiddleware: auth,
    });
    app = server.app;
  });

  afterAll(async () => {
    await cleanup(pool, ids);
    await pool.end();
  });

  describe('POST /v1/packs/generate', () => {
    it('rejects unauthenticated requests', async () => {
      const res = await request(app).post('/v1/packs/generate').send({});
      expect(res.status).toBe(401);
    });

    it('creates a pack with snapshot of question UUIDs', async () => {
      const res = await request(app)
        .post('/v1/packs/generate')
        .set('authorization', `Bearer ${TEST_KEY}`)
        .send({
          name: 'My Pack',
          filters: { format: 'mcq', language: 'en' },
          limit: 10,
          expires_in_days: 7,
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        name: 'My Pack',
        status: 'ready',
      });
      expect(typeof res.body.id).toBe('string');
      expect(res.body.question_count).toBeGreaterThanOrEqual(4);
      expect(res.body.expires_at).toBeTruthy();
      ids.packIds.push(res.body.id);
    });

    it('rejects body with invalid difficulty', async () => {
      const res = await request(app)
        .post('/v1/packs/generate')
        .set('authorization', `Bearer ${TEST_KEY}`)
        .send({ filters: { difficulty: 99 } });
      expect(res.status).toBe(400);
    });

    it('rejects body with limit > 100', async () => {
      const res = await request(app)
        .post('/v1/packs/generate')
        .set('authorization', `Bearer ${TEST_KEY}`)
        .send({ limit: 1000 });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /v1/packs/:id/export', () => {
    let packId: string;

    beforeAll(async () => {
      const res = await request(app)
        .post('/v1/packs/generate')
        .set('authorization', `Bearer ${TEST_KEY}`)
        .send({ name: 'Export Source', filters: { format: 'mcq' }, limit: 4 });
      packId = res.body.id;
      ids.packIds.push(packId);
    });

    it('returns 404 for unknown pack id', async () => {
      const res = await request(app)
        .get('/v1/packs/99999999-9999-9999-9999-999999999999/export')
        .set('authorization', `Bearer ${TEST_KEY}`);
      expect(res.status).toBe(404);
    });

    it('returns 400 for non-UUID pack id', async () => {
      const res = await request(app)
        .get('/v1/packs/not-a-uuid/export')
        .set('authorization', `Bearer ${TEST_KEY}`);
      expect(res.status).toBe(400);
    });

    it('exports JSON by default', async () => {
      const res = await request(app)
        .get(`/v1/packs/${packId}/export`)
        .set('authorization', `Bearer ${TEST_KEY}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/json');
      expect(res.headers['content-disposition']).toContain('Export_Source.json');
      expect(res.body.pack.id).toBe(packId);
      expect(Array.isArray(res.body.questions)).toBe(true);
      expect(res.body.questions.length).toBeGreaterThanOrEqual(1);
    });

    it('exports CSV with header row + one row per question', async () => {
      const res = await request(app)
        .get(`/v1/packs/${packId}/export?format=csv`)
        .set('authorization', `Bearer ${TEST_KEY}`)
        .buffer(true)
        .parse((r, cb) => {
          let data = '';
          r.setEncoding('utf8');
          r.on('data', (chunk: string) => (data += chunk));
          r.on('end', () => cb(null, data));
        });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('Export_Source.csv');
      const body = res.body as string;
      const lines = body.split('\r\n').filter((l) => l.length > 0);
      expect(lines[0]).toContain('uuid,sku,format');
      expect(lines.length).toBeGreaterThanOrEqual(2);
    });

    it('exports HackerRank YAML', async () => {
      const res = await request(app)
        .get(`/v1/packs/${packId}/export?format=hackerrank-yaml`)
        .set('authorization', `Bearer ${TEST_KEY}`)
        .buffer(true)
        .parse((r, cb) => {
          let data = '';
          r.setEncoding('utf8');
          r.on('data', (chunk: string) => (data += chunk));
          r.on('end', () => cb(null, data));
        });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/x-yaml');
      expect(res.headers['content-disposition']).toContain('Export_Source.yaml');
      const body = res.body as string;
      const docs = yaml.loadAll(body);
      expect(docs.length).toBeGreaterThanOrEqual(1);
    });

    it('cross-tenant request to a pack returns 404 (not 403)', async () => {
      // Create a second tenant + key, attempt to access pack from first tenant.
      const otherTenant = await pool.query<{ id: string }>(
        `INSERT INTO app.tenants (name, slug, type) VALUES ('Other', $1, 'internal') RETURNING id`,
        [`pack-other-${Date.now()}`],
      );
      const otherTenantId = otherTenant.rows[0]!.id;
      const otherKey = 'qor_live_9e2d7c4b1f8a3e5d6c9a2b1e4f7c8d3a';
      const otherHash = hashApiKey(otherKey, PEPPER);
      const otherApiKey = await pool.query<{ id: string }>(
        `INSERT INTO app.api_keys (tenant_id, name, prefix, hashed_key, scopes)
         VALUES ($1, 'other', 'qor_live', $2, ARRAY['read'])
         RETURNING id`,
        [otherTenantId, otherHash],
      );
      const otherKeyId = otherApiKey.rows[0]!.id;

      try {
        const res = await request(app)
          .get(`/v1/packs/${packId}/export`)
          .set('authorization', `Bearer ${otherKey}`);
        // 404 (not 403) so we don't leak existence of packs from other tenants.
        expect(res.status).toBe(404);
      } finally {
        await pool.query(`DELETE FROM app.api_keys WHERE id = $1`, [otherKeyId]);
        await pool.query(`DELETE FROM app.tenants WHERE id = $1`, [otherTenantId]);
      }
    });

    it('increments export_count on successful export', async () => {
      const before = await pool.query<{ export_count: number }>(
        `SELECT export_count FROM app.packs WHERE id = $1`,
        [packId],
      );
      const beforeCount = before.rows[0]!.export_count;

      await request(app)
        .get(`/v1/packs/${packId}/export?format=json`)
        .set('authorization', `Bearer ${TEST_KEY}`);

      // Allow async fire-and-forget update to settle.
      await new Promise((r) => setTimeout(r, 100));

      const after = await pool.query<{ export_count: number }>(
        `SELECT export_count FROM app.packs WHERE id = $1`,
        [packId],
      );
      expect(after.rows[0]!.export_count).toBeGreaterThan(beforeCount);
    });
  });
});
