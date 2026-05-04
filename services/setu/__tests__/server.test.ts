import { describe, expect, it } from 'vitest';
import request from 'supertest';
import pino from 'pino';
import { createServer } from '../src/server';
import { SCHEMA_VERSION, type QoriumStatus } from '../src/schema';

const silent = pino({ level: 'silent' });

const FIXTURE_STATUS: QoriumStatus = {
  schemaVersion: SCHEMA_VERSION,
  generatedAt: '2026-05-03T20:00:00Z',
  branch: 'claude/setup-qorium-build-agent-zA0l5',
  prNumber: 9,
  head: 'abc1234',
  hero: {
    phase0CompletionPercent: 100,
    contentInventory: { questions: 470, m3Target: 5000 },
    constitution: { version: 'v2.0', ratified: true, standingOrders: 25 },
    openCeoCards: 1,
  },
  phases: [{ index: 0, name: 'Foundation', status: 'shipped', completion: 1 }],
  punchlist: [{ key: 'A', title: 'Capital & Legal', done: 0, total: 8, notes: '', completion: 0 }],
  sprints: [
    { id: '2.10', name: 'AI pair-coding', status: 'shipped', testsAdded: 29, cumulativeTests: 782 },
  ],
  tests: { activeGreen: 781, autoSkip: 53, workspaces: 24 },
  migrations: { count: 14, latestId: '0014' },
  pm2Services: 17,
  halts: [{ bucket: 'Phase 1', description: 'DATABASE_URL' }],
  ctoDeltas: [{ number: 1, sprint: '1.1', file: 'CTO-DELTA-aaa.md', title: 'aaa' }],
  buildHistory: [
    { timestamp: '2026-05-03T18:49Z', sprint: '2.3', commit: '2b90c27', pushed: true },
  ],
};

describe('Setu express server', () => {
  it('GET /healthz returns ok', async () => {
    const app = createServer({ logger: silent, getStatus: () => FIXTURE_STATUS });
    const r = await request(app).get('/healthz');
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ status: 'ok', service: 'qorium-setu' });
  });

  it('GET /v1/setu/status returns the full payload', async () => {
    const app = createServer({ logger: silent, getStatus: () => FIXTURE_STATUS });
    const r = await request(app).get('/v1/setu/status');
    expect(r.status).toBe(200);
    expect(r.body.schemaVersion).toBe(SCHEMA_VERSION);
    expect(r.body.tests.activeGreen).toBe(781);
  });

  it('GET /v1/setu/status/hero returns just the hero card subset', async () => {
    const app = createServer({ logger: silent, getStatus: () => FIXTURE_STATUS });
    const r = await request(app).get('/v1/setu/status/hero');
    expect(r.status).toBe(200);
    expect(r.body.hero.contentInventory.questions).toBe(470);
    expect(r.body.sprints).toBeUndefined();
  });

  it('GET /v1/setu/status/sprints returns the sprint table', async () => {
    const app = createServer({ logger: silent, getStatus: () => FIXTURE_STATUS });
    const r = await request(app).get('/v1/setu/status/sprints');
    expect(r.status).toBe(200);
    expect(r.body.sprints).toHaveLength(1);
    expect(r.body.tests.workspaces).toBe(24);
  });

  it('GET /v1/setu/status/halts returns the activation halts list', async () => {
    const app = createServer({ logger: silent, getStatus: () => FIXTURE_STATUS });
    const r = await request(app).get('/v1/setu/status/halts');
    expect(r.status).toBe(200);
    expect(r.body.halts[0]).toMatchObject({ bucket: 'Phase 1' });
  });

  it('GET /v1/setu/status/cto-deltas returns the CTO-DELTA registry', async () => {
    const app = createServer({ logger: silent, getStatus: () => FIXTURE_STATUS });
    const r = await request(app).get('/v1/setu/status/cto-deltas');
    expect(r.status).toBe(200);
    expect(r.body.ctoDeltas).toHaveLength(1);
  });

  it('returns RFC 7807 problem JSON for unknown routes', async () => {
    const app = createServer({ logger: silent, getStatus: () => FIXTURE_STATUS });
    const r = await request(app).get('/nope');
    expect(r.status).toBe(404);
    expect(r.headers['content-type']).toMatch(/problem\+json/);
  });

  it('supports an async getStatus resolver', async () => {
    const app = createServer({
      logger: silent,
      getStatus: async () => FIXTURE_STATUS,
    });
    const r = await request(app).get('/v1/setu/status');
    expect(r.status).toBe(200);
  });
});
