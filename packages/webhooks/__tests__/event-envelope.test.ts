import { describe, expect, it } from 'vitest';
import { KNOWN_EVENT_TYPES, buildEventEnvelope, isValidEventType } from '../src/event-envelope.js';

describe('buildEventEnvelope', () => {
  it('applies the evt_ prefix when missing', () => {
    const env = buildEventEnvelope({
      id: '1a2b3c4d5e6f7g8h9i0j',
      event_type: 'question.released',
      tenant_id: 'ten_abc',
      data: { q: 1 },
    });
    expect(env.id).toBe('evt_1a2b3c4d5e6f7g8h9i0j');
    expect(env.idempotency_key).toBe(env.id);
  });

  it('keeps an already-prefixed id intact', () => {
    const env = buildEventEnvelope({
      id: 'evt_x',
      event_type: 'q.r',
      tenant_id: 't',
      data: {},
    });
    expect(env.id).toBe('evt_x');
  });

  it('uses provided occurred_at when present', () => {
    const env = buildEventEnvelope({
      id: 'x',
      event_type: 'q.r',
      tenant_id: 't',
      data: {},
      occurred_at: '2026-05-09T00:00:00.000Z',
    });
    expect(env.timestamp).toBe('2026-05-09T00:00:00.000Z');
  });

  it('defaults aggregate_id to null', () => {
    const env = buildEventEnvelope({
      id: 'x',
      event_type: 'q.r',
      tenant_id: 't',
      data: {},
    });
    expect(env.aggregate_id).toBeNull();
  });

  it('idempotency_key always equals id', () => {
    const env = buildEventEnvelope({
      id: 'evt_unique',
      event_type: 'q.r',
      tenant_id: 't',
      data: {},
    });
    expect(env.idempotency_key).toBe(env.id);
  });
});

describe('isValidEventType', () => {
  it('accepts every catalog entry', () => {
    for (const t of KNOWN_EVENT_TYPES) {
      expect(isValidEventType(t)).toBe(true);
    }
  });

  it('accepts well-formed unknown types (open extension)', () => {
    expect(isValidEventType('billing.invoice.paid')).toBe(true);
    expect(isValidEventType('foo.bar.baz_qux')).toBe(true);
  });

  it('rejects non-conforming types', () => {
    expect(isValidEventType('NOT-allowed')).toBe(false); // uppercase + hyphen
    expect(isValidEventType('no-dot')).toBe(false); // no dot separator
    expect(isValidEventType('.leading')).toBe(false);
    expect(isValidEventType('trailing.')).toBe(false);
    expect(isValidEventType('a..b')).toBe(false); // empty segment
  });

  it('rejects oversize types', () => {
    const tooLong = `a.${'x'.repeat(63)}`;
    expect(tooLong.length).toBeGreaterThan(64);
    expect(isValidEventType(tooLong)).toBe(false);
  });

  it('catalog has 15 events covering 4 source domains', () => {
    expect(KNOWN_EVENT_TYPES.length).toBe(15);
    expect(KNOWN_EVENT_TYPES.filter((t) => t.startsWith('question.'))).toHaveLength(3);
    expect(KNOWN_EVENT_TYPES.filter((t) => t.startsWith('jd_forge.'))).toHaveLength(4);
    expect(KNOWN_EVENT_TYPES.filter((t) => t.startsWith('stack_vault.'))).toHaveLength(5);
  });
});
