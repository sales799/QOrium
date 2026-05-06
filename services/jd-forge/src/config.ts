export interface JdForgeConfig {
  nodeEnv: 'development' | 'test' | 'staging' | 'production';
  port: number;
  databaseUrl: string | undefined;
  anthropicApiKey: string | undefined;
  anthropicModel: string;
  apiKeyPepper: string | undefined;
  totalQuestionsPerOrder: number;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

export function loadConfig(): JdForgeConfig {
  const nodeEnv = (process.env.NODE_ENV ?? 'development') as JdForgeConfig['nodeEnv'];
  const port = parsePositiveInt(process.env.JDFORGE_PORT ?? process.env.PORT, 5102);
  return {
    nodeEnv,
    port,
    databaseUrl: process.env.DATABASE_URL || undefined,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || undefined,
    anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-opus-4-7',
    apiKeyPepper: process.env.API_KEY_PEPPER || undefined,
    totalQuestionsPerOrder: parsePositiveInt(process.env.JDFORGE_QUESTIONS_PER_ORDER, 20),
  };
}
