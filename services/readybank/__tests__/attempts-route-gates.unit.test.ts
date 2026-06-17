import { describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { Pool } from '@qorium/db';
import type { AuthContext, AuthenticatedRequest } from '@qorium/auth';
import { candidateAttemptRouter, attemptReviewRouter } from '../src/routes/attempts.js';
import { problemHandler } from '../src/middleware/problem.js';

/**
 * N17 test-storm -- route-level coverage for the candidate attempt keystone
 * src/routes/attempts.ts. Every branch asserted here rejects a request BEFORE
 * any repository call, so Postgres is never touched.
 *
 * candidateAttemptRouter (token-scoped, NO API key):
 *   POST /v1/attempts/:id/answer  -- AnswerBody (Zod) parses BEFORE getAttemptForToken
 *     1. missing token                          -> 400 (no DB)
 *     2. short token (<16 chars)                -> 400 (no DB)
 *     3. non-UUID question_id                   -> 400 (no DB)
 *     4. missing response_body                  -> 400 (no DB)
 *   POST /v1/attempts/:id/submit  -- SubmitBody (Zod) parses BEFORE the DB
 *     5. missing token                          -> 400 (no DB)
 *     6. short token                            -> 400 (no DB)
 *   GET /v1/attempts/:id/question/:idx -- (!UUID.test(id) || !token) gate BEFORE DB
 *     7. non-UUID attempt id                    -> 400 (no DB)
 *     8. missing token query param              -> 400 (no DB)
 *     9. short token (<16)                      -> 400 (no DB)
 *   GET /v1/attempts/:id/state -- same pre-DB gate
 *     10. non-UUID id                           -> 400 (no DB)
 *     11. missing token                         -> 400 (no DB)
 *   GET /v1/attempts/:id/result -- same pre-DB gate
 *     12. non-UUID id                           -> 400 (no DB)
 *     13. missing token                         -> 400 (no DB)
 *
 * attemptReviewRouter (API-key + tenant scoped):
 *   GET /attempts/:id/review
 *     14. missing API key                       -> 401 (no DB)
 *     15. authed + non-UUID id                  -> 400 (before getAttempt)
 *
 * The stub Pool THROWS if queried, proving every gate above short-circuits
 * before Postgres. Both routers surface problems via next(HttpProblem), so
 * problemHandler() is mounted. The candidate router is token-scoped and needs
 * no auth middleware (candidates have no API key); the review router is mounted
 * bare (Group A, no auth -> 401) or behind a tiny middleware that injects a
 * synthetic AuthContext (Group B, so the UUID gate downstream of the auth check
 * is reachable while the DB stays untouched). This is the first
 * route-integration coverage of src/routes/attempts.ts (previously only the
 * attempts repository + lib helpers were exercised), mirroring the
 * assessments / a4 / proof / billing route-gate pattern
 * (PRs #198/#199/#200/#201/#202).
 */

// A pool that fails loudly if any handler reaches the DB on these gate paths.
const throwingPool = {
  query: async () => {
    throw new Error('DB must not be queried on the /v1/attempts auth/validation gates');
  },
} as unknown as Pool;

const FAKE_AUTH: AuthContext = {
  apiKeyId: '00000000-0000-4000-8000-0000000000a1',
  tenantId: '00000000-0000-4000-8000-0000000000b1',
  prefix: 'qor_test',
  scopes: ['attempts:read'],
  name: 'route-gate-test-key',
};

const VALID_UUID = '00000000-0000-4000-8000-0000000000c1';
// A token long enough to clear the >=16 length floor used by the routes.
const GOOD_TOKEN = 'tok_0123456789abcdef0123';

// --- candidate router (token-scoped, no auth middleware) ---
function candidateApp(): express.Express {
  const app = express();
  app.use(express.json());
  app.use(candidateAttemptRouter({ pool: throwingPool }));
  app.use(problemHandler());
  return app;
}

// --- review router: bare (no auth -> 401 before DB) ---
function reviewAppNoAuth(): express.Express {
  const app = express();
  app.use(express.json());
  app.use(attemptReviewRouter({ pool: throwingPool }));
  app.use(problemHandler());
  return app;
}

// --- review router: synthetic AuthContext injected so the UUID gate is reachable, still DB-free ---
function reviewAppAuthed(): express.Express {
  const app = express();
  app.use(express.json());
  app.use((req, _res, nextFn) => {
    (req as AuthenticatedRequest).auth = FAKE_AUTH;
    nextFn();
  });
  app.use(attemptReviewRouter({ pool: throwingPool }));
  app.use(problemHandler());
  return app;
}

describe('POST /v1/attempts/:id/answer -- AnswerBody validation gate (no DB)', () => {
  const app = candidateApp();

  it('missing token -> 400 application/problem+json before any query', async () => {
    const res = await request(app)
      .post(`/v1/attempts/${VALID_UUID}/answer`)
      .send({ question_id: VALID_UUID, response_body: {} });
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });

  it('short token (<16 chars) -> 400 (no DB)', async () => {
    const res = await request(app)
      .post(`/v1/attempts/${VALID_UUID}/answer`)
      .send({ token: 'short', question_id: VALID_UUID, response_body: {} });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('non-UUID question_id -> 400 (no DB)', async () => {
    const res = await request(app)
      .post(`/v1/attempts/${VALID_UUID}/answer`)
      .send({ token: GOOD_TOKEN, question_id: 'not-a-uuid', response_body: {} });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('missing response_body -> 400 (no DB)', async () => {
    const res = await request(app)
      .post(`/v1/attempts/${VALID_UUID}/answer`)
      .send({ token: GOOD_TOKEN, question_id: VALID_UUID });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });
});

describe('POST /v1/attempts/:id/submit -- SubmitBody validation gate (no DB)', () => {
  const app = candidateApp();

  it('missing token -> 400 before any query', async () => {
    const res = await request(app).post(`/v1/attempts/${VALID_UUID}/submit`).send({});
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });

  it('short token -> 400 (no DB)', async () => {
    const res = await request(app)
      .post(`/v1/attempts/${VALID_UUID}/submit`)
      .send({ token: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });
});

describe('GET /v1/attempts/:id/question/:idx -- id+token gate (no DB)', () => {
  const app = candidateApp();

  it('non-UUID attempt id -> 400 before getAttemptForToken', async () => {
    const res = await request(app).get(`/v1/attempts/not-a-uuid/question/0?token=${GOOD_TOKEN}`);
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });

  it('missing token query param -> 400 (no DB)', async () => {
    const res = await request(app).get(`/v1/attempts/${VALID_UUID}/question/0`);
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('short token (<16) -> 400 (no DB)', async () => {
    const res = await request(app).get(`/v1/attempts/${VALID_UUID}/question/0?token=short`);
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });
});

describe('GET /v1/attempts/:id/state -- id+token gate (no DB)', () => {
  const app = candidateApp();

  it('non-UUID id -> 400 before getAttemptForToken', async () => {
    const res = await request(app).get(`/v1/attempts/not-a-uuid/state?token=${GOOD_TOKEN}`);
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('missing token -> 400 (no DB)', async () => {
    const res = await request(app).get(`/v1/attempts/${VALID_UUID}/state`);
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });
});

describe('GET /v1/attempts/:id/result -- id+token gate (no DB)', () => {
  const app = candidateApp();

  it('non-UUID id -> 400 before getAttemptForToken', async () => {
    const res = await request(app).get(`/v1/attempts/not-a-uuid/result?token=${GOOD_TOKEN}`);
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('missing token -> 400 (no DB)', async () => {
    const res = await request(app).get(`/v1/attempts/${VALID_UUID}/result`);
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });
});

describe('GET /attempts/:id/review -- auth + UUID gates (no DB)', () => {
  it('missing API key -> 401 (no DB)', async () => {
    const res = await request(reviewAppNoAuth()).get(`/attempts/${VALID_UUID}/review`);
    expect(res.status).toBe(401);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(401);
  });

  it('authed + non-UUID id -> 400 before getAttempt', async () => {
    const res = await request(reviewAppAuthed()).get('/attempts/not-a-uuid/review');
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });
});
