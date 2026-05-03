/**
 * Stage 4 — AI question generation per spec §3.4.
 *
 * Two implementations behind `AIQuestionGenerator`:
 *
 *   - `StubQuestionGenerator`  — deterministic synthesis from the spec item;
 *                                useful for unit tests + dev when ANTHROPIC_API_KEY
 *                                is unset.
 *   - `AnthropicQuestionGenerator` — parallel calls to Anthropic Messages
 *                                API with a format-specific system prompt.
 *
 * The generator returns one question per spec item (or null if the LLM
 * couldn't produce one). The orchestrator handles parallel fan-out via
 * Promise.all.
 */

import { randomUUID } from 'node:crypto';
import type {
  GeneratedQuestion,
  GenerationOutcome,
  ParsedJd,
  QuestionSpecItem,
  SelfCritique,
} from './types.js';

export interface AIQuestionGenerator {
  readonly id: string;
  generate(item: QuestionSpecItem, context: ParsedJd): Promise<GenerationOutcome>;
}

const DEFAULT_CRITIQUE: SelfCritique = {
  ambiguity: 8,
  distractorQuality: 8,
  edgeCases: 8,
  bias: 9,
  leakRisk: 9,
};

export class StubQuestionGenerator implements AIQuestionGenerator {
  readonly id = 'stub';

  async generate(item: QuestionSpecItem, context: ParsedJd): Promise<GenerationOutcome> {
    const id = randomUUID();
    const stem = `[${item.format.toUpperCase()} · ${item.difficulty}] In the context of ${context.roleTitle}, ${item.skillSource}: …`;
    const baseBody = {
      stem,
      roleContext: context.roleTitle,
      skill: item.skillSource,
      difficulty: item.difficulty,
    };

    let bodyJson: Record<string, unknown> = baseBody;
    let answerKey: Record<string, unknown> | undefined;
    let testCases: Array<Record<string, unknown>> | undefined;
    let referenceSolution: string | undefined;
    let bodyMd = stem;

    switch (item.format) {
      case 'mcq': {
        bodyJson = {
          ...baseBody,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctIndex: 0,
        };
        answerKey = { correctIndex: 0 };
        bodyMd = `${stem}\n\n- A) Option A\n- B) Option B\n- C) Option C\n- D) Option D`;
        break;
      }
      case 'msq': {
        bodyJson = {
          ...baseBody,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctIndices: [0, 2],
        };
        answerKey = { correctIndices: [0, 2] };
        break;
      }
      case 'truefalse': {
        bodyJson = { ...baseBody, choices: ['True', 'False'], correctIndex: 0 };
        answerKey = { correctIndex: 0 };
        break;
      }
      case 'coding': {
        const exampleInput = '5 3';
        const exampleOutput = '8';
        bodyJson = {
          ...baseBody,
          signature: `def solve(a: int, b: int) -> int:`,
          examples: [{ input: exampleInput, output: exampleOutput }],
        };
        testCases = [
          { input: '5 3', expected_output_pattern: '^8$', weight: 0.5, public: true },
          { input: '-1 1', expected_output_pattern: '^0$', weight: 0.5, public: false },
        ];
        referenceSolution = 'def solve(a, b):\n    return a + b\n';
        bodyMd = `${stem}\n\nExample: \`solve(${exampleInput})\` → ${exampleOutput}`;
        break;
      }
      case 'design':
      case 'sjt':
      case 'casestudy': {
        bodyJson = {
          ...baseBody,
          rubricKeys: ['correctness', 'tradeoffs', 'communication'],
        };
        bodyMd = `${stem}\n\nWrite a 200–400 word response.`;
        break;
      }
    }

    const question: GeneratedQuestion = {
      id,
      format: item.format,
      difficulty: item.difficulty,
      skillSource: item.skillSource,
      subSkillId: item.subSkillId,
      bodyMd,
      bodyJson,
      selfCritique: { ...DEFAULT_CRITIQUE },
    };
    if (answerKey !== undefined) question.answerKey = answerKey;
    if (testCases !== undefined) question.testCases = testCases;
    if (referenceSolution !== undefined) question.referenceSolution = referenceSolution;

    return { question };
  }
}

export interface AnthropicQuestionGeneratorOptions {
  apiKey: string;
  model?: string;
  fetchImpl?: typeof fetch;
  endpoint?: string;
  timeoutMs?: number;
}

const DEFAULT_ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const DEFAULT_ANTHROPIC_MODEL = 'claude-opus-4-7';

const FORMAT_PROMPT_HINTS: Record<QuestionSpecItem['format'], string> = {
  mcq: 'Return JSON {stem, options[], correctIndex, explanation}. Provide exactly 4 options, 1 correct + 3 plausible distractors.',
  msq: 'Return JSON {stem, options[], correctIndices[]}. Provide 4 options with 1–3 correct.',
  truefalse: 'Return JSON {stem, correctIndex} where 0=True, 1=False, plus a short explanation.',
  coding:
    'Return JSON {stem, signature, examples[], referenceSolution, testCases[]}. Each test case: {input, expected_output_pattern, weight, public}.',
  design: 'Return JSON {stem, rubricKeys[]} with a 200–400 word response slot.',
  sjt: 'Return JSON {stem, options[], correctIndex} for a workplace scenario.',
  casestudy: 'Return JSON {stem, rubricKeys[], suggestedFollowUps[]}.',
};

export class AnthropicQuestionGenerator implements AIQuestionGenerator {
  readonly id = 'anthropic';
  private readonly apiKey: string;
  private readonly model: string;
  private readonly fetchImpl: typeof fetch;
  private readonly endpoint: string;
  private readonly timeoutMs: number;

  constructor(opts: AnthropicQuestionGeneratorOptions) {
    if (!opts.apiKey) {
      throw new Error(
        'AnthropicQuestionGenerator requires an apiKey — REQUEST ANTHROPIC_API_KEY from CEO',
      );
    }
    this.apiKey = opts.apiKey;
    this.model = opts.model ?? DEFAULT_ANTHROPIC_MODEL;
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.endpoint = opts.endpoint ?? DEFAULT_ANTHROPIC_ENDPOINT;
    this.timeoutMs = opts.timeoutMs ?? 30_000;
  }

  async generate(item: QuestionSpecItem, context: ParsedJd): Promise<GenerationOutcome> {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(new Error('generation timed out')), this.timeoutMs);
    try {
      const response = await this.fetchImpl(this.endpoint, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 2048,
          system: buildSystemPrompt(item),
          messages: [
            {
              role: 'user',
              content: `Role: ${context.roleTitle}\nSeniority: ${context.seniority}\nDomain: ${context.domain ?? 'unspecified'}\nSkill: ${item.skillSource}\nFormat: ${item.format}\nDifficulty: ${item.difficulty}\nReturn ONLY the JSON object — no prose, no markdown fences.`,
            },
          ],
        }),
        signal: ctrl.signal,
      });
      if (!response.ok) {
        return {
          question: null,
          rejectionReason: `anthropic ${response.status} ${response.statusText}`,
        };
      }
      const payload = (await response.json()) as {
        content?: Array<{ type: string; text?: string }>;
      };
      const text = (payload.content ?? [])
        .filter((c) => c.type === 'text' && typeof c.text === 'string')
        .map((c) => c.text as string)
        .join('');
      try {
        const json = JSON.parse(text.trim().replace(/^```json\s*|\s*```$/g, '')) as Record<
          string,
          unknown
        >;
        const id = randomUUID();
        const question: GeneratedQuestion = {
          id,
          format: item.format,
          difficulty: item.difficulty,
          skillSource: item.skillSource,
          subSkillId: item.subSkillId,
          bodyMd: typeof json.stem === 'string' ? json.stem : '',
          bodyJson: json,
          selfCritique: { ...DEFAULT_CRITIQUE },
        };
        if (typeof json.answerKey === 'object' && json.answerKey !== null) {
          question.answerKey = json.answerKey as Record<string, unknown>;
        }
        if (Array.isArray(json.testCases)) {
          question.testCases = json.testCases as Array<Record<string, unknown>>;
        }
        if (typeof json.referenceSolution === 'string') {
          question.referenceSolution = json.referenceSolution;
        }
        return { question };
      } catch (err) {
        return {
          question: null,
          rejectionReason: `JSON parse failed: ${err instanceof Error ? err.message : String(err)}`,
        };
      }
    } finally {
      clearTimeout(timer);
    }
  }
}

function buildSystemPrompt(item: QuestionSpecItem): string {
  return `You are a question author for QOrium. Generate exactly one ${item.difficulty} ${item.format} question.

Format-specific schema: ${FORMAT_PROMPT_HINTS[item.format]}

CONSTRAINTS:
- Question must be original (do not match top-10 LeetCode/HackerRank/GFG questions for this skill).
- Return only valid JSON. No prose, no markdown fences.`;
}
