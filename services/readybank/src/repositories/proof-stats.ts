// Read-only aggregate metrics backing the public Customer-Zero proof surface
// (N13 marketing proof engine). These are non-sensitive platform funnel counts
// — how much real assessing has happened on QOrium — with NO tenant breakdown,
// NO candidate PII, NO question content. They are exactly the numbers a public
// "proof" / case-study page wants to cite.
//
// Counts are platform-wide aggregates on purpose: a single public endpoint that
// leaks nothing about any individual tenant, candidate, or item.

import type { Pool } from '@qorium/db';

export interface ProofStats {
  /** Total assessments ever created across the platform. */
  assessments_created: number;
  /** Total candidate invitations issued. */
  candidates_invited: number;
  /** Total attempts started (assessments taken). */
  assessments_taken: number;
  /** Attempts that reached a graded state. */
  attempts_graded: number;
  /** Released, readybank-SKU questions available in the live bank. */
  questions_released: number;
  /** Questions with enough responses for IRT refit (calibration_n >= 30). */
  questions_calibrated: number;
  /** ISO timestamp the snapshot was computed. */
  generated_at: string;
}

/**
 * Compute the public proof funnel in a single round trip. Uses scalar
 * subqueries so one query returns every count. "Calibrated" mirrors the BR-4
 * IRT-refit threshold (calibration_n >= 30) rather than "any responses", so the
 * number is honest about psychometric defensibility.
 */
export async function getProofStats(pool: Pool): Promise<ProofStats> {
  const result = await pool.query<{
    assessments_created: string | null;
    candidates_invited: string | null;
    assessments_taken: string | null;
    attempts_graded: string | null;
    questions_released: string | null;
    questions_calibrated: string | null;
  }>(
    `SELECT
       (SELECT count(*) FROM content.assessments)                                AS assessments_created,
       (SELECT count(*) FROM content.invitations)                                AS candidates_invited,
       (SELECT count(*) FROM content.attempts)                                   AS assessments_taken,
       (SELECT count(*) FROM content.attempts WHERE status = 'graded')           AS attempts_graded,
       (SELECT count(*) FROM content.questions
          WHERE status = 'released' AND sku = 'readybank')                       AS questions_released,
       (SELECT count(*) FROM content.questions WHERE calibration_n >= 30)        AS questions_calibrated`,
  );
  const row = result.rows[0];
  const num = (v: string | null | undefined): number => (v != null ? Number(v) : 0);
  return {
    assessments_created: num(row?.assessments_created),
    candidates_invited: num(row?.candidates_invited),
    assessments_taken: num(row?.assessments_taken),
    attempts_graded: num(row?.attempts_graded),
    questions_released: num(row?.questions_released),
    questions_calibrated: num(row?.questions_calibrated),
    generated_at: new Date().toISOString(),
  };
}
