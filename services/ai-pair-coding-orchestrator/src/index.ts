import pino from 'pino';
import { createPool, resolveDatabaseUrl, type Pool } from '@qorium/db';
import { createServer } from './server.js';

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

export async function start() {
  const port = parsePositiveInt(process.env.AI_PAIR_CODING_PORT ?? process.env.PORT, 5115);
  const logger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    base: { service: 'qorium-ai-pair-coding-orchestrator' },
  });

  let pool: Pool | undefined;
  try {
    pool = createPool({ connectionString: resolveDatabaseUrl(), max: 4 });
  } catch (err) {
    logger.warn({ err }, 'DATABASE_URL not configured — orchestrator boots in stub mode');
  }

  const opts: Parameters<typeof createServer>[0] = { logger };
  if (pool) opts.pool = pool;
  const app = createServer(opts);
  const server = app.listen(port, () => {
    logger.info({ port }, 'qorium-ai-pair-coding-orchestrator listening');
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'shutting down ai-pair-coding-orchestrator');
    server.close(() => process.exit(0));
    if (pool) await pool.end();
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

if (process.argv[1]?.endsWith('index.js') || process.argv[1]?.endsWith('index.ts')) {
  void start().catch((err) => {
    process.stderr.write(
      JSON.stringify({ event: 'ai-pair-coding.fatal', error: String(err) }) + '\n',
    );
    process.exit(1);
  });
}

export { createServer } from './server.js';
export {
  ARCHETYPES,
  archetypeMetadata,
  isReadyForRelease,
  renderSpecYaml,
  validateDraft,
  type Archetype,
  type QuestionDraft,
  type SeededError,
  type ValidationIssue,
} from './authoring.js';
export {
  gradeSession,
  DEFAULT_WEIGHTS,
  type SessionSignals,
  type DimensionWeights,
  type DimensionScore,
  type DimensionKey,
  type GraderOutput,
} from './grader.js';
export {
  stubAnthropicClient,
  realAnthropicClient,
  type AnthropicClient,
  type AnthropicMessage,
  type AnthropicCompletion,
  type AnthropicCredentials,
} from './anthropic.js';
export {
  createSession,
  getSession,
  appendMessage,
  submitSession,
  type SessionRow,
  type CreateSessionInput,
} from './repositories/sessions.js';
