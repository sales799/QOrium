/**
 * `content.leak_alerts` writer. v0 keeps it minimal: insert the row with
 * (question_id, source_url, source_type, similarity_score, severity, status,
 * evidence_jsonb). Update / status-transition flows live in the rotation
 * pipeline (Sprint ≥1.5).
 *
 * De-duplication: the same (question_id, source_url) shouldn't produce a new
 * alert on every nightly crawl. v0 enforces this via an application-level
 * upsert-or-skip — a unique constraint can be added in a follow-up migration
 * once we've observed real production volume.
 */

import type { Pool } from '@qorium/db';
import type { AlertSeverity } from '../severity.js';
import type { SourceType } from '../sources/types.js';

export interface RecordAlertInput {
  questionId: string;
  sourceUrl: string;
  sourceType: SourceType;
  similarityScore: number;
  severity: AlertSeverity;
  status: 'detected' | 'under_review';
  evidence: {
    snippet: string;
    title?: string | undefined;
    cosineSimilarity: number;
    lexicalOverlap: number;
    matchedNgrams: string[];
    classifierReason: string;
  };
}

export interface RecordAlertOutcome {
  inserted: boolean;
  alertId: string | null;
}

export async function recordAlertIfNew(
  pool: Pool,
  input: RecordAlertInput,
): Promise<RecordAlertOutcome> {
  const dup = await pool.query<{ id: string }>(
    `SELECT id FROM content.leak_alerts WHERE question_id = $1 AND source_url = $2 LIMIT 1`,
    [input.questionId, input.sourceUrl],
  );
  if ((dup.rowCount ?? 0) > 0) {
    return { inserted: false, alertId: dup.rows[0]?.id ?? null };
  }

  const inserted = await pool.query<{ id: string }>(
    `INSERT INTO content.leak_alerts
       (question_id, source_url, source_type, similarity_score,
        severity, status, evidence_jsonb)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      input.questionId,
      input.sourceUrl,
      input.sourceType,
      Number(input.similarityScore.toFixed(3)),
      input.severity,
      input.status,
      JSON.stringify(input.evidence),
    ],
  );

  const id = inserted.rows[0]?.id ?? null;
  return { inserted: id !== null, alertId: id };
}
