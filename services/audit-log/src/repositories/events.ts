import type { Pool } from '@qorium/db';
import { buildListSql, buildSummarySql, type ListQueryInputs } from '../query.js';

export interface AuditEventRow {
  id: string;
  tenantId: string | null;
  actorId: string | null;
  actorType: string;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  changes: unknown;
  payload: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  occurredAt: string;
}

interface RawRow {
  id: string;
  tenant_id: string | null;
  actor_id: string | null;
  actor_type: string;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  changes: unknown;
  payload: unknown;
  ip_address: string | null;
  user_agent: string | null;
  occurred_at: Date;
}

function toRow(r: RawRow): AuditEventRow {
  return {
    id: r.id,
    tenantId: r.tenant_id,
    actorId: r.actor_id,
    actorType: r.actor_type,
    action: r.event_type,
    resourceType: r.entity_type,
    resourceId: r.entity_id,
    changes: r.changes,
    payload: r.payload,
    ipAddress: r.ip_address,
    userAgent: r.user_agent,
    occurredAt: r.occurred_at.toISOString(),
  };
}

export interface ListEventsResult {
  events: AuditEventRow[];
  total: number;
  limit: number;
  offset: number;
}

export async function listEvents(pool: Pool, inputs: ListQueryInputs): Promise<ListEventsResult> {
  const built = buildListSql(inputs);
  const [list, count] = await Promise.all([
    pool.query<RawRow>(built.sql, built.params),
    pool.query<{ total: string | number }>(built.countSql, built.countParams),
  ]);
  return {
    events: list.rows.map(toRow),
    total: Number(count.rows[0]?.total ?? 0),
    limit: inputs.limit,
    offset: inputs.offset,
  };
}

export async function getEventById(
  pool: Pool,
  tenantId: string,
  id: string,
): Promise<AuditEventRow | null> {
  const result = await pool.query<RawRow>(
    `SELECT id, tenant_id, actor_id, actor_type, event_type, entity_type,
            entity_id, changes, payload, ip_address, user_agent, occurred_at
       FROM audit.events
      WHERE tenant_id = $1 AND id = $2
      LIMIT 1`,
    [tenantId, id],
  );
  return result.rows[0] ? toRow(result.rows[0]) : null;
}

export interface SummaryRow {
  action: string;
  count: number;
}

export async function summarise(
  pool: Pool,
  tenantId: string,
  startDate?: string,
  endDate?: string,
  topN = 10,
): Promise<SummaryRow[]> {
  const inputs: Parameters<typeof buildSummarySql>[0] = { tenantId, topN };
  if (startDate) inputs.startDate = startDate;
  if (endDate) inputs.endDate = endDate;
  const built = buildSummarySql(inputs);
  const result = await pool.query<{ action: string; count: number | string }>(
    built.sql,
    built.params,
  );
  return result.rows.map((r) => ({ action: r.action, count: Number(r.count) }));
}

export interface RecordEventInput {
  tenantId: string | null;
  actorId: string | null;
  actorType?: string;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  changes?: unknown;
  payload?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function recordEvent(pool: Pool, input: RecordEventInput): Promise<AuditEventRow> {
  const result = await pool.query<RawRow>(
    `INSERT INTO audit.events
       (tenant_id, actor_id, actor_type, event_type, entity_type, entity_id,
        changes, payload, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id, tenant_id, actor_id, actor_type, event_type, entity_type,
               entity_id, changes, payload, ip_address, user_agent, occurred_at`,
    [
      input.tenantId,
      input.actorId,
      input.actorType ?? 'system',
      input.action,
      input.resourceType ?? null,
      input.resourceId ?? null,
      input.changes ?? null,
      input.payload ?? {},
      input.ipAddress ?? null,
      input.userAgent ?? null,
    ],
  );
  const row = result.rows[0];
  if (!row) throw new Error('recordEvent: insert returned no row');
  return toRow(row);
}
