import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createPool, type Pool } from '@qorium/db';
import { getReviewable, listReviewQueue, recordDecision } from '../src/server/queue';

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.QORIUM_TEST_DATABASE_URL;
const skipReason = !DATABASE_URL
  ? 'Set DATABASE_URL or QORIUM_TEST_DATABASE_URL to run admin queue integration tests'
  : null;

const describeOrSkip = skipReason ? describe.skip : describe;

describeOrSkip('admin queue integration', () => {
  let pool: Pool;
  const seededIds: string[] = [];

  async function seedReviewableQuestion(label: string): Promise<string> {
    const result = await pool.query<{ id: string }>(
      `INSERT INTO content.questions
         (sku, format, body_md, body_json, status, authored_by, language)
       VALUES ('readybank', 'mcq', $1, '{}'::jsonb, 'sme_review', 'test-fixture', 'en')
       RETURNING id`,
      [label],
    );
    const id = result.rows[0]?.id;
    if (!id) throw new Error('seed failed');
    seededIds.push(id);
    return id;
  }

  beforeAll(() => {
    pool = createPool({ connectionString: DATABASE_URL as string, max: 2 });
  });

  beforeEach(async () => {
    if (seededIds.length > 0) {
      await pool.query(`DELETE FROM content.review_decisions WHERE question_id = ANY($1::uuid[])`, [
        seededIds,
      ]);
      await pool.query(`DELETE FROM content.questions WHERE id = ANY($1::uuid[])`, [seededIds]);
      seededIds.length = 0;
    }
  });

  afterAll(async () => {
    if (seededIds.length > 0) {
      await pool.query(`DELETE FROM content.review_decisions WHERE question_id = ANY($1::uuid[])`, [
        seededIds,
      ]);
      await pool.query(`DELETE FROM content.questions WHERE id = ANY($1::uuid[])`, [seededIds]);
    }
    await pool.end();
  });

  it('listReviewQueue returns only sme_review items, ordered by created_at ASC', async () => {
    const a = await seedReviewableQuestion('Q-A first');
    const b = await seedReviewableQuestion('Q-B second');

    const rows = await listReviewQueue(pool);
    const ids = rows.map((r) => r.id);
    expect(ids).toContain(a);
    expect(ids).toContain(b);
    expect(ids.indexOf(a)).toBeLessThan(ids.indexOf(b));
    for (const r of rows) expect(r.status).toBe('sme_review');
  });

  it('listReviewQueue clamps the limit', async () => {
    await seedReviewableQuestion('Q clamp test');
    const rows = await listReviewQueue(pool, { limit: 1 });
    expect(rows.length).toBeLessThanOrEqual(1);
  });

  it('getReviewable returns the question when in sme_review, null otherwise', async () => {
    const id = await seedReviewableQuestion('Q-detail');
    expect(await getReviewable(pool, id)).not.toBeNull();

    await pool.query(`UPDATE content.questions SET status = 'draft' WHERE id = $1`, [id]);
    expect(await getReviewable(pool, id)).toBeNull();
  });

  it('recordDecision accept transitions to calibrating and inserts a decision row', async () => {
    const id = await seedReviewableQuestion('Q-accept');
    const result = await recordDecision(pool, id, {
      decision: 'accept',
      reviewerEmail: 'sme@talpro.in',
    });
    expect(result).not.toBeNull();
    expect(result?.priorStatus).toBe('sme_review');
    expect(result?.nextStatus).toBe('calibrating');

    const status = await pool.query<{ status: string }>(
      `SELECT status FROM content.questions WHERE id = $1`,
      [id],
    );
    expect(status.rows[0]?.status).toBe('calibrating');

    const decisions = await pool.query<{ decision: string; reviewer_email: string }>(
      `SELECT decision, reviewer_email FROM content.review_decisions WHERE question_id = $1`,
      [id],
    );
    expect(decisions.rows).toHaveLength(1);
    expect(decisions.rows[0]).toEqual({ decision: 'accept', reviewer_email: 'sme@talpro.in' });
  });

  it('recordDecision edit transitions to draft and stores notes', async () => {
    const id = await seedReviewableQuestion('Q-edit');
    const result = await recordDecision(pool, id, {
      decision: 'edit',
      reviewerEmail: 'sme@talpro.in',
      notes: 'Tighten the stem; distractor B is too close to the key.',
    });
    expect(result?.nextStatus).toBe('draft');

    const decision = await pool.query<{ notes: string | null; next_status: string }>(
      `SELECT notes, next_status FROM content.review_decisions WHERE question_id = $1`,
      [id],
    );
    expect(decision.rows[0]?.notes).toMatch(/distractor B/);
    expect(decision.rows[0]?.next_status).toBe('draft');
  });

  it('recordDecision reject transitions to deprecated and stamps deprecated_at', async () => {
    const id = await seedReviewableQuestion('Q-reject');
    const result = await recordDecision(pool, id, {
      decision: 'reject',
      reviewerEmail: 'sme@talpro.in',
      notes: 'Ambiguous — multiple correct interpretations.',
    });
    expect(result?.nextStatus).toBe('deprecated');

    const row = await pool.query<{ status: string; deprecated_at: Date | null }>(
      `SELECT status, deprecated_at FROM content.questions WHERE id = $1`,
      [id],
    );
    expect(row.rows[0]?.status).toBe('deprecated');
    expect(row.rows[0]?.deprecated_at).not.toBeNull();
  });

  it('recordDecision returns null when the question is no longer in sme_review', async () => {
    const id = await seedReviewableQuestion('Q-stale');
    await pool.query(`UPDATE content.questions SET status = 'released' WHERE id = $1`, [id]);

    const result = await recordDecision(pool, id, {
      decision: 'accept',
      reviewerEmail: 'sme@talpro.in',
    });
    expect(result).toBeNull();

    const decisions = await pool.query(
      `SELECT id FROM content.review_decisions WHERE question_id = $1`,
      [id],
    );
    expect(decisions.rows).toHaveLength(0);
  });
});
