import { describe, expect, it } from 'vitest';
import { EVENT_TYPES, buildEnvelope, isCanonicalEventType } from '../src/envelope.js';

describe('webhooks envelope', () => {
  it('exposes the v0 canonical event taxonomy', () => {
    expect(EVENT_TYPES).toContain('question.released');
    expect(EVENT_TYPES).toContain('jd_forge.order.created');
    expect(EVENT_TYPES).toContain('stack_vault.question.released');
    expect(EVENT_TYPES).toContain('leak.detected');
    expect(EVENT_TYPES).toContain('audit.export_requested');
  });

  it('isCanonicalEventType recognises canonical types and rejects others', () => {
    expect(isCanonicalEventType('question.released')).toBe(true);
    expect(isCanonicalEventType('made.up.event')).toBe(false);
  });

  it('builds an envelope with id + timestamp + data + tenant context', () => {
    const env = buildEnvelope({
      id: 'evt-fixed',
      eventType: 'question.released',
      tenantId: '11111111-2222-3333-4444-555555555555',
      data: { id: 'q_1' },
      timestamp: '2026-05-01T12:00:00.000Z',
    });
    expect(env.event_type).toBe('question.released');
    expect(env.tenant_id).toBe('11111111-2222-3333-4444-555555555555');
    expect(env.data).toEqual({ id: 'q_1' });
    expect(env.id).toBe('evt-fixed');
    expect(env.idempotency_key).toBe('evt-fixed');
    expect(env.timestamp).toBe('2026-05-01T12:00:00.000Z');
  });

  it('uses the injected clock when no explicit timestamp is provided', () => {
    const env = buildEnvelope({
      id: 'evt-2',
      eventType: 'leak.detected',
      tenantId: '11111111-2222-3333-4444-555555555555',
      data: {},
      now: () => new Date('2026-05-01T13:00:00.000Z'),
    });
    expect(env.timestamp).toBe('2026-05-01T13:00:00.000Z');
  });
});
