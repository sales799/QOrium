/**
 * Public Question response shape returned by /v1/questions/* endpoints.
 *
 * Distinct from the database row (`content.questions`):
 *  - `uuid` (the public identifier; renamed from `id` for API stability)
 *  - `difficulty_band` (1–5 derived from IRT `difficulty_b`); raw IRT
 *    parameters are kept for clients that want them
 *  - Excludes internal fields (`watermark_id`, `ai_critique_scores`,
 *    `parent_question_id`, `source_corpus`, `sme_validated_by`)
 *  - `body_json` returned as-is (format-specific structure)
 *
 * Architecture §3 specifies a 1–5 difficulty scale (Easy → Expert) anchored
 * to QOrium's reference exemplars. Mapping from IRT b parameter:
 *   1 (Easy)        b ∈ [-4.0, -2.4)
 *   2 (Foundational) b ∈ [-2.4, -0.8)
 *   3 (Proficient)  b ∈ [-0.8,  0.8)
 *   4 (Advanced)    b ∈ [ 0.8,  2.4)
 *   5 (Expert)      b ∈ [ 2.4,  4.0]
 * Uncalibrated items (NULL b) report `difficulty_band: null`.
 */

export type DifficultyBand = 1 | 2 | 3 | 4 | 5;

export interface QuestionPublic {
  uuid: string;
  sku: 'readybank' | 'jd-forge' | 'stack-vault';
  format: string;
  language: string;
  status: string;
  skill_id: string | null;
  sub_skill_id: string | null;
  body_md: string;
  body_json: Record<string, unknown>;
  rubric: Record<string, unknown> | null;
  reference_solution: Record<string, unknown> | null;
  test_cases: Record<string, unknown> | null;
  difficulty_band: DifficultyBand | null;
  difficulty_b: number | null;
  discrimination_a: number | null;
  empirical_pass_rate: number | null;
  released_at: string | null;
  created_at: string;
}

const BAND_BOUNDARIES: ReadonlyArray<readonly [number, DifficultyBand]> = [
  [-2.4, 1],
  [-0.8, 2],
  [0.8, 3],
  [2.4, 4],
];

export function difficultyBToBand(b: number | null): DifficultyBand | null {
  if (b === null || Number.isNaN(b)) return null;
  for (const [upper, band] of BAND_BOUNDARIES) {
    if (b < upper) return band;
  }
  return 5;
}

/** Inverse: band → IRT b range used to translate user input into a SQL filter. */
export function bandToBRange(band: DifficultyBand): { min: number; maxExclusive: number } {
  switch (band) {
    case 1:
      return { min: -4.0, maxExclusive: -2.4 };
    case 2:
      return { min: -2.4, maxExclusive: -0.8 };
    case 3:
      return { min: -0.8, maxExclusive: 0.8 };
    case 4:
      return { min: 0.8, maxExclusive: 2.4 };
    case 5:
      return { min: 2.4, maxExclusive: 4.001 };
  }
}
