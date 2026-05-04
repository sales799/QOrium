import { describe, expect, it } from 'vitest';
import {
  applyAllMarkers,
  applyCommentStyleSwap,
  applySynonymRewrite,
  applyTestValuePerturbation,
  applyVariableSuffix,
} from '../src/substitution';

describe('applyVariableSuffix', () => {
  it('appends the 2-char suffix to user identifiers inside fenced code', () => {
    const out = applyVariableSuffix('```js\nlet count = 0;\nlet total = sum;\n```', 'a3');
    expect(out).toContain('count_a3');
    expect(out).toContain('total_a3');
    expect(out).toContain('sum_a3');
  });

  it('skips reserved keywords and short identifiers', () => {
    const out = applyVariableSuffix('```js\nif (a) return null;\n```', 'a3');
    expect(out).toContain('if (a)');
    expect(out).toContain('return null');
  });

  it('skips identifiers outside code blocks', () => {
    const out = applyVariableSuffix('Implement the count function.', 'a3');
    expect(out).toBe('Implement the count function.');
  });

  it('is idempotent (no double-suffix on replay)', () => {
    const once = applyVariableSuffix('```js\nlet count = 0;\n```', 'a3');
    const twice = applyVariableSuffix(once, 'a3');
    expect(twice).toBe(once);
  });

  it('rejects malformed suffix (returns input)', () => {
    const text = '```js\nlet count = 0;\n```';
    expect(applyVariableSuffix(text, 'xyz')).toBe(text);
  });
});

describe('applyTestValuePerturbation', () => {
  it('scales integer values by 1 + percent/100', () => {
    const out = applyTestValuePerturbation(
      [
        { input: '100', expected: '200' },
        { input: '5', expected: '10' },
      ],
      5,
    );
    expect(out?.[0]?.input).toBe('105');
    expect(out?.[0]?.expected).toBe('210');
  });

  it('preserves decimal precision', () => {
    const out = applyTestValuePerturbation([{ input: '1.50' }], 10);
    expect(out?.[0]?.input).toBe('1.65');
  });

  it('returns input unchanged when percent=0', () => {
    const tcs = [{ input: '100' }];
    expect(applyTestValuePerturbation(tcs, 0)).toBe(tcs);
  });

  it('returns null when test cases are null', () => {
    expect(applyTestValuePerturbation(null, 5)).toBe(null);
  });
});

describe('applySynonymRewrite', () => {
  it('swaps adjectives outside code blocks', () => {
    const out = applySynonymRewrite('Write a fast sort.', 0);
    expect(out).toContain('quick');
  });

  it('preserves capitalisation', () => {
    const out = applySynonymRewrite('Important note.', 0);
    expect(out.startsWith('Critical')).toBe(true);
  });

  it('does not touch text inside code blocks', () => {
    const out = applySynonymRewrite('```js\n// fast\n```', 0);
    expect(out).toContain('fast');
  });

  it('different indices produce different rewrites', () => {
    const a = applySynonymRewrite('large', 0);
    const b = applySynonymRewrite('large', 5);
    expect(a).not.toBe(b);
  });
});

describe('applyCommentStyleSwap', () => {
  it('converts // → /* */ when style=c', () => {
    const out = applyCommentStyleSwap('```js\n// helper\nlet x = 1;\n```', 'c');
    expect(out).toContain('/* helper */');
    expect(out).not.toContain('// helper');
  });

  it('converts /* */ → // when style=cpp', () => {
    const out = applyCommentStyleSwap('```js\n/* helper */\nlet x = 1;\n```', 'cpp');
    expect(out).toContain('// helper');
    expect(out).not.toContain('/* helper */');
  });

  it('does not touch comments outside code blocks', () => {
    const out = applyCommentStyleSwap('Solve // this puzzle', 'c');
    expect(out).toContain('// this puzzle');
  });
});

describe('applyAllMarkers', () => {
  it('applies all 5 markers in one pass with deterministic output', () => {
    const out = applyAllMarkers({
      bodyMd: '## Task\n\nImplement a fast sort.\n\n```js\n// helper\nlet count = 0;\n```',
      testCases: [{ input: '100', expected: '200' }],
      markers: {
        variableSuffix: 'a3',
        testValuePercent: 5,
        synonymIndex: 0,
        commentStyle: 'c',
        helperReorderParity: 0,
      },
    });
    expect(out.bodyMd).toContain('count_a3');
    // commentStyle runs first, then variableSuffix renames `helper` inside
    // the resulting block comment.
    expect(out.bodyMd).toContain('/* helper_a3 */');
    expect(out.bodyMd).toContain('quick');
    expect(out.testCases?.[0]?.input).toBe('105');
    expect(out.appliedMarkers.helperReorderParity).toBe(false);
  });

  it('idempotent for a given (master, markers) pair', () => {
    const inputs = {
      bodyMd: '## Task\n\nImplement a fast sort.\n\n```js\nlet count = 0;\n```',
      testCases: [{ input: '100' }],
      markers: {
        variableSuffix: 'a3',
        testValuePercent: 5,
        synonymIndex: 0,
        commentStyle: 'c' as const,
        helperReorderParity: 0 as const,
      },
    };
    const a = applyAllMarkers(inputs);
    const b = applyAllMarkers(inputs);
    expect(b.bodyMd).toBe(a.bodyMd);
    expect(b.testCases).toEqual(a.testCases);
  });
});
