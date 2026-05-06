/**
 * executeSubmission — runs one candidate submission against a question's
 * sandbox_config end-to-end:
 *
 *   1. Resolve language profile + apply per-question overrides
 *   2. For each test case, submit to Judge0 with the test's stdin
 *   3. Score the gathered outputs vs expectations
 *   4. Compute anti-fraud signals
 *   5. Build the execution_metadata payload + an updated suspicious_signals
 *
 * Apex-routed languages are NOT handled by this function (per the v0 CTO-DELTA);
 * callers must check `routesToJudge0` before dispatching here.
 */

import type { Logger } from 'pino';
import {
  computeAntiFraudSignals,
  type AntiFraudInputs,
  type AntiFraudSignals,
} from './anti-fraud.js';
import { getLanguageProfile, judge0IdFor, type QOriumLanguage } from './languages.js';
import {
  scoreSubmission,
  type ScoringResult,
  type TestCaseExpectation,
  type TestRunOutput,
} from './scoring.js';
import type { SandboxConfig, SandboxTestCase } from './submission.js';
import { Judge0Client } from './judge0/client.js';
import type { Judge0SubmissionResult } from './judge0/types.js';

export interface ExecuteSubmissionInput {
  candidateCode: string;
  language: QOriumLanguage;
  config: SandboxConfig;
  judge0: Judge0Client;
  /** Optional fraud-signal inputs collected by the API gateway. */
  antiFraud?: AntiFraudInputs;
  logger?: Logger;
  signal?: AbortSignal;
}

export interface ExecutionMetadata {
  language: QOriumLanguage;
  judge0LanguageId: number;
  startedAt: string;
  finishedAt: string;
  /** Wall-clock orchestrator latency in ms. */
  durationMs: number;
  testResults: ScoringResult['perTest'];
  /** Sum of judge0 reported execution time (ms) across all test cases. */
  executionMillis: number;
  /** Max memory (KB) reported across all test cases. */
  memoryKb: number;
  compilationError: string | null;
  runtimeError: string | null;
  exitCode: number | null;
  timeout: boolean;
}

export interface ExecutionOutcome {
  score: number;
  scoring: ScoringResult;
  metadata: ExecutionMetadata;
  antiFraud: AntiFraudSignals;
}

export async function executeSubmission(input: ExecuteSubmissionInput): Promise<ExecutionOutcome> {
  if (!input.config.testCases || input.config.testCases.length === 0) {
    throw new Error('sandbox_config.testCases must not be empty');
  }
  const profile = getLanguageProfile(input.language);
  if (!profile.routesToJudge0) {
    throw new Error(
      `language ${input.language} does not route to Judge0; use the Apex path (out of scope for v0)`,
    );
  }
  const languageId = judge0IdFor(input.language);

  const startedAt = new Date();
  const expectations: TestCaseExpectation[] = input.config.testCases.map(toExpectation);
  const outputs: TestRunOutput[] = [];
  let executionMillis = 0;
  let memoryKb = 0;
  let compilationError: string | null = null;
  let runtimeError: string | null = null;
  let exitCode: number | null = null;
  let timeout = false;

  for (const testCase of input.config.testCases) {
    if (input.signal?.aborted) {
      input.logger?.warn(
        { questionLanguage: input.language },
        'execution aborted by signal mid-test',
      );
      break;
    }
    let result: Judge0SubmissionResult;
    try {
      const opts: { signal?: AbortSignal } = {};
      if (input.signal !== undefined) opts.signal = input.signal;
      result = await input.judge0.execute(
        {
          source_code: input.candidateCode,
          language_id: languageId,
          stdin: testCase.input,
          cpu_time_limit: msToSeconds(input.config.timeMs),
          wall_time_limit: msToSeconds(input.config.timeMs * 2 + input.config.compilationTimeoutMs),
          memory_limit: input.config.memoryMb * 1024,
        },
        opts,
      );
    } catch (err) {
      input.logger?.error(
        { err, testIndex: testCase.index },
        'judge0 execution failed for test case',
      );
      outputs.push(judge0ErrorToOutput(testCase, err));
      runtimeError = runtimeError ?? (err instanceof Error ? err.message : String(err));
      continue;
    }
    outputs.push(judge0ResultToOutput(testCase, result));

    executionMillis += parseFloatTime(result.time);
    memoryKb = Math.max(memoryKb, result.memory ?? 0);
    if (result.compile_output) compilationError = result.compile_output;
    if (result.message) runtimeError = result.message;
    if (typeof result.exit_code === 'number') exitCode = result.exit_code;
    if (result.status?.id === 5) timeout = true;
  }

  const scoring = scoreSubmission(expectations, outputs);
  const finishedAt = new Date();
  const durationMs = finishedAt.getTime() - startedAt.getTime();

  const antiFraud = computeAntiFraudSignals({
    ...(input.antiFraud ?? {}),
    executionSuccess: outputs.length === input.config.testCases.length && runtimeError === null,
    languageMismatch: input.antiFraud?.languageMismatch ?? input.config.language !== input.language,
  });

  return {
    score: scoring.total,
    scoring,
    antiFraud,
    metadata: {
      language: input.language,
      judge0LanguageId: languageId,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs,
      testResults: scoring.perTest,
      executionMillis: Math.round(executionMillis),
      memoryKb,
      compilationError,
      runtimeError,
      exitCode,
      timeout,
    },
  };
}

function toExpectation(tc: SandboxTestCase): TestCaseExpectation {
  const out: TestCaseExpectation = {
    index: tc.index,
    expectedOutputPattern: tc.expectedOutputPattern,
    weight: tc.weight,
    public: tc.public,
  };
  if (tc.description !== undefined) out.description = tc.description;
  return out;
}

function judge0ResultToOutput(tc: SandboxTestCase, r: Judge0SubmissionResult): TestRunOutput {
  return {
    index: tc.index,
    stdout: r.stdout ?? '',
    stderr: r.stderr ?? '',
    exitCode: r.exit_code,
    timeMs: parseFloatTime(r.time),
    memoryKb: r.memory ?? 0,
    judge0StatusId: r.status?.id,
    compileOutput: r.compile_output,
    runtimeError: r.message,
    timeout: r.status?.id === 5,
  };
}

function judge0ErrorToOutput(tc: SandboxTestCase, err: unknown): TestRunOutput {
  return {
    index: tc.index,
    stdout: '',
    stderr: err instanceof Error ? err.message : String(err),
    exitCode: null,
    timeMs: 0,
    memoryKb: 0,
    runtimeError: err instanceof Error ? err.message : String(err),
  };
}

function parseFloatTime(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return 0;
  return parsed * 1_000;
}

function msToSeconds(ms: number): number {
  return Math.max(1, Math.round(ms / 1_000));
}
