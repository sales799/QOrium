/**
 * Public candidate take flow (Sprint 1.3).
 *
 *   GET  /take/:token       Sets the qor_take cookie + serves the take HTML.
 *   GET  /api/state         Returns the current question + progress.
 *   POST /api/answer        Records an answer + advances to the next question.
 *   GET  /result            Returns the final result (after status='completed').
 *
 * All /api/* endpoints are gated by takeAuth (cookie-based). Anonymous in
 * the recruiter sense — there is no recruiter session here. The only
 * principal is the candidate, identified by the take token cookie.
 */
import { Router } from 'express';
import { z } from 'zod';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Pool } from '@qorium/db';
import { recordAuditEvent } from '@qorium/auth';
import type { Config } from '../config.js';
import { HttpProblem } from '../middleware/problem.js';
import { issueTakeCookie, takeAuth, type TakeRequest } from '../middleware/take-auth.js';
import {
  findSessionByToken,
  loadPackQuestions,
  markStartedIfPending,
  recordAnswerAndAdvance,
  type PackQuestion,
  type SessionRow,
} from '../repositories/sessions.js';
import { watermarkBody } from '../watermark.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TAKE_HTML_PATH = path.join(__dirname, '..', '..', 'public', 'take.html');

const AnswerSchema = z.object({
  question_id: z.string().uuid(),
  value: z.string().min(1).max(8192),
  time_taken_ms: z
    .number()
    .int()
    .min(0)
    .max(24 * 60 * 60_000)
    .optional(),
});

export interface TakeRouterDeps {
  pool: Pool;
  config: Config;
  audit?: boolean;
}

/**
 * Serialise a question for the candidate. Strips answer_key + rubric (those
 * stay server-side) and applies the per-session watermark so leaked items
 * trace back to one candidate.
 */
function publicQuestionFor(
  q: PackQuestion,
  session: SessionRow,
): {
  id: string;
  format: string;
  body: string;
  options: unknown;
  difficulty_b: number | null;
} {
  const body = (q.body_json?.['body'] as string | undefined) ?? q.body_md;
  const watermarked = watermarkBody(body, {
    questionId: q.id,
    sessionSalt: session.watermark_salt,
  });
  return {
    id: q.id,
    format: q.format,
    body: watermarked,
    options: (q.body_json?.['options'] as unknown) ?? null,
    difficulty_b: q.difficulty_b ? Number(q.difficulty_b) : null,
  };
}

/**
 * Score one MCQ-style answer. v0 logic: pull the leading letter of
 * answer_key.text (e.g. "B — explanation" → "B") and compare to the
 * candidate's value (case-insensitive, leading-letter-only). Other formats
 * are recorded as ungraded (is_correct=null, score 0/0).
 */
function gradeAnswer(
  q: PackQuestion,
  value: string,
): { isCorrect: boolean | null; total: number; max: number } {
  const fmt = q.format.toLowerCase();
  if (fmt === 'mcq' || fmt === 'sjt-mcq' || fmt === 'msq') {
    const keyText = (q.answer_key as { text?: string } | null)?.text;
    if (!keyText) return { isCorrect: null, total: 0, max: 0 };
    const expected = keyText
      .trim()
      .match(/^([A-D])/i)?.[1]
      ?.toUpperCase();
    const got = value
      .trim()
      .match(/^([A-D])/i)?.[1]
      ?.toUpperCase();
    if (!expected || !got) return { isCorrect: null, total: 0, max: 0 };
    const correct = expected === got;
    return { isCorrect: correct, total: correct ? 5 : 0, max: 5 };
  }
  return { isCorrect: null, total: 0, max: 0 };
}

export function takeRouter(deps: TakeRouterDeps): Router {
  const router = Router();
  const auditEnabled = deps.audit ?? true;

  function audit(req: TakeRequest, event: string): void {
    if (!auditEnabled) return;
    const session = req.takeSession;
    void recordAuditEvent({
      pool: deps.pool,
      event: {
        actor_type: 'system',
        actor_id: null,
        event_type: event,
        entity_type: 'session',
        ...(session ? { entity_id: session.id } : {}),
        payload: session ? { candidate_email: session.candidate_email } : {},
        ip_address: req.ip,
        user_agent: req.get('user-agent') ?? undefined,
      },
      onError: (err) => req.log?.warn({ err }, 'audit event write failed'),
    });
  }

  // --- Public landing ------------------------------------------------------
  router.get('/take/:token', async (req, res, next) => {
    const tokenParam = req.params.token;
    const token = typeof tokenParam === 'string' ? tokenParam : '';
    if (!token || token.length < 16 || token.length > 256) {
      next(new HttpProblem({ status: 400, title: 'Bad Request', detail: 'Invalid take token' }));
      return;
    }
    try {
      const session = await findSessionByToken(deps.pool, token);
      if (!session) {
        next(
          new HttpProblem({
            status: 404,
            type: 'https://qorium.io/problems/take/invalid-token',
            title: 'Not Found',
            detail: 'This take link is invalid.',
          }),
        );
        return;
      }
      const now = Date.now();
      if (session.status === 'revoked') {
        next(new HttpProblem({ status: 410, title: 'Gone', detail: 'Assessment revoked.' }));
        return;
      }
      if (session.expires_at.getTime() <= now) {
        next(new HttpProblem({ status: 410, title: 'Gone', detail: 'Take link expired.' }));
        return;
      }
      issueTakeCookie(res, token, {
        cookieSecure: deps.config.cookieSecure,
        expiresAt: session.expires_at,
      });
      audit(req as TakeRequest, 'take.opened');
      res.sendFile(TAKE_HTML_PATH, (err) => {
        // If the static HTML is missing (dev / smoke), fall through to a
        // minimal text response instead of 500-ing.
        if (err) {
          res.type('text/plain').send('Take started. Open the candidate UI.');
        }
      });
    } catch (err) {
      next(err);
    }
  });

  // --- Authenticated take API --------------------------------------------
  const apiAuth = takeAuth({ pool: deps.pool, cookieSecure: deps.config.cookieSecure });

  router.get('/api/state', apiAuth, async (req, res, next) => {
    const session = (req as TakeRequest).takeSession!;
    try {
      const questions = await loadPackQuestions(deps.pool, session.pack_id);
      if (questions.length === 0) {
        next(
          new HttpProblem({
            status: 500,
            title: 'Internal Server Error',
            detail: 'Pack has no questions.',
          }),
        );
        return;
      }

      if (session.status === 'completed') {
        res.json({
          state: 'completed',
          total_questions: questions.length,
          answered: session.answers.length,
          score_total: session.score_total ? Number(session.score_total) : 0,
          score_max: session.score_max ? Number(session.score_max) : 0,
        });
        return;
      }

      if (session.status === 'pending') {
        await markStartedIfPending(deps.pool, session.id);
        audit(req as TakeRequest, 'take.started');
      }

      const idx = session.current_question_index;
      const q = questions[idx];
      if (!q) {
        next(new HttpProblem({ status: 500, title: 'Internal Server Error' }));
        return;
      }
      res.json({
        state: 'in_progress',
        index: idx,
        total_questions: questions.length,
        candidate: {
          email: session.candidate_email,
          name: session.candidate_name,
        },
        question: publicQuestionFor(q, session),
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/api/answer', apiAuth, async (req, res, next) => {
    const session = (req as TakeRequest).takeSession!;
    if (session.status === 'completed') {
      next(
        new HttpProblem({
          status: 409,
          title: 'Conflict',
          detail: 'Assessment already completed.',
        }),
      );
      return;
    }

    let parsed;
    try {
      parsed = AnswerSchema.parse(req.body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        next(
          new HttpProblem({
            status: 400,
            title: 'Bad Request',
            detail: 'Invalid answer payload',
            extensions: { violations: err.flatten() },
          }),
        );
        return;
      }
      next(err);
      return;
    }

    try {
      const questions = await loadPackQuestions(deps.pool, session.pack_id);
      const idx = session.current_question_index;
      const expected = questions[idx];
      if (!expected) {
        next(
          new HttpProblem({
            status: 409,
            title: 'Conflict',
            detail: 'No question at the current index.',
          }),
        );
        return;
      }
      if (expected.id !== parsed.question_id) {
        next(
          new HttpProblem({
            status: 409,
            type: 'https://qorium.io/problems/take/out-of-sequence',
            title: 'Conflict',
            detail: 'Answer does not match the current question.',
          }),
        );
        return;
      }

      const grade = gradeAnswer(expected, parsed.value);
      const advance = await recordAnswerAndAdvance(
        deps.pool,
        session.id,
        expected.id,
        parsed.value,
        grade.isCorrect,
        parsed.time_taken_ms ?? 0,
        questions.length,
        { total: grade.total, max: grade.max },
      );

      audit(req as TakeRequest, advance.done ? 'take.completed' : 'take.answer.recorded');

      res.status(200).json({
        state: advance.done ? 'completed' : 'in_progress',
        index: advance.session.current_question_index,
        total_questions: questions.length,
        score_total: advance.session.score_total ? Number(advance.session.score_total) : 0,
        score_max: advance.session.score_max ? Number(advance.session.score_max) : 0,
      });
    } catch (err) {
      next(err);
    }
  });

  // --- Public completion view --------------------------------------------
  // Once status='completed', candidate sees a thank-you + their score.
  router.get('/result', apiAuth, async (req, res, next) => {
    const session = (req as TakeRequest).takeSession!;
    if (session.status !== 'completed') {
      next(
        new HttpProblem({
          status: 409,
          title: 'Conflict',
          detail: 'Assessment not yet completed.',
        }),
      );
      return;
    }
    try {
      const questions = await loadPackQuestions(deps.pool, session.pack_id);
      res.json({
        candidate: {
          email: session.candidate_email,
          name: session.candidate_name,
        },
        completed_at: session.completed_at?.toISOString() ?? null,
        total_questions: questions.length,
        answered: session.answers.length,
        score_total: session.score_total ? Number(session.score_total) : 0,
        score_max: session.score_max ? Number(session.score_max) : 0,
        score_percent:
          session.score_max && Number(session.score_max) > 0
            ? Math.round((Number(session.score_total) / Number(session.score_max)) * 100)
            : null,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
