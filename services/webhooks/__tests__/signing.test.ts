import { describe, expect, it } from 'vitest';
import {
  buildDeliveryHeaders,
  computeDeliverySignature,
  verifyDeliverySignature,
} from '../src/signing.js';

describe('webhooks signing', () => {
  const secret = 'whsec_test_secret_value';
  const body = JSON.stringify({ event: 'question.released', id: '42' });

  it('produces a deterministic sha256= prefix signature', () => {
    const sig = computeDeliverySignature({
      secret,
      eventType: 'question.released',
      body,
      timestamp: 1714753800,
    });
    expect(sig.startsWith('sha256=')).toBe(true);
    const again = computeDeliverySignature({
      secret,
      eventType: 'question.released',
      body,
      timestamp: 1714753800,
    });
    expect(sig).toBe(again);
  });

  it('verifies a fresh signature within tolerance', () => {
    const ts = 1_700_000_000;
    const sig = computeDeliverySignature({ secret, eventType: 'a.b', body, timestamp: ts });
    const ok = verifyDeliverySignature({
      secret,
      eventType: 'a.b',
      body,
      timestamp: ts,
      signatureHeader: sig,
      now: () => ts,
    });
    expect(ok).toBe(true);
  });

  it('rejects a stale signature beyond the 5-minute window', () => {
    const ts = 1_700_000_000;
    const sig = computeDeliverySignature({ secret, eventType: 'a.b', body, timestamp: ts });
    const ok = verifyDeliverySignature({
      secret,
      eventType: 'a.b',
      body,
      timestamp: ts,
      signatureHeader: sig,
      now: () => ts + 10 * 60,
    });
    expect(ok).toBe(false);
  });

  it('rejects a tampered payload', () => {
    const ts = 1_700_000_000;
    const sig = computeDeliverySignature({ secret, eventType: 'a.b', body, timestamp: ts });
    const ok = verifyDeliverySignature({
      secret,
      eventType: 'a.b',
      body: body + 'tampered',
      timestamp: ts,
      signatureHeader: sig,
      now: () => ts,
    });
    expect(ok).toBe(false);
  });

  it('rejects when signatureHeader is missing', () => {
    const ok = verifyDeliverySignature({
      secret,
      eventType: 'a.b',
      body,
      timestamp: 1,
      signatureHeader: undefined,
    });
    expect(ok).toBe(false);
  });

  it('builds headers with all required fields', () => {
    const headers = buildDeliveryHeaders({
      secret,
      eventType: 'question.released',
      body,
      timestamp: 1714753800,
      deliveryId: 'evt-1',
    });
    expect(headers['X-QOrium-Delivery']).toBe('evt-1');
    expect(headers['X-QOrium-Timestamp']).toBe('1714753800');
    expect(headers['X-QOrium-Signature']).toMatch(/^sha256=/);
  });
});
