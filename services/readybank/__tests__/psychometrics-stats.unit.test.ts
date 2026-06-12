import { describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { Pool } from '@qorium/db';
import { proofRouter } from '../src/routes/proof.js';
import { getPsychometricsCoverage } from '../src/repositories/psychometrics-stats.js';

/**
 * Tests the public psychometrics-coverage endpoint (N19). No Postgres — a stub
 * Pool returns a fixed aggregate row. Verifies the JSON shape, derived
 * percentages, the released/readybank SQL scoping, and (critically) that the
 * literal "psychometrics" path is served by its handler and NOT captured by the
 * /:code proof-code route.
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

const COVERAGE_ROW = {
  questions_released: '1000',
  with_irt_params: '1000',
  with_empirical_data: '250',
  refit_ready: '40',
};

function appWith(pool: Pool) {
  const app = express();
  // secret present so /:code is live too — proves the literal path still wins.
  app.use(proofRouter({ pool, secret: 'x'.repeat(40) }));
  return app;
}

describe('getPsychometricsCoverage repository', () => {
  it('coerces counts, derives percentages, and stamps generated_at', async () => {
    const captured: Captured[] = [];
    const cov = await getPsychometricsCoverage(stubPool(COVERAGE_ROW, captured));
    expect(cov.questions_released).toBe(1000);
    expect(cov.with_irt_params).toBe(1000);
    expect(cov.with_empirical_data).toBe(250);
    expect(cov.refit_ready).toBe(40);
    expect(cov.irt_params_pct).toBe(100);
    expect(cov.empirical_pct).toBe(25);
    expect(cov.refit_ready_pct).toBe(4);
    expect(Number.isNaN(Date.parse(cov.generated_at))).toBe(false);
    // single round trip, scoped to the live released/readybank bank
    expect(captured).toHaveLength(1);
    expect(captured[0]?.sql).toContain("status = 'released'");
    expect(captured[0]?.sql).toContain("sku = 'readybank'");
  });

  it('degrades to zeros when no row comes back', async () => {
    const cov = await getPsychometricsCoverage(stubPool(undefined, []));
    expect(cov.questions_released).toBe(0);
    expect(cov.irt_params_pct).toBe(0);
    expect(cov.refit_ready_pct).toBe(0);
  });
});

describe('GET /v1/proof/psychometrics route', () => {
  it('returns 200 with the coverage payload and a cache header', async () => {
    const res = await request(appWith(stubPool(COVERAGE_ROW, []))).get('/v1/proof/psychometrics');
    expect(res.status).toBe(200);
    expect(res.body.questions_released).toBe(1000);
    expect(res.body.irt_params_pct).toBe(100);
    expect(res.body.refit_ready_pct).toBe(4);
    expect(res.headers['cache-control']).toContain('max-age=300');
  });

  it('is not shadowed by the /:code proof route', async () => {
    const res = await request(appWith(stubPool(COVERAGE_ROW, []))).get('/v1/proof/psychometrics');
    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty('verified');
    expect(res.body).toHaveProperty('generated_at');
  });
});
