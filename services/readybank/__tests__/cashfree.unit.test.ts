import { createHmac } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cashfreeConfigured, verifyCfWebhookSignature } from '../src/lib/cashfree.js';

const SAVED = { ...process.env };

// Cashfree signs webhooks as base64( HMAC-SHA256( timestamp + rawBody, secret ) ),
// delivered in x-webhook-signature with the timestamp in x-webhook-timestamp.
function sign(secret: string, timestamp: string, body: string): string {
  return createHmac('sha256', secret)
    .update(timestamp + body)
    .digest('base64');
}

beforeEach(() => {
  delete process.env.CASHFREE_PG_APP_ID;
  delete process.env.CASHFREE_PG_SECRET_KEY;
  delete process.env.CASHFREE_PG_ENV;
});

afterEach(() => {
  process.env = { ...SAVED };
});

describe('cashfreeConfigured', () => {
  it('is false when neither credential is set', () => {
    expect(cashfreeConfigured()).toBe(false);
  });

  it('is false when only the app id is set', () => {
    process.env.CASHFREE_PG_APP_ID = 'cf_app_abc';
    expect(cashfreeConfigured()).toBe(false);
  });

  it('is false when only the secret key is set', () => {
    process.env.CASHFREE_PG_SECRET_KEY = 'cf_secret';
    expect(cashfreeConfigured()).toBe(false);
  });

  it('is true only when both app id and secret are present', () => {
    process.env.CASHFREE_PG_APP_ID = 'cf_app_abc';
    process.env.CASHFREE_PG_SECRET_KEY = 'cf_secret';
    expect(cashfreeConfigured()).toBe(true);
  });
});

describe('verifyCfWebhookSignature', () => {
  const SECRET = 'cf_secret_unit_test';
  const TS = '2026-06-13T00:00:00.000Z';
  const BODY = '{"type":"SUBSCRIPTION_STATUS_CHANGE","data":{"id":"sub_123"}}';

  it('returns false when the secret key is not configured', () => {
    expect(verifyCfWebhookSignature(BODY, sign(SECRET, TS, BODY), TS)).toBe(false);
  });

  it('accepts a correct base64 HMAC-SHA256 over timestamp + raw body', () => {
    process.env.CASHFREE_PG_SECRET_KEY = SECRET;
    expect(verifyCfWebhookSignature(BODY, sign(SECRET, TS, BODY), TS)).toBe(true);
  });

  it('rejects a signature computed with the wrong secret', () => {
    process.env.CASHFREE_PG_SECRET_KEY = SECRET;
    expect(verifyCfWebhookSignature(BODY, sign('wrong_secret', TS, BODY), TS)).toBe(false);
  });

  it('rejects a valid signature once the body is tampered with', () => {
    process.env.CASHFREE_PG_SECRET_KEY = SECRET;
    const sig = sign(SECRET, TS, BODY);
    expect(verifyCfWebhookSignature(BODY + ' ', sig, TS)).toBe(false);
  });

  it('rejects a valid signature when the timestamp is altered', () => {
    process.env.CASHFREE_PG_SECRET_KEY = SECRET;
    const sig = sign(SECRET, TS, BODY);
    expect(verifyCfWebhookSignature(BODY, sig, '2026-06-13T00:00:01.000Z')).toBe(false);
  });

  it('returns false for a missing signature header', () => {
    process.env.CASHFREE_PG_SECRET_KEY = SECRET;
    expect(verifyCfWebhookSignature(BODY, undefined, TS)).toBe(false);
  });

  it('returns false for a missing timestamp header', () => {
    process.env.CASHFREE_PG_SECRET_KEY = SECRET;
    expect(verifyCfWebhookSignature(BODY, sign(SECRET, TS, BODY), undefined)).toBe(false);
  });

  it('returns false for an empty signature string', () => {
    process.env.CASHFREE_PG_SECRET_KEY = SECRET;
    expect(verifyCfWebhookSignature(BODY, '', TS)).toBe(false);
  });

  it('rejects a length-mismatched signature without throwing', () => {
    process.env.CASHFREE_PG_SECRET_KEY = SECRET;
    expect(verifyCfWebhookSignature(BODY, 'AAAA', TS)).toBe(false);
  });

  it('rejects a same-length but incorrect signature', () => {
    process.env.CASHFREE_PG_SECRET_KEY = SECRET;
    const good = sign(SECRET, TS, BODY);
    const bad = 'A'.repeat(good.length);
    expect(verifyCfWebhookSignature(BODY, bad, TS)).toBe(good === bad);
  });
});
