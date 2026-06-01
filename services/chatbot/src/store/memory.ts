import { randomUUID } from 'node:crypto';
import type { ChatMessage, ChatSession, LeadCaptureInput, LeadCaptureResult } from '../types.js';

export interface ConversationStore {
  create(pagePath: string): Promise<ChatSession>;
  get(sessionId: string): Promise<ChatSession | undefined>;
  appendMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<void>;
  captureLead(input: LeadCaptureInput): Promise<LeadCaptureResult>;
}

export class InMemoryConversationStore implements ConversationStore {
  private readonly sessions = new Map<string, ChatSession>();

  async create(pagePath: string): Promise<ChatSession> {
    const session: ChatSession = {
      id: `chat_${randomUUID().replace(/-/g, '').slice(0, 24)}`,
      pagePath,
      createdAt: new Date().toISOString(),
      messages: [],
    };
    this.sessions.set(session.id, session);
    return session;
  }

  async get(sessionId: string): Promise<ChatSession | undefined> {
    return this.sessions.get(sessionId);
  }

  async appendMessage(
    sessionId: string,
    message: Omit<ChatMessage, 'id' | 'createdAt'>,
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Unknown chatbot session: ${sessionId}`);
    session.messages.push({
      ...message,
      id: `msg_${randomUUID().replace(/-/g, '').slice(0, 24)}`,
      createdAt: new Date().toISOString(),
    });
  }

  async captureLead(_input: LeadCaptureInput): Promise<LeadCaptureResult> {
    return { ok: true, leadId: `lead_${randomUUID().replace(/-/g, '').slice(0, 24)}` };
  }
}
