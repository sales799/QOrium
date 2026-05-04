import { describe, expect, it } from 'vitest';
import { canonicalJson, deriveIdempotencyKey, type IdempotencyInput } from '../src/idempotency';

describe('canonicalJson', () => {
  it('sorts object keys recursively', () => {
    const a = canonicalJson({ b: 2, a: 1, c: { z: 3, y: 2, x: 1 } });
    const b = canonicalJson({ a: 1, b: 2, c: { x: 1, y: 2, z: 3 } });
    expect(a).toBe(b);
    expect(a).toBe('{"a":1,"b":2,"c":{"x":1,"y":2,"z":3}}');
  });

  it('preserves array element order', () => {
    expect(canonicalJson([3, 1, 2])).toBe('[3,1,2]');
  });

  it('serialises null + undefined consistently', () => {
    expect(canonicalJson(null)).toBe('null');
    expect(canonicalJson(undefined)).toBe('null');
  });

  it('drops undefined object values (not array)', () => {
    expect(canonicalJson({ a: 1, b: undefined })).toBe('{"a":1}');
    expect(canonicalJson([1, undefined, 3])).toBe('[1,null,3]');
  });

  it('handles strings + numbers + booleans', () => {
    expect(canonicalJson('hi')).toBe('"hi"');
    expect(canonicalJson(42)).toBe('42');
    expect(canonicalJson(true)).toBe('true');
  });
});

describe('deriveIdempotencyKey', () => {
  const base: IdempotencyInput = {
    tenantId: 't1',
    actorId: 'u1',
    action: 'api_key.created',
    resourceId: 'k1',
    payload: { name: 'admin key' },
  };

  it('produces a stable sha256 key', () => {
    const k1 = deriveIdempotencyKey(base);
    const k2 = deriveIdempotencyKey({ ...base });
    expect(k1).toBe(k2);
    expect(k1.startsWith('sha256:')).toBe(true);
    expect(k1.length).toBe('sha256:'.length + 64);
  });

  it('changes when any field changes', () => {
    const k1 = deriveIdempotencyKey(base);
    expect(deriveIdempotencyKey({ ...base, action: 'api_key.rotated' })).not.toBe(k1);
    expect(deriveIdempotencyKey({ ...base, resourceId: 'k2' })).not.toBe(k1);
    expect(deriveIdempotencyKey({ ...base, payload: { name: 'other' } })).not.toBe(k1);
    expect(deriveIdempotencyKey({ ...base, tenantId: 't2' })).not.toBe(k1);
  });

  it('is insensitive to payload key ordering', () => {
    const k1 = deriveIdempotencyKey({ ...base, payload: { a: 1, b: 2 } });
    const k2 = deriveIdempotencyKey({ ...base, payload: { b: 2, a: 1 } });
    expect(k1).toBe(k2);
  });

  it('respects bucket window so same window collapses', () => {
    const t = 1700000000000;
    const k1 = deriveIdempotencyKey({ ...base, windowMs: 60_000, occurredAt: t });
    const k2 = deriveIdempotencyKey({ ...base, windowMs: 60_000, occurredAt: t + 30_000 });
    const k3 = deriveIdempotencyKey({ ...base, windowMs: 60_000, occurredAt: t + 90_000 });
    expect(k1).toBe(k2);
    expect(k1).not.toBe(k3);
  });
});
