/**
 * Stack-Vault repository — tenant-scoped reads/writes against
 * `content.questions` filtered by `stack_vault_tenant_id`.
 *
 * EVERY query in this module joins on `stack_vault_tenant_id = $tenantId`.
 * That binding is the line of defense even if a route forgets to apply
 * the middleware. Returns null for cross-tenant reads (caller maps to 404).
 */

import type { Pool } from '@qorium/db';

export interface VaultQuestionRow {
  uuid: string;
  qor_id: string;
  body_md: string;
  body_json: Record<string, unknown>;
  watermark_seed: string | null;
  format: string;
  language: string;
  difficulty_b: number | null;
  released_at: Date | null;
  created_at: Date;
}

/**
 * Fetch a single Stack-Vault question, scoped to the caller's tenant.
 * Returns null for: not-found, wrong-tenant, or NULL stack_vault_tenant_id
 * (which means it's a ReadyBank shared question, not vault-eligible here).
 */
export async function getVaultQuestionByUuid(
  pool: Pool,
  tenantId: string,
  uuid: string,
): Promise<VaultQuestionRow | null> {
  const result = await pool.query<VaultQuestionRow>(
    `SELECT q.id::text AS uuid,
            q.qor_id,
            q.body_md,
            q.body_json,
            q.watermark_seed,
            q.format,
            q.language,
            q.difficulty_b,
            q.released_at,
            q.created_at
       FROM content.questions q
       WHERE q.id = $1
         AND q.stack_vault_tenant_id = $2
       LIMIT 1`,
    [uuid, tenantId],
  );
  return result.rows[0] ?? null;
}

/**
 * List vault questions for the caller's tenant. Default order: most recent first.
 */
export async function listVaultQuestions(
  pool: Pool,
  tenantId: string,
  limit: number,
  offset: number,
): Promise<VaultQuestionRow[]> {
  const result = await pool.query<VaultQuestionRow>(
    `SELECT q.id::text AS uuid,
            q.qor_id,
            q.body_md,
            q.body_json,
            q.watermark_seed,
            q.format,
            q.language,
            q.difficulty_b,
            q.released_at,
            q.created_at
       FROM content.questions q
       WHERE q.stack_vault_tenant_id = $1
       ORDER BY q.created_at DESC
       LIMIT $2 OFFSET $3`,
    [tenantId, limit, offset],
  );
  return result.rows;
}

export interface InsertVaultQuestion {
  tenantId: string;
  qorId: string;
  body_md: string;
  body_json: Record<string, unknown>;
  watermark_seed: string;
  format: string;
  language: string;
  difficulty_b: number | null;
}

/**
 * Insert a Stack-Vault question pinned to the caller's tenant. Uniqueness
 * is enforced by the partial UNIQUE INDEX (stack_vault_tenant_id, qor_id)
 * — same qor_id can exist in different tenants' vaults.
 */
export async function insertVaultQuestion(
  pool: Pool,
  q: InsertVaultQuestion,
): Promise<{ uuid: string }> {
  const result = await pool.query<{ uuid: string }>(
    `INSERT INTO content.questions
       (qor_id, sku, format, language, status, body_md, body_json,
        watermark_seed, difficulty_b, stack_vault_tenant_id)
     VALUES ($1, 'stack-vault', $2, $3, 'released', $4, $5, $6, $7, $8)
     RETURNING id::text AS uuid`,
    [
      q.qorId,
      q.format,
      q.language,
      q.body_md,
      q.body_json,
      q.watermark_seed,
      q.difficulty_b,
      q.tenantId,
    ],
  );
  const row = result.rows[0];
  if (!row) throw new Error('insert returned no row');
  return row;
}
