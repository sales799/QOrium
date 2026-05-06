/**
 * Serper.dev poller.
 *
 * https://serper.dev/playground — POST https://google.serper.dev/search with
 * an `X-API-KEY` header. Response shape: { organic: [{ title, link, snippet }] }.
 *
 * The poller is structured so the dependency on a specific API key + a
 * specific HTTP client is injectable: the constructor takes the api key and
 * (optionally) a fetch implementation. In tests, pass a stub `fetch` that
 * resolves a canned `Response`. In prod the global `fetch` is used.
 */

import type { PollOptions, PollResult, SourcePoller, SourceType } from './types.js';

export interface SerperPollerOptions {
  apiKey: string;
  /** Override the HTTP client (tests). Defaults to global `fetch`. */
  fetchImpl?: typeof fetch;
  /** Override the endpoint (tests). */
  endpoint?: string;
  /** Per-request timeout in milliseconds. Default 15s. */
  timeoutMs?: number;
}

const DEFAULT_ENDPOINT = 'https://google.serper.dev/search';
const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_RESULTS = 5;

interface SerperOrganicHit {
  title?: unknown;
  link?: unknown;
  snippet?: unknown;
}

interface SerperPayload {
  organic?: unknown;
}

function isString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

export class SerperPoller implements SourcePoller {
  readonly id: SourceType = 'serper';
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;
  private readonly endpoint: string;
  private readonly timeoutMs: number;

  constructor(opts: SerperPollerOptions) {
    if (!opts.apiKey) throw new Error('SerperPoller requires an apiKey');
    this.apiKey = opts.apiKey;
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.endpoint = opts.endpoint ?? DEFAULT_ENDPOINT;
    this.timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async poll(query: string, opts: PollOptions = {}): Promise<PollResult[]> {
    const trimmed = query.trim();
    if (trimmed.length === 0) return [];

    const max = opts.maxResults ?? DEFAULT_MAX_RESULTS;

    const ctrl = new AbortController();
    const timer = setTimeout(
      () => ctrl.abort(new Error('serper request timed out')),
      this.timeoutMs,
    );
    const onParentAbort = () => ctrl.abort(opts.signal?.reason);
    if (opts.signal) {
      if (opts.signal.aborted) ctrl.abort(opts.signal.reason);
      else opts.signal.addEventListener('abort', onParentAbort, { once: true });
    }

    try {
      const response = await this.fetchImpl(this.endpoint, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({ q: trimmed, num: max }),
        signal: ctrl.signal,
      });
      if (!response.ok) {
        throw new Error(`serper ${response.status} ${response.statusText}`);
      }
      const payload = (await response.json()) as SerperPayload;
      const organic = Array.isArray(payload.organic) ? (payload.organic as SerperOrganicHit[]) : [];
      const results: PollResult[] = [];
      for (const hit of organic.slice(0, max)) {
        if (!isString(hit.link) || !isString(hit.snippet)) continue;
        const r: PollResult = {
          sourceUrl: hit.link,
          sourceType: 'serper',
          snippet: hit.snippet,
        };
        if (isString(hit.title)) r.title = hit.title;
        results.push(r);
      }
      return results;
    } finally {
      clearTimeout(timer);
      if (opts.signal) opts.signal.removeEventListener('abort', onParentAbort);
    }
  }
}
