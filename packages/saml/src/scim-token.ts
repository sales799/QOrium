/**
 * SCIM bearer-token validation.
 *
 * Same pepper-hash model as @qorium/auth api-key (CTO-DELTA #4):
 *   stored = HMAC-SHA256(pepper, raw_token)
 *
 * Tokens have a TTL (`expires_at`). Per spec §4.3, rotation cadence is 6
 * months with overlap window (caller layers two valid hashes during
 * grace).
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Compute the canonical hash for a raw bearer token. Pepper comes from
 * the same env var (`API_KEY_PEPPER`) as @qorium/auth so a single secret
 * rotation rotates everything.
 */
export function hashScimToken(rawToken: string, pepper: string): Buffer {
  if (!pepper || pepper.length < 16) {
    throw new Error('SCIM token pepper must be >= 16 chars');
  }
  if (!rawToken || rawToken.length < 24) {
    throw new Error('SCIM token must be >= 24 chars (>=128 bits entropy)');
  }
  return createHmac('sha256', pepper).update(rawToken).digest();
}

/**
 * Constant-time equality for two Buffers of equal length.
 * timingSafeEqual throws on length mismatch; we pad-pre-check.
 */
export function tokenHashesEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export type ScimAuthResult =
  | {
      ok: true;
      tenantId: string;
    }
  | {
      ok: false;
      status: 401 | 403;
      detail: string;
    };

/**
 * Pure validator: caller does the DB query for {hash, tenantId, expiresAt}
 * and passes both candidates (current + previous, during rotation overlap).
 */
export function validateScimAuth(args: {
  rawToken: string;
  pepper: string;
  /** Up to two candidate stored hashes — current and previous-during-rotation */
  storedHashes: ReadonlyArray<{ tenantId: string; hash: Buffer; expiresAt: Date }>;
  now: Date;
}): ScimAuthResult {
  const { rawToken, pepper, storedHashes, now } = args;

  let computed: Buffer;
  try {
    computed = hashScimToken(rawToken, pepper);
  } catch (e) {
    return {
      ok: false,
      status: 401,
      detail: `Token format invalid: ${(e as Error).message}`,
    };
  }

  for (const candidate of storedHashes) {
    if (!tokenHashesEqual(candidate.hash, computed)) continue;
    if (candidate.expiresAt.getTime() <= now.getTime()) {
      return { ok: false, status: 401, detail: 'Token expired' };
    }
    return { ok: true, tenantId: candidate.tenantId };
  }

  return { ok: false, status: 401, detail: 'Token invalid' };
}
