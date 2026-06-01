import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { pino } from 'pino';
import { createHmac } from 'node:crypto';
import { createServer } from '../src/server.js';
import { InMemoryConversationStore } from '../src/store/memory.js';
import { InMemoryRetriever } from '../src/rag/retriever.js';
import type { Config } from '../src/config.js';
import type { ChatModel } from '../src/llm/types.js';

const config: Config = {
  serviceName: 'qorium-chatbot',
  nodeEnv: 'test',
  port: 0,
  logLevel: 'silent',
  version: '0.0.0-test',
  gitSha: 'testsha',
  publicBaseUrl: 'https://qorium.online',
  leadHmacSecret: undefined,
  slackWebhookUrl: undefined,
  salesEmailTo: 'sales@qorium.online',
  emailWebhookUrl: undefined,
  anthropicApiKey: undefined,
  anthropicModel: 'claude-sonnet-4-6',
  openaiApiKey: undefined,
  openaiModel: 'gpt-4o-mini',
  systemPromptPath: undefined,
  requestLimitPerMinute: 30,
  sessionLimitPerDay: 200,
};

const model: ChatModel = {
  async complete({ citations }) {
    return { reply: `Cited answer from ${citations[0]?.title}.` };
  },
};

describe('chatbot server', () => {
  it('returns health metadata', async () => {
    const { app } = createServer({
      config,
      logger: pino({ level: 'silent' }),
      store: new InMemoryConversationStore(),
      retriever: new InMemoryRetriever([]),
      model,
    });

    const res = await request(app).get('/v1/chatbot/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      data: { service: 'qorium-chatbot', git_sha: 'testsha' },
      error: null,
    });
  });

  it('creates a session using the standard envelope', async () => {
    const { app } = createServer({
      config,
      logger: pino({ level: 'silent' }),
      store: new InMemoryConversationStore(),
      retriever: new InMemoryRetriever([]),
      model,
    });

    const res = await request(app).post('/v1/chatbot/session').send({ pagePath: '/' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.sessionId).toMatch(/^chat_/);
    expect(res.body.error).toBeNull();
  });

  it('returns cited message responses through the API', async () => {
    const { app } = createServer({
      config,
      logger: pino({ level: 'silent' }),
      store: new InMemoryConversationStore(),
      retriever: new InMemoryRetriever([
        {
          id: 'method',
          url: '/method',
          title: 'The QOrium Method',
          content: 'The QOrium Method combines AI drafting, expert review, and calibration.',
        },
      ]),
      model,
    });

    const session = await request(app).post('/v1/chatbot/session').send({ pagePath: '/method' });
    const res = await request(app).post('/v1/chatbot/message').send({
      sessionId: session.body.data.sessionId,
      message: 'What is the QOrium Method?',
      pagePath: '/method',
    });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.citations).toEqual([
      expect.objectContaining({ url: '/method', title: 'The QOrium Method' }),
    ]);
  });

  it('validates lead capture requests', async () => {
    const { app } = createServer({
      config,
      logger: pino({ level: 'silent' }),
      store: new InMemoryConversationStore(),
      retriever: new InMemoryRetriever([]),
      model,
    });

    const res = await request(app).post('/v1/chatbot/leadCapture').send({
      email: 'not-an-email',
      company: '',
      role: '',
      need: '',
    });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe('validation_error');
  });

  it('enforces signed lead capture when configured', async () => {
    const signedConfig: Config = {
      ...config,
      leadHmacSecret: 'test-secret',
    };
    const { app } = createServer({
      config: signedConfig,
      logger: pino({ level: 'silent' }),
      store: new InMemoryConversationStore(),
      retriever: new InMemoryRetriever([]),
      model,
    });
    const payload = {
      email: 'buyer@example.com',
      company: 'Acme',
      role: 'TA Lead',
      need: 'Demo',
    };

    const unsigned = await request(app).post('/v1/chatbot/leadCapture').send(payload);
    const signed = await request(app)
      .post('/v1/chatbot/leadCapture')
      .set(
        'x-qor-signature',
        createHmac('sha256', 'test-secret').update(JSON.stringify(payload)).digest('hex'),
      )
      .send(payload);

    expect(unsigned.status).toBe(401);
    expect(signed.status).toBe(200);
    expect(signed.body.data.leadId).toMatch(/^lead_/);
  });

  it('limits message volume per session', async () => {
    const limitedConfig: Config = {
      ...config,
      requestLimitPerMinute: 100,
      sessionLimitPerDay: 1,
    };
    const { app } = createServer({
      config: limitedConfig,
      logger: pino({ level: 'silent' }),
      store: new InMemoryConversationStore(),
      retriever: new InMemoryRetriever([
        {
          id: 'readybank',
          url: '/platform/readybank',
          title: 'ReadyBank',
          content: 'ReadyBank is QOrium’s calibrated assessment library.',
        },
      ]),
      model,
    });
    const session = await request(app).post('/v1/chatbot/session').send({ pagePath: '/' });
    const body = {
      sessionId: session.body.data.sessionId,
      message: 'What is ReadyBank?',
      pagePath: '/',
    };

    const first = await request(app).post('/v1/chatbot/message').send(body);
    const second = await request(app).post('/v1/chatbot/message').send(body);

    expect(first.status).toBe(200);
    expect(second.status).toBe(429);
    expect(second.body.error.code).toBe('rate_limit_exceeded');
  });
});
