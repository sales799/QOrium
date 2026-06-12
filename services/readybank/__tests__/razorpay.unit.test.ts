import { createHmac } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { razorpayConfigured, verifyWebhookSignature } from '../src/lib/razorpay.js';

const SAVED = { ...process.env };

function sign(secret: string, body: string): string {
  return createHmac('sha256', secret).update(body).digest('hex');
}

beforeEach(() => {
  delete process.env.RAZORPAY_KEY_ID;
  delete process.env.RAZORPAY_KEY_SECRET;
  delete process.env.RAZORPAY_WEBHOOK_SECRET;
});

afterEach(() => {
  process.env = { ...SAVED };
});

describe('razorpayConfigured', () => {
  it('is false when neither key is set', () => {
    expect(razorpayConfigured()).toBe(false);
  });

  it('is false when only the key id is set', () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_abc';
    expect(razorpayConfigured()).toBe(false);
  });

  it('is false when only the secret is set', () => {
    process.env.RAZORPAY_KEY_SECRET = 'shh';
    expect(razorpayConfigured()).toBe(false);
  });

  it('is true only when both id and secret are present', () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_abc';
    process.env.RAZORPAY_KEY_SECRET = 'shh';
    expect(razorpayConfigured()).toBe(true);
  });
});

describe('verifyWebhookSignature', () => {
  const SECRET = 'whsec_unit_test';
  const BODY = '{"event":"subscription.charged","id":"evt_123"}';

  it('returns false when the webhook secret is not configured', () => {
    expect(verifyWebhookSignature(BODY, sign(SECRET, BODY))).toBe(false);
  });

  it('accepts a correct HMAC-SHA256 signature over the raw body', () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;
    expect(verifyWebhookSignature(BODY, sign(SECRET, BODY))).toBe(true);
  });

  it('rejects a signature computed with the wrong secret', () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;
    expect(verifyWebhookSignature(BODY, sign('wrong_secret', BODY))).toBe(false);
  });

  it('rejects a valid signature once the body is tampered with', () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;
    const sig = sign(SECRET, BODY);
    expect(verifyWebhookSignature(BODY + ' ', sig)).toBe(false);
  });

  it('returns false for a missing signature header', () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;
    expect(verifyWebhookSignature(BODY, undefined)).toBe(false);
  });

  it('returns false for an empty signature string', () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;
    expect(verifyWebhookSignature(BODY, '')).toBe(false);
  });

  it('rejects a length-mismatched signature without throwing', () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;
    expect(verifyWebhookSignature(BODY, 'deadbeef')).toBe(false);
  });

  it('rejects a same-length but non-hex/incorrect signature', () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;
    const good = sign(SECRET, BODY);
    const bad = 'z'.repeat(good.length);
    expect(verifyWebhookSignature(BODY, bad)).toBe(false);
  });
});
