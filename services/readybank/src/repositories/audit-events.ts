import type { Pool } from '@qorium/db';
import type {
  AuditCursor,
  AuditEventRow,
  AuditSummary,
  AuditSummaryByAction,
} from '../types/audit-event.js';

/**
 * Sprint 4.4 v0 — Audit Log repository.
 *
 * Read-only over `audit.events`. Every method scopes by `actor_id` so a
 * recruiter sees only their own events; org-wide scoping awaits the
 * `tenant_id` column on `audit.events` (Sprint 4.4.1).
 *
 * Pagination follows the (occurred_at DESC, id DESC) tuple so concurrent
 * inserts cannot duplicate or skip rows. Default + max page size from
 * `infra/Audit-Log-API-Spec-v0.md` §3 (200 rows max per page).
 */

export interface ListAuditEventsParams {
  actorId: string;
  eventType?: string | undefined;
  entityType?: string | undefined;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  limit: number;
  cursor?: AuditCursor | undefined;
}

export interface ListAuditEventsResult {
  rows: AuditEventRow[];
  next_cursor: AuditCursor | null;
}

const SELECT_COLUMNS = `
  id,
  actor_id,
  actor_type,
  event_type,
  entity_type,
  entity_id,
  changes,
  COALESCE(payload, '{}'::jsonb) AS payload,
  ip_address::text AS ip_address,
  user_agent,
  occurred_at
`;

export async function listAuditEvents(
  pool: Pool,
  p: ListAuditEventsParams,
): Promise<ListAuditEventsResult> {
  const conditions: string[] = ['actor_id = $1'];
  const params: unknown[] = [p.actorId];
  if (p.eventType) {
    params.push(p.eventType);
    conditions.push(`event_type = $${params.length}`);
  }
  if (p.entityType) {
    params.push(p.entityType);
    conditions.push(`entity_type = $${params.length}`);
  }
  if (p.startDate) {
    params.push(p.startDate);
    conditions.push(`occurred_at >= $${params.length}`);
  }
  if (p.endDate) {
    params.push(p.endDate);
    conditions.push(`occurred_at <= $${params.length}`);
  }
  if (p.cursor) {
    params.push(p.cursor.occurred_at);
    params.push(p.cursor.id);
    conditions.push(
      `(occurred_at, id) < ($${params.length - 1}::timestamptz, $${params.length}::uuid)`,
    );
  }
  params.push(p.limit + 1); // fetch one extra to detect next page
  const sql = `
    SELECT ${SELECT_COLUMNS}
      FROM audit.events
     WHERE ${conditions.join(' AND ')}
     ORDER BY occurred_at DESC, id DESC
     LIMIT $${params.length}
  `;
  const result = await pool.query<AuditEventRow>(sql, params);
  const rows = result.rows.slice(0, p.limit);
  const hasMore = result.rows.length > p.limit;
  const tail = rows[rows.length - 1];
  const next_cursor: AuditCursor | null =
    hasMore && tail ? { occurred_at: tail.occurred_at.toISOString(), id: tail.id } : null;
  return { rows, next_cursor };
}

export async function getAuditEventById(
  pool: Pool,
  actorId: string,
  id: string,
): Promise<AuditEventRow | null> {
  const result = await pool.query<AuditEventRow>(
    `SELECT ${SELECT_COLUMNS}
       FROM audit.events
      WHERE id = $1 AND actor_id = $2
      LIMIT 1`,
    [id, actorId],
  );
  return result.rows[0] ?? null;
}

export interface SummaryParams {
  actorId: string;
  startDate: Date;
  endDate: Date;
  topN: number;
}

export async function summariseAuditEvents(pool: Pool, p: SummaryParams): Promise<AuditSummary> {
  const totalResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
       FROM audit.events
      WHERE actor_id = $1
        AND occurred_at >= $2
        AND occurred_at <= $3`,
    [p.actorId, p.startDate, p.endDate],
  );
  const topResult = await pool.query<{ action: string; count: string }>(
    `SELECT event_type AS action, COUNT(*)::text AS count
       FROM audit.events
      WHERE actor_id = $1
        AND occurred_at >= $2
        AND occurred_at <= $3
      GROUP BY event_type
      ORDER BY COUNT(*) DESC, event_type ASC
      LIMIT $4`,
    [p.actorId, p.startDate, p.endDate, p.topN],
  );
  const top_actions: AuditSummaryByAction[] = topResult.rows.map((r) => ({
    action: r.action,
    count: Number.parseInt(r.count, 10),
  }));
  const totalRaw = totalResult.rows[0]?.count ?? '0';
  return {
    total: Number.parseInt(totalRaw, 10),
    window_start: p.startDate.toISOString(),
    window_end: p.endDate.toISOString(),
    top_actions,
  };
}
