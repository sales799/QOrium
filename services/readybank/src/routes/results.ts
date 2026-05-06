/**
 * Recruiter-side results route (Sprint 1.2).
 *
 *   GET /v1/results/:session_id   JSON or HTML detail of a completed session.
 *
 * Recruiter cookie-gated. Returns RFC 7807 problems on failure.
 */
import { Router } from 'express';
import type { Pool } from '@qorium/db';
import type { Config } from '../config.js';
import { HttpProblem } from '../middleware/problem.js';
import { recruiterAuth, type RecruiterRequest } from '../middleware/recruiter-auth.js';
import { findSessionById, loadPackQuestions } from '../repositories/sessions.js';

export interface ResultsRouterDeps {
  pool: Pool;
  config: Config;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function resultsRouter(deps: ResultsRouterDeps): Router {
  const router = Router();
  const cookieOptions = {
    jwtSecret: deps.config.jwtSecret as string,
    cookieSecure: deps.config.cookieSecure,
  };

  const gate = recruiterAuth(cookieOptions);

  router.get('/results/:id', gate, async (req, res, next) => {
    const recruiter = (req as RecruiterRequest).recruiter;
    if (!recruiter) {
      next(new HttpProblem({ status: 401, title: 'Unauthorized' }));
      return;
    }
    const idParam = req.params.id;
    const id = typeof idParam === 'string' ? idParam : '';
    if (!UUID_RE.test(id)) {
      next(new HttpProblem({ status: 400, title: 'Bad Request', detail: 'Invalid session id' }));
      return;
    }

    try {
      const row = await findSessionById(deps.pool, id, recruiter.id);
      if (!row) {
        next(new HttpProblem({ status: 404, title: 'Not Found' }));
        return;
      }
      const questions = await loadPackQuestions(deps.pool, row.pack_id);

      const summary = {
        session_id: row.id,
        candidate: { email: row.candidate_email, name: row.candidate_name },
        pack_id: row.pack_id,
        status: row.status,
        total_questions: questions.length,
        answered: row.answers?.length ?? 0,
        score_total: row.score_total ? Number(row.score_total) : 0,
        score_max: row.score_max ? Number(row.score_max) : 0,
        score_percent:
          row.score_max && Number(row.score_max) > 0
            ? Math.round((Number(row.score_total) / Number(row.score_max)) * 100)
            : null,
        started_at: row.started_at?.toISOString() ?? null,
        completed_at: row.completed_at?.toISOString() ?? null,
        per_question: (row.answers ?? []).map((a, i) => {
          const q = questions[i];
          return {
            index: i,
            question_id: a.question_id,
            format: q?.format ?? null,
            value: a.value,
            is_correct: a.is_correct,
            time_taken_ms: a.time_taken_ms,
            answered_at: a.answered_at,
          };
        }),
      };

      const accepts = req.get('accept') ?? '';
      if (accepts.includes('text/html')) {
        const escape = (s: unknown) =>
          String(s ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        const rows = summary.per_question
          .map(
            (p) =>
              `<tr><td>${p.index + 1}</td><td>${escape(p.format)}</td><td>${escape(p.value)}</td><td>${
                p.is_correct === null ? '—' : p.is_correct ? '✓' : '✗'
              }</td></tr>`,
          )
          .join('');
        res
          .status(200)
          .type('text/html')
          .send(
            `<!doctype html><meta charset="utf-8"><title>Result · ${escape(summary.candidate.email)}</title>` +
              `<link rel="stylesheet" href="/login.css"><link rel="stylesheet" href="/dashboard.css">` +
              `<main class="dashboard-main"><section class="panel">` +
              `<h2>Result · ${escape(summary.candidate.email)}</h2>` +
              `<p>Status: <strong>${escape(summary.status)}</strong>` +
              ` &middot; Score: <strong>${summary.score_total}/${summary.score_max}` +
              (summary.score_percent === null ? '' : ` (${summary.score_percent}%)`) +
              `</strong></p>` +
              `<table class="sessions"><thead><tr><th>#</th><th>Format</th><th>Answer</th><th>✓?</th></tr></thead><tbody>${rows}</tbody></table>` +
              `</section></main>`,
          );
        return;
      }

      res.status(200).json({ data: summary });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
