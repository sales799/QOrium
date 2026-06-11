import { describe, expect, it } from 'vitest';
import { resolveCorrectIndex, grade, type QuestionRow } from '../src/lib/a4-grader.js';

function q(partial: Partial<QuestionRow>): QuestionRow {
  return {
    id: 'q1',
    format: 'mcq',
    body_json: { options: ['a', 'b', 'c', 'd'] },
    answer_key: undefined,
    skill_id: null,
    ...partial,
  };
}

describe('resolveCorrectIndex', () => {
  it('reads a leading option letter from an answer_key object', () => {
    expect(resolveCorrectIndex(q({ answer_key: { text: 'A — because' } }))).toBe(0);
    expect(resolveCorrectIndex(q({ answer_key: { text: 'C) third' } }))).toBe(2);
  });

  it('reads a leading option letter from a scalar string key', () => {
    expect(resolveCorrectIndex(q({ answer_key: 'B. second' }))).toBe(1);
  });

  it('returns null for prose with no labelled leading letter', () => {
    expect(resolveCorrectIndex(q({ answer_key: { text: 'Always pick this' } }))).toBeNull();
  });

  it('treats a bare-numeric answer_key as an unset placeholder', () => {
    expect(resolveCorrectIndex(q({ answer_key: 0 }))).toBeNull();
    expect(resolveCorrectIndex(q({ answer_key: 2 }))).toBeNull();
  });

  it('uses a body answer_index only when answer_key is absent', () => {
    expect(
      resolveCorrectIndex(
        q({ answer_key: undefined, body_json: { options: ['a', 'b', 'c', 'd'], answer_index: 2 } }),
      ),
    ).toBe(2);
    expect(
      resolveCorrectIndex(
        q({ answer_key: null, body_json: { options: ['a', 'b', 'c'], correct_index: 1 } }),
      ),
    ).toBe(1);
  });

  it('rejects a leading letter beyond the option count', () => {
    expect(
      resolveCorrectIndex(
        q({ body_json: { options: ['a', 'b', 'c'] }, answer_key: { text: 'E — x' } }),
      ),
    ).toBeNull();
  });
});

describe('grade', () => {
  it('scores a correct MCQ answer 100', () => {
    const out = grade({
      question: q({ answer_key: { text: 'B — right' } }),
      responseBody: { answer_index: 1 },
    });
    expect(out).toMatchObject({ score: 100, correct: true, max_score: 100 });
  });

  it('scores an incorrect MCQ answer 0', () => {
    const out = grade({
      question: q({ answer_key: { text: 'B — right' } }),
      responseBody: { answer_index: 0 },
    });
    expect(out).toMatchObject({ score: 0, correct: false });
  });

  it('marks an unresolvable key as unscored (correct null)', () => {
    const out = grade({ question: q({ answer_key: 0 }), responseBody: { answer_index: 0 } });
    expect(out.correct).toBeNull();
    expect(out.score).toBe(0);
  });

  it('marks a missing submission incorrect', () => {
    const out = grade({ question: q({ answer_key: { text: 'A — x' } }), responseBody: {} });
    expect(out).toMatchObject({ correct: false });
    expect(out.rationale).toMatch(/no answer_index/);
  });

  it('treats sjt-mcq like mcq', () => {
    const out = grade({
      question: q({ format: 'sjt-mcq', answer_key: { text: 'A — x' } }),
      responseBody: { answer_index: 0 },
    });
    expect(out).toMatchObject({ score: 100, correct: true });
  });

  it('leaves non-mcq formats for downstream grading', () => {
    const out = grade({
      question: q({ format: 'code', answer_key: { text: 'A — x' } }),
      responseBody: {},
    });
    expect(out.correct).toBeNull();
    expect(out.rationale).toMatch(/0019/);
  });
});
