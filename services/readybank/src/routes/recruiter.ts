import { Router } from 'express';
import { z } from 'zod';
import type { Pool } from '@qorium/db';
import type { Config } from '../config.js';
import { recruiterAuth, type RecruiterRequest } from '../middleware/recruiter-auth.js';
import { HttpProblem } from '../middleware/problem.js';
import { assertWithinLimit, recordUsage } from '../billing/enforce.js';
import { loadQuestion } from '../lib/a4-grader.js';
import { summarizeIntegrity } from '../lib/integrity.js';
import { buildProofRef } from '../lib/proof-ref.js';
import {
  createAssessment,
  createInvitation,
  getAssessmentForTenant,
} from '../repositories/assessments.js';
import { getAttempt, listAttemptResponses } from '../repositories/attempts.js';
import {
  listAssessmentsForTenant,
  listAttemptsForAssessment,
  listTopSkills,
  listSkillFamilies,
  pickReleasedQuestionIds,
} from '../repositories/recruiter.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CreateBody = z.object({
  title: z.string().min(1).max(256),
  skill_id: z.string().uuid(),
  question_count: z.number().int().min(1).max(50),
});
const InviteBody = z.object({
  candidate_email: z.string().email().max(256),
  candidate_name: z.string().min(1).max(256).optional(),
  expires_in_days: z.number().int().min(1).max(90).optional(),
});

export interface RecruiterRouterDeps {
  pool: Pool;
  config: Config;
  candidateBaseUrl?: string;
}

/**
 * Recruiter portal API — gated by the qor_session cookie (recruiterAuth). The
 * tenant is taken from the session, never the client. Reuses the BR-2/BR-3
 * repositories. Mount OUTSIDE the apiKeyAuth chain (recruiters have no key).
 */
export function recruiterPortalRouter(deps: RecruiterRouterDeps): Router {
  const router = Router();
  const baseUrl = deps.candidateBaseUrl ?? 'https://candidate.qorium.online';
  const proofSecret = deps.config.proofSecret ?? deps.config.a4TokenSecret;
  router.use(
    '/recruiter',
    recruiterAuth({
      jwtSecret: deps.config.jwtSecret as string,
      cookieSecure: deps.config.cookieSecure,
    }),
  );

  function rec(req: RecruiterRequest) {
    return req.recruiter!;
  }

  router.get('/recruiter/skills', async (_req, res, next) => {
    try {
      res.status(200).json({ skills: await listTopSkills(deps.pool, 25) });
    } catch (err) {
      next(err);
    }
  });

  router.get('/recruiter/skill-families', async (_req, res, next) => {
    try {
      res.status(200).json({ families: await listSkillFamilies(deps.pool) });
    } catch (err) {
      next(err);
    }
  });

  router.get('/recruiter/assessments', async (req, res, next) => {
    try {
      const rows = await listAssessmentsForTenant(deps.pool, rec(req as RecruiterRequest).tenantId);
      res.status(200).json({
        assessments: rows.map((a) => ({ ...a, created_at: a.created_at.toISOString() })),
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/recruiter/assessments', async (req, res, next) => {
    let body;
    try {
      body = CreateBody.parse(req.body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        next(
          new HttpProblem({
            status: 400,
            title: 'Bad Request',
            detail: 'Invalid assessment body',
            extensions: { violations: err.flatten() },
          }),
        );
        return;
      }
      next(err);
      return;
    }
    try {
      const me = rec(req as RecruiterRequest);
      await assertWithinLimit(deps.pool, me.tenantId, 'assessment');
      const questionIds = await pickReleasedQuestionIds(
        deps.pool,
        body.skill_id,
        body.question_count,
      );
      if (questionIds.length === 0) {
        next(
          new HttpProblem({
            status: 422,
            title: 'Unprocessable Entity',
            detail: 'No released questions for that skill',
          }),
        );
        return;
      }
      const a = await createAssessment(deps.pool, {
        tenantId: me.tenantId,
        title: body.title,
        status: 'active',
        questionIds,
        createdBy: me.id,
      });
      await recordUsage(deps.pool, me.tenantId, 'assessment.created');
      res.status(201).json({
        id: a.id,
        title: a.title,
        total_questions: a.total_questions,
        status: a.status,
        created_at: a.created_at.toISOString(),
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/recruiter/assessments/:id/invite', async (req, res, next) => {
    const id = req.params.id;
    if (!UUID.test(id)) {
      next(
        new HttpProblem({
          status: 400,
          title: 'Bad Request',
          detail: 'Assessment id must be a UUID',
        }),
      );
      return;
    }
    let body;
    try {
      body = InviteBody.parse(req.body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        next(
          new HttpProblem({
            status: 400,
            title: 'Bad Request',
            detail: 'Invalid invite body',
            extensions: { violations: err.flatten() },
          }),
        );
        return;
      }
      next(err);
      return;
    }
    try {
      const me = rec(req as RecruiterRequest);
      const assessment = await getAssessmentForTenant(deps.pool, id, me.tenantId);
      if (!assessment) {
        next(new HttpProblem({ status: 404, title: 'Not Found', detail: 'Assessment not found' }));
        return;
      }
      await assertWithinLimit(deps.pool, me.tenantId, 'attempt');
      const inv = await createInvitation(deps.pool, {
        assessmentId: id,
        tenantId: me.tenantId,
        candidateEmail: body.candidate_email,
        candidateName: body.candidate_name ?? null,
        createdBy: me.id,
        ...(body.expires_in_days !== undefined ? { expiresInDays: body.expires_in_days } : {}),
      });
      await recordUsage(deps.pool, me.tenantId, 'invitation.created');
      res.status(201).json({
        id: inv.id,
        token: inv.token,
        link: `${baseUrl}/t/${inv.token}`,
        candidate_email: inv.candidate_email,
        expires_at: inv.expires_at.toISOString(),
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/recruiter/assessments/:id/attempts', async (req, res, next) => {
    const id = req.params.id;
    if (!UUID.test(id)) {
      next(
        new HttpProblem({
          status: 400,
          title: 'Bad Request',
          detail: 'Assessment id must be a UUID',
        }),
      );
      return;
    }
    try {
      const me = rec(req as RecruiterRequest);
      const rows = await listAttemptsForAssessment(deps.pool, id, me.tenantId);
      res.status(200).json({
        attempts: rows.map((a) => ({
          id: a.id,
          status: a.status,
          score_pct: a.total_score !== null ? Number(a.total_score) : null,
          graded_at: a.graded_at ? a.graded_at.toISOString() : null,
          candidate_email: a.candidate_email,
          candidate_name: a.candidate_name,
        })),
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/recruiter/attempts/:id/review', async (req, res, next) => {
    const id = req.params.id;
    if (!UUID.test(id)) {
      next(
        new HttpProblem({ status: 400, title: 'Bad Request', detail: 'Attempt id must be a UUID' }),
      );
      return;
    }
    try {
      const me = rec(req as RecruiterRequest);
      const attempt = await getAttempt(deps.pool, id);
      if (!attempt || attempt.tenant_id !== me.tenantId) {
        next(new HttpProblem({ status: 404, title: 'Not Found', detail: 'Attempt not found' }));
        return;
      }
      const responses = await listAttemptResponses(deps.pool, id);
      const proof = buildProofRef(attempt.status, attempt.id, proofSecret);
      const detailed = await Promise.all(
        responses.map(async (r) => {
          const q = await loadQuestion(deps.pool, r.question_id);
          return {
            response_id: r.id,
            question_id: r.question_id,
            format: q ? ((q as { format?: string }).format ?? null) : null,
            score: r.score !== null ? Number(r.score) : null,
            reasoning_trace:
              (r.execution_metadata as { reasoning_trace?: string } | null)?.reasoning_trace ??
              null,
            correct: (r.execution_metadata as { correct?: boolean | null } | null)?.correct ?? null,
            suspicious_signals: r.suspicious_signals,
          };
        }),
      );
      res.status(200).json({
        attempt_id: attempt.id,
        status: attempt.status,
        candidate_id: attempt.candidate_id,
        total_score: attempt.total_score !== null ? Number(attempt.total_score) : null,
        graded_at: attempt.graded_at ? attempt.graded_at.toISOString() : null,
        proof_code: proof?.proof_code ?? null,
        proof_view_path: proof?.proof_view_path ?? null,
        proof_badge_path: proof?.proof_badge_path ?? null,
        integrity: summarizeIntegrity(responses.map((r) => r.suspicious_signals)),
        responses: detailed,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
