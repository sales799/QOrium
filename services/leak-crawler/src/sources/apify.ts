import type { PollOptions, PollResult, SourcePoller, SourceType } from './types.js';

export interface ApifyPollerOptions {
  token: string;
  actorId?: string;
  countryCode?: string | undefined;
  languageCode?: string | undefined;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

const DEFAULT_ACTOR_ID = 'apify/google-search-scraper';
const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_RESULTS = 3;

interface ApifySearchHit {
  url?: unknown;
  link?: unknown;
  title?: unknown;
  snippet?: unknown;
  description?: unknown;
  text?: unknown;
}

interface ApifyDatasetItem extends ApifySearchHit {
  organicResults?: unknown;
  results?: unknown;
  searchResults?: unknown;
}

function isString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function normalizeActorId(actorId: string): string {
  return actorId.includes('~') ? actorId : actorId.replace('/', '~');
}

function readHits(item: ApifyDatasetItem): ApifySearchHit[] {
  for (const key of ['organicResults', 'results', 'searchResults'] as const) {
    const value = item[key];
    if (Array.isArray(value)) return value as ApifySearchHit[];
  }
  return [item];
}

function hitToResult(hit: ApifySearchHit): PollResult | undefined {
  const sourceUrl = isString(hit.url) ? hit.url : isString(hit.link) ? hit.link : undefined;
  const snippet = isString(hit.snippet)
    ? hit.snippet
    : isString(hit.description)
      ? hit.description
      : isString(hit.text)
        ? hit.text
        : undefined;

  if (!sourceUrl || !snippet) return undefined;

  const result: PollResult = {
    sourceUrl,
    sourceType: 'apify',
    snippet,
  };
  if (isString(hit.title)) result.title = hit.title;
  return result;
}

export class ApifyPoller implements SourcePoller {
  readonly id: SourceType = 'apify';
  private readonly token: string;
  private readonly actorId: string;
  private readonly countryCode: string | undefined;
  private readonly languageCode: string | undefined;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;

  constructor(opts: ApifyPollerOptions) {
    if (!opts.token) throw new Error('ApifyPoller requires a token');
    this.token = opts.token;
    this.actorId = normalizeActorId(opts.actorId ?? DEFAULT_ACTOR_ID);
    this.countryCode = opts.countryCode;
    this.languageCode = opts.languageCode;
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async poll(query: string, opts: PollOptions = {}): Promise<PollResult[]> {
    const trimmed = query.trim();
    if (trimmed.length === 0) return [];

    const max = opts.maxResults ?? DEFAULT_MAX_RESULTS;
    const endpoint = new URL(
      `https://api.apify.com/v2/acts/${this.actorId}/run-sync-get-dataset-items`,
    );
    endpoint.searchParams.set('token', this.token);

    const input: Record<string, unknown> = {
      queries: trimmed,
      maxPagesPerQuery: 1,
      geminiSearch: { enableGemini: false },
      perplexitySearch: {
        enablePerplexity: false,
        returnImages: false,
        returnRelatedQuestions: false,
      },
      chatGptSearch: { enableChatGpt: false },
      copilotSearch: { enableCopilot: false },
      maximumLeadsEnrichmentRecords: 0,
    };
    if (this.countryCode) input.countryCode = this.countryCode;
    if (this.languageCode) input.languageCode = this.languageCode;

    const ctrl = new AbortController();
    const timer = setTimeout(
      () => ctrl.abort(new Error('apify request timed out')),
      this.timeoutMs,
    );
    const onParentAbort = () => ctrl.abort(opts.signal?.reason);
    if (opts.signal) {
      if (opts.signal.aborted) ctrl.abort(opts.signal.reason);
      else opts.signal.addEventListener('abort', onParentAbort, { once: true });
    }

    try {
      const response = await this.fetchImpl(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify(input),
        signal: ctrl.signal,
      });
      if (!response.ok) {
        throw new Error(`apify ${response.status} ${response.statusText}`);
      }

      const payload = (await response.json()) as unknown;
      const items = Array.isArray(payload) ? (payload as ApifyDatasetItem[]) : [];
      const results: PollResult[] = [];
      for (const item of items) {
        for (const hit of readHits(item)) {
          const result = hitToResult(hit);
          if (result) results.push(result);
          if (results.length >= max) return results;
        }
      }
      return results;
    } finally {
      clearTimeout(timer);
      if (opts.signal) opts.signal.removeEventListener('abort', onParentAbort);
    }
  }
}
