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
import type { Config } from '../config.js';

/**
 * Sprint 4.4.1 — Audit Log API (tenant-scoped).
 *
 * Read-only externalisation of `audit.events` per
 * `infra/Audit-Log-API-Spec-v0.md`. Phase 1 ships GET list / detail /
 * summary; export + webhook integration land in Sprint 4.4.2+.
 *
 * Auth: existing recruiter cookie session (Sprint 1.6 JWT). v1 scopes
 * results by `tenant_id = recruiter.tenantId` with a transitional
 * OR-fallback to `actor_id = recruiter.id` for v0-era events whose
 * tenant_id is still NULL (see repository comment).
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
  return { ListQuerySchema, SummaryQuerySchema };
}
