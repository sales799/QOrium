import { describe, expect, it } from 'vitest';
import { OrchestratorClient, resolveOrchestratorUrl } from '../src/lib/orchestrator-client';

describe('resolveOrchestratorUrl', () => {
  it('defaults to localhost:5115', () => {
    expect(resolveOrchestratorUrl({} as unknown as NodeJS.ProcessEnv)).toBe(
      'http://localhost:5115',
    );
  });
  it('honours AI_PAIR_CODING_URL', () => {
    expect(
      resolveOrchestratorUrl({
        AI_PAIR_CODING_URL: 'https://prod.qorium.io/wave3',
      } as unknown as NodeJS.ProcessEnv),
    ).toBe('https://prod.qorium.io/wave3');
  });
});

describe('OrchestratorClient', () => {
  it('createSession POSTs to /v1/ai-pair-coding/sessions with body', async () => {
    interface Captured {
      url: string;
      method: string;
      body: string;
    }
    const captured: Captured = { url: '', method: '', body: '' };
    const fetchImpl: typeof fetch = async (url, init) => {
      captured.url = String(url);
      captured.method = init?.method ?? 'GET';
      captured.body = init?.body as string;
      return new Response(
        JSON.stringify({ id: 'sess', candidateId: 'cand-1', status: 'in_progress' }),
        { status: 201, headers: { 'content-type': 'application/json' } },
      );
    };
    const client = new OrchestratorClient({ baseUrl: 'http://x', fetchImpl });
    const out = await client.createSession({ candidate_id: 'cand-1' });
    expect(captured.url).toBe('http://x/v1/ai-pair-coding/sessions');
    expect(captured.method).toBe('POST');
    expect(JSON.parse(captured.body).candidate_id).toBe('cand-1');
    expect(out.candidateId).toBe('cand-1');
  });

  it('forwards x-tenant-id header when set', async () => {
    let captured: Record<string, string> | null = null;
    const fetchImpl: typeof fetch = async (_url, init) => {
      captured = init?.headers as Record<string, string>;
      return new Response('{}', { status: 200 });
    };
    const client = new OrchestratorClient({
      baseUrl: 'http://x',
      tenantId: '11111111-2222-3333-4444-555555555555',
      fetchImpl,
    });
    await client.getSession('22222222-3333-4444-5555-666666666666');
    expect(captured?.['x-tenant-id']).toBe('11111111-2222-3333-4444-555555555555');
  });

  it('submitTurn POSTs to /turn with candidate_message', async () => {
    let body: string | null = null;
    const fetchImpl: typeof fetch = async (_url, init) => {
      body = init?.body as string;
      return new Response(
        JSON.stringify({
          ai_message: 'hi',
          usage: { inputTokens: 1, outputTokens: 1 },
          model_id: 'stub',
        }),
        { status: 201, headers: { 'content-type': 'application/json' } },
      );
    };
    const client = new OrchestratorClient({ baseUrl: 'http://x', fetchImpl });
    const out = await client.submitTurn('22222222-3333-4444-5555-666666666666', 'help me');
    expect(JSON.parse(body!).candidate_message).toBe('help me');
    expect(out.ai_message).toBe('hi');
  });

  it('submitSession POSTs the full signals payload', async () => {
    let body: string | null = null;
    const fetchImpl: typeof fetch = async (_url, init) => {
      body = init?.body as string;
      return new Response(JSON.stringify({ id: 'sess', status: 'submitted' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    };
    const client = new OrchestratorClient({ baseUrl: 'http://x', fetchImpl });
    await client.submitSession('22222222-3333-4444-5555-666666666666', 'final', {
      typedChars: 100,
      pastedChars: 0,
      editTestCycles: 5,
      candidateMessageCount: 3,
      acceptedVerbatimCount: 1,
      acceptedModifiedCount: 2,
      rejectedCount: 1,
      seededErrorsCaught: 1,
      seededErrorsTotal: 1,
      codeQualityScore: 4,
      timeToFirstCodeSec: 60,
      durationSec: 1500,
    });
    const parsed = JSON.parse(body!);
    expect(parsed.final_code_text).toBe('final');
    expect(parsed.signals.typedChars).toBe(100);
  });

  it('throws when the orchestrator returns non-2xx', async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response('{"title":"Bad Request"}', {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    const client = new OrchestratorClient({ baseUrl: 'http://x', fetchImpl });
    await expect(client.getSession('22222222-3333-4444-5555-666666666666')).rejects.toThrow(/400/);
  });
});
