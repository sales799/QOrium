import { describe, it, expect } from 'vitest';
import { sanitizeBody, sanitizeQuestion } from '../src/routes/attempts.js';
import type { CandidateQuestion } from '../src/repositories/attempts.js';

// P1 guardrail: candidate-facing question payloads must never leak the answer
// key, rubric, reference solution, test cases, sandbox config, or any embedded
// correct-answer hint — at any nesting depth.
const FORBIDDEN = [
  'answer',
  'answer_index',
  'answer_key',
  'correct_index',
  'explanation',
  'rationale',
  'solution',
  'reference_solution',
  'rubric',
  'rubric_json',
  'test_cases',
  'sandbox_config',
];

function deepKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(deepKeys);
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) => [
      k.toLowerCase(),
      ...deepKeys(v),
    ]);
  }
  return [];
}

describe('candidate question sanitizer', () => {
  it('strips forbidden keys from nested body_json', () => {
    const dirty = {
      prompt: 'What is 2+2?',
      options: ['3', '4', '5'],
      answer_index: 1,
      explanation: 'because math',
      meta: { rubric: { criteria: [] }, nested: { correct_index: 1 } },
    };
    const clean = sanitizeBody(dirty);
    const keys = deepKeys(clean);
    for (const f of FORBIDDEN) expect(keys).not.toContain(f);
    expect(keys).toContain('prompt');
    expect(keys).toContain('options');
  });

  it('sanitizeQuestion never exposes a secret column or body hint', () => {
    const q: CandidateQuestion = {
      id: '00000000-0000-0000-0000-000000000001',
      format: 'mcq',
      skill_id: '00000000-0000-0000-0000-000000000002',
      language: 'en',
      body_md: 'Pick one',
      body_json: { options: ['a', 'b'], answer_index: 0, test_cases: [{ in: 1, out: 2 }] },
    };
    const safe = sanitizeQuestion(q);
    const serialized = JSON.stringify(safe).toLowerCase();
    for (const f of FORBIDDEN) expect(serialized).not.toContain(`"${f}"`);
    expect(serialized).toContain('options');
  });
});
