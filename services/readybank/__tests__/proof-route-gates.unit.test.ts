import { describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { Pool } from '@qorium/db';
import { proofRouter } from '../src/routes/proof.js';
import { problemHandler } from '../src/middleware/problem.js';

/**
 * N17 test-storm — route-level coverage for the public Proof-of-Skill
 * verification endpoints' DB-free gates. Two branches matter and were
 * previously only exercised indirectly via lib unit tests:
 *
 *   1. Engine unconfigured (no secret) -> 503 on every proof route.
 *   2. Forged / malformed proof code -> 404 (verifyProofCode rejects BEFORE
 *      any DB hit, so the endpoint never confirms an attempt exists).
 *
 * The stub Pool THROWS if queried, proving these branches never touch
 * Postgres. The /:code JSON route surfaces problems via next(HttpProblem),
 * so problemHandler() is mounted; /view and /badge.svg send directly.
 */

const SECRET = 'x'.repeat(40);

// A pool that fails loudly if any handler reaches the DB on these gate paths.
const throwingPool = {
  query: async () => {
    throw new Error('DB must not be queried on unconfigured/forged-code gates');
  },
} as unknown as Pool;

function appWith(secret: string | undefined): express.Express {
  const app = express();
  app.use(proofRouter({ pool: throwingPool, secret }));
  app.use(problemHandler());
  return app;
}

describe('proof routes — unconfigured (no secret) returns 503', () => {
  const app = appWith(undefined);

  it('GET /v1/proof/:code -> 503 application/problem+json', async () => {
    const res = await request(app).get('/v1/proof/anycode');
    expect(res.status).toBe(503);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(503);
  });

  it('GET /v1/proof/:code/view -> 503 HTML card, no-store', async () => {
    const res = await request(app).get('/v1/proof/anycode/view');
    expect(res.status).toBe(503);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.text).not.toContain('<script');
  });

  it('GET /v1/proof/:code/badge.svg -> 503 SVG, no-store', async () => {
    const res = await request(app).get('/v1/proof/anycode/badge.svg');
    expect(res.status).toBe(503);
    expect(res.headers['content-type']).toContain('image/svg+xml');
    expect(res.headers['cache-control']).toBe('no-store');
  });
});

describe('proof routes — forged/malformed code returns 404 (no DB hit)', () => {
  const app = appWith(SECRET);

  // Codes that fail verifyProofCode for distinct structural reasons.
  const forged = [
    'totally-bogus', // no dot separator
    'abc.', // empty mac
    '.abc', // empty body
    `${'a'.repeat(600)}.x`, // over the 512-char length guard
    'eyJhIjoxfQ.deadbeef', // well-formed shape, bad signature
  ];

  for (const code of forged) {
    it(`GET /v1/proof/${code.slice(0, 16)} -> 404 problem`, async () => {
      const res = await request(app).get(`/v1/proof/${encodeURIComponent(code)}`);
      expect(res.status).toBe(404);
      expect(res.headers['content-type']).toContain('application/problem+json');
      expect(res.body.status).toBe(404);
    });
  }

  it('GET /v1/proof/:code/view forged -> 404 HTML invalid card with locked CSP', async () => {
    const res = await request(app).get('/v1/proof/totally-bogus/view');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.headers['content-security-policy']).toContain("default-src 'none'");
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.text).not.toContain('<script');
  });

  it('GET /v1/proof/:code/badge.svg forged -> 404 SVG', async () => {
    const res = await request(app).get('/v1/proof/totally-bogus/badge.svg');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toContain('image/svg+xml');
  });
});
