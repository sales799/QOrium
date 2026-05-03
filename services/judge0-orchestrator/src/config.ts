export interface Judge0OrchestratorConfig {
  nodeEnv: 'development' | 'test' | 'staging' | 'production';
  databaseUrl: string | undefined;
  judge0BaseUrl: string;
  judge0AuthToken: string | undefined;
  pollIntervalMs: number;
  pollTimeoutMs: number;
  /** Maximum responses processed per `--once` invocation. */
  maxResponsesPerRun: number;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

export function loadConfig(): Judge0OrchestratorConfig {
  const nodeEnv = (process.env.NODE_ENV ?? 'development') as Judge0OrchestratorConfig['nodeEnv'];
  return {
    nodeEnv,
    databaseUrl: process.env.DATABASE_URL || undefined,
    judge0BaseUrl: process.env.JUDGE0_URL || 'http://localhost:2358',
    judge0AuthToken: process.env.JUDGE0_AUTH_TOKEN || undefined,
    pollIntervalMs: parsePositiveInt(process.env.JUDGE0_POLL_INTERVAL_MS, 500),
    pollTimeoutMs: parsePositiveInt(process.env.JUDGE0_POLL_TIMEOUT_MS, 60_000),
    maxResponsesPerRun: parsePositiveInt(process.env.JUDGE0_MAX_RESPONSES_PER_RUN, 100),
  };
}
