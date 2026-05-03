/**
 * Stage 3 — Spec generation per JD-Forge-v0-Design.md §3.3.
 *
 *   - 20 total questions per JD (configurable)
 *   - Format distribution: 8 MCQ + 6 coding + 3 design + 2 case-study + 1 SJT
 *   - Difficulty split: 3 Easy + 8 Medium + 7 Hard + 2 Expert
 *   - Per required-skill: 1–2 questions; per nice-to-have: 0–1
 *
 * Pure logic — deterministic given the same mapping input.
 */

import type {
  DifficultyBand,
  MappedSkill,
  QuestionFormat,
  QuestionSpec,
  QuestionSpecItem,
  RoleGraphMapping,
} from './types.js';

const DEFAULT_TOTAL = 20;

const FORMAT_DISTRIBUTION: ReadonlyArray<{ format: QuestionFormat; share: number }> = [
  { format: 'mcq', share: 8 / 20 },
  { format: 'coding', share: 6 / 20 },
  { format: 'design', share: 3 / 20 },
  { format: 'casestudy', share: 2 / 20 },
  { format: 'sjt', share: 1 / 20 },
];

const DIFFICULTY_DISTRIBUTION: ReadonlyArray<{ difficulty: DifficultyBand; share: number }> = [
  { difficulty: 'easy', share: 3 / 20 },
  { difficulty: 'medium', share: 8 / 20 },
  { difficulty: 'hard', share: 7 / 20 },
  { difficulty: 'expert', share: 2 / 20 },
];

export interface BuildSpecOptions {
  totalQuestions?: number;
}

export function buildSpec(mapping: RoleGraphMapping, opts: BuildSpecOptions = {}): QuestionSpec {
  const total = clampTotal(opts.totalQuestions ?? DEFAULT_TOTAL);
  const skills = mergedSkillRoster(mapping);
  if (skills.length === 0) {
    return emptySpec(total);
  }

  const formatCounts = allocateCounts(total, FORMAT_DISTRIBUTION);
  const difficultyCounts = allocateCounts(total, DIFFICULTY_DISTRIBUTION);

  const items: QuestionSpecItem[] = [];

  // We deal "format slots" then "difficulty slots" round-robin across the
  // skill roster, weighted so high-weight skills get more questions. The
  // result is deterministic for a given (mapping, total).
  const skillCycle = roundRobinByWeight(skills, total);

  let idx = 0;
  const formatPool = expandPool(formatCounts);
  const difficultyPool = expandPool(difficultyCounts);

  for (const skill of skillCycle) {
    if (idx >= total) break;
    const format = formatPool[idx % formatPool.length] as QuestionFormat;
    const difficulty = difficultyPool[idx % difficultyPool.length] as DifficultyBand;
    items.push({
      format,
      difficulty,
      skillSource: skill.source,
      subSkillId: skill.subSkillId,
      weight: skill.weight,
    });
    idx++;
  }

  return {
    items,
    totalQuestions: items.length,
    formatDistribution: tally(
      items.map((i) => i.format),
      ['mcq', 'msq', 'truefalse', 'coding', 'design', 'sjt', 'casestudy'],
    ) as Record<QuestionFormat, number>,
    difficultyDistribution: tally(
      items.map((i) => i.difficulty),
      ['easy', 'medium', 'hard', 'expert'],
    ) as Record<DifficultyBand, number>,
  };
}

function clampTotal(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_TOTAL;
  if (n > 100) return 100;
  return Math.floor(n);
}

function emptySpec(_total: number): QuestionSpec {
  return {
    items: [],
    totalQuestions: 0,
    formatDistribution: tally(
      [],
      ['mcq', 'msq', 'truefalse', 'coding', 'design', 'sjt', 'casestudy'],
    ) as Record<QuestionFormat, number>,
    difficultyDistribution: tally([], ['easy', 'medium', 'hard', 'expert']) as Record<
      DifficultyBand,
      number
    >,
  };
}

function mergedSkillRoster(mapping: RoleGraphMapping): MappedSkill[] {
  // Required at full weight; nice-to-have decayed by 0.5×.
  const merged: MappedSkill[] = [...mapping.required.map((s) => ({ ...s, weight: s.weight }))];
  for (const s of mapping.niceToHave) {
    merged.push({ ...s, weight: s.weight * 0.5 });
  }
  return merged.sort((a, b) => b.weight - a.weight);
}

function allocateCounts<T extends string>(
  total: number,
  shares: ReadonlyArray<{ share: number } & Record<string, T | number>>,
): Array<{ key: T; count: number }> {
  // Largest-remainder method to get integer allocations summing to `total`.
  const provisional = shares.map((s) => ({
    key: ((s as unknown as { format?: T; difficulty?: T }).format ??
      (s as unknown as { format?: T; difficulty?: T }).difficulty) as T,
    raw: s.share * total,
    floor: Math.floor(s.share * total),
    remainder: s.share * total - Math.floor(s.share * total),
  }));
  const assigned = provisional.reduce((acc, p) => acc + p.floor, 0);
  let leftover = total - assigned;
  const sorted = [...provisional].sort((a, b) => b.remainder - a.remainder);
  for (const p of sorted) {
    if (leftover <= 0) break;
    p.floor += 1;
    leftover -= 1;
  }
  return provisional.map((p) => ({ key: p.key, count: p.floor }));
}

function expandPool<T extends string>(counts: Array<{ key: T; count: number }>): T[] {
  const out: T[] = [];
  for (const c of counts) {
    for (let i = 0; i < c.count; i++) out.push(c.key);
  }
  return out;
}

/** Round-robin over skills, repeating each skill in proportion to its weight. */
function roundRobinByWeight(skills: readonly MappedSkill[], total: number): MappedSkill[] {
  const out: MappedSkill[] = [];
  if (skills.length === 0) return out;
  const totalWeight = skills.reduce((acc, s) => acc + Math.max(s.weight, 0.1), 0);
  const allocations = skills.map((s) => ({
    skill: s,
    target: Math.max(1, Math.round((Math.max(s.weight, 0.1) / totalWeight) * total)),
  }));
  let cursor = 0;
  while (out.length < total) {
    const a = allocations[cursor % allocations.length];
    if (a && a.target > 0) {
      out.push(a.skill);
      a.target -= 1;
    }
    cursor++;
    if (allocations.every((x) => x.target <= 0)) break;
  }
  // If we under-filled (rare with integer rounding), pad with the heaviest skill.
  while (out.length < total) {
    const heaviest = skills[0];
    if (!heaviest) break;
    out.push(heaviest);
  }
  return out;
}

function tally<T extends string>(values: readonly T[], keys: readonly T[]): Record<T, number> {
  const out = {} as Record<T, number>;
  for (const k of keys) out[k] = 0;
  for (const v of values) out[v] = (out[v] ?? 0) + 1;
  return out;
}
