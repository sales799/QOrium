/**
 * `app.stack_vault_access_log` writer. Append-only audit per spec §4.7.
 */

import type { Pool } from '@qorium/db';

export interface AccessLogEntry {
  vaultId: string;
  tenantId: string;
  questionId: string;
  watermarkId: string;
  candidateId?: string | undefined;
  apiKeyId?: string | undefined;
  requestIp?: string | undefined;
  userAgent?: string | undefined;
}

export async function recordAccess(pool: Pool, entry: AccessLogEntry): Promise<void> {
  await pool.query(
    `INSERT INTO app.stack_vault_access_log
       (vault_id, tenant_id, question_id, watermark_id,
        candidate_id, api_key_id, request_ip, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7::inet, $8)`,
    [
      entry.vaultId,
      entry.tenantId,
      entry.questionId,
      entry.watermarkId,
      entry.candidateId ?? null,
      entry.apiKeyId ?? null,
      entry.requestIp ?? null,
      entry.userAgent ?? null,
    ],
  );
}

export interface AccessSummaryRow {
  questionId: string;
  uniqueWatermarks: number;
  reads: number;
  lastReadAt: string;
}

interface SummaryRawRow {
  question_id: string;
  unique_watermarks: string;
  reads: string;
  last_read_at: Date;
}

/** Per-question read summary across the vault. Drives the customer-facing
 * "what's been popular" panel + the SME / forensics dashboards. */
export async function summarisePerQuestion(
  pool: Pool,
  vaultId: string,
  opts: { limit?: number } = {},
): Promise<AccessSummaryRow[]> {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 500);
  const result = await pool.query<SummaryRawRow>(
    `SELECT question_id,
            COUNT(DISTINCT watermark_id)::text AS unique_watermarks,
            COUNT(*)::text AS reads,
            MAX(occurred_at) AS last_read_at
       FROM app.stack_vault_access_log
      WHERE vault_id = $1
      GROUP BY question_id
      ORDER BY MAX(occurred_at) DESC
      LIMIT $2`,
    [vaultId, limit],
  );
  return result.rows.map((r) => ({
    questionId: r.question_id,
    uniqueWatermarks: Number(r.unique_watermarks),
    reads: Number(r.reads),
    lastReadAt: r.last_read_at.toISOString(),
  }));
}
