// Read-only repository backing the public Proof-of-Skill verification endpoint.
//
// Returns ONLY what a third party may see about a *graded* attempt: the issuer
// (tenant) name, the assessment title, the achieved score band, pass/fail, and
// the grading date. No candidate PII, no question content, no answer keys, no
// per-response detail — the public proof is intentionally minimal.

import type { Pool } from '@qorium/db';

export interface ProofRecord {
  attempt_id: string;
  issuer: string;
  assessment_title: string;
  total_score: number | null;
  max_score: number | null;
  pass_score: number;
  graded_at: string | null;
}

/**
 * Fetch the public proof record for a graded attempt. Returns null when the
 * attempt does not exist or is not yet in a graded state — callers should map
 * null to 404 so unverifiable codes leak nothing.
 *
 * Tenant name is LEFT JOINed and COALESCEd so a missing/renamed tenants table
 * degrades to the brand name rather than throwing (defence-in-depth, mirrors
 * the N7 skill-families 42P01 fallback philosophy).
 */
export async function getProofRecord(pool: Pool, attemptId: string): Promise<ProofRecord | null> {
  const result = await pool.query<{
    attempt_id: string;
    issuer: string;
    assessment_title: string;
    total_score: string | null;
    max_score: string | null;
    pass_score: string | null;
    graded_at: Date | null;
  }>(
    `SELECT at.id::text                       AS attempt_id,
            COALESCE(t.name, 'QOrium')        AS issuer,
            a.title                           AS assessment_title,
            at.total_score                    AS total_score,
            at.max_score                      AS max_score,
            a.pass_score                      AS pass_score,
            at.graded_at                      AS graded_at
       FROM content.attempts at
       JOIN content.assessments a ON a.id = at.assessment_id
       LEFT JOIN app.tenants t    ON t.id = at.tenant_id
      WHERE at.id = $1 AND at.status = 'graded'`,
    [attemptId],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    attempt_id: row.attempt_id,
    issuer: row.issuer,
    assessment_title: row.assessment_title,
    total_score: row.total_score !== null ? Number(row.total_score) : null,
    max_score: row.max_score !== null ? Number(row.max_score) : null,
    pass_score: row.pass_score !== null ? Number(row.pass_score) : 0.6,
    graded_at: row.graded_at ? row.graded_at.toISOString() : null,
  };
}
