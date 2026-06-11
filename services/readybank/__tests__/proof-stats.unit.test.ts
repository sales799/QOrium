import { describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { Pool } from '@qorium/db';
import { proofRouter } from '../src/routes/proof.js';
import { getProofStats } from '../src/repositories/proof-stats.js';

/**
 * Tests the public Customer-Zero proof stats endpoint (N13). No Postgres — a
 * stub Pool returns a fixed aggregate row. Verifies the JSON shape, numeric
 * coercion, and (critically) that the literal "stats" path is served by the
 * stats handler and NOT captured by the /:code proof-code route.
 */

interface Captured {
  sql: string;
  params: unknown[];
}

function stubPool(row: Record<string, string | null> | undefined, captured: Captured[]): Pool {
  return {
    query: async (sql: string, params: unknown[] = []) => {
      captured.push({ sql, params });
      return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
    },
  } as unknown as Pool;
}

const STATS_ROW = {
  assessments_created: '12',
  candidates_invited: '34',
  assessments_taken: '20',
  attempts_graded: '7',
  questions_released: '986',
  questions_calibrated: '2',
};

function appWith(pool: Pool) {
  const app = express();
  // secret present so /:code is live too — proves /stats still wins for "stats".
  app.use(proofRouter({ pool, secret: 'x'.repeat(40) }));
  return app;
}

describe('getProofStats repository', () => {
  it('coerces counts to numbers and stamps generated_at', async () => {
    const captured: Captured[] = [];
    const stats = await getProofStats(stubPool(STATS_ROW, captured));
    expect(stats.assessments_created).toBe(12);
    expect(stats.candidates_invited).toBe(34);
    expect(stats.assessments_taken).toBe(20);
    expect(stats.attempts_graded).toBe(7);
    expect(stats.questions_released).toBe(986);
    expect(stats.questions_calibrated).toBe(2);
    expect(typeof stats.generated_at).toBe('string');
    expect(Number.isNaN(Date.parse(stats.generated_at))).toBe(false);
    // single round trip, calibrated uses the >= 30 IRT threshold
    expect(captured).toHaveLength(1);
    expect(captured[0]?.sql).toContain('calibration_n >= 30');
  });

  it('degrades to zeros when no row comes back', async () => {
    const stats = await getProofStats(stubPool(undefined, []));
    expect(stats.assessments_created).toBe(0);
    expect(stats.attempts_graded).toBe(0);
  });
});

describe('GET /v1/proof/stats route', () => {
  it('returns 200 with the funnel payload and a cache header', async () => {
    const res = await request(appWith(stubPool(STATS_ROW, []))).get('/v1/proof/stats');
    expect(res.status).toBe(200);
    expect(res.body.questions_released).toBe(986);
    expect(res.body.attempts_graded).toBe(7);
    expect(res.headers['cache-control']).toContain('max-age=300');
  });

  it('is not shadowed by the /:code proof route', async () => {
    // If "stats" were captured by /:code it would be treated as a forged code
    // and return 404. A 200 proves the stats handler is registered first.
    const res = await request(appWith(stubPool(STATS_ROW, []))).get('/v1/proof/stats');
    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty('verified');
    expect(res.body).toHaveProperty('generated_at');
  });
});
