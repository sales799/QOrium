import { describe, expect, it } from 'vitest';
import { validateSandboxConfig, validateSubmission } from '../src/submission';

describe('validateSubmission', () => {
  const validUuid = '11111111-2222-3333-4444-555555555555';

  it('accepts a minimal valid submission', () => {
    const result = validateSubmission({
      code: 'print("hello")',
      language: 'python3',
      questionId: validUuid,
      candidateId: 'cand-1',
    });
    expect(result.ok).toBe(true);
  });

  it('rejects empty code', () => {
    const result = validateSubmission({
      code: '',
      language: 'python3',
      questionId: validUuid,
      candidateId: 'cand-1',
    });
    expect(result.ok).toBe(false);
  });

  it('rejects code > 50 KB', () => {
    const result = validateSubmission({
      code: 'x'.repeat(51 * 1024),
      language: 'python3',
      questionId: validUuid,
      candidateId: 'cand-1',
    });
    expect(result.ok).toBe(false);
  });

  it('rejects unsupported language', () => {
    const result = validateSubmission({
      code: 'print("hello")',
      language: 'haskell',
      questionId: validUuid,
      candidateId: 'cand-1',
    });
    expect(result.ok).toBe(false);
  });

  it('rejects non-uuid questionId', () => {
    const result = validateSubmission({
      code: 'print("hi")',
      language: 'python3',
      questionId: 'not-a-uuid',
      candidateId: 'cand-1',
    });
    expect(result.ok).toBe(false);
  });

  it('rejects empty candidateId', () => {
    const result = validateSubmission({
      code: 'print("hi")',
      language: 'python3',
      questionId: validUuid,
      candidateId: '   ',
    });
    expect(result.ok).toBe(false);
  });

  it('trims candidateId whitespace', () => {
    const result = validateSubmission({
      code: 'print("hi")',
      language: 'python3',
      questionId: validUuid,
      candidateId: '  cand-7  ',
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.candidateId).toBe('cand-7');
  });
});

describe('validateSandboxConfig', () => {
  const valid = {
    language: 'python3',
    memory_mb: 256,
    time_ms: 3_000,
    test_cases: [
      {
        index: 0,
        input: '5 3',
        expected_output_pattern: '^8$',
        weight: 0.5,
        public: true,
      },
      {
        index: 1,
        input: '-1 1',
        expected_output_pattern: '^0$',
        weight: 0.5,
        public: false,
      },
    ],
  };

  it('parses snake_case spec form into camelCase typed config', () => {
    const cfg = validateSandboxConfig(valid);
    expect(cfg.language).toBe('python3');
    expect(cfg.memoryMb).toBe(256);
    expect(cfg.timeMs).toBe(3_000);
    expect(cfg.testCases).toHaveLength(2);
    expect(cfg.testCases[0]?.expectedOutputPattern).toBe('^8$');
  });

  it('rejects when test-case weights do not sum to ~1', () => {
    expect(() =>
      validateSandboxConfig({
        ...valid,
        test_cases: [
          { ...valid.test_cases[0], weight: 0.5 },
          { ...valid.test_cases[1], weight: 0.1 },
        ],
      }),
    ).toThrow(/weights/);
  });

  it('rejects empty test_cases', () => {
    expect(() => validateSandboxConfig({ ...valid, test_cases: [] })).toThrow();
  });

  it('rejects unsupported language in config', () => {
    expect(() => validateSandboxConfig({ ...valid, language: 'erlang' })).toThrow();
  });

  it('falls back to default memory/time when missing', () => {
    const cfg = validateSandboxConfig({
      language: 'python3',
      test_cases: [
        { index: 0, input: '', expected_output_pattern: '^x$', weight: 1, public: true },
      ],
    });
    expect(cfg.memoryMb).toBe(256);
    expect(cfg.timeMs).toBe(3_000);
  });

  it('rejects too many test cases (> 50)', () => {
    const tcs = Array.from({ length: 51 }, (_, i) => ({
      index: i,
      input: '',
      expected_output_pattern: '^.$',
      weight: 1 / 51,
      public: false,
    }));
    expect(() => validateSandboxConfig({ ...valid, test_cases: tcs })).toThrow(/<= 50/);
  });
});
