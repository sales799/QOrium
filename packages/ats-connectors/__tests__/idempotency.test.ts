import { describe, expect, it } from 'vitest';
import { InMemoryIdempotencyCache, deriveIdempotencyKey } from '../src/idempotency';

describe('deriveIdempotencyKey', () => {
  it('uses the Idempotency-Key header when present', () => {
    const key = deriveIdempotencyKey({
      platform: 'greenhouse',
      rawBody: Buffer.from('hello'),
      headers: { 'idempotency-key': 'evt-123' },
    });
    expect(key).toBe('hdr:idempotency-key:evt-123');
  });

  it('falls back to x-greenhouse-event when Idempotency-Key is absent', () => {
    const key = deriveIdempotencyKey({
      platform: 'greenhouse',
      rawBody: Buffer.from('hello'),
      headers: { 'x-greenhouse-event': 'evt-456' },
    });
    expect(key).toBe('hdr:x-greenhouse-event:evt-456');
  });

  it('synthesises a body-hash key when no header is present', () => {
    const now = () => new Date('2026-05-03T10:00:00Z');
    const a = deriveIdempotencyKey({
      platform: 'ashby',
      rawBody: Buffer.from('payload'),
      headers: {},
      now,
    });
    const b = deriveIdempotencyKey({
      platform: 'ashby',
      rawBody: Buffer.from('payload'),
      headers: {},
      now,
    });
    expect(a).toBe(b);
    expect(a).toMatch(/^body:[0-9a-f]{64}$/);
  });

  it('different bodies yield different synthesised keys', () => {
    const now = () => new Date('2026-05-03T10:00:00Z');
    const a = deriveIdempotencyKey({
      platform: 'ashby',
      rawBody: Buffer.from('alpha'),
      headers: {},
      now,
    });
    const b = deriveIdempotencyKey({
      platform: 'ashby',
      rawBody: Buffer.from('beta'),
      headers: {},
      now,
    });
    expect(a).not.toBe(b);
  });

  it('handles array-shaped header values', () => {
    const key = deriveIdempotencyKey({
      platform: 'greenhouse',
      rawBody: Buffer.from('hello'),
      headers: { 'idempotency-key': ['evt-array'] },
    });
    expect(key).toBe('hdr:idempotency-key:evt-array');
  });
});

describe('InMemoryIdempotencyCache', () => {
  it('records new keys and rejects duplicates', () => {
    const cache = new InMemoryIdempotencyCache();
    expect(cache.recordIfNew('a')).toBe(true);
    expect(cache.recordIfNew('a')).toBe(false);
    expect(cache.has('a')).toBe(true);
  });

  it('evicts entries past the TTL', () => {
    const cache = new InMemoryIdempotencyCache(1_000); // 1 s TTL
    let t = 0;
    const now = () => new Date(t);
    expect(cache.recordIfNew('a', now)).toBe(true);
    t = 5_000;
    expect(cache.has('a', now)).toBe(false);
  });

  it('returns the size of the cache', () => {
    const cache = new InMemoryIdempotencyCache();
    cache.recordIfNew('a');
    cache.recordIfNew('b');
    expect(cache.size()).toBe(2);
  });
});
