/**
 * AI-vs-human classification signals per
 * `governance/AI-Plagiarism-Benchmark-Protocol-v1.md` §3.
 *
 * v0 ships the **statistical** (§3.1) and **stylometric** (§3.3) signals that
 * are pure functions of the response text. Perplexity-via-LM, GPT-Zero, and
 * Pangram require external models / APIs and are deferred per
 * `infra/CTO-deltas/CTO-DELTA-testforge-plagiarism-perplexity-deferred.md`.
 *
 * All signals return a number in [0, 1] where higher = more AI-like.
 */

import { ngrams, splitSentences, tokeniseWords } from './text.js';

/**
 * Burstiness = stddev / mean of sentence-length-in-tokens. AI text is
 * typically smoother (low burstiness ~ 0.3); human text varies more
 * (high burstiness ~ 0.7+). We project to AI-likelihood with the spec's
 * §3.1 threshold "Burstiness > 0.7 = human-signal".
 */
export function burstinessScore(text: string): number {
  const sentences = splitSentences(text);
  if (sentences.length < 2) return 0.5;
  const lengths = sentences.map((s) => tokeniseWords(s).length).filter((l) => l > 0);
  if (lengths.length < 2) return 0.5;
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  if (mean <= 0) return 0.5;
  const variance = lengths.reduce((s, l) => s + (l - mean) * (l - mean), 0) / lengths.length;
  const burstiness = Math.sqrt(variance) / mean;
  // burstiness ~ 0 → very smooth → AI-likelihood ~ 1
  // burstiness ~ 1 → very bursty → AI-likelihood ~ 0
  // Map (0 → 1) → (1 → 0) with a saturation at 1.5
  const aiLikelihood = 1 - Math.min(1, burstiness / 0.7);
  return clamp01(aiLikelihood);
}

/**
 * N-gram entropy (Shannon) over the response. AI text repeats common
 * n-grams more → lower entropy. v0 uses bigrams; threshold per §3.1
 * "Entropy < 4.5 bits = AI-signal".
 */
export function ngramEntropyScore(text: string, n = 2): number {
  const tokens = tokeniseWords(text);
  const bigrams = ngrams(tokens, n);
  if (bigrams.length === 0) return 0.5;
  const counts = new Map<string, number>();
  for (const g of bigrams) counts.set(g, (counts.get(g) ?? 0) + 1);
  let entropy = 0;
  for (const c of counts.values()) {
    const p = c / bigrams.length;
    entropy -= p * Math.log2(p);
  }
  // Map: entropy < 4.5 → AI-likelihood high; entropy > 7 → low
  const normalised = clamp01((7 - entropy) / 2.5);
  return normalised;
}

/**
 * Lexical diversity (type-token ratio). AI text is typically more
 * repetitive → lower TTR. Per §3.3 "AI text: Often more repetitive;
 * lower TTR".
 */
export function lexicalDiversityScore(text: string): number {
  const tokens = tokeniseWords(text);
  if (tokens.length < 20) return 0.5;
  const types = new Set(tokens).size;
  const ttr = types / tokens.length;
  // Empirically TTR ~ 0.55 for AI, ~ 0.7 for human (response-length normalised).
  // Map TTR ≤ 0.5 → 1.0; TTR ≥ 0.75 → 0.0; linear in between.
  const aiLikelihood = clamp01((0.75 - ttr) / 0.25);
  return aiLikelihood;
}

/**
 * Sentence-length variance. AI text has lower variance than human text
 * (LLMs tend to produce uniformly-shaped sentences). Per §3.3.
 */
export function sentenceLengthVarianceScore(text: string): number {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return 0.5;
  const lengths = sentences.map((s) => tokeniseWords(s).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  if (mean <= 0) return 0.5;
  const variance = lengths.reduce((s, l) => s + (l - mean) * (l - mean), 0) / lengths.length;
  const stddev = Math.sqrt(variance);
  // AI: stddev typically 2-4 words; human: 6-12 words.
  // Map stddev ≤ 3 → AI=1.0; stddev ≥ 8 → AI=0.0.
  const aiLikelihood = clamp01((8 - stddev) / 5);
  return aiLikelihood;
}

export interface AISignalBreakdown {
  burstiness: number;
  ngramEntropy: number;
  lexicalDiversity: number;
  sentenceLengthVariance: number;
}

export function computeAvailableSignals(text: string): AISignalBreakdown {
  return {
    burstiness: burstinessScore(text),
    ngramEntropy: ngramEntropyScore(text),
    lexicalDiversity: lexicalDiversityScore(text),
    sentenceLengthVariance: sentenceLengthVarianceScore(text),
  };
}

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0.5;
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}
