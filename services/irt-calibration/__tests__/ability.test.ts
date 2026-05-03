import { describe, expect, it } from 'vitest';
import { abilitiesFromResponses, estimateAbilities } from '../src/ability';

describe('estimateAbilities', () => {
  it('returns empty array on empty input', () => {
    expect(estimateAbilities([])).toEqual([]);
  });

  it('drops candidates with zero attempts', () => {
    const out = estimateAbilities([
      { candidateId: 'a', attempts: 0, correct: 0 },
      { candidateId: 'b', attempts: 4, correct: 2 },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]?.candidateId).toBe('b');
  });

  it('produces zero-mean theta for symmetric inputs', () => {
    const out = estimateAbilities([
      { candidateId: 'a', attempts: 10, correct: 2 },
      { candidateId: 'b', attempts: 10, correct: 5 },
      { candidateId: 'c', attempts: 10, correct: 8 },
    ]);
    const sum = out.reduce((a, x) => a + x.theta, 0);
    expect(sum).toBeCloseTo(0, 6);
  });

  it('returns θ = 0 for every candidate when proportions are identical', () => {
    const out = estimateAbilities([
      { candidateId: 'a', attempts: 4, correct: 2 },
      { candidateId: 'b', attempts: 8, correct: 4 },
    ]);
    for (const r of out) expect(r.theta).toBe(0);
  });

  it('higher proportion correct → higher θ', () => {
    const out = estimateAbilities([
      { candidateId: 'low', attempts: 10, correct: 1 },
      { candidateId: 'mid', attempts: 10, correct: 5 },
      { candidateId: 'high', attempts: 10, correct: 9 },
    ]);
    const byId = new Map(out.map((r) => [r.candidateId, r.theta]));
    expect(byId.get('low')!).toBeLessThan(byId.get('mid')!);
    expect(byId.get('mid')!).toBeLessThan(byId.get('high')!);
  });
});

describe('abilitiesFromResponses', () => {
  it('aggregates responses per-candidate using the score predicate', () => {
    const out = abilitiesFromResponses([
      { candidateId: 'a', questionId: 'q1', score: 80 },
      { candidateId: 'a', questionId: 'q2', score: 30 },
      { candidateId: 'b', questionId: 'q1', score: 60 },
    ]);
    const a = out.find((x) => x.candidateId === 'a');
    const b = out.find((x) => x.candidateId === 'b');
    expect(a?.attempts).toBe(2);
    expect(a?.proportionCorrect).toBeCloseTo(0.5);
    expect(b?.attempts).toBe(1);
    expect(b?.proportionCorrect).toBeCloseTo(1);
  });

  it('uses a custom correct predicate', () => {
    const out = abilitiesFromResponses(
      [
        { candidateId: 'a', questionId: 'q1', score: 25 },
        { candidateId: 'a', questionId: 'q2', score: 35 },
      ],
      (s) => s !== null && s >= 20,
    );
    expect(out[0]?.proportionCorrect).toBeCloseTo(1);
  });

  it('treats null scores as incorrect by default', () => {
    const out = abilitiesFromResponses([
      { candidateId: 'a', questionId: 'q1', score: null },
      { candidateId: 'a', questionId: 'q2', score: 90 },
    ]);
    expect(out[0]?.proportionCorrect).toBeCloseTo(0.5);
  });
});
