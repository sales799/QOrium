import { Router } from 'express';
import { z } from 'zod';
import type { Pool } from '@qorium/db';
import type { AuthenticatedRequest } from '@qorium/auth';
import { HttpProblem } from '../middleware/problem.js';
import { loadQuestion } from '../lib/a4-grader.js';
import { summarizeIntegrity } from '../lib/integrity.js';
import { gradeAttempt } from '../grading/worker.js';
import {
  createOrResumeAttempt,
  getAttempt,
  getAttemptForToken,
  getCandidateQuestion,
  getInvitationByToken,
  listAttemptResponses,
  upsertAnswer,
  type AttemptRow,
  type CandidateQuestion,
} from '../repositories/attempts.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Keys that must NEVER reach a candidate, whether as a column or nested in
// body_json. The columns are not even selected (getCandidateQuestion); this is
// defence-in-depth for body_json payloads authored with embedded answers.
const SECRET_BODY_KEYS = new Set([
  'answer',
  'answers',
  'answer_index',
  'answer_key',
  'correct',
  'correct_index',
  'correct_option',
  'explanation',
  'rationale',
  'solution',
  'reference_solution',
  'rubric',
  'rubric_json',
  'test_cases',
  'sandbox_config',
]);

export function sanitizeBody(body: unknown): unknown {
  if (Array.isArray(body)) return body.map(sanitizeBody);
  if (!body || typeof body !== 'object') return body;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
    if (SECRET_BODY_KEYS.has(k.toLowerCase())) continue;
    out[k] = sanitizeBody(v);
  }
  return out;
}

export function sanitizeQuestion(q: CandidateQuestion): Record<string, unknown> {
  return {
    id: q.id,
    format: q.format,
    skill_id: q.skill_id,
    language: q.language,
    body_md: q.body_md,
    body: sanitizeBody(q.body_json),
  };
}

function tokenFromQuery(value: unknown): string | null {
  return typeof value === 'string' && value.length >= 16 ? value : null;
}

const AnswerBody = z.object({
  token: z.string().min(16).max(128),
  question_id: z.string().uuid(),
  response_body: z.object({}).passthrough(),
  time_taken_ms: z
    .number()
    .int()
    .min(0)
    .max(24 * 3600 * 1000)
    .optional(),
  integrity_events: z.object({}).passthrough().optional(),
  current_idx: z.number().int().min(0).max(1000).optional(),
});

const SubmitBody = z.object({ token: z.string().min(16).max(128) });

export interface AttemptsRouterDeps {
  pool: Pool;
}

/**
 * Candidate-facing router — token-scoped, NO API key. Mount BEFORE the /v1
 * apiKeyAuth chain so these routes resolve without a key (candidates have none).
 */
export function candidateAttemptRouter(deps: AttemptsRouterDeps): Router {
  const router = Router();

  // Pre-start: validate invite, return assessment meta + candidate name.
  router.get('/v1/invitations/:token', async (req, res, next) => {
    try {
      const inv = await getInvitationByToken(deps.pool, req.params.token);
      if (!inv) {
        next(new HttpProblem({ status: 404, title: 'Not Found', detail: 'Invitation not found' }));
        return;
      }
      if (inv.expires_at.getTime() < Date.now()) {
        next(new HttpProblem({ status: 410, title: 'Gone', detail: 'Invitation has expired' }));
        return;
      }
      res.status(200).json({
        candidate_name: inv.candidate_name,
        status: inv.status,
        expires_at: inv.expires_at.toISOString(),
        assessment: {
          title: inv.assessment_title,
          total_questions: inv.total_questions,
          time_limit_sec: inv.time_limit_sec,
          pass_score: Number(inv.pass_score),
        },
      });
    } catch (err) {
      next(err);
    }
  });

  // Start (or resume) an attempt; returns attempt + first sanitized question.
  router.post('/v1/invitations/:token/start', async (req, res, next) => {
    try {
      const inv = await getInvitationByToken(deps.pool, req.params.token);
      if (!inv) {
        next(new HttpProblem({ status: 404, title: 'Not Found', detail: 'Invitation not found' }));
        return;
      }
      if (inv.expires_at.getTime() < Date.now()) {
        next(new HttpProblem({ status: 410, title: 'Gone', detail: 'Invitation has expired' }));
        return;
      }
      const attempt = await createOrResumeAttempt(deps.pool, inv);
      let firstQuestion: Record<string, unknown> | null = null;
      const firstId = attempt.question_order[attempt.current_idx] ?? attempt.question_order[0];
      if (firstId) {
        const q = await getCandidateQuestion(deps.pool, firstId);
        if (q) firstQuestion = sanitizeQuestion(q);
      }
      res.status(201).json({
        attempt_id: attempt.id,
        status: attempt.status,
        total_questions: attempt.question_order.length,
        current_idx: attempt.current_idx,
        time_limit_sec: inv.time_limit_sec,
        question: firstQuestion,
      });
    } catch (err) {
      next(err);
    }
  });

  // Fetch a single sanitized question by position.
  router.get('/v1/attempts/:id/question/:idx', async (req, res, next) => {
    try {
      const id = req.params.id;
      const token = tokenFromQuery(req.query.token);
      if (!UUID.test(id) || !token) {
        next(
          new HttpProblem({
            status: 400,
            title: 'Bad Request',
            detail: 'attempt id + token required',
          }),
        );
        return;
      }
      const attempt = await getAttemptForToken(deps.pool, id, token);
      if (!attempt) {
        next(
          new HttpProblem({
            status: 404,
            title: 'Not Found',
            detail: 'Attempt not found for token',
          }),
        );
        return;
      }
      const idx = Number.parseInt(req.params.idx ?? '', 10);
      const qid = Number.isInteger(idx) ? attempt.question_order[idx] : undefined;
      if (!qid) {
        next(
          new HttpProblem({ status: 404, title: 'Not Found', detail: 'No question at that index' }),
        );
        return;
      }
      const q = await getCandidateQuestion(deps.pool, qid);
      if (!q) {
        next(new HttpProblem({ status: 404, title: 'Not Found', detail: 'Question not found' }));
        return;
      }
      res
        .status(200)
        .json({ idx, total: attempt.question_order.length, question: sanitizeQuestion(q) });
    } catch (err) {
      next(err);
    }
  });

  // Save an answer (stored unscored; graded on submit).
  router.post('/v1/attempts/:id/answer', async (req, res, next) => {
    let body;
    try {
      body = AnswerBody.parse(req.body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        next(
          new HttpProblem({
            status: 400,
            title: 'Bad Request',
            detail: 'Invalid answer body',
            extensions: { violations: err.flatten() },
          }),
        );
        return;
      }
      next(err);
      return;
    }
    try {
      const attempt = await getAttemptForToken(deps.pool, req.params.id, body.token);
      if (!attempt) {
        next(
          new HttpProblem({
            status: 404,
            title: 'Not Found',
            detail: 'Attempt not found for token',
          }),
        );
        return;
      }
      if (attempt.status === 'graded' || attempt.status === 'submitted') {
        next(
          new HttpProblem({ status: 409, title: 'Conflict', detail: 'Attempt already submitted' }),
        );
        return;
      }
      if (!attempt.question_order.includes(body.question_id)) {
        next(
          new HttpProblem({
            status: 422,
            title: 'Unprocessable Entity',
            detail: 'question_id is not part of this attempt',
          }),
        );
        return;
      }
      const saved = await upsertAnswer(deps.pool, {
        attemptId: attempt.id,
        tenantId: attempt.tenant_id,
        candidateId: attempt.candidate_id,
        questionId: body.question_id,
        responseBody: body.response_body as Record<string, unknown>,
        timeTakenMs: body.time_taken_ms ?? null,
        ...(body.integrity_events
          ? { integrityEvents: body.integrity_events as Record<string, unknown> }
          : {}),
        ...(body.current_idx !== undefined ? { currentIdx: body.current_idx } : {}),
      });
      res.status(200).json({ saved: true, response_id: saved.id });
    } catch (err) {
      next(err);
    }
  });

  // Submit: grade all stored answers, finalize totals, return candidate summary.
  router.post('/v1/attempts/:id/submit', async (req, res, next) => {
    let body;
    try {
      body = SubmitBody.parse(req.body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        next(new HttpProblem({ status: 400, title: 'Bad Request', detail: 'token required' }));
        return;
      }
      next(err);
      return;
    }
    try {
      const attempt = await getAttemptForToken(deps.pool, req.params.id, body.token);
      if (!attempt) {
        next(
          new HttpProblem({
            status: 404,
            title: 'Not Found',
            detail: 'Attempt not found for token',
          }),
        );
        return;
      }
      if (attempt.status === 'graded') {
        const summary = await buildCandidateResult(deps.pool, attempt);
        res.status(200).json(summary);
        return;
      }
      const result = await gradeAttempt(deps.pool, attempt.id);
      res.status(200).json({
        attempt_id: result.attempt_id,
        status: result.status,
        score_pct: result.total_score,
        passed: result.passed,
        graded: result.graded_count,
        unscored: result.unscored_count,
        per_skill: result.per_skill,
      });
    } catch (err) {
      next(err);
    }
  });

  // Candidate-facing result (no answer keys).
  router.get('/v1/attempts/:id/result', async (req, res, next) => {
    try {
      const token = tokenFromQuery(req.query.token);
      if (!UUID.test(req.params.id) || !token) {
        next(
          new HttpProblem({
            status: 400,
            title: 'Bad Request',
            detail: 'attempt id + token required',
          }),
        );
        return;
      }
      const attempt = await getAttemptForToken(deps.pool, req.params.id, token);
      if (!attempt) {
        next(
          new HttpProblem({
            status: 404,
            title: 'Not Found',
            detail: 'Attempt not found for token',
          }),
        );
        return;
      }
      res.status(200).json(await buildCandidateResult(deps.pool, attempt));
    } catch (err) {
      next(err);
    }
  });

  return router;
}

async function buildCandidateResult(
  pool: Pool,
  attempt: AttemptRow,
): Promise<Record<string, unknown>> {
  const passRow = await pool.query<{ pass_score: string }>(
    `SELECT pass_score FROM content.assessments WHERE id = $1`,
    [attempt.assessment_id],
  );
  const passScore = passRow.rows[0] ? Number(passRow.rows[0].pass_score) : 0.6;
  const total = attempt.total_score !== null ? Number(attempt.total_score) : null;
  const answered = (await listAttemptResponses(pool, attempt.id)).length;
  // N11 slice 2: surface effort/timing (no answer keys, safe pre-grading).
  const startedAt = attempt.started_at ? new Date(attempt.started_at) : null;
  const submittedAt = attempt.submitted_at ? new Date(attempt.submitted_at) : null;
  const durationSec =
    startedAt && submittedAt
      ? Math.max(0, Math.round((submittedAt.getTime() - startedAt.getTime()) / 1000))
      : null;
  return {
    attempt_id: attempt.id,
    status: attempt.status,
    score_pct: total,
    passed: total !== null ? total / 100 >= passScore : null,
    answered,
    total_questions: attempt.question_order.length,
    started_at: startedAt ? startedAt.toISOString() : null,
    submitted_at: submittedAt ? submittedAt.toISOString() : null,
    duration_sec: durationSec,
  };
}

/**
 * Admin review router — API-key + tenant scoped. Mount INSIDE the /v1 auth
 * chain. Recruiters see per-answer score + reasoning trace + integrity flags.
 */
export function attemptReviewRouter(deps: AttemptsRouterDeps): Router {
  const router = Router();

  router.get('/attempts/:id/review', async (req, res, next) => {
    const auth = (req as AuthenticatedRequest).auth;
    if (!auth) {
      next(new HttpProblem({ status: 401, title: 'Unauthorized', detail: 'API key required' }));
      return;
    }
    const id = req.params.id;
    if (!UUID.test(id)) {
      next(
        new HttpProblem({ status: 400, title: 'Bad Request', detail: 'Attempt id must be a UUID' }),
      );
      return;
    }
    try {
      const attempt = await getAttempt(deps.pool, id);
      if (!attempt || attempt.tenant_id !== auth.tenantId) {
        next(
          new HttpProblem({
            status: 404,
            title: 'Not Found',
            detail: 'Attempt not found for tenant',
          }),
        );
        return;
      }
      const responses = await listAttemptResponses(deps.pool, id);
      const detailed = await Promise.all(
        responses.map(async (r) => {
          const q = await loadQuestion(deps.pool, r.question_id);
          return {
            response_id: r.id,
            question_id: r.question_id,
            format: q ? ((q as { format?: string }).format ?? null) : null,
            response_body: r.response_body,
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
        responses: detailed,
        integrity: summarizeIntegrity(responses.map((r) => r.suspicious_signals)),
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
