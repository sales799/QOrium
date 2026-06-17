import { describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { Pool } from '@qorium/db';
import type { AuthContext, AuthenticatedRequest } from '@qorium/auth';
import { packsRouter } from '../src/routes/packs.js';
import { problemHandler } from '../src/middleware/problem.js';

/**
 * N17 test-storm -- route-level coverage for the API-key-facing
 * /v1/packs/* endpoints' DB-free gates. Every branch asserted here rejects a
 * request BEFORE any repository call, so Postgres is never touched:
 *
 *   POST /packs/generate
 *     1. missing auth (no API key)                 -> 401 (no DB)
 *     2. authed + malformed body (bad limit)       -> 400 (Zod, before createPack)
 *     3. authed + malformed filters (bad format)   -> 400 (Zod, before createPack)
 *     4. authed + malformed language (3 chars)     -> 400 (Zod, before createPack)
 *
 *   GET /packs/:id/export
 *     5. missing auth                              -> 401 (no DB)
 *     6. authed + non-UUID id                      -> 400 (before getPackByIdForTenant)
 *     7. authed + valid UUID + bad ?format=        -> 400 (Zod query, before any query)
 *
 * The stub Pool THROWS if queried, proving every gate above short-circuits
 * before Postgres. packsRouter surfaces problems via next(HttpProblem), so
 * problemHandler() is mounted. Auth is normally attached upstream by
 * apiKeyAuth(); here the router is mounted bare (Group A, no auth -> 401) or
 * behind a tiny middleware that injects a synthetic AuthContext (Group B, so
 * the validation gates downstream of the auth check are reachable while the DB
 * stays untouched). This is the first route-integration coverage of
 * src/routes/packs.ts (previously only the packs repository / exporters were
 * exercised), mirroring the assessments / a4 / proof route-gate pattern
 * (PRs #198..#203).
 *
 * NOTE: for GET /packs/:id/export the gate order is auth -> UUID -> Zod(query)
 * -> getPackByIdForTenant. A valid UUID with a valid/omitted format would reach
 * the DB, so case 7 deliberately sends a valid UUID but an invalid ?format= to
 * land on the Zod query gate while staying DB-free.
 */

// A pool that fails loudly if any handler reaches the DB on these gate paths.
const throwingPool = {
  query: async () => {
    throw new Error('DB must not be queried on the /v1/packs auth/validation gates');
  },
  connect: async () => {
    throw new Error('DB must not be connected on the /v1/packs auth/validation gates');
  },
} as unknown as Pool;

const FAKE_AUTH: AuthContext = {
  apiKeyId: '00000000-0000-4000-8000-0000000000a1',
  tenantId: '00000000-0000-4000-8000-0000000000b1',
  prefix: 'qor_test',
  scopes: ['packs:write'],
  name: 'route-gate-test-key',
};

const VALID_UUID = '00000000-0000-4000-8000-0000000000c1';

// Bare app: no auth middleware -> req.auth is undefined -> every handler 401s
// before touching the DB. audit:false keeps the audit path inert.
function appNoAuth(): express.Express {
  const app = express();
  app.use(express.json());
  app.use(packsRouter({ pool: throwingPool, audit: false }));
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
  app.use(packsRouter({ pool: throwingPool, audit: false }));
  app.use(problemHandler());
  return app;
}

describe('POST /v1/packs/generate -- auth gate (no DB)', () => {
  const app = appNoAuth();

  it('missing API key -> 401 application/problem+json', async () => {
    const res = await request(app)
      .post('/packs/generate')
      .send({ filters: { skill: 'aws' } });
    expect(res.status).toBe(401);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(401);
  });
});

describe('POST /v1/packs/generate -- body validation gate (authed, no DB)', () => {
  const app = appAuthed();

  it('limit out of range -> 400 before createPack', async () => {
    const res = await request(app).post('/packs/generate').send({ limit: 9999 });
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });

  it('invalid filter format enum -> 400 (Zod, no DB)', async () => {
    const res = await request(app)
      .post('/packs/generate')
      .send({ filters: { format: 'not-a-format' } });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('invalid language (3 chars) -> 400 (Zod, no DB)', async () => {
    const res = await request(app)
      .post('/packs/generate')
      .send({ filters: { language: 'eng' } });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });
});

describe('GET /v1/packs/:id/export -- auth + UUID + query gates (no DB)', () => {
  it('missing API key -> 401 (no DB)', async () => {
    const res = await request(appNoAuth()).get(`/packs/${VALID_UUID}/export`);
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
  });

  it('authed + non-UUID id -> 400 before getPackByIdForTenant', async () => {
    const res = await request(appAuthed()).get('/packs/not-a-uuid/export');
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });

  it('authed + valid UUID + invalid ?format= -> 400 (Zod query, before any query)', async () => {
    const res = await request(appAuthed()).get(`/packs/${VALID_UUID}/export?format=not-a-format`);
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });
});
