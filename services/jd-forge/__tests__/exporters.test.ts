import { describe, expect, it } from 'vitest';
import { exportCsv, exportFor, exportJson, exportMettlCsv } from '../src/exporters';
import type { GeneratedQuestion, OrderInput, ParsedJd } from '../src/types';

const order: OrderInput = {
  orderId: 'order-1',
  tenantId: 'tenant-1',
  tier: 'standard',
  jdText: 'Senior Salesforce Developer JD',
  exportFormat: 'json',
};

const parsedJd: ParsedJd = {
  roleTitle: 'Senior Salesforce Developer',
  roleFamily: 'engineering',
  seniority: 'senior',
  requiredSkills: [{ skill: 'Apex', weight: 1 }],
  niceToHaveSkills: [],
  techStack: ['salesforce'],
  domain: 'CRM',
  yearsOfExperience: 5,
  mustHaves: ['Apex'],
  niceToHaves: [],
};

const question = (overrides: Partial<GeneratedQuestion> = {}): GeneratedQuestion => ({
  id: 'q-1',
  format: 'mcq',
  difficulty: 'medium',
  skillSource: 'Apex',
  subSkillId: 'sub-apex',
  bodyMd: 'What does Apex SOQL stand for?',
  bodyJson: { options: ['Option A', 'Option B', 'Option C', 'Option D'], correctIndex: 1 },
  ...overrides,
});

describe('exportJson', () => {
  it('returns valid JSON with order, parsedJd, questions', () => {
    const r = exportJson(order, parsedJd, [question()]);
    expect(r.contentType).toBe('application/json');
    const parsed = JSON.parse(r.body);
    expect(parsed.order.orderId).toBe('order-1');
    expect(parsed.questions).toHaveLength(1);
    expect(parsed.parsedJd.roleTitle).toBe('Senior Salesforce Developer');
  });

  it('uses jd-forge-<id>.json as filename', () => {
    expect(exportJson(order, parsedJd, []).filename).toBe('jd-forge-order-1.json');
  });
});

describe('exportCsv', () => {
  it('emits a header row + one row per question', () => {
    const r = exportCsv(order, [question(), question({ id: 'q-2', bodyMd: 'Q2' })]);
    const lines = r.body.trim().split('\n');
    expect(lines).toHaveLength(3); // header + 2 rows
    expect(lines[0]).toContain('id');
    expect(lines[0]).toContain('bodyMd');
  });

  it('quotes cells with commas / newlines / quotes', () => {
    const r = exportCsv(order, [question({ bodyMd: 'Hello, "world"\nnew line.' })]);
    expect(r.body).toContain('"Hello, ""world""\nnew line."');
  });

  it('serializes options as a pipe-joined string', () => {
    const r = exportCsv(order, [question()]);
    expect(r.body).toContain('Option A | Option B | Option C | Option D');
  });
});

describe('exportMettlCsv', () => {
  it('emits the Mettl-required header order', () => {
    const r = exportMettlCsv(order, [question()]);
    const headerRow = r.body.split('\n')[0];
    expect(headerRow).toBe(
      'Section,QuestionType,QuestionText,Option1,Option2,Option3,Option4,CorrectOption,Marks,NegativeMarks',
    );
  });

  it('maps mcq → SingleChoice and emits CorrectOption=Option2 for correctIndex=1', () => {
    const r = exportMettlCsv(order, [
      question({ bodyJson: { options: ['A', 'B', 'C', 'D'], correctIndex: 1 } }),
    ]);
    const dataRow = r.body.split('\n')[1] ?? '';
    expect(dataRow).toContain('SingleChoice');
    expect(dataRow).toContain('Option2');
  });

  it('maps coding format to a Coding section', () => {
    const r = exportMettlCsv(order, [question({ format: 'coding' })]);
    expect(r.body.split('\n')[1]).toContain('Coding');
  });
});

describe('exportFor', () => {
  it.each(['json', 'csv', 'mettl-csv'] as const)('dispatches %s', (fmt) => {
    const r = exportFor(fmt, order, parsedJd, [question()]);
    expect(r.body.length).toBeGreaterThan(0);
  });

  it('throws on pdf and hackerrank-yaml in v0', () => {
    expect(() => exportFor('pdf', order, parsedJd, [question()])).toThrow();
    expect(() => exportFor('hackerrank-yaml', order, parsedJd, [question()])).toThrow();
  });
});
