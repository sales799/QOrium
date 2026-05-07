import type { Currency, Money } from './types.js';

/** Number of minor units per major unit (paise per ₹, cents per $). */
export const MINOR_UNITS: Record<Currency, bigint> = {
  INR: 100n,
  USD: 100n,
};

/** Build Money from a major-unit amount. Accepts integers or floats; floats
 *  are rounded to two decimal places before conversion to minor units to
 *  avoid float drift. */
export function money(amount: number | bigint, currency: Currency): Money {
  let minor: bigint;
  if (typeof amount === 'bigint') {
    minor = amount * MINOR_UNITS[currency];
  } else {
    if (!Number.isFinite(amount)) {
      throw new Error('money: amount must be finite');
    }
    if (amount < 0) {
      throw new Error('money: amount must be non-negative');
    }
    minor = BigInt(Math.round(amount * 100));
  }
  return { amount: minor, currency };
}

/** Build Money directly from a minor-unit amount (paise / cents). */
export function moneyMinor(amount: bigint | number, currency: Currency): Money {
  const big = typeof amount === 'bigint' ? amount : BigInt(amount);
  if (big < 0n) throw new Error('moneyMinor: amount must be non-negative');
  return { amount: big, currency };
}

/** Multiply Money by a scalar quantity. Quantity must be a non-negative
 *  integer; per-unit pricing is enforced upstream. */
export function multiply(m: Money, qty: number): Money {
  if (!Number.isInteger(qty) || qty < 0) {
    throw new Error('multiply: qty must be a non-negative integer');
  }
  return { amount: m.amount * BigInt(qty), currency: m.currency };
}

/** Sum a list of Money values. Throws if currencies mix. */
export function sumMoney(values: ReadonlyArray<Money>): Money {
  if (values.length === 0) {
    throw new Error('sumMoney: list cannot be empty');
  }
  const currency = values[0]!.currency;
  let total = 0n;
  for (const v of values) {
    if (v.currency !== currency) {
      throw new Error(`sumMoney: currency mismatch (${currency} vs ${v.currency})`);
    }
    total += v.amount;
  }
  return { amount: total, currency };
}

/** Format Money for display (₹1,00,000 / $100,000). */
export function formatMoney(m: Money): string {
  const major = Number(m.amount) / Number(MINOR_UNITS[m.currency]);
  if (m.currency === 'INR') {
    // Indian numbering: 1,00,000 (1 lakh).
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(major);
    return formatted;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(major);
}

/** Apply a percentage rate (decimal) to a money amount, rounding to the
 *  nearest minor unit using banker's rounding (half-to-even) for tax
 *  fairness. */
export function applyRate(m: Money, rate: number): Money {
  if (rate < 0 || !Number.isFinite(rate)) {
    throw new Error('applyRate: rate must be non-negative and finite');
  }
  if (rate === 0) return { amount: 0n, currency: m.currency };
  // Compute in BigInt by scaling rate to ppm (parts per million) and
  // back, with banker's rounding.
  const ppm = BigInt(Math.round(rate * 1_000_000));
  const product = m.amount * ppm; // minor * ppm (so divide by 1e6)
  const half = 500_000n;
  const remainder = product % 1_000_000n;
  let result = product / 1_000_000n;
  if (remainder > half) result += 1n;
  else if (remainder === half) {
    if (result % 2n === 1n) result += 1n;
  }
  return { amount: result, currency: m.currency };
}
