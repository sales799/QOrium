/**
 * Express service for Setu (Sanskrit: bridge). Two surfaces:
 *
 *   1. Status endpoints — pulls the snapshot from disk on each
 *      request so the dashboard MCP always sees the most recent push.
 *   2. Deploy webhook — receives GitHub `push` events, verifies the
 *      HMAC signature, decides per branch policy, and runs the deploy
 *      script. History is exposed at /v1/setu/deploys.
 *
 * Endpoints (v0):
 *   GET  /healthz
 *   GET  /v1/setu/status[/hero|/sprints|/halts|/cto-deltas]
 *   POST /v1/setu/deploys/webhook       — GitHub push webhook
 *   POST /v1/setu/deploys/manual        — admin-only re-deploy trigger
 *   GET  /v1/setu/deploys               — history (latest first)
 *   GET  /v1/setu/deploys/latest        — latest single entry
 */

import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { Logger } from 'pino';
import type { QoriumStatus } from './schema.js';
import { decideDeploy, type PushEvent } from './deploy/policy.js';
import { runDeploy, type DeployCommandRunner } from './deploy/runner.js';
import { verifyGitHubSignature } from './deploy/signature.js';
import { DeployHistory } from './deploy/history.js';
import { randomUUID } from 'node:crypto';

export interface DeployServerConfig {
  /** GitHub webhook secret (HMAC-SHA256). Empty = webhook disabled. */
  webhookSecret: string;
  /** Manual deploy bearer token. Empty = manual endpoint disabled. */
  manualDeployToken: string;
  /** Path to bin/setu-deploy.sh on the VPS. */
  deployScriptPath: string;
  /** Repo root on the VPS. */
  repoRoot: string;
  /** Whether deploys are enabled at all. */
  deployEnabled: boolean;
}

export interface CreateServerOptions {
  logger: Logger;
  /** Resolves the freshest status snapshot — usually `loadStatusFromDisk`. */
  getStatus: () => QoriumStatus | Promise<QoriumStatus>;
  /** Deploy machinery config. Optional — if absent the deploy endpoints 503. */
  deploy?: DeployServerConfig;
  /** Test seam: inject a fake command runner. */
  command?: DeployCommandRunner;
  /** Test seam: inject the in-memory history (default = new DeployHistory()). */
  history?: DeployHistory;
}

export function createServer(opts: CreateServerOptions): express.Express {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(pinoHttp({ logger: opts.logger }));

  // The webhook needs the raw body for HMAC; mount raw before json.
  app.post('/v1/setu/deploys/webhook', express.raw({ type: '*/*', limit: '512kb' }), (req, res) => {
    void handleWebhook(opts, req, res);
  });

  app.use(express.json({ limit: '64kb' }));

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', service: 'qorium-setu' });
  });

  app.get('/v1/setu/status', async (_req, res) => {
    const status = await opts.getStatus();
    res.json(status);
  });

  app.get('/v1/setu/status/hero', async (_req, res) => {
    const status = await opts.getStatus();
    res.json({ generatedAt: status.generatedAt, hero: status.hero });
  });

  app.get('/v1/setu/status/sprints', async (_req, res) => {
    const status = await opts.getStatus();
    res.json({ generatedAt: status.generatedAt, sprints: status.sprints, tests: status.tests });
  });

  app.get('/v1/setu/status/halts', async (_req, res) => {
    const status = await opts.getStatus();
    res.json({ generatedAt: status.generatedAt, halts: status.halts });
  });

  app.get('/v1/setu/status/cto-deltas', async (_req, res) => {
    const status = await opts.getStatus();
    res.json({ generatedAt: status.generatedAt, ctoDeltas: status.ctoDeltas });
  });

  app.post('/v1/setu/deploys/manual', (req, res) => {
    void handleManualDeploy(opts, req, res);
  });

  app.get('/v1/setu/deploys', (_req, res) => {
    const history = opts.history ?? defaultHistory(opts);
    res.json({ count: history.list().length, deploys: history.list() });
  });

  app.get('/v1/setu/deploys/latest', (_req, res) => {
    const history = opts.history ?? defaultHistory(opts);
    const latest = history.latest();
    if (!latest) {
      res.status(404).contentType('application/problem+json').json({
        type: 'about:blank',
        title: 'No deploys recorded yet',
        status: 404,
      });
      return;
    }
    res.json(latest);
  });

  app.use((_req, res) => {
    res.status(404).contentType('application/problem+json').json({
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
    });
  });

  return app;
}

const HISTORY_KEY = Symbol.for('qorium.setu.history');

function defaultHistory(opts: CreateServerOptions): DeployHistory {
  if (opts.history) return opts.history;
  const g = globalThis as unknown as Record<symbol, DeployHistory | undefined>;
  if (!g[HISTORY_KEY]) g[HISTORY_KEY] = new DeployHistory();
  return g[HISTORY_KEY];
}

async function handleWebhook(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): Promise<void> {
  if (!opts.deploy?.deployEnabled) {
    sendProblem(res, 503, 'Deploy disabled', 'set SETU_DEPLOY_ENABLED=true to enable');
    return;
  }
  if (!opts.deploy.webhookSecret) {
    sendProblem(res, 503, 'GitHub webhook secret not configured');
    return;
  }
  const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body ?? '');
  const sig = req.headers['x-hub-signature-256'];
  const sigValue = typeof sig === 'string' ? sig : '';
  if (!verifyGitHubSignature(rawBody, sigValue, opts.deploy.webhookSecret)) {
    sendProblem(res, 401, 'Invalid GitHub webhook signature');
    return;
  }
  const event = req.headers['x-github-event'];
  if (event !== 'push') {
    res.status(202).json({ status: 'ignored', reason: `event '${String(event)}' is not 'push'` });
    return;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    sendProblem(res, 400, 'Webhook body is not valid JSON');
    return;
  }
  const decision = decideDeploy(parsed as PushEvent);
  if (decision.action === 'ignore') {
    res.status(202).json({ status: 'ignored', reason: decision.reason });
    return;
  }
  const outcome = await runDeployFromDecision(
    opts,
    decision.env,
    decision.branch,
    decision.commit,
    'webhook',
  );
  res.status(outcome.ok ? 202 : 500).json(outcome);
}

async function handleManualDeploy(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): Promise<void> {
  if (!opts.deploy?.deployEnabled) {
    sendProblem(res, 503, 'Deploy disabled');
    return;
  }
  const auth = req.headers.authorization;
  const expected = `Bearer ${opts.deploy.manualDeployToken}`;
  if (!opts.deploy.manualDeployToken || typeof auth !== 'string' || auth !== expected) {
    sendProblem(res, 401, 'Manual deploy requires Bearer token');
    return;
  }
  const body = (req.body ?? {}) as { env?: string; branch?: string; commit?: string };
  const env = body.env === 'production' ? 'production' : 'staging';
  const branch = typeof body.branch === 'string' && body.branch.length > 0 ? body.branch : 'main';
  const commit = typeof body.commit === 'string' && body.commit.length > 0 ? body.commit : 'HEAD';
  const outcome = await runDeployFromDecision(opts, env, branch, commit, 'manual');
  res.status(outcome.ok ? 200 : 500).json(outcome);
}

async function runDeployFromDecision(
  opts: CreateServerOptions,
  env: 'production' | 'staging',
  branch: string,
  commit: string,
  trigger: 'webhook' | 'manual' | 'cron',
) {
  const result = await runDeploy({
    env,
    branch,
    commit,
    cwd: opts.deploy!.repoRoot,
    scriptPath: opts.deploy!.deployScriptPath,
    ...(opts.command ? { command: opts.command } : {}),
  });
  const entry = { ...result, id: randomUUID(), trigger };
  defaultHistory(opts).record(entry);
  return entry;
}

function sendProblem(res: Response, status: number, title: string, detail?: string): void {
  const body: Record<string, unknown> = { type: 'about:blank', title, status };
  if (detail !== undefined) body.detail = detail;
  res.status(status).contentType('application/problem+json').json(body);
}
