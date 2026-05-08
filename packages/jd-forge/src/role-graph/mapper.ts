/**
 * Role-graph mapper — maps free-text skills (from LLM JD parse) to
 * canonical QOrium sub-skill IDs.
 *
 * The canonical sub-skill IDs are the same ones used in the question
 * library (QOR-PYTHON-001 → 'senior-python-001'-style). This mapper is
 * deterministic + lookup-driven so we can test without an LLM.
 *
 * Real production catalog will be sourced from `governance/skill-graph.json`
 * once that ships; for the alpha we ship a starter map of the 8 sub-skills
 * that have full Wave-1 coverage at 100/100.
 */

import type { ParsedJobDescription, SkillRequirement } from '../types.js';

interface SkillMatcher {
  canonical: string;
  sub_skill_prefix: string;
  /** Patterns are case-insensitive; first match wins. */
  patterns: RegExp[];
}

const STARTER_CATALOG: SkillMatcher[] = [
  {
    canonical: 'Senior Java',
    sub_skill_prefix: 'senior-java',
    patterns: [
      /\bjava\b/i,
      /\bspring\s*(boot|framework)\b/i,
      /\bjvm\b/i,
      /\bvirtual\s*threads?\b/i,
    ],
  },
  {
    canonical: 'Senior Python',
    sub_skill_prefix: 'senior-python',
    patterns: [/\bpython\b/i, /\bfastapi\b/i, /\bdjango\b/i, /\bflask\b/i, /\bpydantic\b/i],
  },
  {
    canonical: 'Senior React',
    sub_skill_prefix: 'senior-react',
    patterns: [/\breact\b/i, /\bnext\.?js\b/i, /\blwc\b/i],
  },
  {
    canonical: 'Senior SQL/Data',
    sub_skill_prefix: 'senior-sqldata',
    patterns: [
      /\bsql\b/i,
      /\bpostgres(ql)?\b/i,
      /\bsnowflake\b/i,
      /\bbigquery\b/i,
      /\bdbt\b/i,
      /\bdata engineering\b/i,
    ],
  },
  {
    canonical: 'Senior DevOps/SRE',
    sub_skill_prefix: 'senior-devops',
    patterns: [
      /\bdevops\b/i,
      /\bsre\b/i,
      /\bkubernetes|k8s\b/i,
      /\bterraform\b/i,
      /\bargo\s*cd\b/i,
    ],
  },
  {
    canonical: 'Senior Salesforce',
    sub_skill_prefix: 'senior-sf',
    patterns: [/\bsalesforce\b/i, /\bapex\b/i, /\bsoql\b/i, /\blwc\b/i, /\bplatform events\b/i],
  },
  {
    canonical: 'Senior AWS',
    sub_skill_prefix: 'senior-aws',
    patterns: [/\baws\b/i, /\blambda\b/i, /\bs3\b/i, /\bdynamodb\b/i, /\beks\b/i, /\becs\b/i],
  },
  {
    canonical: 'Senior AI Prompt Engineering',
    sub_skill_prefix: 'ai-prompt-engineer-senior',
    patterns: [
      /\bllm\b/i,
      /\bprompt engineer/i,
      /\brag\b/i,
      /\banthropic\b/i,
      /\bclaude\b/i,
      /\bopen\s*ai|gpt-?[0-9]/i,
    ],
  },
];

export interface SkillMatch {
  /** Original skill string from the JD parse. */
  source_skill: string;
  /** Source weight (0..1) carried through. */
  source_weight: number;
  /** Canonical sub-skill prefix; null = unmapped (gap report). */
  matched_prefix: string | null;
  matched_canonical: string | null;
}

/**
 * Pure: maps a single SkillRequirement to a SkillMatch.
 * Returns matched_prefix=null when no pattern matches (caller may decide
 * to fail or to accept partial coverage).
 */
export function matchSingleSkill(req: SkillRequirement): SkillMatch {
  for (const entry of STARTER_CATALOG) {
    if (entry.patterns.some((p) => p.test(req.skill))) {
      return {
        source_skill: req.skill,
        source_weight: req.weight,
        matched_prefix: entry.sub_skill_prefix,
        matched_canonical: entry.canonical,
      };
    }
  }
  return {
    source_skill: req.skill,
    source_weight: req.weight,
    matched_prefix: null,
    matched_canonical: null,
  };
}

export interface MappingResult {
  matched: SkillMatch[];
  unmatched: SkillMatch[];
  /** Coverage = matched.length / total. Below 0.5 caller should escalate. */
  coverage: number;
  /** Top sub-skill prefixes by total source weight (deduped). */
  top_prefixes: Array<{ prefix: string; total_weight: number; canonical: string }>;
}

/**
 * Map an entire ParsedJobDescription to top sub-skill prefixes for
 * generation. Unmatched skills are surfaced in `unmatched` so the caller
 * (and the SME-review tier later) can decide how to extend the catalog.
 */
export function mapRoleToSubSkills(jd: ParsedJobDescription): MappingResult {
  const all = [...jd.required_skills, ...jd.nice_to_have_skills];
  const matched: SkillMatch[] = [];
  const unmatched: SkillMatch[] = [];
  for (const req of all) {
    const m = matchSingleSkill(req);
    if (m.matched_prefix) matched.push(m);
    else unmatched.push(m);
  }
  const coverage = all.length > 0 ? matched.length / all.length : 0;

  // Aggregate weights per prefix
  const byPrefix = new Map<string, { total_weight: number; canonical: string }>();
  for (const m of matched) {
    const key = m.matched_prefix!;
    const cur = byPrefix.get(key);
    if (cur) {
      cur.total_weight += m.source_weight;
    } else {
      byPrefix.set(key, { total_weight: m.source_weight, canonical: m.matched_canonical! });
    }
  }
  const top_prefixes = [...byPrefix.entries()]
    .map(([prefix, v]) => ({ prefix, total_weight: v.total_weight, canonical: v.canonical }))
    .sort((a, b) => b.total_weight - a.total_weight);

  return { matched, unmatched, coverage, top_prefixes };
}
