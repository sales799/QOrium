export interface StackVaultConfig {
  nodeEnv: 'development' | 'test' | 'staging' | 'production';
  port: number;
  databaseUrl: string | undefined;
  apiKeyPepper: string | undefined;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

export function loadConfig(): StackVaultConfig {
  const nodeEnv = (process.env.NODE_ENV ?? 'development') as StackVaultConfig['nodeEnv'];
  return {
    nodeEnv,
    port: parsePositiveInt(process.env.STACKVAULT_PORT ?? process.env.PORT, 5103),
    databaseUrl: process.env.DATABASE_URL || undefined,
    apiKeyPepper: process.env.API_KEY_PEPPER || undefined,
  };
}
