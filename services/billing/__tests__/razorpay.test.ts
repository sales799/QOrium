import { describe, expect, it } from 'vitest';
import { createHmac } from 'node:crypto';
import {
  isRazorpayEvent,
  realRazorpayClient,
  stubRazorpayClient,
  verifyWebhookSignature,
} from '../src/razorpay';

const SECRET = 'razorpay-webhook-secret-test';

function sign(body: string): string {
  return createHmac('sha256', SECRET).update(body).digest('hex');
}

describe('verifyWebhookSignature', () => {
  it('accepts a correctly-signed body', () => {
    const body = JSON.stringify({ event: 'payment.captured', payload: {} });
    expect(verifyWebhookSignature(body, sign(body), SECRET)).toBe(true);
  });
  it('rejects a tampered body', () => {
    const body = JSON.stringify({ event: 'payment.captured', payload: {} });
    expect(verifyWebhookSignature(body + 'tampered', sign(body), SECRET)).toBe(false);
  });
  it('rejects when signature is missing', () => {
    expect(verifyWebhookSignature('x', undefined, SECRET)).toBe(false);
  });
  it('rejects malformed signatures', () => {
    expect(verifyWebhookSignature('x', 'not-hex', SECRET)).toBe(false);
  });
});

describe('isRazorpayEvent', () => {
  it('accepts the canonical shape', () => {
    expect(isRazorpayEvent({ event: 'payment.captured', payload: {} })).toBe(true);
  });
  it('rejects garbage', () => {
    expect(isRazorpayEvent(null)).toBe(false);
    expect(isRazorpayEvent({})).toBe(false);
    expect(isRazorpayEvent({ event: 1, payload: {} })).toBe(false);
  });
});

describe('stubRazorpayClient', () => {
  it('returns a stubbed order id', async () => {
    const c = stubRazorpayClient(SECRET);
    const order = await c.createOrder({
      amountCents: 11_800_000,
      currency: 'INR',
      receipt: 'INV-2026-00001',
    });
    expect(order.id).toMatch(/^order_stub_/);
    expect(order.amount).toBe(11_800_000);
  });
});

describe('realRazorpayClient', () => {
  it('throws when credentials are missing', () => {
    expect(() => realRazorpayClient({ credentials: null, webhookSecret: SECRET })).toThrow(
      /RAZORPAY_KEY_ID/,
    );
  });

  it('uses Basic auth + API host when credentials provided', async () => {
    let capturedAuth = '';
    let capturedUrl = '';
    const fetchImpl: typeof fetch = async (url, init) => {
      capturedUrl = String(url);
      capturedAuth = (init?.headers as Record<string, string>).authorization;
      return new Response(
        JSON.stringify({ id: 'order_real', amount: 100, currency: 'INR', status: 'created' }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    };
    const c = realRazorpayClient({
      credentials: { keyId: 'rzp_key', keySecret: 'rzp_secret' },
      webhookSecret: SECRET,
      fetchImpl,
    });
    const order = await c.createOrder({ amountCents: 100, currency: 'INR', receipt: 'r' });
    expect(order.id).toBe('order_real');
    expect(capturedUrl).toBe('https://api.razorpay.com/v1/orders');
    expect(capturedAuth).toMatch(/^Basic /);
  });
});
