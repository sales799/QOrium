/**
 * Shared types for the Anti-Leak Engine v0.
 *
 * The engine operates as a stateful PM2 worker (per
 * `infra/Anti-Leak-Engine-v0-Design.md` §2.1) running a daily 02:00 IST
 * crawl. Components are pluggable so the same orchestrator code can run
 * against a mock provider in dev/tests and against Serper.dev / Bing in
 * production.
 */

/** Source of a search hit. Matches `content.leak_alerts.source_type`. */
export type SearchSource =
  | 'glassdoor'
  | 'leetcode-discuss'
  | 'gfg'
  | 'github'
  | 'serper'
  | 'bing'
  | 'mock';

/** A single search result returned by a SearchProvider. */
export interface SearchResult {
  url: string;
  /** ≤500-char snippet surrounding the matched text (per §2.1). */
  snippet: string;
  source: SearchSource;
  /** Optional raw title from the search engine. */
  title?: string;
}

/** Minimal interface every search provider implements. Implementations
 *  are lazy-loaded so a Serper API key isn't needed to run the worker
 *  in dev / test mode. */
export interface SearchProvider {
  readonly name: string;
  /** Returns the top-K results for a query. Must respect the provider's
   *  rate limit; orchestrator only retries on transient errors. */
  query(text: string, options?: { limit?: number }): Promise<SearchResult[]>;
}

/** Released question shape consumed by the scanner. Mirrors the columns
 *  the orchestrator queries from `content.questions`. */
export interface QuestionForScan {
  id: string;
  body_md: string;
  status: string;
}

/** Severity classification per spec §6 thresholds. */
export type LeakSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ClassificationResult {
  severity: LeakSeverity;
  /** Combined similarity score in [0, 1]. */
  similarity: number;
  /** Lexical Jaccard overlap on token sets. */
  lexical: number;
  /** Whether to auto-rotate (severity = critical). */
  autoRotate: boolean;
  /** Whether SME review is needed (severity = high or medium). */
  needsReview: boolean;
}

export interface DetectionEvidence {
  question_id: string;
  question_body_excerpt: string;
  match: SearchResult;
  classification: ClassificationResult;
  /** Top-K matching n-grams that drove the lexical score. */
  matched_ngrams: string[];
  scan_started_at: string;
  scan_finished_at: string;
}

export interface ScanReport {
  scannedQuestions: number;
  totalQueries: number;
  alerts: DetectionEvidence[];
  startedAt: string;
  finishedAt: string;
  durationMs: number;
}
