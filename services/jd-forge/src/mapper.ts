/**
 * Stage 2 — Role-graph mapping per spec §3.2.
 *
 * Maps each JD-extracted skill name to a canonical QOrium `content.sub_skills`
 * row. Spec calls for embedding cosine ≥0.8; v0 ships a string-similarity
 * fallback (Dice coefficient over character bigrams). Real embeddings are
 * gated on a vector store + embedding API budget — see
 * `infra/CTO-deltas/CTO-DELTA-jdforge-embeddings-deferred.md`.
 *
 * The interface is kept narrow so a real embedding-backed implementation can
 * drop in without touching the orchestrator.
 */

import type { MappedSkill, RoleGraphMapping, SkillExtract } from './types.js';

export interface CanonicalSubSkill {
  id: string;
  name: string;
  /** Optional alias list pulled from `content.sub_skills.aliases` (future schema). */
  aliases?: readonly string[];
}

export interface RoleGraphMapper {
  readonly id: string;
  match(skill: string): Promise<{
    subSkillId: string | null;
    score: number;
    matchKind: MappedSkill['matchKind'];
  }>;
}

const ACCEPT_THRESHOLD = 0.55; // String-similarity acceptance floor (~ moderate Dice score)

/**
 * In-memory mapper backed by a list of canonical sub-skills loaded from the
 * caller. Used in tests + dev when no Postgres is available.
 */
export class StringMatchRoleGraphMapper implements RoleGraphMapper {
  readonly id = 'string-match';
  private readonly entries: ReadonlyArray<{ id: string; tokens: string[]; raw: string }>;

  constructor(canonical: readonly CanonicalSubSkill[]) {
    this.entries = canonical.map((c) => ({
      id: c.id,
      raw: c.name,
      tokens: bigrams(normalise(c.name + ' ' + (c.aliases ?? []).join(' '))),
    }));
  }

  async match(
    skill: string,
  ): Promise<{ subSkillId: string | null; score: number; matchKind: MappedSkill['matchKind'] }> {
    if (typeof skill !== 'string' || skill.trim().length === 0) {
      return { subSkillId: null, score: 0, matchKind: 'unmapped' };
    }
    const candidate = bigrams(normalise(skill));
    if (candidate.length === 0 || this.entries.length === 0) {
      return { subSkillId: null, score: 0, matchKind: 'unmapped' };
    }
    let best: { id: string; score: number } | null = null;
    for (const entry of this.entries) {
      const score = diceCoefficient(candidate, entry.tokens);
      if (best === null || score > best.score) {
        best = { id: entry.id, score };
      }
    }
    if (!best || best.score < ACCEPT_THRESHOLD) {
      return { subSkillId: null, score: best?.score ?? 0, matchKind: 'unmapped' };
    }
    return { subSkillId: best.id, score: best.score, matchKind: 'fuzzy' };
  }
}

export async function mapJdSkills(
  mapper: RoleGraphMapper,
  required: readonly SkillExtract[],
  niceToHave: readonly SkillExtract[],
): Promise<RoleGraphMapping> {
  const mappedRequired: MappedSkill[] = [];
  const unmappedRequired: MappedSkill[] = [];
  for (const s of required) {
    const m = await mapper.match(s.skill);
    const entry: MappedSkill = {
      source: s.skill,
      weight: s.weight,
      subSkillId: m.subSkillId,
      matchScore: m.score,
      matchKind: m.matchKind,
    };
    if (m.subSkillId === null) unmappedRequired.push(entry);
    else mappedRequired.push(entry);
  }
  const mappedNice: MappedSkill[] = [];
  for (const s of niceToHave) {
    const m = await mapper.match(s.skill);
    mappedNice.push({
      source: s.skill,
      weight: s.weight,
      subSkillId: m.subSkillId,
      matchScore: m.score,
      matchKind: m.matchKind,
    });
  }
  return { required: mappedRequired, niceToHave: mappedNice, unmappedRequired };
}

function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function bigrams(s: string): string[] {
  if (s.length < 2) return [s];
  const out: string[] = [];
  for (let i = 0; i + 2 <= s.length; i++) out.push(s.slice(i, i + 2));
  return out;
}

function diceCoefficient(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const counts = new Map<string, number>();
  for (const t of a) counts.set(t, (counts.get(t) ?? 0) + 1);
  let intersection = 0;
  for (const t of b) {
    const c = counts.get(t) ?? 0;
    if (c > 0) {
      intersection++;
      counts.set(t, c - 1);
    }
  }
  return (2 * intersection) / (a.length + b.length);
}
