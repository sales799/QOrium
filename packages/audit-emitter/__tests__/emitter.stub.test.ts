import { describe, expect, it } from 'vitest';
import { createAuditEmitter } from '../src/emitter';

describe('stub emitter', () => {
  it('delivers a fresh event and surfaces the derived key', async () => {
    const emitter = createAuditEmitter({ mode: 'stub', now: () => 1_000_000 });
    const result = await emitter.emit({
      tenantId: 't1',
      actorId: 'u1',
      action: 'api_key.created',
      resourceType: 'api_key',
      resourceId: 'k1',
      payload: { name: 'admin' },
    });
    expect(result.delivered).toBe(true);
    expect(result.deduplicated).toBe(false);
    expect(result.idempotencyKey.startsWith('sha256:')).toBe(true);
    expect(emitter.recent?.()).toHaveLength(1);
  });

  it('deduplicates identical events within the dedup window', async () => {
    const emitter = createAuditEmitter({ mode: 'stub', dedupWindowMs: 60_000 });
    const event = {
      tenantId: 't1',
      actorId: 'u1',
      action: 'api_key.created',
      resourceId: 'k1',
      payload: { name: 'x' },
    };
    const a = await emitter.emit(event);
    const b = await emitter.emit(event);
    expect(a.delivered).toBe(true);
    expect(b.delivered).toBe(false);
    expect(b.deduplicated).toBe(true);
    expect(a.idempotencyKey).toBe(b.idempotencyKey);
    expect(emitter.recent?.()).toHaveLength(1);
  });

  it('expires keys after the dedup window so re-emit succeeds', async () => {
    let now = 1_000;
    const emitter = createAuditEmitter({ mode: 'stub', dedupWindowMs: 1_000, now: () => now });
    const event = {
      tenantId: 't1',
      actorId: 'u1',
      action: 'api_key.created',
      resourceId: 'k1',
    };
    await emitter.emit(event);
    now += 5_000;
    const second = await emitter.emit(event);
    expect(second.delivered).toBe(true);
    expect(second.deduplicated).toBe(false);
  });

  it('respects an explicit caller-supplied idempotency key', async () => {
    const emitter = createAuditEmitter({ mode: 'stub' });
    const a = await emitter.emit({
      tenantId: 't1',
      actorId: 'u1',
      action: 'api_key.created',
      idempotencyKey: 'caller-supplied',
    });
    const b = await emitter.emit({
      tenantId: 't1',
      actorId: 'u1',
      action: 'api_key.rotated', // different action
      idempotencyKey: 'caller-supplied',
    });
    expect(a.delivered).toBe(true);
    expect(b.deduplicated).toBe(true); // same key -> still treated as dup
    expect(a.idempotencyKey).toBe('caller-supplied');
  });

  it('warns when action is not in the canonical taxonomy', async () => {
    const emitter = createAuditEmitter({ mode: 'stub' });
    const result = await emitter.emit({
      tenantId: 't1',
      actorId: 'u1',
      action: 'foo.bar.baz',
    });
    expect(result.delivered).toBe(true);
    expect(result.warning).toMatch(/canonical taxonomy/);
  });

  it('does not warn for canonical actions', async () => {
    const emitter = createAuditEmitter({ mode: 'stub' });
    const result = await emitter.emit({
      tenantId: 't1',
      actorId: 'u1',
      action: 'api_key.created',
    });
    expect(result.warning).toBeUndefined();
  });

  it('reset() clears buffer + dedup map', async () => {
    const emitter = createAuditEmitter({ mode: 'stub' });
    await emitter.emit({ tenantId: 't1', actorId: 'u1', action: 'api_key.created' });
    expect(emitter.recent?.()).toHaveLength(1);
    emitter.reset?.();
    expect(emitter.recent?.()).toHaveLength(0);
    const second = await emitter.emit({
      tenantId: 't1',
      actorId: 'u1',
      action: 'api_key.created',
    });
    expect(second.delivered).toBe(true);
  });

  it('rolls the buffer once it exceeds bufferSize', async () => {
    const emitter = createAuditEmitter({ mode: 'stub', bufferSize: 3 });
    for (let i = 0; i < 5; i++) {
      await emitter.emit({
        tenantId: 't1',
        actorId: 'u1',
        action: 'api_key.created',
        resourceId: `k${i}`,
      });
    }
    const recent = emitter.recent?.();
    expect(recent).toHaveLength(3);
    expect(recent?.map((e) => e.resourceId)).toEqual(['k2', 'k3', 'k4']);
  });
});
