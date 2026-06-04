import { createHash } from 'node:crypto';
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

// Provenance enum mirrors the CHECK constraint on content.grade_decisions
// (migration 0019). Deterministic MCQ matching is NOT one of these — it is not
// AI-grader output — which is exactly why the deterministic path leaves
// `aiDecision` null and writes no grade_decisions row.
export type GraderSource = 'm4_grader' | 'ai_verify' | 'ensemble' | 'ats_rescore';

// An AI grader's decision for one response: a model-produced reasoning trace
// plus a confidence band. Present ONLY when an actual model graded the answer.
// Deterministic grading (MCQ exact-match) sets this to null — see the
// "honest plumbing" decision: content.grade_decisions is reserved for
// AI-grader output and must never be populated by a deterministic matcher.
export interface AiGradeTrace {
  model: string; // e.g. 'claude-sonnet-4-6'
  promptVersion?: string; // defaults to 'v1'
  graderSource: GraderSource;
  score: number; // 0..1 fraction (NUMERIC(5,4) in DB)
  confidence: number; // 0..1 fraction
  reasoningText: string; // the model's grading rationale (stored + hashed)
  rubricBreakdown?: Record<string, unknown>; // optional per-criterion JSONB
}

export interface GradeOutcome {
  score: number; // 0..100 numeric (NUMERIC(5,2) in content.responses)
  max_score: number;
  irt_status: 'model-estimated';
  correct: boolean | null; // null when format/key is unscoreable in v0
  rationale: string;
  // Non-null ONLY when a model produced a reasoning trace. A4 v0 grades MCQ
  // deterministically, so this is always null today; when BHIMA's M4 grader
  // lands for non-MCQ formats it populates this and grade_decisions rows flow
  // with no change to the route wiring.
  aiDecision: AiGradeTrace | null;
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
        aiDecision: null,
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
        aiDecision: null,
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
      // Deterministic match: NOT AI-grader output, so no grade_decision.
      aiDecision: null,
    };
  }

  // Other formats (code, casestudy, design, video) fall through to a stub.
  // Returns null `correct` so the row persists but signals downstream that
  // AI/human grading is still required. The real AI grader (M4) lands in
  // BHIMA's lane and will return a populated `aiDecision` here.
  return {
    score: 0,
    max_score: 100,
    irt_status: 'model-estimated',
    correct: null,
    rationale: `format "${fmt}" not auto-scored in A4 v0 — pending M4 AI grader`,
    aiDecision: null,
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

// ---------------------------------------------------------------------------
// grade_decisions writer (migration 0019) — A2 reasoning-trace + confidence.
//
// Called ONLY when grade() produced a non-null `aiDecision` (a real model
// reasoning trace). Deterministic MCQ grading never reaches here, keeping the
// "AI grader output" table honest per the labeling guardrail.
//
// The (response_id, model, prompt_version) tuple is unique; re-grades with the
// same tuple are idempotent (ON CONFLICT DO NOTHING returns the existing row).
// ---------------------------------------------------------------------------

export interface PersistGradeDecisionArgs {
  pool: Pool;
  tenantId: string;
  responseId: string;
  questionId: string;
  decision: AiGradeTrace;
}

export function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

export interface GradeDecisionRow {
  id: string;
  reasoning_hash: string;
  created_at: string;
}

export async function persistGradeDecision(
  args: PersistGradeDecisionArgs,
): Promise<GradeDecisionRow> {
  const d = args.decision;

  // Fail-loud validation BEFORE touching the DB — the CHECK constraints would
  // reject these anyway, but a clear app-level error beats a raw 23514.
  const validSources: GraderSource[] = ['m4_grader', 'ai_verify', 'ensemble', 'ats_rescore'];
  if (!validSources.includes(d.graderSource)) {
    throw new Error(`invalid grader_source: ${d.graderSource}`);
  }
  if (!(d.score >= 0 && d.score <= 1)) {
    throw new Error(`grade_decisions.score must be a 0..1 fraction, got ${d.score}`);
  }
  if (!(d.confidence >= 0 && d.confidence <= 1)) {
    throw new Error(`grade_decisions.confidence must be a 0..1 fraction, got ${d.confidence}`);
  }
  if (!d.reasoningText || d.reasoningText.length === 0) {
    throw new Error('grade_decisions.reasoning_text must not be empty');
  }

  // Immutability proof: the application computes the hash of the exact text it
  // persists (NON-NEGOTIABLE per the column comment). A caller cannot supply a
  // mismatched hash — we always derive it here.
  const reasoningHash = sha256Hex(d.reasoningText);
  const promptVersion = d.promptVersion ?? 'v1';

  const r = await args.pool.query<{ id: string; reasoning_hash: string; created_at: Date }>(
    `insert into content.grade_decisions
       (tenant_id, response_id, question_id, model, prompt_version,
        grader_source, score, confidence, reasoning_text, reasoning_hash,
        rubric_breakdown)
     values ($1::uuid, $2::uuid, $3::uuid, $4, $5,
             $6, $7, $8, $9, $10,
             $11::jsonb)
     on conflict (response_id, model, prompt_version) do nothing
     returning id::text, reasoning_hash, created_at`,
    [
      args.tenantId,
      args.responseId,
      args.questionId,
      d.model,
      promptVersion,
      d.graderSource,
      d.score,
      d.confidence,
      d.reasoningText,
      reasoningHash,
      d.rubricBreakdown ? JSON.stringify(d.rubricBreakdown) : null,
    ],
  );

  // ON CONFLICT DO NOTHING returns zero rows when the tuple already existed;
  // fetch the existing row so the caller always gets a stable id back.
  if (r.rows[0]) {
    const row = r.rows[0];
    return {
      id: row.id,
      reasoning_hash: row.reasoning_hash,
      created_at: row.created_at.toISOString(),
    };
  }
  const existing = await args.pool.query<{ id: string; reasoning_hash: string; created_at: Date }>(
    `select id::text, reasoning_hash, created_at
       from content.grade_decisions
      where response_id = $1::uuid and model = $2 and prompt_version = $3
      limit 1`,
    [args.responseId, d.model, promptVersion],
  );
  const row = existing.rows[0]!;
  return {
    id: row.id,
    reasoning_hash: row.reasoning_hash,
    created_at: row.created_at.toISOString(),
  };
}
