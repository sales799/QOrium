import { describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import { pino } from 'pino';
import { createHttpLogger } from '../src/logger.js';

const secret = 'synthetic_candidate_secret_123456789';
async function capture(path: string, status = 200) {
  const lines: string[] = [];
  const logger = pino(
    { level: 'info' },
    {
      write: (line: string) => {
        lines.push(line);
      },
    },
  );
  const app = express();
  app.use(createHttpLogger(logger));
  app.use((req, res) => {
    req.log.info('synthetic handler reached');
    res.setHeader('set-cookie', `session=${secret}`);
    res.setHeader('location', `/next?token=${secret}`);
    res.status(status).json({ originalUrl: req.originalUrl });
  });
  const response = await request(app)
    .get(path)
    .set('authorization', `Bearer ${secret}`)
    .set('cookie', `session=${secret}`)
    .set('referer', `https://candidate.example/t/${secret}`)
    .set('x-talpro-api-key', secret)
    .set('x-request-id', 'synthetic-request-123');
  return { response, text: lines.join(''), logs: lines.map((line) => JSON.parse(line)) };
}

describe('HTTP log candidate privacy', () => {
  it.each([200, 404, 500])(
    'omits invitation credentials from %i request logs without mutating requests',
    async (status) => {
      const path = `/v1/invitations/${secret}/start?token=${secret}`;
      const { response, text, logs } = await capture(path, status);
      expect(response.body.originalUrl).toBe(path);
      expect(response.headers['x-request-id']).toBe('synthetic-request-123');
      expect(text).not.toContain(secret);
      expect(logs.at(-1)).toMatchObject({
        req: {
          id: 'synthetic-request-123',
          method: 'GET',
          url: '/v1/invitations/[REDACTED]/start',
        },
        res: { statusCode: status },
      });
      expect(logs.at(-1).responseTime).toBeTypeOf('number');
    },
  );
  it('omits all query values while preserving the attempt route', async () => {
    const { text, logs } = await capture(
      `/v1/attempts/123/state?token=${secret}&token=${secret}&email=${secret}`,
    );
    expect(text).not.toContain(secret);
    expect(logs.at(-1).req.url).toBe('/v1/attempts/123/state');
  });
  it.each([
    `/V1/INVITATIONS/${secret}`,
    `/v1/%69nvitations/${secret}/proctoring`,
    `/v1/invitations/${secret}/unexpected/${secret}`,
    `/v1/proof/${secret}/view`,
  ])('conceals bearer paths including encoded prefixes and unknown suffixes: %s', async (path) => {
    const { text } = await capture(path);
    expect(text).not.toContain(secret);
  });
  it('preserves ordinary route diagnostics', async () => {
    const { logs } = await capture('/healthz');
    expect(logs.at(-1).req.url).toBe('/healthz');
    expect(logs.at(-1).msg).toBe('200 OK');
  });
});
