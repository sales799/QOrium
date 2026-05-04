import { describe, expect, it } from 'vitest';
import request from 'supertest';
import pino from 'pino';
import { createServer } from '../src/server';
import { signGitHubBody } from '../src/deploy/signature';
import { DeployHistory } from '../src/deploy/history';
import type { DeployCommandRunner } from '../src/deploy/runner';
import { SCHEMA_VERSION, type QoriumStatus } from '../src/schema';

const silent = pino({ level: 'silent' });
const SECRET = 'gh-webhook-test-secret';

const FAKE_STATUS: QoriumStatus = {
  schemaVersion: SCHEMA_VERSION,
  generatedAt: '2026-05-03T20:00:00Z',
  branch: 'main',
  prNumber: 9,
  head: 'abc',
  hero: {
    phase0CompletionPercent: 100,
    contentInventory: { questions: 0, m3Target: 5000 },
    constitution: { version: 'v2.0', ratified: true, standingOrders: 25 },
    openCeoCards: 0,
  },
  phases: [],
  punchlist: [],
  sprints: [],
  tests: { activeGreen: 0, autoSkip: 0, workspaces: 0 },
  migrations: { count: 0, latestId: '0000' },
  pm2Services: 0,
  halts: [],
  ctoDeltas: [],
  buildHistory: [],
};

function makeApp(opts: { deployEnabled?: boolean; secret?: string; manualToken?: string } = {}) {
  let lastInvocation: { args: string[] } | null = null;
  const command: DeployCommandRunner = async (_cmd, args) => {
    lastInvocation = { args };
    return { code: 0, stdout: 'deploy ok', stderr: '' };
  };
  const history = new DeployHistory();
  const app = createServer({
    logger: silent,
    getStatus: () => FAKE_STATUS,
    deploy: {
      deployEnabled: opts.deployEnabled ?? true,
      webhookSecret: opts.secret ?? SECRET,
      manualDeployToken: opts.manualToken ?? 'manual-token',
      deployScriptPath: '/x/setu-deploy.sh',
      repoRoot: '/x',
    },
    command,
    history,
  });
  return { app, history, peek: () => lastInvocation };
}

describe('Setu deploy webhook', () => {
  it('returns 503 when deploy is disabled', async () => {
    const { app } = makeApp({ deployEnabled: false });
    const r = await request(app)
      .post('/v1/setu/deploys/webhook')
      .set('content-type', 'application/json')
      .send('{}');
    expect(r.status).toBe(503);
  });

  it('returns 401 on bad signature', async () => {
    const { app } = makeApp();
    const body = JSON.stringify({
      ref: 'refs/heads/main',
      before: 'a',
      after: 'b',
    });
    const r = await request(app)
      .post('/v1/setu/deploys/webhook')
      .set('content-type', 'application/json')
      .set('x-github-event', 'push')
      .set('x-hub-signature-256', 'sha256=' + 'a'.repeat(64))
      .send(body);
    expect(r.status).toBe(401);
  });

  it('ignores non-push events with 202', async () => {
    const { app } = makeApp();
    const body = JSON.stringify({});
    const r = await request(app)
      .post('/v1/setu/deploys/webhook')
      .set('content-type', 'application/json')
      .set('x-github-event', 'ping')
      .set('x-hub-signature-256', signGitHubBody(body, SECRET))
      .send(body);
    expect(r.status).toBe(202);
    expect(r.body.status).toBe('ignored');
  });

  it('ignores pushes to non-deploy branches with 202', async () => {
    const { app } = makeApp();
    const body = JSON.stringify({
      ref: 'refs/heads/feature-x',
      before: 'a',
      after: 'b',
    });
    const r = await request(app)
      .post('/v1/setu/deploys/webhook')
      .set('content-type', 'application/json')
      .set('x-github-event', 'push')
      .set('x-hub-signature-256', signGitHubBody(body, SECRET))
      .send(body);
    expect(r.status).toBe(202);
    expect(r.body.status).toBe('ignored');
  });

  it('runs the deploy script on push to main and records history', async () => {
    const { app, history, peek } = makeApp();
    const body = JSON.stringify({
      ref: 'refs/heads/main',
      before: 'a',
      after: 'abc1234',
    });
    const r = await request(app)
      .post('/v1/setu/deploys/webhook')
      .set('content-type', 'application/json')
      .set('x-github-event', 'push')
      .set('x-hub-signature-256', signGitHubBody(body, SECRET))
      .send(body);
    expect(r.status).toBe(202);
    expect(r.body.ok).toBe(true);
    expect(r.body.env).toBe('production');
    expect(peek()?.args).toEqual(['production', 'main', 'abc1234']);
    expect(history.list()).toHaveLength(1);
    expect(history.latest()?.trigger).toBe('webhook');
  });

  it('runs deploy on push to claude/* (staging)', async () => {
    const { app, peek } = makeApp();
    const body = JSON.stringify({
      ref: 'refs/heads/claude/setup-qorium-build-agent-zA0l5',
      before: 'a',
      after: 'b',
    });
    const r = await request(app)
      .post('/v1/setu/deploys/webhook')
      .set('content-type', 'application/json')
      .set('x-github-event', 'push')
      .set('x-hub-signature-256', signGitHubBody(body, SECRET))
      .send(body);
    expect(r.status).toBe(202);
    expect(r.body.env).toBe('staging');
    expect(peek()?.args[0]).toBe('staging');
  });
});

describe('Setu manual deploy', () => {
  it('rejects unauthenticated requests', async () => {
    const { app } = makeApp();
    const r = await request(app)
      .post('/v1/setu/deploys/manual')
      .set('content-type', 'application/json')
      .send({ env: 'staging' });
    expect(r.status).toBe(401);
  });

  it('runs deploy when authorised', async () => {
    const { app, history } = makeApp();
    const r = await request(app)
      .post('/v1/setu/deploys/manual')
      .set('authorization', 'Bearer manual-token')
      .set('content-type', 'application/json')
      .send({ env: 'staging', branch: 'main', commit: 'abc' });
    expect(r.status).toBe(200);
    expect(history.latest()?.trigger).toBe('manual');
  });
});

describe('Setu deploys history endpoints', () => {
  it('GET /v1/setu/deploys lists', async () => {
    const { app, history } = makeApp();
    history.record({
      id: 'h1',
      trigger: 'manual',
      ok: true,
      env: 'staging',
      branch: 'main',
      commit: 'abc',
      startedAt: '2026-05-03T20:00:00Z',
      finishedAt: '2026-05-03T20:01:00Z',
      durationMs: 60_000,
      exitCode: 0,
      stdout: '',
      stderr: '',
    });
    const r = await request(app).get('/v1/setu/deploys');
    expect(r.status).toBe(200);
    expect(r.body.count).toBe(1);
  });

  it('GET /v1/setu/deploys/latest returns 404 when empty', async () => {
    const { app } = makeApp();
    const r = await request(app).get('/v1/setu/deploys/latest');
    expect(r.status).toBe(404);
  });
});
