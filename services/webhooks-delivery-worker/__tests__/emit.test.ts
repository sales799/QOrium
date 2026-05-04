import { describe, expect, it } from 'vitest';
import {
  matchEventType,
  matchSubscriptions,
  prepareEvent,
  type SubscriptionMatch,
} from '../src/emit';

const TENANT = '11111111-2222-3333-4444-555555555555';

const sub = (eventType: string, isActive = true, tenantId = TENANT): SubscriptionMatch => ({
  id: `s-${Math.random().toString(36).slice(2, 8)}`,
  tenantId,
  eventType,
  endpointUrl: 'https://example.com/hook',
  isActive,
});

describe('matchEventType', () => {
  it('matches exact event types', () => {
    expect(matchEventType('question.released', 'question.released')).toBe(true);
    expect(matchEventType('question.released', 'question.updated')).toBe(false);
  });

  it('matches everything for the bare wildcard', () => {
    expect(matchEventType('*', 'anything.at.all')).toBe(true);
  });

  it('matches prefix wildcards', () => {
    expect(matchEventType('jd_forge.*', 'jd_forge.order.created')).toBe(true);
    expect(matchEventType('jd_forge.*', 'jd_forge')).toBe(true);
    expect(matchEventType('jd_forge.*', 'stack_vault.x')).toBe(false);
  });

  it('rejects partial prefix collisions', () => {
    expect(matchEventType('jd.*', 'jd_forge.order.created')).toBe(false);
  });
});

describe('matchSubscriptions', () => {
  const event = {
    tenantId: TENANT,
    eventType: 'jd_forge.order.created',
    payload: {},
  };

  it('returns active matches in tenant scope', () => {
    const out = matchSubscriptions(event, [
      sub('*'),
      sub('jd_forge.*'),
      sub('jd_forge.order.created'),
      sub('stack_vault.*'),
    ]);
    expect(out).toHaveLength(3);
  });

  it('skips inactive subscriptions', () => {
    const out = matchSubscriptions(event, [sub('*', false)]);
    expect(out).toHaveLength(0);
  });

  it('skips other-tenant subscriptions', () => {
    const out = matchSubscriptions(event, [sub('*', true, 'other-tenant')]);
    expect(out).toHaveLength(0);
  });
});

describe('prepareEvent', () => {
  it('attaches matches to the event', () => {
    const out = prepareEvent({ tenantId: TENANT, eventType: 'leak.detected', payload: {} }, [
      sub('*'),
      sub('leak.detected'),
      sub('question.*'),
    ]);
    expect(out.matches).toHaveLength(2);
  });
});
