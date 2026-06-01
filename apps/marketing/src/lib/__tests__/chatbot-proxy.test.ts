import { describe, expect, it } from 'vitest';
import { chatbotServiceUrl, signLeadPayload } from '../chatbot-proxy';

describe('chatbot proxy helpers', () => {
  it('normalizes the chatbot service base URL', () => {
    expect(chatbotServiceUrl('http://localhost:5105/')).toBe('http://localhost:5105');
    expect(chatbotServiceUrl(undefined)).toBe('http://localhost:5105');
  });

  it('creates deterministic HMAC signatures for lead capture', async () => {
    const payload = { email: 'buyer@example.com', company: 'Acme', role: 'TA', need: 'Demo' };
    const first = await signLeadPayload(payload, 'secret');
    const second = await signLeadPayload(payload, 'secret');

    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });
});
