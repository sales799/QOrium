/**
 * Programmatic entry. Drains a bounded batch of pending questions, applies
 * pre-calibration priors, advances pipeline state, persists run audit.
 */

import { createPool, resolveDatabaseUrl } from '@qorium/db';
import { loadConfig, type TestForgeConfig } from './config.js';
import { buildLogger } from './logger.js';
import { runOrchestratorPass, type OrchestratorReport } from './orchestrator.js';

export async function runOnce(
  overrides: { config?: TestForgeConfig } = {},
): Promise<OrchestratorReport> {
  const config = overrides.config ?? loadConfig();
  const logger = buildLogger();

  try {
    resolveDatabaseUrl();
  } catch {
    logger.warn('DATABASE_URL not configured; orchestrator pass exits without scanning');
    const now = new Date().toISOString();
    return {
      runId: '00000000-0000-0000-0000-000000000000',
      startedAt: now,
      finishedAt: now,
      itemsProcessed: 0,
      priorsComputed: 0,
      graduated: 0,
      flagged: 0,
      awaiting: 0,
      errors: 0,
    };
  }

  const pool = createPool({ connectionString: resolveDatabaseUrl(), max: 4 });
  try {
    return await runOrchestratorPass({
      pool,
      logger,
      config: { maxItemsPerRun: config.maxItemsPerRun },
    });
  } finally {
    await pool.end();
  }
}

export { runOrchestratorPass } from './orchestrator.js';
export { loadConfig } from './config.js';
export { buildLogger } from './logger.js';
export {
  scoreEnsemble,
  runBenchmark,
  type EnsembleResult,
  type BenchmarkReport,
} from './plagiarism/ensemble.js';
export { computeAvailableSignals } from './plagiarism/signals.js';
export {
  nextActionFor,
  applySmeDecision,
  customerFacingStatusFor,
  type TestForgeStatus,
  type GateName,
  type GateAudit,
} from './gates.js';
