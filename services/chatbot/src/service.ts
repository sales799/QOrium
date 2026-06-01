import type { ChatModel } from './llm/types.js';
import { classifyIntent, policyReplyForIntent } from './policy.js';
import type { Retriever } from './rag/types.js';
import type { ChatbotResponse, Citation, LeadCaptureInput, LeadCaptureResult } from './types.js';
import type { ConversationStore } from './store/memory.js';
import { NoopLeadNotifier, type LeadNotifier } from './notify.js';

export interface ChatbotServiceDeps {
  store: ConversationStore;
  retriever: Retriever;
  model: ChatModel;
  notifier?: LeadNotifier;
}

export class ChatbotService {
  private readonly store: ConversationStore;
  private readonly retriever: Retriever;
  private readonly model: ChatModel;
  private readonly notifier: LeadNotifier;

  constructor(deps: ChatbotServiceDeps) {
    this.store = deps.store;
    this.retriever = deps.retriever;
    this.model = deps.model;
    this.notifier = deps.notifier ?? new NoopLeadNotifier();
  }

  async createSession(input: { pagePath?: string | undefined }): Promise<{
    sessionId: string;
    greeting: string;
  }> {
    const session = await this.store.create(input.pagePath ?? '/');
    const greeting =
      'Hi. I can answer QOrium buyer questions from cited public surfaces, route pricing to sales, or escalate to a human.';
    await this.store.appendMessage(session.id, { role: 'assistant', content: greeting });
    return { sessionId: session.id, greeting };
  }

  async handleMessage(input: {
    sessionId: string;
    message: string;
    pagePath?: string | undefined;
  }): Promise<ChatbotResponse> {
    const session = await this.store.get(input.sessionId);
    if (!session) {
      return {
        intent: 'unsupported',
        reply: 'I could not find this chatbot session. Please reopen the QOrium chat.',
        citations: [],
      };
    }

    await this.store.appendMessage(input.sessionId, {
      role: 'user',
      content: input.message,
    });

    const policyReply = policyReplyForIntent(classifyIntent(input.message));
    if (policyReply) {
      await this.store.appendMessage(input.sessionId, {
        role: 'assistant',
        content: policyReply.reply,
        citations: policyReply.citations,
        intent: policyReply.intent,
      });
      return policyReply;
    }

    const retrieved = await this.retriever.search(input.message, 3);
    const citations: Citation[] = retrieved.map((chunk) => ({
      id: chunk.id,
      title: chunk.title,
      url: chunk.url,
      excerpt: chunk.excerpt ?? chunk.content.slice(0, 180),
    }));

    if (citations.length === 0) {
      const unsupported: ChatbotResponse = {
        intent: 'unsupported',
        reply:
          'I do not have a cited source for that claim on shipped QOrium surfaces yet. I can answer from the library, method, trust, security, pricing, and platform pages.',
        citations: [],
      };
      await this.store.appendMessage(input.sessionId, {
        role: 'assistant',
        content: unsupported.reply,
        citations: [],
        intent: unsupported.intent,
      });
      return unsupported;
    }

    const completion = await this.model.complete({
      message: input.message,
      pagePath: input.pagePath ?? session.pagePath,
      citations,
      history: session.messages,
    });

    const response: ChatbotResponse = {
      intent: 'answer',
      reply: completion.reply,
      citations,
    };
    await this.store.appendMessage(input.sessionId, {
      role: 'assistant',
      content: response.reply,
      citations: response.citations,
      intent: response.intent,
    });
    return response;
  }

  async captureLead(input: LeadCaptureInput): Promise<LeadCaptureResult> {
    if (input.sessionId) {
      const session = await this.store.get(input.sessionId);
      if (session) {
        await this.store.appendMessage(input.sessionId, {
          role: 'user',
          content: `Lead captured for ${input.email} at ${input.company}: ${input.need}`,
        });
      }
    }
    const result = await this.store.captureLead(input);
    await this.notifier.sendLead(input);
    return result;
  }
}
