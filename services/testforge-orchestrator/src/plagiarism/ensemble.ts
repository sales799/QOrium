/**
 * Ensemble scoring per `governance/AI-Plagiarism-Benchmark-Protocol-v1.md` §3.5.
 *
 *   ensemble_score = 0.30·statistical + 0.20·behavioral + 0.20·stylometric
 *                    + 0.15·direct_model + 0.15·self_check
 *
 * v0 ships statistical + stylometric. The remaining 50 % of the ensemble is
 * deferred (perplexity model, behavioural keystroke telemetry, direct model
 * services, self-check). Until those land we **renormalise the available
 * weights** so a v0 score is on the same [0, 1] scale and comparable to
 * future ensembles. The renormalisation is logged in the breakdown so SME
 * Lead reviewers can see which signals were active at run time.
 */

import { computeAvailableSignals, type AISignalBreakdown } from './signals.js';

export interface EnsembleResult {
  /** Final ensemble likelihood in [0, 1]; >= 0.6 = flag as AI per §3.5. */
  aiLikelihood: number;
  flagged: boolean;
  signalBreakdown: AISignalBreakdown;
  weights: {
    statistical: number;
    stylometric: number;
    behavioral: number;
    directModel: number;
    selfCheck: number;
  };
  /** Sum of weights actually used for this score (≤ 1.0). */
  activeWeightSum: number;
}

const FLAG_THRESHOLD = 0.6;

const SPEC_WEIGHTS = Object.freeze({
  statistical: 0.3,
  behavioral: 0.2,
  stylometric: 0.2,
  directModel: 0.15,
  selfCheck: 0.15,
});

export interface EnsembleInputs {
  text: string;
  /** Behavioural signal already computed elsewhere (anti-fraud module). */
  behavioralAiLikelihood?: number;
  /** Direct-model output (GPT-Zero / Pangram). Optional in v0. */
  directModelAiLikelihood?: number;
  /** Self-check output. Optional in v0. */
  selfCheckAiLikelihood?: number;
}

export function scoreEnsemble(inputs: EnsembleInputs): EnsembleResult {
  const breakdown = computeAvailableSignals(inputs.text);

  // Statistical group: average burstiness + ngram-entropy
  const statistical = (breakdown.burstiness + breakdown.ngramEntropy) / 2;
  // Stylometric group: average lexical-diversity + sentence-length-variance
  const stylometric = (breakdown.lexicalDiversity + breakdown.sentenceLengthVariance) / 2;

  let activeWeight = 0;
  let weighted = 0;

  weighted += SPEC_WEIGHTS.statistical * statistical;
  activeWeight += SPEC_WEIGHTS.statistical;

  weighted += SPEC_WEIGHTS.stylometric * stylometric;
  activeWeight += SPEC_WEIGHTS.stylometric;

  if (typeof inputs.behavioralAiLikelihood === 'number') {
    weighted += SPEC_WEIGHTS.behavioral * clamp01(inputs.behavioralAiLikelihood);
    activeWeight += SPEC_WEIGHTS.behavioral;
  }
  if (typeof inputs.directModelAiLikelihood === 'number') {
    weighted += SPEC_WEIGHTS.directModel * clamp01(inputs.directModelAiLikelihood);
    activeWeight += SPEC_WEIGHTS.directModel;
  }
  if (typeof inputs.selfCheckAiLikelihood === 'number') {
    weighted += SPEC_WEIGHTS.selfCheck * clamp01(inputs.selfCheckAiLikelihood);
    activeWeight += SPEC_WEIGHTS.selfCheck;
  }

  const aiLikelihood = activeWeight > 0 ? weighted / activeWeight : 0.5;
  return {
    aiLikelihood: clamp01(aiLikelihood),
    flagged: aiLikelihood >= FLAG_THRESHOLD,
    signalBreakdown: breakdown,
    weights: {
      statistical: SPEC_WEIGHTS.statistical,
      stylometric: SPEC_WEIGHTS.stylometric,
      behavioral: SPEC_WEIGHTS.behavioral,
      directModel: SPEC_WEIGHTS.directModel,
      selfCheck: SPEC_WEIGHTS.selfCheck,
    },
    activeWeightSum: activeWeight,
  };
}

export interface BenchmarkSample {
  text: string;
  truth: 'ai' | 'human';
}

export interface BenchmarkReport {
  detectionRate: number;
  falsePositiveRate: number;
  truePositives: number;
  falseNegatives: number;
  trueNegatives: number;
  falsePositives: number;
  total: number;
  passesSO22Threshold: boolean;
}

/**
 * Quarterly benchmark per §4.1. SO-22 mandates ≥ 93% detection rate;
 * false-positive rate ≤ 5% per §4.1 step 3.
 */
const SO22_THRESHOLD = 0.93;
const MAX_FALSE_POSITIVE_RATE = 0.05;

export function runBenchmark(samples: readonly BenchmarkSample[]): BenchmarkReport {
  let tp = 0;
  let fn = 0;
  let tn = 0;
  let fp = 0;

  for (const s of samples) {
    const result = scoreEnsemble({ text: s.text });
    const flagged = result.flagged;
    if (s.truth === 'ai') {
      if (flagged) tp++;
      else fn++;
    } else if (flagged) fp++;
    else tn++;
  }

  const aiTotal = tp + fn;
  const humanTotal = tn + fp;
  const detectionRate = aiTotal > 0 ? tp / aiTotal : 0;
  const falsePositiveRate = humanTotal > 0 ? fp / humanTotal : 0;

  return {
    detectionRate,
    falsePositiveRate,
    truePositives: tp,
    falseNegatives: fn,
    trueNegatives: tn,
    falsePositives: fp,
    total: samples.length,
    passesSO22Threshold:
      detectionRate >= SO22_THRESHOLD && falsePositiveRate <= MAX_FALSE_POSITIVE_RATE,
  };
}

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0.5;
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}
