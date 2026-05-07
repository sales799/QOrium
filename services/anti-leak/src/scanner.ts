import type { Pool } from '@qorium/db';
import { recordAuditEvent } from '@qorium/auth';
import type { Logger } from 'pino';
import type { AntiLeakConfig } from './config.js';
import { classify, extractDistinctiveNgrams, matchedNgrams } from './detector.js';
import { fetchReleasedQuestions, insertLeakAlert } from './repositories.js';
import type { DetectionEvidence, QuestionForScan, ScanReport, SearchProvider } from './types.js';

export interface ScannerDeps {
  pool: Pool | null;
  provider: SearchProvider;
  config: AntiLeakConfig;
  logger?: Logger;
  /** Override for tests — supply a fixed question list and skip the DB
   *  fetch. */
  questionsOverride?: ReadonlyArray<QuestionForScan>;
  /** Override for tests — capture inserts in memory rather than writing
   *  to Postgres. */
  alertSink?: (evidence: DetectionEvidence) => Promise<void>;
}

/**
 * Run one scan pass: pick up to `maxQuestions` released questions, for
 * each extract distinctive n-grams, query the search provider, classify
 * each hit, persist alerts that exceed the medium threshold.
 *
 * Idempotent within a run: the same (question_id, source_url) pair is
 * not inserted twice. Across runs the orchestrator relies on the SQL
 * partial index to keep the most-recent alert authoritative.
 */
export async function runScan(deps: ScannerDeps): Promise<ScanReport> {
  const startedAt = new Date();
  const log = deps.logger;

  // 1. Fetch the corpus.
  const questions: ReadonlyArray<QuestionForScan> =
    deps.questionsOverride ??
    (deps.pool ? await fetchReleasedQuestions(deps.pool, deps.config.maxQuestions) : []);

  log?.info({ count: questions.length }, 'anti-leak: scanning released questions');

  let totalQueries = 0;
  const alerts: DetectionEvidence[] = [];
  const seenAlertKey = new Set<string>();

  for (const q of questions) {
    const grams = extractDistinctiveNgrams(q.body_md, {
      topK: deps.config.queriesPerQuestion,
    });
    if (grams.length === 0) continue;

    for (const gram of grams) {
      let results;
      try {
        results = await deps.provider.query(gram, {
          limit: deps.config.resultsPerQuery,
        });
      } catch (err) {
        log?.warn({ err, gram }, 'anti-leak: search provider error; skipping query');
        continue;
      }
      totalQueries += 1;

      for (const hit of results) {
        const cls = classify(q.body_md, hit.snippet, {
          thresholdAutoRotate: deps.config.thresholdAutoRotate,
          thresholdHighReview: deps.config.thresholdHighReview,
          thresholdMediumReview: deps.config.thresholdMediumReview,
        });

        // Only escalate medium / high / critical to the alerts table.
        // Low matches are dismissed silently to avoid noisy storage.
        if (cls.severity === 'low') continue;

        const key = `${q.id}:${hit.url}`;
        if (seenAlertKey.has(key)) continue;
        seenAlertKey.add(key);

        const evidence: DetectionEvidence = {
          question_id: q.id,
          question_body_excerpt: q.body_md.slice(0, 500),
          match: hit,
          classification: cls,
          matched_ngrams: matchedNgrams(q.body_md, hit.snippet),
          scan_started_at: startedAt.toISOString(),
          scan_finished_at: new Date().toISOString(),
        };
        alerts.push(evidence);
      }
    }
  }

  // 2. Persist alerts — bulk via DB or via override sink for tests.
  if (deps.alertSink) {
    for (const e of alerts) await deps.alertSink(e);
  } else if (deps.pool) {
    for (const e of alerts) {
      try {
        const { id } = await insertLeakAlert(deps.pool, e);
        // Audit-log fire-and-forget per @qorium/auth contract.
        void recordAuditEvent({
          pool: deps.pool,
          event: {
            actor_type: 'scheduled_job',
            actor_id: null,
            event_type:
              e.classification.severity === 'critical' ? 'leak.detected' : 'leak.suspected',
            entity_type: 'leak_alerts',
            entity_id: id,
            payload: {
              question_id: e.question_id,
              source: e.match.source,
              source_url: e.match.url,
              similarity: e.classification.similarity,
              severity: e.classification.severity,
            },
          },
        });
      } catch (err) {
        log?.error({ err, evidence: e }, 'anti-leak: failed to persist alert');
      }
    }
  }

  const finishedAt = new Date();
  const report: ScanReport = {
    scannedQuestions: questions.length,
    totalQueries,
    alerts,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
  };

  log?.info(
    {
      scannedQuestions: report.scannedQuestions,
      totalQueries: report.totalQueries,
      alerts: report.alerts.length,
      durationMs: report.durationMs,
    },
    'anti-leak: scan complete',
  );

  return report;
}
