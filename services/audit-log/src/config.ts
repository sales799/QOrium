export interface AuditLogConfig {
  nodeEnv: 'development' | 'test' | 'staging' | 'production';
  port: number;
  databaseUrl: string | undefined;
  /** Maximum page size accepted by the list endpoint. */
  maxLimit: number;
  /** Default page size if `limit` is omitted. */
  defaultLimit: number;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

export function loadConfig(): AuditLogConfig {
  const nodeEnv = (process.env.NODE_ENV ?? 'development') as AuditLogConfig['nodeEnv'];
  return {
    nodeEnv,
    port: parsePositiveInt(process.env.AUDIT_LOG_PORT ?? process.env.PORT, 5111),
    databaseUrl: process.env.DATABASE_URL || undefined,
    maxLimit: parsePositiveInt(process.env.AUDIT_LOG_MAX_LIMIT, 200),
    defaultLimit: parsePositiveInt(process.env.AUDIT_LOG_DEFAULT_LIMIT, 50),
  };
}
