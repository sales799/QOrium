/**
 * Programmatic entry point. PM2 runs this file directly and owns the nightly
 * cron-restart at 03:00 IST; `cli.ts` remains a manual wrapper.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPool, resolveDatabaseUrl } from '@qorium/db';
import { loadConfig, type IrtConfig } from './config.js';
import { buildLogger } from './logger.js';
import { runCalibration, type CalibrationReport } from './orchestrator.js';
import {
  applyCalibration,
  fetchResponsesForQuestions,
  listCalibratingQuestions,
} from './repositories/calibrating.js';
import { waitForStartupDependencies } from './readiness.js';

const SERVICE_NAME = 'qorium-irt-calibration';
const KEEPALIVE_INTERVAL_MS = 60_000;

export async function runOnce(overrides: { config?: IrtConfig } = {}): Promise<CalibrationReport> {
  const config = overrides.config ?? loadConfig();
  const logger = buildLogger({ serviceName: SERVICE_NAME });

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

  const pool = createPool({
    connectionString: resolveDatabaseUrl(),
    max: 4,
    connectionTimeoutMillis: 1_000,
    applicationName: SERVICE_NAME,
  });
  try {
    await waitForStartupDependencies({
      logger,
      pool,
      redisUrl: process.env.REDIS_URL,
      serviceName: SERVICE_NAME,
    });
    logger.info({ ev: 'boot', svc: SERVICE_NAME, deps: 'ok' });

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

export async function start(): Promise<void> {
  const report = await runOnce();
  process.stdout.write(JSON.stringify({ event: 'calibration.report', ...report }) + '\n');

  // Keep the worker online between PM2 cron restarts; the cron owns cadence.
  const handle = setInterval(() => undefined, KEEPALIVE_INTERVAL_MS);
  const shutdown = (signal: string): void => {
    clearInterval(handle);
    process.stdout.write(JSON.stringify({ event: 'calibration.shutdown', signal }) + '\n');
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

const currentFile = fileURLToPath(import.meta.url);
const entryFile = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (entryFile === currentFile) {
  void start().catch((err) => {
    process.stderr.write(
      JSON.stringify({
        event: 'calibration.fatal',
        error: err instanceof Error ? err.message : String(err),
      }) + '\n',
    );
    process.exit(1);
  });
}

export { runCalibration } from './orchestrator.js';
export { loadConfig } from './config.js';
export { buildLogger } from './logger.js';
export { fit2PL, isAtBounds, type FitResult } from './fit2pl.js';
export {
  classifyDrift,
  expectedPassRateAtMeanAbility,
  nextStatusForFlag,
  type CalibrationFlag,
} from './drift.js';
export {
  defaultGuessingForFormat,
  probability3PL,
  itemLogLikelihood,
  type ItemParameters,
} from './model.js';
export { abilitiesFromResponses, estimateAbilities } from './ability.js';
