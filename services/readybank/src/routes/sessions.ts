// /v1/sessions — recruiter creates a take-assessment session for a named candidate.
// Sprint 1.3 (Run #29).
//
// POST /v1/sessions
// body: { candidate_id, question_ids: uuid[], pack_name?, recruiter_email?, expires_minutes? }
// returns: { session_id, session_token, take_url, expires_at, status }

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

export interface SessionsRouterDeps {
  pool: Pool;
}

export function sessionsRouter(deps: SessionsRouterDeps): Router {
  const router = Router();

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

      // Verify all question_ids exist + are released + match the tenant's accessible bank.
      const qcheck = await deps.pool.query(
        `SELECT id FROM content.questions WHERE id = ANY($1::uuid[]) AND status = 'released'`,
        [parsed.question_ids]
      );
      if (qcheck.rowCount !== parsed.question_ids.length) {
        return next(new HttpProblem({ status: 400, title: 'Bad Request', detail: `Some question_ids are not released or do not exist: requested ${parsed.question_ids.length}, found ${qcheck.rowCount}` }));
      }

      const sessionToken = randomBytes(32).toString('hex');
      const expiresMinutes = parsed.expires_minutes ?? 60 * 48; // 48h default

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
        expires_at: row.expires_at,
        status: row.status,
        candidate_id: parsed.candidate_id,
        question_count: parsed.question_ids.length,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
