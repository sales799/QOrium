import type { Pool } from '@qorium/db';

// A4 scorer. v0 supports MCQ only — exact-index match against the question's
// resolved correct-answer key. Returns a 0..100 score and an `irt_status`
// stamp so downstream consumers know this is a model estimate, not a
// calibrated IRT theta (M14 supplies that).

export interface QuestionRow {
  id: string;
  format: string;
  body_json: unknown;
  // content.questions.answer_key — the authored answer. In the launch bank it
  // is EITHER an object `{ text: "A — explanation…" }` (the correct option is
  // the leading letter of the prose) OR, for a small early batch, a bare number
  // (currently all `0`, which reads as an un-set placeholder rather than a real
  // index — see resolveCorrectIndex). The grader prefers an explicit
  // body_json.answer_index when present (future authored shape).
  answer_key?: unknown;
  skill_id: string | null;
  tenant_id?: string | null;
}

export async function loadQuestion(pool: Pool, questionId: string): Promise<QuestionRow | null> {
  const r = await pool.query<QuestionRow>(
    `select id::text, format, body_json, answer_key, skill_id::text
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
  correct: boolean | null; // null when format/key is unscoreable in v0
  rationale: string;
}

// Number of options on an MCQ body, used to bound-check any resolved index.
// Accepts both `options` (data) and `choices` (older comment).
function optionCount(body: unknown): number | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  const arr = Array.isArray(b.options) ? b.options : Array.isArray(b.choices) ? b.choices : null;
  return arr ? arr.length : null;
}

// Map a leading option letter (A/B/C/…) to a zero-based index, but only when it
// is clearly a label: the letter must be followed by a separator (space,
// bracket, dot, colon, dash). This avoids matching prose like "Always …" → A.
function leadingLetterIndex(text: string): number | null {
  const m = /^\s*([A-Za-z])[\s).:—–-]/.exec(text);
  if (!m) return null;
  const idx = m[1]!.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
  return idx >= 0 && idx < 26 ? idx : null;
}

// Resolve the correct zero-based option index for an MCQ, or null when it
// cannot be determined DETERMINISTICALLY. We never guess: an unresolved key
// yields `correct: null` downstream (the row still persists for the record,
// flagged as unscored) rather than a fabricated score.
//
// Resolution order (authoritative signal first):
//   1. answer_key prose — object `.text` (or scalar string) whose LEADING
//      option letter ("A — …") names the correct option. This is the launch
//      bank's authored answer and the only trustworthy signal at scale.
//   2. answer_key as a BARE NUMBER → treated as an UNSET placeholder, NOT an
//      index. Every such row in the launch bank is `0` and is paired with a
//      `body_json.answer_index` of `0`; trusting either would silently mark
//      option A correct for ~25 unkeyed questions. These return null until the
//      authoring pipeline backfills a real key.
//   3. body_json.answer_index / correct_index — explicit numeric, used ONLY as
//      a forward-compat fallback when answer_key is absent (future authoring),
//      so the placeholder batch in (2) is never silently scored.
export function resolveCorrectIndex(question: QuestionRow): number | null {
  const nOpts = optionCount(question.body_json);
  const ak = question.answer_key;

  // 1. answer_key prose: leading option letter (authoritative for this bank).
  let akText: string | null = null;
  if (typeof ak === 'string') akText = ak;
  else if (ak && typeof ak === 'object') {
    const t = (ak as Record<string, unknown>).text;
    if (typeof t === 'string') akText = t;
  }
  if (akText) {
    const idx = leadingLetterIndex(akText);
    if (idx !== null && (nOpts === null || idx < nOpts)) return idx;
    // Prose key present but unparseable → do not fall through to a placeholder.
    return null;
  }

  // 2. Bare-numeric answer_key is a placeholder, not an index → unscored.
  if (typeof ak === 'number') return null;

  // 3. Forward-compat: explicit numeric on the body, only when answer_key is
  //    absent entirely (genuinely future authored question, no prose key).
  if (
    (ak === null || ak === undefined) &&
    question.body_json &&
    typeof question.body_json === 'object'
  ) {
    const b = question.body_json as Record<string, unknown>;
    const explicit =
      typeof b.answer_index === 'number'
        ? b.answer_index
        : typeof b.correct_index === 'number'
          ? b.correct_index
          : null;
    if (explicit !== null && Number.isInteger(explicit)) {
      if (nOpts === null || (explicit >= 0 && explicit < nOpts)) return explicit;
    }
  }

  return null;
}

export function grade(input: GradeInput): GradeOutcome {
  const fmt = (input.question.format ?? '').toLowerCase();
  if (fmt === 'mcq' || fmt === 'sjt-mcq' || fmt.startsWith('mcq')) {
    const correctIdx = resolveCorrectIndex(input.question);
    if (correctIdx === null) {
      return {
        score: 0,
        max_score: 100,
        irt_status: 'model-estimated',
        correct: null,
        rationale:
          'answer key not resolvable (no explicit answer_index and no leading-letter answer_key) — row persisted unscored',
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
