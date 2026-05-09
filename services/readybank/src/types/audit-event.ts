/**
 * Sprint 4.4.1 — Audit Log API types (tenant-scoped).
 *
 * Maps the canonical `audit.events` schema (migration 0001 +
 * 0010_audit_events_tenant_id.sql) onto the customer-facing envelope from
 * `infra/Audit-Log-API-Spec-v0.md` §5.
 *
 * Field-name aliasing (DB → API):
 *   event_type  → action
 *   entity_type → resource_type
 *   entity_id   → resource_id
 *   changes     → split into old_values (changes.before) + new_values (changes.after)
 *   payload     → details
 *   occurred_at → timestamp (ISO 8601 UTC)
 *   tenant_id   → tenant_id (passthrough; nullable for legacy rows)
 *
 * Sprint 4.4 v0 scoped events by `actor_id = recruiter.id`. Sprint 4.4.1
 * adds the `tenant_id` column and the API now scopes by
 * `tenant_id = recruiter.tenantId` with a transitional OR-fallback for
 * legacy rows where `tenant_id IS NULL` — see repository.
 */

export interface AuditEventRow {
  id: string;
  actor_id: string | null;
  actor_type: string;
  /** Tenant scope (Sprint 4.4.1). Nullable for legacy rows + system events. */
  tenant_id: string | null;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  changes: Record<string, unknown> | null;
  payload: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  occurred_at: Date;
}

export interface AuditEventEnvelope {
  id: string;
  timestamp: string;
  action: string;
  actor_id: string | null;
  actor_type: string;
  tenant_id: string | null;
  resource_type: string | null;
  resource_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
}

export interface AuditCursor {
  occurred_at: string;
  id: string;
}

export class InvalidAuditCursorError extends Error {
  constructor(message = 'Audit cursor is malformed') {
    super(message);
    this.name = 'InvalidAuditCursorError';
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function encodeAuditCursor(c: AuditCursor): string {
  const json = JSON.stringify({ o: c.occurred_at, i: c.id });
  return Buffer.from(json, 'utf8').toString('base64url');
}

export function decodeAuditCursor(raw: string): AuditCursor {
  let text: string;
  try {
    text = Buffer.from(raw, 'base64url').toString('utf8');
  } catch {
    throw new InvalidAuditCursorError();
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new InvalidAuditCursorError();
  }
  if (typeof parsed !== 'object' || parsed === null) throw new InvalidAuditCursorError();
  const obj = parsed as { o?: unknown; i?: unknown };
  if (typeof obj.o !== 'string' || typeof obj.i !== 'string') {
    throw new InvalidAuditCursorError();
  }
  if (!UUID_PATTERN.test(obj.i)) throw new InvalidAuditCursorError('Cursor id is not a UUID');
  if (Number.isNaN(Date.parse(obj.o))) {
    throw new InvalidAuditCursorError('Cursor timestamp is invalid');
  }
  return { occurred_at: obj.o, id: obj.i };
}

export function rowToEnvelope(row: AuditEventRow): AuditEventEnvelope {
  const changes = row.changes ?? null;
  const before = isRecord(changes?.['before'])
    ? (changes['before'] as Record<string, unknown>)
    : null;
  const after = isRecord(changes?.['after']) ? (changes['after'] as Record<string, unknown>) : null;
  return {
    id: row.id,
    timestamp: row.occurred_at.toISOString(),
    action: row.event_type,
    actor_id: row.actor_id,
    actor_type: row.actor_type,
    tenant_id: row.tenant_id,
    resource_type: row.entity_type,
    resource_id: row.entity_id,
    old_values: before,
    new_values: after,
    details: row.payload ?? {},
    ip_address: row.ip_address,
    user_agent: row.user_agent,
  };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export interface AuditSummaryByAction {
  action: string;
  count: number;
}

export interface AuditSummary {
  total: number;
  window_start: string;
  window_end: string;
  top_actions: AuditSummaryByAction[];
}
