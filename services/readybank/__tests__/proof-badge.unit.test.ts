import { describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { Pool } from '@qorium/db';
import { proofRouter } from '../src/routes/proof.js';
import { issueProofCode } from '../src/lib/proof-code.js';
import { renderProofBadgeSvg, truncate } from '../src/lib/proof-badge.js';

/**
 * N13 proof engine slice 3 — embeddable SVG Proof-of-Skill badge. Pure-renderer
 * tests need no DB; route tests use a stub Pool returning a fixed graded-attempt
 * row. Proves: valid code -> 200 image/svg+xml + edge cache; forged -> 404
 * no-store invalid badge; no secret -> 503; and that the badge never carries a
 * <script> or numeric score (only issuer + band + outcome).
 *
 * supertest does not populate res.text for image/svg+xml, so route bodies are
 * buffered to a string via an explicit parser.
 */

const SECRET = 'x'.repeat(40);
const ATTEMPT = '11111111-1111-4111-8111-111111111111';

// Buffer any (non-text) response body to a UTF-8 string under res.text.
function svgText(req: request.Test): request.Test {
  return req.buffer(true).parse((res, cb) => {
    let data = '';
    res.on('data', (chunk: Buffer | string) => {
      data += chunk.toString();
    });
    res.on('end', () => cb(null, data));
  });
}

// Row matching the columns getProofRecord SELECTs (raw shapes: numeric->string,
// graded_at->Date).
const RECORD_ROW = {
  attempt_id: ATTEMPT,
  issuer: 'Talpro India',
  assessment_title: 'Senior Java Engineer',
  total_score: '82',
  max_score: '100',
  pass_score: '0.6',
  graded_at: new Date('2026-06-11T10:00:00.000Z'),
};

function stubPool(row: Record<string, unknown> | undefined): Pool {
  return {
    query: async () => ({ rows: row ? [row] : [], rowCount: row ? 1 : 0 }),
  } as unknown as Pool;
}

function appWith(pool: Pool, secret: string | undefined) {
  const app = express();
  app.use(proofRouter({ pool, secret }));
  return app;
}

describe('renderProofBadgeSvg (pure)', () => {
  it('verified badge is a script-free SVG with band + outcome, no numeric score', () => {
    const svg = renderProofBadgeSvg({
      kind: 'verified',
      issuer: 'Talpro India',
      assessment: 'Senior Java Engineer',
      scoreBand: 'strong',
      passed: true,
    });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('VERIFIED PROOF OF SKILL');
    expect(svg).toContain('Senior Java Engineer');
    expect(svg).toContain('Talpro India');
    expect(svg).toContain('strong');
    expect(svg).toContain('Met the bar');
    expect(svg).toContain('QOrium');
    // never embed scripts; never disclose the numeric percentage
    expect(svg).not.toContain('<script');
    expect(svg).not.toContain('82');
    expect(svg).not.toContain('%');
  });

  it('shows "Below the bar" for a failed attempt and nothing for unknown outcome', () => {
    const failed = renderProofBadgeSvg({
      kind: 'verified',
      issuer: 'Acme',
      assessment: 'QA',
      scoreBand: 'developing',
      passed: false,
    });
    expect(failed).toContain('Below the bar');
    const unknown = renderProofBadgeSvg({
      kind: 'verified',
      issuer: 'Acme',
      assessment: 'QA',
      scoreBand: 'unscored',
      passed: null,
    });
    expect(unknown).not.toContain('Met the bar');
    expect(unknown).not.toContain('Below the bar');
  });

  it('escapes interpolated DB strings (no raw markup injection)', () => {
    const svg = renderProofBadgeSvg({
      kind: 'verified',
      issuer: '<script>x</script>',
      assessment: 'A & B "co"',
      scoreBand: 'strong',
      passed: true,
    });
    expect(svg).not.toContain('<script>x');
    expect(svg).toContain('&amp;');
    expect(svg).toContain('&quot;');
  });

  it('invalid and unconfigured badges carry no record fields', () => {
    const invalid = renderProofBadgeSvg({ kind: 'invalid' });
    expect(invalid).toContain('COULD NOT VERIFY');
    expect(invalid).not.toContain('Talpro India');
    const unconf = renderProofBadgeSvg({ kind: 'unconfigured' });
    expect(unconf).toContain('Not enabled here');
  });

  it('truncate clips long strings with an ellipsis and leaves short ones intact', () => {
    expect(truncate('short', 36)).toBe('short');
    const long = 'x'.repeat(50);
    const out = truncate(long, 36);
    expect(out.length).toBe(36);
    expect(out.endsWith('…')).toBe(true);
  });
});

describe('GET /v1/proof/:code/badge.svg (route)', () => {
  it('valid code -> 200 image/svg+xml, edge-cacheable, verified badge', async () => {
    const code = issueProofCode(ATTEMPT, SECRET);
    const res = await svgText(
      request(appWith(stubPool(RECORD_ROW), SECRET)).get(`/v1/proof/${code}/badge.svg`),
    );
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('image/svg+xml');
    expect(res.headers['cache-control']).toContain('max-age=300');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.text ?? res.body).toContain('VERIFIED PROOF OF SKILL');
    expect(res.text ?? res.body).toContain('Senior Java Engineer');
  });

  it('forged code -> 404 no-store invalid badge (leaks nothing)', async () => {
    const res = await svgText(
      request(appWith(stubPool(RECORD_ROW), SECRET)).get('/v1/proof/not-a-real-code/badge.svg'),
    );
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toContain('image/svg+xml');
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.text ?? res.body).toContain('COULD NOT VERIFY');
    expect(res.text ?? res.body).not.toContain('Senior Java Engineer');
  });

  it('valid code but ungraded/missing attempt -> 404 invalid badge', async () => {
    const code = issueProofCode(ATTEMPT, SECRET);
    const res = await svgText(
      request(appWith(stubPool(undefined), SECRET)).get(`/v1/proof/${code}/badge.svg`),
    );
    expect(res.status).toBe(404);
    expect(res.text ?? res.body).toContain('COULD NOT VERIFY');
  });

  it('no secret configured -> 503 unconfigured badge', async () => {
    const code = issueProofCode(ATTEMPT, SECRET);
    const res = await svgText(
      request(appWith(stubPool(RECORD_ROW), undefined)).get(`/v1/proof/${code}/badge.svg`),
    );
    expect(res.status).toBe(503);
    expect(res.headers['content-type']).toContain('image/svg+xml');
    expect(res.text ?? res.body).toContain('Not enabled here');
  });
});
