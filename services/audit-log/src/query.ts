/**
 * Pure-logic query builder for the audit-log list endpoint per spec §3.
 *
 * Handles parameter parsing, range/clamp validation, ordering, and
 * SQL fragment + parameter array generation. Keeping it pure means we
 * can unit-test pagination math + filter combinations without a DB.
 *
 * NOTE on column names:
 *   The actual `audit.events` table (migration 0001) ships with these
 *   columns: `event_type`, `entity_type`, `entity_id`, `occurred_at`,
 *   `actor_id`, `actor_type`, `payload`, `changes`, `ip_address`,
 *   `user_agent`. The spec uses `action`/`resource_type`/`created_at`
 *   names that match the SaaS convention; we map the spec names onto
 *   the storage names here so the API matches the spec while the
 *   storage stays unchanged. See
 *   `infra/CTO-deltas/CTO-DELTA-audit-log-naming.md`.
 */

export interface ListQueryInputs {
  tenantId: string;
  /** ISO-8601 timestamp inclusive lower bound. */
  startDate?: string;
  /** ISO-8601 timestamp exclusive upper bound. */
  endDate?: string;
  /** Filter on `event_type` (spec calls this `action`). */
  action?: string;
  /** Filter on `entity_type` (spec calls this `resource_type`). */
  resourceType?: string;
  /** Filter on `entity_id` (spec calls this `resource_id`). */
  resourceId?: string;
  actorId?: string;
  /** 1-based limit. Caller-provided or default. */
  limit: number;
  offset: number;
}

export interface ListQueryParseInputs extends Omit<ListQueryInputs, 'limit' | 'offset'> {
  limit?: number;
  offset?: number;
  defaultLimit: number;
  maxLimit: number;
}

export interface ParsedListInputs extends ListQueryInputs {
  errors: string[];
}

export function parseListInputs(raw: ListQueryParseInputs): ParsedListInputs {
  const errors: string[] = [];
  const limit = clampInt(raw.limit, 1, raw.maxLimit, raw.defaultLimit);
  const offset = clampInt(raw.offset, 0, 1_000_000, 0);
  if (raw.startDate && !isIsoDate(raw.startDate))
    errors.push('start_date is not a valid ISO-8601 timestamp');
  if (raw.endDate && !isIsoDate(raw.endDate))
    errors.push('end_date is not a valid ISO-8601 timestamp');
  if (raw.startDate && raw.endDate && raw.startDate >= raw.endDate)
    errors.push('start_date must be before end_date');
  const out: ParsedListInputs = {
    tenantId: raw.tenantId,
    limit,
    offset,
    errors,
  };
  if (raw.startDate) out.startDate = raw.startDate;
  if (raw.endDate) out.endDate = raw.endDate;
  if (raw.action) out.action = raw.action;
  if (raw.resourceType) out.resourceType = raw.resourceType;
  if (raw.resourceId) out.resourceId = raw.resourceId;
  if (raw.actorId) out.actorId = raw.actorId;
  return out;
}

export interface BuiltSql {
  sql: string;
  params: unknown[];
  countSql: string;
  countParams: unknown[];
}

export function buildListSql(inputs: ListQueryInputs): BuiltSql {
  const where: string[] = ['tenant_id = $1'];
  const params: unknown[] = [inputs.tenantId];
  if (inputs.startDate) {
    params.push(inputs.startDate);
    where.push(`occurred_at >= $${params.length}`);
  }
  if (inputs.endDate) {
    params.push(inputs.endDate);
    where.push(`occurred_at < $${params.length}`);
  }
  if (inputs.action) {
    params.push(inputs.action);
    where.push(`event_type = $${params.length}`);
  }
  if (inputs.resourceType) {
    params.push(inputs.resourceType);
    where.push(`entity_type = $${params.length}`);
  }
  if (inputs.resourceId) {
    params.push(inputs.resourceId);
    where.push(`entity_id = $${params.length}`);
  }
  if (inputs.actorId) {
    params.push(inputs.actorId);
    where.push(`actor_id = $${params.length}`);
  }
  const whereClause = where.join(' AND ');
  const countParams = params.slice();
  params.push(inputs.limit);
  params.push(inputs.offset);
  const sql = `
    SELECT id, tenant_id, actor_id, actor_type, event_type, entity_type,
           entity_id, changes, payload, ip_address, user_agent, occurred_at
      FROM audit.events
     WHERE ${whereClause}
     ORDER BY occurred_at DESC
     LIMIT $${params.length - 1}
    OFFSET $${params.length}
  `.trim();
  const countSql = `SELECT COUNT(*) AS total FROM audit.events WHERE ${whereClause}`;
  return { sql, params, countSql, countParams };
}

export interface SummaryQuery {
  sql: string;
  params: unknown[];
}

/**
 * Aggregated top-N event counts for the given tenant in a window.
 * Returned in the shape expected by spec §3 `/v1/audit/summary`.
 */
export function buildSummarySql(inputs: {
  tenantId: string;
  startDate?: string;
  endDate?: string;
  topN: number;
}): SummaryQuery {
  const where: string[] = ['tenant_id = $1'];
  const params: unknown[] = [inputs.tenantId];
  if (inputs.startDate) {
    params.push(inputs.startDate);
    where.push(`occurred_at >= $${params.length}`);
  }
  if (inputs.endDate) {
    params.push(inputs.endDate);
    where.push(`occurred_at < $${params.length}`);
  }
  params.push(Math.max(1, Math.min(inputs.topN, 50)));
  const sql = `
    SELECT event_type AS action, COUNT(*)::int AS count
      FROM audit.events
     WHERE ${where.join(' AND ')}
     GROUP BY event_type
     ORDER BY count DESC
     LIMIT $${params.length}
  `.trim();
  return { sql, params };
}

function clampInt(value: number | undefined, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(Math.max(Math.trunc(value), min), max);
}

function isIsoDate(value: string): boolean {
  if (!/\d{4}-\d{2}-\d{2}/.test(value)) return false;
  const d = new Date(value);
  return Number.isFinite(d.getTime());
}
