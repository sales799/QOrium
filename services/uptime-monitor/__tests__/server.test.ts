import { describe, expect, it } from 'vitest';
import request from 'supertest';
import pino from 'pino';
import { createServer } from '../src/server';
import { applyRun, createInitialState } from '../src/state';

const silent = pino({ level: 'silent' });

describe('uptime-monitor server', () => {
  it('GET /healthz returns ok', async () => {
    const app = createServer({ logger: silent, getState: () => createInitialState() });
    const r = await request(app).get('/healthz');
    expect(r.status).toBe(200);
  });

  it('GET /v1/uptime/status returns 503 before the first tick', async () => {
    const app = createServer({ logger: silent, getState: () => createInitialState() });
    const r = await request(app).get('/v1/uptime/status');
    expect(r.status).toBe(503);
  });

  it('GET /v1/uptime/status returns the snapshot once a tick has run', async () => {
    let state = createInitialState();
    state = applyRun(state, {
      results: [{ name: 'http.x', status: 'pass', durationMs: 1 }],
      passed: 1,
      failed: 0,
      skipped: 0,
      durationMs: 1,
    });
    const app = createServer({ logger: silent, getState: () => state });
    const r = await request(app).get('/v1/uptime/status');
    expect(r.status).toBe(200);
    expect(r.body.summary.passed).toBe(1);
  });

  it('GET /v1/uptime/slo returns the rolling availability', async () => {
    const state = createInitialState();
    state.history.push({ ts: Date.now() - 1000, failed: false, check: 'a' });
    state.history.push({ ts: Date.now() - 1000, failed: true, check: 'b' });
    const app = createServer({ logger: silent, getState: () => state });
    const r = await request(app).get('/v1/uptime/slo?window=1h');
    expect(r.status).toBe(200);
    expect(r.body.totalChecks).toBe(2);
    expect(r.body.availability).toBe(0.5);
  });
});
