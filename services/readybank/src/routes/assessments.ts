import { Router } from 'express';
import { z } from 'zod';
import type { Pool } from '@qorium/db';
import { recordAuditEvent } from '@qorium/auth';
import type { AuthenticatedRequest } from '@qorium/auth';
import { HttpProblem } from '../middleware/problem.js';
import { assertWithinLimit, recordUsage } from '../billing/enforce.js';
import type { Mailer } from '../mailer/index.js';
import {
  createAssessment,
  createInvitation,
  filterReleasedQuestionIds,
  getAssessmentForTenant,
  markInvitationSent,
  type AssessmentRow,
} from '../repositories/assessments.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAIL_FROM = 'QOrium <no-reply@qorium.online>';
const DEFAULT_CANDIDATE_BASE_URL = 'https://candidate.qorium.online';

const BlueprintItemSchema = z.object({
  skill_id: z.string().uuid(),
  count: z.number().int().min(1).max(100),
  difficulty_band: z.number().int().min(1).max(5).optional(),
});

const CreateAssessmentSchema = z
  .object({
    title: z.string().min(1).max(256),
    slug: z.string().min(1).max(128).optional(),
    time_limit_sec: z.number().int().min(60).max(36000).optional(),
    pass_score: z.number().min(0).max(1).optional(),
    status: z.enum(['draft', 'active']).optional(),
    question_ids: z.array(z.string().uuid()).min(1).max(200).optional(),
    blueprint_json: z.array(BlueprintItemSchema).min(1).max(50).optional(),
  })
  .refine((body) => (body.question_ids === undefined) !== (body.blueprint_json === undefined), {
    message: 'Provide exactly one of question_ids (fixed mode) or blueprint_json (blueprint mode)',
  });

const InviteSchema = z.object({
  candidate_email: z.string().email().max(256),
  candidate_name: z.string().min(1).max(256).optional(),
  expires_in_days: z.number().int().min(1).max(90).optional(),
});

export interface AssessmentsRouterDeps {
  pool: Pool;
  mailer?: Mailer;
  /** Base URL for candidate invite links. Defaults to the production candidate host. */
  candidateBaseUrl?: string;
  /** When true (default), records audit events. */
  audit?: boolean;
}

function serializeAssessment(a: AssessmentRow): Record<string, unknown> {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    selection_mode: a.selection_mode,
    time_limit_sec: a.time_limit_sec,
    pass_score: Number(a.pass_score),
    total_questions: a.total_questions,
    status: a.status,
    created_at: a.created_at.toISOString(),
    updated_at: a.updated_at.toISOString(),
  };
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] as string,
  );
}

export function assessmentsRouter(deps: AssessmentsRouterDeps): Router {
  const router = Router();
  const auditEnabled = deps.audit ?? true;
  const candidateBaseUrl = deps.candidateBaseUrl ?? DEFAULT_CANDIDATE_BASE_URL;

  // POST /v1/assessments — create a fixed or blueprint assessment (tenant-scoped).
  router.post('/assessments', async (req, res, next) => {
    const auth = (req as AuthenticatedRequest).auth;
    if (!auth) {
      next(new HttpProblem({ status: 401, title: 'Unauthorized', detail: 'API key required' }));
      return;
    }

    let body;
    try {
      body = CreateAssessmentSchema.parse(req.body);
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
      if (body.question_ids) {
        const released = new Set(await filterReleasedQuestionIds(deps.pool, body.question_ids));
        const invalid = body.question_ids.filter((id) => !released.has(id));
        if (invalid.length > 0) {
          next(
            new HttpProblem({
              status: 422,
              title: 'Unprocessable Entity',
              detail: 'One or more question_ids are not released questions',
              extensions: { invalid_question_ids: invalid },
            }),
          );
          return;
        }
      }

      await assertWithinLimit(deps.pool, auth.tenantId, 'assessment');
      const assessment = await createAssessment(deps.pool, {
        tenantId: auth.tenantId,
        title: body.title,
        slug: body.slug ?? null,
        createdBy: auth.apiKeyId,
        ...(body.time_limit_sec !== undefined ? { timeLimitSec: body.time_limit_sec } : {}),
        ...(body.pass_score !== undefined ? { passScore: body.pass_score } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.question_ids ? { questionIds: body.question_ids } : {}),
        ...(body.blueprint_json ? { blueprint: body.blueprint_json } : {}),
      });

      await recordUsage(deps.pool, auth.tenantId, 'assessment.created');

      if (auditEnabled) {
        void recordAuditEvent({
          pool: deps.pool,
          event: {
            actor_type: 'api_key',
            actor_id: auth.apiKeyId,
            tenant_id: auth.tenantId,
            event_type: 'assessment.created',
            entity_type: 'assessment',
            entity_id: assessment.id,
            payload: {
              selection_mode: assessment.selection_mode,
              total_questions: assessment.total_questions,
            },
          },
        });
      }

      res.status(201).json(serializeAssessment(assessment));
    } catch (err) {
      if ((err as { code?: string }).code === '23505') {
        next(
          new HttpProblem({
            status: 409,
            title: 'Conflict',
            detail: 'An assessment with this slug already exists for your tenant',
          }),
        );
        return;
      }
      next(err);
    }
  });

  // GET /v1/assessments/:id — fetch one assessment (tenant-scoped) with its question ids.
  router.get('/assessments/:id', async (req, res, next) => {
    const auth = (req as AuthenticatedRequest).auth;
    if (!auth) {
      next(new HttpProblem({ status: 401, title: 'Unauthorized', detail: 'API key required' }));
      return;
    }

    const id = req.params.id;
    if (typeof id !== 'string' || !UUID_PATTERN.test(id)) {
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
      const assessment = await getAssessmentForTenant(deps.pool, id, auth.tenantId);
      if (assessment === null) {
        next(
          new HttpProblem({
            status: 404,
            title: 'Not Found',
            detail: `Assessment ${id} does not exist or belongs to another tenant`,
          }),
        );
        return;
      }
      res
        .status(200)
        .json({ ...serializeAssessment(assessment), question_ids: assessment.question_ids });
    } catch (err) {
      next(err);
    }
  });

  // POST /v1/assessments/:id/invite — issue a tokenised candidate invitation.
  router.post('/assessments/:id/invite', async (req, res, next) => {
    const auth = (req as AuthenticatedRequest).auth;
    if (!auth) {
      next(new HttpProblem({ status: 401, title: 'Unauthorized', detail: 'API key required' }));
      return;
    }

    const id = req.params.id;
    if (typeof id !== 'string' || !UUID_PATTERN.test(id)) {
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
      body = InviteSchema.parse(req.body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        next(
          new HttpProblem({
            status: 400,
            title: 'Bad Request',
            detail: 'Invalid invitation body',
            extensions: { violations: err.flatten() },
          }),
        );
        return;
      }
      next(err);
      return;
    }

    try {
      const assessment = await getAssessmentForTenant(deps.pool, id, auth.tenantId);
      if (assessment === null) {
        next(
          new HttpProblem({
            status: 404,
            title: 'Not Found',
            detail: `Assessment ${id} does not exist or belongs to another tenant`,
          }),
        );
        return;
      }

      await assertWithinLimit(deps.pool, auth.tenantId, 'attempt');
      const invitation = await createInvitation(deps.pool, {
        assessmentId: id,
        tenantId: auth.tenantId,
        candidateEmail: body.candidate_email,
        candidateName: body.candidate_name ?? null,
        createdBy: auth.apiKeyId,
        ...(body.expires_in_days !== undefined ? { expiresInDays: body.expires_in_days } : {}),
      });

      await recordUsage(deps.pool, auth.tenantId, 'invitation.created');

      const link = `${candidateBaseUrl}/t/${invitation.token}`;

      let emailed = false;
      if (deps.mailer) {
        try {
          await deps.mailer.send({
            to: body.candidate_email,
            from: MAIL_FROM,
            subject: `You're invited to take "${assessment.title}"`,
            text: `You have been invited to a QOrium assessment: ${assessment.title}.\n\nStart here: ${link}\n\nThis link expires ${invitation.expires_at.toISOString()}.`,
            html: `<p>You have been invited to a QOrium assessment: <strong>${escapeHtml(assessment.title)}</strong>.</p><p><a href="${link}">Start your assessment</a></p><p>This link expires ${invitation.expires_at.toISOString()}.</p>`,
          });
          await markInvitationSent(deps.pool, invitation.id);
          emailed = true;
        } catch {
          emailed = false;
        }
      }

      if (auditEnabled) {
        void recordAuditEvent({
          pool: deps.pool,
          event: {
            actor_type: 'api_key',
            actor_id: auth.apiKeyId,
            tenant_id: auth.tenantId,
            event_type: 'invitation.created',
            entity_type: 'invitation',
            entity_id: invitation.id,
            payload: { assessment_id: id, emailed },
          },
        });
      }

      res.status(201).json({
        id: invitation.id,
        token: invitation.token,
        link,
        status: invitation.status,
        candidate_email: invitation.candidate_email,
        candidate_name: invitation.candidate_name,
        expires_at: invitation.expires_at.toISOString(),
        emailed,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
