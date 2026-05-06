/**
 * GitHub webhook HMAC-SHA256 signature verification.
 * https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
 *
 * GitHub posts `X-Hub-Signature-256: sha256=<hex>` derived from
 * HMAC_SHA256(rawBody, webhookSecret).
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyGitHubSignature(
  rawBody: string,
  signature: string | undefined,
  secret: string,
): boolean {
  if (!signature || !signature.startsWith('sha256=')) return false;
  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;
  if (expected.length !== signature.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(signature, 'utf8'));
  } catch {
    return false;
  }
}

/** Convenience for tests: produce the header value GitHub would send. */
export function signGitHubBody(rawBody: string, secret: string): string {
  return `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;
}
