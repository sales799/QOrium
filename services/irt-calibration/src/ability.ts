/**
 * Candidate ability proxy estimation per IRT-Calibration-Pipeline-v0-Spec
 * §4 stage 3: "Ability estimation: Estimate candidate ability θ for each
 * reference panelist (can use sum of correct answers as proxy; refine later
 * with IRT-based ability estimation)."
 *
 * v0 implements the spec's proxy: standardise per-candidate proportion-correct
 * to a z-score across the cohort. Mean 0, sd 1 — matches the assumed θ
 * distribution in §2.
 */

export interface CandidateScoreInput {
  candidateId: string;
  attempts: number;
  correct: number;
}

export interface AbilityEstimate {
  candidateId: string;
  theta: number;
  proportionCorrect: number;
  attempts: number;
}

/**
 * Returns θ ≈ z-score of (correct / attempts) across the cohort. Candidates
 * with `attempts === 0` are excluded.
 *
 * If the cohort has no variance (all proportions equal — e.g., everyone got
 * everything right), every candidate is assigned θ = 0; downstream MLE will
 * detect this and flag the question as `extreme_pass_rate`.
 */
export function estimateAbilities(input: readonly CandidateScoreInput[]): AbilityEstimate[] {
  const usable = input.filter((c) => c.attempts > 0);
  if (usable.length === 0) return [];

  const proportions = usable.map((c) => c.correct / c.attempts);
  const mean = proportions.reduce((a, b) => a + b, 0) / proportions.length;
  const variance =
    proportions.reduce((s, p) => s + (p - mean) * (p - mean), 0) / proportions.length;
  const sd = Math.sqrt(variance);

  return usable.map((c, i) => {
    const proportionCorrect = proportions[i] ?? 0;
    const theta = sd === 0 ? 0 : (proportionCorrect - mean) / sd;
    return {
      candidateId: c.candidateId,
      theta,
      proportionCorrect,
      attempts: c.attempts,
    };
  });
}

/**
 * Convenience: collapse a heterogeneous response set (one row per candidate
 * per question) into per-candidate `(attempts, correct)` and run
 * `estimateAbilities`. `correctPredicate` lets the caller decide what counts
 * as "correct" for non-binary scores — e.g., `score >= 80` for partial-credit
 * formats.
 */
export interface RawResponseRow {
  candidateId: string;
  questionId: string;
  score: number | null;
}

export function abilitiesFromResponses(
  rows: readonly RawResponseRow[],
  correctPredicate: (score: number | null) => boolean = (s) => s !== null && s >= 50,
): AbilityEstimate[] {
  const aggregate = new Map<string, { attempts: number; correct: number }>();
  for (const row of rows) {
    const cur = aggregate.get(row.candidateId) ?? { attempts: 0, correct: 0 };
    cur.attempts += 1;
    if (correctPredicate(row.score)) cur.correct += 1;
    aggregate.set(row.candidateId, cur);
  }
  return estimateAbilities(
    Array.from(aggregate.entries()).map(([candidateId, v]) => ({
      candidateId,
      attempts: v.attempts,
      correct: v.correct,
    })),
  );
}
