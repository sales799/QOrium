import { describe, expect, it } from 'vitest';
import {
  formatMoney,
  invoiceStatusTone,
  subscriptionStatusTone,
  summariseBilling,
  type InvoiceRow,
  type SubscriptionRow,
} from '../src/lib/billing-summary';

const NOW = Date.parse('2026-05-04T12:00:00Z');

const baseInvoice = (overrides: Partial<InvoiceRow> = {}): InvoiceRow => ({
  id: 'inv-1',
  invoiceNumber: 'INV-2026-00001',
  status: 'open',
  totalCents: 14_900,
  currency: 'INR',
  dueDate: '2026-05-15T00:00:00Z',
  paidAt: null,
  issuedAt: '2026-05-01T00:00:00Z',
  ...overrides,
});

const baseSubscription = (overrides: Partial<SubscriptionRow> = {}): SubscriptionRow => ({
  id: 'sub-1',
  productKey: 'readybank_solo',
  status: 'active',
  monthlyAmountCents: 4_999_00,
  currency: 'INR',
  currentPeriodStart: '2026-05-01T00:00:00Z',
  currentPeriodEnd: '2026-05-31T23:59:59Z',
  cancelAtPeriodEnd: false,
  ...overrides,
});

describe('summariseBilling', () => {
  it('returns zeroes for empty inputs', () => {
    const summary = summariseBilling([], [], NOW);
    expect(summary.totalOutstandingCents).toBe(0);
    expect(summary.invoiceCount).toBe(0);
    expect(summary.overdueCount).toBe(0);
    expect(summary.nextDueDate).toBe(null);
    expect(summary.activeSubscriptionCount).toBe(0);
    expect(summary.monthlyRecurringCents).toBe(0);
    expect(summary.needsAttention).toBe(false);
  });

  it('sums outstanding from open + overdue invoices', () => {
    const invoices = [
      baseInvoice({ id: 'a', status: 'open', totalCents: 1_000 }),
      baseInvoice({ id: 'b', status: 'overdue', totalCents: 2_500 }),
      baseInvoice({ id: 'c', status: 'paid', totalCents: 9_999 }),
    ];
    const summary = summariseBilling(invoices, [], NOW);
    expect(summary.totalOutstandingCents).toBe(3_500);
    expect(summary.invoiceCount).toBe(3);
  });

  it('counts overdue when due date < now even if status is open', () => {
    const invoices = [baseInvoice({ status: 'open', dueDate: '2026-04-01T00:00:00Z' })];
    const summary = summariseBilling(invoices, [], NOW);
    expect(summary.overdueCount).toBe(1);
    expect(summary.needsAttention).toBe(true);
  });

  it('flags needsAttention when a subscription is past_due', () => {
    const subs = [baseSubscription({ status: 'past_due' })];
    const summary = summariseBilling([], subs, NOW);
    expect(summary.needsAttention).toBe(true);
  });

  it('next due date picks the soonest upcoming open invoice', () => {
    const invoices = [
      baseInvoice({ id: 'late', dueDate: '2026-08-01T00:00:00Z' }),
      baseInvoice({ id: 'soon', dueDate: '2026-05-15T00:00:00Z' }),
      baseInvoice({ id: 'soonest', dueDate: '2026-05-10T00:00:00Z' }),
    ];
    const summary = summariseBilling(invoices, [], NOW);
    expect(summary.nextDueDate).toBe('2026-05-10T00:00:00Z');
  });

  it('counts only active + trialing subs in monthlyRecurringCents', () => {
    const subs = [
      baseSubscription({ status: 'active', monthlyAmountCents: 5_000_00 }),
      baseSubscription({ status: 'trialing', monthlyAmountCents: 2_000_00 }),
      baseSubscription({ status: 'cancelled', monthlyAmountCents: 9_999_00 }),
      baseSubscription({ status: 'past_due', monthlyAmountCents: 1_000_00 }),
    ];
    const summary = summariseBilling([], subs, NOW);
    expect(summary.activeSubscriptionCount).toBe(2);
    expect(summary.monthlyRecurringCents).toBe(7_000_00);
  });
});

describe('formatMoney', () => {
  it('formats INR without minor units', () => {
    const out = formatMoney(14_900_00, 'INR');
    expect(out).toContain('14,900');
    expect(out).toContain('₹');
  });

  it('formats USD with two decimals', () => {
    const out = formatMoney(14_900, 'USD');
    expect(out).toContain('149');
  });
});

describe('invoiceStatusTone', () => {
  it('maps each status to a tone', () => {
    expect(invoiceStatusTone('paid')).toBe('success');
    expect(invoiceStatusTone('open')).toBe('info');
    expect(invoiceStatusTone('overdue')).toBe('danger');
    expect(invoiceStatusTone('draft')).toBe('muted');
    expect(invoiceStatusTone('void')).toBe('muted');
  });
});

describe('subscriptionStatusTone', () => {
  it('maps active → success, past_due → danger, paused → warning', () => {
    expect(subscriptionStatusTone('active')).toBe('success');
    expect(subscriptionStatusTone('past_due')).toBe('danger');
    expect(subscriptionStatusTone('paused')).toBe('warning');
  });
});
