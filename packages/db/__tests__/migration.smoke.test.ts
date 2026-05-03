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
        'calibration_history',
        'leak_alerts',
        'question_variants',
        'questions',
        'responses',
        'review_decisions',
        'role_skills',
        'roles',
        'skills',
        'sub_skills',
      ]),
    );
  });

  it('content.calibration_history enforces the flag CHECK constraint', async () => {
    await expect(
      pool.query(
        `INSERT INTO content.calibration_history
           (run_id, question_id, n_responses, converged, flag)
         VALUES (gen_random_uuid(), gen_random_uuid(), 30, true, 'definitely-not-a-flag')`,
      ),
    ).rejects.toThrow();
  });

  it('migration 0005 added sandbox_config and execution_metadata columns', async () => {
    const cols = await pool.query<{ table_name: string; column_name: string }>(
      `SELECT table_name, column_name
         FROM information_schema.columns
        WHERE table_schema = 'content'
          AND ((table_name = 'questions' AND column_name = 'sandbox_config')
            OR (table_name = 'responses' AND column_name = 'execution_metadata'))`,
    );
    const seen = cols.rows.map((r) => `${r.table_name}.${r.column_name}`);
    expect(seen).toEqual(
      expect.arrayContaining(['questions.sandbox_config', 'responses.execution_metadata']),
    );
  });

  it('content.review_decisions enforces the decision CHECK constraint', async () => {
    await expect(
      pool.query(
        `INSERT INTO content.review_decisions (question_id, reviewer_email, decision, prior_status, next_status)
         VALUES (gen_random_uuid(), 'sme@qorium.test', 'maybe', 'sme_review', 'calibrating')`,
      ),
    ).rejects.toThrow();
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

  it('migration 0007 added jd_forge_orders + jd_forge_source_id', async () => {
    const ordersExists = await pool.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'app' AND table_name = 'jd_forge_orders'`,
    );
    expect(ordersExists.rows).toHaveLength(1);

    const lineageCol = await pool.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'content' AND table_name = 'questions'
          AND column_name = 'jd_forge_source_id'`,
    );
    expect(lineageCol.rows).toHaveLength(1);

    await expect(
      pool.query(
        `INSERT INTO app.jd_forge_orders (tenant_id, tier, jd_text, jd_hash, status)
           VALUES (gen_random_uuid(), 'gold-tier', 'jd', 'h', 'pending')`,
      ),
    ).rejects.toThrow();
  });

  it('migration 0008 added stack_vaults + stack_vault_access_log', async () => {
    const tables = await pool.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'app'
          AND table_name IN ('stack_vaults', 'stack_vault_access_log')
        ORDER BY table_name`,
    );
    expect(tables.rows.map((r) => r.table_name)).toEqual([
      'stack_vault_access_log',
      'stack_vaults',
    ]);

    await expect(
      pool.query(
        `INSERT INTO app.stack_vaults (tenant_id, tier, library_size, watermark_secret, status)
           VALUES (gen_random_uuid(), 'platinum', 100, 'secret', 'active')`,
      ),
    ).rejects.toThrow();
  });

  it('migration 0009 added ats_integrations + webhook_log + candidate_links', async () => {
    const tables = await pool.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'app'
          AND table_name IN ('ats_integrations', 'ats_webhook_log', 'ats_candidate_links')
        ORDER BY table_name`,
    );
    expect(tables.rows.map((r) => r.table_name)).toEqual([
      'ats_candidate_links',
      'ats_integrations',
      'ats_webhook_log',
    ]);

    await expect(
      pool.query(
        `INSERT INTO app.ats_integrations (tenant_id, ats_platform, status)
           VALUES (gen_random_uuid(), 'taleo', 'active')`,
      ),
    ).rejects.toThrow();
  });

  it('migration 0006 added testforge_status + testforge_runs', async () => {
    const cols = await pool.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'content' AND table_name = 'questions'
          AND column_name IN ('testforge_status', 'testforge_last_check', 'testforge_audit')`,
    );
    expect(cols.rows.map((r) => r.column_name).sort()).toEqual([
      'testforge_audit',
      'testforge_last_check',
      'testforge_status',
    ]);

    const tables = await pool.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'content' AND table_name = 'testforge_runs'`,
    );
    expect(tables.rows).toHaveLength(1);

    await expect(
      pool.query(
        `INSERT INTO content.testforge_runs (run_type, status)
           VALUES ('not-a-real-type', 'running')`,
      ),
    ).rejects.toThrow();
  });

  it('migration 0010 added webhooks + sso schemas + audit.events.tenant_id', async () => {
    const schemas = await pool.query<{ schema_name: string }>(
      "SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('webhooks', 'sso') ORDER BY schema_name",
    );
    expect(schemas.rows.map((r) => r.schema_name)).toEqual(['sso', 'webhooks']);

    const tables = await pool.query<{ table_schema: string; table_name: string }>(
      `SELECT table_schema, table_name FROM information_schema.tables
        WHERE table_schema IN ('webhooks', 'sso')
        ORDER BY table_schema, table_name`,
    );
    expect(tables.rows.map((r) => `${r.table_schema}.${r.table_name}`)).toEqual([
      'sso.configurations',
      'webhooks.deliveries',
      'webhooks.events',
      'webhooks.subscriptions',
    ]);

    const tenantCol = await pool.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'audit' AND table_name = 'events' AND column_name = 'tenant_id'`,
    );
    expect(tenantCol.rows).toHaveLength(1);

    await expect(
      pool.query(
        `INSERT INTO webhooks.deliveries (event_id, subscription_id, status)
           VALUES (gen_random_uuid(), gen_random_uuid(), 'not-a-status')`,
      ),
    ).rejects.toThrow();

    await expect(
      pool.query(
        `INSERT INTO sso.configurations (tenant_id, protocol)
           VALUES (gen_random_uuid(), 'kerberos')`,
      ),
    ).rejects.toThrow();
  });
});
