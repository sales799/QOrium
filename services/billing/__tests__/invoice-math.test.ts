import { describe, expect, it } from 'vitest';
import { computeInvoice, computeLineItem, formatInvoiceNumber, prorate } from '../src/invoice-math';

describe('computeLineItem', () => {
  it('computes subtotal + tax + total for an 18% GST line', () => {
    const out = computeLineItem({
      description: 'ReadyBank Tier 2',
      quantity: 1,
      unitAmountCents: 10_000_000, // ₹1,00,000 in paise
      taxRateBps: 1800,
    });
    expect(out.subtotalCents).toBe(10_000_000);
    expect(out.taxAmountCents).toBe(1_800_000); // ₹18,000 GST
    expect(out.totalCents).toBe(11_800_000);
    expect(out.type).toBe('recurring');
  });

  it('handles zero tax', () => {
    const out = computeLineItem({
      description: 'discount',
      quantity: 1,
      unitAmountCents: -5000,
      taxRateBps: 0,
      type: 'discount',
    });
    expect(Object.is(out.taxAmountCents, 0) || Object.is(out.taxAmountCents, -0)).toBe(true);
    expect(out.totalCents).toBe(-5000);
  });

  it('rounds tax to nearest paise', () => {
    const out = computeLineItem({
      description: 'JD Forge',
      quantity: 1,
      unitAmountCents: 4900, // ₹49 in paise
      taxRateBps: 1800,
    });
    expect(out.taxAmountCents).toBe(882); // 49 × 18 / 100 = 8.82 → 882 paise
    expect(out.totalCents).toBe(5782);
  });

  it('throws on negative quantity', () => {
    expect(() =>
      computeLineItem({
        description: 'x',
        quantity: -1,
        unitAmountCents: 100,
        taxRateBps: 0,
      }),
    ).toThrow();
  });

  it('throws on out-of-range tax rate', () => {
    expect(() =>
      computeLineItem({
        description: 'x',
        quantity: 1,
        unitAmountCents: 100,
        taxRateBps: 99999,
      }),
    ).toThrow();
  });
});

describe('computeInvoice', () => {
  it('aggregates totals across multiple line items', () => {
    const out = computeInvoice([
      {
        description: 'ReadyBank annual',
        quantity: 1,
        unitAmountCents: 10_000_000,
        taxRateBps: 1800,
      },
      {
        description: 'JD Forge × 50',
        quantity: 50,
        unitAmountCents: 14_900,
        taxRateBps: 1800,
      },
    ]);
    expect(out.subtotalCents).toBe(10_000_000 + 50 * 14_900);
    // Tax math: 18% on each subtotal
    expect(out.taxCents).toBe(1_800_000 + Math.round((50 * 14_900 * 1800) / 10_000));
    expect(out.totalCents).toBe(out.subtotalCents + out.taxCents);
  });

  it('treats negative line items (discounts) correctly', () => {
    const out = computeInvoice([
      { description: 'ReadyBank', quantity: 1, unitAmountCents: 100_000, taxRateBps: 1800 },
      {
        description: 'launch discount',
        quantity: 1,
        unitAmountCents: -10_000,
        taxRateBps: 0,
        type: 'discount',
      },
    ]);
    expect(out.subtotalCents).toBe(90_000);
  });
});

describe('prorate', () => {
  it('returns the full amount when 100% of period is consumed', () => {
    expect(prorate({ fullPeriodAmountCents: 12_000, fullPeriodDays: 365, consumedDays: 365 })).toBe(
      12_000,
    );
  });
  it('returns zero when period is zero days', () => {
    expect(prorate({ fullPeriodAmountCents: 12_000, fullPeriodDays: 0, consumedDays: 7 })).toBe(0);
  });
  it('rounds to the nearest paise/cent', () => {
    expect(prorate({ fullPeriodAmountCents: 10_000, fullPeriodDays: 365, consumedDays: 7 })).toBe(
      192,
    );
  });
  it('clamps consumed days to the full period', () => {
    expect(prorate({ fullPeriodAmountCents: 100, fullPeriodDays: 30, consumedDays: 60 })).toBe(100);
  });
});

describe('formatInvoiceNumber', () => {
  it('produces INV-YYYY-NNNNN', () => {
    expect(formatInvoiceNumber(new Date('2026-05-03T00:00:00Z'), 1)).toBe('INV-2026-00001');
    expect(formatInvoiceNumber(new Date('2026-12-31T23:59:00Z'), 12345)).toBe('INV-2026-12345');
  });
});
