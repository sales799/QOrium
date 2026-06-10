import { createHash } from 'node:crypto';
import type { Pool } from '@qorium/db';
import { grade, loadQuestion } from '../lib/a4-grader.js';
import { getAttempt, listAttemptResponses } from '../repositories/attempts.js';

// BR-3 grading worker. On submit, grade every stored response for an attempt,
// write the per-answer score + reasoning trace into content.responses, emit an
// auditable content.grade_decisions row per answer (M21), then finalize the
// attempt totals. MCQ is graded deterministically via the existing a4-grader;
// non-objective formats persist unscored with a clear trace (LLM grader = 0019+).

const GRADER_MODEL = 'a4-grader-v0-deterministic';

export interface PerSkillScore {
  skill_id: string;
  graded: number;
  mean_score: number;
}

export interface GradeAttemptResult {
  attempt_id: string;
  status: string;
  total_score: number;
  max_score: number;
  pass_score: number;
  passed: boolean;
  graded_count: number;
  unscored_count: number;
  per_skill: PerSkillScore[];
}

export async function gradeAttempt(pool: Pool, attemptId: string): Promise<GradeAttemptResult> {
  const attempt = await getAttempt(pool, attemptId);
  if (!attempt) throw new Error(`attempt ${attemptId} not found`);

  const passRow = await pool.query<{ pass_score: string }>(
    `SELECT pass_score FROM content.assessments WHERE id = $1`,
    [attempt.assessment_id],
  );
  const passScore = passRow.rows[0] ? Number(passRow.rows[0].pass_score) : 0.6;

  const responses = await listAttemptResponses(pool, attemptId);

  const client = await pool.connect();
  let scored = 0;
  let unscored = 0;
  let scoreSum = 0;
  const skillAgg = new Map<string, { sum: number; n: number }>();

  try {
    await client.query('BEGIN');
    for (const resp of responses) {
      const question = await loadQuestion(pool, resp.question_id);
      let score = 0;
      let rationale = 'question not found at grade time — scored 0';
      let correct: boolean | null = null;
      let irtStatus = 'model-estimated';
      let skillId: string | null = null;

      if (question) {
        skillId = (question as { skill_id?: string | null }).skill_id ?? null;
        const body = (resp.response_body ?? {}) as {
          answer_index?: number;
          answer?: unknown;
        } & Record<string, unknown>;
        const outcome = grade({ question, responseBody: body });
        score = outcome.score;
        rationale = outcome.rationale;
        correct = outcome.correct;
        irtStatus = outcome.irt_status;
      }

      const reasoningHash = createHash('sha256').update(rationale, 'utf8').digest('hex');
      const confidence = correct === null ? 0.3 : 1.0;

      await client.query(
        `UPDATE content.responses
            SET score = $2,
                execution_metadata = jsonb_build_object(
                  'reasoning_trace', $3::text,
                  'correct', $4::boolean,
                  'irt_status', $5::text,
                  'grader_model', $6::text)
          WHERE id = $1`,
        [resp.id, score, rationale, correct, irtStatus, GRADER_MODEL],
      );

      await client.query(
        `INSERT INTO content.grade_decisions
           (tenant_id, response_id, question_id, model, score, confidence,
            reasoning_text, reasoning_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          attempt.tenant_id,
          resp.id,
          resp.question_id,
          GRADER_MODEL,
          score / 100,
          confidence,
          rationale,
          reasoningHash,
        ],
      );

      if (correct === null) unscored += 1;
      else scored += 1;
      scoreSum += score;
      if (skillId) {
        const agg = skillAgg.get(skillId) ?? { sum: 0, n: 0 };
        agg.sum += score;
        agg.n += 1;
        skillAgg.set(skillId, agg);
      }
    }

    const n = responses.length;
    const totalScore = n > 0 ? Math.round((scoreSum / n) * 100) / 100 : 0;
    const maxScore = 100;
    const passed = totalScore / 100 >= passScore;

    await client.query(
      `UPDATE content.attempts
          SET status = 'graded', total_score = $2, max_score = $3,
              graded_at = now(), updated_at = now()
        WHERE id = $1`,
      [attemptId, totalScore, maxScore],
    );
    await client.query(
      `UPDATE content.invitations SET status = 'submitted'
        WHERE id = $1 AND status <> 'expired'`,
      [attempt.invitation_id],
    );
    await client.query('COMMIT');

    const perSkill: PerSkillScore[] = [...skillAgg.entries()].map(([skill_id, v]) => ({
      skill_id,
      graded: v.n,
      mean_score: Math.round((v.sum / v.n) * 100) / 100,
    }));

    return {
      attempt_id: attemptId,
      status: 'graded',
      total_score: totalScore,
      max_score: maxScore,
      pass_score: passScore,
      passed,
      graded_count: scored,
      unscored_count: unscored,
      per_skill: perSkill,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
