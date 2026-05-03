/**
 * Persistence helpers for `content.responses` execution outcomes.
 */

import type { Pool } from '@qorium/db';
import type { ExecutionMetadata } from '../orchestrator.js';
import type { AntiFraudSignals } from '../anti-fraud.js';

export interface PendingResponseRow {
  id: string;
  questionId: string;
  candidateId: string;
  candidateCode: string;
  language: string;
  submittedAt: string;
}

interface PendingRow {
  id: string;
  question_id: string;
  candidate_id: string;
  response_body: { code?: string; language?: string } | null;
  submitted_at: Date;
}

export async function listPendingResponses(
  pool: Pool,
  opts: { limit: number },
): Promise<PendingResponseRow[]> {
  const result = await pool.query<PendingRow>(
    `SELECT id, question_id, candidate_id, response_body, submitted_at
       FROM content.responses
      WHERE execution_metadata IS NULL AND score IS NULL
      ORDER BY submitted_at ASC
      LIMIT $1`,
    [opts.limit],
  );
  return result.rows
    .map((r) => {
      const body = r.response_body ?? {};
      const code = typeof body.code === 'string' ? body.code : '';
      const language = typeof body.language === 'string' ? body.language : '';
      const row: PendingResponseRow = {
        id: r.id,
        questionId: r.question_id,
        candidateId: r.candidate_id,
        candidateCode: code,
        language,
        submittedAt: r.submitted_at.toISOString(),
      };
      return row;
    })
    .filter((r) => r.candidateCode.length > 0 && r.language.length > 0);
}

export interface ApplyOutcomeInput {
  responseId: string;
  score: number;
  metadata: ExecutionMetadata;
  suspiciousSignals: AntiFraudSignals;
}

export async function applyExecutionOutcome(pool: Pool, input: ApplyOutcomeInput): Promise<void> {
  await pool.query(
    `UPDATE content.responses
        SET score = $1,
            time_taken_ms = $2,
            execution_metadata = $3,
            suspicious_signals = $4
      WHERE id = $5`,
    [
      input.score,
      input.metadata.durationMs,
      JSON.stringify(input.metadata),
      JSON.stringify(input.suspiciousSignals),
      input.responseId,
    ],
  );
}
