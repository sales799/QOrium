/**
 * runCrawl — single end-to-end pass of the Anti-Leak crawler.
 *
 * For each released question:
 *   1. Extract the top-K distinctive n-grams.
 *   2. Issue each n-gram as a query against the configured pollers.
 *   3. Score each returned snippet against the question body.
 *   4. Classify severity; persist as `content.leak_alerts` if >= floor.
 *
 * The orchestrator is dependency-injected on every external surface
 * (questions repo, alerts repo, pollers, logger, clock) so unit tests can
 * exercise the full pipeline without DB or HTTP.
 */

import type { Logger } from 'pino';
import { extractDistinctiveNGrams } from './ngrams.js';
import { scoreEvidence } from './similarity.js';
import { classifyEvidence, compositeSimilarity } from './severity.js';
import type { ReleasedQuestion } from './repositories/questions.js';
import type { RecordAlertInput, RecordAlertOutcome } from './repositories/alerts.js';
import type { PollResult, SourcePoller } from './sources/types.js';

export interface CrawlPipeline {
  listQuestions: () => Promise<ReleasedQuestion[]>;
  recordAlert: (input: RecordAlertInput) => Promise<RecordAlertOutcome>;
  pollers: SourcePoller[];
  logger: Logger;
  /** Top-K n-grams to issue per question. */
  ngramsPerQuestion: number;
  /** Max results scraped per query. */
  resultsPerQuery: number;
  /** Optional cooperative cancel signal (e.g., SIGINT during a long crawl). */
  signal?: AbortSignal | undefined;
  /** Optional clock for tests. */
  now?: () => Date;
}

export interface CrawlReport {
  startedAt: string;
  finishedAt: string;
  questionsScanned: number;
  queriesIssued: number;
  resultsScored: number;
  alertsCreated: number;
  alertsSkippedDuplicate: number;
  errors: number;
}

const EMPTY_REPORT = (now: Date): CrawlReport => ({
  startedAt: now.toISOString(),
  finishedAt: now.toISOString(),
  questionsScanned: 0,
  queriesIssued: 0,
  resultsScored: 0,
  alertsCreated: 0,
  alertsSkippedDuplicate: 0,
  errors: 0,
});

export async function runCrawl(pipeline: CrawlPipeline): Promise<CrawlReport> {
  const now = pipeline.now ?? (() => new Date());
  const startedAtDate = now();
  const report: CrawlReport = EMPTY_REPORT(startedAtDate);

  if (pipeline.pollers.length === 0) {
    pipeline.logger.warn(
      'No pollers configured; skipping crawl. Set SERPER_API_KEY (or wire a stub poller in dev) to enable crawls.',
    );
    report.finishedAt = now().toISOString();
    return report;
  }

  let questions: ReleasedQuestion[];
  try {
    questions = await pipeline.listQuestions();
  } catch (err) {
    pipeline.logger.error({ err }, 'failed to list released questions; aborting crawl');
    report.errors++;
    report.finishedAt = now().toISOString();
    return report;
  }

  for (const question of questions) {
    if (pipeline.signal?.aborted) {
      pipeline.logger.info('crawl aborted by signal');
      break;
    }

    report.questionsScanned++;
    const queries = extractDistinctiveNGrams(question.bodyMd, {
      topK: pipeline.ngramsPerQuestion,
    });
    if (queries.length === 0) {
      pipeline.logger.debug(
        { questionId: question.id },
        'question body produced no usable n-grams; skipping',
      );
      continue;
    }

    for (const query of queries) {
      if (pipeline.signal?.aborted) break;
      for (const poller of pipeline.pollers) {
        if (pipeline.signal?.aborted) break;
        let results: PollResult[];
        try {
          const opts: { maxResults: number; signal?: AbortSignal } = {
            maxResults: pipeline.resultsPerQuery,
          };
          if (pipeline.signal !== undefined) opts.signal = pipeline.signal;
          results = await poller.poll(query, opts);
          report.queriesIssued++;
        } catch (err) {
          pipeline.logger.warn(
            { err, query, poller: poller.id },
            'poller error; continuing with next query',
          );
          report.errors++;
          continue;
        }

        for (const result of results) {
          report.resultsScored++;
          const evidence = scoreEvidence(question.bodyMd, result.snippet);
          const classification = classifyEvidence(evidence);
          if (!classification.shouldPersist || classification.severity === 'none') continue;

          try {
            const outcome = await pipeline.recordAlert({
              questionId: question.id,
              sourceUrl: result.sourceUrl,
              sourceType: result.sourceType,
              similarityScore: compositeSimilarity(evidence),
              severity: classification.severity,
              status: classification.status,
              evidence: {
                snippet: result.snippet.slice(0, 1_000),
                title: result.title,
                cosineSimilarity: evidence.cosineSimilarity,
                lexicalOverlap: evidence.lexicalOverlap,
                matchedNgrams: [query],
                classifierReason: classification.reason,
              },
            });
            if (outcome.inserted) report.alertsCreated++;
            else report.alertsSkippedDuplicate++;
          } catch (err) {
            pipeline.logger.error(
              { err, questionId: question.id, sourceUrl: result.sourceUrl },
              'failed to record leak alert',
            );
            report.errors++;
          }
        }
      }
    }
  }

  report.finishedAt = now().toISOString();
  pipeline.logger.info({ report }, 'crawl complete');
  return report;
}
