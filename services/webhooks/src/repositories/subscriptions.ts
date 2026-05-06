import { randomBytes } from 'node:crypto';
import type { Pool } from '@qorium/db';

export interface SubscriptionRow {
  id: string;
  tenantId: string;
  eventType: string;
  endpointUrl: string;
  isActive: boolean;
  consecutiveFailures: number;
  createdAt: string;
  updatedAt: string;
}

interface RawRow {
  id: string;
  tenant_id: string;
  event_type: string;
  endpoint_url: string;
  is_active: boolean;
  consecutive_failures: number;
  created_at: Date;
  updated_at: Date;
}

const SELECT = `
  SELECT id, tenant_id, event_type, endpoint_url, is_active,
         consecutive_failures, created_at, updated_at
    FROM webhooks.subscriptions
`;

function toRow(r: RawRow): SubscriptionRow {
  return {
    id: r.id,
    tenantId: r.tenant_id,
    eventType: r.event_type,
    endpointUrl: r.endpoint_url,
    isActive: r.is_active,
    consecutiveFailures: r.consecutive_failures,
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
  };
}

export interface CreateSubscriptionInput {
  tenantId: string;
  eventType: string;
  endpointUrl: string;
}

export interface CreatedSubscription {
  row: SubscriptionRow;
  /** One-time cleartext signing secret returned only at creation. */
  signingSecret: string;
}

export function generateSigningSecret(): string {
  return 'whsec_' + randomBytes(32).toString('hex');
}

export async function createSubscription(
  pool: Pool,
  input: CreateSubscriptionInput,
): Promise<CreatedSubscription> {
  const signingSecret = generateSigningSecret();
  const result = await pool.query<RawRow>(
    `INSERT INTO webhooks.subscriptions
       (tenant_id, event_type, endpoint_url, signing_secret_cipher)
     VALUES ($1, $2, $3, $4)
     RETURNING id, tenant_id, event_type, endpoint_url, is_active,
               consecutive_failures, created_at, updated_at`,
    [input.tenantId, input.eventType, input.endpointUrl, signingSecret],
  );
  const row = result.rows[0];
  if (!row) throw new Error('createSubscription: insert returned no row');
  return { row: toRow(row), signingSecret };
}

export async function listSubscriptions(pool: Pool, tenantId: string): Promise<SubscriptionRow[]> {
  const result = await pool.query<RawRow>(
    `${SELECT} WHERE tenant_id = $1 ORDER BY created_at DESC`,
    [tenantId],
  );
  return result.rows.map(toRow);
}

export async function getSubscription(
  pool: Pool,
  tenantId: string,
  id: string,
): Promise<SubscriptionRow | null> {
  const result = await pool.query<RawRow>(`${SELECT} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [
    tenantId,
    id,
  ]);
  return result.rows[0] ? toRow(result.rows[0]) : null;
}

export async function deleteSubscription(
  pool: Pool,
  tenantId: string,
  id: string,
): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM webhooks.subscriptions WHERE tenant_id = $1 AND id = $2`,
    [tenantId, id],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function setActive(
  pool: Pool,
  tenantId: string,
  id: string,
  isActive: boolean,
): Promise<SubscriptionRow | null> {
  const result = await pool.query<RawRow>(
    `UPDATE webhooks.subscriptions
        SET is_active = $1, updated_at = NOW()
      WHERE tenant_id = $2 AND id = $3
      RETURNING id, tenant_id, event_type, endpoint_url, is_active,
                consecutive_failures, created_at, updated_at`,
    [isActive, tenantId, id],
  );
  return result.rows[0] ? toRow(result.rows[0]) : null;
}

export async function getSecret(pool: Pool, subscriptionId: string): Promise<string | null> {
  const result = await pool.query<{ signing_secret_cipher: string }>(
    `SELECT signing_secret_cipher FROM webhooks.subscriptions WHERE id = $1 LIMIT 1`,
    [subscriptionId],
  );
  return result.rows[0]?.signing_secret_cipher ?? null;
}
