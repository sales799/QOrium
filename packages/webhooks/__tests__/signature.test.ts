import { describe, expect, it } from 'vitest';
import {
  WEBHOOK_DELIVERY_HEADER,
  WEBHOOK_SIGNATURE_HEADER,
  WEBHOOK_TIMESTAMP_HEADER,
  buildWebhookHeaders,
  signWebhookPayload,
  verifyWebhookSignature,
} from '../src/signature.js';

const SECRET = 'whsec_test_'.padEnd(48, 'x');

describe('signWebhookPayload', () => {
  it('returns sha256= prefixed base64', () => {
    const sig = signWebhookPayload({
      eventType: 'question.released',
      timestamp: 1714753800,
      body: '{"id":"q-1"}',
      secret: SECRET,
    });
    expect(sig).toMatch(/^sha256=[A-Za-z0-9+/]+=*$/);
  });

  it('is deterministic for same inputs', () => {
    const inp = {
      eventType: 'leak.detected',
      timestamp: 1714753800,
      body: '{"id":"x"}',
      secret: SECRET,
    };
    expect(signWebhookPayload(inp)).toBe(signWebhookPayload(inp));
  });

  it('changes when body changes', () => {
    const a = signWebhookPayload({
      eventType: 'x.y',
      timestamp: 1,
      body: 'a',
      secret: SECRET,
    });
    const b = signWebhookPayload({
      eventType: 'x.y',
      timestamp: 1,
      body: 'b',
      secret: SECRET,
    });
    expect(a).not.toBe(b);
  });

  it('changes when timestamp changes', () => {
    const a = signWebhookPayload({
      eventType: 'x.y',
      timestamp: 1,
      body: 'a',
      secret: SECRET,
    });
    const b = signWebhookPayload({
      eventType: 'x.y',
      timestamp: 2,
      body: 'a',
      secret: SECRET,
    });
    expect(a).not.toBe(b);
  });

  it('changes when secret changes', () => {
    const a = signWebhookPayload({
      eventType: 'x.y',
      timestamp: 1,
      body: 'a',
      secret: 'whsec_one_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x',
    });
    const b = signWebhookPayload({
      eventType: 'x.y',
      timestamp: 1,
      body: 'a',
      secret: 'whsec_two_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x',
    });
    expect(a).not.toBe(b);
  });
});

describe('verifyWebhookSignature', () => {
  const NOW = 1714753800;
  const baseInput = {
    eventType: 'question.released',
    timestamp: NOW,
    body: '{"id":"q-1"}',
    secret: SECRET,
    nowSeconds: NOW,
  };

  it('returns true for a valid signature within tolerance', () => {
    const sig = signWebhookPayload(baseInput);
    expect(
      verifyWebhookSignature({
        ...baseInput,
        receivedSignature: sig,
      }),
    ).toBe(true);
  });

  it('returns false when timestamp drift exceeds tolerance', () => {
    const sig = signWebhookPayload(baseInput);
    expect(
      verifyWebhookSignature({
        ...baseInput,
        receivedSignature: sig,
        nowSeconds: NOW + 600, // 10 min drift
      }),
    ).toBe(false);
  });

  it('returns false when signature header lacks sha256= prefix', () => {
    expect(
      verifyWebhookSignature({
        ...baseInput,
        receivedSignature: 'md5=somethingelse',
      }),
    ).toBe(false);
  });

  it('returns false when body is tampered', () => {
    const sig = signWebhookPayload(baseInput);
    expect(
      verifyWebhookSignature({
        ...baseInput,
        body: '{"id":"DIFFERENT"}',
        receivedSignature: sig,
      }),
    ).toBe(false);
  });

  it('returns false when signature length differs (timing-safe early exit)', () => {
    expect(
      verifyWebhookSignature({
        ...baseInput,
        receivedSignature: 'sha256=short',
      }),
    ).toBe(false);
  });
});

describe('buildWebhookHeaders', () => {
  it('emits all three headers with the correct names', () => {
    const headers = buildWebhookHeaders({
      eventType: 'q.r',
      timestamp: 1714753800,
      body: 'b',
      secret: SECRET,
      deliveryId: 'del_abc',
    });
    expect(headers[WEBHOOK_SIGNATURE_HEADER]).toMatch(/^sha256=/);
    expect(headers[WEBHOOK_TIMESTAMP_HEADER]).toBe('1714753800');
    expect(headers[WEBHOOK_DELIVERY_HEADER]).toBe('del_abc');
  });
});
