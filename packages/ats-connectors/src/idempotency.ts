/**
 * Idempotency helpers per spec §6.
 *
 * v0 derives an idempotency key from the inbound webhook's
 * `Idempotency-Key` header when the ATS supplies one; otherwise it
 * synthesises a key from sha256(platform + body + minute-bucket) so a
 * stuck retry within the same minute is still treated as a duplicate.
 */

import { createHash } from 'node:crypto';

export interface DeriveKeyInputs {
  platform: string;
  rawBody: Buffer;
  headers: Record<string, string | string[] | undefined>;
  /** Override the clock for tests. */
  now?: () => Date;
}

const HEADER_CANDIDATES = [
  'idempotency-key',
  'x-idempotency-key',
  'x-webhook-id',
  'x-request-id',
  'x-greenhouse-event',
];

export function deriveIdempotencyKey(inputs: DeriveKeyInputs): string {
  for (const name of HEADER_CANDIDATES) {
    const value = inputs.headers[name];
    if (typeof value === 'string' && value.length > 0) return `hdr:${name}:${value}`;
    if (Array.isArray(value) && typeof value[0] === 'string' && value[0].length > 0) {
      return `hdr:${name}:${value[0]}`;
    }
  }
  const now = inputs.now ?? (() => new Date());
  const minuteBucket = Math.floor(now().getTime() / 60_000);
  const digest = createHash('sha256')
    .update(inputs.platform)
    .update('|')
    .update(inputs.rawBody)
    .update('|')
    .update(String(minuteBucket))
    .digest('hex');
  return `body:${digest}`;
}

/**
 * Tiny in-memory replay cache for bridge services that don't (yet) have
 * a Postgres connection. The bridge's production path uses the
 * `app.ats_webhook_log` UNIQUE (integration_id, idempotency_key)
 * constraint; this cache is the test-double + fallback for read-mostly
 * deployments.
 */
export class InMemoryIdempotencyCache {
  private readonly seen = new Map<string, number>();
  private readonly ttlMs: number;

  constructor(ttlMs = 24 * 60 * 60 * 1_000) {
    this.ttlMs = ttlMs;
  }

  /** Returns true if the key was new; false if it's a duplicate. */
  recordIfNew(key: string, now: () => Date = () => new Date()): boolean {
    this.evictExpired(now);
    if (this.seen.has(key)) return false;
    this.seen.set(key, now().getTime());
    return true;
  }

  has(key: string, now: () => Date = () => new Date()): boolean {
    this.evictExpired(now);
    return this.seen.has(key);
  }

  size(): number {
    return this.seen.size;
  }

  private evictExpired(now: () => Date): void {
    const cutoff = now().getTime() - this.ttlMs;
    for (const [key, ts] of this.seen) {
      if (ts < cutoff) this.seen.delete(key);
    }
  }
}
