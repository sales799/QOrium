import type { Pool } from '@qorium/db';
import { computeAuditHash } from './audit-hash.js';

/**
 * Async audit log writer. Per D3 §5 + CTO Architecture §11.1 every API call
 * involving an API key is logged to `audit.events`.
 *
 * This helper is designed to be called fire-and-forget from request middleware:
 *  - It never throws; insertion errors are caught and forwarded to the optional
 *    `onError` callback so the caller can log them via the request logger.
 *  - It never blocks the response; callers should `void recordAuditEvent(...)`
 *    rather than `await`ing it.
 *
 * Sprint 4.4.3 — `hash_current` is computed synchronously per event
 * (SHA-256 of canonical JSON form) and persisted to `audit.events`.
 * `hash_previous` is materialized asynchronously by a periodic job
 * (Sprint 4.4.3.1) so writes never serialize on the prior row.
 */

export interface AuditEvent {
  actor_type: 'user' | 'api_key' | 'system' | 'scheduled_job';
  actor_id?: string | null;
  /**
   * Tenant scope for the Audit Log API's org-wide read endpoint (Sprint 4.4.1).
   * Optional for legacy callers; system / scheduled-job events typically leave
   * this null. Recruiter-context handlers should pass `req.recruiter.tenantId`.
   */
  tenant_id?: string | null;
  event_type: string;
  entity_type?: string | undefined;
  entity_id?: string | undefined;
  changes?: Record<string, unknown> | undefined;
  payload?: Record<string, unknown> | undefined;
  ip_address?: string | undefined;
  user_agent?: string | undefined;
}

export interface RecordAuditOptions {
  pool: Pool;
  event: AuditEvent;
  onError?: (err: unknown) => void;
}

const INSERT_SQL = `
  INSERT INTO audit.events (
    actor_type, actor_id, tenant_id, event_type, entity_type, entity_id,
    changes, payload, ip_address, user_agent, hash_current
  ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::inet, $10, $11)
`;

export async function recordAuditEvent(options: RecordAuditOptions): Promise<void> {
  const { pool, event, onError } = options;
  try {
    const hash = computeAuditHash({
      actor_type: event.actor_type,
      actor_id: event.actor_id ?? null,
      tenant_id: event.tenant_id ?? null,
      event_type: event.event_type,
      entity_type: event.entity_type ?? null,
      entity_id: event.entity_id ?? null,
      changes: event.changes ?? null,
      payload: event.payload ?? null,
      ip_address: event.ip_address ?? null,
      user_agent: event.user_agent ?? null,
    });
    await pool.query(INSERT_SQL, [
      event.actor_type,
      event.actor_id ?? null,
      event.tenant_id ?? null,
      event.event_type,
      event.entity_type ?? null,
      event.entity_id ?? null,
      JSON.stringify(event.changes ?? {}),
      JSON.stringify(event.payload ?? {}),
      event.ip_address ?? null,
      event.user_agent ?? null,
      hash,
    ]);
  } catch (err) {
    onError?.(err);
  }
}
