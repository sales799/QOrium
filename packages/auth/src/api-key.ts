import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Pool } from '@qorium/db';

/**
 * API key parsing, hashing, and lookup.
 *
 * Format (per CTO Architecture §6.1 + D3 §2.1):
 *   qor_(live|test)_<32-alphanumeric>            customer keys
 *   qor_internal_<tenant>_<32-hex>               Talpro Customer Zero
 *
 * Hashing decision: HMAC-SHA256(pepper, key). See
 * `infra/CTO-deltas/CTO-DELTA-api-key-hashing.md` — D3 specifies Argon2id
 * but the `app.api_keys.hashed_key UNIQUE` constraint is incompatible with
 * salted Argon2 outputs. HMAC-SHA256 is deterministic, satisfies UNIQUE,
 * and is OWASP-acceptable for high-entropy random tokens (≥128 bits).
 */

export type ApiKeyFamily = 'live' | 'test' | 'internal';

export interface ParsedApiKey {
  family: ApiKeyFamily;
  /** Stored in `app.api_keys.prefix` (≤10 chars per schema). */
  prefix: string;
  /** Full raw key as presented by the caller. Never logged. */
  raw: string;
}

const KEY_PATTERN = /^qor_(live|test|internal)_[a-zA-Z0-9_]{8,}$/;
const FAMILY_TO_PREFIX: Record<ApiKeyFamily, string> = {
  live: 'qor_live',
  test: 'qor_test',
  internal: 'qor_intern',
};

export class InvalidApiKeyFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidApiKeyFormatError';
  }
}

export function parseApiKey(raw: string): ParsedApiKey {
  if (typeof raw !== 'string' || raw.length === 0) {
    throw new InvalidApiKeyFormatError('API key is missing or empty');
  }
  if (raw.length > 256) {
    throw new InvalidApiKeyFormatError('API key exceeds maximum length');
  }
  if (!KEY_PATTERN.test(raw)) {
    throw new InvalidApiKeyFormatError('API key has invalid format');
  }
  const family = raw.split('_')[1] as ApiKeyFamily;
  return { family, prefix: FAMILY_TO_PREFIX[family], raw };
}

/**
 * HMAC-SHA256 hash of the raw key using a server-side pepper.
 * The pepper is read from `apiKeyPepper` argument (resolved at boot from env).
 */
export function hashApiKey(raw: string, pepper: string): string {
  if (!pepper || pepper.length < 32) {
    throw new Error('API key pepper must be at least 32 characters');
  }
  return createHmac('sha256', pepper).update(raw, 'utf8').digest('hex');
}

const HEX_PATTERN = /^[0-9a-fA-F]+$/;

/** Constant-time comparison of two hex hashes (defence-in-depth). */
export function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  if (!HEX_PATTERN.test(a) || !HEX_PATTERN.test(b)) return false;
  try {
    return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}

export interface ApiKeyRow {
  id: string;
  tenant_id: string;
  name: string | null;
  prefix: string;
  scopes: string[];
  expires_at: Date | null;
  revoked_at: Date | null;
  last_used_at: Date | null;
}

/**
 * Look up an API key by its hash. Returns null if not found, revoked, or expired.
 * Lookup is keyed by `hashed_key` (UNIQUE), constant-time relative to db latency.
 */
export async function lookupApiKey(
  pool: Pool,
  raw: string,
  pepper: string,
): Promise<ApiKeyRow | null> {
  const hashed = hashApiKey(raw, pepper);

  const result = await pool.query<ApiKeyRow>(
    `SELECT id, tenant_id, name, prefix, scopes, expires_at, revoked_at, last_used_at
     FROM app.api_keys
     WHERE hashed_key = $1
     LIMIT 1`,
    [hashed],
  );

  const row = result.rows[0];
  if (!row) return null;
  if (row.revoked_at !== null) return null;
  if (row.expires_at !== null && row.expires_at <= new Date()) return null;
  return row;
}

/** Update last_used_at — fire-and-forget; failures must not block the request. */
export async function touchLastUsed(pool: Pool, apiKeyId: string): Promise<void> {
  try {
    await pool.query('UPDATE app.api_keys SET last_used_at = NOW() WHERE id = $1', [apiKeyId]);
  } catch {
    // Logged by middleware caller; never throw from this hot path.
  }
}
