import type { SearchProvider, SearchResult } from '../types.js';

/**
 * In-memory deterministic search provider for dev / test / CI.
 *
 * The scanner can be wired against this to verify orchestration end-to-end
 * without making any network calls. The fixture map is keyed by query
 * text; queries that don't match return an empty array (no leak).
 *
 * Provide fixtures at construction time:
 *
 * ```ts
 * const provider = new MockSearchProvider({
 *   "implement red black tree balance": [
 *     { url: "https://leetcode.com/discuss/...", snippet: "...", source: 'mock' }
 *   ]
 * });
 * ```
 */
export class MockSearchProvider implements SearchProvider {
  readonly name = 'mock';
  private readonly fixtures: Map<string, SearchResult[]>;

  constructor(fixtures: Record<string, SearchResult[]> = {}) {
    this.fixtures = new Map(Object.entries(fixtures).map(([k, v]) => [k.toLowerCase(), v]));
  }

  async query(text: string, options: { limit?: number } = {}): Promise<SearchResult[]> {
    const limit = options.limit ?? 3;
    const hits = this.fixtures.get(text.toLowerCase()) ?? [];
    return hits.slice(0, limit);
  }
}
