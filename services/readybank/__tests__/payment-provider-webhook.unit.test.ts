import { createHmac } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getProvider } from '../src/lib/payment-provider.js';

// N17 test-storm: cover the provider-level verifyWebhook() header-mapping seam.
// This is the path routes/billing.ts actually calls (provider.verifyWebhook with
// the raw express headers), distinct from the raw verify* functions already
// covered in payment-provider.unit.test.ts.

const SAVED = { ...process.env };

beforeEach(() => {
  delete process.env.RAZORPAY_WEBHOOK_SECRET;
  delete process.env.CASHFREE_PG_SECRET_KEY;
});

afterEach(() => {
  process.env = { ...SAVED };
});

describe('razorpay provider verifyWebhook header mapping', () => {
  const SECRET = 'whsec_rzp';
  const BODY = '{"event":"subscription.charged"}';
  const sig = (): string => createHmac('sha256', SECRET).update(BODY).digest('hex');

  it('accepts a valid x-razorpay-signature header', () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;
    expect(getProvider('razorpay').verifyWebhook(BODY, { 'x-razorpay-signature': sig() })).toBe(
      true,
    );
  });

  it('rejects a tampered body', () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;
    expect(
      getProvider('razorpay').verifyWebhook(`${BODY}x`, { 'x-razorpay-signature': sig() }),
    ).toBe(false);
  });

  it('rejects when the signature header is absent', () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;
    expect(getProvider('razorpay').verifyWebhook(BODY, {})).toBe(false);
  });
});

describe('cashfree provider verifyWebhook header mapping', () => {
  const SECRET = 'cf_secret';
  const BODY = '{"type":"SUBSCRIPTION_STATUS_CHANGE"}';
  const TS = '1718000000000';
  const sig = (): string =>
    createHmac('sha256', SECRET)
      .update(TS + BODY)
      .digest('base64');

  it('accepts a valid x-webhook-signature + x-webhook-timestamp pair', () => {
    process.env.CASHFREE_PG_SECRET_KEY = SECRET;
    expect(
      getProvider('cashfree').verifyWebhook(BODY, {
        'x-webhook-signature': sig(),
        'x-webhook-timestamp': TS,
      }),
    ).toBe(true);
  });

  it('rejects when the timestamp header is missing', () => {
    process.env.CASHFREE_PG_SECRET_KEY = SECRET;
    expect(getProvider('cashfree').verifyWebhook(BODY, { 'x-webhook-signature': sig() })).toBe(
      false,
    );
  });

  it('rejects a wrong-length signature without throwing (length guard)', () => {
    process.env.CASHFREE_PG_SECRET_KEY = SECRET;
    expect(
      getProvider('cashfree').verifyWebhook(BODY, {
        'x-webhook-signature': 'short',
        'x-webhook-timestamp': TS,
      }),
    ).toBe(false);
  });
});
