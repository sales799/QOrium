export interface WebhooksConfig {
  nodeEnv: 'development' | 'test' | 'staging' | 'production';
  port: number;
  databaseUrl: string | undefined;
  /** Per-attempt HTTP timeout (ms). Spec §9 calls for 10s. */
  deliveryTimeoutMs: number;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

export function loadConfig(): WebhooksConfig {
  const nodeEnv = (process.env.NODE_ENV ?? 'development') as WebhooksConfig['nodeEnv'];
  return {
    nodeEnv,
    port: parsePositiveInt(process.env.WEBHOOKS_PORT ?? process.env.PORT, 5106),
    databaseUrl: process.env.DATABASE_URL || undefined,
    deliveryTimeoutMs: parsePositiveInt(process.env.WEBHOOKS_DELIVERY_TIMEOUT_MS, 10_000),
  };
}
