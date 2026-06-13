import { describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { Pool } from '@qorium/db';
import { questionsRouter } from '../src/routes/questions.js';
import { problemHandler } from '../src/middleware/problem.js';

/**
 * N17 test-storm — route-level coverage for the public question-bank
 * read endpoints' DB-free validation gates. These branches were
 * previously only exercised indirectly via lib unit tests:
 *
 *   GET /questions/search
 *     - Zod rejects a bad format/difficulty/language/limit -> 400 BEFORE DB.
 *     - A malformed cursor (decodeCursor throws) -> 400 BEFORE DB.
 *   GET /questions/:uuid
 *     - A non-UUID id -> 400 BEFORE DB.
 *
 * searchQuestions() and getQuestionByUuid() both call pool.query() as their
 * first operation, so a Pool whose query THROWS proves every gate below
 * rejects without ever touching Postgres. Problems surface via
 * next(HttpProblem), so problemHandler() is mounted after the router.
 *
 * A positive control (well-formed search) confirms the same wiring reaches
 * the repository — there it hits the throwing Pool and surfaces as 500,
 * which proves the earlier 400s are gate rejections, not blanket failures.
 */

// A pool that fails loudly if any handler reaches the DB on these gate paths.
const throwingPool = {
  query: async () => {
    throw new Error('DB must not be queried on validation-gate paths');
  },
} as unknown as Pool;

function appWithQuestions(): express.Express {
  const app = express();
  app.use(questionsRouter({ pool: throwingPool }));
  app.use(problemHandler());
  return app;
}

describe('questions search route — invalid query rejected 400 before DB', () => {
  const app = appWithQuestions();

  // Each query is structurally invalid for a distinct Zod reason.
  const badQueries: Array<[string, string]> = [
    ['format=not-a-format', 'unknown enum format'],
    ['difficulty=9', 'difficulty above max(5)'],
    ['difficulty=0', 'difficulty below min(1)'],
    ['difficulty=abc', 'non-numeric difficulty'],
    ['language=eng', 'language not exactly 2 chars'],
    ['language=1n', 'language not [a-z]{2}'],
    ['limit=0', 'limit below min(1)'],
    ['limit=101', 'limit above max(100)'],
    ['skill=', 'empty skill fails min(1)'],
  ];

  for (const [qs, why] of badQueries) {
    it(`GET /questions/search?${qs} -> 400 (${why})`, async () => {
      const res = await request(app).get(`/questions/search?${qs}`);
      expect(res.status).toBe(400);
      expect(res.headers['content-type']).toContain('application/problem+json');
      expect(res.body.status).toBe(400);
    });
  }

  it('GET /questions/search with a malformed cursor -> 400 (decodeCursor)', async () => {
    // Valid Zod string, but not decodable as a base64url JSON cursor tuple.
    const res = await request(app).get('/questions/search?cursor=not-a-real-cursor');
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });

  it('GET /questions/search with a base64url cursor missing fields -> 400', async () => {
    // base64url of {"x":1} — decodes fine but lacks the required r/i tuple.
    const badCursor = Buffer.from(JSON.stringify({ x: 1 }), 'utf8').toString('base64url');
    const res = await request(app).get(`/questions/search?cursor=${badCursor}`);
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('GET /questions/search with a cursor whose id is not a UUID -> 400', async () => {
    const badCursor = Buffer.from(
      JSON.stringify({ r: '2026-01-01T00:00:00.000Z', i: 'nope' }),
      'utf8',
    ).toString('base64url');
    const res = await request(app).get(`/questions/search?cursor=${badCursor}`);
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('GET /questions/search well-formed -> 500 (reaches throwing DB, proving 400s are gate-side)', async () => {
    const res = await request(app).get('/questions/search?skill=aws&difficulty=3&limit=10');
    // Validation passes, so the handler proceeds to searchQuestions(), which
    // hits the throwing Pool and surfaces as a 500 problem. This is the
    // positive control distinguishing a passed gate from a rejected one.
    expect(res.status).toBe(500);
  });
});

describe('questions by-id route — non-UUID rejected 400 before DB', () => {
  const app = appWithQuestions();

  const badIds = [
    'not-a-uuid',
    '12345',
    '123e4567-e89b-12d3-a456', // truncated UUID
    'zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz', // right shape, illegal hex
  ];

  for (const id of badIds) {
    it(`GET /questions/${id.slice(0, 16)} -> 400 problem`, async () => {
      const res = await request(app).get(`/questions/${encodeURIComponent(id)}`);
      expect(res.status).toBe(400);
      expect(res.headers['content-type']).toContain('application/problem+json');
      expect(res.body.status).toBe(400);
    });
  }

  it('GET /questions/:uuid with a valid UUID -> 500 (reaches throwing DB, proving 400s are gate-side)', async () => {
    const res = await request(app).get('/questions/123e4567-e89b-12d3-a456-426614174000');
    // Well-formed UUID passes the gate, so getQuestionByUuid() runs and hits
    // the throwing Pool -> 500. Confirms the earlier 400s are id-validation
    // rejections, not a blanket failure mode.
    expect(res.status).toBe(500);
  });
});
