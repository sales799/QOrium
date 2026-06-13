import { describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { Pool } from '@qorium/db';
import type { AuthContext, AuthenticatedRequest } from '@qorium/auth';
import { assessmentsRouter } from '../src/routes/assessments.js';
import { problemHandler } from '../src/middleware/problem.js';

/**
 * N17 test-storm -- route-level coverage for the recruiter-facing
 * /v1/assessments/* endpoints' DB-free gates. Every branch asserted here
 * rejects a request BEFORE any repository call, so Postgres is never touched:
 *
 *   POST /assessments
 *     1. missing auth (no API key)              -> 401 (no DB)
 *     2. authed + malformed body (Zod)          -> 400 (before any query)
 *     3. authed + both question_ids+blueprint   -> 400 (Zod .refine, no DB)
 *     4. authed + neither selection input       -> 400 (Zod .refine, no DB)
 *
 *   GET /assessments/:id
 *     5. missing auth                           -> 401 (no DB)
 *     6. authed + non-UUID id                   -> 400 (before getAssessment)
 *
 *   POST /assessments/:id/invite
 *     7. missing auth                           -> 401 (no DB)
 *     8. authed + non-UUID id                   -> 400 (before any query)
 *     9. authed + valid UUID + malformed body   -> 400 (Zod, before any query)
 *
 * The stub Pool THROWS if queried, proving every gate above short-circuits
 * before Postgres. assessmentsRouter surfaces problems via next(HttpProblem),
 * so problemHandler() is mounted. Auth is normally attached upstream by
 * apiKeyAuth(); here the router is mounted bare (Group A, no auth -> 401) or
 * behind a tiny middleware that injects a synthetic AuthContext (Group B, so
 * the validation gates downstream of the auth check are reachable while the DB
 * stays untouched). This is the first route-integration coverage of
 * src/routes/assessments.ts (previously only the assessments repository was
 * exercised), mirroring the a4 / proof / billing route-gate pattern
 * (PRs #198/#199/#200/#201).
 */

// A pool that fails loudly if any handler reaches the DB on these gate paths.
const throwingPool = {
  query: async () => {
    throw new Error('DB must not be queried on the /v1/assessments auth/validation gates');
  },
} as unknown as Pool;

const FAKE_AUTH: AuthContext = {
  apiKeyId: '00000000-0000-4000-8000-0000000000a1',
  tenantId: '00000000-0000-4000-8000-0000000000b1',
  prefix: 'qor_test',
  scopes: ['assessments:write'],
  name: 'route-gate-test-key',
};

const VALID_UUID = '00000000-0000-4000-8000-0000000000c1';

// Bare app: no auth middleware -> req.auth is undefined -> every handler 401s
// before touching the DB. audit:false keeps the audit path inert.
function appNoAuth(): express.Express {
  const app = express();
  app.use(express.json());
  app.use(assessmentsRouter({ pool: throwingPool, audit: false }));
  app.use(problemHandler());
  return app;
}

// Authed app: a synthetic AuthContext is injected so the auth check passes and
// the request reaches the Zod / UUID validation gates -- all still DB-free.
function appAuthed(): express.Express {
  const app = express();
  app.use(express.json());
  app.use((req, _res, nextFn) => {
    (req as AuthenticatedRequest).auth = FAKE_AUTH;
    nextFn();
  });
  app.use(assessmentsRouter({ pool: throwingPool, audit: false }));
  app.use(problemHandler());
  return app;
}

describe('POST /v1/assessments -- auth gate (no DB)', () => {
  const app = appNoAuth();

  it('missing API key -> 401 application/problem+json', async () => {
    const res = await request(app)
      .post('/assessments')
      .send({ title: 'T', question_ids: [VALID_UUID] });
    expect(res.status).toBe(401);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(401);
  });
});

describe('POST /v1/assessments -- body validation gate (authed, no DB)', () => {
  const app = appAuthed();

  it('malformed body (empty title, no selection) -> 400 before any query', async () => {
    const res = await request(app).post('/assessments').send({ title: '' });
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });

  it('both question_ids and blueprint_json -> 400 (Zod refine, no DB)', async () => {
    const res = await request(app)
      .post('/assessments')
      .send({
        title: 'Both modes',
        question_ids: [VALID_UUID],
        blueprint_json: [{ skill_id: VALID_UUID, count: 3 }],
      });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('neither question_ids nor blueprint_json -> 400 (Zod refine, no DB)', async () => {
    const res = await request(app).post('/assessments').send({ title: 'No selection' });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });
});

describe('GET /v1/assessments/:id -- auth + UUID gates (no DB)', () => {
  it('missing API key -> 401 (no DB)', async () => {
    const res = await request(appNoAuth()).get(`/assessments/${VALID_UUID}`);
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
  });

  it('authed + non-UUID id -> 400 before getAssessmentForTenant', async () => {
    const res = await request(appAuthed()).get('/assessments/not-a-uuid');
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });
});

describe('POST /v1/assessments/:id/invite -- auth + UUID + body gates (no DB)', () => {
  it('missing API key -> 401 (no DB)', async () => {
    const res = await request(appNoAuth())
      .post(`/assessments/${VALID_UUID}/invite`)
      .send({ candidate_email: 'c@example.com' });
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
  });

  it('authed + non-UUID id -> 400 before any query', async () => {
    const res = await request(appAuthed())
      .post('/assessments/not-a-uuid/invite')
      .send({ candidate_email: 'c@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('authed + valid UUID + malformed body (bad email) -> 400 before any query', async () => {
    const res = await request(appAuthed())
      .post(`/assessments/${VALID_UUID}/invite`)
      .send({ candidate_email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });
});
