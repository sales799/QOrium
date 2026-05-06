/**
 * DB I/O for the IRT pipeline. Reads questions in `calibrating` status with
 * sufficient responses; writes the fit result + transitions question status
 * + appends an audit row in `content.calibration_history`. All updates for a
 * single question happen in one transaction so a partial failure can't leave
 * the question half-updated.
 */

import type { Pool, PoolClient } from '@qorium/db';
import type { ItemParameters } from '../model.js';
import type { CalibrationFlag } from '../drift.js';
import type { RawResponseRow } from '../ability.js';

export interface CalibratingQuestion {
  id: string;
  uuid: string;
  format: string;
  priorB: number | null;
  priorA: number | null;
  priorC: number | null;
  calibrationN: number;
}

interface CalibratingRow {
  id: string;
  uuid: string;
  format: string;
  difficulty_b: string | null;
  discrimination_a: string | null;
  guessing_c: string | null;
  calibration_n: number | null;
}

export async function listCalibratingQuestions(
  pool: Pool,
  opts: { minResponses: number; limit: number },
): Promise<CalibratingQuestion[]> {
  const result = await pool.query<CalibratingRow>(
    `SELECT id, uuid, format, difficulty_b, discrimination_a, guessing_c, calibration_n
       FROM content.questions
      WHERE status = 'calibrating'
        AND COALESCE(calibration_n, 0) >= $1
      ORDER BY created_at ASC
      LIMIT $2`,
    [opts.minResponses, opts.limit],
  );
  return result.rows.map((r) => ({
    id: r.id,
    uuid: r.uuid,
    format: r.format,
    priorB: r.difficulty_b !== null ? Number(r.difficulty_b) : null,
    priorA: r.discrimination_a !== null ? Number(r.discrimination_a) : null,
    priorC: r.guessing_c !== null ? Number(r.guessing_c) : null,
    calibrationN: r.calibration_n ?? 0,
  }));
}

export interface ResponseForCalibration extends RawResponseRow {
  questionId: string;
  candidateId: string;
  score: number | null;
}

interface ResponseRow {
  question_id: string;
  candidate_id: string;
  score: string | null;
}

/**
 * Fetch all responses for a list of question ids — one query rather than
 * N round-trips. The cohort built across all the questions is what feeds
 * `abilitiesFromResponses`.
 */
export async function fetchResponsesForQuestions(
  pool: Pool,
  questionIds: readonly string[],
): Promise<ResponseForCalibration[]> {
  if (questionIds.length === 0) return [];
  const result = await pool.query<ResponseRow>(
    `SELECT question_id, candidate_id, score
       FROM content.responses
      WHERE question_id = ANY($1::uuid[])`,
    [questionIds],
  );
  return result.rows.map((r) => ({
    questionId: r.question_id,
    candidateId: r.candidate_id,
    score: r.score !== null ? Number(r.score) : null,
  }));
}

export interface ApplyCalibrationInput {
  runId: string;
  questionId: string;
  nResponses: number;
  estimated: ItemParameters;
  prior: { a: number | null; b: number | null };
  empiricalPassRate: number | null;
  logLikelihood: number;
  iterations: number;
  converged: boolean;
  flag: CalibrationFlag;
  nextStatus: 'released' | 'sme_review' | 'calibrating';
}

const HISTORY_INSERT = `
INSERT INTO content.calibration_history
  (run_id, question_id, n_responses, b_est, a_est, c_est,
   log_likelihood, converged, iterations, prior_b, prior_a,
   delta_b, delta_a, empirical_pass_rate, flag)
VALUES
  ($1, $2, $3, $4, $5, $6,
   $7, $8, $9, $10, $11,
   $12, $13, $14, $15)
`;

const STATUS_UPDATE_NO_RELEASE = `
UPDATE content.questions
   SET status = $1,
       updated_at = NOW()
 WHERE id = $2
`;

const STATUS_UPDATE_WITH_PARAMS = `
UPDATE content.questions
   SET status = $1,
       difficulty_b = $2,
       discrimination_a = $3,
       guessing_c = $4,
       released_at = CASE WHEN $1 = 'released' THEN COALESCE(released_at, NOW()) ELSE released_at END,
       updated_at = NOW()
 WHERE id = $5
`;

function safeNumber(v: number): number | null {
  return Number.isFinite(v) ? v : null;
}

export async function applyCalibration(pool: Pool, input: ApplyCalibrationInput): Promise<void> {
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');

    const deltaB =
      input.prior.b !== null && Number.isFinite(input.estimated.b)
        ? input.estimated.b - input.prior.b
        : null;
    const deltaA =
      input.prior.a !== null && Number.isFinite(input.estimated.a)
        ? input.estimated.a - input.prior.a
        : null;

    await client.query(HISTORY_INSERT, [
      input.runId,
      input.questionId,
      input.nResponses,
      safeNumber(input.estimated.b),
      safeNumber(input.estimated.a),
      safeNumber(input.estimated.c),
      safeNumber(input.logLikelihood),
      input.converged,
      input.iterations,
      input.prior.b,
      input.prior.a,
      deltaB,
      deltaA,
      input.empiricalPassRate,
      input.flag,
    ]);

    if (
      input.flag === 'low_n' ||
      input.flag === 'no_convergence' ||
      input.flag === 'invalid_params'
    ) {
      // Skip param/state writes for unhealthy fits; history row is enough for audit.
      await client.query('COMMIT');
      return;
    }

    if (input.nextStatus === 'sme_review' || input.nextStatus === 'calibrating') {
      // Drift flagged: persist params (so the SME sees what was estimated)
      // but do NOT release.
      await client.query(STATUS_UPDATE_WITH_PARAMS, [
        input.nextStatus,
        safeNumber(input.estimated.b),
        safeNumber(input.estimated.a),
        safeNumber(input.estimated.c),
        input.questionId,
      ]);
    } else if (input.nextStatus === 'released') {
      await client.query(STATUS_UPDATE_WITH_PARAMS, [
        'released',
        safeNumber(input.estimated.b),
        safeNumber(input.estimated.a),
        safeNumber(input.estimated.c),
        input.questionId,
      ]);
    } else {
      await client.query(STATUS_UPDATE_NO_RELEASE, [input.nextStatus, input.questionId]);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {
      /* swallow secondary error */
    });
    throw err;
  } finally {
    client.release();
  }
}
