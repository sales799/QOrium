/**
 * Stage 5 — Express validation per spec §7 (per-tier acceptance criteria).
 *
 * Standard tier (v0):
 *   Auto-pass: every self-critique dimension ≥ 7 / 10
 *   Auto-fail: any dimension < 5
 *   Format-specific: code questions must declare a referenceSolution
 *   Leak guard: detect obvious leak patterns (deferred to v1; spec calls
 *     for cosine vs public corpus; we ship a coarse string-prefix check)
 *
 * Reviewed / Enterprise additions are deferred to M5+ per spec §12.
 */

import type { GeneratedQuestion, SelfCritique, Tier } from './types.js';

export type ValidatorVerdict = 'accept' | 'regenerate' | 'reject';

export interface ValidationOutcome {
  verdict: ValidatorVerdict;
  reasons: string[];
}

const AUTO_PASS_FLOOR = 7;
const AUTO_FAIL_FLOOR = 5;
const AMBIGUITY_REJECT_FLOOR = 3;

const DIMENSIONS: Array<keyof SelfCritique> = [
  'ambiguity',
  'distractorQuality',
  'edgeCases',
  'bias',
  'leakRisk',
];

export function validateQuestion(question: GeneratedQuestion, tier: Tier): ValidationOutcome {
  const reasons: string[] = [];

  if (tier !== 'standard') {
    reasons.push(`tier ${tier} not supported in v0; treating as standard`);
  }

  const critique = question.selfCritique;
  if (!critique) {
    return { verdict: 'reject', reasons: ['missing selfCritique'] };
  }

  // Hard ambiguity floor
  if (critique.ambiguity < AMBIGUITY_REJECT_FLOOR) {
    reasons.push(`ambiguity score ${critique.ambiguity} < ${AMBIGUITY_REJECT_FLOOR}`);
    return { verdict: 'reject', reasons };
  }

  let allAtFloor = true;
  for (const k of DIMENSIONS) {
    const v = critique[k];
    if (v < AUTO_FAIL_FLOOR) {
      reasons.push(`${k} score ${v} < ${AUTO_FAIL_FLOOR}`);
      return { verdict: 'reject', reasons };
    }
    if (v < AUTO_PASS_FLOOR) {
      allAtFloor = false;
      reasons.push(`${k} score ${v} < ${AUTO_PASS_FLOOR}`);
    }
  }

  if (question.format === 'coding' && !question.referenceSolution) {
    reasons.push('coding question missing referenceSolution');
    return { verdict: 'reject', reasons };
  }

  if (!isStringPopulated(question.bodyMd)) {
    reasons.push('bodyMd is empty');
    return { verdict: 'reject', reasons };
  }

  return { verdict: allAtFloor ? 'accept' : 'regenerate', reasons };
}

function isStringPopulated(s: unknown): boolean {
  return typeof s === 'string' && s.trim().length > 0;
}

/**
 * Coarse leak heuristic — rejects obvious giveaways (e.g., a question that
 * contains a known-bad phrase). Real semantic-leak detection is the
 * Anti-Leak Engine's job (Sprint 1.4) and runs against released questions;
 * v0 just makes sure JD-Forge doesn't ship anything containing the
 * deny-listed phrases below.
 */
const LEAK_DENYLIST: ReadonlyArray<string> = [
  'as seen on leetcode',
  'as seen on hackerrank',
  'gfg interview question',
  'cracking the coding interview problem',
];

export function isLikelyLeak(question: GeneratedQuestion): boolean {
  const haystack = `${question.bodyMd}\n${JSON.stringify(question.bodyJson)}`.toLowerCase();
  return LEAK_DENYLIST.some((phrase) => haystack.includes(phrase));
}
