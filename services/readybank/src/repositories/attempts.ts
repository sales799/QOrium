import type { Pool } from '@qorium/db';

// BR-3 persistence for the candidate attempt loop:
//   invitation (token) -> attempt -> answers -> grade -> result.
// Reuses content.{invitations,assessments,assessment_questions,attempts,
// responses,grade_decisions} (migrations 0021 + 0019).

export interface InvitationWithAssessment {
  id: string;
  assessment_id: string;
  tenant_id: string;
  candidate_email: string;
  candidate_name: string | null;
  token: string;
  status: string;
  expires_at: Date;
  assessment_title: string;
  total_questions: number;
  time_limit_sec: number;
  pass_score: string;
  assessment_status: string;
}

export async function getInvitationByToken(
  pool: Pool,
  token: string,
): Promise<InvitationWithAssessment | null> {
  const r = await pool.query<InvitationWithAssessment>(
    `SELECT i.id::text, i.assessment_id::text, i.tenant_id::text, i.candidate_email,
            i.candidate_name, i.token, i.status, i.expires_at,
            a.title AS assessment_title, a.total_questions, a.time_limit_sec,
            a.pass_score, a.status AS assessment_status
       FROM content.invitations i
       JOIN content.assessments a ON a.id = i.assessment_id
      WHERE i.token = $1`,
    [token],
  );
  return r.rows[0] ?? null;
}

export interface AttemptRow {
  id: string;
  invitation_id: string;
  assessment_id: string;
  tenant_id: string;
  candidate_id: string;
  status: string;
  question_order: string[];
  current_idx: number;
  total_score: string | null;
  max_score: string | null;
  started_at: Date;
  submitted_at: Date | null;
  graded_at: Date | null;
}

function selectAttempt(prefix: string): string {
  const p = prefix ? `${prefix}.` : '';
  return `${p}id::text AS id, ${p}invitation_id::text AS invitation_id,
    ${p}assessment_id::text AS assessment_id, ${p}tenant_id::text AS tenant_id,
    ${p}candidate_id, ${p}status, ${p}question_order::text[] AS question_order,
    ${p}current_idx, ${p}total_score, ${p}max_score, ${p}started_at,
    ${p}submitted_at, ${p}graded_at`;
}

export async function getAttempt(pool: Pool, attemptId: string): Promise<AttemptRow | null> {
  const r = await pool.query<AttemptRow>(
    `SELECT ${selectAttempt('')} FROM content.attempts WHERE id = $1`,
    [attemptId],
  );
  return r.rows[0] ?? null;
}

/** Authorize a candidate request: the attempt must belong to the invitation token. */
export async function getAttemptForToken(
  pool: Pool,
  attemptId: string,
  token: string,
): Promise<AttemptRow | null> {
  const r = await pool.query<AttemptRow>(
    `SELECT ${selectAttempt('a')}
       FROM content.attempts a
       JOIN content.invitations i ON i.id = a.invitation_id
      WHERE a.id = $1 AND i.token = $2`,
    [attemptId, token],
  );
  return r.rows[0] ?? null;
}

export async function createOrResumeAttempt(
  pool: Pool,
  inv: InvitationWithAssessment,
): Promise<AttemptRow> {
  const existing = await pool.query<AttemptRow>(
    `SELECT ${selectAttempt('')} FROM content.attempts
      WHERE invitation_id = $1 ORDER BY started_at DESC LIMIT 1`,
    [inv.id],
  );
  if (existing.rows[0]) return existing.rows[0];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const order = await client.query<{ question_id: string }>(
      `SELECT question_id::text FROM content.assessment_questions
        WHERE assessment_id = $1 ORDER BY position`,
      [inv.assessment_id],
    );
    const qids = order.rows.map((row) => row.question_id);
    const candidateId = `cand_${inv.id}`;
    const ins = await client.query<AttemptRow>(
      `INSERT INTO content.attempts
         (invitation_id, assessment_id, tenant_id, candidate_id, question_order)
       VALUES ($1, $2, $3, $4, $5::uuid[])
       RETURNING ${selectAttempt('')}`,
      [inv.id, inv.assessment_id, inv.tenant_id, candidateId, qids],
    );
    await client.query(
      `UPDATE content.invitations SET status = 'in_progress'
        WHERE id = $1 AND status IN ('pending', 'opened')`,
      [inv.id],
    );
    await client.query('COMMIT');
    return ins.rows[0]!;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export interface CandidateQuestion {
  id: string;
  format: string;
  skill_id: string | null;
  language: string | null;
  body_md: string | null;
  body_json: unknown;
}

/**
 * Load ONLY candidate-safe columns. The secret columns (answer_key,
 * rubric_json, reference_solution, test_cases, sandbox_config) are never
 * selected for candidate-facing reads. See sanitizeQuestion().
 */
export async function getCandidateQuestion(
  pool: Pool,
  questionId: string,
): Promise<CandidateQuestion | null> {
  const r = await pool.query<CandidateQuestion>(
    `SELECT id::text, format, skill_id::text, language, body_md, body_json
       FROM content.questions WHERE id = $1`,
    [questionId],
  );
  return r.rows[0] ?? null;
}

export interface UpsertAnswerInput {
  attemptId: string;
  tenantId: string;
  candidateId: string;
  questionId: string;
  responseBody: Record<string, unknown>;
  timeTakenMs?: number | null;
  integrityEvents?: Record<string, unknown>;
  currentIdx?: number;
}

/** One stored response per (attempt, question). Score stays NULL until grading. */
export async function upsertAnswer(pool: Pool, input: UpsertAnswerInput): Promise<{ id: string }> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM content.responses WHERE attempt_id = $1 AND question_id = $2`, [
      input.attemptId,
      input.questionId,
    ]);
    const ins = await client.query<{ id: string }>(
      `INSERT INTO content.responses
         (attempt_id, question_id, tenant_id, candidate_id, response_body,
          time_taken_ms, suspicious_signals, submitted_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7::jsonb, now())
       RETURNING id::text`,
      [
        input.attemptId,
        input.questionId,
        input.tenantId,
        input.candidateId,
        JSON.stringify(input.responseBody),
        input.timeTakenMs ?? null,
        JSON.stringify(input.integrityEvents ?? {}),
      ],
    );
    if (input.currentIdx !== undefined) {
      await client.query(
        `UPDATE content.attempts
            SET current_idx = GREATEST(current_idx, $2),
                integrity_flags = integrity_flags || $3::jsonb,
                updated_at = now()
          WHERE id = $1`,
        [input.attemptId, input.currentIdx, JSON.stringify(input.integrityEvents ?? {})],
      );
    }
    await client.query('COMMIT');
    return { id: ins.rows[0]!.id };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export interface AttemptResponseRow {
  id: string;
  question_id: string;
  response_body: Record<string, unknown> | null;
  score: string | null;
  execution_metadata: Record<string, unknown> | null;
  suspicious_signals: Record<string, unknown> | null;
}

export async function listAttemptResponses(
  pool: Pool,
  attemptId: string,
): Promise<AttemptResponseRow[]> {
  const r = await pool.query<AttemptResponseRow>(
    `SELECT id::text, question_id::text, response_body, score, execution_metadata, suspicious_signals
       FROM content.responses WHERE attempt_id = $1 ORDER BY created_at`,
    [attemptId],
  );
  return r.rows;
}
