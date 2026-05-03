/**
 * Import-graph verifier — proves every Phase 1 service's public API is
 * importable + invocable without DB / external services. Catches
 * cross-workspace dependency drift (a service that builds in isolation but
 * fails to resolve when consumed) before deploy.
 *
 * Pure-logic — exercises only deterministic functions. No DB, no HTTP.
 */

import { extractDistinctiveNGrams, scoreEvidence, classifyEvidence } from '@qorium/leak-crawler';
import { fit2PL, classifyDrift, defaultGuessingForFormat } from '@qorium/irt-calibration';
import {
  isSupportedLanguage,
  scoreSubmission,
  computeAntiFraudSignals,
} from '@qorium/judge0-orchestrator';
import { nextActionFor, scoreEnsemble, runBenchmark } from '@qorium/testforge-orchestrator';

export interface ImportGraphResult {
  workspace: string;
  symbol: string;
  ok: boolean;
  details?: string;
}

export function exerciseImportGraph(): ImportGraphResult[] {
  const out: ImportGraphResult[] = [];

  out.push(
    check('@qorium/leak-crawler', 'extractDistinctiveNGrams', () => {
      const ngrams = extractDistinctiveNGrams(
        'reverse a singly linked list iteratively without recursion in linear time',
        { topK: 1, minWords: 9, maxWords: 11 },
      );
      return ngrams.length > 0;
    }),
  );

  out.push(
    check('@qorium/leak-crawler', 'scoreEvidence + classifyEvidence', () => {
      const evidence = scoreEvidence('reverse a linked list', 'reverse a linked list iteratively');
      const c = classifyEvidence(evidence);
      return c.severity === 'medium' || c.severity === 'high' || c.severity === 'none';
    }),
  );

  out.push(
    check('@qorium/irt-calibration', 'fit2PL + classifyDrift', () => {
      const fit = fit2PL([0, 0.5, -0.5, 1, -1], [1, 1, 0, 1, 0], { cFixed: 0.25 });
      const flag = classifyDrift({
        estimated: fit.params,
        prior: { a: 1, b: 0 },
        empiricalPassRate: 0.5,
      });
      return ['none', 'drift_a', 'drift_b', 'extreme_pass_rate'].includes(flag);
    }),
  );

  out.push(
    check('@qorium/irt-calibration', 'defaultGuessingForFormat', () => {
      return defaultGuessingForFormat('mcq') === 0.25 && defaultGuessingForFormat('coding') === 0;
    }),
  );

  out.push(
    check('@qorium/judge0-orchestrator', 'isSupportedLanguage + scoreSubmission', () => {
      if (!isSupportedLanguage('python3')) return false;
      const r = scoreSubmission(
        [{ index: 0, expectedOutputPattern: '^8$', weight: 1, public: true }],
        [
          {
            index: 0,
            stdout: '8\n',
            stderr: '',
            exitCode: 0,
            timeMs: 1,
            memoryKb: 1,
          },
        ],
      );
      return r.total === 100;
    }),
  );

  out.push(
    check('@qorium/judge0-orchestrator', 'computeAntiFraudSignals', () => {
      const s = computeAntiFraudSignals({ pasteEventCount: 9, typedEventCount: 1 });
      return s.flags.includes('high_paste_ratio');
    }),
  );

  out.push(
    check('@qorium/testforge-orchestrator', 'nextActionFor', () => {
      const action = nextActionFor({
        status: 'draft',
        calibrationN: 0,
        hasReleasedAt: false,
        audit: {},
      });
      return action.kind === 'await_sme_decision';
    }),
  );

  out.push(
    check('@qorium/testforge-orchestrator', 'scoreEnsemble', () => {
      const r = scoreEnsemble({
        text: 'The function processes the input array efficiently. The function returns a result.',
      });
      return r.aiLikelihood >= 0 && r.aiLikelihood <= 1;
    }),
  );

  out.push(
    check('@qorium/testforge-orchestrator', 'runBenchmark (empty)', () => {
      const r = runBenchmark([]);
      return r.total === 0 && r.passesSO22Threshold === false;
    }),
  );

  return out;
}

function check(workspace: string, symbol: string, fn: () => boolean): ImportGraphResult {
  try {
    const ok = fn();
    return ok
      ? { workspace, symbol, ok: true }
      : { workspace, symbol, ok: false, details: 'assertion returned false' };
  } catch (err) {
    return {
      workspace,
      symbol,
      ok: false,
      details: err instanceof Error ? err.message : String(err),
    };
  }
}
