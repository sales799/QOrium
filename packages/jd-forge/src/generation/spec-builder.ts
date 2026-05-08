/**
 * Generation spec builder — turns a JD-mapping result into the
 * per-question generation plan the LLM will execute.
 *
 * Per JD-Forge spec §3.3 — distribution constants and the sub-skill
 * weighting algorithm:
 *
 *   default N=20 → 8 MCQ + 6 code + 4 design-or-SJT + 2 case-study
 *
 * "code" splits 50/50 between coding-fn and coding-project; "design-or-SJT"
 * splits according to role family (engineering → design, ops/sales/etc → SJT).
 * Case study is the residual.
 *
 * Difficulty distribution per the v0.6 schema is 3 Easy / 9 Medium /
 * 6 Hard / 2 Very Hard at N=20; we map difficulty bands to IRT b targets:
 *   easy:      b ≈ -1.5
 *   medium:    b ≈ +0.0
 *   hard:      b ≈ +1.0
 *   very-hard: b ≈ +1.6
 *
 * Pure function — no LLM, no I/O. Tests are math-only.
 */

import type { GenerationSpec, QuestionFormat, QuestionSpec, RoleFamily } from '../types.js';
import type { MappingResult } from '../role-graph/mapper.js';

interface BuildOpts {
  total?: number;
  /** Override the role family for design-vs-SJT mix; defaults to inputs. */
  roleFamily?: RoleFamily;
  /** Deterministic seed for picking sub-skill order in ties. */
  seed?: string;
}

const DEFAULT_TOTAL = 20;

/**
 * Distribution constants per spec §3.3 — driven by total N.
 * Returns the count for each major bucket.
 */
function distributeByFormat(total: number): {
  mcq: number;
  code: number;
  designOrSjt: number;
  casestudy: number;
} {
  // Tiebreak to ensure sum === total.
  const mcq = Math.round(total * 0.4);
  const code = Math.round(total * 0.3);
  const casestudy = Math.max(1, Math.round(total * 0.1));
  const designOrSjt = total - mcq - code - casestudy;
  return { mcq, code, designOrSjt, casestudy };
}

const DIFFICULTY_DIST: Array<{
  band: 'easy' | 'medium' | 'hard' | 'vhard';
  b: number;
  pct: number;
}> = [
  { band: 'easy', b: -1.5, pct: 0.15 },
  { band: 'medium', b: 0.0, pct: 0.45 },
  { band: 'hard', b: 1.0, pct: 0.3 },
  { band: 'vhard', b: 1.6, pct: 0.1 },
];

function distributeBySubSkill(
  topPrefixes: ReadonlyArray<{ prefix: string; total_weight: number }>,
  total: number,
): Array<{ sub_skill_id: string; count: number }> {
  if (topPrefixes.length === 0) {
    // Default to a single bucket when mapping coverage is empty
    return [{ sub_skill_id: 'unmapped', count: total }];
  }
  // Cap at top 5 prefixes; over-fanning out hurts question coherence per spec.
  const top = topPrefixes.slice(0, 5);
  const totalWeight = top.reduce((acc, p) => acc + p.total_weight, 0);
  const raw = top.map((p) => ({
    sub_skill_id: p.prefix,
    weight: p.total_weight / totalWeight,
  }));
  // Largest-remainder method to make counts sum exactly to `total`.
  const fractional = raw.map((r) => ({ id: r.sub_skill_id, exact: r.weight * total }));
  const floors = fractional.map((r) => ({
    id: r.id,
    count: Math.floor(r.exact),
    frac: r.exact - Math.floor(r.exact),
  }));
  const used = floors.reduce((a, b) => a + b.count, 0);
  let remainder = total - used;
  // Distribute remainder by largest fractional part.
  floors.sort((a, b) => b.frac - a.frac);
  for (let i = 0; remainder > 0 && i < floors.length; i++, remainder--) {
    floors[i]!.count++;
  }
  // Re-sort by id-stability for determinism in tests.
  return floors
    .filter((f) => f.count > 0)
    .map((f) => ({ sub_skill_id: f.id, count: f.count }))
    .sort((a, b) => a.sub_skill_id.localeCompare(b.sub_skill_id));
}

/**
 * Build a per-question generation spec.
 */
export function buildGenerationSpec(
  mapping: MappingResult,
  jdMeta: { roleFamily: RoleFamily },
  opts: BuildOpts = {},
): GenerationSpec {
  const total = opts.total ?? DEFAULT_TOTAL;
  if (total < 4 || total > 100) {
    throw new Error(`total must be in [4, 100]; got ${total}`);
  }
  const family = opts.roleFamily ?? jdMeta.roleFamily;

  const fmt = distributeByFormat(total);
  const designVsSjt: { design: number; sjt: number } =
    family === 'engineering' || family === 'data'
      ? { design: fmt.designOrSjt, sjt: 0 }
      : family === 'design' || family === 'product'
        ? { design: fmt.designOrSjt, sjt: 0 }
        : { design: 0, sjt: fmt.designOrSjt };

  const codingFn = Math.ceil(fmt.code / 2);
  const codingProject = fmt.code - codingFn;

  const by_format: Array<{ format: QuestionFormat; count: number }> = [
    { format: 'mcq', count: fmt.mcq },
    ...(codingFn > 0 ? [{ format: 'coding-fn' as QuestionFormat, count: codingFn }] : []),
    ...(codingProject > 0
      ? [{ format: 'coding-project' as QuestionFormat, count: codingProject }]
      : []),
    ...(designVsSjt.design > 0
      ? [{ format: 'design' as QuestionFormat, count: designVsSjt.design }]
      : []),
    ...(designVsSjt.sjt > 0 ? [{ format: 'sjt' as QuestionFormat, count: designVsSjt.sjt }] : []),
    ...(fmt.casestudy > 0 ? [{ format: 'casestudy' as QuestionFormat, count: fmt.casestudy }] : []),
  ];

  const by_sub_skill = distributeBySubSkill(mapping.top_prefixes, total);

  // Per-question specs: round-robin assignment of sub-skill × format ×
  // difficulty band so the resulting spec is roughly balanced.
  const flatFormats: QuestionFormat[] = [];
  for (const f of by_format) {
    for (let i = 0; i < f.count; i++) flatFormats.push(f.format);
  }
  const flatSubSkills: string[] = [];
  for (const s of by_sub_skill) {
    for (let i = 0; i < s.count; i++) flatSubSkills.push(s.sub_skill_id);
  }
  const flatDifficulties: number[] = [];
  for (const d of DIFFICULTY_DIST) {
    const c = Math.round(d.pct * total);
    for (let i = 0; i < c; i++) flatDifficulties.push(d.b);
  }
  while (flatDifficulties.length < total) flatDifficulties.push(DIFFICULTY_DIST[1]!.b);
  while (flatDifficulties.length > total) flatDifficulties.pop();

  const questions: QuestionSpec[] = [];
  for (let i = 0; i < total; i++) {
    questions.push({
      sub_skill_id: flatSubSkills[i] ?? flatSubSkills[flatSubSkills.length - 1] ?? 'unmapped',
      format: flatFormats[i] ?? 'mcq',
      difficulty_b: flatDifficulties[i] ?? 0,
    });
  }

  return { total, by_sub_skill, by_format, questions };
}
