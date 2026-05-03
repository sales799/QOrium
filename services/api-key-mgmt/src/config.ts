export interface ApiKeyMgmtConfig {
  nodeEnv: 'development' | 'test' | 'staging' | 'production';
  port: number;
  databaseUrl: string | undefined;
  /** Server-side pepper for HMAC-SHA256 hashing. ≥32 chars required at boot. */
  pepper: string;
  /** Days until a customer key must be rotated. */
  customerRotationDays: number;
  /** Days until an internal key must be rotated. D3 §2.3 = 180. */
  internalRotationDays: number;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

export function loadConfig(): ApiKeyMgmtConfig {
  const nodeEnv = (process.env.NODE_ENV ?? 'development') as ApiKeyMgmtConfig['nodeEnv'];
  return {
    nodeEnv,
    port: parsePositiveInt(process.env.API_KEY_MGMT_PORT ?? process.env.PORT, 5113),
    databaseUrl: process.env.DATABASE_URL || undefined,
    pepper:
      process.env.API_KEY_PEPPER ?? 'dev-only-pepper-32-chars-or-longer-please-do-not-ship-this-x',
    customerRotationDays: parsePositiveInt(process.env.API_KEY_CUSTOMER_ROTATION_DAYS, 365),
    internalRotationDays: parsePositiveInt(process.env.API_KEY_INTERNAL_ROTATION_DAYS, 180),
  };
}
