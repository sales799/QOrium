/**
 * AuditEmitter — Stub-vs-Real factory for emitting audit events from
 * domain services to `@qorium/audit-log`.
 *
 *   const emitter = createAuditEmitter({ mode: 'stub' });          // tests
 *   const emitter = createAuditEmitter({ mode: 'real', baseUrl, adminToken }); // prod
 *
 * Both shapes implement the same `AuditEmitter` interface so call sites
 * are identical between tests and production.
 */

import { deriveIdempotencyKey, freshIdempotencyKey } from './idempotency.js';
import { isKnownAction } from './taxonomy.js';

export interface AuditEvent {
  tenantId: string | null;
  actorId: string | null;
  actorType?: string;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  changes?: unknown;
  payload?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
  /** Optional caller-supplied idempotency key. If omitted, derived. */
  idempotencyKey?: string;
}

export interface EmitResult {
  /** The idempotency key that was used (caller-supplied or derived). */
  idempotencyKey: string;
  /** True if the event was sent to the upstream / stored in stub. */
  delivered: boolean;
  /** True if the emitter recognised this as a duplicate within the window. */
  deduplicated: boolean;
  /** Any non-throwing warning the emitter wants to surface. */
  warning?: string;
}

export interface AuditEmitter {
  emit(event: AuditEvent): Promise<EmitResult>;
  /** Return the most-recent N events the stub has buffered (stub mode only). */
  recent?(limit?: number): ReadonlyArray<AuditEvent & { idempotencyKey: string; sentAt: number }>;
  /** Reset internal stub state (stub mode only). */
  reset?(): void;
}

export interface StubOptions {
  mode: 'stub';
  /** Sliding-window for idempotency dedup (default 5 minutes). */
  dedupWindowMs?: number;
  /** Maximum events kept in the in-memory ring buffer (default 1000). */
  bufferSize?: number;
  /** Override clock for tests. */
  now?: () => number;
}

export interface RealOptions {
  mode: 'real';
  /** Base URL for the audit-log service, e.g. `http://localhost:5111`. */
  baseUrl: string;
  /** Bearer token the audit-log endpoint will accept for system writes. */
  adminToken: string;
  /** Per-call timeout in ms (default 5000). */
  timeoutMs?: number;
  /** fetch override (for tests). */
  fetchImpl?: typeof fetch;
  /** Override clock for tests. */
  now?: () => number;
}

export type EmitterOptions = StubOptions | RealOptions;

export function createAuditEmitter(opts: EmitterOptions): AuditEmitter {
  if (opts.mode === 'stub') return createStubEmitter(opts);
  return createRealEmitter(opts);
}

function createStubEmitter(opts: StubOptions): AuditEmitter {
  const dedupWindowMs = opts.dedupWindowMs ?? 5 * 60 * 1000;
  const bufferSize = opts.bufferSize ?? 1000;
  const now = opts.now ?? (() => Date.now());

  const buffer: Array<AuditEvent & { idempotencyKey: string; sentAt: number }> = [];
  const seenKeys = new Map<string, number>();

  function evictExpired(): void {
    const cutoff = now() - dedupWindowMs;
    for (const [k, t] of seenKeys) {
      if (t < cutoff) seenKeys.delete(k);
    }
  }

  return {
    emit(event) {
      evictExpired();
      const key = resolveKey(event, dedupWindowMs, now());
      const warning = warningForUnknownAction(event.action);
      if (seenKeys.has(key)) {
        return Promise.resolve({
          idempotencyKey: key,
          delivered: false,
          deduplicated: true,
          ...(warning ? { warning } : {}),
        });
      }
      seenKeys.set(key, now());
      const stamped = { ...event, idempotencyKey: key, sentAt: now() };
      buffer.push(stamped);
      if (buffer.length > bufferSize) buffer.shift();
      return Promise.resolve({
        idempotencyKey: key,
        delivered: true,
        deduplicated: false,
        ...(warning ? { warning } : {}),
      });
    },
    recent(limit = 50) {
      return buffer.slice(-limit);
    },
    reset() {
      buffer.length = 0;
      seenKeys.clear();
    },
  };
}

function createRealEmitter(opts: RealOptions): AuditEmitter {
  if (!opts.baseUrl || !opts.adminToken) {
    throw new Error(
      'createAuditEmitter(real): baseUrl + adminToken required. ' +
        'Use mode: "stub" for tests / dev without a live audit-log.',
    );
  }
  const baseUrl = opts.baseUrl.replace(/\/+$/, '');
  const timeoutMs = opts.timeoutMs ?? 5000;
  const now = opts.now ?? (() => Date.now());
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== 'function') {
    throw new Error('createAuditEmitter(real): no fetch implementation available');
  }
  return {
    async emit(event) {
      const key = resolveKey(event, undefined, now());
      const body = toApiBody(event);
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeoutMs);
      try {
        const resp = await fetchImpl(`${baseUrl}/v1/audit/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${opts.adminToken}`,
            'Idempotency-Key': key,
          },
          body: JSON.stringify(body),
          signal: ctrl.signal,
        });
        const warning = warningForUnknownAction(event.action);
        if (!resp.ok) {
          return {
            idempotencyKey: key,
            delivered: false,
            deduplicated: resp.status === 409,
            ...(warning ? { warning } : { warning: `audit-log ${resp.status}` }),
          };
        }
        return {
          idempotencyKey: key,
          delivered: true,
          deduplicated: false,
          ...(warning ? { warning } : {}),
        };
      } finally {
        clearTimeout(t);
      }
    },
  };
}

function resolveKey(
  event: AuditEvent,
  dedupWindowMs: number | undefined,
  occurredAt: number,
): string {
  if (event.idempotencyKey && event.idempotencyKey.length > 0) return event.idempotencyKey;
  return deriveIdempotencyKey({
    tenantId: event.tenantId,
    actorId: event.actorId,
    action: event.action,
    resourceId: event.resourceId ?? null,
    payload: event.payload ?? null,
    ...(dedupWindowMs ? { windowMs: dedupWindowMs, occurredAt } : {}),
  });
}

function warningForUnknownAction(action: string): string | undefined {
  return isKnownAction(action)
    ? undefined
    : `action "${action}" is not in the canonical taxonomy (taxonomy.ts)`;
}

function toApiBody(event: AuditEvent): Record<string, unknown> {
  const body: Record<string, unknown> = { action: event.action };
  if (event.tenantId !== undefined) body.tenant_id = event.tenantId;
  if (event.actorId !== undefined) body.actor_id = event.actorId;
  if (event.actorType !== undefined) body.actor_type = event.actorType;
  if (event.resourceType !== undefined) body.resource_type = event.resourceType;
  if (event.resourceId !== undefined) body.resource_id = event.resourceId;
  if (event.changes !== undefined) body.changes = event.changes;
  if (event.payload !== undefined) body.payload = event.payload;
  if (event.ipAddress !== undefined) body.ip_address = event.ipAddress;
  if (event.userAgent !== undefined) body.user_agent = event.userAgent;
  return body;
}

export { freshIdempotencyKey };
