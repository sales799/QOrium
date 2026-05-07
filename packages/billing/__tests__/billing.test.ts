import { describe, expect, it } from 'vitest';
import {
  ALL_PRICES,
  DEFAULT_GST_RATE,
  applyRate,
  buildInvoice,
  computeGst,
  defaultCurrencyForCountry,
  findPrice,
  formatMoney,
  money,
  moneyMinor,
  multiply,
  renderInvoicePlain,
  SAC_BY_SKU,
  sacForSku,
  stateName,
  sumMoney,
  validateAgainstFloor,
  validateGstin,
} from '../src/index.js';
import type { BuyerProfile, SellerProfile } from '../src/index.js';

const TALPRO_SELLER: SellerProfile = {
  country: 'IN',
  stateCode: '29', // Karnataka
  gstin: '29AABCT1234A1Z5',
  legalName: 'Talpro Universe Pvt Ltd',
};

const KARNATAKA_BUYER: BuyerProfile = {
  country: 'IN',
  stateCode: '29',
  gstin: '29AABCB5678D1Z3',
};

const MAHARASHTRA_BUYER: BuyerProfile = {
  country: 'IN',
  stateCode: '27',
  gstin: '27AABCB1111E1Z5',
};

const US_BUYER: BuyerProfile = {
  country: 'US',
};

describe('currency math', () => {
  it('builds and multiplies INR money in paise', () => {
    const m = money(100, 'INR');
    expect(m.amount).toBe(10_000n);
    const mul = multiply(m, 5);
    expect(mul.amount).toBe(50_000n);
  });

  it('rejects negative amounts and non-integer quantities', () => {
    expect(() => money(-1, 'INR')).toThrow();
    expect(() => moneyMinor(-100, 'USD')).toThrow();
    expect(() => multiply(money(10, 'USD'), 1.5)).toThrow();
    expect(() => multiply(money(10, 'USD'), -1)).toThrow();
  });

  it('sums money but rejects mixed currencies', () => {
    const a = money(50, 'INR');
    const b = money(100, 'INR');
    expect(sumMoney([a, b]).amount).toBe(15_000n);
    expect(() => sumMoney([money(50, 'INR'), money(50, 'USD')])).toThrow();
  });

  it('formats INR using lakh notation and USD using comma notation', () => {
    expect(formatMoney(money(100_000, 'INR'))).toContain('₹');
    expect(formatMoney(money(50_000, 'USD'))).toContain('$');
  });

  it('applies a percentage rate with banker rounding', () => {
    const m = money(100, 'INR');
    // 18% of ₹100 = ₹18 = 1800 paise
    expect(applyRate(m, 0.18).amount).toBe(1_800n);
    // 0% returns 0
    expect(applyRate(m, 0).amount).toBe(0n);
  });

  it('handles a half-paise round case stably', () => {
    // ₹0.05 (5 paise) at 50% = 2.5 paise → banker rounds to 2
    const m = moneyMinor(5, 'INR');
    const out = applyRate(m, 0.5);
    expect(out.amount).toBe(2n);
  });
});

describe('SKU pricing', () => {
  it('exposes the full canonical pricing table', () => {
    expect(ALL_PRICES.length).toBeGreaterThan(0);
    for (const p of ALL_PRICES) {
      expect(p.unitPrice.amount).toBeGreaterThan(0n);
      expect(p.description.length).toBeGreaterThan(0);
    }
  });

  it('finds Recruiter Solo at ₹4,999/mo', () => {
    const e = findPrice('readybank', 'recruiter-solo')!;
    expect(e.unitPrice.amount).toBe(499_900n); // 4,999 INR = 499,900 paise
    expect(e.cycle).toBe('monthly');
  });

  it('finds Stack-Vault Group with the ₹35L floor', () => {
    const e = findPrice('stack-vault', 'group')!;
    // ₹1Cr = 10,000,000 INR = 1,000,000,000 paise
    expect(e.unitPrice.amount).toBe(1_000_000_000n);
    // ₹35L = 3,500,000 INR = 350,000,000 paise
    expect(e.floor?.amount).toBe(350_000_000n);
  });

  it('validates against floor', () => {
    const e = findPrice('stack-vault', 'group')!;
    const tooLow = money(2_000_000, 'INR'); // ₹20L < ₹35L floor
    expect(validateAgainstFloor(tooLow, e)).toContain('below floor');
    const ok = money(5_000_000, 'INR'); // ₹50L > floor
    expect(validateAgainstFloor(ok, e)).toBeNull();
  });

  it('returns undefined for unknown sku/tier', () => {
    // @ts-expect-error — tier not in union
    expect(findPrice('readybank', 'recruiter-bogus')).toBeUndefined();
  });

  it('default currency by country', () => {
    expect(defaultCurrencyForCountry('IN')).toBe('INR');
    expect(defaultCurrencyForCountry('US')).toBe('USD');
    expect(defaultCurrencyForCountry('uk')).toBe('USD');
  });
});

describe('GST', () => {
  it('uses 18% as the default rate', () => {
    expect(DEFAULT_GST_RATE).toBe(0.18);
  });

  it('intra-state: splits into CGST 9 + SGST 9', () => {
    const taxable = money(100_000, 'INR'); // ₹1L = 1Cr paise … wait no, ₹1L = 100,000 INR = 10,000,000 paise
    const out = computeGst(taxable, KARNATAKA_BUYER, TALPRO_SELLER);
    expect(out.scheme).toBe('intra-state');
    // 9% of ₹1L = ₹9000 = 900,000 paise. Total ₹18,000 = 1,800,000 paise.
    expect(out.cgst).toBe(900_000n);
    expect(out.sgst).toBe(900_000n);
    expect(out.igst).toBe(0n);
    expect(out.totalTax).toBe(1_800_000n);
    expect(out.totalRate).toBe(0.18);
  });

  it('inter-state: emits IGST', () => {
    const taxable = money(100_000, 'INR');
    const out = computeGst(taxable, MAHARASHTRA_BUYER, TALPRO_SELLER);
    expect(out.scheme).toBe('inter-state');
    expect(out.cgst).toBe(0n);
    expect(out.sgst).toBe(0n);
    expect(out.igst).toBe(1_800_000n);
    expect(out.totalTax).toBe(1_800_000n);
  });

  it('export of services in foreign currency is zero-rated', () => {
    const taxable = money(50_000, 'USD');
    const out = computeGst(taxable, US_BUYER, TALPRO_SELLER);
    expect(out.scheme).toBe('export-zero-rated');
    expect(out.totalTax).toBe(0n);
  });

  it('non-India buyer in INR (or with zeroRateExports off) charges IGST', () => {
    const taxable = money(50_000, 'USD');
    const out = computeGst(taxable, US_BUYER, TALPRO_SELLER, { zeroRateExports: false });
    expect(out.scheme).toBe('non-india');
    expect(out.igst).toBeGreaterThan(0n);
  });

  it('respects an explicit rate override', () => {
    const out = computeGst(money(10_000, 'INR'), MAHARASHTRA_BUYER, TALPRO_SELLER, {
      rate: 0.05,
    });
    expect(out.totalRate).toBe(0.05);
    expect(out.igst).toBe(50_000n); // 5% of ₹10K = ₹500 = 50,000 paise
  });
});

describe('GSTIN validation', () => {
  it('accepts a structurally valid GSTIN', () => {
    const out = validateGstin('29AABCT1234A1Z5');
    expect(out.valid).toBe(true);
    expect(out.stateCode).toBe('29');
    expect(out.pan).toBe('AABCT1234A');
  });

  it('rejects wrong length', () => {
    expect(validateGstin('29AABCT1234A1Z').valid).toBe(false); // 14 chars
    expect(validateGstin('29AABCT1234A1Z5X').valid).toBe(false); // 16
  });

  it('rejects malformed PAN portion', () => {
    expect(validateGstin('29ABCDEF234A1Z5').valid).toBe(false); // PAN block wrong
  });

  it('lowercases are normalized', () => {
    expect(validateGstin('29aabct1234a1z5').valid).toBe(true);
  });
});

describe('state codes', () => {
  it('looks up named states', () => {
    expect(stateName('29')).toBe('Karnataka');
    expect(stateName('27')).toBe('Maharashtra');
    expect(stateName('07')).toBe('Delhi');
    expect(stateName('99')).toBeUndefined();
  });
});

describe('SAC mapping', () => {
  it('emits a 6-digit SAC for every SKU', () => {
    for (const sku of ['readybank', 'jd-forge', 'stack-vault'] as const) {
      const sac = sacForSku(sku);
      expect(sac.code).toMatch(/^\d{6}$/);
      expect(sac.verification).toBe('pending');
    }
  });

  it('stays consistent across access patterns', () => {
    expect(SAC_BY_SKU['readybank'].code).toBe(sacForSku('readybank').code);
  });
});

describe('buildInvoice', () => {
  it('builds a single-line intra-state INR invoice with CGST+SGST', () => {
    const result = buildInvoice({
      buyer: KARNATAKA_BUYER,
      seller: TALPRO_SELLER,
      lines: [{ sku: 'readybank', tier: 'recruiter-team', quantity: 12 }],
    });
    expect(result.totals.currency).toBe('INR');
    expect(result.totals.scheme).toBe('intra-state');
    // 12 × ₹19,999 = ₹2,39,988 = 23,998,800 paise
    expect(result.totals.subtotal).toBe(23_998_800n);
    // Tax = 18% of ₹2,39,988 = ₹43,197.84 → rounded
    expect(result.totals.totalTax).toBeGreaterThan(0n);
    expect(result.totals.grandTotal).toBe(result.totals.subtotal + result.totals.totalTax);
    const line = result.totals.lines[0]!;
    expect(line.tax.cgst).toBeGreaterThan(0n);
    expect(line.tax.sgst).toBeGreaterThan(0n);
    expect(line.tax.igst).toBe(0n);
  });

  it('builds an export-zero-rated USD invoice for a US buyer', () => {
    const result = buildInvoice({
      buyer: US_BUYER,
      seller: TALPRO_SELLER,
      lines: [{ sku: 'readybank', tier: 'platform-growth', quantity: 1 }],
    });
    expect(result.totals.currency).toBe('USD');
    expect(result.totals.scheme).toBe('export-zero-rated');
    expect(result.totals.totalTax).toBe(0n);
    // $150,000 = 15,000,000 cents
    expect(result.totals.grandTotal).toBe(15_000_000n);
  });

  it('emits a warning when an explicit unit price falls below floor', () => {
    const result = buildInvoice({
      buyer: KARNATAKA_BUYER,
      seller: TALPRO_SELLER,
      lines: [
        {
          sku: 'stack-vault',
          tier: 'group',
          quantity: 1,
          unitPrice: money(2_000_000, 'INR'), // ₹20L < ₹35L floor
        },
      ],
    });
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('below floor');
  });

  it('rejects mixed-currency lines on a single invoice', () => {
    expect(() =>
      buildInvoice({
        buyer: US_BUYER,
        seller: TALPRO_SELLER,
        lines: [
          { sku: 'readybank', tier: 'platform-starter', quantity: 1 },
          { sku: 'readybank', tier: 'recruiter-team', quantity: 6 }, // INR
        ],
      }),
    ).toThrow(/mixed currencies/);
  });

  it('rejects unknown SKU/tier', () => {
    expect(() =>
      buildInvoice({
        buyer: KARNATAKA_BUYER,
        seller: TALPRO_SELLER,
        // @ts-expect-error — unknown tier
        lines: [{ sku: 'readybank', tier: 'bogus', quantity: 1 }],
      }),
    ).toThrow(/unknown/);
  });

  it('renders a plain-text invoice including SAC + tax breakdown', () => {
    const result = buildInvoice({
      buyer: KARNATAKA_BUYER,
      seller: TALPRO_SELLER,
      lines: [{ sku: 'readybank', tier: 'recruiter-solo', quantity: 1 }],
    });
    const text = renderInvoicePlain(result);
    expect(text).toContain('SAC 998314');
    expect(text).toContain('CGST');
    expect(text).toContain('SGST');
    expect(text).toContain('TOTAL:');
  });
});
