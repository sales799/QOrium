/**
 * Language-id map per Judge0-Sandbox-Integration-Spec-v0.md §5 (12 languages
 * baseline) plus Apex (handled out-of-band). The numeric `judge0Id` matches
 * the public Judge0 v1.13+ `language_id` constants.
 *
 * QOrium identifiers are short canonical strings used throughout the
 * orchestrator and `content.questions.sandbox_config.language`. The Judge0
 * id is what the HTTP client sends.
 */

export type QOriumLanguage =
  | 'java21'
  | 'python3'
  | 'node20'
  | 'typescript5'
  | 'cpp20'
  | 'rust175'
  | 'go122'
  | 'c17'
  | 'sql'
  | 'bash5'
  | 'shell-awk'
  | 'apex';

export interface LanguageProfile {
  id: QOriumLanguage;
  /** Judge0 numeric language_id; null for `apex` (Apex CLI path). */
  judge0Id: number | null;
  /** Spec §5 default memory ceiling (MB). */
  defaultMemoryMb: number;
  /** Spec §5 default wall-time ceiling (ms). */
  defaultTimeMs: number;
  /** Spec §5 compilation budget (ms). 0 for interpreted languages. */
  compilationBudgetMs: number;
  /** Display name (logs / admin UI). */
  displayName: string;
  /** Whether the language uses the Judge0 path (vs Apex CLI). */
  routesToJudge0: boolean;
}

const PROFILES: readonly LanguageProfile[] = [
  {
    id: 'java21',
    judge0Id: 91,
    defaultMemoryMb: 512,
    defaultTimeMs: 5_000,
    compilationBudgetMs: 3_000,
    displayName: 'Java (OpenJDK 21)',
    routesToJudge0: true,
  },
  {
    id: 'python3',
    judge0Id: 71,
    defaultMemoryMb: 256,
    defaultTimeMs: 3_000,
    compilationBudgetMs: 0,
    displayName: 'Python 3.12',
    routesToJudge0: true,
  },
  {
    id: 'node20',
    judge0Id: 93,
    defaultMemoryMb: 256,
    defaultTimeMs: 3_000,
    compilationBudgetMs: 0,
    displayName: 'Node.js 20 LTS',
    routesToJudge0: true,
  },
  {
    id: 'typescript5',
    judge0Id: 94,
    defaultMemoryMb: 384,
    defaultTimeMs: 4_000,
    compilationBudgetMs: 1_000,
    displayName: 'TypeScript 5 (tsx)',
    routesToJudge0: true,
  },
  {
    id: 'cpp20',
    judge0Id: 76,
    defaultMemoryMb: 256,
    defaultTimeMs: 2_000,
    compilationBudgetMs: 1_000,
    displayName: 'C++20 (g++)',
    routesToJudge0: true,
  },
  {
    id: 'rust175',
    judge0Id: 73,
    defaultMemoryMb: 384,
    defaultTimeMs: 5_000,
    compilationBudgetMs: 2_000,
    displayName: 'Rust 1.75',
    routesToJudge0: true,
  },
  {
    id: 'go122',
    judge0Id: 95,
    defaultMemoryMb: 256,
    defaultTimeMs: 3_000,
    compilationBudgetMs: 500,
    displayName: 'Go 1.22',
    routesToJudge0: true,
  },
  {
    id: 'c17',
    judge0Id: 75,
    defaultMemoryMb: 256,
    defaultTimeMs: 2_000,
    compilationBudgetMs: 1_000,
    displayName: 'C17 (gcc)',
    routesToJudge0: true,
  },
  {
    id: 'sql',
    judge0Id: 82,
    defaultMemoryMb: 256,
    defaultTimeMs: 2_000,
    compilationBudgetMs: 0,
    displayName: 'SQL (Postgres 16)',
    routesToJudge0: true,
  },
  {
    id: 'bash5',
    judge0Id: 46,
    defaultMemoryMb: 128,
    defaultTimeMs: 2_000,
    compilationBudgetMs: 0,
    displayName: 'Bash 5',
    routesToJudge0: true,
  },
  {
    id: 'shell-awk',
    judge0Id: 46,
    defaultMemoryMb: 128,
    defaultTimeMs: 2_000,
    compilationBudgetMs: 0,
    displayName: 'Shell + AWK',
    routesToJudge0: true,
  },
  {
    id: 'apex',
    judge0Id: null,
    defaultMemoryMb: 0,
    defaultTimeMs: 0,
    compilationBudgetMs: 0,
    displayName: 'Salesforce Apex',
    routesToJudge0: false,
  },
];

const BY_ID: ReadonlyMap<QOriumLanguage, LanguageProfile> = new Map(PROFILES.map((p) => [p.id, p]));

export function listSupportedLanguages(): readonly LanguageProfile[] {
  return PROFILES;
}

export function isSupportedLanguage(value: string): value is QOriumLanguage {
  return BY_ID.has(value as QOriumLanguage);
}

export function getLanguageProfile(language: QOriumLanguage): LanguageProfile {
  const p = BY_ID.get(language);
  if (!p) throw new Error(`unknown language: ${language}`);
  return p;
}

/** Returns the Judge0 numeric language_id, throwing if the language routes
 * elsewhere (e.g., Apex). Callers should branch on `routesToJudge0` before
 * calling this. */
export function judge0IdFor(language: QOriumLanguage): number {
  const profile = getLanguageProfile(language);
  if (profile.judge0Id === null) {
    throw new Error(`${language} does not route to Judge0 (use the Apex path instead)`);
  }
  return profile.judge0Id;
}
