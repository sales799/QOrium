// Pure attempt-state / resume presenter. No DB, no I/O. Deterministic and
// unit-testable. N11 candidate UX (resume-after-disconnect): the candidate
// runner autosaves answers + current_idx into content.{responses,attempts};
// when a candidate reconnects (reload / dropped connection) the runner needs a
// single read to rehydrate WHERE they are without re-fetching every question.
//
// LEAK-SAFE BY CONSTRUCTION: this view carries only positions, counts, status,
// and the time budget — never a response body, score, correctness flag, or any
// question content. It cannot expose answers or answer keys.

export interface AttemptStateInput {
  attemptId: string;
  status: string;
  /** Ordered question ids for this attempt (content.attempts.question_order). */
  questionOrder: string[];
  /** Persisted cursor (content.attempts.current_idx). */
  currentIdx: number;
  /** Attempt start time. */
  startedAt: Date;
  /** Question ids that already have a saved response (any order, may dup). */
  answeredQuestionIds: string[];
  /** Assessment time limit in seconds; 0 / falsy = untimed. */
  timeLimitSec: number;
  /** Clock injection for deterministic tests; defaults to now. */
  now?: Date;
}

export interface AttemptStateView {
  attempt_id: string;
  status: string;
  total_questions: number;
  current_idx: number;
  answered_count: number;
  /** Positions in questionOrder that have a saved answer (sorted, unique). */
  answered_indices: number[];
  /** First unanswered position, or total_questions when all are answered. */
  resume_idx: number;
  started_at: string; // ISO-8601
  time_limit_sec: number;
  /** Whole seconds since startedAt (never negative). */
  elapsed_sec: number;
  /** Seconds left when timed, else null (untimed). Floored at 0. */
  remaining_sec: number | null;
  /** True only when timed and the budget is exhausted. */
  expired: boolean;
}

function clampInt(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, Math.trunc(n)));
}

/**
 * Build the leak-safe resume view for a candidate attempt. Answered ids that
 * are not part of questionOrder are ignored (defensive). resume_idx is the
 * first position without a saved answer, so the runner can continue exactly
 * where the candidate left off after a disconnect.
 */
export function buildAttemptState(input: AttemptStateInput): AttemptStateView {
  const order = Array.isArray(input.questionOrder) ? input.questionOrder : [];
  const total = order.length;
  const answeredSet = new Set(input.answeredQuestionIds ?? []);

  const answered_indices: number[] = [];
  for (let i = 0; i < total; i += 1) {
    const qid = order[i];
    if (qid !== undefined && answeredSet.has(qid)) answered_indices.push(i);
  }
  const answeredPositions = new Set(answered_indices);

  let resume_idx = total;
  for (let i = 0; i < total; i += 1) {
    if (!answeredPositions.has(i)) {
      resume_idx = i;
      break;
    }
  }

  const now = input.now ?? new Date();
  const elapsedMs = now.getTime() - input.startedAt.getTime();
  const elapsed_sec = Math.max(0, Math.floor(elapsedMs / 1000));

  const limit = Number.isFinite(input.timeLimitSec) ? Math.trunc(input.timeLimitSec) : 0;
  const timed = limit > 0;
  const remaining_sec = timed ? Math.max(0, limit - elapsed_sec) : null;
  const expired = timed && remaining_sec === 0;

  return {
    attempt_id: input.attemptId,
    status: input.status,
    total_questions: total,
    current_idx: clampInt(input.currentIdx, 0, total),
    answered_count: answered_indices.length,
    answered_indices,
    resume_idx,
    started_at: input.startedAt.toISOString(),
    time_limit_sec: timed ? limit : 0,
    elapsed_sec,
    remaining_sec,
    expired,
  };
}
