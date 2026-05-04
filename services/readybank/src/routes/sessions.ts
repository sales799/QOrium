// /v1/sessions — recruiter-side session management.
// Sprint 1.3 (Run #29) created POST /v1/sessions.
// Sprint 1.4 (Run #30) adds: GET /v1/sessions (list), GET /v1/sessions/:id (detail), POST /v1/sessions/:id/revoke.

import { Router } from 'express';
import { z } from 'zod';
import { randomBytes } from 'node:crypto';
import type { Pool } from '@qorium/db';
import type { AuthenticatedRequest } from '@qorium/auth';
import { HttpProblem } from '../middleware/problem.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CreateSessionSchema = z.object({
  candidate_id: z.string().regex(/^[A-Za-z0-9_-]{1,100}$/),
  question_ids: z.array(z.string().regex(UUID_PATTERN)).min(1).max(100),
  pack_name: z.string().min(1).max(200).optional(),
  recruiter_email: z.string().email().max(200).optional(),
  expires_minutes: z.coerce.number().int().min(5).max(60 * 24 * 14).optional(),
});

const ListQuerySchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'expired', 'revoked']).optional(),
  candidate_id: z.string().regex(/^[A-Za-z0-9_-]{1,100}$/).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export interface SessionsRouterDeps {
  pool: Pool;
}

export function sessionsRouter(deps: SessionsRouterDeps): Router {
  const router = Router();

  // POST /v1/sessions — create take session for a named candidate.
  router.post('/sessions', async (req, res, next) => {
    try {
      const auth = (req as AuthenticatedRequest).auth;
      if (!auth) {
        return next(new HttpProblem({ status: 401, title: 'Unauthorized', detail: 'API key required' }));
      }

      let parsed;
      try {
        parsed = CreateSessionSchema.parse(req.body);
      } catch (e) {
        if (e instanceof z.ZodError) {
          return next(new HttpProblem({ status: 400, title: 'Bad Request', detail: e.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') }));
        }
        throw e;
      }

      const qcheck = await deps.pool.query(
        `SELECT id FROM content.questions WHERE id = ANY($1::uuid[]) AND status = 'released'`,
        [parsed.question_ids]
      );
      if (qcheck.rowCount !== parsed.question_ids.length) {
        return next(new HttpProblem({ status: 400, title: 'Bad Request', detail: `Some question_ids are not released or do not exist: requested ${parsed.question_ids.length}, found ${qcheck.rowCount}` }));
      }

      const sessionToken = randomBytes(32).toString('hex');
      const expiresMinutes = parsed.expires_minutes ?? 60 * 48;

      const insert = await deps.pool.query(
        `INSERT INTO app.sessions
           (tenant_id, api_key_id, candidate_id, session_token, question_ids, pack_name, recruiter_email, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() + ($8 * INTERVAL '1 minute'))
         RETURNING id, expires_at, status`,
        [
          auth.tenantId,
          auth.apiKeyId,
          parsed.candidate_id,
          sessionToken,
          parsed.question_ids,
          parsed.pack_name ?? null,
          parsed.recruiter_email ?? null,
          expiresMinutes,
        ]
      );

      const row = insert.rows[0];
      const baseUrl = process.env.QORIUM_PUBLIC_BASE_URL || 'https://api.qorium.online';
      res.status(201).json({
        session_id: row.id,
        session_token: sessionToken,
        take_url: `${baseUrl}/take/${sessionToken}`,
        result_url: `${baseUrl}/take/${sessionToken}/result`,
        expires_at: row.expires_at,
        status: row.status,
        candidate_id: parsed.candidate_id,
        question_count: parsed.question_ids.length,
      });
    } catch (err) { next(err); }
  });

  // GET /v1/sessions — list tenant's sessions; optional filter by status / candidate_id.
  router.get('/sessions', async (req, res, next) => {
    try {
      const auth = (req as AuthenticatedRequest).auth;
      if (!auth) {
        return next(new HttpProblem({ status: 401, title: 'Unauthorized', detail: 'API key required' }));
      }
      let q;
      try { q = ListQuerySchema.parse(req.query); }
      catch (e) {
        if (e instanceof z.ZodError) return next(new HttpProblem({ status: 400, title: 'Bad Request', detail: e.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') }));
        throw e;
      }
      const conditions: string[] = ['tenant_id = $1'];
      const params: unknown[] = [auth.tenantId];
      if (q.status) { params.push(q.status); conditions.push(`status = $${params.length}::varchar`); }
      if (q.candidate_id) { params.push(q.candidate_id); conditions.push(`candidate_id = $${params.length}`); }
      const limit = Math.min(q.limit ?? 25, 100);
      params.push(limit);

      const result = await deps.pool.query(
        `SELECT id, candidate_id, status, pack_name, recruiter_email, current_index,
                array_length(question_ids, 1) AS question_count,
                created_at, started_at, completed_at, expires_at,
                substring(session_token, 1, 12) AS token_prefix
         FROM app.sessions
         WHERE ${conditions.join(' AND ')}
         ORDER BY created_at DESC
         LIMIT $${params.length}`,
        params
      );

      res.setHeader('Cache-Control', 'no-store');
      res.json({
        sessions: result.rows,
        count: result.rowCount,
      });
    } catch (err) { next(err); }
  });

  // GET /v1/sessions/:id — single session detail (recruiter view).
  router.get('/sessions/:id', async (req, res, next) => {
    try {
      const auth = (req as AuthenticatedRequest).auth;
      if (!auth) {
        return next(new HttpProblem({ status: 401, title: 'Unauthorized', detail: 'API key required' }));
      }
      if (!UUID_PATTERN.test(req.params.id)) {
        return next(new HttpProblem({ status: 400, title: 'Bad Request', detail: 'session id must be a UUID' }));
      }
      const result = await deps.pool.query(
        `SELECT id, candidate_id, status, pack_name, recruiter_email, current_index,
                question_ids, array_length(question_ids, 1) AS question_count,
                created_at, started_at, completed_at, expires_at,
                substring(session_token, 1, 12) AS token_prefix
         FROM app.sessions
         WHERE id = $1 AND tenant_id = $2
         LIMIT 1`,
        [req.params.id, auth.tenantId]
      );
      if (result.rowCount === 0) {
        return next(new HttpProblem({ status: 404, title: 'Not Found', detail: 'session not found' }));
      }
      res.setHeader('Cache-Control', 'no-store');
      res.json(result.rows[0]);
    } catch (err) { next(err); }
  });

  // POST /v1/sessions/:id/revoke — recruiter kills a session immediately.
  router.post('/sessions/:id/revoke', async (req, res, next) => {
    try {
      const auth = (req as AuthenticatedRequest).auth;
      if (!auth) {
        return next(new HttpProblem({ status: 401, title: 'Unauthorized', detail: 'API key required' }));
      }
      if (!UUID_PATTERN.test(req.params.id)) {
        return next(new HttpProblem({ status: 400, title: 'Bad Request', detail: 'session id must be a UUID' }));
      }
      const result = await deps.pool.query(
        `UPDATE app.sessions
         SET status = 'revoked'::varchar, completed_at = COALESCE(completed_at, NOW())
         WHERE id = $1 AND tenant_id = $2
           AND status IN ('pending', 'in_progress')
         RETURNING id, status, completed_at`,
        [req.params.id, auth.tenantId]
      );
      if (result.rowCount === 0) {
        return next(new HttpProblem({ status: 404, title: 'Not Found', detail: 'session not found, already terminal, or not owned by this tenant' }));
      }
      res.json({ ...result.rows[0], message: 'session revoked; /take/<token> will return 410 Gone' });
    } catch (err) { next(err); }
  });

  return router;
}
