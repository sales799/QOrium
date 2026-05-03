import { describe, expect, it } from 'vitest';
import {
  getLanguageProfile,
  isSupportedLanguage,
  judge0IdFor,
  listSupportedLanguages,
} from '../src/languages';

describe('listSupportedLanguages', () => {
  it('exposes the 12 baseline + apex per spec §5', () => {
    const ids = listSupportedLanguages().map((p) => p.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'java21',
        'python3',
        'node20',
        'typescript5',
        'cpp20',
        'rust175',
        'go122',
        'c17',
        'sql',
        'bash5',
        'shell-awk',
        'apex',
      ]),
    );
    expect(ids.length).toBeGreaterThanOrEqual(12);
  });

  it('apex is the only entry that does not route to judge0', () => {
    const offJudge0 = listSupportedLanguages().filter((p) => !p.routesToJudge0);
    expect(offJudge0.map((p) => p.id)).toEqual(['apex']);
  });
});

describe('isSupportedLanguage', () => {
  it.each([
    ['java21', true],
    ['python3', true],
    ['apex', true],
    ['java', false],
    ['python', false],
    ['', false],
    ['random-string', false],
  ])('classifies %s', (input, expected) => {
    expect(isSupportedLanguage(input)).toBe(expected);
  });
});

describe('getLanguageProfile', () => {
  it('returns sane defaults for python3', () => {
    const p = getLanguageProfile('python3');
    expect(p.judge0Id).toBe(71);
    expect(p.defaultMemoryMb).toBe(256);
    expect(p.defaultTimeMs).toBe(3_000);
    expect(p.compilationBudgetMs).toBe(0);
    expect(p.routesToJudge0).toBe(true);
  });

  it('matches spec §5 compile budgets (Java=3s longest, Rust=2s, C/C++/TS=1s, Go=0.5s)', () => {
    const profiles = listSupportedLanguages();
    const budget = (id: string) => profiles.find((p) => p.id === id)!.compilationBudgetMs;
    expect(budget('java21')).toBe(3_000);
    expect(budget('rust175')).toBe(2_000);
    expect(budget('cpp20')).toBe(1_000);
    expect(budget('typescript5')).toBe(1_000);
    expect(budget('c17')).toBe(1_000);
    expect(budget('go122')).toBe(500);
    // Java has the longest budget across all languages with compilation overhead.
    const compiled = profiles.filter((p) => p.compilationBudgetMs > 0);
    const max = Math.max(...compiled.map((p) => p.compilationBudgetMs));
    expect(budget('java21')).toBe(max);
  });
});

describe('judge0IdFor', () => {
  it('returns numeric ID for judge0-routed languages', () => {
    expect(judge0IdFor('python3')).toBe(71);
    expect(judge0IdFor('java21')).toBe(91);
  });

  it('throws for apex (does not route to judge0)', () => {
    expect(() => judge0IdFor('apex')).toThrow();
  });
});
