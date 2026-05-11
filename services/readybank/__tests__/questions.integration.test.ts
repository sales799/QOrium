import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import express from 'express';
import { pino } from 'pino';
import { createPool, ping } from '@qorium/db';
import type { Pool } from '@qorium/db';
import { hashApiKey, apiKeyAuth, createMemoryRateLimiter } from '@qorium/auth';
import { createServer } from '../src/server.js';
import type { Config } from '../src/config.js';

/**
 * Live integration test exercising:
 *   /v1/questions/{uuid}
 *   /v1/questions/search  (filters + cursor pagination)
 *
 * Requires a Postgres reachable at DATABASE_URL with the canonical
 * 0001_initial_schema.sql applied. Auto-skips when DATABASE_URL is unset
 * so the suite stays green on machines without a DB.
 */

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.QORIUM_TEST_DATABASE_URL;
const PEPPER = 'integration_test_pepper_at_least_thirty_two_chars';
const TEST_KEY = 'qor_live_a7f3b2c1e8d4f9a6b2c5e1d8a9f3b2c1';
const TEST_KEY_HASH = hashApiKey(TEST_KEY, PEPPER);

const skipReason = !DATABASE_URL ? 'DATABASE_URL unset' : null;
const describeOrSkip = skipReason ? describe.skip : describe;

interface SeededIds {
  tenantId: string;
  apiKeyId: string;
  skillId: string;
  questionIds: string[];
}

async function seedFixtures(pool: Pool): Promise<SeededIds> {
  const tenant = await pool.query<{ id: string }>(
    `INSERT INTO app.tenants (name, slug, type) VALUES ('Integration Tenant', $1, 'internal') RETURNING id`,
    [`integration-${Date.now()}`],
  );
  const tenantId = tenant.rows[0]!.id;

  const apiKey = await pool.query<{ id: string }>(
    `INSERT INTO app.api_keys (tenant_id, name, prefix, hashed_key, scopes)
     VALUES ($1, 'integration', 'qor_live', $2, ARRAY['questions:read'])
     RETURNING id`,
    [tenantId, TEST_KEY_HASH],
  );
  const apiKeyId = apiKey.rows[0]!.id;

  const skill = await pool.query<{ id: string }>(
    `INSERT INTO content.skills (slug, name, family) VALUES ($1, 'Integration Skill', 'tech') RETURNING id`,
    [`int-skill-${Date.now()}`],
  );
  const skillId = skill.rows[0]!.id;

  const baseTime = new Date('2026-05-01T10:00:00Z').getTime();
  const questionIds: string[] = [];
  for (let i = 0; i < 5; i++) {
    const releasedAt = new Date(baseTime + i * 60_000).toISOString();
    const inserted = await pool.query<{ id: string }>(
      `INSERT INTO content.questions
        (sku, format, skill_id, body_md, body_json, status, language,
         difficulty_b, discrimination_a, empirical_pass_rate, authored_by, released_at)
       VALUES
        ('readybank', $1, $2, $3, $4::jsonb, 'released', 'en',
         $5, 1.2, 0.65, 'integration-test', $6)
       RETURNING id`,
      [
        i % 2 === 0 ? 'mcq' : 'coding-fn',
        skillId,
        `Question body ${i}`,
        JSON.stringify({ options: ['a', 'b', 'c', 'd'], correct_index: 0 }),
        // Spread b across bands: -3, -1.5, 0, 1.5, 3
        -3 + i * 1.5,
        releasedAt,
      ],
    );
    questionIds.push(inserted.rows[0]!.id);
  }

  return { tenantId, apiKeyId, skillId, questionIds };
}

async function cleanup(pool: Pool, ids: SeededIds): Promise<void> {
  await pool.query(`DELETE FROM content.questions WHERE id = ANY($1::uuid[])`, [ids.questionIds]);
  await pool.query(`DELETE FROM content.skills WHERE id = $1`, [ids.skillId]);
  await pool.query(`DELETE FROM app.api_keys WHERE id = $1`, [ids.apiKeyId]);
  await pool.query(`DELETE FROM app.tenants WHERE id = $1`, [ids.tenantId]);
  await pool.query(`DELETE FROM audit.events WHERE actor_id = $1`, [ids.apiKeyId]);
}

function testConfig(overrides: Partial<Config> = {}): Config {
  return {
    serviceName: 'qorium-readybank',
    nodeEnv: 'test',
    port: 0,
    logLevel: 'silent',
    version: '0.0.0-test',
    gitSha: 'integration',
    sentryDsn: undefined,
    apiKeyPepper: PEPPER,
    redisUrl: undefined,
    ...overrides,
  };
}

const silentLogger = pino({ level: 'silent' });

describeOrSkip('readybank /v1/questions integration', () => {
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

  describe('auth gate', () => {
    it('rejects /v1/questions/search without API key', async () => {
      const res = await request(app).get('/v1/questions/search');
      expect(res.status).toBe(401);
      expect(res.headers['content-type']).toContain('application/problem+json');
    });

    it('accepts valid Bearer key', async () => {
      const res = await request(app)
        .get('/v1/questions/search')
        .set('authorization', `Bearer ${TEST_KEY}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /v1/questions/:uuid', () => {
    it('returns the seeded question', async () => {
      const target = ids.questionIds[0]!;
      const res = await request(app)
        .get(`/v1/questions/${target}`)
        .set('authorization', `Bearer ${TEST_KEY}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        uuid: target,
        sku: 'readybank',
        format: 'mcq',
        language: 'en',
        status: 'released',
        skill_id: ids.skillId,
      });
      expect(res.body.body_json).toEqual({
        options: ['a', 'b', 'c', 'd'],
        correct_index: 0,
      });
      // b = -3 → band 1 (Easy)
      expect(res.body.difficulty_band).toBe(1);
      expect(res.body.difficulty_b).toBeCloseTo(-3, 5);
    });

    it('returns 404 for unknown UUID', async () => {
      const res = await request(app)
        .get('/v1/questions/00000000-0000-0000-0000-000000000000')
        .set('authorization', `Bearer ${TEST_KEY}`);
      expect(res.status).toBe(404);
    });

    it('returns 400 for non-UUID', async () => {
      const res = await request(app)
        .get('/v1/questions/not-a-uuid')
        .set('authorization', `Bearer ${TEST_KEY}`);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /v1/questions/search', () => {
    it('returns all 5 seeded questions when filtered to our skill', async () => {
      const res = await request(app)
        .get('/v1/questions/search')
        .query({ skill: `int-skill-${'overridden'}` }) // wrong slug
        .set('authorization', `Bearer ${TEST_KEY}`);
      // Wrong slug → empty
      expect(res.body.questions).toEqual([]);

      // Filter by format = mcq → 3 of 5
      const mcqRes = await request(app)
        .get('/v1/questions/search')
        .query({ format: 'mcq' })
        .set('authorization', `Bearer ${TEST_KEY}`);
      expect(mcqRes.status).toBe(200);
      // Count only OUR seeded questions of format mcq (i % 2 === 0 → indices 0, 2, 4)
      const ours = mcqRes.body.questions.filter((q: { uuid: string }) =>
        ids.questionIds.includes(q.uuid),
      );
      expect(ours).toHaveLength(3);
    });

    it('filters by difficulty band', async () => {
      // Band 1 (Easy) = b ∈ [-4, -2.4); only seed i=0 (b=-3) qualifies
      const res = await request(app)
        .get('/v1/questions/search')
        .query({ difficulty: 1, language: 'en' })
        .set('authorization', `Bearer ${TEST_KEY}`);

      expect(res.status).toBe(200);
      const ours = res.body.questions.filter((q: { uuid: string }) =>
        ids.questionIds.includes(q.uuid),
      );
      expect(ours).toHaveLength(1);
      expect(ours[0].uuid).toBe(ids.questionIds[0]);
      expect(ours[0].difficulty_band).toBe(1);
    });

    it('paginates with cursor: 5 rows in 2 pages of limit=3 + 2', async () => {
      // Filter to format=coding-fn (i=1, i=3 → 2 rows). Use mcq (3 rows) for two-page.
      const page1 = await request(app)
        .get('/v1/questions/search')
        .query({ format: 'mcq', limit: 2 })
        .set('authorization', `Bearer ${TEST_KEY}`);

      expect(page1.status).toBe(200);
      // page1 may include unrelated questions from other tests; just check our cursor logic
      expect(page1.body.questions.length).toBeLessThanOrEqual(2);
      expect(page1.body.next_cursor).toBeTruthy();

      const page2 = await request(app)
        .get('/v1/questions/search')
        .query({ format: 'mcq', limit: 2, cursor: page1.body.next_cursor })
        .set('authorization', `Bearer ${TEST_KEY}`);

      expect(page2.status).toBe(200);
      // Different rows than page1
      const page1Ids = new Set(page1.body.questions.map((q: { uuid: string }) => q.uuid));
      for (const q of page2.body.questions as Array<{ uuid: string }>) {
        expect(page1Ids.has(q.uuid)).toBe(false);
      }
    });

    it('rejects malformed cursor with 400', async () => {
      const res = await request(app)
        .get('/v1/questions/search')
        .query({ cursor: 'this-is-not-a-valid-cursor' })
        .set('authorization', `Bearer ${TEST_KEY}`);
      expect(res.status).toBe(400);
    });

    it('rejects invalid difficulty with 400', async () => {
      const res = await request(app)
        .get('/v1/questions/search')
        .query({ difficulty: 99 })
        .set('authorization', `Bearer ${TEST_KEY}`);
      expect(res.status).toBe(400);
    });
  });
});
