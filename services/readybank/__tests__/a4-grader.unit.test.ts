import { describe, expect, it } from 'vitest';
import { grade, resolveCorrectIndex, type QuestionRow } from '../src/lib/a4-grader.js';

function mcq(overrides: Partial<QuestionRow> = {}): QuestionRow {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    format: 'mcq',
    body_json: { options: ['Alpha', 'Bravo', 'Charlie', 'Delta'] },
    answer_key: { text: 'B - Bravo is the correct answer' },
    skill_id: null,
    tenant_id: '22222222-2222-2222-2222-222222222222',
    ...overrides,
  };
}

describe('A4 MCQ grader', () => {
  it('scores from a leading-letter answer_key', () => {
    const question = mcq();

    expect(resolveCorrectIndex(question)).toBe(1);
    expect(grade({ question, responseBody: { answer_index: 1 } })).toMatchObject({
      score: 100,
      max_score: 100,
      irt_status: 'model-estimated',
      correct: true,
      aiDecision: null,
    });
  });

  it('does not score bare numeric answer_key placeholders', () => {
    const question = mcq({
      body_json: { options: ['Alpha', 'Bravo', 'Charlie', 'Delta'], answer_index: 0 },
      answer_key: 0,
    });

    expect(resolveCorrectIndex(question)).toBeNull();
    expect(grade({ question, responseBody: { answer_index: 0 } })).toMatchObject({
      score: 0,
      correct: null,
      aiDecision: null,
    });
  });

  it('falls back to explicit body answer_index when answer_key is absent', () => {
    const question = mcq({
      body_json: { options: ['Alpha', 'Bravo', 'Charlie', 'Delta'], answer_index: 2 },
      answer_key: undefined,
    });

    expect(resolveCorrectIndex(question)).toBe(2);
    expect(grade({ question, responseBody: { answer_index: 2 } })).toMatchObject({
      score: 100,
      correct: true,
      aiDecision: null,
    });
  });
});
