import { describe, expect, it } from 'vitest';
import {
  computeBillingOverview,
  BILLING_STATUSES,
  type StatusCountRow,
  type TierCountRow,
  type ProviderCountRow,
} from '../src/lib/billing-overview.js';

describe('computeBillingOverview', () => {
  it('0-fills every status bucket with empty input', () => {
    const r = computeBillingOverview('razorpay', [], [], []);
    expect(r.active_provider).toBe('razorpay');
    expect(r.total).toBe(0);
    expect(r.live_subscriptions).toBe(0);
    expect(Object.keys(r.by_status).sort()).toEqual([...BILLING_STATUSES].sort());
    for (const s of BILLING_STATUSES) expect(r.by_status[s]).toBe(0);
    expect(r.by_tier).toEqual({});
    expect(r.by_provider).toEqual({});
  });

  it('aggregates status counts and computes total + live (trial+active)', () => {
    const status: StatusCountRow[] = [
      { status: 'trial', count: 3 },
      { status: 'active', count: 5 },
      { status: 'past_due', count: 2 },
      { status: 'canceled', count: 4 },
      { status: 'paused', count: 1 },
    ];
    const r = computeBillingOverview('cashfree', status, [], []);
    expect(r.total).toBe(15);
    expect(r.live_subscriptions).toBe(8);
    expect(r.by_status.trial).toBe(3);
    expect(r.by_status.active).toBe(5);
  });

  it('ignores unknown status values (total stays over the five known buckets)', () => {
    const status: StatusCountRow[] = [
      { status: 'active', count: 2 },
      { status: 'bogus', count: 99 },
    ];
    const r = computeBillingOverview('razorpay', status, [], []);
    expect(r.total).toBe(2);
    expect(r.by_status.active).toBe(2);
    expect((r.by_status as Record<string, number>).bogus).toBeUndefined();
  });

  it('builds dynamic tier and provider maps, folding blanks into unknown', () => {
    const tier: TierCountRow[] = [
      { tier: 'growth', count: 4 },
      { tier: 'scale', count: 2 },
      { tier: '', count: 1 },
    ];
    const provider: ProviderCountRow[] = [
      { provider: 'razorpay', count: 5 },
      { provider: 'cashfree', count: 2 },
    ];
    const r = computeBillingOverview('cashfree', [], tier, provider);
    expect(r.by_tier).toEqual({ growth: 4, scale: 2, unknown: 1 });
    expect(r.by_provider).toEqual({ razorpay: 5, cashfree: 2 });
  });

  it('reflects the active provider env switch razorpay <-> cashfree', () => {
    expect(computeBillingOverview('razorpay', [], [], []).active_provider).toBe('razorpay');
    expect(computeBillingOverview('cashfree', [], [], []).active_provider).toBe('cashfree');
  });
});
