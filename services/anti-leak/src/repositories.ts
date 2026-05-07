import type { Pool } from '@qorium/db';
import type { DetectionEvidence, QuestionForScan } from './types.js';

/** Fetch released questions eligible for scanning. v0 simply takes the
 *  oldest-scanned items first, capped at `limit` per run, so scans rotate
 *  through the corpus over time. */
export async function fetchReleasedQuestions(
  pool: Pool,
  limit: number,
): Promise<QuestionForScan[]> {
  const result = await pool.query<QuestionForScan>(
    `SELECT id, body_md, status
       FROM content.questions
      WHERE status = 'released'
      ORDER BY released_at ASC NULLS LAST
      LIMIT $1`,
    [limit],
  );
  return result.rows;
}

/** Insert a leak alert into content.leak_alerts. Idempotency: a single
 *  (question_id, source_url) pair generates at most one row per scan
 *  run; the orchestrator dedupes upstream. */
export async function insertLeakAlert(
  pool: Pool,
  evidence: DetectionEvidence,
): Promise<{ id: string }> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO content.leak_alerts
       (question_id, source_url, source_type, similarity_score, severity,
        status, evidence_jsonb)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
     RETURNING id`,
    [
      evidence.question_id,
      evidence.match.url,
      evidence.match.source,
      evidence.classification.similarity,
      evidence.classification.severity,
      evidence.classification.autoRotate ? 'detected' : 'under_review',
      JSON.stringify({
        snippet: evidence.match.snippet,
        title: evidence.match.title,
        question_body_excerpt: evidence.question_body_excerpt,
        matched_ngrams: evidence.matched_ngrams,
        lexical: evidence.classification.lexical,
        scan_started_at: evidence.scan_started_at,
        scan_finished_at: evidence.scan_finished_at,
      }),
    ],
  );
  if (!result.rows[0]) {
    throw new Error('insertLeakAlert: no row returned');
  }
  return { id: result.rows[0].id };
}
