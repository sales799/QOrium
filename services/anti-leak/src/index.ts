/**
 * @qorium/anti-leak — Anti-Leak Engine v0.
 *
 * Public surface for callers wanting to wire the scanner into their own
 * orchestrator (e.g. PM2 worker, admin app trigger, or a CLI). For the
 * standalone PM2 worker entry point see `src/scripts/scan.ts`.
 */
export type { AntiLeakConfig } from './config.js';
export { loadConfig } from './config.js';
export type {
  ClassificationResult,
  DetectionEvidence,
  LeakSeverity,
  QuestionForScan,
  ScanReport,
  SearchProvider,
  SearchResult,
  SearchSource,
} from './types.js';
export {
  classify,
  extractDistinctiveNgrams,
  jaccard,
  matchedNgrams,
  tokenize,
} from './detector.js';
export { MockSearchProvider } from './providers/mock.js';
export { SerperSearchProvider } from './providers/serper.js';
export { runScan } from './scanner.js';
export { fetchReleasedQuestions, insertLeakAlert } from './repositories.js';
