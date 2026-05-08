/**
 * JD-Forge types per infra/JD-Forge-v0-Design.md §3.
 */

export type Seniority = 'junior' | 'mid' | 'senior' | 'staff' | 'principal';
export type RoleFamily = 'engineering' | 'data' | 'design' | 'product' | 'sales' | 'ops' | 'other';

export interface SkillRequirement {
  skill: string;
  /** 0..1; 1.0 = explicit must-have, 0.5 = mentioned, 0.2 = nice-to-have */
  weight: number;
}

/**
 * The contract returned by the JD parser. LLM emits this; downstream
 * pure functions (role-graph mapper, spec builder) consume it.
 */
export interface ParsedJobDescription {
  role_title: string;
  role_family: RoleFamily;
  seniority: Seniority;
  required_skills: SkillRequirement[];
  nice_to_have_skills: SkillRequirement[];
  tech_stack: string[];
  domain: string;
  /** 0 means "not specified". */
  years_of_experience: number;
  must_haves: string[];
  nice_to_haves: string[];
}

/** v0.6 question formats per Constitution. */
export type QuestionFormat =
  | 'mcq'
  | 'msq'
  | 'coding-fn'
  | 'coding-project'
  | 'sql'
  | 'sjt'
  | 'design'
  | 'casestudy'
  | 'video';

export interface QuestionSpec {
  /** Stable QOrium sub-skill id (`senior-python-001`-style). */
  sub_skill_id: string;
  format: QuestionFormat;
  /** IRT b parameter target; the LLM aims here, calibration adjusts. */
  difficulty_b: number;
  /** Free-form constraint string for the LLM ("must reference asyncio TaskGroup"). */
  guidance?: string;
}

export interface GenerationSpec {
  total: number;
  /** Per-sub-skill counts; sum == total. */
  by_sub_skill: Array<{ sub_skill_id: string; count: number }>;
  /** Per-format counts; sum == total. Default: 40% MCQ / 30% code / 20% design or SJT / 10% case study (spec §3.3). */
  by_format: Array<{ format: QuestionFormat; count: number }>;
  /** Per-question generation specs (length === total). */
  questions: QuestionSpec[];
}

export interface DraftQuestion {
  qor_id: string;
  sub_skill_id: string;
  format: QuestionFormat;
  difficulty_b: number;
  body_md: string;
  body_json: Record<string, unknown>;
  watermark_seed: string;
  citations?: string[];
}
