import { describe, expect, it, vi } from 'vitest';
import { SerperPoller } from '../../src/sources/serper';

function jsonResponse(body: unknown, status = 200, statusText = 'OK'): Response {
  return new Response(JSON.stringify(body), {
    status,
    statusText,
    headers: { 'content-type': 'application/json' },
  });
}

describe('SerperPoller', () => {
  it('issues a POST with the api key + query, parses organic hits', async () => {
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.method).toBe('POST');
      const headers = init?.headers as Record<string, string>;
      expect(headers['X-API-KEY']).toBe('SK_TEST');
      const body = JSON.parse((init?.body as string) ?? '{}');
      expect(body.q).toBe('topological ordering directed acyclic graph');
      return jsonResponse({
        organic: [
          {
            title: 'GFG: Topological Sort',
            link: 'https://www.geeksforgeeks.org/topological-sort/',
            snippet: 'Topological ordering of a directed acyclic graph (DAG)…',
          },
          { link: 'https://example.com', snippet: 'unrelated' },
        ],
      });
    });

    const poller = new SerperPoller({
      apiKey: 'SK_TEST',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const results = await poller.poll('topological ordering directed acyclic graph');
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      sourceUrl: 'https://www.geeksforgeeks.org/topological-sort/',
      sourceType: 'serper',
      title: 'GFG: Topological Sort',
    });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it('returns empty array on empty / whitespace query without making a request', async () => {
    const fetchImpl = vi.fn();
    const poller = new SerperPoller({
      apiKey: 'SK_TEST',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(await poller.poll('   ')).toEqual([]);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('skips hits without a valid link or snippet', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({
        organic: [
          { snippet: 'no link' },
          { link: 'https://x.io' }, // no snippet
          { link: 'https://y.io', snippet: 'good', title: 't' },
        ],
      }),
    );
    const poller = new SerperPoller({
      apiKey: 'SK_TEST',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const results = await poller.poll('any');
    expect(results).toHaveLength(1);
    expect(results[0]?.sourceUrl).toBe('https://y.io');
  });

  it('respects maxResults', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({
        organic: Array.from({ length: 8 }, (_, i) => ({
          link: `https://example.com/${i}`,
          snippet: `snippet ${i}`,
        })),
      }),
    );
    const poller = new SerperPoller({
      apiKey: 'SK_TEST',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const results = await poller.poll('any', { maxResults: 2 });
    expect(results).toHaveLength(2);
  });

  it('throws on non-2xx responses', async () => {
    const fetchImpl = vi.fn(
      async () => new Response('rate limited', { status: 429, statusText: 'Too Many Requests' }),
    );
    const poller = new SerperPoller({
      apiKey: 'SK_TEST',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await expect(poller.poll('any')).rejects.toThrow(/429/);
  });

  it('rejects construction without an api key', () => {
    expect(() => new SerperPoller({ apiKey: '' })).toThrow();
  });
});
