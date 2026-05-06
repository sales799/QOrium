import { describe, expect, it } from 'vitest';
import pino from 'pino';
import { runOrder } from '../src/orchestrator';
import { StubJdParser } from '../src/parser';
import { StringMatchRoleGraphMapper } from '../src/mapper';
import { StubQuestionGenerator } from '../src/generator';
import type { GeneratedQuestion, ParsedJd, QuestionSpecItem } from '../src/types';
import type { AIQuestionGenerator } from '../src/generator';

const silent = pino({ level: 'silent' });

const orderInput = {
  orderId: 'order-1',
  tenantId: 'tenant-1',
  tier: 'standard' as const,
  jdText:
    'Senior Salesforce Developer\nWe use Salesforce, Apex, SOQL and PostgreSQL. 5 years experience.',
  exportFormat: 'json' as const,
  totalQuestions: 6,
};

const canonical = [
  { id: 'sub-apex', name: 'Salesforce Apex' },
  { id: 'sub-soql', name: 'SOQL' },
];

describe('runOrder', () => {
  it('completes end-to-end with stub deps and produces an export payload', async () => {
    const outcome = await runOrder(
      {
        parser: new StubJdParser(),
        mapper: new StringMatchRoleGraphMapper(canonical),
        generator: new StubQuestionGenerator(),
        logger: silent,
      },
      orderInput,
    );
    expect(outcome.status).toBe('completed');
    expect(outcome.questions.length).toBeGreaterThan(0);
    expect(outcome.parsedJd?.roleTitle).toContain('Senior Salesforce Developer');
    expect(outcome.exportPayload).toBeDefined();
    expect(outcome.exportContentType).toBe('application/json');
  });

  it('marks failed when the parser throws', async () => {
    const failingParser = {
      id: 'fail',
      parse: async () => {
        throw new Error('boom');
      },
    };
    const outcome = await runOrder(
      {
        parser: failingParser,
        mapper: new StringMatchRoleGraphMapper(canonical),
        generator: new StubQuestionGenerator(),
        logger: silent,
      },
      orderInput,
    );
    expect(outcome.status).toBe('failed');
    expect(outcome.failureReason).toMatch(/parse_failed/);
  });

  it('marks failed when no questions survive validation', async () => {
    const rejectingGenerator: AIQuestionGenerator = {
      id: 'rejecting',
      generate: async () => ({ question: null, rejectionReason: 'simulated rejection' }),
    };
    const outcome = await runOrder(
      {
        parser: new StubJdParser(),
        mapper: new StringMatchRoleGraphMapper(canonical),
        generator: rejectingGenerator,
        logger: silent,
      },
      orderInput,
    );
    expect(outcome.status).toBe('failed');
    expect(outcome.failureReason).toBe('all_questions_rejected');
    expect(outcome.rejectedCount).toBeGreaterThan(0);
  });

  it('drops a question that trips the leak heuristic', async () => {
    const leakyGenerator: AIQuestionGenerator = {
      id: 'leaky',
      generate: async (item, context) => ({
        question: {
          id: 'q-leaky',
          format: item.format,
          difficulty: item.difficulty,
          skillSource: item.skillSource,
          subSkillId: item.subSkillId,
          bodyMd: 'As seen on LeetCode, write a function to ...',
          bodyJson: { stem: 'leak', roleContext: context.roleTitle },
          selfCritique: {
            ambiguity: 9,
            distractorQuality: 9,
            edgeCases: 9,
            bias: 9,
            leakRisk: 9,
          },
        } satisfies GeneratedQuestion,
      }),
    };
    const outcome = await runOrder(
      {
        parser: new StubJdParser(),
        mapper: new StringMatchRoleGraphMapper(canonical),
        generator: leakyGenerator,
        logger: silent,
      },
      orderInput,
    );
    expect(outcome.status).toBe('failed');
    expect(outcome.rejectedCount).toBeGreaterThan(0);
  });

  it('respects a custom totalQuestions override', async () => {
    const outcome = await runOrder(
      {
        parser: new StubJdParser(),
        mapper: new StringMatchRoleGraphMapper(canonical),
        generator: new StubQuestionGenerator(),
        logger: silent,
      },
      { ...orderInput, totalQuestions: 4 },
    );
    expect(outcome.status).toBe('completed');
    expect(outcome.spec?.items.length).toBe(4);
    expect(outcome.questions.length).toBe(4);
  });

  it('returns failed when the spec is empty (no skills extracted)', async () => {
    // Tiny JD with no known tech tokens means StubJdParser yields no tech;
    // the role-graph mapper keeps required-list empty; the spec generator
    // has no items.
    const outcome = await runOrder(
      {
        parser: new StubJdParser(),
        mapper: new StringMatchRoleGraphMapper(canonical),
        generator: new StubQuestionGenerator(),
        logger: silent,
      },
      {
        ...orderInput,
        jdText: 'A short JD with no tech tokens at all.',
      },
    );
    expect(outcome.status).toBe('failed');
    expect(outcome.failureReason).toMatch(/no_questions_in_spec|all_questions_rejected/);
  });
});

// Type-tag to use within the leak test.
type SpecAlias = QuestionSpecItem;
type ContextAlias = ParsedJd;
const _aliasGuard = (a: SpecAlias, b: ContextAlias): SpecAlias | ContextAlias => a ?? b;
void _aliasGuard;
