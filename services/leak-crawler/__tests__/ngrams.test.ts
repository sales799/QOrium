import { describe, expect, it } from 'vitest';
import { extractDistinctiveNGrams, normaliseTextForNGrams } from '../src/ngrams';

describe('normaliseTextForNGrams', () => {
  it('lowercases, drops fenced + inline code, and strips punctuation', () => {
    const input = `# Reverse a Linked List
Implement \`reverse(head)\` returning the new head.

\`\`\`ts
function reverse(head: Node | null): Node | null {
  return head;
}
\`\`\`

Constraints: 1 <= n <= 10^5; nodes have unique \`val\`.`;
    const out = normaliseTextForNGrams(input);
    expect(out).not.toContain('```');
    expect(out).not.toContain('`reverse(head)`');
    expect(out).toMatch(/reverse a linked list/);
    expect(out).not.toMatch(/[#*_~]/);
  });

  it('returns empty string for empty input', () => {
    expect(normaliseTextForNGrams('')).toBe('');
    expect(normaliseTextForNGrams('   ')).toBe('');
  });
});

describe('extractDistinctiveNGrams', () => {
  it('returns top-K unique distinctive n-grams within length bounds', () => {
    const text =
      'Given a directed acyclic graph and two source nodes, return the topological ordering ' +
      'that minimizes the maximum path length while preserving precedence constraints.';
    const out = extractDistinctiveNGrams(text, { topK: 3, minWords: 9, maxWords: 12 });
    expect(out).toHaveLength(3);
    for (const phrase of out) {
      const words = phrase.split(' ');
      expect(words.length).toBeGreaterThanOrEqual(9);
      expect(words.length).toBeLessThanOrEqual(12);
    }
    expect(new Set(out).size).toBe(out.length);
  });

  it('returns empty array when text is shorter than minWords', () => {
    expect(extractDistinctiveNGrams('only six words right here it is', { minWords: 9 })).toEqual(
      [],
    );
  });

  it('returns empty array on degenerate options', () => {
    const text = 'a b c d e f g h i j k l m n o p q r s t';
    expect(extractDistinctiveNGrams(text, { topK: 0 })).toEqual([]);
    expect(extractDistinctiveNGrams(text, { minWords: 0 })).toEqual([]);
    expect(extractDistinctiveNGrams(text, { minWords: 12, maxWords: 5 })).toEqual([]);
  });

  it('does not return n-grams that are substrings of one already taken', () => {
    const text = Array.from({ length: 30 }, (_, i) => `term${i}`).join(' ');
    const out = extractDistinctiveNGrams(text, { topK: 3, minWords: 9, maxWords: 11 });
    for (const a of out) {
      for (const b of out) {
        if (a === b) continue;
        expect(a.includes(b)).toBe(false);
      }
    }
  });

  it('prefers phrases with fewer stopwords (higher distinctiveness)', () => {
    const distinctive = 'topological ordering minimizes the maximum path length preserving';
    const stoppy = 'this is the of and to in for on with that as the';
    const out = extractDistinctiveNGrams(`${distinctive} ${stoppy}`, {
      topK: 1,
      minWords: 6,
      maxWords: 8,
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatch(/topological/);
  });
});
