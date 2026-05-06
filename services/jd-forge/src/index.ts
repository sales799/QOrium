import { createPool, resolveDatabaseUrl, type Pool } from '@qorium/db';
import { loadConfig } from './config.js';
import { buildLogger } from './logger.js';
import { createServer } from './server.js';
import { StubJdParser, AnthropicJdParser } from './parser.js';
import { StringMatchRoleGraphMapper } from './mapper.js';
import { StubQuestionGenerator, AnthropicQuestionGenerator } from './generator.js';
import type { OrchestratorPipeline } from './orchestrator.js';

export async function start() {
  const config = loadConfig();
  const logger = buildLogger();

  let pool: Pool | undefined;
  try {
    pool = createPool({ connectionString: resolveDatabaseUrl(), max: 8 });
  } catch (err) {
    logger.warn({ err }, 'DATABASE_URL not configured — service starts in read-only mode');
  }

  const parser = config.anthropicApiKey
    ? new AnthropicJdParser({ apiKey: config.anthropicApiKey, model: config.anthropicModel })
    : new StubJdParser();
  const generator = config.anthropicApiKey
    ? new AnthropicQuestionGenerator({
        apiKey: config.anthropicApiKey,
        model: config.anthropicModel,
      })
    : new StubQuestionGenerator();
  // The role-graph mapper currently uses an empty canonical set; in
  // production it'd be hydrated from `content.sub_skills`. v0 ships the
  // empty mapper so unmapped skills fall through to format defaults — see
  // CTO-DELTA-jdforge-embeddings-deferred.md for the upgrade path.
  const mapper = new StringMatchRoleGraphMapper([]);

  const pipeline: OrchestratorPipeline = { parser, mapper, generator, logger };

  const serverOpts: Parameters<typeof createServer>[0] = { config, pipeline, logger };
  if (pool) serverOpts.pool = pool;
  const app = createServer(serverOpts);
  const server = app.listen(config.port, () => {
    logger.info(
      { port: config.port, parser: parser.id, generator: generator.id },
      'qorium-jd-forge listening',
    );
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'shutting down qorium-jd-forge');
    server.close(() => process.exit(0));
    if (pool) await pool.end();
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

// PM2 cluster mode wraps the script, so process.argv[1] points at the
// wrapper, not index.js. Always invoke start(); tests import specific
// helpers, never this entry point.
{
  void start().catch((err) => {
    process.stderr.write(JSON.stringify({ event: 'jdforge.fatal', error: String(err) }) + '\n');
    process.exit(1);
  });
}

export { runOrder } from './orchestrator.js';
export { buildSpec } from './spec.js';
export { validateQuestion, isLikelyLeak } from './validator.js';
export { exportFor, exportJson, exportCsv, exportMettlCsv } from './exporters.js';
export { StubJdParser, AnthropicJdParser, parseJdJson } from './parser.js';
export { StubQuestionGenerator, AnthropicQuestionGenerator } from './generator.js';
export { StringMatchRoleGraphMapper, mapJdSkills } from './mapper.js';
export { createServer } from './server.js';
export { loadConfig } from './config.js';
export { buildLogger } from './logger.js';
export type {
  Tier,
  ExportFormat,
  ParsedJd,
  RoleGraphMapping,
  QuestionSpec,
  GeneratedQuestion,
  OrderInput,
  OrderOutcome,
} from './types.js';
