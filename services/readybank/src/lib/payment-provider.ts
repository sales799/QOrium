import { randomUUID } from 'node:crypto';
import type { Plan } from '../billing/plans.js';
import {
  razorpayConfigured,
  createSubscription as createRzpSubscription,
  cancelSubscription as cancelRzpSubscription,
  verifyWebhookSignature as verifyRzpWebhook,
} from './razorpay.js';
import {
  cashfreeConfigured,
  createCfSubscription,
  cancelCfSubscription,
  verifyCfWebhookSignature,
} from './cashfree.js';

// N6 — provider-agnostic billing seam. Razorpay and Cashfree PG both expose
// "create a recurring subscription, cancel it, verify a webhook". This interface
// lets routes/billing.ts stay provider-neutral; the active provider is chosen by
// the PAYMENT_PROVIDER env var (default 'razorpay'), so flipping a tenant onto
// Cashfree is a config change, not a code change.

export type ProviderName = 'razorpay' | 'cashfree';

export interface ProviderSubscription {
  /** External subscription id (stored generically in razorpay_subscription_id). */
  id: string;
  /** Provider-reported status (mapped to our trial/active/... by the caller). */
  status: string;
  /** URL the customer visits to authorise/checkout, or null. */
  checkoutUrl: string | null;
}

export interface CreateSubscriptionArgs {
  providerPlanId: string;
  customerEmail: string;
  customerName?: string;
  notes?: Record<string, string>;
}

export interface PaymentProvider {
  readonly name: ProviderName;
  /** True when API credentials are present (keys, not plan ids). */
  configured(): boolean;
  /** Name of the env var holding this provider's plan id for a given plan. */
  planEnvFor(plan: Plan): string | undefined;
  createSubscription(args: CreateSubscriptionArgs): Promise<ProviderSubscription>;
  cancelSubscription(id: string): Promise<void>;
  verifyWebhook(rawBody: string, headers: Record<string, string | undefined>): boolean;
}

const razorpayProvider: PaymentProvider = {
  name: 'razorpay',
  configured: razorpayConfigured,
  planEnvFor: (plan) => plan.razorpayPlanEnv,
  async createSubscription(args) {
    const sub = await createRzpSubscription({
      planId: args.providerPlanId,
      customerEmail: args.customerEmail,
      ...(args.notes ? { notes: args.notes } : {}),
    });
    return { id: sub.id, status: sub.status, checkoutUrl: sub.short_url ?? null };
  },
  async cancelSubscription(id) {
    await cancelRzpSubscription(id);
  },
  verifyWebhook(rawBody, headers) {
    return verifyRzpWebhook(rawBody, headers['x-razorpay-signature']);
  },
};

const cashfreeProvider: PaymentProvider = {
  name: 'cashfree',
  configured: cashfreeConfigured,
  planEnvFor: (plan) => plan.cashfreePlanEnv,
  async createSubscription(args) {
    // Cashfree requires the merchant to supply a unique subscription_id.
    const subscriptionId = `qsub_${randomUUID().replace(/-/g, '').slice(0, 24)}`;
    const sub = await createCfSubscription({
      planId: args.providerPlanId,
      subscriptionId,
      customerEmail: args.customerEmail,
      ...(args.customerName ? { customerName: args.customerName } : {}),
      ...(args.notes ? { notes: args.notes } : {}),
    });
    return {
      id: sub.subscription_id ?? subscriptionId,
      status: sub.subscription_status ?? 'pending',
      checkoutUrl: sub.authorisation_details?.authorisation_link ?? null,
    };
  },
  async cancelSubscription(id) {
    await cancelCfSubscription(id);
  },
  verifyWebhook(rawBody, headers) {
    return verifyCfWebhookSignature(
      rawBody,
      headers['x-webhook-signature'],
      headers['x-webhook-timestamp'],
    );
  },
};

const PROVIDERS: Record<ProviderName, PaymentProvider> = {
  razorpay: razorpayProvider,
  cashfree: cashfreeProvider,
};

export function activeProviderName(): ProviderName {
  const v = (process.env.PAYMENT_PROVIDER ?? 'razorpay').toLowerCase();
  return v === 'cashfree' ? 'cashfree' : 'razorpay';
}

export function getPaymentProvider(): PaymentProvider {
  return PROVIDERS[activeProviderName()];
}

export function getProvider(name: ProviderName): PaymentProvider {
  return PROVIDERS[name];
}
