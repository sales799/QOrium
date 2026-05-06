/**
 * Idempotency key derivation. Domain services can either pass an explicit
 * `idempotencyKey` per emit (preferred — they know which retries are
 * which) or let the emitter compute a deterministic key from the event
 * shape so identical payloads collapse to one audit row.
 *
 * Pure-logic, no crypto dependency: we use a non-cryptographic FNV-1a
 * 64-bit hash because audit emission is internal — the goal is dedup
 * correctness inside our own emitter, not adversarial uniqueness.
 */

import { createHash, randomUUID } from 'node:crypto';

/**
 * Stable canonical JSON serialisation: object keys sorted recursively so
 * `{a:1,b:2}` and `{b:2,a:1}` produce identical bytes. Required so
 * idempotency keys are insensitive to key ordering across language
 * runtimes / JSON serialisers.
 */
export function canonicalJson(value: unknown): string {
  if (value === null || value === undefined) return JSON.stringify(value ?? null);
  if (typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map((v) => canonicalJson(v)).join(',') + ']';
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return '{' + entries.map(([k, v]) => JSON.stringify(k) + ':' + canonicalJson(v)).join(',') + '}';
}

export interface IdempotencyInput {
  tenantId: string | null;
  actorId: string | null;
  action: string;
  resourceId?: string | null;
  payload?: unknown;
  /** Optional bucket window — same window collapses identical events. */
  windowMs?: number;
  /** When in the wall clock the event happened; used to bucket via window. */
  occurredAt?: number;
}

/**
 * Derive a stable idempotency key from event fields. Same inputs (within
 * the optional bucket window) yield the same key.
 */
export function deriveIdempotencyKey(input: IdempotencyInput): string {
  const bucket =
    input.windowMs && input.windowMs > 0 && input.occurredAt
      ? Math.floor(input.occurredAt / input.windowMs)
      : 0;
  const canon = canonicalJson({
    tenantId: input.tenantId,
    actorId: input.actorId,
    action: input.action,
    resourceId: input.resourceId ?? null,
    payload: input.payload ?? null,
    bucket,
  });
  return 'sha256:' + createHash('sha256').update(canon).digest('hex');
}

/** Generate a fresh non-deterministic idempotency key (UUIDv4-based). */
export function freshIdempotencyKey(): string {
  return 'uuid:' + randomUUID();
}
