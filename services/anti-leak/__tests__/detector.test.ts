import { describe, expect, it } from 'vitest';
import {
  classify,
  extractDistinctiveNgrams,
  jaccard,
  matchedNgrams,
  tokenize,
} from '../src/detector.js';

const THRESHOLDS = {
  thresholdAutoRotate: 0.92,
  thresholdHighReview: 0.85,
  thresholdMediumReview: 0.7,
};

describe('tokenize', () => {
  it('lowercases, splits on non-word chars, drops stopwords', () => {
    expect(tokenize('The quick BROWN fox jumps over the lazy dog')).toEqual([
      'quick',
      'brown',
      'fox',
      'jumps',
      'lazy',
      'dog',
    ]);
  });

  it('returns empty for whitespace / pure stopwords', () => {
    expect(tokenize('the and of   ')).toEqual([]);
    expect(tokenize('')).toEqual([]);
  });
});

describe('extractDistinctiveNgrams', () => {
  it('produces ≤ topK n-grams ordered by length', () => {
    const text =
      'Implement a self-balancing red-black tree with insert delete and rebalance operations preserving the invariants of black height and root colour';
    const grams = extractDistinctiveNgrams(text, { topK: 3, minN: 6, maxN: 10 });
    expect(grams.length).toBeLessThanOrEqual(3);
    expect(grams.length).toBeGreaterThan(0);
    // Ordered by descending length.
    for (let i = 1; i < grams.length; i++) {
      expect(grams[i - 1]!.length).toBeGreaterThanOrEqual(grams[i]!.length);
    }
  });

  it('falls back to a single short query when the text is too short', () => {
    const grams = extractDistinctiveNgrams('only six words just below threshold here', {
      topK: 5,
      minN: 9,
      maxN: 15,
    });
    expect(grams.length).toBe(1);
  });

  it('skips stopwords + words < 3 chars', () => {
    const grams = extractDistinctiveNgrams('a it of so to the and but or in on at by', {
      topK: 5,
      minN: 3,
      maxN: 5,
    });
    expect(grams).toEqual([]);
  });
});

describe('jaccard', () => {
  it('returns 0 when both sets are empty', () => {
    expect(jaccard([], [])).toBe(0);
  });

  it('returns 1 for identical token sets', () => {
    expect(jaccard(['a', 'b', 'c'], ['c', 'b', 'a'])).toBe(1);
  });

  it('returns expected ratio for partial overlap', () => {
    // {a,b,c} ∩ {b,c,d} = 2; ∪ = 4; ratio = 0.5
    expect(jaccard(['a', 'b', 'c'], ['b', 'c', 'd'])).toBeCloseTo(0.5, 6);
  });

  it('treats duplicates as set members (deduplicated)', () => {
    expect(jaccard(['a', 'a', 'b'], ['a', 'b'])).toBe(1);
  });
});

describe('matchedNgrams', () => {
  it('returns n-grams from the question that appear verbatim in the snippet', () => {
    const question = 'implement a red black tree with insert and delete operations';
    const snippet =
      'How to implement a red black tree with insert and delete operations in C++ — full solution';
    const matches = matchedNgrams(question, snippet);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]).toContain('red black tree');
  });

  it('returns no matches when the snippet shares no n-grams', () => {
    const question = 'design a multi-region failover topology with quorum reconciliation';
    const snippet = 'A unrelated discussion about kitchen appliances and recipes.';
    expect(matchedNgrams(question, snippet)).toEqual([]);
  });
});

describe('classify', () => {
  it('flags a verbatim copy as critical (auto-rotate)', () => {
    const body =
      'Write a function that takes an integer n and returns the nth Fibonacci number using memoisation. Handle negative inputs gracefully.';
    const snippet = body; // exact copy
    const result = classify(body, snippet, THRESHOLDS);
    expect(result.severity).toBe('critical');
    expect(result.autoRotate).toBe(true);
    expect(result.similarity).toBeGreaterThanOrEqual(THRESHOLDS.thresholdAutoRotate);
  });

  it('flags a high-overlap paraphrase as high (SME review)', () => {
    const body =
      'Write a function that takes integer n returns nth Fibonacci number using memoisation handle negative inputs gracefully';
    // ~85% overlap
    const snippet =
      'Write a function that takes integer n returns nth Fibonacci number using memoisation handle negative inputs differently';
    const result = classify(body, snippet, THRESHOLDS);
    expect(['high', 'critical']).toContain(result.severity);
    expect(result.needsReview || result.autoRotate).toBe(true);
  });

  it('flags a medium-overlap snippet as medium (SME review)', () => {
    const body =
      'design a multi-region failover topology quorum reconciliation across three datacentres distributed consensus';
    // Tokens overlap is intentionally tuned to land in [0.7, 0.85).
    const snippet =
      'design a multi-region failover topology quorum reconciliation across three datacentres extra';
    const result = classify(body, snippet, THRESHOLDS);
    expect(['medium', 'high']).toContain(result.severity);
  });

  it('classifies unrelated text as low (no alert)', () => {
    const body =
      'design a multi-region failover topology with quorum based reconciliation across three datacentres';
    const snippet = 'recipe for chocolate cake with vanilla buttercream frosting';
    const result = classify(body, snippet, THRESHOLDS);
    expect(result.severity).toBe('low');
    expect(result.needsReview).toBe(false);
    expect(result.autoRotate).toBe(false);
  });
});
