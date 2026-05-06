import { describe, expect, it, vi } from 'vitest';
import { AnthropicQuestionGenerator, StubQuestionGenerator } from '../src/generator';
import type { ParsedJd, QuestionSpecItem } from '../src/types';

const context: ParsedJd = {
  roleTitle: 'Senior Salesforce Developer',
  roleFamily: 'engineering',
  seniority: 'senior',
  requiredSkills: [],
  niceToHaveSkills: [],
  techStack: [],
  domain: 'CRM',
  yearsOfExperience: 5,
  mustHaves: [],
  niceToHaves: [],
};

const codingSpec: QuestionSpecItem = {
  format: 'coding',
  difficulty: 'medium',
  skillSource: 'Apex',
  subSkillId: 'sub-apex',
  weight: 1,
};

const mcqSpec: QuestionSpecItem = {
  format: 'mcq',
  difficulty: 'easy',
  skillSource: 'SOQL',
  subSkillId: 'sub-soql',
  weight: 0.8,
};

describe('StubQuestionGenerator', () => {
  it('returns a GeneratedQuestion with the right shape for MCQ', async () => {
    const gen = new StubQuestionGenerator();
    const out = await gen.generate(mcqSpec, context);
    expect(out.question).not.toBeNull();
    expect(out.question?.format).toBe('mcq');
    const body = out.question?.bodyJson as { options?: string[]; correctIndex?: number };
    expect(body?.options).toHaveLength(4);
    expect(body?.correctIndex).toBe(0);
  });

  it('returns a referenceSolution + testCases for coding format', async () => {
    const gen = new StubQuestionGenerator();
    const out = await gen.generate(codingSpec, context);
    expect(out.question?.referenceSolution).toMatch(/def solve/);
    expect(out.question?.testCases?.length).toBeGreaterThanOrEqual(1);
  });

  it('embeds the role context in the body markdown', async () => {
    const gen = new StubQuestionGenerator();
    const out = await gen.generate(mcqSpec, context);
    expect(out.question?.bodyMd).toContain('Senior Salesforce Developer');
  });

  it('generates a fresh UUID per call', async () => {
    const gen = new StubQuestionGenerator();
    const a = await gen.generate(mcqSpec, context);
    const b = await gen.generate(mcqSpec, context);
    expect(a.question?.id).not.toBe(b.question?.id);
  });
});

describe('AnthropicQuestionGenerator', () => {
  it('throws on missing apiKey', () => {
    expect(() => new AnthropicQuestionGenerator({ apiKey: '' })).toThrow();
  });

  it('returns a question on a successful Anthropic response', async () => {
    const fixture = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            stem: 'Question stem',
            options: ['A', 'B', 'C', 'D'],
            correctIndex: 1,
          }),
        },
      ],
    };
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify(fixture), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    ) as unknown as typeof fetch;
    const gen = new AnthropicQuestionGenerator({ apiKey: 'sk-test', fetchImpl });
    const out = await gen.generate(mcqSpec, context);
    expect(out.question).not.toBeNull();
    expect(out.question?.bodyMd).toBe('Question stem');
  });

  it('returns null + reason on non-2xx', async () => {
    const fetchImpl = vi.fn(
      async () => new Response('boom', { status: 503 }),
    ) as unknown as typeof fetch;
    const gen = new AnthropicQuestionGenerator({ apiKey: 'sk-test', fetchImpl });
    const out = await gen.generate(mcqSpec, context);
    expect(out.question).toBeNull();
    expect(out.rejectionReason).toMatch(/503/);
  });

  it('returns null + reason when LLM emits invalid JSON', async () => {
    const fixture = { content: [{ type: 'text', text: 'not-json' }] };
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify(fixture), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    ) as unknown as typeof fetch;
    const gen = new AnthropicQuestionGenerator({ apiKey: 'sk-test', fetchImpl });
    const out = await gen.generate(mcqSpec, context);
    expect(out.question).toBeNull();
    expect(out.rejectionReason).toMatch(/JSON parse/);
  });
});
