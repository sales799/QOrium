import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { pino } from 'pino';
import { createServer } from '../src/server.js';
import type { Config } from '../src/config.js';

function testConfig(overrides: Partial<Config> = {}): Config {
  return {
    serviceName: 'qorium-readybank',
    nodeEnv: 'test',
    port: 0,
    logLevel: 'silent',
    version: '0.0.0-test',
    gitSha: 'testsha',
    sentryDsn: undefined,
    ...overrides,
  };
}

const silentLogger = pino({ level: 'silent' });

describe('readybank server', () => {
  describe('GET /healthz', () => {
    it('returns 200 with service metadata', async () => {
      const { app } = createServer({ config: testConfig(), logger: silentLogger });
      const res = await request(app).get('/healthz');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: 'ok',
        service: 'qorium-readybank',
        version: '0.0.0-test',
        git_sha: 'testsha',
        env: 'test',
      });
      expect(res.body.uptime_seconds).toBeGreaterThanOrEqual(0);
      expect(res.body.checks.db).toBe('not-configured');
    });

    it('emits a request id header', async () => {
      const { app } = createServer({ config: testConfig(), logger: silentLogger });
      const res = await request(app).get('/healthz');
      expect(res.headers['x-request-id']).toMatch(/[0-9a-f-]{8,}/i);
    });

    it('echoes a caller-provided request id', async () => {
      const { app } = createServer({ config: testConfig(), logger: silentLogger });
      const res = await request(app).get('/healthz').set('x-request-id', 'abc-123');
      expect(res.headers['x-request-id']).toBe('abc-123');
    });
  });

  describe('GET /health', () => {
    it('aliases the public liveness endpoint used by monitors', async () => {
      const { app } = createServer({ config: testConfig(), logger: silentLogger });
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: 'ok',
        service: 'qorium-readybank',
      });
    });
  });

  describe('GET /readyz', () => {
    it('returns 200 with checks.db not-configured when no pool', async () => {
      const { app } = createServer({ config: testConfig(), logger: silentLogger });
      const res = await request(app).get('/readyz');
      expect(res.status).toBe(200);
      expect(res.body.checks.db).toBe('not-configured');
    });
  });

  describe('security headers', () => {
    it('sets HSTS, X-Content-Type-Options, X-Frame-Options, CSP', async () => {
      const { app } = createServer({ config: testConfig(), logger: silentLogger });
      const res = await request(app).get('/healthz');

      expect(res.headers['strict-transport-security']).toContain('max-age=');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers['content-security-policy']).toContain("default-src 'self'");
      expect(res.headers['content-security-policy']).not.toContain('unsafe-inline');
    });

    it('removes the x-powered-by header', async () => {
      const { app } = createServer({ config: testConfig(), logger: silentLogger });
      const res = await request(app).get('/healthz');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('404 handler', () => {
    it('returns RFC 7807 problem details for unknown routes', async () => {
      const { app } = createServer({ config: testConfig(), logger: silentLogger });
      const res = await request(app).get('/v1/does-not-exist');

      expect(res.status).toBe(404);
      expect(res.headers['content-type']).toContain('application/problem+json');
      expect(res.body).toMatchObject({
        type: expect.stringContaining('not-found'),
        title: 'Not Found',
        status: 404,
        instance: '/v1/does-not-exist',
      });
    });
  });
});
