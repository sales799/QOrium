import { describe, expect, it } from 'vitest';
import { defaultRotatorRegistry, stubRotator, webhookSubscriptionRotator } from '../src/rotators';

const stubCtx = {
  resourceKey: 'DATABASE_URL_PROD',
  resourceType: 'database_url',
  metadata: {},
  pool: {} as never,
};

describe('stubRotator', () => {
  it('returns ok=true and a future due date', async () => {
    const rotator = stubRotator(90);
    const out = await rotator(stubCtx);
    expect(out.ok).toBe(true);
    expect(out.newDueDate.getTime()).toBeGreaterThan(Date.now());
    expect(out.message).toMatch(/stub/);
  });
});

describe('webhookSubscriptionRotator', () => {
  it('returns ok=false without an admin token', async () => {
    const rotator = webhookSubscriptionRotator(180);
    const out = await rotator(stubCtx);
    expect(out.ok).toBe(false);
    expect(out.message).toMatch(/WEBHOOKS_ADMIN_TOKEN/);
  });

  it('returns ok=true when token provided (placeholder live impl)', async () => {
    const rotator = webhookSubscriptionRotator(180, { adminToken: 'tok-1' });
    const out = await rotator(stubCtx);
    expect(out.ok).toBe(true);
  });
});

describe('defaultRotatorRegistry', () => {
  it('has rotators for every default resource type', () => {
    const reg = defaultRotatorRegistry({
      policyDays: { database_url: 90, api_key: 180, webhook_subscription_secret: 180 },
    });
    expect(reg.has('database_url')).toBe(true);
    expect(reg.has('api_key')).toBe(true);
    expect(reg.has('webhook_subscription_secret')).toBe(true);
    expect(reg.has('made-up')).toBe(false);
  });

  it('throws on unknown resource type', () => {
    const reg = defaultRotatorRegistry({ policyDays: { database_url: 90 } });
    expect(() => reg.get('unknown')).toThrow();
  });
});
