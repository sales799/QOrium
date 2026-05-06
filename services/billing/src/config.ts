export interface BillingConfig {
  nodeEnv: 'development' | 'test' | 'staging' | 'production';
  port: number;
  databaseUrl: string | undefined;
  /** Base GST rate in basis points (1800 = 18.00%). India default. */
  defaultGstBps: number;
  /** Default currency. */
  defaultCurrency: string;
  /** Razorpay webhook secret for HMAC verification. Stub default. */
  razorpayWebhookSecret: string;
  /** Razorpay key id (used for outbound API). Stub when absent. */
  razorpayKeyId: string | undefined;
  razorpayKeySecret: string | undefined;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

export function loadConfig(): BillingConfig {
  const nodeEnv = (process.env.NODE_ENV ?? 'development') as BillingConfig['nodeEnv'];
  return {
    nodeEnv,
    port: parsePositiveInt(process.env.BILLING_PORT ?? process.env.PORT, 5112),
    databaseUrl: process.env.DATABASE_URL || undefined,
    defaultGstBps: parsePositiveInt(process.env.BILLING_DEFAULT_GST_BPS, 1800),
    defaultCurrency: process.env.BILLING_DEFAULT_CURRENCY ?? 'INR',
    razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? 'stub-webhook-secret-do-not-ship',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || undefined,
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || undefined,
  };
}
