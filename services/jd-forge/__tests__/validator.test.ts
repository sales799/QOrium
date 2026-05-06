import { describe, expect, it } from 'vitest';
import { isLikelyLeak, validateQuestion } from '../src/validator';
import type { GeneratedQuestion, SelfCritique } from '../src/types';

const critique = (overrides: Partial<SelfCritique> = {}): SelfCritique => ({
  ambiguity: 8,
  distractorQuality: 8,
  edgeCases: 8,
  bias: 9,
  leakRisk: 9,
  ...overrides,
});

const question = (overrides: Partial<GeneratedQuestion> = {}): GeneratedQuestion => ({
  id: 'q1',
  format: 'mcq',
  difficulty: 'medium',
  skillSource: 'Apex',
  subSkillId: 'sub-apex',
  bodyMd: 'Question stem',
  bodyJson: { options: ['A', 'B', 'C', 'D'], correctIndex: 0 },
  selfCritique: critique(),
  ...overrides,
});

describe('validateQuestion (standard tier)', () => {
  it('accepts a healthy question', () => {
    const r = validateQuestion(question(), 'standard');
    expect(r.verdict).toBe('accept');
  });

  it('rejects when any dimension < 5', () => {
    const r = validateQuestion(question({ selfCritique: critique({ bias: 3 }) }), 'standard');
    expect(r.verdict).toBe('reject');
    expect(r.reasons.some((x) => x.includes('bias'))).toBe(true);
  });

  it('rejects when ambiguity < 3 (hard floor)', () => {
    const r = validateQuestion(question({ selfCritique: critique({ ambiguity: 2 }) }), 'standard');
    expect(r.verdict).toBe('reject');
  });

  it('flags regenerate when scores >= 5 but < 7', () => {
    const r = validateQuestion(question({ selfCritique: critique({ edgeCases: 6 }) }), 'standard');
    expect(r.verdict).toBe('regenerate');
  });

  it('rejects coding question without referenceSolution', () => {
    const r = validateQuestion(
      question({ format: 'coding', referenceSolution: undefined }),
      'standard',
    );
    expect(r.verdict).toBe('reject');
    expect(r.reasons.some((x) => x.includes('referenceSolution'))).toBe(true);
  });

  it('accepts coding question with referenceSolution', () => {
    const r = validateQuestion(
      question({ format: 'coding', referenceSolution: 'def solve(): pass' }),
      'standard',
    );
    expect(r.verdict).toBe('accept');
  });

  it('rejects when bodyMd is empty', () => {
    const r = validateQuestion(question({ bodyMd: '   ' }), 'standard');
    expect(r.verdict).toBe('reject');
  });

  it('rejects when selfCritique missing', () => {
    const r = validateQuestion(question({ selfCritique: undefined }), 'standard');
    expect(r.verdict).toBe('reject');
  });

  it('records a note for non-standard tier in v0', () => {
    const r = validateQuestion(question(), 'reviewed');
    expect(r.reasons.join(' ')).toMatch(/tier reviewed/);
  });
});

describe('isLikelyLeak', () => {
  it('returns true on a deny-listed phrase', () => {
    expect(isLikelyLeak(question({ bodyMd: 'As seen on LeetCode, write a function...' }))).toBe(
      true,
    );
  });

  it('returns false on healthy text', () => {
    expect(isLikelyLeak(question())).toBe(false);
  });

  it('matches against bodyJson too', () => {
    expect(
      isLikelyLeak(
        question({
          bodyMd: 'Stem',
          bodyJson: { source: 'gfg interview question for backend' },
        }),
      ),
    ).toBe(true);
  });
});
