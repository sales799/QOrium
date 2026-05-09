import type { Pool } from '@qorium/db';

/**
 * Async audit log writer. Per D3 §5 + CTO Architecture §11.1 every API call
 * involving an API key is logged to `audit.events`.
 *
 * This helper is designed to be called fire-and-forget from request middleware:
 *  - It never throws; insertion errors are caught and forwarded to the optional
 *    `onError` callback so the caller can log them via the request logger.
 *  - It never blocks the response; callers should `void recordAuditEvent(...)`
 *    rather than `await`ing it.
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
    changes, payload, ip_address, user_agent
  ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::inet, $10)
`;

export async function recordAuditEvent(options: RecordAuditOptions): Promise<void> {
  const { pool, event, onError } = options;
  try {
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
    ]);
  } catch (err) {
    onError?.(err);
  }
}
