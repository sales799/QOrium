import { describe, expect, it } from 'vitest';
import { ChatbotService } from '../src/service.js';
import { InMemoryConversationStore } from '../src/store/memory.js';
import { InMemoryRetriever } from '../src/rag/retriever.js';
import type { ChatModel } from '../src/llm/types.js';

const model: ChatModel = {
  async complete({ citations }) {
    return {
      reply: `QOrium answers only from cited surfaces. Source: ${citations[0]?.title ?? 'none'}.`,
    };
  },
};

describe('ChatbotService', () => {
  it('creates a session with a greeting', async () => {
    const service = new ChatbotService({
      store: new InMemoryConversationStore(),
      retriever: new InMemoryRetriever([]),
      model,
    });

    const session = await service.createSession({ pagePath: '/' });

    expect(session.sessionId).toMatch(/^chat_/);
    expect(session.greeting).toContain('QOrium');
  });

  it('refuses unsupported claims when no citation is available', async () => {
    const service = new ChatbotService({
      store: new InMemoryConversationStore(),
      retriever: new InMemoryRetriever([]),
      model,
    });
    const session = await service.createSession({ pagePath: '/' });

    const response = await service.handleMessage({
      sessionId: session.sessionId,
      message: 'Do you integrate with Oracle Fusion today?',
      pagePath: '/',
    });

    expect(response.intent).toBe('unsupported');
    expect(response.citations).toEqual([]);
    expect(response.reply.toLowerCase()).toContain('do not have a cited source');
  });

  it('returns model answer with mandatory citations when corpus supports the claim', async () => {
    const service = new ChatbotService({
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
    const session = await service.createSession({ pagePath: '/platform/readybank' });

    const response = await service.handleMessage({
      sessionId: session.sessionId,
      message: 'What is ReadyBank?',
      pagePath: '/platform/readybank',
    });

    expect(response.intent).toBe('answer');
    expect(response.citations).toHaveLength(1);
    expect(response.citations[0]).toMatchObject({ url: '/platform/readybank' });
  });

  it('notifies humans when a lead is captured', async () => {
    const sent: string[] = [];
    const service = new ChatbotService({
      store: new InMemoryConversationStore(),
      retriever: new InMemoryRetriever([]),
      model,
      notifier: {
        async sendLead(input) {
          sent.push(input.email);
        },
      },
    });

    const result = await service.captureLead({
      email: 'buyer@example.com',
      company: 'Acme',
      role: 'TA Lead',
      need: 'Demo',
      pagePath: '/pricing',
    });

    expect(result.leadId).toMatch(/^lead_/);
    expect(sent).toEqual(['buyer@example.com']);
  });
});
