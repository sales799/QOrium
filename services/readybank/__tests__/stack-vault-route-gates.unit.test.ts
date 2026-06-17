import { describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { Pool } from '@qorium/db';
import type { AuthContext, AuthenticatedRequest } from '@qorium/auth';
import { stackVaultRouter } from '../src/routes/stack-vault.js';
import { problemHandler } from '../src/middleware/problem.js';

/**
 * N17 test-storm -- route-level coverage for the API-key-facing
 * /v1/stack-vault/* endpoints' DB-free gates. This is the first
 * route-integration coverage of src/routes/stack-vault.ts (previously only the
 * stack-vault repository and the watermark helpers were exercised), and it
 * completes route-level N17 coverage of every route file. It mirrors the
 * assessments / packs / a4 / proof route-gate pattern (PRs #198..#211).
 *
 * Every route is gated by requireActiveVault (middleware/tenant-isolation.ts),
 * which runs BEFORE the per-handler Zod/UUID gates. Its pre-DB branches:
 *   - no req.auth                          -> 401 (before any pool.query)
 *   - auth carries export:stack-vault scope -> 403 SO-10 (before any pool.query)
 * Only after those checks does the middleware issue the vault-lookup SELECT.
 *
 * Group A (bare, no auth -> 401) and the forbidden-scope app (403) both use a
 * THROWING Pool, proving the auth + SO-10 gates short-circuit before Postgres.
 *
 * Group B reaches the per-handler Zod/UUID gates. The middleware must first
 * resolve an active vault, so Group B uses a one-shot stub Pool that returns a
 * single active-vault row for the middleware SELECT and THROWS on any later
 * query -- proving the handler gate (bad UUID / bad Zod body) rejects with 400
 * before the repository touches the DB.
 *
 * Gate order recap (per route): apiKeyAuth (upstream) -> requireActiveVault
 * (auth 401 / SO-10 403 / vault-lookup) -> handler Zod-or-UUID -> repository.
 */

// A pool that fails loudly if any handler reaches the DB on these gate paths.
const throwingPool = {
  query: async () => {
    throw new Error('DB must not be queried on the /v1/stack-vault auth/SO-10 gates');
  },
  connect: async () => {
    throw new Error('DB must not be connected on the /v1/stack-vault auth/SO-10 gates');
  },
} as unknown as Pool;

// A pool that answers the middleware vault-lookup ONCE with an active vault,
// then throws on any subsequent query. This lets a request pass the vault
// middleware and land on the handler's Zod/UUID gate while still proving the
// repository (the second query) is never reached on a rejected request.
function oneShotActiveVaultPool(): Pool {
  let calls = 0;
  return {
    query: async () => {
      calls += 1;
      if (calls === 1) {
        return {
          rows: [
            {
              tenant_id: '00000000-0000-4000-8000-0000000000b1',
              tier: 'gold',
              annual_floor_paise: '100000000',
              contract_expires_at: new Date('2999-01-01T00:00:00Z'),
              status: 'active',
              watermark_pepper_enc: 'dev-pepper-plaintext',
            },
          ],
        };
      }
      throw new Error('repository query reached -- handler gate failed to reject before DB');
    },
    connect: async () => {
      throw new Error('DB must not be connected on the /v1/stack-vault validation gates');
    },
  } as unknown as Pool;
}

const FAKE_AUTH: AuthContext = {
  apiKeyId: '00000000-0000-4000-8000-0000000000a1',
  tenantId: '00000000-0000-4000-8000-0000000000b1',
  prefix: 'qor_test',
  scopes: ['stack-vault:read', 'stack-vault:write'],
  name: 'route-gate-test-key',
};

// Auth that carries the SO-10-forbidden export scope.
const EXPORT_SCOPE_AUTH: AuthContext = {
  ...FAKE_AUTH,
  scopes: ['stack-vault:read', 'export:stack-vault'],
};

const VALID_UUID = '00000000-0000-4000-8000-0000000000c1';

// Bare app: no auth middleware -> req.auth is undefined -> the vault middleware
// 401s before touching the DB.
function appNoAuth(): express.Express {
  const app = express();
  app.use(express.json());
  app.use(stackVaultRouter({ pool: throwingPool }));
  app.use(problemHandler());
  return app;
}

// App whose injected auth carries the forbidden export:stack-vault scope ->
// middleware 403s (SO-10) before the DB.
function appForbiddenScope(): express.Express {
  const app = express();
  app.use(express.json());
  app.use((req, _res, nextFn) => {
    (req as AuthenticatedRequest).auth = EXPORT_SCOPE_AUTH;
    nextFn();
  });
  app.use(stackVaultRouter({ pool: throwingPool }));
  app.use(problemHandler());
  return app;
}

// Authed app reaching the per-handler validation gates: synthetic AuthContext
// passes the auth + SO-10 checks; the one-shot pool resolves the vault so the
// request lands on the handler's Zod/UUID gate, still DB-free for the repo.
function appAuthed(): express.Express {
  const app = express();
  app.use(express.json());
  app.use((req, _res, nextFn) => {
    (req as AuthenticatedRequest).auth = FAKE_AUTH;
    nextFn();
  });
  app.use(stackVaultRouter({ pool: oneShotActiveVaultPool() }));
  app.use(problemHandler());
  return app;
}

describe('GET /v1/stack-vault/questions -- auth gate (no DB)', () => {
  it('missing API key -> 401 application/problem+json', async () => {
    const res = await request(appNoAuth()).get('/stack-vault/questions');
    expect(res.status).toBe(401);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(401);
  });

  it('export:stack-vault scope -> 403 SO-10 (no DB)', async () => {
    const res = await request(appForbiddenScope()).get('/stack-vault/questions');
    expect(res.status).toBe(403);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(403);
  });

  it('authed + invalid limit (0) -> 400 (Zod, before repository)', async () => {
    const res = await request(appAuthed()).get('/stack-vault/questions?limit=0');
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });

  it('authed + non-numeric offset -> 400 (Zod, before repository)', async () => {
    const res = await request(appAuthed()).get('/stack-vault/questions?offset=abc');
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });
});

describe('GET /v1/stack-vault/questions/:uuid -- auth + UUID gates (no DB)', () => {
  it('missing API key -> 401 (no DB)', async () => {
    const res = await request(appNoAuth()).get(`/stack-vault/questions/${VALID_UUID}`);
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
  });

  it('export:stack-vault scope -> 403 SO-10 (no DB)', async () => {
    const res = await request(appForbiddenScope()).get(`/stack-vault/questions/${VALID_UUID}`);
    expect(res.status).toBe(403);
    expect(res.body.status).toBe(403);
  });

  it('authed + non-UUID id -> 400 (before getVaultQuestionByUuid)', async () => {
    const res = await request(appAuthed()).get('/stack-vault/questions/not-a-uuid');
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });
});

describe('POST /v1/stack-vault/questions -- auth + body gates (no DB)', () => {
  it('missing API key -> 401 (no DB)', async () => {
    const res = await request(appNoAuth()).post('/stack-vault/questions').send({ qor_id: 'QOR-1' });
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
  });

  it('export:stack-vault scope -> 403 SO-10 (no DB)', async () => {
    const res = await request(appForbiddenScope())
      .post('/stack-vault/questions')
      .send({ qor_id: 'QOR-1' });
    expect(res.status).toBe(403);
    expect(res.body.status).toBe(403);
  });

  it('authed + empty body -> 400 (Zod, before insertVaultQuestion)', async () => {
    const res = await request(appAuthed()).post('/stack-vault/questions').send({});
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });

  it('authed + invalid format enum -> 400 (Zod, before insertVaultQuestion)', async () => {
    const res = await request(appAuthed()).post('/stack-vault/questions').send({
      qor_id: 'QOR-1',
      format: 'not-a-format',
      language: 'en',
      body_md: 'x',
      body_json: {},
      watermark_seed: 'seed-1234',
    });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('authed + bad language (3 chars) -> 400 (Zod, before insertVaultQuestion)', async () => {
    const res = await request(appAuthed()).post('/stack-vault/questions').send({
      qor_id: 'QOR-1',
      format: 'mcq',
      language: 'eng',
      body_md: 'x',
      body_json: {},
      watermark_seed: 'seed-1234',
    });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('authed + short watermark_seed (<8) -> 400 (Zod, before insertVaultQuestion)', async () => {
    const res = await request(appAuthed()).post('/stack-vault/questions').send({
      qor_id: 'QOR-1',
      format: 'mcq',
      language: 'en',
      body_md: 'x',
      body_json: {},
      watermark_seed: 'short',
    });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });
});
