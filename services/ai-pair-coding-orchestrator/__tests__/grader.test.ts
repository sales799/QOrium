import { describe, expect, it } from 'vitest';
import { DEFAULT_WEIGHTS, gradeSession, type SessionSignals } from '../src/grader';

const baseline: SessionSignals = {
  typedChars: 1500,
  pastedChars: 200,
  editTestCycles: 5,
  candidateMessageCount: 5,
  acceptedVerbatimCount: 3,
  acceptedModifiedCount: 2,
  rejectedCount: 1,
  seededErrorsCaught: 1,
  seededErrorsTotal: 2,
  codeQualityScore: 4,
  timeToFirstCodeSec: 60,
  durationSec: 1800,
};

describe('gradeSession dimension A — final code quality', () => {
  it('passes the code grader score through', () => {
    const out = gradeSession({ ...baseline, codeQualityScore: 5 });
    expect(out.dimensions.A_final_code_quality.score).toBe(5);
  });
  it('clamps out-of-range scores', () => {
    const out = gradeSession({ ...baseline, codeQualityScore: 99 });
    expect(out.dimensions.A_final_code_quality.score).toBe(5);
  });
});

describe('gradeSession dimension B — acceptance discipline', () => {
  it('penalises paste-and-submit (very high paste ratio)', () => {
    const out = gradeSession({
      ...baseline,
      typedChars: 100,
      pastedChars: 2000,
      acceptedVerbatimCount: 5,
      acceptedModifiedCount: 0,
    });
    expect(out.dimensions.B_acceptance_discipline.score).toBe(1);
  });
  it('rewards low-paste + high-modification', () => {
    const out = gradeSession({
      ...baseline,
      typedChars: 2000,
      pastedChars: 200,
      acceptedVerbatimCount: 1,
      acceptedModifiedCount: 4,
    });
    expect(out.dimensions.B_acceptance_discipline.score).toBe(5);
  });
});

describe('gradeSession dimension C — rejection discipline', () => {
  it('rewards healthy 10-40% rejection rate', () => {
    const out = gradeSession({
      ...baseline,
      acceptedVerbatimCount: 4,
      acceptedModifiedCount: 4,
      rejectedCount: 2, // 2/10 = 20%
    });
    expect(out.dimensions.C_rejection_discipline.score).toBe(5);
  });
  it('penalises rubber-stamping (rejection < 5%)', () => {
    const out = gradeSession({
      ...baseline,
      acceptedVerbatimCount: 30,
      acceptedModifiedCount: 0,
      rejectedCount: 0,
    });
    expect(out.dimensions.C_rejection_discipline.score).toBe(2);
  });
  it('penalises chronic rejection (>70%)', () => {
    const out = gradeSession({
      ...baseline,
      acceptedVerbatimCount: 0,
      acceptedModifiedCount: 1,
      rejectedCount: 10,
    });
    expect(out.dimensions.C_rejection_discipline.score).toBe(2);
  });
  it('returns neutral when there are no AI suggestions', () => {
    const out = gradeSession({
      ...baseline,
      acceptedVerbatimCount: 0,
      acceptedModifiedCount: 0,
      rejectedCount: 0,
    });
    expect(out.dimensions.C_rejection_discipline.score).toBe(3);
  });
});

describe('gradeSession dimension D — question asking', () => {
  it('rewards 3-12 candidate messages', () => {
    const out = gradeSession({ ...baseline, candidateMessageCount: 6 });
    expect(out.dimensions.D_question_asking.score).toBe(5);
  });
  it('penalises silent candidates', () => {
    const out = gradeSession({ ...baseline, candidateMessageCount: 0 });
    expect(out.dimensions.D_question_asking.score).toBe(1);
  });
  it('penalises chatty candidates', () => {
    const out = gradeSession({ ...baseline, candidateMessageCount: 50 });
    expect(out.dimensions.D_question_asking.score).toBe(2);
  });
});

describe('gradeSession dimension E — iteration rhythm', () => {
  it('rewards 3-15 edit-test cycles', () => {
    const out = gradeSession({ ...baseline, editTestCycles: 8 });
    expect(out.dimensions.E_iteration_rhythm.score).toBe(5);
  });
  it('penalises one-shot submissions', () => {
    const out = gradeSession({ ...baseline, editTestCycles: 0 });
    expect(out.dimensions.E_iteration_rhythm.score).toBe(1);
  });
});

describe('gradeSession dimension F — self correction', () => {
  it('rewards catching all seeded errors', () => {
    const out = gradeSession({
      ...baseline,
      seededErrorsCaught: 3,
      seededErrorsTotal: 3,
    });
    expect(out.dimensions.F_self_correction.score).toBe(5);
  });
  it('penalises catching none', () => {
    const out = gradeSession({
      ...baseline,
      seededErrorsCaught: 0,
      seededErrorsTotal: 3,
    });
    expect(out.dimensions.F_self_correction.score).toBe(1);
  });
  it('returns neutral when no errors were seeded', () => {
    const out = gradeSession({
      ...baseline,
      seededErrorsCaught: 0,
      seededErrorsTotal: 0,
    });
    expect(out.dimensions.F_self_correction.score).toBe(3);
  });
});

describe('gradeSession aggregation', () => {
  it('produces a weighted total in 0-5 + percentage in 0-100', () => {
    const out = gradeSession(baseline);
    expect(out.weightedTotal).toBeGreaterThan(0);
    expect(out.weightedTotal).toBeLessThanOrEqual(5);
    expect(out.percentage).toBeGreaterThan(0);
    expect(out.percentage).toBeLessThanOrEqual(100);
  });

  it('respects custom weights', () => {
    const out = gradeSession(baseline, {
      ...DEFAULT_WEIGHTS,
      A_final_code_quality: 0.5,
      B_acceptance_discipline: 0.0,
      C_rejection_discipline: 0.5,
      D_question_asking: 0,
      E_iteration_rhythm: 0,
      F_self_correction: 0,
    });
    expect(out.weightedTotal).toBeCloseTo(
      out.dimensions.A_final_code_quality.score * 0.5 +
        out.dimensions.C_rejection_discipline.score * 0.5,
      5,
    );
  });

  it('every dimension carries reasoning text', () => {
    const out = gradeSession(baseline);
    for (const dim of Object.values(out.dimensions)) {
      expect(dim.reasoning.length).toBeGreaterThan(0);
    }
  });
});
