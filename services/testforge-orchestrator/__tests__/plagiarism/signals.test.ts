import { describe, expect, it } from 'vitest';
import {
  burstinessScore,
  computeAvailableSignals,
  lexicalDiversityScore,
  ngramEntropyScore,
  sentenceLengthVarianceScore,
} from '../../src/plagiarism/signals';

const HUMAN_TEXT = `OK so I tried this and it broke spectacularly. The list comprehension blew up because some of
the items were null. I stuck a guard in front of it. That worked, mostly. There's still a weird
edge case when the input array is empty — the function returns null instead of an empty list,
which is fine I guess but the caller doesn't expect it. So tomorrow I'm changing it. Probably.`;

const AI_TEXT = `The function processes the input array efficiently. The function iterates through each
element. The function checks for null values. The function appends valid elements to the result.
The function returns the result. The function handles edge cases gracefully. The function uses
list comprehension for clarity. The function maintains O(n) time complexity. The function is
well-documented. The function follows best practices.`;

describe('burstinessScore', () => {
  it('returns lower AI-likelihood for human text (more variable sentence length)', () => {
    const human = burstinessScore(HUMAN_TEXT);
    const ai = burstinessScore(AI_TEXT);
    expect(ai).toBeGreaterThan(human);
  });

  it('returns 0.5 for very short / single-sentence text', () => {
    expect(burstinessScore('hi.')).toBe(0.5);
    expect(burstinessScore('')).toBe(0.5);
  });
});

describe('ngramEntropyScore', () => {
  it('AI text scores higher (lower entropy → repetition)', () => {
    const human = ngramEntropyScore(HUMAN_TEXT);
    const ai = ngramEntropyScore(AI_TEXT);
    expect(ai).toBeGreaterThan(human);
  });

  it('handles empty / single-token input', () => {
    expect(ngramEntropyScore('')).toBe(0.5);
    expect(ngramEntropyScore('one')).toBe(0.5);
  });
});

describe('lexicalDiversityScore', () => {
  it('AI text (lower TTR) scores higher AI-likelihood', () => {
    const human = lexicalDiversityScore(HUMAN_TEXT);
    const ai = lexicalDiversityScore(AI_TEXT);
    expect(ai).toBeGreaterThan(human);
  });

  it('returns 0.5 when sample is too short to be informative', () => {
    expect(lexicalDiversityScore('a quick brown fox')).toBe(0.5);
  });
});

describe('sentenceLengthVarianceScore', () => {
  it('AI text scores higher (uniform sentence lengths)', () => {
    const human = sentenceLengthVarianceScore(HUMAN_TEXT);
    const ai = sentenceLengthVarianceScore(AI_TEXT);
    expect(ai).toBeGreaterThan(human);
  });

  it('returns 0.5 with fewer than 3 sentences', () => {
    expect(sentenceLengthVarianceScore('Hi. Bye.')).toBe(0.5);
  });
});

describe('computeAvailableSignals', () => {
  it('returns all four signals in [0, 1]', () => {
    const s = computeAvailableSignals(HUMAN_TEXT);
    for (const v of Object.values(s)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});
