/**
 * API key issuance per `infra/D3-Talpro-Internal-API-Key-Spec.md` §2.1.
 *
 * Pure logic. Accepts a tenant prefix + family + entropy source and
 * returns the raw key the caller MUST persist on the customer side
 * (the server only stores the HMAC-SHA256 hash).
 */

import { randomBytes } from 'node:crypto';
import { hashApiKey, type ApiKeyFamily } from '@qorium/auth';

export interface IssuanceInputs {
  family: ApiKeyFamily;
  /** Used in the key body only for `internal` family (per D3 §2.1). */
  tenantPrefix?: string;
  pepper: string;
  /** Override the random source for tests. */
  randomSource?: (bytes: number) => Buffer;
}

export interface IssuedKey {
  raw: string;
  prefix: string;
  hash: string;
}

const HEX_BYTES = 16; // 32 hex chars = 128 bits entropy
const TENANT_REGEX = /^[a-z0-9-]{8,32}$/;

export function issueKey(inputs: IssuanceInputs): IssuedKey {
  const random = inputs.randomSource ?? randomBytes;
  const suffix = random(HEX_BYTES).toString('hex');
  const family = inputs.family;
  let raw: string;
  let prefix: string;
  if (family === 'internal') {
    if (!inputs.tenantPrefix || !TENANT_REGEX.test(inputs.tenantPrefix)) {
      throw new Error('issueKey: tenantPrefix is required for internal family (8–32 a-z0-9-)');
    }
    raw = `qor_internal_${inputs.tenantPrefix}_${suffix}`;
    prefix = 'qor_intern';
  } else {
    raw = `qor_${family}_${suffix}`;
    prefix = `qor_${family}`;
  }
  const hash = hashApiKey(raw, inputs.pepper);
  return { raw, prefix, hash };
}

/**
 * Return the next rotation due timestamp per B6 calendar (180 days
 * from `now` for internal keys; 365 days for customer keys).
 */
export function nextRotationDueAt(now: Date, family: ApiKeyFamily): Date {
  const days = family === 'internal' ? 180 : 365;
  return new Date(now.getTime() + days * 86_400_000);
}
