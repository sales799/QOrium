/**
 * HMAC-SHA256 webhook signature verification per spec §4.3.
 *
 * Greenhouse / Ashby / Darwinbox all sign with HMAC-SHA256 over the raw
 * request body. Workday uses a different scheme (signed JWT in headers)
 * — its adapter overrides this primitive.
 *
 * Pure logic; no IO. Constant-time string compare to defend against
 * timing leaks.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

export interface HmacVerifyOptions {
  /** The raw request body bytes (NOT the parsed JSON). */
  rawBody: Buffer;
  /** Header value the ATS provided. May be `sha256=<hex>` or just `<hex>`. */
  signatureHeader: string | string[] | undefined;
  /** The shared secret stored for this integration. */
  secret: string;
  /** Optional: the algorithm prefix to strip ('sha256=' for Greenhouse,
   * 'sha256=' for Ashby, none for Darwinbox). */
  prefix?: string;
}

export function verifyHmacSignature(opts: HmacVerifyOptions): boolean {
  const { rawBody, secret } = opts;
  if (!secret || rawBody.length === 0) return false;
  const headerValue = Array.isArray(opts.signatureHeader)
    ? opts.signatureHeader[0]
    : opts.signatureHeader;
  if (typeof headerValue !== 'string' || headerValue.length === 0) return false;

  const supplied = stripPrefix(headerValue.trim(), opts.prefix);
  if (!/^[0-9a-f]+$/i.test(supplied)) return false;

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  if (supplied.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(supplied, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

function stripPrefix(value: string, prefix: string | undefined): string {
  if (!prefix) return value;
  if (value.toLowerCase().startsWith(prefix.toLowerCase())) {
    return value.slice(prefix.length);
  }
  return value;
}

/** Helper for adapters that want to compute an outgoing signature
 * (e.g., for POSTs back to a customer-supplied webhook URL). */
export function computeHmacSignature(rawBody: Buffer, secret: string, prefix = 'sha256='): string {
  const digest = createHmac('sha256', secret).update(rawBody).digest('hex');
  return `${prefix}${digest}`;
}
