/**
 * runCalibration — single end-to-end pass of the IRT pipeline.
 *
 * 1. Load questions in `calibrating` status with N >= minResponses.
 * 2. Fetch all responses for that batch in one query; compute per-candidate
 *    ability proxies.
 * 3. For each question, fit (a, b) with c held at the format-derived default;
 *    classify drift; decide next status; persist history + apply transition.
 *
 * Pure dependencies are injected (data layer, fitter, logger, clock) so unit
 * tests can exercise the loop without DB.
 */

import { randomUUID } from 'node:crypto';
import type { Logger } from 'pino';
import { abilitiesFromResponses, type RawResponseRow } from './ability.js';
import { classifyDrift, nextStatusForFlag, type CalibrationFlag } from './drift.js';
import { fit2PL } from './fit2pl.js';
import { defaultGuessingForFormat } from './model.js';
import type {
  ApplyCalibrationInput,
  CalibratingQuestion,
  ResponseForCalibration,
} from './repositories/calibrating.js';

export interface CalibrationPipeline {
  listQuestions: () => Promise<CalibratingQuestion[]>;
  fetchResponses: (questionIds: string[]) => Promise<ResponseForCalibration[]>;
  applyCalibration: (input: ApplyCalibrationInput) => Promise<void>;
  logger: Logger;
  config: {
    minResponses: number;
    maxIterations: number;
    tolerance: number;
  };
  /** Optional ID generator override for tests. */
  generateRunId?: () => string;
  /** Optional clock override for tests. */
  now?: () => Date;
}

export interface CalibrationReport {
  runId: string;
  startedAt: string;
  finishedAt: string;
  questionsConsidered: number;
  questionsCalibrated: number;
  questionsReleased: number;
  questionsFlaggedForSme: number;
  questionsHeldInCalibration: number;
  errors: number;
  flags: Record<CalibrationFlag, number>;
}

const EMPTY_FLAGS = (): Record<CalibrationFlag, number> => ({
  none: 0,
  low_n: 0,
  no_convergence: 0,
  invalid_params: 0,
  drift_b: 0,
  drift_a: 0,
  extreme_pass_rate: 0,
});

function passRate(rows: readonly RawResponseRow[]): number | null {
  if (rows.length === 0) return null;
  const correct = rows.reduce((acc, r) => acc + (r.score !== null && r.score >= 50 ? 1 : 0), 0);
  return correct / rows.length;
}

export async function runCalibration(pipeline: CalibrationPipeline): Promise<CalibrationReport> {
  const now = pipeline.now ?? (() => new Date());
  const runId = pipeline.generateRunId?.() ?? randomUUID();
  const startedAt = now().toISOString();
  const report: CalibrationReport = {
    runId,
    startedAt,
    finishedAt: startedAt,
    questionsConsidered: 0,
    questionsCalibrated: 0,
    questionsReleased: 0,
    questionsFlaggedForSme: 0,
    questionsHeldInCalibration: 0,
    errors: 0,
    flags: EMPTY_FLAGS(),
  };

  let questions: CalibratingQuestion[];
  try {
    questions = await pipeline.listQuestions();
  } catch (err) {
    pipeline.logger.error({ err }, 'failed to list calibrating questions');
    report.errors++;
    report.finishedAt = now().toISOString();
    return report;
  }
  report.questionsConsidered = questions.length;
  if (questions.length === 0) {
    report.finishedAt = now().toISOString();
    pipeline.logger.info({ runId }, 'no questions ready for calibration');
    return report;
  }

  const ids = questions.map((q) => q.id);
  let responses: ResponseForCalibration[];
  try {
    responses = await pipeline.fetchResponses(ids);
  } catch (err) {
    pipeline.logger.error({ err, runId }, 'failed to fetch responses');
    report.errors++;
    report.finishedAt = now().toISOString();
    return report;
  }

  // Build per-candidate ability proxy across the entire batch's responses
  // (so we score everyone on a common θ scale, not per-item).
  const abilities = abilitiesFromResponses(responses);
  const thetaByCandidate = new Map<string, number>();
  for (const a of abilities) thetaByCandidate.set(a.candidateId, a.theta);

  // Index responses by question for the per-item fit.
  const responsesByQuestion = new Map<string, ResponseForCalibration[]>();
  for (const r of responses) {
    const list = responsesByQuestion.get(r.questionId) ?? [];
    list.push(r);
    responsesByQuestion.set(r.questionId, list);
  }

  for (const question of questions) {
    const itemRows = responsesByQuestion.get(question.id) ?? [];
    if (itemRows.length < pipeline.config.minResponses) {
      report.flags.low_n++;
      report.questionsHeldInCalibration++;
      try {
        await pipeline.applyCalibration({
          runId,
          questionId: question.id,
          nResponses: itemRows.length,
          estimated: { a: question.priorA ?? 1, b: question.priorB ?? 0, c: question.priorC ?? 0 },
          prior: { a: question.priorA, b: question.priorB },
          empiricalPassRate: passRate(itemRows),
          logLikelihood: -Infinity,
          iterations: 0,
          converged: false,
          flag: 'low_n',
          nextStatus: 'calibrating',
        });
      } catch (err) {
        pipeline.logger.error({ err, questionId: question.id }, 'failed to record low-n flag');
        report.errors++;
      }
      continue;
    }

    const thetas: number[] = [];
    const ys: number[] = [];
    for (const row of itemRows) {
      const theta = thetaByCandidate.get(row.candidateId);
      if (theta === undefined) continue;
      const y = row.score !== null && row.score >= 50 ? 1 : 0;
      thetas.push(theta);
      ys.push(y);
    }

    const cFixed = question.priorC ?? defaultGuessingForFormat(question.format);
    const initial = { a: question.priorA ?? 1, b: question.priorB ?? 0 };
    const fit = fit2PL(thetas, ys, {
      cFixed,
      maxIterations: pipeline.config.maxIterations,
      tolerance: pipeline.config.tolerance,
      initial,
    });

    let preflag: CalibrationFlag = 'none';
    if (fit.reason === 'invalid-data') preflag = 'invalid_params';
    else if (!fit.converged) preflag = 'no_convergence';

    const empirical = passRate(itemRows);
    const flag = classifyDrift({
      estimated: fit.params,
      prior: { a: question.priorA, b: question.priorB },
      empiricalPassRate: empirical,
      preflag,
    });
    const nextStatus = nextStatusForFlag({
      flag,
      hasMinResponses: itemRows.length >= pipeline.config.minResponses,
    });

    report.flags[flag]++;
    report.questionsCalibrated++;
    if (nextStatus === 'released') report.questionsReleased++;
    else if (nextStatus === 'sme_review') report.questionsFlaggedForSme++;
    else report.questionsHeldInCalibration++;

    try {
      await pipeline.applyCalibration({
        runId,
        questionId: question.id,
        nResponses: itemRows.length,
        estimated: fit.params,
        prior: { a: question.priorA, b: question.priorB },
        empiricalPassRate: empirical,
        logLikelihood: fit.logLikelihood,
        iterations: fit.iterations,
        converged: fit.converged,
        flag,
        nextStatus,
      });
    } catch (err) {
      pipeline.logger.error({ err, questionId: question.id }, 'failed to apply calibration');
      report.errors++;
    }
  }

  report.finishedAt = now().toISOString();
  pipeline.logger.info({ runId, summary: report }, 'calibration run complete');
  return report;
}
