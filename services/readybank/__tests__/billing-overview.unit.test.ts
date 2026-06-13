import { describe, expect, it } from 'vitest';
import {
  computeBillingOverview,
  BILLING_STATUSES,
  type StatusCountRow,
  type TierCountRow,
  type ProviderCountRow,
  type CurrencyCountRow,
  type LiveAmountRow,
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
    // New N8 fields default to empty maps when no currency/amount rows are given.
    expect(r.by_currency).toEqual({});
    expect(r.estimated_mrr_cents).toEqual({});
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

  it('builds a currency count map, upper-casing codes and folding blanks into unknown', () => {
    const currency: CurrencyCountRow[] = [
      { currency: 'inr', count: 7 },
      { currency: 'USD', count: 2 },
      { currency: '', count: 1 },
    ];
    const r = computeBillingOverview('razorpay', [], [], [], currency);
    expect(r.by_currency).toEqual({ INR: 7, USD: 2, UNKNOWN: 1 });
  });

  it('normalises committed amounts to a monthly MRR estimate per currency by cycle', () => {
    const live: LiveAmountRow[] = [
      // 2 monthly subs at 499900 paise each -> 999800/mo
      { currency: 'INR', billing_cycle: 'monthly', unit_amount_cents: 999800, count: 1 },
      // 1 annual sub at 1200000 paise -> 100000/mo
      { currency: 'INR', billing_cycle: 'annual', unit_amount_cents: 1200000, count: 1 },
      // 1 quarterly USD sub at 30000 cents -> 10000/mo
      { currency: 'usd', billing_cycle: 'quarterly', unit_amount_cents: 30000, count: 1 },
    ];
    const r = computeBillingOverview('razorpay', [], [], [], [], live);
    expect(r.estimated_mrr_cents).toEqual({ INR: 1099800, USD: 10000 });
  });

  it('excludes usage-cycle and unknown-cycle rows from the MRR estimate', () => {
    const live: LiveAmountRow[] = [
      { currency: 'INR', billing_cycle: 'monthly', unit_amount_cents: 50000, count: 1 },
      { currency: 'INR', billing_cycle: 'usage', unit_amount_cents: 999999, count: 1 },
      { currency: 'INR', billing_cycle: 'weekly', unit_amount_cents: 999999, count: 1 },
    ];
    const r = computeBillingOverview('cashfree', [], [], [], [], live);
    expect(r.estimated_mrr_cents).toEqual({ INR: 50000 });
  });
});
