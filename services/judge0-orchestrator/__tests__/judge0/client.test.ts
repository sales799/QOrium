import { describe, expect, it, vi } from 'vitest';
import { Judge0Client } from '../../src/judge0/client';
import type { Judge0SubmissionResult } from '../../src/judge0/types';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

const TERMINAL: Judge0SubmissionResult = {
  stdout: '5\n',
  stderr: null,
  compile_output: null,
  message: null,
  exit_code: 0,
  status: { id: 3, description: 'Accepted' },
  time: '0.234',
  memory: 45_000,
};

const QUEUED: Judge0SubmissionResult = {
  stdout: null,
  stderr: null,
  compile_output: null,
  message: null,
  exit_code: null,
  status: { id: 1, description: 'In Queue' },
  time: null,
  memory: null,
};

describe('Judge0Client', () => {
  it('rejects construction without baseUrl', () => {
    expect(() => new Judge0Client({ baseUrl: '' })).toThrow();
  });

  it('strips trailing slashes from baseUrl', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ token: 'abc' }));
    const client = new Judge0Client({
      baseUrl: 'http://judge0.test/',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await client.submit({ source_code: 'x', language_id: 71 });
    const url = fetchImpl.mock.calls[0]?.[0];
    expect(String(url)).toBe('http://judge0.test/submissions?base64_encoded=false&wait=false');
  });

  it('submit returns the token', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ token: 'tok-123' }));
    const client = new Judge0Client({
      baseUrl: 'http://judge0.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const r = await client.submit({ source_code: 'print(1)', language_id: 71 });
    expect(r.token).toBe('tok-123');
  });

  it('submit attaches X-Auth-Token when configured', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ token: 'tok' }));
    const client = new Judge0Client({
      baseUrl: 'http://judge0.test',
      authToken: 'SECRET',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await client.submit({ source_code: 'x', language_id: 71 });
    const init = fetchImpl.mock.calls[0]?.[1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers['X-Auth-Token']).toBe('SECRET');
  });

  it('submit throws on missing token in response', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({}));
    const client = new Judge0Client({
      baseUrl: 'http://judge0.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await expect(client.submit({ source_code: 'x', language_id: 71 })).rejects.toThrow();
  });

  it('submit throws on non-2xx', async () => {
    const fetchImpl = vi.fn(
      async () => new Response('boom', { status: 500, statusText: 'Internal Server Error' }),
    );
    const client = new Judge0Client({
      baseUrl: 'http://judge0.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await expect(client.submit({ source_code: 'x', language_id: 71 })).rejects.toThrow(/500/);
  });

  it('pollUntilTerminal returns the terminal result on first try when terminal', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(TERMINAL));
    const client = new Judge0Client({
      baseUrl: 'http://judge0.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const r = await client.pollUntilTerminal('tok', { sleep: () => Promise.resolve() });
    expect(r.status.id).toBe(3);
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it('pollUntilTerminal polls past non-terminal statuses', async () => {
    let calls = 0;
    const fetchImpl = vi.fn(async () => {
      calls++;
      return jsonResponse(calls < 3 ? QUEUED : TERMINAL);
    });
    const client = new Judge0Client({
      baseUrl: 'http://judge0.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      pollIntervalMs: 1,
    });
    const r = await client.pollUntilTerminal('tok', { sleep: () => Promise.resolve() });
    expect(r.status.id).toBe(3);
    expect(calls).toBe(3);
  });

  it('pollUntilTerminal throws on poll-timeout', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(QUEUED));
    const client = new Judge0Client({
      baseUrl: 'http://judge0.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      pollTimeoutMs: 5,
      pollIntervalMs: 1,
    });
    let nowVal = 0;
    const now = () => {
      nowVal += 10;
      return nowVal;
    };
    await expect(
      client.pollUntilTerminal('tok', { now, sleep: () => Promise.resolve() }),
    ).rejects.toThrow(/poll timeout/);
  });

  it('execute submits and polls', async () => {
    let calls = 0;
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      calls++;
      if ((init?.method ?? 'GET') === 'POST') return jsonResponse({ token: 'tok' });
      return jsonResponse(TERMINAL);
    });
    const client = new Judge0Client({
      baseUrl: 'http://judge0.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      pollIntervalMs: 1,
    });
    const r = await client.execute(
      { source_code: 'print(5)', language_id: 71, stdin: '' },
      { sleep: () => Promise.resolve() },
    );
    expect(r.status.id).toBe(3);
    expect(calls).toBe(2);
  });

  it('aborts on parent signal', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(QUEUED));
    const ctrl = new AbortController();
    ctrl.abort();
    const client = new Judge0Client({
      baseUrl: 'http://judge0.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await expect(client.pollUntilTerminal('tok', { signal: ctrl.signal })).rejects.toThrow();
  });
});
