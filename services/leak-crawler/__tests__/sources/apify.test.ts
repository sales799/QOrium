import { describe, expect, it, vi } from 'vitest';
import { ApifyPoller } from '../../src/sources/apify';

function jsonResponse(body: unknown, status = 200, statusText = 'OK'): Response {
  return new Response(JSON.stringify(body), {
    status,
    statusText,
    headers: { 'content-type': 'application/json' },
  });
}

describe('ApifyPoller', () => {
  it('calls the Apify actor endpoint and maps organic results', async () => {
    const fetchImpl = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      const endpoint = new URL(String(url));
      expect(endpoint.pathname).toBe(
        '/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items',
      );
      expect(endpoint.searchParams.get('token')).toBe('APIFY_TEST');
      expect(init?.method).toBe('POST');
      const body = JSON.parse((init?.body as string) ?? '{}');
      expect(body.queries).toBe('reverse linked list iterative');
      expect(body.maxPagesPerQuery).toBe(1);
      expect(body.countryCode).toBe('in');
      expect(body.languageCode).toBe('en');
      return jsonResponse([
        {
          organicResults: [
            {
              title: 'Leaked linked-list question',
              url: 'https://example.com/leak',
              description: 'Reverse a linked list iteratively without recursion.',
            },
          ],
        },
      ]);
    });

    const poller = new ApifyPoller({
      token: 'APIFY_TEST',
      countryCode: 'in',
      languageCode: 'en',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const results = await poller.poll('reverse linked list iterative');
    expect(results).toEqual([
      {
        sourceUrl: 'https://example.com/leak',
        sourceType: 'apify',
        snippet: 'Reverse a linked list iteratively without recursion.',
        title: 'Leaked linked-list question',
      },
    ]);
  });

  it('supports flat dataset items and maxResults', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse([
        { link: 'https://a.test', snippet: 'a' },
        { link: 'https://b.test', snippet: 'b' },
      ]),
    );
    const poller = new ApifyPoller({
      token: 'APIFY_TEST',
      actorId: 'owner/custom-actor',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const results = await poller.poll('query', { maxResults: 1 });
    expect(results).toHaveLength(1);
    expect(results[0]?.sourceUrl).toBe('https://a.test');
    expect(String(fetchImpl.mock.calls[0]?.[0])).toContain('/v2/acts/owner~custom-actor/');
  });

  it('throws on non-2xx responses without exposing the token', async () => {
    const fetchImpl = vi.fn(
      async () => new Response('rate limited', { status: 429, statusText: 'Too Many Requests' }),
    );
    const poller = new ApifyPoller({
      token: 'APIFY_TEST',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await expect(poller.poll('query')).rejects.toThrow('apify 429 Too Many Requests');
  });

  it('returns empty array on empty query without making a request', async () => {
    const fetchImpl = vi.fn();
    const poller = new ApifyPoller({
      token: 'APIFY_TEST',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(await poller.poll('   ')).toEqual([]);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('rejects construction without a token', () => {
    expect(() => new ApifyPoller({ token: '' })).toThrow();
  });
});
