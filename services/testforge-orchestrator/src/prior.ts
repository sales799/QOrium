/**
 * Pre-calibration AI prior per `governance/TestForge-QA-Pipeline-v1.md` §3.2:
 *
 * > For every newly accepted question, AI sets initial difficulty_b prior
 * > based on similar items in library
 * > Algorithm: nearest-neighbor by (skill, sub_skill, format) on items
 * > with N≥30; weighted by IRT discrimination
 *
 * Pure logic. The repository hands a fresh question + the candidate
 * neighbour set; this module returns the prior parameters, or `null` when
 * no neighbour is good enough to source a prior (in which case the
 * orchestrator falls back to a per-format default).
 */

import { defaultGuessingForFormat } from './format-defaults.js';

export interface NeighbourCandidate {
  id: string;
  skillId: string | null;
  subSkillId: string | null;
  format: string;
  difficultyB: number | null;
  discriminationA: number | null;
  guessingC: number | null;
  calibrationN: number;
}

export interface NewlyAcceptedQuestion {
  id: string;
  skillId: string | null;
  subSkillId: string | null;
  format: string;
}

export interface PriorEstimate {
  difficultyB: number;
  discriminationA: number;
  guessingC: number;
  source: 'neighbour' | 'format_default';
  neighbourCount: number;
  /** Per-format median `difficulty_b` if available, else 0. */
  fallbackDifficultyB: number;
}

const MIN_N_FOR_NEIGHBOUR = 30;

export function selectNeighbours(
  question: NewlyAcceptedQuestion,
  candidates: readonly NeighbourCandidate[],
): NeighbourCandidate[] {
  return candidates.filter(
    (c) =>
      c.calibrationN >= MIN_N_FOR_NEIGHBOUR &&
      c.format === question.format &&
      c.skillId === question.skillId &&
      c.subSkillId === question.subSkillId &&
      c.difficultyB !== null &&
      c.discriminationA !== null,
  );
}

/**
 * Compute the prior. If no eligible neighbours exist (calibrationN >= 30,
 * matching skill/sub_skill/format), fall back to format defaults
 * (b=0, a=1, c per format). The neighbours are weighted by their
 * discrimination parameter — high-discrimination items contribute more.
 */
export function computePrior(
  question: NewlyAcceptedQuestion,
  candidates: readonly NeighbourCandidate[],
): PriorEstimate {
  const neighbours = selectNeighbours(question, candidates);
  if (neighbours.length === 0) {
    return {
      difficultyB: 0,
      discriminationA: 1.0,
      guessingC: defaultGuessingForFormat(question.format),
      source: 'format_default',
      neighbourCount: 0,
      fallbackDifficultyB: 0,
    };
  }

  let totalWeight = 0;
  let weightedB = 0;
  let weightedA = 0;
  let weightedC = 0;
  for (const n of neighbours) {
    const weight = n.discriminationA ?? 1.0;
    totalWeight += weight;
    weightedB += weight * (n.difficultyB ?? 0);
    weightedA += weight * (n.discriminationA ?? 1.0);
    weightedC += weight * (n.guessingC ?? defaultGuessingForFormat(question.format));
  }

  const safeWeight = totalWeight > 0 ? totalWeight : 1;
  const fallbackB = median(neighbours.map((n) => n.difficultyB ?? 0));

  return {
    difficultyB: round(weightedB / safeWeight, 3),
    discriminationA: round(weightedA / safeWeight, 3),
    guessingC: round(weightedC / safeWeight, 3),
    source: 'neighbour',
    neighbourCount: neighbours.length,
    fallbackDifficultyB: fallbackB,
  };
}

function round(v: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
  }
  return sorted[mid] ?? 0;
}
