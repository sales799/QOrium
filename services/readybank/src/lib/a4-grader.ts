import type { Pool } from '@qorium/db';

// A4 scorer. v0 supports MCQ only — exact-index match against the question
// body's correct-answer key. Returns a 0..100 score and an `irt_status`
// stamp so downstream consumers know this is a model estimate, not a
// calibrated IRT theta (M14 supplies that).

export interface QuestionRow {
  id: string;
  format: string;
  body_json: unknown;
  skill_id: string | null;
  tenant_id?: string | null;
}

export async function loadQuestion(pool: Pool, questionId: string): Promise<QuestionRow | null> {
  const r = await pool.query<QuestionRow>(
    `select id::text, format, body_json, skill_id::text
       from content.questions
      where id = $1::uuid
      limit 1`,
    [questionId],
  );
  return r.rows[0] ?? null;
}

export interface GradeInput {
  question: QuestionRow;
  responseBody: { answer_index?: number; answer?: unknown } & Record<string, unknown>;
}

export interface GradeOutcome {
  score: number; // 0..100 numeric (NUMERIC(5,2) in DB)
  max_score: number;
  irt_status: 'model-estimated';
  correct: boolean | null; // null when format is unscoreable in v0
  rationale: string;
}

// MCQ body shape may use either `answer_index` (data) or `correct_index`
// (older schema comment). Accept both.
function mcqCorrectIndex(body: unknown): number | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  const ai = typeof b.answer_index === 'number' ? b.answer_index : null;
  const ci = typeof b.correct_index === 'number' ? b.correct_index : null;
  return ai ?? ci;
}

export function grade(input: GradeInput): GradeOutcome {
  const fmt = (input.question.format ?? '').toLowerCase();
  if (fmt === 'mcq' || fmt === 'sjt-mcq' || fmt.startsWith('mcq')) {
    const correctIdx = mcqCorrectIndex(input.question.body_json);
    if (correctIdx === null) {
      return {
        score: 0,
        max_score: 100,
        irt_status: 'model-estimated',
        correct: null,
        rationale: 'question has no correct_index/answer_index — cannot score',
      };
    }
    const submitted =
      typeof input.responseBody.answer_index === 'number' ? input.responseBody.answer_index : null;
    if (submitted === null) {
      return {
        score: 0,
        max_score: 100,
        irt_status: 'model-estimated',
        correct: false,
        rationale: 'no answer_index submitted',
      };
    }
    const correct = submitted === correctIdx;
    return {
      score: correct ? 100 : 0,
      max_score: 100,
      irt_status: 'model-estimated',
      correct,
      rationale: correct
        ? `selected option ${submitted} matches correct option ${correctIdx}`
        : `selected option ${submitted} does not match correct option ${correctIdx}`,
    };
  }

  // Other formats (code, casestudy, design, video) fall through to a stub.
  // Returns null `correct` so the row persists but signals downstream that
  // human/LLM grading is still required. Real LLM grader lands with 0019.
  return {
    score: 0,
    max_score: 100,
    irt_status: 'model-estimated',
    correct: null,
    rationale: `format "${fmt}" not auto-scored in A4 v0 — pending 0019 grader`,
  };
}

export interface PersistResponseArgs {
  pool: Pool;
  questionId: string;
  tenantId: string;
  candidateId: string;
  responseBody: Record<string, unknown>;
  score: number;
  timeTakenMs?: number | null;
  startedAtIso?: string | null;
  suspiciousSignals?: Record<string, unknown>;
}

export async function persistResponse(args: PersistResponseArgs): Promise<{
  id: string;
  submitted_at: string;
}> {
  const r = await args.pool.query<{ id: string; submitted_at: Date }>(
    `insert into content.responses
       (question_id, tenant_id, candidate_id, response_body, score,
        time_taken_ms, suspicious_signals, started_at)
     values ($1::uuid, $2::uuid, $3, $4::jsonb, $5,
             $6, $7::jsonb, $8)
     returning id::text, submitted_at`,
    [
      args.questionId,
      args.tenantId,
      args.candidateId,
      JSON.stringify(args.responseBody),
      args.score,
      args.timeTakenMs ?? null,
      JSON.stringify(args.suspiciousSignals ?? {}),
      args.startedAtIso ? new Date(args.startedAtIso) : null,
    ],
  );
  const row = r.rows[0]!;
  return { id: row.id, submitted_at: row.submitted_at.toISOString() };
}
