import { createHmac, timingSafeEqual } from 'node:crypto';

// N6 — minimal Cashfree PG (Payment Gateway) Subscriptions REST client, no SDK
// dependency. Mirrors the shape of lib/razorpay.ts so both can sit behind the
// PaymentProvider interface. Credentials come from CASHFREE_PG_APP_ID /
// CASHFREE_PG_SECRET_KEY; CASHFREE_PG_ENV selects sandbox vs production.
//
// NOTE: this is the Cashfree PG product (subscriptions/checkout). It is NOT
// PRAMAAN's CASHFREE_VERIFY_* KYC credentials — those are a different product.

const API_VERSION = '2023-08-01';

function baseUrl(): string {
  const env = (process.env.CASHFREE_PG_ENV ?? 'production').toLowerCase();
  return env === 'sandbox' || env === 'test'
    ? 'https://sandbox.cashfree.com/pg'
    : 'https://api.cashfree.com/pg';
}

function authHeaders(): Record<string, string> {
  const id = process.env.CASHFREE_PG_APP_ID;
  const secret = process.env.CASHFREE_PG_SECRET_KEY;
  if (!id || !secret)
    throw new Error('Cashfree PG keys not configured (CASHFREE_PG_APP_ID/CASHFREE_PG_SECRET_KEY)');
  return {
    'x-client-id': id,
    'x-client-secret': secret,
    'x-api-version': API_VERSION,
    'content-type': 'application/json',
  };
}

export function cashfreeConfigured(): boolean {
  return Boolean(process.env.CASHFREE_PG_APP_ID && process.env.CASHFREE_PG_SECRET_KEY);
}

async function cf<T>(method: string, path: string, body?: unknown): Promise<T> {
  const r = await fetch(`${baseUrl()}${path}`, {
    method,
    headers: authHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Cashfree ${method} ${path} -> ${r.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text) as T;
}

export interface CfSubscription {
  subscription_id: string;
  subscription_status: string;
  // Cashfree returns an authorization/checkout link the customer must approve.
  subscription_session_id?: string | null;
  authorisation_details?: { authorisation_link?: string | null } | null;
  current_cycle?: { cycle_end_date?: string | null } | null;
}

export async function createCfSubscription(args: {
  planId: string;
  subscriptionId: string;
  customerEmail: string;
  customerName?: string;
  notes?: Record<string, string>;
}): Promise<CfSubscription> {
  return cf<CfSubscription>('POST', '/subscriptions', {
    subscription_id: args.subscriptionId,
    plan_details: { plan_id: args.planId },
    customer_details: {
      customer_email: args.customerEmail,
      customer_name: args.customerName ?? args.customerEmail,
    },
    subscription_meta: args.notes ?? {},
  });
}

export async function cancelCfSubscription(id: string): Promise<CfSubscription> {
  return cf<CfSubscription>('POST', `/subscriptions/${id}/manage`, {
    action: 'CANCEL',
  });
}

// Cashfree signs webhooks as base64( HMAC-SHA256( timestamp + rawBody, secretKey ) ),
// delivered in x-webhook-signature with the timestamp in x-webhook-timestamp.
export function verifyCfWebhookSignature(
  rawBody: string,
  signature: string | undefined,
  timestamp: string | undefined,
): boolean {
  const secret = process.env.CASHFREE_PG_SECRET_KEY;
  if (!secret || !signature || !timestamp) return false;
  const expected = createHmac('sha256', secret)
    .update(timestamp + rawBody)
    .digest('base64');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
