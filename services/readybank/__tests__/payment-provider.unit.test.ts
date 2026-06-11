import { createHmac } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  activeProviderName,
  getPaymentProvider,
  getProvider,
} from '../src/lib/payment-provider.js';
import { verifyCfWebhookSignature, cashfreeConfigured } from '../src/lib/cashfree.js';
import { PLANS } from '../src/billing/plans.js';

const SAVED = { ...process.env };

beforeEach(() => {
  delete process.env.PAYMENT_PROVIDER;
  delete process.env.CASHFREE_PG_APP_ID;
  delete process.env.CASHFREE_PG_SECRET_KEY;
});

afterEach(() => {
  process.env = { ...SAVED };
});

describe('payment provider selection', () => {
  it('defaults to razorpay when PAYMENT_PROVIDER is unset', () => {
    expect(activeProviderName()).toBe('razorpay');
    expect(getPaymentProvider().name).toBe('razorpay');
  });

  it('selects cashfree when PAYMENT_PROVIDER=cashfree (case-insensitive)', () => {
    process.env.PAYMENT_PROVIDER = 'CashFree';
    expect(activeProviderName()).toBe('cashfree');
    expect(getPaymentProvider().name).toBe('cashfree');
  });

  it('falls back to razorpay for any unknown provider value', () => {
    process.env.PAYMENT_PROVIDER = 'stripe';
    expect(activeProviderName()).toBe('razorpay');
  });

  it('maps each plan to its provider-specific plan env var', () => {
    expect(getProvider('razorpay').planEnvFor(PLANS.growth)).toBe('RAZORPAY_PLAN_GROWTH');
    expect(getProvider('cashfree').planEnvFor(PLANS.growth)).toBe('CASHFREE_PLAN_GROWTH');
    expect(getProvider('cashfree').planEnvFor(PLANS.scale)).toBe('CASHFREE_PLAN_SCALE');
    // free + enterprise have no recurring provider plan
    expect(getProvider('cashfree').planEnvFor(PLANS.free)).toBeUndefined();
  });

  it('reports cashfree as unconfigured without keys, configured with them', () => {
    expect(cashfreeConfigured()).toBe(false);
    process.env.CASHFREE_PG_APP_ID = 'app';
    process.env.CASHFREE_PG_SECRET_KEY = 'secret';
    expect(cashfreeConfigured()).toBe(true);
    expect(getProvider('cashfree').configured()).toBe(true);
  });
});

describe('cashfree webhook signature', () => {
  it('verifies a correctly signed body and rejects tampering', () => {
    process.env.CASHFREE_PG_SECRET_KEY = 'test-secret';
    const body = '{"type":"SUBSCRIPTION_STATUS_CHANGE"}';
    const ts = '1718000000000';
    const good = createHmac('sha256', 'test-secret')
      .update(ts + body)
      .digest('base64');

    expect(verifyCfWebhookSignature(body, good, ts)).toBe(true);
    expect(verifyCfWebhookSignature(body + 'x', good, ts)).toBe(false);
    expect(verifyCfWebhookSignature(body, good, '9999')).toBe(false);
    expect(verifyCfWebhookSignature(body, undefined, ts)).toBe(false);
  });

  it('returns false when the secret is absent', () => {
    delete process.env.CASHFREE_PG_SECRET_KEY;
    expect(verifyCfWebhookSignature('{}', 'sig', '1')).toBe(false);
  });
});
