import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createPool, ping } from '../src/client.js';
import type { Pool } from '../src/client.js';

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.QORIUM_TEST_DATABASE_URL;
const skipReason = !DATABASE_URL
  ? 'Set DATABASE_URL or QORIUM_TEST_DATABASE_URL to run the migration smoke test'
  : null;

const describeOrSkip = skipReason ? describe.skip : describe;

describeOrSkip('migration smoke test', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = createPool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('reaches Postgres', async () => {
    expect(await ping(pool)).toBe(true);
  });

  it('has the three application schemas (app, content, audit)', async () => {
    const result = await pool.query<{ schema_name: string }>(
      "SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('app', 'content', 'audit') ORDER BY schema_name",
    );
    expect(result.rows.map((r) => r.schema_name)).toEqual(['app', 'audit', 'content']);
  });

  it('has the core tables in the app schema', async () => {
    const result = await pool.query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'app' ORDER BY table_name",
    );
    const tables = result.rows.map((r) => r.table_name);
    expect(tables).toEqual(
      expect.arrayContaining(['api_keys', 'tenant_users', 'tenants', 'users']),
    );
  });

  it('has the core tables in the content schema', async () => {
    const result = await pool.query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'content' ORDER BY table_name",
    );
    const tables = result.rows.map((r) => r.table_name);
    expect(tables).toEqual(
      expect.arrayContaining([
        'leak_alerts',
        'question_variants',
        'questions',
        'responses',
        'role_skills',
        'roles',
        'skills',
        'sub_skills',
      ]),
    );
  });

  it('has the audit.events table', async () => {
    const result = await pool.query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'audit' AND table_name = 'events'",
    );
    expect(result.rows).toHaveLength(1);
  });

  it('content.questions enforces the SKU check constraint', async () => {
    await expect(
      pool.query(
        "INSERT INTO content.questions (sku, format, body_md, body_json, authored_by) VALUES ('not-a-real-sku', 'mcq', 'x', '{}'::jsonb, 'test')",
      ),
    ).rejects.toThrow();
  });

  it('app.users role check rejects unknown role', async () => {
    await expect(
      pool.query(
        "INSERT INTO app.users (email, name, role) VALUES ('smoke@qorium.test', 'Smoke', 'not-a-role')",
      ),
    ).rejects.toThrow();
  });
});
