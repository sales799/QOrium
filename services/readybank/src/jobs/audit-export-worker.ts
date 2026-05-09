import type { Pool } from '@qorium/db';
import { listAuditEvents } from '../repositories/audit-events.js';
import {
  markAuditExportJobCompleted,
  markAuditExportJobFailed,
  renderAuditEventsExport,
  type ExportFormat,
} from '../repositories/audit-exports.js';
import { rowToEnvelope } from '../types/audit-event.js';

/**
 * Sprint 4.4.2 — Audit Log export-job worker (synchronous v0).
 *
 * Runs in-process via `setImmediate` (kicked off from the POST handler) so
 * the API response returns the 202 Accepted body without blocking. The
 * worker fetches matching audit events using the same SCOPE_CLAUSE that
 * powers /v1/audit/events, renders to CSV or JSON, and stores the bytes
 * back to `app.audit_export_jobs.content`.
 *
 * v0 cap: MAX_ROWS = 10_000 per export. The spec allows up to 100K but
 * single-shot pagination would require looping — Sprint 4.4.2.1 promotes
 * this worker to a real distributed job + S3-backed storage.
 *
 * Errors: caught and persisted via markAuditExportJobFailed so the GET
 * status endpoint surfaces them. The function never throws.
 */

const MAX_ROWS = 10_000;

export interface RunExportJobParams {
  pool: Pool;
  jobId: string;
  tenantId: string;
  actorId: string;
  format: ExportFormat;
  startDate: Date | null;
  endDate: Date | null;
  /** Optional event_type whitelist; OR-of-eq applied at materialization. */
  actions?: string[] | undefined;
  resourceType?: string | undefined;
  /** Optional injected logger for diagnostics. Falls back to silent. */
  logError?: ((err: unknown, ctx?: Record<string, unknown>) => void) | undefined;
}

export async function runAuditExportJob(p: RunExportJobParams): Promise<void> {
  try {
    const { rows } = await listAuditEvents(p.pool, {
      actorId: p.actorId,
      tenantId: p.tenantId,
      eventType: p.actions && p.actions.length === 1 ? p.actions[0] : undefined,
      entityType: p.resourceType,
      startDate: p.startDate ?? undefined,
      endDate: p.endDate ?? undefined,
      limit: MAX_ROWS,
      cursor: undefined,
    });

    let envelopes = rows.map(rowToEnvelope);
    // listAuditEvents only narrows by a single eventType. For multi-action
    // exports we apply the action whitelist client-side here.
    if (p.actions && p.actions.length > 1) {
      const whitelist = new Set(p.actions);
      envelopes = envelopes.filter((e) => whitelist.has(e.action));
    }

    const { content, contentType } = renderAuditEventsExport(envelopes, p.format);
    await markAuditExportJobCompleted(p.pool, {
      id: p.jobId,
      rowCount: envelopes.length,
      contentType,
      content,
    });
  } catch (err) {
    p.logError?.(err, { jobId: p.jobId });
    try {
      await markAuditExportJobFailed(
        p.pool,
        p.jobId,
        err instanceof Error ? err.message : 'unknown export error',
      );
    } catch (failErr) {
      p.logError?.(failErr, { jobId: p.jobId, phase: 'mark-failed' });
    }
  }
}

/**
 * Schedule the worker to run after the current request's response flushes.
 * Returns a promise that resolves when the worker has finished — useful in
 * tests; production callers can `void scheduleAuditExportJob(...)`.
 */
export function scheduleAuditExportJob(p: RunExportJobParams): Promise<void> {
  return new Promise((resolve) => {
    setImmediate(() => {
      void runAuditExportJob(p).then(resolve);
    });
  });
}

export const _internal = { MAX_ROWS };
