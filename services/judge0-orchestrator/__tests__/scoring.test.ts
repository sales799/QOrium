import { describe, expect, it } from 'vitest';
import { matchesExpected, scoreSubmission } from '../src/scoring';
import type { TestCaseExpectation, TestRunOutput } from '../src/scoring';

describe('matchesExpected', () => {
  it('auto-anchors literal patterns and ignores trailing whitespace on actual', () => {
    expect(matchesExpected('hello\n', 'hello')).toBe(true);
    expect(matchesExpected('hello', 'hello')).toBe(true);
    expect(matchesExpected('hello world', 'hello')).toBe(false);
  });

  it('honours explicitly-anchored regex from the spec form', () => {
    expect(matchesExpected('8\n', '^8$')).toBe(true);
    expect(matchesExpected('80', '^8$')).toBe(false);
    expect(matchesExpected('1998', '^1998$')).toBe(true);
  });

  it('honours regex special chars when present', () => {
    expect(matchesExpected('42', '^\\d+$')).toBe(true);
    expect(matchesExpected('forty-two', '^\\d+$')).toBe(false);
  });

  it('invalid regex falls back to literal compare (no exception)', () => {
    // `[invalid` is not a valid regex; literal compare against trimmed.
    expect(matchesExpected('[invalid', '[invalid')).toBe(true);
  });
});

const exp = (
  i: number,
  pattern: string,
  weight: number,
  isPublic = false,
): TestCaseExpectation => ({
  index: i,
  expectedOutputPattern: pattern,
  weight,
  public: isPublic,
});

const out = (i: number, fields: Partial<TestRunOutput>): TestRunOutput => ({
  index: i,
  stdout: '',
  stderr: '',
  exitCode: 0,
  timeMs: 0,
  memoryKb: 0,
  ...fields,
});

describe('scoreSubmission', () => {
  it('all tests pass → total 100', () => {
    const result = scoreSubmission(
      [exp(0, '5', 0.5), exp(1, '10', 0.5)],
      [out(0, { stdout: '5\n' }), out(1, { stdout: '10' })],
    );
    expect(result.total).toBe(100);
    expect(result.passedCount).toBe(2);
  });

  it('weighted partial credit', () => {
    const result = scoreSubmission(
      [exp(0, '5', 0.7), exp(1, '10', 0.3)],
      [out(0, { stdout: '5' }), out(1, { stdout: '999' })],
    );
    expect(result.total).toBe(70);
  });

  it('compile_output → reason compile_error, no pass', () => {
    const result = scoreSubmission(
      [exp(0, '5', 1)],
      [out(0, { compileOutput: 'syntax error', stdout: '' })],
    );
    expect(result.total).toBe(0);
    expect(result.perTest[0]?.reason).toBe('compile_error');
  });

  it('runtime_error (non-zero exit) → reason runtime_error, no pass', () => {
    const result = scoreSubmission(
      [exp(0, '5', 1)],
      [out(0, { stdout: '5', exitCode: 134, runtimeError: 'SIGABRT' })],
    );
    expect(result.total).toBe(0);
    expect(result.perTest[0]?.reason).toBe('runtime_error');
  });

  it('timeout flag → reason timeout, no pass', () => {
    const result = scoreSubmission([exp(0, '5', 1)], [out(0, { timeout: true, stdout: '' })]);
    expect(result.total).toBe(0);
    expect(result.perTest[0]?.reason).toBe('timeout');
  });

  it('no output for a test → reason no_output', () => {
    const result = scoreSubmission([exp(0, '5', 1)], []);
    expect(result.perTest[0]?.reason).toBe('no_output');
    expect(result.total).toBe(0);
  });

  it('truncates stderr in summary to <=500 chars', () => {
    const longStderr = 'x'.repeat(5_000);
    const result = scoreSubmission([exp(0, '5', 1)], [out(0, { stderr: longStderr, stdout: '5' })]);
    expect(result.perTest[0]?.stderrSummary.length).toBeLessThanOrEqual(500);
  });

  it('preserves description metadata when provided', () => {
    const e: TestCaseExpectation = { ...exp(0, '5', 1, true), description: 'small numbers' };
    const result = scoreSubmission([e], [out(0, { stdout: '5' })]);
    expect(result.perTest[0]?.description).toBe('small numbers');
    expect(result.perTest[0]?.public).toBe(true);
  });
});
