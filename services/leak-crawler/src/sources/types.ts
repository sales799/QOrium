/**
 * Source-poller interface. The crawl orchestrator only knows about this
 * shape; concrete implementations (Serper, GitHub, Reddit, …) are pluggable.
 */

export type SourceType =
  | 'serper'
  | 'apify'
  | 'gfg'
  | 'leetcode-discuss'
  | 'github'
  | 'reddit'
  | 'glassdoor'
  | 'stackoverflow'
  | 'stub';

export interface PollResult {
  sourceUrl: string;
  sourceType: SourceType;
  snippet: string;
  /** Optional title / heading from the source page; helps SME triage. */
  title?: string | undefined;
}

export interface PollOptions {
  /** AbortSignal to cooperate with the orchestrator's deadline / shutdown. */
  signal?: AbortSignal | undefined;
  /** Maximum results to return for this query. Pollers MAY return fewer. */
  maxResults?: number;
}

export interface SourcePoller {
  readonly id: SourceType;
  /** Issue one query and return the top results. */
  poll(query: string, opts?: PollOptions): Promise<PollResult[]>;
}
