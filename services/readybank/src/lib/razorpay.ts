import { createHmac, timingSafeEqual } from 'node:crypto';

// BR-billing — minimal Razorpay REST client (no SDK dependency). Basic-auth with
// RAZORPAY_KEY_ID/SECRET; webhook signature verified with RAZORPAY_WEBHOOK_SECRET
// (HMAC-SHA256 over the raw body).

const BASE = 'https://api.razorpay.com/v1';

function authHeader(): string {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret)
    throw new Error('Razorpay keys not configured (RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET)');
  return 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64');
}

export function razorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

async function rzp<T>(method: string, path: string, body?: unknown): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: { authorization: authHeader(), 'content-type': 'application/json' },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Razorpay ${method} ${path} -> ${r.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text) as T;
}

export interface RzpSubscription {
  id: string;
  status: string;
  short_url: string;
  current_end: number | null;
  plan_id: string;
}

export async function createSubscription(args: {
  planId: string;
  customerEmail: string;
  totalCount?: number;
  notes?: Record<string, string>;
}): Promise<RzpSubscription> {
  return rzp<RzpSubscription>('POST', '/subscriptions', {
    plan_id: args.planId,
    total_count: args.totalCount ?? 12,
    customer_notify: 1,
    notes: args.notes ?? {},
  });
}

export async function fetchSubscription(id: string): Promise<RzpSubscription> {
  return rzp<RzpSubscription>('GET', `/subscriptions/${id}`);
}

export async function cancelSubscription(id: string): Promise<RzpSubscription> {
  return rzp<RzpSubscription>('POST', `/subscriptions/${id}/cancel`, { cancel_at_cycle_end: 1 });
}

export function verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
