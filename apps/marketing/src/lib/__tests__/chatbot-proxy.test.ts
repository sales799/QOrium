import { afterEach, describe, expect, it, vi } from 'vitest';
import { chatbotServiceUrl, proxyChatbotJson, signLeadPayload } from '../chatbot-proxy';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('chatbot proxy helpers', () => {
  it('normalizes the chatbot service base URL', () => {
    expect(chatbotServiceUrl('http://localhost:5105/')).toBe('http://localhost:5105');
    expect(chatbotServiceUrl(undefined)).toBe('http://127.0.0.1:5122');
  });

  it('creates deterministic HMAC signatures for lead capture', async () => {
    const payload = { email: 'buyer@example.com', company: 'Acme', role: 'TA', need: 'Demo' };
    const first = await signLeadPayload(payload, 'secret');
    const second = await signLeadPayload(payload, 'secret');

    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });

  it('returns a JSON bad-gateway envelope when the service is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('connection refused')));

    const proxied = await proxyChatbotJson('/v1/chatbot/message', {
      sessionId: 'chat_test',
      message: 'What is ReadyBank?',
    });

    expect(proxied).toEqual({
      status: 502,
      body: {
        ok: false,
        data: null,
        error: { code: 'bad_gateway', message: 'Chatbot service is unavailable.' },
      },
    });
  });
});
