import type { Pool } from '@qorium/db';
import type { LeakAlert, LeakSeverity, LeakStatus } from './policy.js';

interface AlertRow {
  id: string;
  question_id: string;
  source_url: string;
  source_type: string | null;
  detected_at: Date;
  similarity_score: string;
  severity: LeakSeverity;
  status: LeakStatus;
}

function rowToAlert(r: AlertRow): LeakAlert {
  return {
    id: r.id,
    questionId: r.question_id,
    severity: r.severity,
    similarityScore: Number(r.similarity_score),
    status: r.status,
    detectedAt: r.detected_at.toISOString(),
    sourceUrl: r.source_url,
    sourceType: r.source_type,
  };
}

/**
 * Fetch leak alerts that the rotation worker needs to consider this
 * tick. We pull only `detected` + `under_review` since terminal states
 * (`rotated`, `dismissed`, `false_positive`) are out of scope.
 */
export async function fetchPendingAlerts(
  pool: Pool,
  limit: number = 200,
): Promise<ReadonlyArray<LeakAlert>> {
  const result = await pool.query<AlertRow>(
    `SELECT id, question_id, source_url, source_type, detected_at,
            similarity_score, severity, status
       FROM content.leak_alerts
      WHERE status IN ('detected', 'under_review')
      ORDER BY detected_at ASC
      LIMIT $1`,
    [limit],
  );
  return result.rows.map(rowToAlert);
}

export interface RotationOutcome {
  alertId: string;
  questionId: string;
  rotatedAt: string;
}

/**
 * Atomically (a) flip `content.questions.status='leaked'` + set
 * `deprecated_at` and (b) flip `content.leak_alerts.status='rotated'`.
 * Wrapped in a single transaction so a partial failure can't leave the
 * question deprecated without the alert closed (or vice-versa).
 */
export async function rotateQuestion(pool: Pool, alert: LeakAlert): Promise<RotationOutcome> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const now = new Date();

    const qUpdate = await client.query<{ id: string }>(
      `UPDATE content.questions
          SET status = 'leaked',
              deprecated_at = $2,
              updated_at = $2
        WHERE id = $1
          AND status NOT IN ('leaked', 'deprecated')
        RETURNING id`,
      [alert.questionId, now],
    );

    await client.query(
      `UPDATE content.leak_alerts
          SET status = 'rotated',
              updated_at = $2
        WHERE id = $1`,
      [alert.id, now],
    );

    await client.query('COMMIT');
    return {
      alertId: alert.id,
      questionId: qUpdate.rows[0]?.id ?? alert.questionId,
      rotatedAt: now.toISOString(),
    };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}
