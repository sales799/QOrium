/**
 * Submission validation per Judge0-Sandbox-Integration-Spec-v0.md §3.1
 * step 2 ("API validates: ... Code < 50KB ... Language supported ...").
 *
 * Pure logic — no IO, no DB. Used by the API gateway when accepting a
 * submission and by the orchestrator before dispatching to a sandbox.
 */

import { isSupportedLanguage, type QOriumLanguage } from './languages.js';

const MAX_CODE_BYTES = 50 * 1024; // 50 KB
const MAX_TEST_CASE_COUNT = 50;

export interface SubmissionInput {
  code: string;
  language: string;
  questionId: string;
  candidateId: string;
}

export interface ValidatedSubmission {
  code: string;
  language: QOriumLanguage;
  questionId: string;
  candidateId: string;
}

export interface ValidationError {
  field: 'code' | 'language' | 'questionId' | 'candidateId' | 'sandbox_config';
  message: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateSubmission(
  raw: SubmissionInput,
): { ok: true; value: ValidatedSubmission } | { ok: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (typeof raw.code !== 'string' || raw.code.length === 0) {
    errors.push({ field: 'code', message: 'required' });
  } else if (Buffer.byteLength(raw.code, 'utf8') > MAX_CODE_BYTES) {
    errors.push({ field: 'code', message: `max ${MAX_CODE_BYTES} bytes (50 KB)` });
  }

  if (typeof raw.language !== 'string' || !isSupportedLanguage(raw.language)) {
    errors.push({ field: 'language', message: 'unsupported language' });
  }

  if (typeof raw.questionId !== 'string' || !UUID_REGEX.test(raw.questionId)) {
    errors.push({ field: 'questionId', message: 'must be a UUID' });
  }

  if (typeof raw.candidateId !== 'string' || raw.candidateId.trim().length === 0) {
    errors.push({ field: 'candidateId', message: 'required' });
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      code: raw.code,
      language: raw.language as QOriumLanguage,
      questionId: raw.questionId,
      candidateId: raw.candidateId.trim(),
    },
  };
}

export interface SandboxTestCase {
  index: number;
  input: string;
  expectedOutputPattern: string;
  weight: number;
  public: boolean;
  description?: string;
}

export interface SandboxConfig {
  language: QOriumLanguage;
  memoryMb: number;
  timeMs: number;
  compilationTimeoutMs: number;
  testCases: SandboxTestCase[];
  starterCode?: Record<string, string>;
  referenceSolution?: Record<string, string>;
  rubric?: Record<string, { weight: number; description?: string }>;
}

export function validateSandboxConfig(raw: unknown): SandboxConfig {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('sandbox_config must be an object');
  }
  const obj = raw as Record<string, unknown>;
  const language = obj.language;
  if (typeof language !== 'string' || !isSupportedLanguage(language)) {
    throw new Error(`sandbox_config.language is invalid: ${String(language)}`);
  }
  const testCasesRaw = obj.testCases ?? obj.test_cases;
  if (!Array.isArray(testCasesRaw) || testCasesRaw.length === 0) {
    throw new Error('sandbox_config.testCases must be a non-empty array');
  }
  if (testCasesRaw.length > MAX_TEST_CASE_COUNT) {
    throw new Error(`sandbox_config.testCases must have <= ${MAX_TEST_CASE_COUNT} entries`);
  }
  const testCases: SandboxTestCase[] = testCasesRaw.map((tc, i) => parseTestCase(tc, i));
  let totalWeight = 0;
  for (const t of testCases) totalWeight += t.weight;
  if (Math.abs(totalWeight - 1) > 0.01) {
    throw new Error(`test-case weights must sum to ~1.0; got ${totalWeight.toFixed(3)}`);
  }
  const memoryMb = numberAt(obj, 'memoryMb', 'memory_mb', 256);
  const timeMs = numberAt(obj, 'timeMs', 'time_ms', 3_000);
  const compilationTimeoutMs = numberAt(
    obj,
    'compilationTimeoutMs',
    'compilation_timeout_ms',
    5_000,
  );

  const config: SandboxConfig = {
    language: language as QOriumLanguage,
    memoryMb,
    timeMs,
    compilationTimeoutMs,
    testCases,
  };
  const starter = obj.starterCode ?? obj.starter_code;
  if (starter && typeof starter === 'object')
    config.starterCode = starter as Record<string, string>;
  const ref = obj.referenceSolution ?? obj.reference_solution;
  if (ref && typeof ref === 'object') config.referenceSolution = ref as Record<string, string>;
  if (obj.rubric && typeof obj.rubric === 'object') {
    config.rubric = obj.rubric as NonNullable<SandboxConfig['rubric']>;
  }
  return config;
}

function numberAt(obj: Record<string, unknown>, k1: string, k2: string, fallback: number): number {
  const v = obj[k1] ?? obj[k2];
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) return v;
  return fallback;
}

function parseTestCase(raw: unknown, idx: number): SandboxTestCase {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error(`test_cases[${idx}] must be an object`);
  }
  const tc = raw as Record<string, unknown>;
  const input = typeof tc.input === 'string' ? tc.input : '';
  const pattern = tc.expectedOutputPattern ?? tc.expected_output_pattern;
  if (typeof pattern !== 'string' || pattern.length === 0) {
    throw new Error(`test_cases[${idx}].expected_output_pattern is required`);
  }
  const weight = typeof tc.weight === 'number' && tc.weight >= 0 ? tc.weight : 0;
  const isPublic = typeof tc.public === 'boolean' ? tc.public : false;
  const description = typeof tc.description === 'string' ? tc.description : undefined;
  const indexValue = typeof tc.index === 'number' ? tc.index : idx;
  const result: SandboxTestCase = {
    index: indexValue,
    input,
    expectedOutputPattern: pattern,
    weight,
    public: isPublic,
  };
  if (description !== undefined) result.description = description;
  return result;
}
