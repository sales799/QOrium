/**
 * Wave 3 question-authoring framework per
 * `infra/Wave-3-AI-Pair-Coding-Format-Prototype-Spec-v0.md` §4.
 *
 * Pure logic. The framework codifies six question archetypes plus the
 * extended schema fields each archetype contributes, and provides
 * authoring + validation primitives so the SME can pen 50 questions
 * by M9 without bespoke per-archetype code.
 */

export type Archetype =
  | 'spec_then_implement'
  | 'bug_fix_with_ai'
  | 'refactor_with_ai'
  | 'build_from_scratch'
  | 'adversarial_ai_injects_error'
  | 'underspecified_task';

export const ARCHETYPES: ReadonlyArray<{ key: Archetype; label: string; signal: string }> = [
  {
    key: 'spec_then_implement',
    label: 'Spec then implement',
    signal: 'edge-case questioning discipline',
  },
  {
    key: 'bug_fix_with_ai',
    label: 'Bug fix with AI',
    signal: 'AI-suggestion validation discipline',
  },
  {
    key: 'refactor_with_ai',
    label: 'Refactor with AI',
    signal: 'taste + AI-collaboration discipline',
  },
  {
    key: 'build_from_scratch',
    label: 'Build from scratch',
    signal: 'direction-setting + iteration',
  },
  {
    key: 'adversarial_ai_injects_error',
    label: 'Adversarial — AI injects error',
    signal: 'self-correction (catches seeded errors)',
  },
  {
    key: 'underspecified_task',
    label: 'Underspecified task',
    signal: 'clarifies via AI (vs pattern-matches)',
  },
] as const;

export interface SeededError {
  /** Spec § 3.3 — deliberate AI failure mode the candidate should catch. */
  description: string;
  /** Optional regex/snippet the orchestrator can scan for in candidate-edited code to confirm catch. */
  detectionMarker?: string;
}

export interface QuestionDraft {
  /** Stable id (e.g. 'QOR-AIPC-001'). */
  id: string;
  archetype: Archetype;
  /** Public-facing title shown to the candidate. */
  title: string;
  /** The 30-second brief the candidate reads first. */
  brief: string;
  /** Starter code for the editor (markdown fenced block ok). */
  starterCode: string;
  /** Reference solution; SME-only. */
  referenceSolution: string;
  /** Programming language; defaults to typescript per spec §4.2. */
  language: string;
  /** Spec §4.2 IRT params. */
  difficultyB: number;
  discriminationA: number;
  /** Total session budget per spec §2.1 (default 30 minutes). */
  expectedDurationMinutes: number;
  /** Per spec §3.3 — required for the F (self-correction) dimension. */
  seededErrors: SeededError[];
  /** Authoring metadata. */
  authoredBy: string;
  reviewedBy?: string;
  /** Free-form SME notes. */
  notes?: string;
}

export interface ValidationIssue {
  field: keyof QuestionDraft | 'archetype-rule';
  severity: 'error' | 'warning';
  message: string;
}

const REQUIRED_DURATION_BOUNDS = { min: 10, max: 60 };

/**
 * Validate a question draft against the spec invariants. Returns ALL
 * issues (not first-fail) so the SME UI can render them in one pass.
 *
 * Rules:
 *   - id must match `QOR-AIPC-\d{3}` per spec §4.2.
 *   - Adversarial archetype must have ≥ 1 seededError.
 *   - Bug-fix archetype must have ≥ 1 seededError (the bug being fixed).
 *   - Build-from-scratch must have a non-trivial starterCode.
 *   - Spec-then-implement brief must be ≥ 200 chars (spec §4.1 detailed brief).
 *   - Underspecified brief must be ≤ 300 chars (spec §4.1 ambiguous).
 *   - duration ∈ [10, 60] minutes.
 *   - difficulty ∈ [-3, 3] per IRT 2PL convention.
 *   - discrimination ∈ [0.1, 4] per IRT 2PL convention.
 *   - referenceSolution must be non-empty.
 */
export function validateDraft(draft: QuestionDraft): ValidationIssue[] {
  const out: ValidationIssue[] = [];

  if (!/^QOR-AIPC-\d{3}$/.test(draft.id)) {
    out.push({
      field: 'id',
      severity: 'error',
      message: `id must match QOR-AIPC-NNN; got "${draft.id}"`,
    });
  }
  if (draft.title.trim().length < 5) {
    out.push({ field: 'title', severity: 'error', message: 'title is too short' });
  }
  if (draft.brief.trim().length < 30) {
    out.push({ field: 'brief', severity: 'error', message: 'brief must be ≥ 30 chars' });
  }
  if (!draft.referenceSolution.trim()) {
    out.push({
      field: 'referenceSolution',
      severity: 'error',
      message: 'reference solution is required',
    });
  }
  if (draft.language.trim().length === 0) {
    out.push({ field: 'language', severity: 'error', message: 'language is required' });
  }
  if (draft.difficultyB < -3 || draft.difficultyB > 3) {
    out.push({
      field: 'difficultyB',
      severity: 'error',
      message: 'difficultyB must be in [-3, 3] (IRT 2PL)',
    });
  }
  if (draft.discriminationA < 0.1 || draft.discriminationA > 4) {
    out.push({
      field: 'discriminationA',
      severity: 'error',
      message: 'discriminationA must be in [0.1, 4]',
    });
  }
  if (
    draft.expectedDurationMinutes < REQUIRED_DURATION_BOUNDS.min ||
    draft.expectedDurationMinutes > REQUIRED_DURATION_BOUNDS.max
  ) {
    out.push({
      field: 'expectedDurationMinutes',
      severity: 'error',
      message: `duration must be in [${REQUIRED_DURATION_BOUNDS.min}, ${REQUIRED_DURATION_BOUNDS.max}] minutes`,
    });
  }
  if (draft.archetype === 'adversarial_ai_injects_error' && draft.seededErrors.length === 0) {
    out.push({
      field: 'archetype-rule',
      severity: 'error',
      message: 'adversarial archetype must include ≥ 1 seededError per spec §3.3',
    });
  }
  if (draft.archetype === 'bug_fix_with_ai' && draft.seededErrors.length === 0) {
    out.push({
      field: 'archetype-rule',
      severity: 'error',
      message: 'bug_fix_with_ai archetype must declare the bug as a seededError',
    });
  }
  if (draft.archetype === 'build_from_scratch' && draft.starterCode.trim().length < 20) {
    out.push({
      field: 'archetype-rule',
      severity: 'warning',
      message: 'build_from_scratch usually wants a minimal scaffold (≥ 20 chars)',
    });
  }
  if (draft.archetype === 'spec_then_implement' && draft.brief.trim().length < 200) {
    out.push({
      field: 'archetype-rule',
      severity: 'warning',
      message: 'spec_then_implement briefs are typically ≥ 200 chars (detailed)',
    });
  }
  if (draft.archetype === 'underspecified_task' && draft.brief.trim().length > 300) {
    out.push({
      field: 'archetype-rule',
      severity: 'warning',
      message: 'underspecified_task briefs are typically ≤ 300 chars (ambiguous)',
    });
  }
  return out;
}

export function isReadyForRelease(draft: QuestionDraft): boolean {
  return validateDraft(draft).every((i) => i.severity !== 'error');
}

/**
 * Render the spec §4.2 schema YAML for a finalised draft. Used by the
 * SME authoring CLI + the question-importer pipeline.
 */
export function renderSpecYaml(draft: QuestionDraft): string {
  const lines: string[] = [
    `question_id: ${draft.id}`,
    `archetype: ${draft.archetype}`,
    `title: ${quoteYaml(draft.title)}`,
    `format: ai_pair_coding`,
    `language: ${draft.language}`,
    `difficulty_b: ${draft.difficultyB}`,
    `discrimination_a: ${draft.discriminationA}`,
    `expected_duration_minutes: ${draft.expectedDurationMinutes}`,
    `seeded_errors_count: ${draft.seededErrors.length}`,
    `brief: ${blockYaml(draft.brief)}`,
    `starter_code: ${blockYaml(draft.starterCode)}`,
    `reference_solution: ${blockYaml(draft.referenceSolution)}`,
    `authored_by: ${draft.authoredBy}`,
  ];
  if (draft.reviewedBy) lines.push(`reviewed_by: ${draft.reviewedBy}`);
  if (draft.notes) lines.push(`notes: ${blockYaml(draft.notes)}`);
  if (draft.seededErrors.length > 0) {
    lines.push('seeded_errors:');
    for (const e of draft.seededErrors) {
      lines.push(`  - description: ${quoteYaml(e.description)}`);
      if (e.detectionMarker !== undefined) {
        lines.push(`    detection_marker: ${quoteYaml(e.detectionMarker)}`);
      }
    }
  }
  return lines.join('\n') + '\n';
}

function quoteYaml(value: string): string {
  if (/[:#&*!?{}[\]|>'"\n]/.test(value)) {
    return JSON.stringify(value);
  }
  return value;
}

function blockYaml(value: string): string {
  if (!value.includes('\n')) return quoteYaml(value);
  // YAML literal block scalar (preserves newlines).
  return (
    '|\n' +
    value
      .split('\n')
      .map((l) => `  ${l}`)
      .join('\n')
  );
}

export function archetypeMetadata(key: Archetype): { label: string; signal: string } | null {
  const found = ARCHETYPES.find((a) => a.key === key);
  if (!found) return null;
  return { label: found.label, signal: found.signal };
}
