/**
 * Programmatic entry point. The CLI in `cli.ts` is the operational entry
 * driven by PM2's nightly cron-restart at 03:00 IST.
 */

import { createPool, resolveDatabaseUrl } from '@qorium/db';
import { loadConfig, type IrtConfig } from './config.js';
import { buildLogger } from './logger.js';
import { runCalibration, type CalibrationReport } from './orchestrator.js';
import {
  applyCalibration,
  fetchResponsesForQuestions,
  listCalibratingQuestions,
} from './repositories/calibrating.js';

export async function runOnce(overrides: { config?: IrtConfig } = {}): Promise<CalibrationReport> {
  const config = overrides.config ?? loadConfig();
  const logger = buildLogger();

  try {
    resolveDatabaseUrl();
  } catch {
    logger.warn('DATABASE_URL is not configured; calibration run will exit without scanning');
    const now = new Date().toISOString();
    return {
      runId: '00000000-0000-0000-0000-000000000000',
      startedAt: now,
      finishedAt: now,
      questionsConsidered: 0,
      questionsCalibrated: 0,
      questionsReleased: 0,
      questionsFlaggedForSme: 0,
      questionsHeldInCalibration: 0,
      errors: 0,
      flags: {
        none: 0,
        low_n: 0,
        no_convergence: 0,
        invalid_params: 0,
        drift_b: 0,
        drift_a: 0,
        extreme_pass_rate: 0,
      },
    };
  }

  const pool = createPool({ connectionString: resolveDatabaseUrl(), max: 4 });
  try {
    return await runCalibration({
      listQuestions: () =>
        listCalibratingQuestions(pool, {
          minResponses: config.minResponses,
          limit: config.maxQuestionsPerRun,
        }),
      fetchResponses: (ids) => fetchResponsesForQuestions(pool, ids),
      applyCalibration: (input) => applyCalibration(pool, input),
      logger,
      config: {
        minResponses: config.minResponses,
        maxIterations: config.maxIterations,
        tolerance: config.tolerance,
      },
    });
  } finally {
    await pool.end();
  }
}

export { runCalibration } from './orchestrator.js';
export { loadConfig } from './config.js';
export { buildLogger } from './logger.js';
