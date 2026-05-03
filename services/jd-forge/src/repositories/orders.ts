/**
 * `app.jd_forge_orders` writer / reader. v0 supports the lifecycle the
 * MVP route handlers need: create (status=pending), advance, complete,
 * fail.
 */

import { createHash } from 'node:crypto';
import type { Pool } from '@qorium/db';
import type { ExportFormat, Tier } from '../types.js';

export interface OrderRow {
  id: string;
  tenantId: string;
  tier: Tier;
  jdHash: string;
  status: OrderStatus;
  exportFormat: ExportFormat;
  questionIds: string[];
  requestedAt: string;
  completedAt: string | null;
}

export type OrderStatus =
  | 'pending'
  | 'parsing'
  | 'mapping'
  | 'generating'
  | 'validating'
  | 'sme_review'
  | 'completed'
  | 'failed'
  | 'leaked';

export interface CreateOrderInput {
  tenantId: string;
  tier: Tier;
  jdText: string;
  exportFormat: ExportFormat;
}

export function jdHashFor(jdText: string): string {
  return createHash('sha256').update(jdText).digest('hex');
}

interface OrderRawRow {
  id: string;
  tenant_id: string;
  tier: Tier;
  jd_hash: string;
  status: OrderStatus;
  export_format: ExportFormat;
  question_ids: string[] | null;
  requested_at: Date;
  completed_at: Date | null;
}

function toRow(r: OrderRawRow): OrderRow {
  return {
    id: r.id,
    tenantId: r.tenant_id,
    tier: r.tier,
    jdHash: r.jd_hash,
    status: r.status,
    exportFormat: r.export_format,
    questionIds: r.question_ids ?? [],
    requestedAt: r.requested_at.toISOString(),
    completedAt: r.completed_at?.toISOString() ?? null,
  };
}

export async function createOrder(pool: Pool, input: CreateOrderInput): Promise<OrderRow> {
  const result = await pool.query<OrderRawRow>(
    `INSERT INTO app.jd_forge_orders
       (tenant_id, tier, jd_text, jd_hash, status, export_format)
     VALUES ($1, $2, $3, $4, 'pending', $5)
     RETURNING id, tenant_id, tier, jd_hash, status, export_format,
               question_ids, requested_at, completed_at`,
    [input.tenantId, input.tier, input.jdText, jdHashFor(input.jdText), input.exportFormat],
  );
  const row = result.rows[0];
  if (!row) throw new Error('createOrder: insert returned no row');
  return toRow(row);
}

export async function getOrder(pool: Pool, id: string): Promise<OrderRow | null> {
  const result = await pool.query<OrderRawRow>(
    `SELECT id, tenant_id, tier, jd_hash, status, export_format,
            question_ids, requested_at, completed_at
       FROM app.jd_forge_orders
      WHERE id = $1
      LIMIT 1`,
    [id],
  );
  return result.rows[0] ? toRow(result.rows[0]) : null;
}

export interface CompleteOrderInput {
  orderId: string;
  parsedSpec: unknown;
  questionIds: string[];
  exportUrl?: string;
}

export async function markCompleted(pool: Pool, input: CompleteOrderInput): Promise<void> {
  await pool.query(
    `UPDATE app.jd_forge_orders
        SET status = 'completed',
            completed_at = NOW(),
            parsed_spec = $1::jsonb,
            question_ids = $2::uuid[],
            export_url = $3,
            updated_at = NOW()
      WHERE id = $4`,
    [JSON.stringify(input.parsedSpec), input.questionIds, input.exportUrl ?? null, input.orderId],
  );
}

export async function markFailed(pool: Pool, orderId: string, reason: string): Promise<void> {
  await pool.query(
    `UPDATE app.jd_forge_orders
        SET status = 'failed',
            failed_at = NOW(),
            failure_reason = $1,
            updated_at = NOW()
      WHERE id = $2`,
    [reason.slice(0, 1000), orderId],
  );
}

export async function advanceStatus(
  pool: Pool,
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  await pool.query(
    `UPDATE app.jd_forge_orders
        SET status = $1,
            updated_at = NOW()
      WHERE id = $2`,
    [status, orderId],
  );
}
