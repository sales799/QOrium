import { describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { Pool } from '@qorium/db';
import { referencePanelRouter } from '../src/routes/reference-panel.js';
import { notFound, problemHandler } from '../src/middleware/problem.js';
import type { Config } from '../src/config.js';

/**
 * N17 test-storm -- route-level coverage for the Reference Panel ingestion
 * endpoint's DB-free gates. The single endpoint
 *
 *   POST /v1/reference-panel/responses
 *
 * is gated by panelTokenAuth() (bearer token in app.reference_panel_tokens),
 * then a Zod body gate. panelTokenAuth() only reaches Postgres AFTER it has
 * extracted a well-formed `Authorization: Bearer <token>` header -- a missing
 * or malformed header is rejected with 401 reference-panel/missing-token
 * before any pool.query. Those are the DB-free branches asserted here:
 *
 *   1. no Authorization header                 -> 401 (no DB)
 *   2. Authorization without Bearer scheme     -> 401 (no DB)
 *   3. Bearer with empty token                 -> 401 (no DB)
 *   4. Bearer with out-of-charset token        -> 401 (no DB)
 *
 * Plus the structural no-op branch: when config.apiKeyPepper is absent,
 * referencePanelRouter() returns an empty Router, so the surface is uniformly
 * absent (404) and the Pool is never touched:
 *
 *   5. no pepper -> route unmounted             -> 404 (no DB)
 *
 * The stub Pool THROWS on query/connect, proving every branch above
 * short-circuits before Postgres. The valid-token / Zod-body / insert paths
 * all require a real token lookup against app.reference_panel_tokens, so they
 * are intentionally out of scope for this DB-free suite -- this is the first
 * route-integration coverage of src/routes/reference-panel.ts, mirroring the
 * proof / packs / a4 route-gate pattern (PRs #198..#210).
 */

// A pool that fails loudly if any handler reaches the DB on these gate paths.
const throwingPool = {
  query: async () => {
    throw new Error('DB must not be queried on the /v1/reference-panel auth gate');
  },
  connect: async () => {
    throw new Error('DB must not be connected on the /v1/reference-panel auth gate');
  },
} as unknown as Pool;

// Minimal config: referencePanelRouter / panelTokenAuth only read apiKeyPepper.
// Pepper must be >= 32 chars to satisfy hashPanelToken(), though the missing /
// malformed bearer branches reject before any hashing occurs.
const PEPPER = 'x'.repeat(48);

function configWith(pepper: string | undefined): Config {
  return { apiKeyPepper: pepper } as unknown as Config;
}

// App with a real pepper -> the route is mounted, so requests reach
// panelTokenAuth's header check (401 on missing/malformed bearer, DB-free).
function appMounted(): express.Express {
  const app = express();
  app.use(express.json());
  app.use(referencePanelRouter({ pool: throwingPool, config: configWith(PEPPER) }));
  app.use(notFound);
  app.use(problemHandler());
  return app;
}

// App with no pepper -> referencePanelRouter returns an empty Router, so the
// path is unmatched and falls through to notFound (404), never touching the DB.
function appNoPepper(): express.Express {
  const app = express();
  app.use(express.json());
  app.use(referencePanelRouter({ pool: throwingPool, config: configWith(undefined) }));
  app.use(notFound);
  app.use(problemHandler());
  return app;
}

describe('POST /v1/reference-panel/responses -- bearer-token auth gate (no DB)', () => {
  const app = appMounted();

  it('missing Authorization header -> 401 application/problem+json', async () => {
    const res = await request(app)
      .post('/v1/reference-panel/responses')
      .send({ question_id: '00000000-0000-4000-8000-0000000000d1' });
    expect(res.status).toBe(401);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(401);
  });

  it('Authorization without Bearer scheme -> 401 (no DB)', async () => {
    const res = await request(app)
      .post('/v1/reference-panel/responses')
      .set('Authorization', 'Basic dXNlcjpwYXNz')
      .send({ question_id: '00000000-0000-4000-8000-0000000000d1' });
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
  });

  it('Bearer with empty token -> 401 (no DB)', async () => {
    const res = await request(app)
      .post('/v1/reference-panel/responses')
      .set('Authorization', 'Bearer ')
      .send({ question_id: '00000000-0000-4000-8000-0000000000d1' });
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
  });

  it('Bearer with out-of-charset token -> 401 (no DB)', async () => {
    const res = await request(app)
      .post('/v1/reference-panel/responses')
      .set('Authorization', 'Bearer has spaces and !@# chars')
      .send({ question_id: '00000000-0000-4000-8000-0000000000d1' });
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
  });
});

describe('POST /v1/reference-panel/responses -- unmounted when pepper absent (no DB)', () => {
  it('no pepper -> route is a no-op -> 404 (no DB)', async () => {
    const res = await request(appNoPepper())
      .post('/v1/reference-panel/responses')
      .set('Authorization', `Bearer ${'a'.repeat(40)}`)
      .send({ question_id: '00000000-0000-4000-8000-0000000000d1' });
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toContain('application/problem+json');
  });
});
