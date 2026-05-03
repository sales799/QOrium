/**
 * Programmatic entry point: drains a bounded batch of pending responses,
 * runs each through the orchestrator, persists the outcome. Used by the
 * `--once` CLI mode and the future BullMQ consumer.
 *
 * BullMQ wiring (Redis queue dequeue) is intentionally deferred per
 * `infra/CTO-deltas/CTO-DELTA-judge0-bullmq-deferred.md`; the v0 polls
 * `content.responses` directly for rows where execution_metadata IS NULL.
 */

import { createPool, resolveDatabaseUrl } from '@qorium/db';
import { loadConfig, type Judge0OrchestratorConfig } from './config.js';
import { buildLogger } from './logger.js';
import { Judge0Client } from './judge0/client.js';
import { isSupportedLanguage } from './languages.js';
import { executeSubmission } from './orchestrator.js';
import {
  applyExecutionOutcome,
  listPendingResponses,
  type PendingResponseRow,
} from './repositories/responses.js';
import { validateSandboxConfig } from './submission.js';
import type { Pool } from '@qorium/db';

export interface RunReport {
  startedAt: string;
  finishedAt: string;
  responsesProcessed: number;
  responsesSucceeded: number;
  responsesFailed: number;
  responsesSkipped: number;
}

export async function runOnce(
  overrides: { config?: Judge0OrchestratorConfig } = {},
): Promise<RunReport> {
  const config = overrides.config ?? loadConfig();
  const logger = buildLogger();

  try {
    resolveDatabaseUrl();
  } catch {
    logger.warn('DATABASE_URL not configured; orchestrator pass exits without scanning');
    const now = new Date().toISOString();
    return {
      startedAt: now,
      finishedAt: now,
      responsesProcessed: 0,
      responsesSucceeded: 0,
      responsesFailed: 0,
      responsesSkipped: 0,
    };
  }

  const pool = createPool({ connectionString: resolveDatabaseUrl(), max: 4 });
  const client = new Judge0Client({
    baseUrl: config.judge0BaseUrl,
    authToken: config.judge0AuthToken,
    pollIntervalMs: config.pollIntervalMs,
    pollTimeoutMs: config.pollTimeoutMs,
  });
  const startedAt = new Date();
  const report: RunReport = {
    startedAt: startedAt.toISOString(),
    finishedAt: startedAt.toISOString(),
    responsesProcessed: 0,
    responsesSucceeded: 0,
    responsesFailed: 0,
    responsesSkipped: 0,
  };

  try {
    const pending = await listPendingResponses(pool, { limit: config.maxResponsesPerRun });
    for (const row of pending) {
      if (!isSupportedLanguage(row.language)) {
        logger.debug(
          { responseId: row.id, language: row.language },
          'unsupported language; skipping',
        );
        report.responsesSkipped++;
        continue;
      }
      report.responsesProcessed++;
      try {
        const sandboxConfig = await fetchSandboxConfig(pool, row.questionId);
        if (!sandboxConfig) {
          logger.warn(
            { responseId: row.id, questionId: row.questionId },
            'no sandbox_config; skipping',
          );
          report.responsesSkipped++;
          continue;
        }
        const outcome = await executeSubmission({
          candidateCode: row.candidateCode,
          language: row.language,
          config: sandboxConfig,
          judge0: client,
          logger,
        });
        await applyExecutionOutcome(pool, {
          responseId: row.id,
          score: outcome.score,
          metadata: outcome.metadata,
          suspiciousSignals: outcome.antiFraud,
        });
        report.responsesSucceeded++;
      } catch (err) {
        logger.error({ err, responseId: row.id }, 'execution pipeline failed');
        report.responsesFailed++;
      }
    }
  } finally {
    await pool.end();
    report.finishedAt = new Date().toISOString();
  }

  logger.info({ report }, 'judge0 orchestrator pass complete');
  return report;
}

async function fetchSandboxConfig(pool: Pool, questionId: string) {
  const result = await pool.query<{ sandbox_config: unknown }>(
    `SELECT sandbox_config FROM content.questions WHERE id = $1`,
    [questionId],
  );
  const cfg = result.rows[0]?.sandbox_config;
  if (cfg === null || cfg === undefined) return null;
  return validateSandboxConfig(cfg);
}

export { executeSubmission } from './orchestrator.js';
export { Judge0Client } from './judge0/client.js';
export { loadConfig } from './config.js';
export { buildLogger } from './logger.js';
export {
  isSupportedLanguage,
  judge0IdFor,
  getLanguageProfile,
  listSupportedLanguages,
  type QOriumLanguage,
} from './languages.js';
export { scoreSubmission, matchesExpected } from './scoring.js';
export {
  computeAntiFraudSignals,
  type AntiFraudSignals,
  type AntiFraudFlag,
} from './anti-fraud.js';
export { validateSubmission, validateSandboxConfig, type SandboxConfig } from './submission.js';

// Re-export types for sibling consumers (e.g., admin UI proofs)
export type { PendingResponseRow };
