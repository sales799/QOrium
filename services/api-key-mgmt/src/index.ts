import { createPool, resolveDatabaseUrl, type Pool } from '@qorium/db';
import { loadConfig } from './config.js';
import { buildLogger } from './logger.js';
import { createServer } from './server.js';

export async function start() {
  const config = loadConfig();
  const logger = buildLogger();

  if (config.nodeEnv === 'production' && config.pepper.startsWith('dev-only')) {
    throw new Error('API_KEY_PEPPER must be set in production');
  }
  if (config.pepper.length < 32) {
    throw new Error('API_KEY_PEPPER must be at least 32 characters');
  }

  let pool: Pool | undefined;
  try {
    pool = createPool({ connectionString: resolveDatabaseUrl(), max: 8 });
  } catch (err) {
    logger.warn({ err }, 'DATABASE_URL not configured — service starts in stub mode');
  }

  const serverOpts: Parameters<typeof createServer>[0] = { config, logger };
  if (pool) serverOpts.pool = pool;
  const app = createServer(serverOpts);
  const server = app.listen(config.port, () => {
    logger.info({ port: config.port }, 'qorium-api-key-mgmt listening');
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'shutting down qorium-api-key-mgmt');
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
    process.stderr.write(
      JSON.stringify({ event: 'api-key-mgmt.fatal', error: String(err) }) + '\n',
    );
    process.exit(1);
  });
}

export { createServer } from './server.js';
export { loadConfig } from './config.js';
export { buildLogger } from './logger.js';
export {
  enforceScope,
  isScope,
  bundleScopes,
  SCOPES,
  SCOPE_BUNDLES,
  type Scope,
  type ScopeBundle,
} from './scopes.js';
export { issueKey, nextRotationDueAt, type IssuanceInputs, type IssuedKey } from './issuance.js';
export {
  insertKey,
  listKeys,
  listKeysDueForRotation,
  revokeKey,
  type ApiKeyRecord,
  type InsertKeyInput,
} from './repositories/keys.js';
