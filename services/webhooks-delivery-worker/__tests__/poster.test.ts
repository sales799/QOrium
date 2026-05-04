import { describe, expect, it } from 'vitest';
import { realHttpPoster, stubHttpPoster } from '../src/poster';

describe('stubHttpPoster', () => {
  it('records attempts and returns the configured status', async () => {
    const state = { attempts: [], nextStatus: 202 };
    const poster = stubHttpPoster(state);
    const out = await poster.post({
      url: 'https://acme.example/hook',
      body: '{}',
      headers: { 'x-test': '1' },
    });
    expect(out.status).toBe(202);
    expect(state.attempts).toHaveLength(1);
    expect(state.attempts[0]?.url).toBe('https://acme.example/hook');
  });

  it('honours nextError', async () => {
    const out = await stubHttpPoster({
      attempts: [],
      nextStatus: 0,
      nextError: 'simulated network error',
    }).post({ url: 'x', body: '{}', headers: {} });
    expect(out.status).toBe(0);
    expect(out.error).toBe('simulated network error');
  });
});

describe('realHttpPoster', () => {
  it('passes the body + headers to fetch and returns the response status', async () => {
    let captured: { url: string; init: RequestInit } | null = null;
    const fetchImpl: typeof fetch = async (url, init) => {
      captured = { url: String(url), init: init ?? {} };
      return new Response('{"ok":true}', { status: 200 });
    };
    const poster = realHttpPoster({ fetchImpl });
    const out = await poster.post({
      url: 'https://acme.example/hook',
      body: '{"event":"x"}',
      headers: { 'x-test': '1' },
    });
    expect(out.status).toBe(200);
    expect(out.responseSnippet).toContain('ok');
    expect(captured?.url).toBe('https://acme.example/hook');
    expect((captured?.init.headers as Record<string, string>)['x-test']).toBe('1');
  });

  it('returns status=0 + error on fetch failure', async () => {
    const poster = realHttpPoster({
      fetchImpl: async () => {
        throw new Error('connection refused');
      },
    });
    const out = await poster.post({ url: 'x', body: '{}', headers: {} });
    expect(out.status).toBe(0);
    expect(out.error).toBe('connection refused');
  });

  it('truncates large response bodies to 4KB', async () => {
    const poster = realHttpPoster({
      fetchImpl: async () => new Response('a'.repeat(8 * 1024), { status: 200 }),
    });
    const out = await poster.post({ url: 'x', body: '{}', headers: {} });
    expect(out.responseSnippet).toHaveLength(4 * 1024);
  });
});
