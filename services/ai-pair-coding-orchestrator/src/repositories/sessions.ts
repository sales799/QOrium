import type { Pool } from '@qorium/db';
import type { GraderOutput } from '../grader.js';

export interface SessionRow {
  id: string;
  questionId: string | null;
  candidateId: string;
  tenantId: string;
  startedAt: string;
  submittedAt: string | null;
  status: string;
  finalCodeText: string | null;
  aiMessagesCount: number;
  candidateTypedChars: number;
  candidatePastedChars: number;
  editTestCycles: number;
  signals: Record<string, unknown>;
  grades: GraderOutput | null;
  aiProvider: string;
  aiModel: string;
}

interface RawRow {
  id: string;
  question_id: string | null;
  candidate_id: string;
  tenant_id: string;
  started_at: Date;
  submitted_at: Date | null;
  status: string;
  final_code_text: string | null;
  ai_messages_count: number;
  candidate_typed_chars: number;
  candidate_pasted_chars: number;
  edit_test_cycles: number;
  signals: Record<string, unknown> | null;
  grades: GraderOutput | null;
  ai_provider: string;
  ai_model: string;
}

const SELECT = `
  SELECT id, question_id, candidate_id, tenant_id, started_at, submitted_at, status,
         final_code_text, ai_messages_count, candidate_typed_chars, candidate_pasted_chars,
         edit_test_cycles, signals, grades, ai_provider, ai_model
    FROM content.ai_pair_coding_sessions
`;

function toRow(r: RawRow): SessionRow {
  return {
    id: r.id,
    questionId: r.question_id,
    candidateId: r.candidate_id,
    tenantId: r.tenant_id,
    startedAt: r.started_at.toISOString(),
    submittedAt: r.submitted_at?.toISOString() ?? null,
    status: r.status,
    finalCodeText: r.final_code_text,
    aiMessagesCount: r.ai_messages_count,
    candidateTypedChars: r.candidate_typed_chars,
    candidatePastedChars: r.candidate_pasted_chars,
    editTestCycles: r.edit_test_cycles,
    signals: r.signals ?? {},
    grades: r.grades,
    aiProvider: r.ai_provider,
    aiModel: r.ai_model,
  };
}

export interface CreateSessionInput {
  questionId: string | null;
  candidateId: string;
  tenantId: string;
  aiProvider?: 'anthropic' | 'openai' | 'gemini';
  aiModel?: string;
}

export async function createSession(pool: Pool, input: CreateSessionInput): Promise<SessionRow> {
  const result = await pool.query<RawRow>(
    `INSERT INTO content.ai_pair_coding_sessions
       (question_id, candidate_id, tenant_id, ai_provider, ai_model)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, question_id, candidate_id, tenant_id, started_at, submitted_at, status,
               final_code_text, ai_messages_count, candidate_typed_chars, candidate_pasted_chars,
               edit_test_cycles, signals, grades, ai_provider, ai_model`,
    [
      input.questionId,
      input.candidateId,
      input.tenantId,
      input.aiProvider ?? 'anthropic',
      input.aiModel ?? 'claude-sonnet-4-6',
    ],
  );
  const row = result.rows[0];
  if (!row) throw new Error('createSession: insert returned no row');
  return toRow(row);
}

export async function getSession(pool: Pool, id: string): Promise<SessionRow | null> {
  const result = await pool.query<RawRow>(`${SELECT} WHERE id = $1 LIMIT 1`, [id]);
  return result.rows[0] ? toRow(result.rows[0]) : null;
}

export async function appendMessage(
  pool: Pool,
  input: {
    sessionId: string;
    role: 'candidate' | 'ai_assistant' | 'system';
    text: string;
    containedCode?: boolean;
    candidateAction?: 'accepted' | 'modified' | 'rejected' | 'ignored' | null;
  },
): Promise<{ id: string }> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO content.ai_pair_coding_messages
       (session_id, role, message_text, contained_code, candidate_action)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      input.sessionId,
      input.role,
      input.text,
      input.containedCode ?? false,
      input.candidateAction ?? null,
    ],
  );
  const row = result.rows[0];
  if (!row) throw new Error('appendMessage: insert returned no row');
  return row;
}

export async function submitSession(
  pool: Pool,
  id: string,
  input: {
    finalCodeText: string;
    signals: Record<string, unknown>;
    grades: GraderOutput;
    aiMessagesCount: number;
    candidateTypedChars: number;
    candidatePastedChars: number;
    editTestCycles: number;
  },
): Promise<SessionRow | null> {
  const result = await pool.query<RawRow>(
    `UPDATE content.ai_pair_coding_sessions
        SET status = 'submitted',
            submitted_at = NOW(),
            final_code_text = $1,
            signals = $2,
            grades = $3,
            ai_messages_count = $4,
            candidate_typed_chars = $5,
            candidate_pasted_chars = $6,
            edit_test_cycles = $7,
            updated_at = NOW()
      WHERE id = $8
      RETURNING id, question_id, candidate_id, tenant_id, started_at, submitted_at, status,
                final_code_text, ai_messages_count, candidate_typed_chars, candidate_pasted_chars,
                edit_test_cycles, signals, grades, ai_provider, ai_model`,
    [
      input.finalCodeText,
      input.signals,
      input.grades,
      input.aiMessagesCount,
      input.candidateTypedChars,
      input.candidatePastedChars,
      input.editTestCycles,
      id,
    ],
  );
  return result.rows[0] ? toRow(result.rows[0]) : null;
}
