import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Config } from '../config.js';
import type { Citation } from '../types.js';
import type { ChatModel, ChatCompletionInput, ChatCompletionOutput } from './types.js';

const SYSTEM_PROMPT_FALLBACK =
  'You are the QOrium marketing chatbot. Answer only from supplied citations. If citations do not support the claim, refuse briefly. Never quote pricing.';

export class GroundedExtractiveModel implements ChatModel {
  async complete(input: ChatCompletionInput): Promise<ChatCompletionOutput> {
    const source = input.citations[0];
    const sourceLine = source ? ` Source: ${source.title}.` : '';
    return {
      reply:
        `Based on QOrium's cited public surfaces, ${input.message.trim()} is answered only where the cited source supports it.` +
        sourceLine,
    };
  }
}

export function createModelRouter(config: Config): ChatModel {
  if (!config.anthropicApiKey && !config.openaiApiKey) {
    return new GroundedExtractiveModel();
  }

  return new HostedModelRouter(config, loadSystemPrompt(config), new GroundedExtractiveModel());
}

class HostedModelRouter implements ChatModel {
  constructor(
    private readonly config: Config,
    private readonly systemPrompt: string,
    private readonly fallback: ChatModel,
  ) {}

  async complete(input: ChatCompletionInput): Promise<ChatCompletionOutput> {
    if (this.config.anthropicApiKey) {
      const anthropic = await this.completeWithAnthropic(input);
      if (anthropic) return anthropic;
    }

    if (this.config.openaiApiKey) {
      const openai = await this.completeWithOpenAi(input);
      if (openai) return openai;
    }

    return this.fallback.complete(input);
  }

  private async completeWithAnthropic(
    input: ChatCompletionInput,
  ): Promise<ChatCompletionOutput | undefined> {
    if (!this.config.anthropicApiKey) return undefined;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': this.config.anthropicApiKey,
      },
      body: JSON.stringify({
        model: this.config.anthropicModel,
        max_tokens: 420,
        temperature: 0.1,
        system: this.systemPrompt,
        messages: [
          {
            role: 'user',
            content: buildGroundedPrompt(input),
          },
        ],
      }),
    }).catch(() => undefined);

    if (!res || res.status === 429 || !res.ok) return undefined;
    const body = (await res.json().catch(() => undefined)) as
      | { content?: Array<{ type?: string; text?: string }> }
      | undefined;
    const text = body?.content?.find((item) => item.type === 'text')?.text?.trim();
    return text ? { reply: text } : undefined;
  }

  private async completeWithOpenAi(
    input: ChatCompletionInput,
  ): Promise<ChatCompletionOutput | undefined> {
    if (!this.config.openaiApiKey) return undefined;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.config.openaiApiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.openaiModel,
        temperature: 0.1,
        max_tokens: 420,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: buildGroundedPrompt(input) },
        ],
      }),
    }).catch(() => undefined);

    if (!res || res.status === 429 || !res.ok) return undefined;
    const body = (await res.json().catch(() => undefined)) as
      | { choices?: Array<{ message?: { content?: string | null } }> }
      | undefined;
    const text = body?.choices?.[0]?.message?.content?.trim();
    return text ? { reply: text } : undefined;
  }
}

function buildGroundedPrompt(input: ChatCompletionInput): string {
  return [
    `Page path: ${input.pagePath}`,
    'User question:',
    input.message,
    '',
    'Allowed citations:',
    citationsToPrompt(input.citations),
    '',
    'Recent conversation:',
    input.history
      .slice(-6)
      .map((line) => `${line.role}: ${line.content}`)
      .join('\n'),
  ].join('\n');
}

function citationsToPrompt(citations: Citation[]): string {
  return citations
    .map(
      (citation, index) =>
        `[${index + 1}] ${citation.title} (${citation.url})\n${citation.excerpt ?? ''}`,
    )
    .join('\n\n');
}

function loadSystemPrompt(config: Config): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    config.systemPromptPath,
    resolve(process.cwd(), 'services/chatbot/prompts/system.v1.md'),
    resolve(process.cwd(), 'prompts/system.v1.md'),
    resolve(here, '../../prompts/system.v1.md'),
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    if (existsSync(candidate)) return readFileSync(candidate, 'utf8');
  }

  return SYSTEM_PROMPT_FALLBACK;
}
