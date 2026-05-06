import { describe, expect, it } from 'vitest';
import { realAnthropicClient, stubAnthropicClient } from '../src/anthropic';

describe('stubAnthropicClient', () => {
  it('returns a deterministic mock completion', async () => {
    const c = stubAnthropicClient();
    const out = await c.complete({ messages: [{ role: 'user', content: 'help me with graphs' }] });
    expect(out.text).toMatch(/stub Claude/);
    expect(out.usage.inputTokens).toBeGreaterThan(0);
  });
});

describe('realAnthropicClient', () => {
  it('throws when credentials are missing', () => {
    expect(() => realAnthropicClient({ credentials: null })).toThrow(/ANTHROPIC_API_KEY/);
  });

  it('uses x-api-key + anthropic-version headers when wired', async () => {
    let captured: Record<string, string> | null = null;
    const fetchImpl: typeof fetch = async (_url, init) => {
      captured = init?.headers as Record<string, string>;
      return new Response(
        JSON.stringify({
          content: [{ type: 'text', text: 'hello world' }],
          usage: { input_tokens: 10, output_tokens: 20 },
          model: 'claude-sonnet-4-6',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    };
    const c = realAnthropicClient({
      credentials: { apiKey: 'sk-ant-test' },
      fetchImpl,
    });
    const out = await c.complete({ messages: [{ role: 'user', content: 'hi' }] });
    expect(out.text).toBe('hello world');
    expect(captured?.['x-api-key']).toBe('sk-ant-test');
    expect(captured?.['anthropic-version']).toBe('2023-06-01');
  });
});
