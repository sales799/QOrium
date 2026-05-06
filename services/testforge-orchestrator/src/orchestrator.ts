/**
 * runOrchestratorPass — single pass that walks pending questions and
 * dispatches each to the appropriate gate per `governance/TestForge-QA-Pipeline-v1.md`.
 *
 * v0 scope (the rest of the gates have their own services):
 *   - SME validation: triggered externally by the admin queue (Sprint 1.3);
 *     this orchestrator only **observes** the SME decision and waits.
 *   - Pre-calibration AI prior (§3.2): owned here. Runs on every newly-accepted
 *     question, fetches neighbours, computes the prior, transitions to
 *     `calibrating`.
 *   - IRT calibration (§3.3): owned by `qorium-irt-calibration` (Sprint 1.5);
 *     this orchestrator reads `content.calibration_history.flag` to update the
 *     audit, but does not run the fit itself.
 *   - Bias DIF (§3.4): not yet implemented; the orchestrator records a `bias`
 *     audit entry only when the bias-dif batch runs (Sprint ≥1.8).
 *   - Anti-leak (§3.5): owned by `qorium-leak-crawler` (Sprint 1.4); this
 *     orchestrator listens for `content.leak_alerts` rows and transitions
 *     leaked items.
 *   - Plagiarism benchmark (§3.6): owned in this workspace under
 *     `src/plagiarism/`; the orchestrator runs `runBenchmark` on demand.
 *   - Quality gate scorecard (§3.7): not yet implemented; reserved for Phase 2.
 */

import type { Logger } from 'pino';
import type { Pool } from '@qorium/db';
import {
  customerFacingStatusFor,
  nextActionFor,
  type GateAudit,
  type GateAuditEntry,
} from './gates.js';
import {
  applyPriorAndTransition,
  fetchPriorNeighbours,
  listOrchestrationCandidates,
  syncStatus,
  type OrchestratorRow,
} from './repositories/questions.js';
import { finishRun, startRun } from './repositories/runs.js';
import { computePrior } from './prior.js';

export interface OrchestratorPipeline {
  pool: Pool;
  logger: Logger;
  config: {
    maxItemsPerRun: number;
  };
  now?: () => Date;
}

export interface OrchestratorReport {
  runId: string;
  startedAt: string;
  finishedAt: string;
  itemsProcessed: number;
  priorsComputed: number;
  graduated: number;
  flagged: number;
  awaiting: number;
  errors: number;
}

export async function runOrchestratorPass(
  pipeline: OrchestratorPipeline,
): Promise<OrchestratorReport> {
  const now = pipeline.now ?? (() => new Date());
  const startedAt = now();
  const runId = await startRun(pipeline.pool, 'orchestrator_pass');

  const report: OrchestratorReport = {
    runId,
    startedAt: startedAt.toISOString(),
    finishedAt: startedAt.toISOString(),
    itemsProcessed: 0,
    priorsComputed: 0,
    graduated: 0,
    flagged: 0,
    awaiting: 0,
    errors: 0,
  };

  let candidates: OrchestratorRow[];
  try {
    candidates = await listOrchestrationCandidates(pipeline.pool, {
      limit: pipeline.config.maxItemsPerRun,
    });
  } catch (err) {
    pipeline.logger.error({ err, runId }, 'failed to list orchestration candidates');
    await finishRun(pipeline.pool, {
      runId,
      status: 'failed',
      itemsProcessed: 0,
      itemsPassed: 0,
      itemsFlagged: 0,
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    report.errors++;
    report.finishedAt = now().toISOString();
    return report;
  }

  for (const row of candidates) {
    report.itemsProcessed++;
    try {
      await processOne(pipeline, row, now, report);
    } catch (err) {
      pipeline.logger.error({ err, questionId: row.id }, 'orchestrator step failed');
      report.errors++;
    }
  }

  await finishRun(pipeline.pool, {
    runId,
    status: report.errors > 0 ? 'failed' : 'completed',
    itemsProcessed: report.itemsProcessed,
    itemsPassed: report.graduated,
    itemsFlagged: report.flagged,
    output: {
      priorsComputed: report.priorsComputed,
      awaiting: report.awaiting,
    },
  });

  report.finishedAt = now().toISOString();
  pipeline.logger.info({ report }, 'testforge orchestrator pass complete');
  return report;
}

async function processOne(
  pipeline: OrchestratorPipeline,
  row: OrchestratorRow,
  now: () => Date,
  report: OrchestratorReport,
): Promise<void> {
  const action = nextActionFor({
    status: row.status,
    customerFacingStatus: row.customerFacingStatus,
    calibrationN: row.calibrationN,
    hasReleasedAt: row.releasedAt !== null,
    audit: row.audit,
  });

  switch (action.kind) {
    case 'await_sme_decision':
    case 'await_calibration_responses':
    case 'await_irt_calibration_run':
    case 'await_bias_dif_check':
      report.awaiting++;
      return;

    case 'compute_pre_calibration_prior': {
      const neighbours = await fetchPriorNeighbours(pipeline.pool, {
        id: row.id,
        skillId: row.skillId,
        subSkillId: row.subSkillId,
        format: row.format,
      });
      const prior = computePrior(
        { id: row.id, skillId: row.skillId, subSkillId: row.subSkillId, format: row.format },
        neighbours,
      );
      const audit = withAudit(row.audit, 'pre_calibration_prior', {
        gate: 'pre_calibration_prior',
        passed: true,
        ranAt: now().toISOString(),
        notes: `source=${prior.source}; n=${prior.neighbourCount}`,
      });
      await applyPriorAndTransition(pipeline.pool, {
        questionId: row.id,
        prior,
        audit,
      });
      report.priorsComputed++;
      return;
    }

    case 'graduate_to_released': {
      // Don't re-graduate already-released items — that path is hit when
      // a released item's nextAction confirms steady state.
      if (row.status === 'released') {
        return;
      }
      const audit = withAudit(row.audit, 'scorecard', {
        gate: 'gate_scorecard',
        passed: true,
        ranAt: now().toISOString(),
        notes: 'graduated by orchestrator',
      });
      await syncStatus(pipeline.pool, {
        questionId: row.id,
        testforgeStatus: 'released',
        customerFacingStatus: customerFacingStatusFor('released'),
        audit,
      });
      report.graduated++;
      return;
    }

    case 'request_sme_re_review': {
      const audit = withAudit(row.audit, 'sme', {
        gate: 'sme_validation',
        passed: false,
        ranAt: now().toISOString(),
        notes: action.reason,
      });
      await syncStatus(pipeline.pool, {
        questionId: row.id,
        testforgeStatus: 'bias_review',
        customerFacingStatus: customerFacingStatusFor('bias_review'),
        audit,
      });
      report.flagged++;
      return;
    }

    case 'terminal':
      // No-op — terminal states are surfaced in the dashboard but the
      // orchestrator doesn't drive further transitions.
      return;
  }
}

function withAudit(audit: GateAudit, key: keyof GateAudit, entry: GateAuditEntry): GateAudit {
  return { ...audit, [key]: entry };
}
