import type { Pool } from '@qorium/db';

// ============================================================================
// BR-4 — IRT calibration feedback (M14)
// ============================================================================
// On each tick this job turns real graded responses into live, defensible item
// statistics on content.questions:
//
//   • empirical_pass_rate + calibration_n  — recomputed for EVERY item that has
//     at least one scored response (any n). This is the "auto IRT from real
//     candidates" CEO checkbox: the numbers move as soon as people answer.
//   • difficulty_b / discrimination_a / guessing_c — a defensible classical→IRT
//     3PL estimate, refit only once an item crosses MIN_N scored responses.
//
// Why a closed-form estimate (not full MMLE/EM): proper 3PL marginal-maximum-
// likelihood needs a dense candidate×item response matrix that QOrium will not
// have until volume builds. Until then we publish a transparent Rasch/point-
// biserial bridge (cited on /trust/bias-audit) rather than a fabricated theta.
// Swap in an EM solver here later without changing the surface contract.
//
// Correctness source: content.responses.execution_metadata->>'correct' (set by
// the BR-3 grading worker). Rows where correct IS NULL (unscored / non-objective
// formats pending the LLM grader) are excluded from n so they cannot skew stats.
// ============================================================================

const MIN_N = 30; // 3PL refit threshold (spec §6)
const A_MIN = 0.2;
const A_MAX = 3.0;
const EPS = 1e-4;

export interface CalibrationResult {
  items_seen: number;
  items_updated: number;
  items_refit: number;
  first_defensible_item: string | null;
}

interface ItemAgg {
  question_id: string;
  format: string;
  options: number | null;
  n: number;
  correct: number;
  // point-biserial discrimination inputs (item correctness vs candidate total)
  sum_total: number;
  sum_total_correct: number;
  sumsq_total: number;
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}
function logit(p: number): number {
  const q = clamp(p, EPS, 1 - EPS);
  return Math.log(q / (1 - q));
}

/**
 * Estimate 3PL (a, b, c) from classical item statistics.
 *  c (pseudo-guess) = 1/options for MCQ, else 0.
 *  a (discrimination) from point-biserial r: a ≈ 1.7 r / sqrt(1 - r^2), clamped.
 *  b (difficulty): solve c + (1-c)·σ(a(0 - b)) = p  → b = -logit((p-c)/(1-c)) / a.
 */
function estimate3pl(agg: ItemAgg): { a: number; b: number; c: number } {
  const p = agg.correct / agg.n;
  const c = agg.options && agg.options > 1 ? 1 / agg.options : 0;

  // point-biserial: r = (M1 - M) / S * sqrt(p / (1 - p))
  const mean = agg.sum_total / agg.n;
  const variance = Math.max(agg.sumsq_total / agg.n - mean * mean, 0);
  const sd = Math.sqrt(variance);
  let r = 0;
  if (sd > 0 && agg.correct > 0 && agg.correct < agg.n) {
    const meanCorrect = agg.sum_total_correct / agg.correct;
    r = ((meanCorrect - mean) / sd) * Math.sqrt(p / (1 - p));
  }
  r = clamp(r, -0.99, 0.99);
  const a = clamp((1.7 * r) / Math.sqrt(Math.max(1 - r * r, EPS)), A_MIN, A_MAX);

  const adj = clamp((p - c) / Math.max(1 - c, EPS), EPS, 1 - EPS);
  const b = clamp(-logit(adj) / a, -4, 4);
  return { a, b, c };
}

export async function runCalibrationTick(pool: Pool): Promise<CalibrationResult> {
  // 1. Per-item aggregates from scored responses joined to their attempt's
  //    total_score (for discrimination). Only count rows the grader resolved.
  const rows = await pool.query<{
    question_id: string;
    format: string;
    options: number | null;
    n: string;
    correct: string;
    sum_total: string | null;
    sum_total_correct: string | null;
    sumsq_total: string | null;
  }>(
    `SELECT r.question_id::text AS question_id,
            q.format,
            jsonb_array_length(q.body_json->'options') AS options,
            count(*)                                              AS n,
            count(*) FILTER (WHERE r.execution_metadata->>'correct' = 'true') AS correct,
            sum(COALESCE(a.total_score, 0))                       AS sum_total,
            sum(COALESCE(a.total_score, 0)) FILTER (WHERE r.execution_metadata->>'correct' = 'true') AS sum_total_correct,
            sum(COALESCE(a.total_score, 0) * COALESCE(a.total_score, 0)) AS sumsq_total
       FROM content.responses r
       JOIN content.questions q ON q.id = r.question_id
       LEFT JOIN content.attempts a ON a.id = r.attempt_id
      WHERE r.execution_metadata ? 'correct'
        AND r.execution_metadata->>'correct' IS NOT NULL
        AND r.execution_metadata->>'correct' <> 'null'
      GROUP BY r.question_id, q.format, q.body_json`,
    [],
  );

  let updated = 0;
  let refit = 0;
  let firstDefensible: string | null = null;

  for (const row of rows.rows) {
    const n = Number(row.n);
    const correct = Number(row.correct);
    if (n === 0) continue;
    const agg: ItemAgg = {
      question_id: row.question_id,
      format: row.format,
      options: row.options !== null ? Number(row.options) : null,
      n,
      correct,
      sum_total: Number(row.sum_total ?? 0),
      sum_total_correct: Number(row.sum_total_correct ?? 0),
      sumsq_total: Number(row.sumsq_total ?? 0),
    };
    const passRate = correct / n;

    // Was this item already calibrated (n>=MIN_N) before this tick?
    const prev = await pool.query<{ calibration_n: number | null }>(
      `SELECT calibration_n FROM content.questions WHERE id = $1`,
      [agg.question_id],
    );
    const prevN = prev.rows[0]?.calibration_n ?? 0;

    if (n >= MIN_N) {
      const { a, b, c } = estimate3pl(agg);
      await pool.query(
        `UPDATE content.questions
            SET empirical_pass_rate = $2, calibration_n = $3,
                difficulty_b = $4, discrimination_a = $5, guessing_c = $6,
                updated_at = now()
          WHERE id = $1`,
        [agg.question_id, passRate, n, b, a, c],
      );
      refit += 1;
      if ((prevN ?? 0) < MIN_N && firstDefensible === null) firstDefensible = agg.question_id;
    } else {
      // Below threshold: publish empirical pass rate + n only; leave priors.
      await pool.query(
        `UPDATE content.questions
            SET empirical_pass_rate = $2, calibration_n = $3, updated_at = now()
          WHERE id = $1`,
        [agg.question_id, passRate, n],
      );
    }
    updated += 1;
  }

  return {
    items_seen: rows.rows.length,
    items_updated: updated,
    items_refit: refit,
    first_defensible_item: firstDefensible,
  };
}
