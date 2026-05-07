import type { SearchProvider, SearchResult } from '../types.js';

/**
 * Serper.dev search provider — programmatic Google Search via the
 * https://google.serper.dev API. Used as the primary crawler per spec
 * §2.1; Bing is the fallback (TODO follow-up sprint).
 *
 * Rate limit: 60 req/min on Serper's free / starter tier. The scanner
 * paces queries; this provider does not enforce rate limiting itself
 * beyond a hard timeout per call.
 */

interface SerperResponse {
  organic?: Array<{
    link?: string;
    snippet?: string;
    title?: string;
  }>;
}

export class SerperSearchProvider implements SearchProvider {
  readonly name = 'serper';
  private readonly apiKey: string;
  private readonly endpoint: string;
  private readonly fetchImpl: typeof globalThis.fetch;
  private readonly timeoutMs: number;

  constructor(opts: {
    apiKey: string;
    endpoint?: string;
    fetchImpl?: typeof globalThis.fetch;
    timeoutMs?: number;
  }) {
    if (!opts.apiKey) {
      throw new Error('SerperSearchProvider requires an apiKey.');
    }
    this.apiKey = opts.apiKey;
    this.endpoint = opts.endpoint ?? 'https://google.serper.dev/search';
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch;
    this.timeoutMs = opts.timeoutMs ?? 8000;
  }

  async query(text: string, options: { limit?: number } = {}): Promise<SearchResult[]> {
    const limit = options.limit ?? 3;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await this.fetchImpl(this.endpoint, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: text, num: limit }),
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`Serper request failed: ${res.status} ${res.statusText}`);
      }
      const json = (await res.json()) as SerperResponse;
      const organic = json.organic ?? [];
      return organic
        .slice(0, limit)
        .filter(
          (h): h is { link: string; snippet?: string; title?: string } =>
            typeof h.link === 'string' && h.link.length > 0,
        )
        .map((h): SearchResult => {
          const result: SearchResult = {
            url: h.link,
            snippet: (h.snippet ?? '').slice(0, 500),
            source: 'serper',
          };
          if (h.title) result.title = h.title;
          return result;
        });
    } finally {
      clearTimeout(timer);
    }
  }
}
