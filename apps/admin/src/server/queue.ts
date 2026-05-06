/**
 * SME review queue queries — wraps the shared admin pg pool with typed
 * helpers used by route handlers and server actions.
 */
import type { Pool } from '@qorium/db';
import {
  isReviewDecision,
  nextStatusFor,
  type DecisionInput,
  type ReviewDecision,
} from './decisions';

export interface QueueRow {
  id: string;
  uuid: string;
  sku: string;
  format: string;
  bodyMd: string;
  skillId: string | null;
  subSkillId: string | null;
  status: string;
  authoredBy: string;
  language: string;
  createdAt: string;
}

export interface ListQueueOptions {
  limit?: number;
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

function clampLimit(limit: number | undefined): number {
  if (limit === undefined) return DEFAULT_LIMIT;
  if (!Number.isFinite(limit) || limit <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(limit), MAX_LIMIT);
}

interface QueueRawRow {
  id: string;
  uuid: string;
  sku: string;
  format: string;
  body_md: string;
  skill_id: string | null;
  sub_skill_id: string | null;
  status: string;
  authored_by: string;
  language: string;
  created_at: Date;
}

function rowToQueue(r: QueueRawRow): QueueRow {
  return {
    id: r.id,
    uuid: r.uuid,
    sku: r.sku,
    format: r.format,
    bodyMd: r.body_md,
    skillId: r.skill_id,
    subSkillId: r.sub_skill_id,
    status: r.status,
    authoredBy: r.authored_by,
    language: r.language,
    createdAt: r.created_at.toISOString(),
  };
}

export async function listReviewQueue(
  pool: Pool,
  opts: ListQueueOptions = {},
): Promise<QueueRow[]> {
  const limit = clampLimit(opts.limit);
  const result = await pool.query<QueueRawRow>(
    `SELECT id, uuid, sku, format, body_md, skill_id, sub_skill_id,
            status, authored_by, language, created_at
       FROM content.questions
      WHERE status = 'sme_review'
      ORDER BY created_at ASC
      LIMIT $1`,
    [limit],
  );
  return result.rows.map(rowToQueue);
}

export async function getReviewable(pool: Pool, id: string): Promise<QueueRow | null> {
  const result = await pool.query<QueueRawRow>(
    `SELECT id, uuid, sku, format, body_md, skill_id, sub_skill_id,
            status, authored_by, language, created_at
       FROM content.questions
      WHERE id = $1 AND status = 'sme_review'
      LIMIT 1`,
    [id],
  );
  return result.rows[0] ? rowToQueue(result.rows[0]) : null;
}

export interface RecordedDecision {
  decisionId: string;
  questionId: string;
  decision: ReviewDecision;
  priorStatus: string;
  nextStatus: string;
}

/**
 * Atomically records a decision row and transitions the question's status.
 * Returns null if the question isn't in `sme_review` (e.g. someone else
 * already moved it), so the UI can refresh and show the latest queue.
 */
export async function recordDecision(
  pool: Pool,
  questionId: string,
  input: DecisionInput,
): Promise<RecordedDecision | null> {
  if (!isReviewDecision(input.decision)) {
    throw new Error(`invalid decision: ${String(input.decision)}`);
  }
  const next = nextStatusFor(input.decision);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const lock = await client.query<{ status: string }>(
      `SELECT status FROM content.questions WHERE id = $1 FOR UPDATE`,
      [questionId],
    );
    const row = lock.rows[0];
    if (!row || row.status !== 'sme_review') {
      await client.query('ROLLBACK');
      return null;
    }

    const inserted = await client.query<{ id: string }>(
      `INSERT INTO content.review_decisions
         (question_id, reviewer_email, decision, notes, prior_status, next_status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [questionId, input.reviewerEmail, input.decision, input.notes ?? null, row.status, next],
    );

    const updateSql =
      next === 'deprecated'
        ? `UPDATE content.questions SET status = $1, deprecated_at = NOW(), updated_at = NOW() WHERE id = $2`
        : `UPDATE content.questions SET status = $1, updated_at = NOW() WHERE id = $2`;
    await client.query(updateSql, [next, questionId]);

    await client.query('COMMIT');

    const decisionId = inserted.rows[0]?.id;
    if (!decisionId) {
      throw new Error('failed to insert review decision');
    }
    return {
      decisionId,
      questionId,
      decision: input.decision,
      priorStatus: row.status,
      nextStatus: next,
    };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {
      /* swallow secondary error */
    });
    throw err;
  } finally {
    client.release();
  }
}
