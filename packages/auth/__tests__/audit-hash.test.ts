import { describe, expect, it } from 'vitest';
import {
  canonicalAuditEventJson,
  computeAuditHash,
  verifyAuditChain,
  type ChainEvent,
  type HashableAuditEvent,
} from '../src/audit-hash.js';

describe('canonicalAuditEventJson', () => {
  const base: HashableAuditEvent = {
    actor_type: 'user',
    actor_id: '11111111-1111-1111-1111-111111111111',
    tenant_id: 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa',
    event_type: 'leak.dismissed',
    entity_type: 'leak_alerts',
    entity_id: 'r-1',
    changes: { before: { foo: 1 }, after: { foo: 2 } },
    payload: { question_id: 'q-1', notes: 'dupe' },
    ip_address: '203.0.113.10',
    user_agent: 'vitest/1.0',
  };

  it('produces a stable byte sequence regardless of input key order', () => {
    const reordered: HashableAuditEvent = {
      user_agent: base.user_agent,
      ip_address: base.ip_address,
      payload: { notes: 'dupe', question_id: 'q-1' }, // keys reversed
      changes: { after: { foo: 2 }, before: { foo: 1 } },
      entity_id: base.entity_id,
      entity_type: base.entity_type,
      event_type: base.event_type,
      tenant_id: base.tenant_id,
      actor_id: base.actor_id,
      actor_type: base.actor_type,
    };
    expect(canonicalAuditEventJson(reordered)).toBe(canonicalAuditEventJson(base));
  });

  it('treats absent + explicit-null fields the same', () => {
    const explicit: HashableAuditEvent = { ...base, user_agent: null };
    const omitted: HashableAuditEvent = { ...base };
    delete (omitted as { user_agent?: string | null }).user_agent;
    expect(canonicalAuditEventJson(explicit)).toBe(canonicalAuditEventJson(omitted));
  });

  it('does not include occurred_at, hash_current, or hash_previous', () => {
    const json = canonicalAuditEventJson(base);
    expect(json).not.toContain('occurred_at');
    expect(json).not.toContain('hash_current');
    expect(json).not.toContain('hash_previous');
  });
});

describe('computeAuditHash', () => {
  it('returns 64-char lowercase hex', () => {
    const h = computeAuditHash({
      actor_type: 'user',
      event_type: 'auth.login',
    });
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is deterministic across calls', () => {
    const ev: HashableAuditEvent = {
      actor_type: 'user',
      actor_id: 'a',
      tenant_id: 't',
      event_type: 'x.y',
      payload: { k: 'v' },
    };
    expect(computeAuditHash(ev)).toBe(computeAuditHash(ev));
  });

  it('changes when any participating field changes', () => {
    const a: HashableAuditEvent = { actor_type: 'user', event_type: 'auth.login' };
    const b: HashableAuditEvent = { actor_type: 'user', event_type: 'auth.logout' };
    expect(computeAuditHash(a)).not.toBe(computeAuditHash(b));
  });

  it('is unaffected by JS property-iteration order', () => {
    const a: HashableAuditEvent = {
      actor_type: 'user',
      tenant_id: 't',
      payload: { z: 1, a: 2 },
      event_type: 'x',
    };
    const b: HashableAuditEvent = {
      payload: { a: 2, z: 1 },
      event_type: 'x',
      tenant_id: 't',
      actor_type: 'user',
    };
    expect(computeAuditHash(a)).toBe(computeAuditHash(b));
  });
});

describe('verifyAuditChain', () => {
  function event(
    id: string,
    hash_current: string | null,
    hash_previous: string | null,
  ): ChainEvent {
    return { id, hash_current, hash_previous };
  }

  it('returns valid for a single event', () => {
    const r = verifyAuditChain([event('a', 'h1', null)]);
    expect(r.valid).toBe(true);
    expect(r.total).toBe(1);
    expect(r.breaks).toHaveLength(0);
  });

  it('returns valid for a fully linked chain', () => {
    const chain = [event('a', 'h1', null), event('b', 'h2', 'h1'), event('c', 'h3', 'h2')];
    const r = verifyAuditChain(chain);
    expect(r.valid).toBe(true);
    expect(r.unmaterialized).toBe(0);
  });

  it('flags a break when hash_previous mismatches predecessor hash_current', () => {
    const chain = [event('a', 'h1', null), event('b', 'h2', 'tampered'), event('c', 'h3', 'h2')];
    const r = verifyAuditChain(chain);
    expect(r.valid).toBe(false);
    expect(r.breaks).toHaveLength(1);
    expect(r.breaks[0]).toMatchObject({ id: 'b', expected: 'h1', actual: 'tampered' });
  });

  it('counts unmaterialized rows separately and does not fail the chain', () => {
    const chain = [
      event('a', 'h1', null),
      event('b', 'h2', null), // unmaterialized
      event('c', 'h3', 'h2'),
    ];
    const r = verifyAuditChain(chain);
    expect(r.valid).toBe(true);
    expect(r.unmaterialized).toBe(1);
    expect(r.breaks).toHaveLength(0);
  });

  it('counts as unmaterialized when predecessor lacks hash_current', () => {
    const chain = [event('a', null, null), event('b', 'h2', null), event('c', 'h3', 'h2')];
    const r = verifyAuditChain(chain);
    expect(r.valid).toBe(true);
    expect(r.unmaterialized).toBe(1);
  });
});
