/**
 * Severity classification per Anti-Leak-Engine-v0-Design.md §6.
 *
 * | cosine     | lexical    | severity     | action                       |
 * | ---------- | ---------- | ------------ | ---------------------------- |
 * | > 0.92     | > 0.70     | critical     | confirmed leak, auto-rotate  |
 * | 0.85–0.92  | > 0.70     | high         | suspected, SME 24h review    |
 * | 0.85–0.92  | 0.60–0.70  | medium       | suspected, SME 24h review    |
 * | < 0.85     | > 0.70     | medium       | medium confidence, SME       |
 * | otherwise  |            | none / low   | dismiss + log                |
 *
 * `none` is returned when the evidence falls below the dismissal floor and
 * carries `shouldPersist=false`. Severities `low|medium|high|critical` are
 * persisted as `content.leak_alerts` rows.
 */

import type { CrawlEvidence } from './similarity.js';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Classification {
  severity: AlertSeverity | 'none';
  shouldPersist: boolean;
  status: 'detected' | 'under_review';
  reason: string;
}

const CRITICAL_COSINE = 0.92;
const HIGH_COSINE = 0.85;
const HIGH_LEXICAL = 0.7;
const MEDIUM_LEXICAL_FLOOR = 0.6;

export function classifyEvidence(evidence: CrawlEvidence): Classification {
  const { cosineSimilarity: cos, lexicalOverlap: lex } = evidence;

  if (cos > CRITICAL_COSINE && lex > HIGH_LEXICAL) {
    return {
      severity: 'critical',
      shouldPersist: true,
      status: 'detected',
      reason: 'cosine > 0.92 AND lexical > 0.70 → confirmed leak (auto-rotate)',
    };
  }

  if (cos >= HIGH_COSINE && cos <= CRITICAL_COSINE && lex > HIGH_LEXICAL) {
    return {
      severity: 'high',
      shouldPersist: true,
      status: 'under_review',
      reason: 'cosine 0.85–0.92 AND lexical > 0.70 → suspected leak (SME 24h review)',
    };
  }

  if (cos >= HIGH_COSINE && cos <= CRITICAL_COSINE && lex >= MEDIUM_LEXICAL_FLOOR) {
    return {
      severity: 'medium',
      shouldPersist: true,
      status: 'under_review',
      reason: 'cosine 0.85–0.92 AND lexical 0.60–0.70 → medium confidence (SME review)',
    };
  }

  if (cos < HIGH_COSINE && lex > HIGH_LEXICAL) {
    return {
      severity: 'medium',
      shouldPersist: true,
      status: 'under_review',
      reason: 'lexical > 0.70 standalone → medium confidence (SME review)',
    };
  }

  return {
    severity: 'none',
    shouldPersist: false,
    status: 'detected',
    reason: `cosine=${cos.toFixed(3)}, lexical=${lex.toFixed(3)} below dismissal floor`,
  };
}

/**
 * Compose a single similarity_score (0–1) from the cosine + lexical channels
 * for storage in `content.leak_alerts.similarity_score`. Until the cosine
 * channel is live, this collapses to lexical; once cosine is available, the
 * weighted blend favours cosine which is the more semantically meaningful
 * signal.
 */
export function compositeSimilarity(evidence: CrawlEvidence): number {
  const { cosineSimilarity: cos, lexicalOverlap: lex } = evidence;
  if (cos === 0) return lex;
  return cos * 0.6 + lex * 0.4;
}
