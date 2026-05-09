import { createHash } from 'node:crypto';

/**
 * Sprint 4.4.3 — Audit event hash-chaining primitives.
 *
 * Each event carries `hash_current` = SHA-256 (hex) of its canonical JSON
 * form. Subsequent rows reference their predecessor's `hash_current` via
 * `hash_previous` so the entire (tenant_id, occurred_at, id) ordering forms
 * a tamper-evident chain.
 *
 * `hash_current` is computed at INSERT time inside `recordAuditEvent`.
 * `hash_previous` is materialized asynchronously by a periodic job
 * (Sprint 4.4.3.1) so we never serialize the audit hot path.
 *
 * The canonical form deliberately does NOT include `hash_current`,
 * `hash_previous`, or `occurred_at` (set by Postgres `DEFAULT NOW()`).
 * Including those would either be circular (hash includes itself) or
 * break chain verification across replication / restore boundaries.
 */

/** Subset of audit-event fields that participate in the hash. */
export interface HashableAuditEvent {
  actor_type: string;
  actor_id?: string | null;
  tenant_id?: string | null;
  event_type: string;
  entity_type?: string | null | undefined;
  entity_id?: string | null | undefined;
  changes?: Record<string, unknown> | null | undefined;
  payload?: Record<string, unknown> | null | undefined;
  ip_address?: string | null | undefined;
  user_agent?: string | null | undefined;
}

/** Stable key ordering for the canonical form. */
const HASH_FIELDS = [
  'actor_type',
  'actor_id',
  'tenant_id',
  'event_type',
  'entity_type',
  'entity_id',
  'changes',
  'payload',
  'ip_address',
  'user_agent',
] as const;

/**
 * Deterministically serialize an event to a canonical UTF-8 string.
 *
 * Top-level keys are emitted in `HASH_FIELDS` order with `null` for any
 * absent field. Nested objects (`changes`, `payload`) are serialized with
 * recursively-sorted keys so two semantically-equal events always produce
 * the same byte sequence regardless of input property order.
 */
export function canonicalAuditEventJson(event: HashableAuditEvent): string {
  const src = event as unknown as Record<string, unknown>;
  const obj: Record<string, unknown> = {};
  for (const k of HASH_FIELDS) {
    obj[k] = canonicalize(src[k] ?? null);
  }
  return JSON.stringify(obj);
}

function canonicalize(v: unknown): unknown {
  if (v === null || v === undefined) return null;
  if (Array.isArray(v)) return v.map(canonicalize);
  if (typeof v === 'object') {
    const entries = Object.entries(v as Record<string, unknown>).sort(([a], [b]) =>
      a < b ? -1 : a > b ? 1 : 0,
    );
    const out: Record<string, unknown> = {};
    for (const [k, val] of entries) out[k] = canonicalize(val);
    return out;
  }
  return v;
}

/** Compute SHA-256 (hex, lowercase) of the event's canonical form. */
export function computeAuditHash(event: HashableAuditEvent): string {
  return createHash('sha256').update(canonicalAuditEventJson(event), 'utf8').digest('hex');
}

/**
 * Result of walking a chain. `breaks` lists `(index, expected, actual)` for
 * each row whose `hash_previous` does not match the prior row's
 * `hash_current`. `unmaterialized` counts rows whose `hash_previous` is
 * NULL — these are pre-Sprint-4.4.3.1 rows the periodic materializer hasn't
 * yet linked.
 */
export interface ChainVerificationResult {
  valid: boolean;
  total: number;
  breaks: Array<{ index: number; id: string; expected: string; actual: string | null }>;
  unmaterialized: number;
}

export interface ChainEvent {
  id: string;
  hash_current: string | null;
  hash_previous: string | null;
}

/**
 * Walk an ordered chunk of events (already sorted by `(occurred_at, id)`
 * ASC) and verify the hash chain. Tolerates `hash_previous IS NULL` by
 * counting it under `unmaterialized` rather than failing.
 */
export function verifyAuditChain(events: ChainEvent[]): ChainVerificationResult {
  const breaks: ChainVerificationResult['breaks'] = [];
  let unmaterialized = 0;
  for (let i = 1; i < events.length; i++) {
    const prev = events[i - 1]!;
    const cur = events[i]!;
    if (cur.hash_previous === null) {
      unmaterialized += 1;
      continue;
    }
    if (prev.hash_current === null) {
      // Predecessor lacks hash_current — treat as unmaterialized rather
      // than break (it predates Sprint 4.4.3 entirely).
      unmaterialized += 1;
      continue;
    }
    if (cur.hash_previous !== prev.hash_current) {
      breaks.push({
        index: i,
        id: cur.id,
        expected: prev.hash_current,
        actual: cur.hash_previous,
      });
    }
  }
  return {
    valid: breaks.length === 0,
    total: events.length,
    breaks,
    unmaterialized,
  };
}
