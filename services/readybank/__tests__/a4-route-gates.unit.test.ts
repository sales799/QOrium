import { describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { Pool } from '@qorium/db';
import { a4Router } from '../src/routes/a4.js';
import { signA4Token } from '../src/lib/a4-token.js';
import { problemHandler } from '../src/middleware/problem.js';

/**
 * N17 test-storm — route-level coverage for the candidate-facing /a4/*
 * assessment endpoints' DB-free gates. These branches reject a request
 * BEFORE any question load or response persist, so the database is never
 * touched:
 *
 *   GET  /a4/question
 *     1. missing / invalid token            -> 401 (no DB)
 *     2. valid token + non-IN cf-ipcountry  -> 451 (no DB)
 *
 *   POST /a4/grade
 *     3. malformed JSON body (Zod)          -> 400 (before token, no DB)
 *     4. valid body + invalid token         -> 401 (no DB)
 *     5. valid body + valid token + non-IN  -> 451 (no DB)
 *
 * The stub Pool THROWS if queried, proving every gate above short-circuits
 * before Postgres. a4Router surfaces problems via next(HttpProblem), so
 * problemHandler() is mounted. This is the first route-integration coverage
 * of src/routes/a4.ts (previously only the a4-token + a4-grader libs were
 * unit-tested), mirroring the proof-route-gates pattern (PR #198).
 */

const SECRET = 'x'.repeat(40);

// A pool that fails loudly if any handler reaches the DB on these gate paths.
const throwingPool = {
  query: async () => {
    throw new Error('DB must not be queried on the /a4 auth/region gates');
  },
} as unknown as Pool;

function appWith(secret: string): express.Express {
  const app = express();
  app.use(express.json());
  app.use(a4Router({ pool: throwingPool, tokenSecret: secret }));
  app.use(problemHandler());
  return app;
}

// A structurally valid, correctly-signed, India-resident token. Used to drive
// requests PAST the token gate and INTO the region gate, all still DB-free.
function validToken(): string {
  return signA4Token(
    {
      jti: '00000000-0000-4000-8000-000000000001',
      question_id: '00000000-0000-4000-8000-0000000000a4',
      candidate_id: 'candidate@example.com',
      tenant_id: '00000000-0000-4000-8000-0000000000b1',
      country: 'IN',
    },
    { secret: SECRET },
  );
}

describe('GET /a4/question — token gate (no DB)', () => {
  const app = appWith(SECRET);

  it('missing token -> 401 application/problem+json', async () => {
    const res = await request(app).get('/a4/question');
    expect(res.status).toBe(401);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(401);
  });

  it('forged token -> 401 (rejected before any question load)', async () => {
    const res = await request(app).get('/a4/question').query({ token: 'totally.bogus' });
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
  });
});

describe('GET /a4/question — region gate (valid token, non-IN, no DB)', () => {
  const app = appWith(SECRET);

  it('valid token + cf-ipcountry US -> 451', async () => {
    const res = await request(app)
      .get('/a4/question')
      .query({ token: validToken() })
      .set('cf-ipcountry', 'US');
    expect(res.status).toBe(451);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(451);
  });

  it('valid token + x-a4-country-override GB -> 451', async () => {
    const res = await request(app)
      .get('/a4/question')
      .query({ token: validToken() })
      .set('x-a4-country-override', 'gb');
    expect(res.status).toBe(451);
    expect(res.body.status).toBe(451);
  });
});

describe('POST /a4/grade — body + token + region gates (no DB)', () => {
  const app = appWith(SECRET);

  it('malformed body -> 400 (validated before the token is even read)', async () => {
    const res = await request(app).post('/a4/grade').send({ token: validToken() }); // missing required response_body
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });

  it('well-formed body + forged token -> 401', async () => {
    const res = await request(app)
      .post('/a4/grade')
      .send({ token: 'totally.bogus', response_body: { answer_index: 1 } });
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
  });

  it('well-formed body + valid token + non-IN country -> 451', async () => {
    const res = await request(app)
      .post('/a4/grade')
      .set('cf-ipcountry', 'SG')
      .send({ token: validToken(), response_body: { answer_index: 0 } });
    expect(res.status).toBe(451);
    expect(res.body.status).toBe(451);
  });
});
