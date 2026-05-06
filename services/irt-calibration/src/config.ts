export interface IrtConfig {
  nodeEnv: 'development' | 'test' | 'staging' | 'production';
  databaseUrl: string | undefined;
  /** Minimum responses before MLE is even attempted. Spec §3 = 30. */
  minResponses: number;
  /** Maximum questions processed per batch run. Hard cap to keep runs bounded. */
  maxQuestionsPerRun: number;
  /** Newton-Raphson iteration cap. Spec lets girth pick; we set 50. */
  maxIterations: number;
  /** Convergence tolerance on |Δll|. */
  tolerance: number;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

function parsePositiveFloat(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

export function loadConfig(): IrtConfig {
  const nodeEnv = (process.env.NODE_ENV ?? 'development') as IrtConfig['nodeEnv'];
  return {
    nodeEnv,
    databaseUrl: process.env.DATABASE_URL || undefined,
    minResponses: parsePositiveInt(process.env.IRT_MIN_RESPONSES, 30),
    maxQuestionsPerRun: parsePositiveInt(process.env.IRT_MAX_QUESTIONS_PER_RUN, 1_000),
    maxIterations: parsePositiveInt(process.env.IRT_MAX_ITERATIONS, 50),
    tolerance: parsePositiveFloat(process.env.IRT_TOLERANCE, 1e-6),
  };
}
