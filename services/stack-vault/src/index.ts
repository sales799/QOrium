import { createPool, resolveDatabaseUrl, type Pool } from '@qorium/db';
import { loadConfig } from './config.js';
import { buildLogger } from './logger.js';
import { createServer } from './server.js';

export async function start() {
  const config = loadConfig();
  const logger = buildLogger();

  let pool: Pool | undefined;
  try {
    pool = createPool({ connectionString: resolveDatabaseUrl(), max: 8 });
  } catch (err) {
    logger.warn({ err }, 'DATABASE_URL not configured — service starts in read-only mode');
  }

  const serverOpts: Parameters<typeof createServer>[0] = { config, logger };
  if (pool) serverOpts.pool = pool;
  const app = createServer(serverOpts);
  const server = app.listen(config.port, () => {
    logger.info({ port: config.port }, 'qorium-stack-vault listening');
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'shutting down qorium-stack-vault');
    server.close(() => process.exit(0));
    if (pool) await pool.end();
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

if (process.argv[1]?.endsWith('index.js') || process.argv[1]?.endsWith('index.ts')) {
  void start().catch((err) => {
    process.stderr.write(JSON.stringify({ event: 'stackvault.fatal', error: String(err) }) + '\n');
    process.exit(1);
  });
}

export { createServer } from './server.js';
export { loadConfig } from './config.js';
export { buildLogger } from './logger.js';
export {
  buildVariant,
  deriveWatermarkId,
  attributeLeakToVault,
  type VaultIdentity,
  type CustomerVariant,
  type MasterQuestion,
} from './variant.js';
export { getVaultByTenant, toPublicView, type VaultRow } from './repositories/vaults.js';
export { searchVaultQuestions, getReleasedQuestion } from './repositories/questions.js';
export {
  recordAccess,
  summarisePerQuestion,
  type AccessLogEntry,
} from './repositories/access-log.js';
