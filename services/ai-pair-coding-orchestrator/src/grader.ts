/**
 * Six-dimension grader for the Wave 3 AI pair-coding format per
 * `infra/Wave-3-AI-Pair-Coding-Format-Prototype-Spec-v0.md` §2.4.
 *
 * Pure logic. Inputs are the captured session signals + the message
 * log; outputs are dimension-by-dimension scores with auditable
 * reasoning. SME Lead reviews these alongside the final code.
 */

export type DimensionKey =
  | 'A_final_code_quality'
  | 'B_acceptance_discipline'
  | 'C_rejection_discipline'
  | 'D_question_asking'
  | 'E_iteration_rhythm'
  | 'F_self_correction';

export interface DimensionWeights {
  A_final_code_quality: number; // default 0.30
  B_acceptance_discipline: number; // 0.20
  C_rejection_discipline: number; // 0.15
  D_question_asking: number; // 0.15
  E_iteration_rhythm: number; // 0.10
  F_self_correction: number; // 0.10
}

export const DEFAULT_WEIGHTS: DimensionWeights = {
  A_final_code_quality: 0.3,
  B_acceptance_discipline: 0.2,
  C_rejection_discipline: 0.15,
  D_question_asking: 0.15,
  E_iteration_rhythm: 0.1,
  F_self_correction: 0.1,
};

export interface SessionSignals {
  /** Total characters typed by the candidate. */
  typedChars: number;
  /** Total characters pasted (likely from AI suggestions). */
  pastedChars: number;
  /** Number of edit→test cycles (compile/run events). */
  editTestCycles: number;
  /** Total messages from the candidate to the AI. */
  candidateMessageCount: number;
  /** Total AI suggestions accepted verbatim. */
  acceptedVerbatimCount: number;
  /** Total AI suggestions accepted with modifications. */
  acceptedModifiedCount: number;
  /** Total AI suggestions rejected. */
  rejectedCount: number;
  /** Total seeded AI errors caught by the candidate (per spec §3.3). */
  seededErrorsCaught: number;
  /** Total seeded AI errors injected. */
  seededErrorsTotal: number;
  /** Final code quality score (1-5) supplied by the standard code grader. */
  codeQualityScore: number;
  /** Time (seconds) before the candidate first typed in the editor. */
  timeToFirstCodeSec: number;
  /** Total session duration (seconds). */
  durationSec: number;
}

export interface DimensionScore {
  key: DimensionKey;
  /** 0–5 scale per spec §2.4 */
  score: number;
  reasoning: string;
}

export interface GraderOutput {
  dimensions: Record<DimensionKey, DimensionScore>;
  /** Weighted total in 0–5. */
  weightedTotal: number;
  /** Same value as a 0–100 percentage for easy reading. */
  percentage: number;
}

export function gradeSession(
  signals: SessionSignals,
  weights: DimensionWeights = DEFAULT_WEIGHTS,
): GraderOutput {
  const A = gradeFinalCode(signals);
  const B = gradeAcceptance(signals);
  const C = gradeRejection(signals);
  const D = gradeQuestionAsking(signals);
  const E = gradeIteration(signals);
  const F = gradeSelfCorrection(signals);
  const dims = {
    A_final_code_quality: A,
    B_acceptance_discipline: B,
    C_rejection_discipline: C,
    D_question_asking: D,
    E_iteration_rhythm: E,
    F_self_correction: F,
  } satisfies Record<DimensionKey, DimensionScore>;
  const weightedTotal =
    A.score * weights.A_final_code_quality +
    B.score * weights.B_acceptance_discipline +
    C.score * weights.C_rejection_discipline +
    D.score * weights.D_question_asking +
    E.score * weights.E_iteration_rhythm +
    F.score * weights.F_self_correction;
  const percentage = (weightedTotal / 5) * 100;
  return { dimensions: dims, weightedTotal, percentage };
}

function gradeFinalCode(s: SessionSignals): DimensionScore {
  const score = clamp(s.codeQualityScore, 0, 5);
  return {
    key: 'A_final_code_quality',
    score,
    reasoning: `code grader returned ${score}/5`,
  };
}

function gradeAcceptance(s: SessionSignals): DimensionScore {
  const totalChars = s.typedChars + s.pastedChars;
  const pasteRatio = totalChars === 0 ? 0 : s.pastedChars / totalChars;
  // Spec §2.4 B: very high paste = paste-and-submit (low score); modest paste with modification = high score
  const acceptedTotal = s.acceptedVerbatimCount + s.acceptedModifiedCount;
  const modifiedRatio = acceptedTotal === 0 ? 0 : s.acceptedModifiedCount / acceptedTotal;
  let score = 3;
  if (pasteRatio > 0.85)
    score = 1; // paste-and-submit
  else if (pasteRatio > 0.6 && modifiedRatio < 0.2) score = 2;
  else if (pasteRatio < 0.5 && modifiedRatio > 0.4) score = 5;
  else if (pasteRatio < 0.5 && modifiedRatio > 0.2) score = 4;
  return {
    key: 'B_acceptance_discipline',
    score,
    reasoning: `paste_ratio=${pasteRatio.toFixed(2)} modified_ratio=${modifiedRatio.toFixed(2)}`,
  };
}

function gradeRejection(s: SessionSignals): DimensionScore {
  const decisions = s.acceptedVerbatimCount + s.acceptedModifiedCount + s.rejectedCount;
  if (decisions === 0) {
    return {
      key: 'C_rejection_discipline',
      score: 3,
      reasoning: 'no AI suggestions to evaluate',
    };
  }
  const rejectionRatio = s.rejectedCount / decisions;
  // Healthy rejection rate is 10–40%; too low = rubber-stamping; too high = ignoring useful help
  let score = 3;
  if (rejectionRatio >= 0.1 && rejectionRatio <= 0.4) score = 5;
  else if (rejectionRatio < 0.05) score = 2;
  else if (rejectionRatio > 0.7) score = 2;
  else score = 4;
  return {
    key: 'C_rejection_discipline',
    score,
    reasoning: `rejection_ratio=${rejectionRatio.toFixed(2)}`,
  };
}

function gradeQuestionAsking(s: SessionSignals): DimensionScore {
  // Healthy candidates ask 3-12 clarifying questions in a 30-min session
  let score = 3;
  if (s.candidateMessageCount === 0) score = 1;
  else if (s.candidateMessageCount < 2) score = 2;
  else if (s.candidateMessageCount >= 3 && s.candidateMessageCount <= 12) score = 5;
  else if (s.candidateMessageCount > 25)
    score = 2; // chatty noise
  else score = 4;
  return {
    key: 'D_question_asking',
    score,
    reasoning: `candidate_messages=${s.candidateMessageCount}`,
  };
}

function gradeIteration(s: SessionSignals): DimensionScore {
  // 3-15 edit-test cycles is healthy in 30 minutes
  let score = 3;
  if (s.editTestCycles === 0) score = 1;
  else if (s.editTestCycles < 2) score = 2;
  else if (s.editTestCycles >= 3 && s.editTestCycles <= 15) score = 5;
  else if (s.editTestCycles > 25)
    score = 3; // thrashing
  else score = 4;
  return {
    key: 'E_iteration_rhythm',
    score,
    reasoning: `edit_test_cycles=${s.editTestCycles}`,
  };
}

function gradeSelfCorrection(s: SessionSignals): DimensionScore {
  if (s.seededErrorsTotal === 0) {
    return {
      key: 'F_self_correction',
      score: 3,
      reasoning: 'no seeded errors injected (cannot evaluate)',
    };
  }
  const detectionRate = s.seededErrorsCaught / s.seededErrorsTotal;
  const score = Math.round(1 + 4 * clamp(detectionRate, 0, 1));
  return {
    key: 'F_self_correction',
    score,
    reasoning: `caught ${s.seededErrorsCaught}/${s.seededErrorsTotal} seeded errors`,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
