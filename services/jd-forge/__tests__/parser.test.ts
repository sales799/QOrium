import { describe, expect, it, vi } from 'vitest';
import { AnthropicJdParser, StubJdParser, parseJdJson } from '../src/parser';

describe('StubJdParser', () => {
  it('throws on empty input', async () => {
    const parser = new StubJdParser();
    await expect(parser.parse('')).rejects.toThrow();
  });

  it('extracts seniority from common phrasings', async () => {
    const parser = new StubJdParser();
    expect((await parser.parse('Senior Salesforce Developer with 5+ years.')).seniority).toBe(
      'senior',
    );
    expect((await parser.parse('Junior Python engineer for our team.')).seniority).toBe('junior');
    expect((await parser.parse('Staff engineer to own the platform.')).seniority).toBe('staff');
  });

  it('extracts technology stack from a JD body', async () => {
    const parser = new StubJdParser();
    const out = await parser.parse(
      'Senior Engineer\nWe use Salesforce, Apex, SOQL, and Postgres. CI/CD pipeline experience required.',
    );
    expect(out.techStack).toEqual(
      expect.arrayContaining(['salesforce', 'apex', 'soql', 'postgres', 'ci/cd']),
    );
  });

  it('extracts years of experience', async () => {
    const parser = new StubJdParser();
    expect((await parser.parse('Senior role with 7 years of experience.')).yearsOfExperience).toBe(
      7,
    );
    expect((await parser.parse('No specific years mentioned here.')).yearsOfExperience).toBeNull();
  });

  it('infers role family from text content', async () => {
    const parser = new StubJdParser();
    expect((await parser.parse('Senior DevOps engineer for SRE team.')).roleFamily).toBe('devops');
    expect((await parser.parse('Senior data engineer for ML platform.')).roleFamily).toBe('data');
    expect((await parser.parse('Senior product manager for SaaS.')).roleFamily).toBe('product');
  });

  it('falls back to engineering when no other signal', async () => {
    const parser = new StubJdParser();
    const out = await parser.parse('Generic description with no obvious role family.');
    expect(out.roleFamily).toBe('engineering');
  });
});

describe('AnthropicJdParser', () => {
  it('throws on missing apiKey', () => {
    expect(() => new AnthropicJdParser({ apiKey: '' })).toThrow();
  });

  it('parses a well-formed JSON response', async () => {
    const fixture = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            roleTitle: 'Senior Salesforce Developer',
            roleFamily: 'engineering',
            seniority: 'senior',
            requiredSkills: [{ skill: 'Apex', weight: 1 }],
            niceToHaveSkills: [],
            techStack: ['salesforce', 'apex'],
            domain: 'CRM',
            yearsOfExperience: 5,
            mustHaves: ['LWC'],
            niceToHaves: [],
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
    const parser = new AnthropicJdParser({ apiKey: 'sk-test', fetchImpl });
    const out = await parser.parse('JD body — Senior Salesforce Developer.');
    expect(out.roleTitle).toBe('Senior Salesforce Developer');
    expect(out.requiredSkills).toHaveLength(1);
  });

  it('rejects on non-2xx', async () => {
    const fetchImpl = vi.fn(
      async () => new Response('boom', { status: 500, statusText: 'Internal Server Error' }),
    ) as unknown as typeof fetch;
    const parser = new AnthropicJdParser({ apiKey: 'sk-test', fetchImpl });
    await expect(parser.parse('any')).rejects.toThrow(/500/);
  });
});

describe('parseJdJson', () => {
  it('strips ```json fences if the LLM returned them', () => {
    const wrapped =
      '```json\n{"roleTitle":"X","roleFamily":"engineering","seniority":"mid","requiredSkills":[],"niceToHaveSkills":[],"techStack":[],"domain":null,"yearsOfExperience":null,"mustHaves":[],"niceToHaves":[]}\n```';
    expect(parseJdJson(wrapped).roleTitle).toBe('X');
  });

  it('clamps weights to [0, 1]', () => {
    const out = parseJdJson(
      JSON.stringify({
        roleTitle: 'X',
        roleFamily: 'engineering',
        seniority: 'mid',
        requiredSkills: [
          { skill: 'A', weight: 99 },
          { skill: 'B', weight: -5 },
        ],
        niceToHaveSkills: [],
        techStack: [],
        domain: null,
        yearsOfExperience: null,
        mustHaves: [],
        niceToHaves: [],
      }),
    );
    expect(out.requiredSkills[0]?.weight).toBe(1);
    expect(out.requiredSkills[1]?.weight).toBe(0);
  });
});
