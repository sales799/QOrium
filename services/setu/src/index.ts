import { resolve } from 'node:path';
import pino from 'pino';
import { loadStatusFromDisk } from './loader.js';
import { createServer, type DeployServerConfig } from './server.js';

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

function parseBool(raw: string | undefined, fallback: boolean): boolean {
  if (!raw) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(raw.toLowerCase());
}

export async function start() {
  const port = parsePositiveInt(process.env.SETU_PORT ?? process.env.PORT, 5117);
  const logger = pino({ level: process.env.LOG_LEVEL ?? 'info', base: { service: 'qorium-setu' } });
  const repoRoot = process.env.SETU_REPO_ROOT ?? resolve(process.cwd());
  const deploy: DeployServerConfig = {
    deployEnabled: parseBool(process.env.SETU_DEPLOY_ENABLED, false),
    webhookSecret: process.env.SETU_WEBHOOK_SECRET ?? '',
    manualDeployToken: process.env.SETU_MANUAL_DEPLOY_TOKEN ?? '',
    deployScriptPath:
      process.env.SETU_DEPLOY_SCRIPT_PATH ?? resolve(repoRoot, 'services/setu/bin/setu-deploy.sh'),
    repoRoot,
  };
  const app = createServer({
    logger,
    getStatus: () => loadStatusFromDisk({ repoRoot }),
    deploy,
  });
  const server = app.listen(port, () => {
    logger.info({ port, deployEnabled: deploy.deployEnabled }, 'qorium-setu listening');
  });
  const shutdown = (signal: string): void => {
    logger.info({ signal }, 'shutting down qorium-setu');
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

if (process.argv[1]?.endsWith('index.js') || process.argv[1]?.endsWith('index.ts')) {
  void start().catch((err) => {
    process.stderr.write(JSON.stringify({ event: 'setu.fatal', error: String(err) }) + '\n');
    process.exit(1);
  });
}

export { createServer, type DeployServerConfig } from './server.js';
export { loadStatusFromDisk } from './loader.js';
export {
  decideDeploy,
  type DeployDecision,
  type DeployEnv,
  type PushEvent,
} from './deploy/policy.js';
export {
  runDeploy,
  realCommandRunner,
  type DeployCommandRunner,
  type DeployOutcome,
} from './deploy/runner.js';
export { verifyGitHubSignature, signGitHubBody } from './deploy/signature.js';
export { DeployHistory, type DeployHistoryEntry } from './deploy/history.js';
export {
  buildSnapshot,
  parseSprintsFromDashboard,
  parseTestTotals,
  parseHalts,
  parseCtoDeltas,
  countPm2Services,
  parseBuildHistory,
} from './snapshot.js';
export {
  type QoriumStatus,
  type PhaseProgress,
  type PunchlistSection,
  type SprintEntry,
  type ActivationHalt,
  type CtoDelta,
  type BuildRunHistoryEntry,
  SCHEMA_VERSION,
  STATUS_FILENAME,
} from './schema.js';
