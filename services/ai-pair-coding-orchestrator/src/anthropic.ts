/**
 * Anthropic Claude client per
 * `infra/Wave-3-AI-Pair-Coding-Format-Prototype-Spec-v0.md` §2.2.
 *
 * Stub-vs-Real pattern (Real throws on missing API key).
 */

export interface AnthropicMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AnthropicCompletionInputs {
  systemPrompt?: string;
  messages: AnthropicMessage[];
  /** Optional max tokens cap. Default 1024. */
  maxTokens?: number;
}

export interface AnthropicCompletion {
  text: string;
  usage: { inputTokens: number; outputTokens: number };
  modelId: string;
}

export interface AnthropicClient {
  complete(inputs: AnthropicCompletionInputs): Promise<AnthropicCompletion>;
}

export interface AnthropicCredentials {
  apiKey: string;
  modelId?: string;
}

/** Stub client — no network calls; returns a deterministic mock. */
export function stubAnthropicClient(modelId: string = 'claude-sonnet-4-6-stub'): AnthropicClient {
  return {
    async complete(inputs) {
      const lastUser = [...inputs.messages].reverse().find((m) => m.role === 'user');
      const text = `[stub Claude] I would help with: ${(lastUser?.content ?? '').slice(0, 80)}…\n\nHere's a starting point:\n\n\`\`\`ts\n// pseudocode\n\`\`\``;
      return {
        text,
        usage: { inputTokens: 32, outputTokens: 64 },
        modelId,
      };
    },
  };
}

/** Real client — gated on API key presence. */
export function realAnthropicClient(opts: {
  credentials: AnthropicCredentials | null;
  fetchImpl?: typeof fetch;
}): AnthropicClient {
  if (!opts.credentials) {
    throw new Error('realAnthropicClient: ANTHROPIC_API_KEY required for live mode');
  }
  const fetchImpl = opts.fetchImpl ?? fetch;
  const modelId = opts.credentials.modelId ?? 'claude-sonnet-4-6';
  const apiKey = opts.credentials.apiKey;
  return {
    async complete(inputs) {
      const res = await fetchImpl('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: modelId,
          max_tokens: inputs.maxTokens ?? 1024,
          system: inputs.systemPrompt,
          messages: inputs.messages,
        }),
      });
      if (!res.ok) {
        throw new Error(`anthropic completion failed: HTTP ${res.status}`);
      }
      const body = (await res.json()) as {
        content: Array<{ type: string; text: string }>;
        usage: { input_tokens: number; output_tokens: number };
        model: string;
      };
      const text = body.content
        .filter((c) => c.type === 'text')
        .map((c) => c.text)
        .join('\n');
      return {
        text,
        usage: { inputTokens: body.usage.input_tokens, outputTokens: body.usage.output_tokens },
        modelId: body.model,
      };
    },
  };
}
