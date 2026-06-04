/**
 * Client wrapper for `services/ai-pair-coding-orchestrator`. Pure logic;
 * the page component invokes these via Next.js server actions or
 * server-side fetch. Tests inject `fetchImpl`.
 */

export interface OrchestratorClientOptions {
  baseUrl: string;
  tenantId?: string;
  fetchImpl?: typeof fetch;
}

export interface SessionDto {
  id: string;
  questionId: string | null;
  candidateId: string;
  tenantId: string;
  startedAt: string;
  submittedAt: string | null;
  status: 'in_progress' | 'submitted' | 'timeout' | 'abandoned';
  finalCodeText: string | null;
  aiMessagesCount: number;
  candidateTypedChars: number;
  candidatePastedChars: number;
  editTestCycles: number;
  signals: Record<string, unknown>;
  grades: unknown;
  aiProvider: string;
  aiModel: string;
}

export interface TurnResponse {
  ai_message: string;
  usage: { inputTokens: number; outputTokens: number };
  model_id: string;
}

export interface SessionSignalsInput {
  typedChars: number;
  pastedChars: number;
  editTestCycles: number;
  candidateMessageCount: number;
  acceptedVerbatimCount: number;
  acceptedModifiedCount: number;
  rejectedCount: number;
  seededErrorsCaught: number;
  seededErrorsTotal: number;
  codeQualityScore: number;
  timeToFirstCodeSec: number;
  durationSec: number;
}

export class OrchestratorClient {
  private readonly opts: OrchestratorClientOptions;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: OrchestratorClientOptions) {
    this.opts = opts;
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  async createSession(body: { candidate_id: string; question_id?: string }): Promise<SessionDto> {
    return this.request<SessionDto>('POST', '/v1/ai-pair-coding/sessions', body);
  }

  async getSession(id: string): Promise<SessionDto> {
    return this.request<SessionDto>('GET', `/v1/ai-pair-coding/sessions/${encodeURIComponent(id)}`);
  }

  async submitTurn(id: string, candidateMessage: string): Promise<TurnResponse> {
    return this.request<TurnResponse>(
      'POST',
      `/v1/ai-pair-coding/sessions/${encodeURIComponent(id)}/turn`,
      { candidate_message: candidateMessage },
    );
  }

  async submitSession(
    id: string,
    finalCodeText: string,
    signals: SessionSignalsInput,
  ): Promise<SessionDto> {
    return this.request<SessionDto>(
      'POST',
      `/v1/ai-pair-coding/sessions/${encodeURIComponent(id)}/submit`,
      { final_code_text: finalCodeText, signals },
    );
  }

  private async request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      accept: 'application/json',
    };
    if (this.opts.tenantId) headers['x-tenant-id'] = this.opts.tenantId;
    const init: RequestInit = { method, headers };
    if (body !== undefined) init.body = JSON.stringify(body);
    const res = await this.fetchImpl(`${this.opts.baseUrl}${path}`, init);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`orchestrator ${method} ${path} → ${res.status} ${text.slice(0, 200)}`);
    }
    return (await res.json()) as T;
  }
}

export function resolveOrchestratorUrl(env: NodeJS.ProcessEnv = process.env): string {
  return env.AI_PAIR_CODING_URL ?? 'http://localhost:5115';
}
