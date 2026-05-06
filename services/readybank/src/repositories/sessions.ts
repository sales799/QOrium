/**
 * Sessions repository (Sprint 1.3).
 *
 * One row per candidate-on-pack take. Recruiter creates; candidate executes
 * via /take/:token. Token discipline matches recruiter_invitations (0005):
 * SHA-256 of plaintext is stored, plaintext returned exactly once.
 */
import { createHash, randomBytes } from 'node:crypto';
import type { Pool, PoolClient } from '@qorium/db';

export interface SessionRow {
  id: string;
  pack_id: string;
  recruiter_id: string;
  tenant_id: string;
  candidate_email: string;
  candidate_name: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'expired' | 'revoked';
  current_question_index: number;
  answers: AnswerRecord[];
  score_total: string | null;
  score_max: string | null;
  result_summary: Record<string, unknown> | null;
  created_at: Date;
  started_at: Date | null;
  completed_at: Date | null;
  expires_at: Date;
  revoked_at: Date | null;
  watermark_salt: string;
}

export interface AnswerRecord {
  question_id: string;
  value: string;
  answered_at: string;
  time_taken_ms: number;
  is_correct: boolean | null;
}

export interface CreateSessionInput {
  pack_id: string;
  recruiter_id: string;
  tenant_id: string;
  candidate_email: string;
  candidate_name?: string | undefined;
  ttl_days?: number | undefined;
}

export interface CreateSessionResult {
  session: SessionRow;
  /** Plaintext token. Returned exactly once. */
  token: string;
}

const DEFAULT_TTL_DAYS = 14;
const TOKEN_BYTES = 32;

export function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

export async function createSession(
  pool: Pool,
  input: CreateSessionInput,
): Promise<CreateSessionResult> {
  const token = randomBytes(TOKEN_BYTES).toString('base64url');
  const tokenHash = sha256Hex(token);
  const ttl = input.ttl_days ?? DEFAULT_TTL_DAYS;
  const expiresAt = new Date(Date.now() + ttl * 86_400_000);

  const result = await pool.query<SessionRow>(
    `INSERT INTO app.sessions
       (pack_id, recruiter_id, tenant_id, candidate_email, candidate_name,
        public_token_hash, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, pack_id, recruiter_id, tenant_id, candidate_email, candidate_name,
               status, current_question_index, answers, score_total, score_max,
               result_summary, created_at, started_at, completed_at, expires_at,
               revoked_at, watermark_salt`,
    [
      input.pack_id,
      input.recruiter_id,
      input.tenant_id,
      input.candidate_email,
      input.candidate_name ?? null,
      tokenHash,
      expiresAt,
    ],
  );
  return { session: result.rows[0]!, token };
}

const SELECT_BY_TOKEN_SQL = `
  SELECT id, pack_id, recruiter_id, tenant_id, candidate_email, candidate_name,
         status, current_question_index, answers, score_total, score_max,
         result_summary, created_at, started_at, completed_at, expires_at,
         revoked_at, watermark_salt
    FROM app.sessions
   WHERE public_token_hash = $1
   LIMIT 1
`;

export async function findSessionByToken(
  pool: Pool | PoolClient,
  token: string,
): Promise<SessionRow | null> {
  const tokenHash = sha256Hex(token);
  const result = await pool.query<SessionRow>(SELECT_BY_TOKEN_SQL, [tokenHash]);
  return result.rows[0] ?? null;
}

export async function findSessionById(
  pool: Pool,
  id: string,
  recruiterId: string,
): Promise<SessionRow | null> {
  const result = await pool.query<SessionRow>(
    `SELECT id, pack_id, recruiter_id, tenant_id, candidate_email, candidate_name,
            status, current_question_index, answers, score_total, score_max,
            result_summary, created_at, started_at, completed_at, expires_at,
            revoked_at, watermark_salt
       FROM app.sessions
      WHERE id = $1 AND recruiter_id = $2
      LIMIT 1`,
    [id, recruiterId],
  );
  return result.rows[0] ?? null;
}

export async function listSessionsForRecruiter(
  pool: Pool,
  recruiterId: string,
  opts: { limit?: number; status?: SessionRow['status'] } = {},
): Promise<SessionRow[]> {
  const limit = Math.max(1, Math.min(opts.limit ?? 50, 200));
  const params: unknown[] = [recruiterId];
  let where = 'recruiter_id = $1';
  if (opts.status) {
    params.push(opts.status);
    where += ` AND status = $${params.length}`;
  }
  params.push(limit);
  const result = await pool.query<SessionRow>(
    `SELECT id, pack_id, recruiter_id, tenant_id, candidate_email, candidate_name,
            status, current_question_index, answers, score_total, score_max,
            result_summary, created_at, started_at, completed_at, expires_at,
            revoked_at, watermark_salt
       FROM app.sessions
      WHERE ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length}`,
    params,
  );
  return result.rows;
}

export async function revokeSession(pool: Pool, id: string, recruiterId: string): Promise<boolean> {
  const result = await pool.query(
    `UPDATE app.sessions
        SET status = 'revoked'
      WHERE id = $1 AND recruiter_id = $2
        AND status IN ('pending', 'in_progress')`,
    [id, recruiterId],
  );
  return (result.rowCount ?? 0) > 0;
}

export interface PackQuestion {
  id: string;
  format: string;
  body_md: string;
  body_json: Record<string, unknown>;
  answer_key: Record<string, unknown> | null;
  difficulty_b: string | null;
}

export async function loadPackQuestions(
  pool: Pool | PoolClient,
  packId: string,
): Promise<PackQuestion[]> {
  const pack = await pool.query<{ question_ids: string[] }>(
    'SELECT question_ids FROM app.packs WHERE id = $1 LIMIT 1',
    [packId],
  );
  const ids = pack.rows[0]?.question_ids ?? [];
  if (ids.length === 0) return [];

  const result = await pool.query<PackQuestion>(
    `SELECT id, format, body_md, body_json, answer_key, difficulty_b
       FROM content.questions
      WHERE id = ANY($1::uuid[])`,
    [ids],
  );
  const byId = new Map(result.rows.map((r) => [r.id, r]));
  const ordered: PackQuestion[] = [];
  for (const id of ids) {
    const row = byId.get(id);
    if (row) ordered.push(row);
  }
  return ordered;
}

export interface AdvanceResult {
  session: SessionRow;
  done: boolean;
}

/**
 * Record an answer at the current index, mark correctness, advance the
 * counter. If this was the last question, flip status → completed and
 * compute the score. All in a single transaction so two concurrent submits
 * can't double-advance.
 */
export async function recordAnswerAndAdvance(
  pool: Pool,
  sessionId: string,
  questionId: string,
  value: string,
  isCorrect: boolean | null,
  timeTakenMs: number,
  totalQuestions: number,
  scoreDelta: { total: number; max: number },
): Promise<AdvanceResult> {
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');
    const cur = await client.query<SessionRow>(
      'SELECT * FROM app.sessions WHERE id = $1 FOR UPDATE',
      [sessionId],
    );
    const row = cur.rows[0];
    if (!row) {
      await client.query('ROLLBACK');
      throw new Error('session not found');
    }

    const newAnswers: AnswerRecord[] = [
      ...(row.answers ?? []),
      {
        question_id: questionId,
        value,
        answered_at: new Date().toISOString(),
        time_taken_ms: timeTakenMs,
        is_correct: isCorrect,
      },
    ];
    const nextIndex = row.current_question_index + 1;
    const done = nextIndex >= totalQuestions;
    const newStatus = done ? 'completed' : 'in_progress';

    const newScoreTotal = (Number(row.score_total ?? 0) + scoreDelta.total).toFixed(2);
    const newScoreMax = (Number(row.score_max ?? 0) + scoreDelta.max).toFixed(2);

    const update = await client.query<SessionRow>(
      `UPDATE app.sessions
          SET answers = $2::jsonb,
              current_question_index = $3,
              status = $4,
              score_total = $5,
              score_max = $6
        WHERE id = $1
        RETURNING id, pack_id, recruiter_id, tenant_id, candidate_email, candidate_name,
                  status, current_question_index, answers, score_total, score_max,
                  result_summary, created_at, started_at, completed_at, expires_at,
                  revoked_at, watermark_salt`,
      [sessionId, JSON.stringify(newAnswers), nextIndex, newStatus, newScoreTotal, newScoreMax],
    );
    await client.query('COMMIT');
    return { session: update.rows[0]!, done };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function markStartedIfPending(pool: Pool, sessionId: string): Promise<void> {
  await pool.query(
    `UPDATE app.sessions
        SET status = 'in_progress'
      WHERE id = $1 AND status = 'pending'`,
    [sessionId],
  );
}
