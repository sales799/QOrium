export interface TestForgeConfig {
  nodeEnv: 'development' | 'test' | 'staging' | 'production';
  databaseUrl: string | undefined;
  /** Maximum questions processed per orchestrator pass. */
  maxItemsPerRun: number;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

export function loadConfig(): TestForgeConfig {
  const nodeEnv = (process.env.NODE_ENV ?? 'development') as TestForgeConfig['nodeEnv'];
  return {
    nodeEnv,
    databaseUrl: process.env.DATABASE_URL || undefined,
    maxItemsPerRun: parsePositiveInt(process.env.TESTFORGE_MAX_ITEMS_PER_RUN, 500),
  };
}
