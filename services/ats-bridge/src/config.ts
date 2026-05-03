export interface AtsBridgeConfig {
  nodeEnv: 'development' | 'test' | 'staging' | 'production';
  port: number;
  databaseUrl: string | undefined;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

export function loadConfig(): AtsBridgeConfig {
  const nodeEnv = (process.env.NODE_ENV ?? 'development') as AtsBridgeConfig['nodeEnv'];
  return {
    nodeEnv,
    port: parsePositiveInt(process.env.ATS_BRIDGE_PORT ?? process.env.PORT, 5105),
    databaseUrl: process.env.DATABASE_URL || undefined,
  };
}
