import type { Pool } from '@qorium/db';
import type { ChatMessage, ChatSession, LeadCaptureInput, LeadCaptureResult } from '../types.js';
import { hashValue, redactEmail, redactPii } from '../privacy.js';
import type { ConversationStore } from './memory.js';

interface SessionRow {
  id: string;
  public_id: string;
  page_path: string;
  created_at: Date;
}

interface MessageRow {
  id: string;
  role: ChatMessage['role'];
  content_redacted: string;
  intent: ChatMessage['intent'] | null;
  citations: ChatMessage['citations'];
  created_at: Date;
}

interface LeadRow {
  id: string;
}

export class PostgresConversationStore implements ConversationStore {
  constructor(private readonly pool: Pool) {}

  async create(pagePath: string): Promise<ChatSession> {
    const publicId = `chat_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`;
    const result = await this.pool.query<SessionRow>(
      `INSERT INTO chatbot_sessions (public_id, page_path)
       VALUES ($1, $2)
       RETURNING id, public_id, page_path, created_at`,
      [publicId, pagePath],
    );
    const row = result.rows[0];
    if (!row) throw new Error('Failed to create chatbot session.');
    return {
      id: row.public_id,
      pagePath: row.page_path,
      createdAt: row.created_at.toISOString(),
      messages: [],
    };
  }

  async get(sessionId: string): Promise<ChatSession | undefined> {
    const sessionResult = await this.pool.query<SessionRow>(
      `SELECT id, public_id, page_path, created_at
         FROM chatbot_sessions
        WHERE public_id = $1
        LIMIT 1`,
      [sessionId],
    );
    const session = sessionResult.rows[0];
    if (!session) return undefined;

    const messageResult = await this.pool.query<MessageRow>(
      `SELECT id, role, content_redacted, intent, citations, created_at
         FROM chatbot_messages
        WHERE session_id = $1
        ORDER BY created_at ASC`,
      [session.id],
    );

    return {
      id: session.public_id,
      pagePath: session.page_path,
      createdAt: session.created_at.toISOString(),
      messages: messageResult.rows.map((row) => ({
        id: row.id,
        role: row.role,
        content: row.content_redacted,
        createdAt: row.created_at.toISOString(),
        ...(row.citations ? { citations: row.citations } : {}),
        ...(row.intent ? { intent: row.intent } : {}),
      })),
    };
  }

  async appendMessage(
    sessionId: string,
    message: Omit<ChatMessage, 'id' | 'createdAt'>,
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO chatbot_messages (session_id, role, content_redacted, intent, citations)
       SELECT id, $2, $3, $4, $5::jsonb
         FROM chatbot_sessions
        WHERE public_id = $1`,
      [
        sessionId,
        message.role,
        redactPii(message.content),
        message.intent ?? null,
        JSON.stringify(message.citations ?? []),
      ],
    );
  }

  async captureLead(input: LeadCaptureInput): Promise<LeadCaptureResult> {
    const result = await this.pool.query<LeadRow>(
      `INSERT INTO chatbot_leads (
         session_id,
         email_hash,
         email_redacted,
         company,
         role,
         need_redacted,
         page_path
       )
       VALUES (
         (SELECT id FROM chatbot_sessions WHERE public_id = $1 LIMIT 1),
         $2,
         $3,
         $4,
         $5,
         $6,
         $7
       )
       RETURNING id`,
      [
        input.sessionId ?? null,
        hashValue(input.email),
        redactEmail(input.email),
        input.company,
        input.role,
        redactPii(input.need),
        input.pagePath ?? null,
      ],
    );
    const row = result.rows[0];
    if (!row) throw new Error('Failed to capture chatbot lead.');
    return { ok: true, leadId: `lead_${row.id.replace(/-/g, '').slice(0, 24)}` };
  }
}
