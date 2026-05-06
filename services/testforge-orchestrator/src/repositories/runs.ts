/**
 * `content.testforge_runs` writer per TestForge v1 §2.3.
 */

import type { Pool } from '@qorium/db';

export type RunType =
  | 'sme_validation'
  | 'irt_calibration'
  | 'bias_dif'
  | 'leak_crawl'
  | 'plagiarism_benchmark'
  | 'gate_scorecard'
  | 'pre_calibration_prior'
  | 'orchestrator_pass';

export interface RecordRunInput {
  runType: RunType;
  status: 'running' | 'completed' | 'failed';
  itemsProcessed: number;
  itemsPassed: number;
  itemsFlagged: number;
  output?: unknown;
  errorMessage?: string;
  triggeredAt?: Date;
  completedAt?: Date | null;
}

export async function startRun(pool: Pool, runType: RunType): Promise<string> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO content.testforge_runs (run_type, status, triggered_at)
       VALUES ($1, 'running', NOW())
       RETURNING id`,
    [runType],
  );
  const id = result.rows[0]?.id;
  if (!id) throw new Error('failed to start testforge run');
  return id;
}

export interface FinishRunInput {
  runId: string;
  status: 'completed' | 'failed';
  itemsProcessed: number;
  itemsPassed: number;
  itemsFlagged: number;
  output?: unknown;
  errorMessage?: string;
}

export async function finishRun(pool: Pool, input: FinishRunInput): Promise<void> {
  await pool.query(
    `UPDATE content.testforge_runs
        SET status = $1,
            completed_at = NOW(),
            items_processed = $2,
            items_passed = $3,
            items_flagged = $4,
            output = $5::jsonb,
            error_message = $6
      WHERE id = $7`,
    [
      input.status,
      input.itemsProcessed,
      input.itemsPassed,
      input.itemsFlagged,
      input.output ? JSON.stringify(input.output) : null,
      input.errorMessage ?? null,
      input.runId,
    ],
  );
}
