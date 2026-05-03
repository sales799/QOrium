import { describe, expect, it } from 'vitest';
import {
  computePrior,
  selectNeighbours,
  type NeighbourCandidate,
  type NewlyAcceptedQuestion,
} from '../src/prior';

const Q: NewlyAcceptedQuestion = {
  id: 'new-1',
  skillId: 'skill-java',
  subSkillId: 'sub-collections',
  format: 'mcq',
};

const candidate = (overrides: Partial<NeighbourCandidate>): NeighbourCandidate => ({
  id: `c-${Math.random().toString(36).slice(2, 6)}`,
  skillId: 'skill-java',
  subSkillId: 'sub-collections',
  format: 'mcq',
  difficultyB: 0.0,
  discriminationA: 1.2,
  guessingC: 0.25,
  calibrationN: 50,
  ...overrides,
});

describe('selectNeighbours', () => {
  it('drops items with calibrationN < 30', () => {
    const all = [candidate({}), candidate({ calibrationN: 10 })];
    const filtered = selectNeighbours(Q, all);
    expect(filtered).toHaveLength(1);
  });

  it('drops items with mismatched skill / subskill / format', () => {
    const all = [
      candidate({ skillId: 'skill-python' }),
      candidate({ subSkillId: 'sub-other' }),
      candidate({ format: 'coding' }),
      candidate({}),
    ];
    expect(selectNeighbours(Q, all)).toHaveLength(1);
  });

  it('drops items with null params', () => {
    expect(selectNeighbours(Q, [candidate({ difficultyB: null })])).toHaveLength(0);
    expect(selectNeighbours(Q, [candidate({ discriminationA: null })])).toHaveLength(0);
  });
});

describe('computePrior', () => {
  it('falls back to format default when no neighbours', () => {
    const result = computePrior(Q, []);
    expect(result.source).toBe('format_default');
    expect(result.difficultyB).toBe(0);
    expect(result.discriminationA).toBe(1.0);
    expect(result.guessingC).toBe(0.25); // mcq default
    expect(result.neighbourCount).toBe(0);
  });

  it('uses format default for non-mcq formats', () => {
    const codingQ: NewlyAcceptedQuestion = { ...Q, format: 'coding' };
    const result = computePrior(codingQ, []);
    expect(result.guessingC).toBe(0);
  });

  it('weighted average across single neighbour ≈ that neighbour', () => {
    const result = computePrior(Q, [
      candidate({ difficultyB: 0.8, discriminationA: 1.5, guessingC: 0.25 }),
    ]);
    expect(result.source).toBe('neighbour');
    expect(result.difficultyB).toBeCloseTo(0.8, 3);
    expect(result.discriminationA).toBeCloseTo(1.5, 3);
    expect(result.neighbourCount).toBe(1);
  });

  it('weights by discriminationA (higher discrimination → more influence)', () => {
    const result = computePrior(Q, [
      candidate({ difficultyB: -1.0, discriminationA: 0.5 }),
      candidate({ difficultyB: 1.0, discriminationA: 2.5 }),
    ]);
    // Weighted mean: (-1 * 0.5 + 1 * 2.5) / 3.0 = 2 / 3 ≈ 0.667
    expect(result.difficultyB).toBeCloseTo(2 / 3, 2);
  });

  it('returns the median fallback even when computing weighted mean', () => {
    const result = computePrior(Q, [
      candidate({ difficultyB: -1.0 }),
      candidate({ difficultyB: 0.0 }),
      candidate({ difficultyB: 1.0 }),
    ]);
    expect(result.fallbackDifficultyB).toBeCloseTo(0, 3);
    expect(result.neighbourCount).toBe(3);
  });

  it("rejects neighbours that don't match question identifiers", () => {
    const result = computePrior(Q, [candidate({ skillId: 'wrong-skill', difficultyB: 5.0 })]);
    expect(result.source).toBe('format_default');
    expect(result.difficultyB).toBe(0);
  });
});
