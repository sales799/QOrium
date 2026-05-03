/**
 * Razorpay client + webhook verifier per
 * `infra/Billing-Service-v0-Spec.md` §6.
 *
 * Stub default (no real network calls); Real impl throws on missing
 * credentials so the swap is mechanical at activation. Webhook HMAC
 * verification is pure logic and runs in both modes.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

export interface RazorpayCredentials {
  keyId: string;
  keySecret: string;
}

export interface CreateOrderInputs {
  amountCents: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: 'created';
}

export interface RazorpayClient {
  createOrder(inputs: CreateOrderInputs): Promise<RazorpayOrder>;
  verifyWebhook(rawBody: string, signature: string): boolean;
}

/** Stub client — no network calls; tests + dev environment use this. */
export function stubRazorpayClient(webhookSecret: string): RazorpayClient {
  return {
    async createOrder(inputs) {
      return {
        id: `order_stub_${Math.random().toString(36).slice(2, 10)}`,
        amount: inputs.amountCents,
        currency: inputs.currency,
        status: 'created',
      };
    },
    verifyWebhook(rawBody, signature) {
      return verifyWebhookSignature(rawBody, signature, webhookSecret);
    },
  };
}

/** Real client — throws if credentials are absent. */
export function realRazorpayClient(opts: {
  credentials: RazorpayCredentials | null;
  webhookSecret: string;
  fetchImpl?: typeof fetch;
}): RazorpayClient {
  if (!opts.credentials) {
    throw new Error(
      'realRazorpayClient: RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET required for live mode',
    );
  }
  const fetchImpl = opts.fetchImpl ?? fetch;
  const auth = Buffer.from(`${opts.credentials.keyId}:${opts.credentials.keySecret}`).toString(
    'base64',
  );
  return {
    async createOrder(inputs) {
      const res = await fetchImpl('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          authorization: `Basic ${auth}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: inputs.amountCents,
          currency: inputs.currency,
          receipt: inputs.receipt,
          notes: inputs.notes ?? {},
        }),
      });
      if (!res.ok) {
        throw new Error(`razorpay createOrder failed: HTTP ${res.status}`);
      }
      const body = (await res.json()) as RazorpayOrder;
      return body;
    },
    verifyWebhook(rawBody, signature) {
      return verifyWebhookSignature(rawBody, signature, opts.webhookSecret);
    },
  };
}

/**
 * Razorpay sends `X-Razorpay-Signature: <hex>` derived as
 *   HMAC_SHA256(rawBody, webhookSecret).hex()
 *
 * Pure logic — usable in tests + real mode + offline reconciliation.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | undefined,
  secret: string,
): boolean {
  if (!signature || signature.length !== 64) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  if (expected.length !== signature.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(signature, 'utf8'));
  } catch {
    return false;
  }
}

/** Type guards over Razorpay's webhook body shapes. */
export interface RazorpayWebhookEvent {
  event:
    | 'payment.authorized'
    | 'payment.captured'
    | 'payment.failed'
    | 'order.paid'
    | 'refund.processed';
  payload: {
    payment?: { entity: RazorpayPaymentEntity };
    order?: { entity: { id: string; receipt?: string } };
  };
}

export interface RazorpayPaymentEntity {
  id: string;
  amount: number;
  currency: string;
  status: 'authorized' | 'captured' | 'failed';
  order_id: string;
  error_description?: string;
}

export function isRazorpayEvent(value: unknown): value is RazorpayWebhookEvent {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { event?: unknown }).event === 'string' &&
    typeof (value as { payload?: unknown }).payload === 'object'
  );
}
