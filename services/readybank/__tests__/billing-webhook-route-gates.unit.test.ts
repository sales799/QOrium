import { createHmac } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { Pool } from '@qorium/db';
import { billingWebhookRouter } from '../src/routes/billing.js';
import { problemHandler } from '../src/middleware/problem.js';

/**
 * N17 test-storm — route-level coverage for the PUBLIC billing webhook
 * endpoints' DB-free gates. routes/billing.ts verifies the provider webhook
 * signature (and parses the body) BEFORE any repository call, so two branches
 * must reject before Postgres is ever touched:
 *
 *   1. Missing / forged signature  -> 401 application/problem+json.
 *   2. Valid signature + malformed JSON body -> 400 application/problem+json.
 *
 * Both webhook verifiers (verifyWebhookSignature / verifyCfWebhookSignature)
 * also return false whenever their secret env var is unset, so the unconfigured
 * server rejects every inbound webhook at the door — covered here too.
 *
 * The stub Pool THROWS if queried, proving these gates never reach the DB.
 * Handlers surface problems via next(HttpProblem), so problemHandler() is
 * mounted. The router installs its own raw all-content-types body parser, so it
 * is mounted standalone exactly as in production (before the global json()).
 *
 * Lib-level HMAC correctness for both providers is already covered by
 * razorpay.unit.test.ts / cashfree.unit.test.ts / payment-provider*.unit.test.ts;
 * this file is strictly about the route wiring + reject-before-DB contract.
 */

const SAVED = { ...process.env };

// A pool that fails loudly if any handler reaches the DB on a gate path.
const throwingPool = {
  query: async () => {
    throw new Error('DB must not be queried before the webhook signature/body gates pass');
  },
} as unknown as Pool;

function app(): express.Express {
  const a = express();
  a.use('/v1/billing', billingWebhookRouter({ pool: throwingPool, config: {} as never }));
  a.use(problemHandler());
  return a;
}

beforeEach(() => {
  // Default to UNCONFIGURED: no provider webhook secrets set.
  delete process.env.RAZORPAY_WEBHOOK_SECRET;
  delete process.env.CASHFREE_PG_SECRET_KEY;
});

afterEach(() => {
  process.env = { ...SAVED };
});

describe('POST /v1/billing/webhook (Razorpay) — signature gate', () => {
  const BODY = '{"event":"subscription.charged"}';

  it('rejects a missing x-razorpay-signature with 401 problem+json (no DB hit)', async () => {
    const res = await request(app()).post('/v1/billing/webhook').type('json').send(BODY);
    expect(res.status).toBe(401);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(401);
  });

  it('rejects a forged signature with 401 even when a secret IS configured (no DB hit)', async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = 'whsec_rzp';
    const res = await request(app())
      .post('/v1/billing/webhook')
      .set('x-razorpay-signature', 'deadbeef')
      .type('json')
      .send(BODY);
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
  });

  it('rejects every inbound webhook with 401 while the server is unconfigured (no secret)', async () => {
    // A signature computed under SOME key still fails because the server has no
    // RAZORPAY_WEBHOOK_SECRET to verify against -> verify() short-circuits false.
    const sig = createHmac('sha256', 'attacker_key').update(BODY).digest('hex');
    const res = await request(app())
      .post('/v1/billing/webhook')
      .set('x-razorpay-signature', sig)
      .type('json')
      .send(BODY);
    expect(res.status).toBe(401);
  });

  it('passes the signature gate then 400s on a malformed JSON body (no DB hit)', async () => {
    const SECRET = 'whsec_rzp';
    process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;
    const RAW = 'not-json{';
    const sig = createHmac('sha256', SECRET).update(RAW).digest('hex');
    const res = await request(app())
      .post('/v1/billing/webhook')
      .set('x-razorpay-signature', sig)
      .set('content-type', 'application/json')
      .send(RAW);
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });
});

describe('POST /v1/billing/webhook/cashfree — signature gate', () => {
  const BODY = '{"type":"SUBSCRIPTION_STATUS_CHANGE"}';
  const TS = '1718000000000';

  it('rejects when both signature + timestamp headers are absent (401, no DB hit)', async () => {
    const res = await request(app()).post('/v1/billing/webhook/cashfree').type('json').send(BODY);
    expect(res.status).toBe(401);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(401);
  });

  it('rejects when the timestamp header is missing even with a signature (401)', async () => {
    process.env.CASHFREE_PG_SECRET_KEY = 'cf_secret';
    const sig = createHmac('sha256', 'cf_secret')
      .update(TS + BODY)
      .digest('base64');
    const res = await request(app())
      .post('/v1/billing/webhook/cashfree')
      .set('x-webhook-signature', sig)
      .type('json')
      .send(BODY);
    expect(res.status).toBe(401);
  });

  it('rejects a forged signature+timestamp pair with 401 (no DB hit)', async () => {
    process.env.CASHFREE_PG_SECRET_KEY = 'cf_secret';
    const res = await request(app())
      .post('/v1/billing/webhook/cashfree')
      .set('x-webhook-signature', 'not-the-real-mac')
      .set('x-webhook-timestamp', TS)
      .type('json')
      .send(BODY);
    expect(res.status).toBe(401);
  });

  it('rejects every inbound webhook with 401 while the server is unconfigured (no secret)', async () => {
    const sig = createHmac('sha256', 'attacker_key')
      .update(TS + BODY)
      .digest('base64');
    const res = await request(app())
      .post('/v1/billing/webhook/cashfree')
      .set('x-webhook-signature', sig)
      .set('x-webhook-timestamp', TS)
      .type('json')
      .send(BODY);
    expect(res.status).toBe(401);
  });

  it('passes the signature gate then 400s on a malformed JSON body (no DB hit)', async () => {
    const SECRET = 'cf_secret';
    process.env.CASHFREE_PG_SECRET_KEY = SECRET;
    const RAW = 'not-json{';
    const sig = createHmac('sha256', SECRET)
      .update(TS + RAW)
      .digest('base64');
    const res = await request(app())
      .post('/v1/billing/webhook/cashfree')
      .set('x-webhook-signature', sig)
      .set('x-webhook-timestamp', TS)
      .set('content-type', 'application/json')
      .send(RAW);
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.status).toBe(400);
  });
});
