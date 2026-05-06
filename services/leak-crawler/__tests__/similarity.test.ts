import { describe, expect, it } from 'vitest';
import { jaccardSimilarity, lexicalOverlap, scoreEvidence, tokeniseToSet } from '../src/similarity';

describe('tokeniseToSet', () => {
  it('drops stopwords and tokens shorter than 3 chars', () => {
    const set = tokeniseToSet('The cat IS in the box of words');
    expect(set.has('cat')).toBe(true);
    expect(set.has('box')).toBe(true);
    expect(set.has('words')).toBe(true);
    expect(set.has('the')).toBe(false);
    expect(set.has('is')).toBe(false);
    expect(set.has('in')).toBe(false);
  });

  it('returns empty set for empty / whitespace input', () => {
    expect(tokeniseToSet('').size).toBe(0);
    expect(tokeniseToSet('  \t\n  ').size).toBe(0);
  });

  it('treats underscores and digits as part of identifier tokens', () => {
    const set = tokeniseToSet('crc_value sha256 reverse_list');
    expect(set.has('crc_value')).toBe(true);
    expect(set.has('sha256')).toBe(true);
    expect(set.has('reverse_list')).toBe(true);
  });
});

describe('jaccardSimilarity', () => {
  it('returns 0 when either side is empty', () => {
    expect(jaccardSimilarity(new Set(), new Set(['a']))).toBe(0);
    expect(jaccardSimilarity(new Set(['a']), new Set())).toBe(0);
  });

  it('returns 1 for identical sets', () => {
    const set = new Set(['alpha', 'beta', 'gamma']);
    expect(jaccardSimilarity(set, new Set(set))).toBe(1);
  });

  it('returns |A∩B| / |A∪B|', () => {
    const a = new Set(['alpha', 'beta', 'gamma']);
    const b = new Set(['beta', 'gamma', 'delta']);
    expect(jaccardSimilarity(a, b)).toBeCloseTo(2 / 4, 5);
  });
});

describe('lexicalOverlap', () => {
  it('detects high overlap between body and snippet', () => {
    const body =
      'Given a directed acyclic graph, return the topological ordering that minimizes path length.';
    const snippet =
      'Q1: Given directed acyclic graph return topological ordering minimizing path length.';
    expect(lexicalOverlap(body, snippet)).toBeGreaterThan(0.7);
  });

  it('returns low overlap for unrelated snippet', () => {
    const body = 'Reverse a singly linked list iteratively without recursion.';
    const snippet =
      'How to implement a binary search tree with self-balancing rotations in C++ template metaprogramming.';
    expect(lexicalOverlap(body, snippet)).toBeLessThan(0.2);
  });
});

describe('scoreEvidence', () => {
  it('returns cosineSimilarity = 0 (deferred) and a real lexicalOverlap', () => {
    const ev = scoreEvidence('topological ordering directed acyclic graph', 'directed acyclic');
    expect(ev.cosineSimilarity).toBe(0);
    expect(ev.lexicalOverlap).toBeGreaterThan(0);
  });
});
