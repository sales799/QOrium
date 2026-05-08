import { Router, type Request } from 'express';
import { z } from 'zod';
import type { Pool } from '@qorium/db';
import { HttpProblem } from '../middleware/problem.js';
import { recruiterAuth, type RecruiterRequest } from '../middleware/recruiter-auth.js';
import {
  decodeAuditCursor,
  encodeAuditCursor,
  InvalidAuditCursorError,
  rowToEnvelope,
} from '../types/audit-event.js';
import {
  getAuditEventById,
  listAuditEvents,
  summariseAuditEvents,
} from '../repositories/audit-events.js';
import {
  countActiveAuditExportJobs,
  createAuditExportJob,
  getAuditExportJobById,
  getAuditExportJobContentById,
  type AuditExportJobRow,
} from '../repositories/audit-exports.js';
import { scheduleAuditExportJob } from '../jobs/audit-export-worker.js';
import type { Config } from '../config.js';

/**
 * Sprint 4.4.2 — Audit Log API (tenant-scoped reads + bulk export).
 *
 * Read-only externalisation of `audit.events` per
 * `infra/Audit-Log-API-Spec-v0.md`. Surface area:
 *
 *   GET  /v1/audit/events                  — list (cursor-paginated)
 *   GET  /v1/audit/events/:id              — single event
 *   GET  /v1/audit/summary                 — aggregate over a window
 *   POST /v1/audit/events/export           — async bulk export (Sprint 4.4.2)
 *   GET  /v1/audit/exports/:id             — poll job status
 *   GET  /v1/audit/exports/:id/download    — stream completed bytes
 *
 * Auth: existing recruiter cookie session (Sprint 1.6 JWT). Scopes results
 * by `tenant_id = recruiter.tenantId` with a transitional OR-fallback to
 * `actor_id = recruiter.id` for v0-era events whose tenant_id is still NULL
 * (see services/readybank/src/repositories/audit-events.ts).
 *
 * Export jobs (Sprint 4.4.2 v0): synchronous in-process worker writes the
 * rendered bytes to `app.audit_export_jobs.content`. Real distributed worker
 * + S3-backed storage is Sprint 4.4.2.1.
 *
 * Routes are mounted at `/v1/audit/*`.
 */

export interface AuditRouterDeps {
  pool: Pool;
  config: Config;
}

const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EVENT_TYPE_PATTERN = /^[a-z0-9._-]{1,128}$/;
const ENTITY_TYPE_PATTERN = /^[a-z0-9._-]{1,64}$/;
const ISO_OR_DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/;

const ListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  cursor: z.string().min(1).optional(),
  action: z.string().regex(EVENT_TYPE_PATTERN).optional(),
  resource_type: z.string().regex(ENTITY_TYPE_PATTERN).optional(),
  start_date: z.string().regex(ISO_OR_DATE_PATTERN).optional(),
  end_date: z.string().regex(ISO_OR_DATE_PATTERN).optional(),
});

const SummaryQuerySchema = z.object({
  start_date: z.string().regex(ISO_OR_DATE_PATTERN).optional(),
  end_date: z.string().regex(ISO_OR_DATE_PATTERN).optional(),
  top_n: z.coerce.number().int().min(1).max(50).default(10),
});

const MAX_ACTIVE_EXPORT_JOBS = 5;
const MAX_EXPORT_RANGE_DAYS = 366;

const ExportBodySchema = z.object({
  format: z.enum(['csv', 'json']),
  start_date: z.string().regex(ISO_OR_DATE_PATTERN).optional(),
  end_date: z.string().regex(ISO_OR_DATE_PATTERN).optional(),
  actions: z.array(z.string().regex(EVENT_TYPE_PATTERN)).max(50).optional(),
  resource_type: z.string().regex(ENTITY_TYPE_PATTERN).optional(),
});

function parseDateOrThrow(raw: string, field: string): Date {
  const ms = Date.parse(raw);
  if (Number.isNaN(ms)) {
    throw new HttpProblem({
      status: 400,
      title: 'audit/invalid-query',
      detail: `${field} is not a valid ISO 8601 date`,
    });
  }
  return new Date(ms);
}

function exportFilenameFor(job: AuditExportJobRow): string {
  const ext = job.format === 'json' ? 'json' : 'csv';
  return `qorium-audit-${job.id}.${ext}`;
}

function jobStatusEnvelope(job: AuditExportJobRow): Record<string, unknown> {
  const downloadUrl = job.status === 'completed' ? `/v1/audit/exports/${job.id}/download` : null;
  return {
    job_id: job.id,
    format: job.format,
    status: job.status,
    row_count: job.row_count,
    error_message: job.error_message,
    created_at: job.created_at.toISOString(),
    completed_at: job.completed_at !== null ? job.completed_at.toISOString() : null,
    expires_at: job.expires_at.toISOString(),
    download_url: downloadUrl,
  };
}

export function auditRouter(deps: AuditRouterDeps): Router {
  const router = Router();
  const auth = recruiterAuth({
    jwtSecret: deps.config.jwtSecret ?? '',
    cookieSecure: deps.config.cookieSecure,
  });

  // GET /v1/audit/events ────────────────────────────────────────────
  router.get('/v1/audit/events', auth, async (req: Request, res, next) => {
    try {
      const recruiter = (req as RecruiterRequest).recruiter;
      if (!recruiter) {
        throw new HttpProblem({ status: 401, title: 'audit/unauthorized' });
      }
      const parsed = ListQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new HttpProblem({
          status: 400,
          title: 'audit/invalid-query',
          detail: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        });
      }
      const q = parsed.data;
      const cursor = q.cursor ? safeDecodeCursor(q.cursor) : undefined;
      const startDate = q.start_date ? parseDateOrThrow(q.start_date, 'start_date') : undefined;
      const endDate = q.end_date ? parseDateOrThrow(q.end_date, 'end_date') : undefined;
      if (startDate && endDate && startDate > endDate) {
        throw new HttpProblem({
          status: 400,
          title: 'audit/invalid-query',
          detail: 'start_date must be on or before end_date',
        });
      }
      const { rows, next_cursor } = await listAuditEvents(deps.pool, {
        actorId: recruiter.id,
        tenantId: recruiter.tenantId,
        eventType: q.action,
        entityType: q.resource_type,
        startDate,
        endDate,
        limit: q.limit,
        cursor,
      });
      res.json({
        events: rows.map(rowToEnvelope),
        next_cursor: next_cursor ? encodeAuditCursor(next_cursor) : null,
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /v1/audit/events/:id ────────────────────────────────────────
  router.get('/v1/audit/events/:id', auth, async (req: Request, res, next) => {
    try {
      const recruiter = (req as RecruiterRequest).recruiter;
      if (!recruiter) {
        throw new HttpProblem({ status: 401, title: 'audit/unauthorized' });
      }
      const idRaw = req.params['id'];
      const id = typeof idRaw === 'string' ? idRaw : '';
      if (!ID_PATTERN.test(id)) {
        throw new HttpProblem({ status: 400, title: 'audit/invalid-id' });
      }
      const row = await getAuditEventById(deps.pool, recruiter.tenantId, recruiter.id, id);
      if (!row) {
        throw new HttpProblem({ status: 404, title: 'audit/event-not-found' });
      }
      res.json({ event: rowToEnvelope(row) });
    } catch (err) {
      next(err);
    }
  });

  // GET /v1/audit/summary ───────────────────────────────────────────
  router.get('/v1/audit/summary', auth, async (req: Request, res, next) => {
    try {
      const recruiter = (req as RecruiterRequest).recruiter;
      if (!recruiter) {
        throw new HttpProblem({ status: 401, title: 'audit/unauthorized' });
      }
      const parsed = SummaryQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new HttpProblem({
          status: 400,
          title: 'audit/invalid-query',
          detail: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        });
      }
      const now = new Date();
      const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const startDate = parsed.data.start_date
        ? parseDateOrThrow(parsed.data.start_date, 'start_date')
        : defaultStart;
      const endDate = parsed.data.end_date
        ? parseDateOrThrow(parsed.data.end_date, 'end_date')
        : now;
      if (startDate > endDate) {
        throw new HttpProblem({
          status: 400,
          title: 'audit/invalid-query',
          detail: 'start_date must be on or before end_date',
        });
      }
      const summary = await summariseAuditEvents(deps.pool, {
        actorId: recruiter.id,
        tenantId: recruiter.tenantId,
        startDate,
        endDate,
        topN: parsed.data.top_n,
      });
      res.json({ summary });
    } catch (err) {
      next(err);
    }
  });

  // POST /v1/audit/events/export ────────────────────────────────────
  router.post('/v1/audit/events/export', auth, async (req: Request, res, next) => {
    try {
      const recruiter = (req as RecruiterRequest).recruiter;
      if (!recruiter) {
        throw new HttpProblem({ status: 401, title: 'audit/unauthorized' });
      }
      const parsed = ExportBodySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new HttpProblem({
          status: 400,
          title: 'audit/invalid-body',
          detail: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        });
      }
      const body = parsed.data;
      const startDate = body.start_date ? parseDateOrThrow(body.start_date, 'start_date') : null;
      const endDate = body.end_date ? parseDateOrThrow(body.end_date, 'end_date') : null;
      if (startDate && endDate && startDate > endDate) {
        throw new HttpProblem({
          status: 400,
          title: 'audit/invalid-body',
          detail: 'start_date must be on or before end_date',
        });
      }
      if (startDate && endDate) {
        const spanDays = (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000);
        if (spanDays > MAX_EXPORT_RANGE_DAYS) {
          throw new HttpProblem({
            status: 400,
            title: 'audit/range-too-large',
            detail: `date range may not exceed ${MAX_EXPORT_RANGE_DAYS} days`,
          });
        }
      }

      // Concurrency limit per spec §7: max 5 active jobs per tenant.
      const active = await countActiveAuditExportJobs(deps.pool, recruiter.tenantId, recruiter.id);
      if (active >= MAX_ACTIVE_EXPORT_JOBS) {
        throw new HttpProblem({
          status: 429,
          title: 'audit/too-many-active-exports',
          detail: `you have ${active} active export jobs; max ${MAX_ACTIVE_EXPORT_JOBS} concurrent per tenant`,
        });
      }

      const job = await createAuditExportJob(deps.pool, {
        tenantId: recruiter.tenantId,
        actorId: recruiter.id,
        format: body.format,
        filters: {
          actions: body.actions ?? null,
          resource_type: body.resource_type ?? null,
        },
        startDate,
        endDate,
      });

      // Kick off the worker; never await — keep response snappy. Tests
      // can opt-in to awaiting via the exposed scheduleAuditExportJob.
      void scheduleAuditExportJob({
        pool: deps.pool,
        jobId: job.id,
        tenantId: recruiter.tenantId,
        actorId: recruiter.id,
        format: body.format,
        startDate,
        endDate,
        actions: body.actions,
        resourceType: body.resource_type,
        logError: (err) => {
          (req as Request & { log?: { warn?: (...args: unknown[]) => void } }).log?.warn?.(
            { err, jobId: job.id },
            'audit-export worker failed',
          );
        },
      });

      res.status(202).json(jobStatusEnvelope(job));
    } catch (err) {
      next(err);
    }
  });

  // GET /v1/audit/exports/:id ───────────────────────────────────────
  router.get('/v1/audit/exports/:id', auth, async (req: Request, res, next) => {
    try {
      const recruiter = (req as RecruiterRequest).recruiter;
      if (!recruiter) {
        throw new HttpProblem({ status: 401, title: 'audit/unauthorized' });
      }
      const idRaw = req.params['id'];
      const id = typeof idRaw === 'string' ? idRaw : '';
      if (!ID_PATTERN.test(id)) {
        throw new HttpProblem({ status: 400, title: 'audit/invalid-id' });
      }
      const job = await getAuditExportJobById(deps.pool, recruiter.tenantId, recruiter.id, id);
      if (!job) {
        throw new HttpProblem({ status: 404, title: 'audit/export-not-found' });
      }
      res.json(jobStatusEnvelope(job));
    } catch (err) {
      next(err);
    }
  });

  // GET /v1/audit/exports/:id/download ──────────────────────────────
  router.get('/v1/audit/exports/:id/download', auth, async (req: Request, res, next) => {
    try {
      const recruiter = (req as RecruiterRequest).recruiter;
      if (!recruiter) {
        throw new HttpProblem({ status: 401, title: 'audit/unauthorized' });
      }
      const idRaw = req.params['id'];
      const id = typeof idRaw === 'string' ? idRaw : '';
      if (!ID_PATTERN.test(id)) {
        throw new HttpProblem({ status: 400, title: 'audit/invalid-id' });
      }
      const job = await getAuditExportJobById(deps.pool, recruiter.tenantId, recruiter.id, id);
      if (!job) {
        throw new HttpProblem({ status: 404, title: 'audit/export-not-found' });
      }
      if (job.status !== 'completed') {
        throw new HttpProblem({
          status: 409,
          title: 'audit/export-not-ready',
          detail: `job status is ${job.status}`,
        });
      }
      if (job.expires_at.getTime() <= Date.now()) {
        throw new HttpProblem({ status: 410, title: 'audit/export-expired' });
      }
      const blob = await getAuditExportJobContentById(
        deps.pool,
        recruiter.tenantId,
        recruiter.id,
        id,
      );
      if (!blob) {
        throw new HttpProblem({ status: 410, title: 'audit/export-expired' });
      }
      const filename = exportFilenameFor(job);
      res.setHeader('Content-Type', blob.content_type);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('Content-Length', String(blob.content.length));
      res.status(200).end(blob.content);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

function safeDecodeCursor(raw: string) {
  try {
    return decodeAuditCursor(raw);
  } catch (err) {
    if (err instanceof InvalidAuditCursorError) {
      throw new HttpProblem({ status: 400, title: 'audit/invalid-cursor', detail: err.message });
    }
    throw err;
  }
}

export function _testHelpers() {
  return { ListQuerySchema, SummaryQuerySchema, ExportBodySchema };
}
