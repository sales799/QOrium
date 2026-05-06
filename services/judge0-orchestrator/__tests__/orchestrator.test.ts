import { describe, expect, it, vi } from 'vitest';
import pino from 'pino';
import { executeSubmission } from '../src/orchestrator';
import { Judge0Client } from '../src/judge0/client';
import type { Judge0SubmissionResult } from '../src/judge0/types';
import type { SandboxConfig } from '../src/submission';

const silentLogger = pino({ level: 'silent' });

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function judge0Mock(results: ReadonlyArray<Judge0SubmissionResult>): {
  client: Judge0Client;
  fetchImpl: ReturnType<typeof vi.fn>;
} {
  let resultIdx = 0;
  const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
    if ((init?.method ?? 'GET') === 'POST') {
      return jsonResponse({ token: `tok-${resultIdx}` });
    }
    const r = results[resultIdx] ?? results[results.length - 1];
    resultIdx++;
    return jsonResponse(r);
  });
  const client = new Judge0Client({
    baseUrl: 'http://judge0.test',
    fetchImpl: fetchImpl as unknown as typeof fetch,
    pollIntervalMs: 1,
  });
  return { client, fetchImpl };
}

const SUM_CONFIG: SandboxConfig = {
  language: 'python3',
  memoryMb: 256,
  timeMs: 3_000,
  compilationTimeoutMs: 0,
  testCases: [
    { index: 0, input: '5 3', expectedOutputPattern: '^8$', weight: 0.5, public: true },
    { index: 1, input: '-1 1', expectedOutputPattern: '^0$', weight: 0.5, public: true },
  ],
};

const accepted = (stdout: string): Judge0SubmissionResult => ({
  stdout,
  stderr: null,
  compile_output: null,
  message: null,
  exit_code: 0,
  status: { id: 3, description: 'Accepted' },
  time: '0.123',
  memory: 1024,
});

const compileError: Judge0SubmissionResult = {
  stdout: null,
  stderr: null,
  compile_output: 'SyntaxError: missing colon',
  message: null,
  exit_code: 1,
  status: { id: 6, description: 'Compilation Error' },
  time: '0.001',
  memory: 100,
};

const tle: Judge0SubmissionResult = {
  stdout: null,
  stderr: null,
  compile_output: null,
  message: null,
  exit_code: null,
  status: { id: 5, description: 'Time Limit Exceeded' },
  time: '5.0',
  memory: 1000,
};

describe('executeSubmission', () => {
  it('all tests pass → score 100, no anti-fraud flags by default', async () => {
    const { client } = judge0Mock([accepted('8\n'), accepted('0')]);
    const outcome = await executeSubmission({
      candidateCode: 'print(sum(map(int, input().split())))',
      language: 'python3',
      config: SUM_CONFIG,
      judge0: client,
      logger: silentLogger,
    });
    expect(outcome.score).toBe(100);
    expect(outcome.scoring.passedCount).toBe(2);
    expect(outcome.metadata.timeout).toBe(false);
    expect(outcome.metadata.compilationError).toBeNull();
    expect(outcome.metadata.judge0LanguageId).toBe(71);
    expect(outcome.antiFraud.flags).not.toContain('execution_failed');
  });

  it('partial credit when one test fails', async () => {
    const { client } = judge0Mock([accepted('8'), accepted('999')]);
    const outcome = await executeSubmission({
      candidateCode: 'print(0)',
      language: 'python3',
      config: SUM_CONFIG,
      judge0: client,
      logger: silentLogger,
    });
    expect(outcome.score).toBe(50);
    expect(outcome.scoring.passedCount).toBe(1);
  });

  it('compile error flips compilationError, score 0', async () => {
    const { client } = judge0Mock([compileError]);
    const outcome = await executeSubmission({
      candidateCode: 'broken code',
      language: 'python3',
      config: { ...SUM_CONFIG, testCases: [SUM_CONFIG.testCases[0]] },
      judge0: client,
      logger: silentLogger,
    });
    expect(outcome.score).toBe(0);
    expect(outcome.metadata.compilationError).toContain('SyntaxError');
    expect(outcome.scoring.perTest[0]?.reason).toBe('compile_error');
  });

  it('TLE → metadata.timeout true, reason timeout, score 0', async () => {
    const { client } = judge0Mock([tle]);
    const outcome = await executeSubmission({
      candidateCode: 'while True: pass',
      language: 'python3',
      config: { ...SUM_CONFIG, testCases: [SUM_CONFIG.testCases[0]] },
      judge0: client,
      logger: silentLogger,
    });
    expect(outcome.metadata.timeout).toBe(true);
    expect(outcome.scoring.perTest[0]?.reason).toBe('timeout');
    expect(outcome.score).toBe(0);
  });

  it('judge0 client error on a test → recorded as runtime_error, pipeline continues', async () => {
    let call = 0;
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      const isPost = (init?.method ?? 'GET') === 'POST';
      call++;
      if (call === 1 && isPost) {
        return new Response('boom', { status: 500, statusText: 'Internal Server Error' });
      }
      if (isPost) return jsonResponse({ token: 'tok2' });
      return jsonResponse(accepted('0'));
    });
    const client = new Judge0Client({
      baseUrl: 'http://judge0.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      pollIntervalMs: 1,
    });
    const outcome = await executeSubmission({
      candidateCode: 'print(0)',
      language: 'python3',
      config: SUM_CONFIG,
      judge0: client,
      logger: silentLogger,
    });
    expect(outcome.metadata.runtimeError).not.toBeNull();
    // Second test case still scored — only the first was an error
    expect(outcome.scoring.passedCount).toBe(1);
    expect(outcome.score).toBe(50);
  });

  it('language mismatch (config.language != input.language) raises language_mismatch flag', async () => {
    const { client } = judge0Mock([accepted('8'), accepted('0')]);
    const outcome = await executeSubmission({
      candidateCode: 'print(0)',
      language: 'node20',
      config: { ...SUM_CONFIG, language: 'python3' },
      judge0: client,
      logger: silentLogger,
    });
    expect(outcome.antiFraud.flags).toContain('language_mismatch');
  });

  it('apex language is rejected (out-of-scope for v0 Judge0 path)', async () => {
    const { client } = judge0Mock([accepted('x')]);
    await expect(
      executeSubmission({
        candidateCode: 'System.debug(1);',
        language: 'apex',
        config: { ...SUM_CONFIG, language: 'apex' },
        judge0: client,
        logger: silentLogger,
      }),
    ).rejects.toThrow(/Apex/i);
  });

  it('throws when sandbox_config.testCases is empty', async () => {
    const { client } = judge0Mock([]);
    await expect(
      executeSubmission({
        candidateCode: 'print(0)',
        language: 'python3',
        config: { ...SUM_CONFIG, testCases: [] },
        judge0: client,
        logger: silentLogger,
      }),
    ).rejects.toThrow();
  });
});
