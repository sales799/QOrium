/**
 * In-memory stub poller. Used in:
 *   - the orchestrator's unit tests so we can exercise the full pipeline
 *     without external HTTP
 *   - local dev when SERPER_API_KEY is unset (so the crawl loop has
 *     something to chew on without lighting up a real provider).
 *
 * Configured with a fixture: `query → PollResult[]`. `poll` returns whatever
 * is registered for that exact query (or an empty array).
 */

import type { PollOptions, PollResult, SourcePoller, SourceType } from './types.js';

export class StubPoller implements SourcePoller {
  readonly id: SourceType = 'stub';
  private readonly fixtures: Map<string, PollResult[]>;
  private readonly defaultResults: PollResult[];

  constructor(fixtures: Record<string, PollResult[]> = {}, defaultResults: PollResult[] = []) {
    this.fixtures = new Map(Object.entries(fixtures));
    this.defaultResults = defaultResults;
  }

  poll(query: string, opts: PollOptions = {}): Promise<PollResult[]> {
    const max = opts.maxResults ?? 10;
    const hits = this.fixtures.get(query) ?? this.defaultResults;
    return Promise.resolve(hits.slice(0, max));
  }

  /** Test helper: register results for a specific query. */
  setFixture(query: string, results: PollResult[]): void {
    this.fixtures.set(query, results);
  }
}
