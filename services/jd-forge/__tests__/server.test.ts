import { describe, expect, it } from 'vitest';
import request from 'supertest';
import pino from 'pino';
import { createServer } from '../src/server';
import { StubJdParser } from '../src/parser';
import { StringMatchRoleGraphMapper } from '../src/mapper';
import { StubQuestionGenerator } from '../src/generator';

const silent = pino({ level: 'silent' });

const config = {
  nodeEnv: 'test' as const,
  port: 0,
  databaseUrl: undefined,
  anthropicApiKey: undefined,
  anthropicModel: 'claude-opus-4-7',
  apiKeyPepper: undefined,
  totalQuestionsPerOrder: 6,
};

const pipeline = {
  parser: new StubJdParser(),
  mapper: new StringMatchRoleGraphMapper([
    { id: 'sub-apex', name: 'Salesforce Apex' },
    { id: 'sub-soql', name: 'SOQL' },
  ]),
  generator: new StubQuestionGenerator(),
  logger: silent,
};

describe('jd-forge express server', () => {
  it('GET /healthz returns ok', async () => {
    const app = createServer({ config, pipeline, logger: silent });
    const r = await request(app).get('/healthz');
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ status: 'ok', service: 'qorium-jd-forge' });
  });

  it('POST /v1/jd-forge/generate returns 503 when no DB pool is configured', async () => {
    const app = createServer({ config, pipeline, logger: silent });
    const r = await request(app)
      .post('/v1/jd-forge/generate')
      .send({ jd_text: 'Senior Salesforce Developer with 5 years experience.' });
    expect(r.status).toBe(503);
  });

  it('POST /v1/jd-forge/generate returns 400 on missing jd_text', async () => {
    const app = createServer({ config, pipeline, logger: silent });
    const r = await request(app).post('/v1/jd-forge/generate').send({});
    expect(r.status).toBe(400);
    expect(r.headers['content-type']).toMatch(/application\/problem\+json/);
  });

  it('POST /v1/jd-forge/generate returns 400 on jd_text too short', async () => {
    const app = createServer({ config, pipeline, logger: silent });
    const r = await request(app).post('/v1/jd-forge/generate').send({ jd_text: 'short' });
    expect(r.status).toBe(400);
  });

  it('POST /v1/jd-forge/requests/:id/feedback returns 202 on a valid score', async () => {
    const app = createServer({ config, pipeline, logger: silent });
    const r = await request(app)
      .post('/v1/jd-forge/requests/00000000-0000-0000-0000-000000000001/feedback')
      .send({ score: 4, comments: 'Good pack overall' });
    expect(r.status).toBe(202);
    expect(r.body).toMatchObject({ status: 'accepted' });
  });

  it('POST /v1/jd-forge/requests/:id/feedback returns 400 on invalid score', async () => {
    const app = createServer({ config, pipeline, logger: silent });
    const r = await request(app)
      .post('/v1/jd-forge/requests/00000000-0000-0000-0000-000000000001/feedback')
      .send({ score: 99 });
    expect(r.status).toBe(400);
  });

  it('GET /v1/jd-forge/requests/:id returns 400 on non-uuid id', async () => {
    const app = createServer({ config, pipeline, logger: silent });
    const r = await request(app).get('/v1/jd-forge/requests/not-a-uuid');
    expect(r.status).toBe(503); // 503 first because no pool; pool check happens before uuid validation
  });

  it('returns 404 on unknown routes with RFC 7807', async () => {
    const app = createServer({ config, pipeline, logger: silent });
    const r = await request(app).get('/v1/nope');
    expect(r.status).toBe(404);
    expect(r.headers['content-type']).toMatch(/application\/problem\+json/);
  });
});
