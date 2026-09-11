import { randomUUID } from 'node:crypto';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { createPool, type Pool } from '@qorium/db';
import { getQuestionByUuid, searchQuestions } from '../src/repositories/questions.js';
import { streamPackQuestions, type PackRow } from '../src/repositories/packs.js';

const url = process.env.QORIUM_VAULT_TEST_DATABASE_URL;
describe.skipIf(!url)('private questions excluded from shared delivery (PostgreSQL)', () => {
  let admin: Pool;
  let pool: Pool;
  let created = false;
  const database = `qorium_vault_${randomUUID().replaceAll('-', '')}`;
  const shared = randomUUID();
  const privateId = randomUUID();
  const otherPrivate = randomUUID();
  beforeAll(async () => {
    admin = createPool({ connectionString: url!, max: 1 });
    await admin.query(`CREATE DATABASE ${database}`);
    created = true;
    const target = new URL(url!);
    target.pathname = `/${database}`;
    pool = createPool({ connectionString: target.toString(), max: 2 });
    await pool.query(`CREATE SCHEMA content;
      CREATE TABLE content.questions(id uuid, sku text, format text, language text, status text,
        skill_id uuid, sub_skill_id uuid, body_md text, body_json jsonb, rubric_json jsonb,
        reference_solution jsonb, test_cases jsonb, difficulty_b numeric, discrimination_a numeric,
        empirical_pass_rate numeric, released_at timestamptz, created_at timestamptz, stack_vault_tenant_id uuid)`);
    for (const [id, tenant] of [
      [shared, null],
      [privateId, randomUUID()],
      [otherPrivate, randomUUID()],
    ]) {
      await pool.query(
        `INSERT INTO content.questions(id,sku,format,language,status,body_md,body_json,
        released_at,created_at,stack_vault_tenant_id)
        VALUES ($1,'readybank','mcq','en','released','synthetic body','{}',now(),now(),$2)`,
        [id, tenant],
      );
    }
  });
  afterAll(async () => {
    if (pool) await pool.end();
    if (admin) {
      if (created) await admin.query(`DROP DATABASE ${database} WITH (FORCE)`);
      await admin.end();
    }
  });
  it('keeps shared retrieval working while hiding both tenant-tagged rows', async () => {
    expect((await getQuestionByUuid(pool, shared))?.uuid).toBe(shared);
    expect(await getQuestionByUuid(pool, privateId)).toBeNull();
    expect(await getQuestionByUuid(pool, otherPrivate)).toBeNull();
  });
  it('excludes private rows from shared search even when product label is stale', async () => {
    expect((await searchQuestions(pool, {})).questions.map((q) => q.uuid)).toEqual([shared]);
  });
  it('rechecks privacy at export time for already captured pack IDs', async () => {
    const pack = { question_ids: [privateId, shared, otherPrivate] } as PackRow;
    const rows = [];
    for await (const row of streamPackQuestions(pool, pack)) rows.push(row.uuid);
    expect(rows).toEqual([shared]);
  });
});
