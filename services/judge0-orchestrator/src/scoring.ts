/**
 * Per-test pass/fail + weighted total per Judge0-Sandbox-Integration-Spec-v0
 * §3.2 step 5 ("Scoring: For each test case: pass/fail based on output match
 * or exception. Score = sum(weight × is_pass) for all test cases.").
 *
 * Pure logic. The match function accepts two forms by convention:
 *   - Patterns starting and ending with "/" are treated as regex (case-sensitive)
 *   - Everything else is exact string match after trimming trailing whitespace
 */

export interface TestRunOutput {
  index: number;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timeMs: number;
  memoryKb: number;
  /** Judge0 status (null when comes from a non-Judge0 path like Apex). */
  judge0StatusId?: number | undefined;
  /** Compilation error from the toolchain, if any. */
  compileOutput?: string | null;
  /** Runtime error, if any. */
  runtimeError?: string | null;
  /** Whether the runner reported a wall-time / cpu-time timeout. */
  timeout?: boolean;
}

export interface TestCaseExpectation {
  index: number;
  expectedOutputPattern: string;
  weight: number;
  public: boolean;
  description?: string | undefined;
}

export interface ScoredTestCase {
  index: number;
  passed: boolean;
  reason: 'match' | 'mismatch' | 'compile_error' | 'runtime_error' | 'timeout' | 'no_output';
  stdout: string;
  stderrSummary: string;
  weight: number;
  public: boolean;
  description?: string | undefined;
}

export interface ScoringResult {
  total: number; // 0 — 100
  perTest: ScoredTestCase[];
  passedCount: number;
  totalCount: number;
}

const STDERR_SUMMARY_LIMIT = 500;

/**
 * Per spec §4 the `expected_output_pattern` field is a regex string (e.g.
 * `"^8$"`, `"^Hello, World!$"`). We auto-anchor the pattern with `^…$` if
 * the author didn't, so a literal `"hello"` matches the candidate output
 * `"hello"` but NOT `"hello world"`. Trailing whitespace on the actual
 * output is ignored so a stray `\n` doesn't fail the match.
 */
export function matchesExpected(actual: string, pattern: string): boolean {
  const trimmed = actual.replace(/\s+$/g, '');
  const anchored = pattern.startsWith('^') || pattern.endsWith('$') ? pattern : `^${pattern}$`;
  try {
    return new RegExp(anchored).test(trimmed);
  } catch {
    return trimmed === pattern.replace(/\s+$/g, '');
  }
}

export function scoreSubmission(
  expectations: readonly TestCaseExpectation[],
  outputs: readonly TestRunOutput[],
): ScoringResult {
  const outputsByIndex = new Map<number, TestRunOutput>();
  for (const o of outputs) outputsByIndex.set(o.index, o);

  const perTest: ScoredTestCase[] = expectations.map((e) =>
    classifyTestCase(e, outputsByIndex.get(e.index)),
  );
  const totalWeight = expectations.reduce((acc, e) => acc + e.weight, 0);
  const passedWeight = perTest.reduce((acc, t) => (t.passed ? acc + t.weight : acc), 0);
  const total = totalWeight > 0 ? Math.round((passedWeight / totalWeight) * 1_000) / 10 : 0;
  const passedCount = perTest.filter((t) => t.passed).length;

  return {
    total,
    perTest,
    passedCount,
    totalCount: perTest.length,
  };
}

function classifyTestCase(
  expectation: TestCaseExpectation,
  output: TestRunOutput | undefined,
): ScoredTestCase {
  const base: ScoredTestCase = {
    index: expectation.index,
    passed: false,
    reason: 'no_output',
    stdout: '',
    stderrSummary: '',
    weight: expectation.weight,
    public: expectation.public,
  };
  if (expectation.description !== undefined) base.description = expectation.description;
  if (!output) return base;

  base.stdout = output.stdout.slice(0, 5_000);
  base.stderrSummary = (output.stderr ?? '').slice(0, STDERR_SUMMARY_LIMIT);

  if (output.compileOutput) {
    return { ...base, reason: 'compile_error' };
  }
  if (output.timeout) {
    return { ...base, reason: 'timeout' };
  }
  if (output.runtimeError || (output.exitCode !== null && output.exitCode !== 0)) {
    return { ...base, reason: 'runtime_error' };
  }

  const passed = matchesExpected(output.stdout, expectation.expectedOutputPattern);
  return { ...base, passed, reason: passed ? 'match' : 'mismatch' };
}
