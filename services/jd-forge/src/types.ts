/**
 * Shared types for the JD-Forge pipeline. All shapes track the spec at
 * `infra/JD-Forge-v0-Design.md` §3 (5-stage pipeline) + §5 (data model).
 */

export type Tier = 'standard' | 'reviewed' | 'enterprise';
export type ExportFormat =
  | 'json'
  | 'csv'
  | 'mettl-csv'
  | 'xlsx'
  | 'mettl-xlsx'
  | 'hackerrank-yaml'
  | 'pdf';

export type QuestionFormat =
  | 'mcq'
  | 'msq'
  | 'truefalse'
  | 'coding'
  | 'design'
  | 'sjt'
  | 'casestudy';
export type DifficultyBand = 'easy' | 'medium' | 'hard' | 'expert';

export interface SkillExtract {
  skill: string;
  weight: number; // 0–1
}

export interface ParsedJd {
  roleTitle: string;
  roleFamily: string;
  seniority: 'junior' | 'mid' | 'senior' | 'staff' | 'principal' | 'unknown';
  requiredSkills: SkillExtract[];
  niceToHaveSkills: SkillExtract[];
  techStack: string[];
  domain: string | null;
  yearsOfExperience: number | null;
  mustHaves: string[];
  niceToHaves: string[];
}

export interface MappedSkill {
  /** From the parsed JD — what the customer's JD called it. */
  source: string;
  weight: number;
  /** QOrium canonical sub-skill id, or null if no mapping above the threshold. */
  subSkillId: string | null;
  matchScore: number; // 0–1
  matchKind: 'embedding' | 'fuzzy' | 'unmapped';
}

export interface RoleGraphMapping {
  required: MappedSkill[];
  niceToHave: MappedSkill[];
  unmappedRequired: MappedSkill[];
}

export interface QuestionSpecItem {
  format: QuestionFormat;
  difficulty: DifficultyBand;
  skillSource: string;
  /** If the role-graph mapper found a canonical sub-skill, the orchestrator
   * passes it through to the generator so the LLM gets richer context. */
  subSkillId: string | null;
  /** 0–1 — used by the generator to bias prompt emphasis. */
  weight: number;
}

export interface QuestionSpec {
  items: QuestionSpecItem[];
  totalQuestions: number;
  formatDistribution: Record<QuestionFormat, number>;
  difficultyDistribution: Record<DifficultyBand, number>;
}

export interface GeneratedQuestion {
  id: string; // client-side uuid (the orchestrator persists separately)
  format: QuestionFormat;
  difficulty: DifficultyBand;
  skillSource: string;
  subSkillId: string | null;
  bodyMd: string;
  bodyJson: Record<string, unknown>;
  answerKey?: Record<string, unknown> | undefined;
  testCases?: Array<Record<string, unknown>> | undefined;
  referenceSolution?: string | undefined;
  /** Self-critique scores per spec §7 (each 0–10). */
  selfCritique?: SelfCritique | undefined;
}

export interface SelfCritique {
  ambiguity: number; // 0–10 (10 = unambiguous)
  distractorQuality: number;
  edgeCases: number;
  bias: number;
  leakRisk: number;
}

export interface GenerationOutcome {
  question: GeneratedQuestion | null;
  /** Reason the question was rejected, if any. */
  rejectionReason?: string | undefined;
}

export interface OrderInput {
  orderId: string;
  tenantId: string;
  tier: Tier;
  jdText: string;
  exportFormat: ExportFormat;
  /** Optional total question count override; defaults to 20 per spec §3.3. */
  totalQuestions?: number;
}

export interface OrderOutcome {
  orderId: string;
  status: 'completed' | 'failed';
  parsedJd: ParsedJd | null;
  mapping: RoleGraphMapping | null;
  spec: QuestionSpec | null;
  questions: GeneratedQuestion[];
  rejectedCount: number;
  failureReason?: string;
  exportPayload?: Buffer | string;
  exportContentType?: string;
}
