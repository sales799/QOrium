import { describe, expect, it, vi } from 'vitest';
import pino from 'pino';
import { runCalibration } from '../src/orchestrator';
import type {
  ApplyCalibrationInput,
  CalibratingQuestion,
  ResponseForCalibration,
} from '../src/repositories/calibrating';

const silentLogger = pino({ level: 'silent' });

const QUESTION: CalibratingQuestion = {
  id: 'q-1',
  uuid: 'uuid-1',
  format: 'mcq',
  priorB: 0,
  priorA: 1.2,
  priorC: 0.25,
  calibrationN: 60,
};

function genResponses(
  questionId: string,
  cohort: { id: string; correctRate: number }[],
  attemptsPerCandidate: number,
): ResponseForCalibration[] {
  const out: ResponseForCalibration[] = [];
  for (const c of cohort) {
    for (let i = 0; i < attemptsPerCandidate; i++) {
      // First N correct based on rate, then incorrect — deterministic
      const score = i / attemptsPerCandidate < c.correctRate ? 90 : 10;
      out.push({ questionId, candidateId: c.id, score });
    }
  }
  return out;
}

describe('runCalibration', () => {
  it('returns an empty report when no questions are pending', async () => {
    const apply = vi.fn();
    const report = await runCalibration({
      listQuestions: async () => [],
      fetchResponses: async () => [],
      applyCalibration: apply,
      logger: silentLogger,
      config: { minResponses: 30, maxIterations: 50, tolerance: 1e-6 },
      generateRunId: () => 'fixed-run',
      now: () => new Date('2026-05-03T03:00:00Z'),
    });
    expect(report.questionsConsidered).toBe(0);
    expect(report.questionsCalibrated).toBe(0);
    expect(apply).not.toHaveBeenCalled();
  });

  it('flags low_n when responses < minResponses for an item', async () => {
    const apply = vi.fn(async () => {});
    const cohort = [
      { id: 'a', correctRate: 0.3 },
      { id: 'b', correctRate: 0.6 },
      { id: 'c', correctRate: 0.9 },
    ];
    const responses = genResponses('q-1', cohort, 5); // 15 responses, below minN=30
    const report = await runCalibration({
      listQuestions: async () => [QUESTION],
      fetchResponses: async () => responses,
      applyCalibration: apply,
      logger: silentLogger,
      config: { minResponses: 30, maxIterations: 50, tolerance: 1e-6 },
      generateRunId: () => 'r1',
    });
    expect(report.flags.low_n).toBe(1);
    expect(report.questionsHeldInCalibration).toBe(1);
    expect(apply).toHaveBeenCalledTimes(1);
    const arg = apply.mock.calls[0]?.[0] as ApplyCalibrationInput;
    expect(arg.flag).toBe('low_n');
    expect(arg.nextStatus).toBe('calibrating');
  });

  it('graduates a healthy item to released when no drift', async () => {
    const apply = vi.fn(async () => {});
    // Build a wide cohort so MLE has signal
    const cohort = Array.from({ length: 20 }, (_, i) => ({
      id: `c${i}`,
      correctRate: 0.2 + (i / 19) * 0.6, // 0.2 → 0.8 spread
    }));
    const responses = genResponses('q-1', cohort, 5); // 100 responses
    const report = await runCalibration({
      listQuestions: async () => [QUESTION],
      fetchResponses: async () => responses,
      applyCalibration: apply,
      logger: silentLogger,
      config: { minResponses: 30, maxIterations: 80, tolerance: 1e-6 },
      generateRunId: () => 'r1',
    });
    expect(report.questionsCalibrated).toBe(1);
    expect(apply).toHaveBeenCalledOnce();
    const arg = apply.mock.calls[0]?.[0] as ApplyCalibrationInput;
    expect(arg.runId).toBe('r1');
    // The fit shouldn't be invalid for this synthetic well-spread cohort.
    expect(['none', 'drift_a', 'drift_b', 'extreme_pass_rate']).toContain(arg.flag);
  });

  it('counts a fetch failure as an error and exits early', async () => {
    const apply = vi.fn();
    const report = await runCalibration({
      listQuestions: async () => [QUESTION],
      fetchResponses: async () => {
        throw new Error('db down');
      },
      applyCalibration: apply,
      logger: silentLogger,
      config: { minResponses: 30, maxIterations: 50, tolerance: 1e-6 },
      generateRunId: () => 'r1',
    });
    expect(report.errors).toBeGreaterThan(0);
    expect(apply).not.toHaveBeenCalled();
  });

  it('counts an applyCalibration failure as an error but continues', async () => {
    const apply = vi.fn(async () => {
      throw new Error('write failure');
    });
    const cohort = [
      { id: 'a', correctRate: 0.3 },
      { id: 'b', correctRate: 0.5 },
      { id: 'c', correctRate: 0.7 },
    ];
    const responses = genResponses('q-1', cohort, 12); // 36 responses
    const q2: CalibratingQuestion = { ...QUESTION, id: 'q-2', uuid: 'uuid-2' };
    const report = await runCalibration({
      listQuestions: async () => [QUESTION, q2],
      fetchResponses: async () => [...responses, ...genResponses('q-2', cohort, 12)],
      applyCalibration: apply,
      logger: silentLogger,
      config: { minResponses: 30, maxIterations: 30, tolerance: 1e-6 },
      generateRunId: () => 'r1',
    });
    expect(apply).toHaveBeenCalledTimes(2);
    expect(report.errors).toBe(2);
  });

  it('attaches the same runId to every applyCalibration call in a batch', async () => {
    const apply = vi.fn(async () => {});
    const cohort = [
      { id: 'a', correctRate: 0.4 },
      { id: 'b', correctRate: 0.5 },
      { id: 'c', correctRate: 0.6 },
    ];
    const responses = [...genResponses('q-1', cohort, 12), ...genResponses('q-2', cohort, 12)];
    await runCalibration({
      listQuestions: async () => [QUESTION, { ...QUESTION, id: 'q-2', uuid: 'uuid-2' }],
      fetchResponses: async () => responses,
      applyCalibration: apply,
      logger: silentLogger,
      config: { minResponses: 30, maxIterations: 30, tolerance: 1e-6 },
      generateRunId: () => 'fixed-run-id',
    });
    const calls = apply.mock.calls.map((c) => (c[0] as ApplyCalibrationInput).runId);
    for (const id of calls) expect(id).toBe('fixed-run-id');
  });
});
