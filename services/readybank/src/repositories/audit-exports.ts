import type { Pool } from '@qorium/db';
import type { AuditEventEnvelope } from '../types/audit-event.js';

/**
 * Sprint 4.4.2 — Audit Log export-job repository.
 *
 * `app.audit_export_jobs` is scoped via the same SCOPE_CLAUSE as
 * `audit.events`: `(tenant_id = $1 OR (tenant_id IS NULL AND actor_id = $2))`.
 * That keeps the export surface symmetric with the read surface so a
 * recruiter can never see another recruiter's job (or any job from a
 * different tenant).
 *
 * v0 persists the rendered export in `content BYTEA`. Sprint 4.4.2.1
 * promotes to S3-backed storage with signed URLs.
 */

export type ExportFormat = 'csv' | 'json';
export type ExportStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'expired';

export interface AuditExportJobRow {
  id: string;
  tenant_id: string | null;
  actor_id: string | null;
  format: ExportFormat;
  filters_json: Record<string, unknown>;
  start_date: Date | null;
  end_date: Date | null;
  status: ExportStatus;
  error_message: string | null;
  row_count: number | null;
  content_type: string | null;
  created_at: Date;
  completed_at: Date | null;
  expires_at: Date;
}

export interface AuditExportJobContent {
  content: Buffer;
  content_type: string;
}

const SCOPE_CLAUSE = `(tenant_id = $1 OR (tenant_id IS NULL AND actor_id = $2))`;

const SELECT_COLUMNS = `
  id,
  tenant_id,
  actor_id,
  format,
  COALESCE(filters_json, '{}'::jsonb) AS filters_json,
  start_date,
  end_date,
  status,
  error_message,
  row_count,
  content_type,
  created_at,
  completed_at,
  expires_at
`;

export interface CreateJobParams {
  tenantId: string | null;
  actorId: string;
  format: ExportFormat;
  filters: Record<string, unknown>;
  startDate: Date | null;
  endDate: Date | null;
}

export async function createAuditExportJob(
  pool: Pool,
  p: CreateJobParams,
): Promise<AuditExportJobRow> {
  const result = await pool.query<AuditExportJobRow>(
    `INSERT INTO app.audit_export_jobs
       (tenant_id, actor_id, format, filters_json, start_date, end_date)
     VALUES ($1, $2, $3, $4::jsonb, $5, $6)
     RETURNING ${SELECT_COLUMNS}`,
    [p.tenantId, p.actorId, p.format, JSON.stringify(p.filters), p.startDate, p.endDate],
  );
  const row = result.rows[0];
  if (!row) throw new Error('audit-export: insert returned no row');
  return row;
}

export async function getAuditExportJobById(
  pool: Pool,
  tenantId: string,
  actorId: string,
  id: string,
): Promise<AuditExportJobRow | null> {
  const result = await pool.query<AuditExportJobRow>(
    `SELECT ${SELECT_COLUMNS}
       FROM app.audit_export_jobs
      WHERE id = $3 AND ${SCOPE_CLAUSE}
      LIMIT 1`,
    [tenantId, actorId, id],
  );
  return result.rows[0] ?? null;
}

export async function getAuditExportJobContentById(
  pool: Pool,
  tenantId: string,
  actorId: string,
  id: string,
): Promise<AuditExportJobContent | null> {
  const result = await pool.query<{ content: Buffer | null; content_type: string | null }>(
    `SELECT content, content_type
       FROM app.audit_export_jobs
      WHERE id = $3
        AND status = 'completed'
        AND expires_at > NOW()
        AND ${SCOPE_CLAUSE}
      LIMIT 1`,
    [tenantId, actorId, id],
  );
  const row = result.rows[0];
  if (!row || !row.content || !row.content_type) return null;
  return { content: row.content, content_type: row.content_type };
}

export async function countActiveAuditExportJobs(
  pool: Pool,
  tenantId: string,
  actorId: string,
): Promise<number> {
  const result = await pool.query<{ n: string }>(
    `SELECT COUNT(*)::text AS n
       FROM app.audit_export_jobs
      WHERE status IN ('queued', 'processing')
        AND ${SCOPE_CLAUSE}`,
    [tenantId, actorId],
  );
  return Number.parseInt(result.rows[0]?.n ?? '0', 10);
}

export interface MarkCompletedParams {
  id: string;
  rowCount: number;
  contentType: string;
  content: Buffer;
}

export async function markAuditExportJobCompleted(
  pool: Pool,
  p: MarkCompletedParams,
): Promise<void> {
  await pool.query(
    `UPDATE app.audit_export_jobs
        SET status = 'completed',
            row_count = $2,
            content_type = $3,
            content = $4,
            completed_at = NOW()
      WHERE id = $1`,
    [p.id, p.rowCount, p.contentType, p.content],
  );
}

export async function markAuditExportJobFailed(
  pool: Pool,
  id: string,
  errorMessage: string,
): Promise<void> {
  await pool.query(
    `UPDATE app.audit_export_jobs
        SET status = 'failed',
            error_message = $2,
            completed_at = NOW()
      WHERE id = $1`,
    [id, errorMessage.slice(0, 4000)],
  );
}

/**
 * Render an array of envelopes to CSV (RFC 4180) or JSON. Bytes returned
 * synchronously — caller stores in `content` BYTEA.
 */
export function renderAuditEventsExport(
  envelopes: AuditEventEnvelope[],
  format: ExportFormat,
): { content: Buffer; contentType: string } {
  if (format === 'json') {
    const body = JSON.stringify({ events: envelopes }, null, 2);
    return { content: Buffer.from(body, 'utf8'), contentType: 'application/json; charset=utf-8' };
  }
  return {
    content: Buffer.from(renderCsv(envelopes), 'utf8'),
    contentType: 'text/csv; charset=utf-8',
  };
}

const CSV_COLUMNS = [
  'id',
  'timestamp',
  'action',
  'actor_id',
  'actor_type',
  'tenant_id',
  'resource_type',
  'resource_id',
  'http_status',
  'ip_address',
  'user_agent',
  'old_values',
  'new_values',
  'details',
] as const;

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text =
    typeof value === 'string'
      ? value
      : typeof value === 'number' || typeof value === 'boolean'
        ? String(value)
        : JSON.stringify(value);
  if (text.includes('"') || text.includes(',') || text.includes('\n') || text.includes('\r')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function renderCsv(envelopes: AuditEventEnvelope[]): string {
  const lines: string[] = [];
  lines.push(CSV_COLUMNS.join(','));
  for (const e of envelopes) {
    const row: Record<string, unknown> = {
      id: e.id,
      timestamp: e.timestamp,
      action: e.action,
      actor_id: e.actor_id,
      actor_type: e.actor_type,
      tenant_id: e.tenant_id,
      resource_type: e.resource_type,
      resource_id: e.resource_id,
      http_status: null, // not in current envelope; placeholder for spec parity
      ip_address: e.ip_address,
      user_agent: e.user_agent,
      old_values: e.old_values,
      new_values: e.new_values,
      details: e.details,
    };
    lines.push(CSV_COLUMNS.map((c) => csvCell(row[c])).join(','));
  }
  return `${lines.join('\r\n')}\r\n`;
}
