import { describe, it, expect } from 'vitest';
import { exportQuestions } from '../src/output/exporters.js';
import type { DraftQuestion } from '../src/types.js';

const SAMPLE: DraftQuestion[] = [
  {
    qor_id: 'QOR-PYTHON-101',
    sub_skill_id: 'senior-python-001',
    format: 'mcq',
    difficulty_b: 0.5,
    body_md: 'What is `asyncio.TaskGroup`?',
    body_json: { options: ['a', 'b', 'c', 'd'] },
    watermark_seed: 'qorium-py-001-seed-abc',
  },
  {
    qor_id: 'QOR-PYTHON-102',
    sub_skill_id: 'senior-python-002',
    format: 'coding-fn',
    difficulty_b: 1.2,
    body_md: 'Implement `parseInt`. Handle "1,234".',
    body_json: { signature: 'def parse_int(s: str) -> int' },
    watermark_seed: 'qorium-py-002-seed-def',
  },
];

describe('exportQuestions — JSON', () => {
  it('returns canonical envelope', () => {
    const out = exportQuestions(SAMPLE, 'json');
    const parsed = JSON.parse(out);
    expect(parsed.version).toBe('v0.6');
    expect(parsed.questions).toHaveLength(2);
    expect(parsed.questions[0].qor_id).toBe('QOR-PYTHON-101');
  });

  it('round-trips deterministically', () => {
    const a = exportQuestions(SAMPLE, 'json');
    const b = exportQuestions(SAMPLE, 'json');
    expect(a).toBe(b);
  });
});

describe('exportQuestions — CSV', () => {
  it('has header row', () => {
    const out = exportQuestions(SAMPLE, 'csv');
    expect(out.startsWith('qor_id,sub_skill_id,format,difficulty_b,body_md,watermark_seed\n')).toBe(
      true,
    );
  });

  it('quotes embedded commas', () => {
    const out = exportQuestions([{ ...SAMPLE[0]!, body_md: 'comma, in body' }], 'csv');
    expect(out).toContain('"comma, in body"');
  });

  it('escapes embedded quotes by doubling', () => {
    const out = exportQuestions([{ ...SAMPLE[0]!, body_md: 'has "quote"' }], 'csv');
    expect(out).toContain('"has ""quote"""');
  });
});

describe('exportQuestions — HackerRank', () => {
  it('maps mcq → mcq, coding-* → coding', () => {
    const out = exportQuestions(SAMPLE, 'hackerrank');
    const parsed = JSON.parse(out);
    expect(parsed.format).toBe('hackerrank-v1');
    expect(parsed.questions[0].type).toBe('mcq');
    expect(parsed.questions[1].type).toBe('coding');
  });

  it('maps difficulty_b to easy/medium/hard buckets', () => {
    const out = exportQuestions(
      [
        { ...SAMPLE[0]!, qor_id: 'A', difficulty_b: -1.5 },
        { ...SAMPLE[0]!, qor_id: 'B', difficulty_b: 0.5 },
        { ...SAMPLE[0]!, qor_id: 'C', difficulty_b: 1.6 },
      ],
      'hackerrank',
    );
    const parsed = JSON.parse(out);
    expect(
      parsed.questions.find((q: { questionId: string }) => q.questionId === 'A').difficulty,
    ).toBe('easy');
    expect(
      parsed.questions.find((q: { questionId: string }) => q.questionId === 'B').difficulty,
    ).toBe('medium');
    expect(
      parsed.questions.find((q: { questionId: string }) => q.questionId === 'C').difficulty,
    ).toBe('hard');
  });

  it('preserves QOrium watermark in metadata', () => {
    const out = exportQuestions(SAMPLE, 'hackerrank');
    const parsed = JSON.parse(out);
    expect(parsed.questions[0].metadata.qorium_watermark_seed).toBe('qorium-py-001-seed-abc');
  });
});

describe('exportQuestions — exhaustiveness', () => {
  it('throws on unknown format', () => {
    expect(() => exportQuestions(SAMPLE, 'xml' as unknown as 'json')).toThrow();
  });
});
