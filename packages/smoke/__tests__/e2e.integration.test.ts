import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createPool, type Pool } from '@qorium/db';
import { exerciseImportGraph } from '../src/import-graph';

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.QORIUM_TEST_DATABASE_URL;
const skipReason = !DATABASE_URL
  ? 'Set DATABASE_URL or QORIUM_TEST_DATABASE_URL to run smoke e2e'
  : null;

const describeOrSkip = skipReason ? describe.skip : describe;

describeOrSkip('smoke e2e — Phase 1 cross-service integration', () => {
  let pool: Pool;
  const seededIds: string[] = [];

  beforeAll(() => {
    pool = createPool({ connectionString: DATABASE_URL as string, max: 2 });
  });

  afterAll(async () => {
    if (seededIds.length > 0) {
      await pool.query(`DELETE FROM content.responses WHERE question_id = ANY($1::uuid[])`, [
        seededIds,
      ]);
      await pool.query(`DELETE FROM content.review_decisions WHERE question_id = ANY($1::uuid[])`, [
        seededIds,
      ]);
      await pool.query(
        `DELETE FROM content.calibration_history WHERE question_id = ANY($1::uuid[])`,
        [seededIds],
      );
      await pool.query(`DELETE FROM content.questions WHERE id = ANY($1::uuid[])`, [seededIds]);
    }
    await pool.end();
  });

  it('all required tables exist for the Phase 1 service stack', async () => {
    const r = await pool.query<{ schema_name: string; table_name: string }>(
      `SELECT table_schema AS schema_name, table_name
         FROM information_schema.tables
        WHERE table_schema IN ('app', 'content', 'audit')
        ORDER BY table_schema, table_name`,
    );
    const seen = new Set(r.rows.map((row) => `${row.schema_name}.${row.table_name}`));
    for (const required of [
      'app.tenants',
      'app.api_keys',
      'content.questions',
      'content.responses',
      'content.leak_alerts',
      'content.review_decisions',
      'content.calibration_history',
      'content.testforge_runs',
      'audit.events',
    ]) {
      expect(seen.has(required)).toBe(true);
    }
  });

  it('content.questions accepts the migration 0005 sandbox_config payload', async () => {
    const sandbox = {
      language: 'python3',
      memory_mb: 256,
      time_ms: 3_000,
      test_cases: [
        { index: 0, input: '5 3', expected_output_pattern: '^8$', weight: 1, public: true },
      ],
    };
    const result = await pool.query<{ id: string }>(
      `INSERT INTO content.questions (sku, format, body_md, body_json, authored_by, sandbox_config, testforge_status)
         VALUES ('readybank', 'coding', $1, '{}'::jsonb, 'test-fixture', $2::jsonb, 'sme_review')
         RETURNING id`,
      ['Reverse a singly linked list iteratively', JSON.stringify(sandbox)],
    );
    const id = result.rows[0]?.id;
    expect(id).toBeDefined();
    if (id) seededIds.push(id);
  });

  it('content.testforge_runs accepts the orchestrator_pass type', async () => {
    const r = await pool.query<{ id: string }>(
      `INSERT INTO content.testforge_runs (run_type, status)
         VALUES ('orchestrator_pass', 'completed')
         RETURNING id`,
    );
    const runId = r.rows[0]?.id;
    expect(runId).toBeDefined();
    if (runId) {
      await pool.query(`DELETE FROM content.testforge_runs WHERE id = $1`, [runId]);
    }
  });

  it('cross-workspace public APIs all exercise without throwing', () => {
    const graph = exerciseImportGraph();
    for (const g of graph) {
      expect(g.ok, `${g.workspace}::${g.symbol} → ${g.details ?? ''}`).toBe(true);
    }
  });
});
