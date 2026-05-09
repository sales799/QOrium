import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Sprint 4.5 v0 — Webhook request signing per spec §5.
 *
 * Customer receives:
 *   X-QOrium-Signature: sha256=<base64(HMAC-SHA256(message, secret))>
 *   X-QOrium-Timestamp: <unix-seconds>
 *   X-QOrium-Delivery: <delivery_id>
 *
 * The signed message is: `{event_type}.{timestamp}.{body}`
 *
 * Customer verification flow (per spec §5):
 *   1. Reject if |now - timestamp| > 5 minutes (replay defense)
 *   2. Reconstruct message
 *   3. Compute HMAC-SHA256 with stored secret
 *   4. Constant-time compare to received signature
 */

export const WEBHOOK_SIGNATURE_HEADER = 'x-qorium-signature';
export const WEBHOOK_TIMESTAMP_HEADER = 'x-qorium-timestamp';
export const WEBHOOK_DELIVERY_HEADER = 'x-qorium-delivery';
export const WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS = 300; // 5 min

export interface WebhookSignatureInput {
  /** Event type identifier, e.g. "question.released". */
  eventType: string;
  /** Unix epoch in seconds. */
  timestamp: number;
  /** Canonical UTF-8 body bytes (the JSON payload exactly as sent). */
  body: string;
  /** Per-subscription signing secret. */
  secret: string;
}

export interface WebhookHeaders {
  [WEBHOOK_SIGNATURE_HEADER]: string;
  [WEBHOOK_TIMESTAMP_HEADER]: string;
  [WEBHOOK_DELIVERY_HEADER]: string;
}

function buildMessage(eventType: string, timestamp: number, body: string): string {
  return `${eventType}.${timestamp}.${body}`;
}

/** Compute the canonical signature header value (`sha256=<base64>`). */
export function signWebhookPayload(input: WebhookSignatureInput): string {
  const message = buildMessage(input.eventType, input.timestamp, input.body);
  const digest = createHmac('sha256', input.secret).update(message, 'utf8').digest('base64');
  return `sha256=${digest}`;
}

/**
 * Constant-time signature verification. Returns false on any of:
 *   - timestamp drift > tolerance (default 5 min)
 *   - signature header malformed (missing `sha256=` prefix)
 *   - HMAC mismatch
 *
 * Errors don't throw — caller treats false as "reject this delivery".
 */
export function verifyWebhookSignature(
  input: WebhookSignatureInput & { receivedSignature: string; nowSeconds?: number },
  toleranceSeconds: number = WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS,
): boolean {
  const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - input.timestamp) > toleranceSeconds) return false;
  if (!input.receivedSignature.startsWith('sha256=')) return false;

  const expected = signWebhookPayload(input);
  const expectedBuf = Buffer.from(expected, 'utf8');
  const receivedBuf = Buffer.from(input.receivedSignature, 'utf8');
  if (expectedBuf.length !== receivedBuf.length) return false;
  return timingSafeEqual(expectedBuf, receivedBuf);
}

/** Build the full set of webhook headers for an outbound delivery. */
export function buildWebhookHeaders(
  input: WebhookSignatureInput & { deliveryId: string },
): WebhookHeaders {
  return {
    [WEBHOOK_SIGNATURE_HEADER]: signWebhookPayload(input),
    [WEBHOOK_TIMESTAMP_HEADER]: String(input.timestamp),
    [WEBHOOK_DELIVERY_HEADER]: input.deliveryId,
  };
}
