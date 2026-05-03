import { describe, expect, it } from 'vitest';
import yaml from 'js-yaml';
import { CSV_COLUMNS, streamCsv } from '../src/exporters/csv.js';
import { streamJson } from '../src/exporters/json.js';
import { streamHackerrankYaml } from '../src/exporters/hackerrank-yaml.js';
import type { QuestionPublic } from '../src/types/question.js';
import type { PackRow } from '../src/repositories/packs.js';

/** Minimal Express-Response stub that captures writes into a buffer. */
function fakeResponse() {
  const chunks: string[] = [];
  const headers: Record<string, string> = {};
  return {
    res: {
      setHeader(k: string, v: string) {
        headers[k.toLowerCase()] = v;
      },
      write(s: string) {
        chunks.push(s);
        return true;
      },
      end() {},
    } as unknown as import('express').Response,
    body: () => chunks.join(''),
    headers,
  };
}

const SAMPLE_MCQ: QuestionPublic = {
  uuid: '11111111-1111-1111-1111-111111111111',
  sku: 'readybank',
  format: 'mcq',
  language: 'en',
  status: 'released',
  skill_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  sub_skill_id: null,
  body_md: 'Pick the prime number.',
  body_json: { options: ['4', '6', '7', '9'], correct_index: 2 },
  rubric: null,
  reference_solution: null,
  test_cases: null,
  difficulty_band: 2,
  difficulty_b: -1.2,
  discrimination_a: 0.9,
  empirical_pass_rate: 0.78,
  released_at: '2026-04-01T10:00:00.000Z',
  created_at: '2026-03-30T08:00:00.000Z',
};

const SAMPLE_CODING: QuestionPublic = {
  uuid: '22222222-2222-2222-2222-222222222222',
  sku: 'readybank',
  format: 'coding-fn',
  language: 'en',
  status: 'released',
  skill_id: null,
  sub_skill_id: null,
  body_md: 'Implement fibonacci(n).',
  body_json: { signature: 'fibonacci(n: int) -> int' },
  rubric: null,
  reference_solution: { language: 'python', code: 'def fibonacci(n): ...' },
  test_cases: { cases: [{ input: '5', expected_output: '5' }] },
  difficulty_band: 4,
  difficulty_b: 1.5,
  discrimination_a: 1.1,
  empirical_pass_rate: 0.42,
  released_at: '2026-04-02T10:00:00.000Z',
  created_at: '2026-03-31T08:00:00.000Z',
};

async function* iter(items: QuestionPublic[]): AsyncGenerator<QuestionPublic, void, void> {
  for (const it of items) yield it;
}

describe('CSV exporter', () => {
  it('writes header row + one row per question', async () => {
    const f = fakeResponse();
    const count = await streamCsv(f.res, iter([SAMPLE_MCQ, SAMPLE_CODING]));
    expect(count).toBe(2);

    const lines = f
      .body()
      .split('\r\n')
      .filter((l) => l.length > 0);
    expect(lines[0]).toBe(CSV_COLUMNS.join(','));
    expect(lines).toHaveLength(3); // header + 2 rows

    expect(f.headers['content-type']).toBe('text/csv; charset=utf-8');
  });

  it('escapes quotes and embedded commas', async () => {
    const tricky: QuestionPublic = {
      ...SAMPLE_MCQ,
      body_md: 'Has, comma and "quote"',
    };
    const f = fakeResponse();
    await streamCsv(f.res, iter([tricky]));
    const dataRow = f.body().split('\r\n')[1];
    expect(dataRow).toContain('"Has, comma and ""quote"""');
  });

  it('renders nested JSON as JSON-encoded cell', async () => {
    const f = fakeResponse();
    await streamCsv(f.res, iter([SAMPLE_MCQ]));
    expect(f.body()).toContain('"{""options"":[""4"",""6"",""7"",""9""],""correct_index"":2}"');
  });

  it('writes empty cell for null', async () => {
    const f = fakeResponse();
    await streamCsv(f.res, iter([SAMPLE_MCQ]));
    // skill_id is non-null; sub_skill_id is null → look at row composition
    const row = f.body().split('\r\n')[1]!;
    const cells = row.split(',');
    // sub_skill_id is the 7th column (index 6)
    expect(cells[6]).toBe('');
  });
});

describe('JSON exporter', () => {
  const PACK: PackRow = {
    id: 'aaaaaaaa-1111-1111-1111-111111111111',
    tenant_id: 'bbbbbbbb-1111-1111-1111-111111111111',
    api_key_id: null,
    name: 'Test Pack',
    filters: { format: 'mcq' },
    question_ids: [SAMPLE_MCQ.uuid, SAMPLE_CODING.uuid],
    question_count: 2,
    status: 'ready',
    expires_at: null,
    created_at: new Date('2026-04-01T10:00:00Z'),
    last_exported_at: null,
    export_count: 0,
  };

  it('produces a single JSON document with pack header + questions array', async () => {
    const f = fakeResponse();
    const count = await streamJson(f.res, PACK, iter([SAMPLE_MCQ, SAMPLE_CODING]));
    expect(count).toBe(2);

    const body = f.body();
    const parsed = JSON.parse(body);
    expect(parsed.pack.id).toBe(PACK.id);
    expect(parsed.pack.name).toBe('Test Pack');
    expect(parsed.questions).toHaveLength(2);
    expect(parsed.questions[0].uuid).toBe(SAMPLE_MCQ.uuid);
    expect(parsed.questions[1].format).toBe('coding-fn');
  });

  it('handles empty pack', async () => {
    const f = fakeResponse();
    const count = await streamJson(f.res, PACK, iter([]));
    expect(count).toBe(0);
    const parsed = JSON.parse(f.body());
    expect(parsed.questions).toEqual([]);
  });
});

describe('HackerRank YAML exporter', () => {
  it('renders MCQ as multiple_choice_single with choices', async () => {
    const f = fakeResponse();
    const count = await streamHackerrankYaml(f.res, iter([SAMPLE_MCQ]));
    expect(count).toBe(1);

    const docs = yaml.loadAll(f.body()) as Array<Record<string, unknown>>;
    expect(docs).toHaveLength(1);
    const doc = docs[0]!;
    expect(doc.uniq_id).toBe(SAMPLE_MCQ.uuid);
    expect(doc.question_type).toBe('multiple_choice_single');
    expect(doc.problem_statement).toBe('Pick the prime number.');
    const choices = doc.multiple_choice_questions as Array<{ text: string; correct: boolean }>;
    expect(choices).toHaveLength(4);
    expect(choices[2]?.correct).toBe(true);
    expect(choices[0]?.correct).toBe(false);
  });

  it('renders coding-fn as coding with reference_solution + test_cases', async () => {
    const f = fakeResponse();
    await streamHackerrankYaml(f.res, iter([SAMPLE_CODING]));
    const docs = yaml.loadAll(f.body()) as Array<Record<string, unknown>>;
    const doc = docs[0]!;
    expect(doc.question_type).toBe('coding');
    expect((doc.reference_solution as { language: string }).language).toBe('python');
    expect((doc.test_cases as unknown[]).length).toBe(1);
  });

  it('separates multiple questions with --- doc markers', async () => {
    const f = fakeResponse();
    await streamHackerrankYaml(f.res, iter([SAMPLE_MCQ, SAMPLE_CODING]));
    expect(f.body()).toContain('---\n');
    const docs = yaml.loadAll(f.body());
    expect(docs).toHaveLength(2);
  });

  it('uses application/x-yaml content type', async () => {
    const f = fakeResponse();
    await streamHackerrankYaml(f.res, iter([SAMPLE_MCQ]));
    expect(f.headers['content-type']).toBe('application/x-yaml; charset=utf-8');
  });
});
