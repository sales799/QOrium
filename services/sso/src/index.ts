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
    logger.warn({ err }, 'DATABASE_URL not configured — service starts without persistence');
  }

  const serverOpts: Parameters<typeof createServer>[0] = { config, logger };
  if (pool) serverOpts.pool = pool;
  const app = createServer(serverOpts);
  const server = app.listen(config.port, () => {
    logger.info({ port: config.port }, 'qorium-sso listening');
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'shutting down qorium-sso');
    server.close(() => process.exit(0));
    if (pool) await pool.end();
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

if (process.argv[1]?.endsWith('index.js') || process.argv[1]?.endsWith('index.ts')) {
  void start().catch((err) => {
    process.stderr.write(JSON.stringify({ event: 'sso.fatal', error: String(err) }) + '\n');
    process.exit(1);
  });
}

export { createServer } from './server.js';
export { loadConfig } from './config.js';
export { buildLogger } from './logger.js';
export { generateSpMetadataXml, type SpMetadataInputs } from './metadata.js';
export {
  validateSamlAcs,
  principalFromAssertion,
  type ParsedSamlAssertion,
  type SessionPrincipal,
  type AttributeMapping,
} from './saml.js';
export { issueSessionJwt, verifySessionJwt, type SessionClaims, type VerifyResult } from './jwt.js';
export {
  getConfigByTenantId,
  upsertConfig,
  setStatus,
  type SsoConfigRow,
  type SsoProtocol,
  type SsoIdpType,
  type SsoStatus,
} from './repositories/configurations.js';
