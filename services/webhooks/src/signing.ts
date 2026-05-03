/**
 * Outbound webhook signing per `infra/Webhooks-Service-v0-Spec.md` §5.
 *
 *   X-QOrium-Signature: sha256=<base64(HMAC-SHA256(message, secret))>
 *   X-QOrium-Timestamp: <unix seconds>
 *   X-QOrium-Delivery: <delivery id>
 *
 *   message = "<event_type>.<timestamp>.<body>"
 *
 * Pure logic; no IO. Verification mirror lives in
 * `verifyDeliverySignature` so customer integrations can lift the same
 * primitive.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

export interface SigningInputs {
  eventType: string;
  body: string;
  timestamp: number; // unix seconds
  secret: string;
}

export interface DeliveryHeaders {
  'X-QOrium-Signature': string;
  'X-QOrium-Timestamp': string;
  'X-QOrium-Delivery': string;
}

export function computeDeliverySignature(inputs: SigningInputs): string {
  const message = `${inputs.eventType}.${inputs.timestamp}.${inputs.body}`;
  const digest = createHmac('sha256', inputs.secret).update(message).digest('base64');
  return `sha256=${digest}`;
}

export function buildDeliveryHeaders(
  inputs: SigningInputs & { deliveryId: string },
): DeliveryHeaders {
  return {
    'X-QOrium-Signature': computeDeliverySignature(inputs),
    'X-QOrium-Timestamp': String(inputs.timestamp),
    'X-QOrium-Delivery': inputs.deliveryId,
  };
}

export interface VerifyOptions {
  eventType: string;
  body: string;
  timestamp: number;
  secret: string;
  signatureHeader: string | undefined;
  /** Reject if `|now - timestamp| > toleranceSec`. Default 300 (5 minutes). */
  toleranceSec?: number;
  /** Optional clock for tests. */
  now?: () => number;
}

export function verifyDeliverySignature(opts: VerifyOptions): boolean {
  if (!opts.signatureHeader || !opts.secret) return false;
  const tolerance = opts.toleranceSec ?? 300;
  const now = opts.now ?? (() => Math.floor(Date.now() / 1000));
  if (Math.abs(now() - opts.timestamp) > tolerance) return false;

  const expected = computeDeliverySignature({
    eventType: opts.eventType,
    body: opts.body,
    timestamp: opts.timestamp,
    secret: opts.secret,
  });
  if (expected.length !== opts.signatureHeader.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(expected, 'utf8'),
      Buffer.from(opts.signatureHeader, 'utf8'),
    );
  } catch {
    return false;
  }
}
