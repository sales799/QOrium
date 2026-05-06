/**
 * Recruiter-side sessions API (Sprints 1.3 + 1.4).
 *
 * 1.3:
 *   POST   /v1/sessions          create a take session for one candidate
 *
 * 1.4:
 *   GET    /v1/sessions          list this recruiter's sessions
 *   GET    /v1/sessions/:id      detail for one session
 *   POST   /v1/sessions/:id/revoke
 */
import { Router } from 'express';
import { z } from 'zod';
import type { Pool } from '@qorium/db';
import { recordAuditEvent } from '@qorium/auth';
import type { Config } from '../config.js';
import { HttpProblem } from '../middleware/problem.js';
import { recruiterAuth, type RecruiterRequest } from '../middleware/recruiter-auth.js';
import {
  createSession,
  findSessionById,
  listSessionsForRecruiter,
  revokeSession,
  type SessionRow,
} from '../repositories/sessions.js';

const CreateSchema = z.object({
  pack_id: z.string().uuid(),
  candidate_email: z.string().email().max(254),
  candidate_name: z.string().min(1).max(200).optional(),
  ttl_days: z.number().int().min(1).max(365).optional(),
});

const ListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'expired', 'revoked']).optional(),
});

export interface SessionsRouterDeps {
  pool: Pool;
  config: Config;
  audit?: boolean;
}

function toPublicSession(s: SessionRow, takeUrl?: string) {
  return {
    id: s.id,
    pack_id: s.pack_id,
    recruiter_id: s.recruiter_id,
    candidate_email: s.candidate_email,
    candidate_name: s.candidate_name,
    status: s.status,
    current_question_index: s.current_question_index,
    answers_count: s.answers?.length ?? 0,
    score_total: s.score_total ? Number(s.score_total) : null,
    score_max: s.score_max ? Number(s.score_max) : null,
    created_at: s.created_at.toISOString(),
    started_at: s.started_at?.toISOString() ?? null,
    completed_at: s.completed_at?.toISOString() ?? null,
    expires_at: s.expires_at.toISOString(),
    revoked_at: s.revoked_at?.toISOString() ?? null,
    ...(takeUrl ? { take_url: takeUrl } : {}),
  };
}

export function sessionsRouter(deps: SessionsRouterDeps): Router {
  const router = Router();
  const auditEnabled = deps.audit ?? true;
  const cookieOptions = {
    jwtSecret: deps.config.jwtSecret as string,
    cookieSecure: deps.config.cookieSecure,
  };

  function audit(req: RecruiterRequest, event: string, sessionId?: string): void {
    if (!auditEnabled) return;
    const recruiter = req.recruiter;
    void recordAuditEvent({
      pool: deps.pool,
      event: {
        actor_type: 'user',
        actor_id: recruiter?.id ?? null,
        event_type: event,
        entity_type: 'session',
        ...(sessionId ? { entity_id: sessionId } : {}),
        ip_address: req.ip,
        user_agent: req.get('user-agent') ?? undefined,
      },
      onError: (err) => req.log?.warn({ err }, 'audit event write failed'),
    });
  }

  // Apply recruiterAuth per-route (not as router-level middleware) so this
  // factory can be mounted on /v1 alongside other routers without
  // intercepting their requests (e.g. /v1/auth/invite).
  const gate = recruiterAuth(cookieOptions);

  router.post('/sessions', gate, async (req, res, next) => {
    const recruiter = (req as RecruiterRequest).recruiter;
    if (!recruiter) {
      next(new HttpProblem({ status: 401, title: 'Unauthorized' }));
      return;
    }

    let parsed;
    try {
      parsed = CreateSchema.parse(req.body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        next(
          new HttpProblem({
            status: 400,
            title: 'Bad Request',
            detail: 'Invalid session payload',
            extensions: { violations: err.flatten() },
          }),
        );
        return;
      }
      next(err);
      return;
    }

    try {
      const packCheck = await deps.pool.query<{ id: string; tenant_id: string }>(
        'SELECT id, tenant_id FROM app.packs WHERE id = $1 LIMIT 1',
        [parsed.pack_id],
      );
      const pack = packCheck.rows[0];
      if (!pack || pack.tenant_id !== recruiter.tenantId) {
        next(
          new HttpProblem({
            status: 404,
            type: 'https://qorium.io/problems/sessions/pack-not-found',
            title: 'Not Found',
            detail: 'Pack not found or not accessible to this recruiter.',
          }),
        );
        return;
      }

      const { session, token } = await createSession(deps.pool, {
        pack_id: parsed.pack_id,
        recruiter_id: recruiter.id,
        tenant_id: recruiter.tenantId,
        candidate_email: parsed.candidate_email,
        ...(parsed.candidate_name ? { candidate_name: parsed.candidate_name } : {}),
        ...(parsed.ttl_days ? { ttl_days: parsed.ttl_days } : {}),
      });

      audit(req as RecruiterRequest, 'session.created', session.id);

      const takeUrl = `${deps.config.recruiterPortalUrl.replace(/\/$/, '')}/take/${token}`;
      res.status(201).json({
        ...toPublicSession(session, takeUrl),
        token,
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/sessions', gate, async (req, res, next) => {
    const recruiter = (req as RecruiterRequest).recruiter;
    if (!recruiter) {
      next(new HttpProblem({ status: 401, title: 'Unauthorized' }));
      return;
    }
    let q;
    try {
      q = ListQuerySchema.parse(req.query);
    } catch (err) {
      if (err instanceof z.ZodError) {
        next(
          new HttpProblem({
            status: 400,
            title: 'Bad Request',
            detail: 'Invalid query parameters',
            extensions: { violations: err.flatten() },
          }),
        );
        return;
      }
      next(err);
      return;
    }
    try {
      const rows = await listSessionsForRecruiter(deps.pool, recruiter.id, {
        ...(q.limit !== undefined ? { limit: q.limit } : {}),
        ...(q.status ? { status: q.status } : {}),
      });
      res.json({ data: rows.map((r) => toPublicSession(r)) });
    } catch (err) {
      next(err);
    }
  });

  router.get('/sessions/:id', gate, async (req, res, next) => {
    const recruiter = (req as RecruiterRequest).recruiter;
    if (!recruiter) {
      next(new HttpProblem({ status: 401, title: 'Unauthorized' }));
      return;
    }
    const id = req.params.id;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id ?? '')) {
      next(new HttpProblem({ status: 400, title: 'Bad Request', detail: 'Invalid session id' }));
      return;
    }
    try {
      const row = await findSessionById(deps.pool, id!, recruiter.id);
      if (!row) {
        next(new HttpProblem({ status: 404, title: 'Not Found' }));
        return;
      }
      res.json({ data: toPublicSession(row) });
    } catch (err) {
      next(err);
    }
  });

  router.post('/sessions/:id/revoke', gate, async (req, res, next) => {
    const recruiter = (req as RecruiterRequest).recruiter;
    if (!recruiter) {
      next(new HttpProblem({ status: 401, title: 'Unauthorized' }));
      return;
    }
    const id = req.params.id;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id ?? '')) {
      next(new HttpProblem({ status: 400, title: 'Bad Request', detail: 'Invalid session id' }));
      return;
    }
    try {
      const ok = await revokeSession(deps.pool, id!, recruiter.id);
      if (!ok) {
        next(
          new HttpProblem({
            status: 404,
            title: 'Not Found',
            detail: 'No revocable session matched.',
          }),
        );
        return;
      }
      audit(req as RecruiterRequest, 'session.revoked', id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
