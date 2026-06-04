import { Router } from 'express';
import { z } from 'zod';
import type { Pool } from '@qorium/db';
import { HttpProblem } from '../middleware/problem.js';
import { verifyA4Token } from '../lib/a4-token.js';
import { grade, loadQuestion, persistResponse, persistGradeDecision } from '../lib/a4-grader.js';

// /a4/* endpoints are token-authenticated (HMAC, no DB lookup) and serve the
// candidate side of the assessment loop:
//
//   GET  /a4/question?token=<>  → public-safe question render payload
//   POST /a4/grade              → scores + persists to content.responses
//
// `country_override` exists for development & verified end-to-end smoke runs
// where there is no Cloudflare upstream populating `cf-ipcountry`. In
// production deployment, nginx must inject CF-IPCountry from Cloudflare.

export interface A4RouterDeps {
  pool: Pool;
  tokenSecret: string;
}

const GradeBody = z.object({
  token: z.string().min(8).max(4096),
  response_body: z.object({}).passthrough(),
  time_taken_ms: z
    .number()
    .int()
    .min(0)
    .max(24 * 3600 * 1000)
    .optional(),
  started_at: z.string().datetime().optional(),
  client_signals: z.object({}).passthrough().optional(),
});

function countryFromReq(req: import('express').Request): string | null {
  const cf = req.header('cf-ipcountry');
  if (cf && typeof cf === 'string') return cf.toUpperCase();
  const override = req.header('x-a4-country-override');
  if (override && typeof override === 'string') return override.toUpperCase();
  return null;
}

export function a4Router(deps: A4RouterDeps): Router {
  const router = Router();

  // Render-side: candidate-portal calls this server-side to get the question
  // body that should be shown to the candidate. We strip the answer key.
  router.get('/a4/question', async (req, res, next) => {
    try {
      const token = typeof req.query.token === 'string' ? req.query.token : '';
      const v = verifyA4Token(token, deps.tokenSecret);
      if (!v.ok) {
        return next(
          new HttpProblem({ status: 401, title: 'Unauthorized', detail: `token ${v.reason}` }),
        );
      }
      const country = countryFromReq(req);
      if (country && country !== 'IN') {
        return next(
          new HttpProblem({
            status: 451,
            title: 'Region not available',
            detail: 'A4 is restricted to India-resident candidates.',
          }),
        );
      }
      const q = await loadQuestion(deps.pool, v.payload.question_id);
      if (!q) {
        return next(
          new HttpProblem({ status: 404, title: 'Not Found', detail: 'question not found' }),
        );
      }
      // Strip answer key before sending downstream.
      const body = (q.body_json ?? {}) as Record<string, unknown>;
      const safe: Record<string, unknown> = { ...body };
      delete safe.answer_index;
      delete safe.correct_index;
      delete safe.explanation;
      return res.status(200).json({
        question: {
          id: q.id,
          format: q.format,
          skill_id: q.skill_id,
          body: safe,
        },
        candidate_id: v.payload.candidate_id,
        exp: v.payload.exp,
      });
    } catch (err) {
      return next(err);
    }
  });

  router.post('/a4/grade', async (req, res, next) => {
    let parsed: z.infer<typeof GradeBody>;
    try {
      parsed = GradeBody.parse(req.body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return next(
          new HttpProblem({
            status: 400,
            title: 'Bad Request',
            detail: 'invalid grade payload',
            extensions: { violations: err.flatten() },
          }),
        );
      }
      return next(err);
    }

    const v = verifyA4Token(parsed.token, deps.tokenSecret);
    if (!v.ok) {
      return next(
        new HttpProblem({ status: 401, title: 'Unauthorized', detail: `token ${v.reason}` }),
      );
    }
    const country = countryFromReq(req);
    if (country && country !== 'IN') {
      return next(
        new HttpProblem({
          status: 451,
          title: 'Region not available',
          detail: 'A4 is restricted to India-resident candidates.',
        }),
      );
    }

    try {
      const q = await loadQuestion(deps.pool, v.payload.question_id);
      if (!q) {
        return next(
          new HttpProblem({ status: 404, title: 'Not Found', detail: 'question not found' }),
        );
      }

      const outcome = grade({ question: q, responseBody: parsed.response_body });

      const suspicious: Record<string, unknown> = {};
      if (parsed.client_signals) suspicious.client_signals = parsed.client_signals;
      if (country) suspicious.ip_country = country;
      suspicious.jti = v.payload.jti;

      const row = await persistResponse({
        pool: deps.pool,
        questionId: q.id,
        tenantId: v.payload.tenant_id,
        candidateId: v.payload.candidate_id,
        responseBody: parsed.response_body,
        score: outcome.score,
        timeTakenMs: parsed.time_taken_ms ?? null,
        startedAtIso: parsed.started_at ?? null,
        suspiciousSignals: suspicious,
      });

      // grade_decisions (migration 0019) is written ONLY when an AI grader
      // produced a reasoning trace. Deterministic MCQ grading leaves
      // outcome.aiDecision null, so no row is written and the 'AI grader
      // output' table is never contaminated by a deterministic match. When
      // BHIMA's M4 grader lands for non-MCQ formats it populates aiDecision
      // and rows flow here with no further change.
      let gradeDecision: {
        id: string;
        reasoning_hash: string;
        created_at: string;
        grader_source: string;
        model: string;
        confidence: number;
        score: number;
      } | null = null;
      if (outcome.aiDecision) {
        const gd = await persistGradeDecision({
          pool: deps.pool,
          tenantId: v.payload.tenant_id,
          responseId: row.id,
          questionId: q.id,
          decision: outcome.aiDecision,
        });
        gradeDecision = {
          id: gd.id,
          reasoning_hash: gd.reasoning_hash,
          created_at: gd.created_at,
          grader_source: outcome.aiDecision.graderSource,
          model: outcome.aiDecision.model,
          confidence: outcome.aiDecision.confidence,
          score: outcome.aiDecision.score,
        };
      }

      return res.status(201).json({
        grade_decision: gradeDecision,
        response_id: row.id,
        question_id: q.id,
        candidate_id: v.payload.candidate_id,
        tenant_id: v.payload.tenant_id,
        skill_id: q.skill_id,
        score: outcome.score,
        max_score: outcome.max_score,
        correct: outcome.correct,
        irt_status: outcome.irt_status,
        rationale: outcome.rationale,
        submitted_at: row.submitted_at,
        region: 'IN',
      });
    } catch (err) {
      return next(err);
    }
  });

  return router;
}
