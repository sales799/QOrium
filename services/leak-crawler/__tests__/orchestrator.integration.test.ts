import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import pino from 'pino';
import { createPool, type Pool } from '@qorium/db';
import { runCrawl } from '../src/orchestrator';
import { listReleasedQuestions } from '../src/repositories/questions';
import { recordAlertIfNew } from '../src/repositories/alerts';
import { StubPoller } from '../src/sources/stub';

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.QORIUM_TEST_DATABASE_URL;
const skipReason = !DATABASE_URL
  ? 'Set DATABASE_URL or QORIUM_TEST_DATABASE_URL to run leak-crawler integration tests'
  : null;

const describeOrSkip = skipReason ? describe.skip : describe;

const silentLogger = pino({ level: 'silent' });

describeOrSkip('leak-crawler orchestrator integration', () => {
  let pool: Pool;
  const seededIds: string[] = [];

  async function seedReleasedQuestion(body: string): Promise<string> {
    const result = await pool.query<{ id: string }>(
      `INSERT INTO content.questions
         (sku, format, body_md, body_json, status, authored_by, language, released_at)
       VALUES ('readybank', 'coding', $1, '{}'::jsonb, 'released', 'test-fixture', 'en', NOW())
       RETURNING id`,
      [body],
    );
    const id = result.rows[0]?.id;
    if (!id) throw new Error('seed failed');
    seededIds.push(id);
    return id;
  }

  async function cleanupSeeded(): Promise<void> {
    if (seededIds.length === 0) return;
    await pool.query(`DELETE FROM content.leak_alerts WHERE question_id = ANY($1::uuid[])`, [
      seededIds,
    ]);
    await pool.query(`DELETE FROM content.questions WHERE id = ANY($1::uuid[])`, [seededIds]);
    seededIds.length = 0;
  }

  beforeAll(() => {
    pool = createPool({ connectionString: DATABASE_URL as string, max: 2 });
  });

  beforeEach(async () => {
    await cleanupSeeded();
  });

  afterAll(async () => {
    await cleanupSeeded();
    await pool.end();
  });

  it('end-to-end: stub poller returning a near-duplicate snippet creates a leak alert', async () => {
    const id = await seedReleasedQuestion(
      'Reverse a singly linked list iteratively without recursion. Return the new head pointer in O(n) time and O(1) extra space.',
    );

    const poller = new StubPoller({}, [
      {
        sourceUrl: 'https://leetcode-discuss.example.com/q/206',
        sourceType: 'leetcode-discuss',
        snippet:
          'Reverse a singly linked list iteratively without recursion. Return new head pointer.',
      },
    ]);

    const report = await runCrawl({
      listQuestions: () => listReleasedQuestions(pool, { limit: 100 }),
      recordAlert: (input) => recordAlertIfNew(pool, input),
      pollers: [poller],
      logger: silentLogger,
      ngramsPerQuestion: 1,
      resultsPerQuery: 1,
    });

    expect(report.alertsCreated).toBeGreaterThanOrEqual(1);

    const row = await pool.query<{ severity: string; status: string }>(
      `SELECT severity, status FROM content.leak_alerts WHERE question_id = $1`,
      [id],
    );
    expect(row.rows).toHaveLength(1);
    expect(['low', 'medium', 'high', 'critical']).toContain(row.rows[0]?.severity);
  });

  it('does not duplicate alerts on a second pass for the same (question, source_url)', async () => {
    const id = await seedReleasedQuestion(
      'Compute a prefix sum of a numeric array of length n in O(n) time using a single scan.',
    );

    const poller = new StubPoller({}, [
      {
        sourceUrl: 'https://example.com/prefix',
        sourceType: 'serper',
        snippet:
          'Compute a prefix sum of a numeric array of length n in O(n) time using a single scan.',
      },
    ]);

    const r1 = await runCrawl({
      listQuestions: () => listReleasedQuestions(pool, { limit: 100 }),
      recordAlert: (input) => recordAlertIfNew(pool, input),
      pollers: [poller],
      logger: silentLogger,
      ngramsPerQuestion: 1,
      resultsPerQuery: 1,
    });

    const r2 = await runCrawl({
      listQuestions: () => listReleasedQuestions(pool, { limit: 100 }),
      recordAlert: (input) => recordAlertIfNew(pool, input),
      pollers: [poller],
      logger: silentLogger,
      ngramsPerQuestion: 1,
      resultsPerQuery: 1,
    });

    expect(r1.alertsCreated).toBeGreaterThanOrEqual(1);
    expect(r2.alertsCreated).toBe(0);
    expect(r2.alertsSkippedDuplicate).toBeGreaterThanOrEqual(1);

    const rows = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM content.leak_alerts WHERE question_id = $1`,
      [id],
    );
    expect(rows.rows[0]?.count).toBe('1');
  });
});
