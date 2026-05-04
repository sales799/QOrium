import { describe, expect, it } from 'vitest';
import {
  ARCHETYPES,
  archetypeMetadata,
  isReadyForRelease,
  renderSpecYaml,
  validateDraft,
  type QuestionDraft,
} from '../src/authoring';

const baseDraft: QuestionDraft = {
  id: 'QOR-AIPC-001',
  archetype: 'spec_then_implement',
  title: 'Implement a debounce',
  brief:
    'Build a generic debounce(fn, ms) helper. The wrapper must call fn at most once per ms-millisecond window using the most recent invocation arguments. Cancel / flush variants are not required for this prompt; focus on the core invariant. Account for fn returning a value when called repeatedly within the window: the helper must return undefined while suppressed, and the trailing call must fire once the window elapses.',
  starterCode:
    '```ts\nfunction debounce<F extends (...a: any[]) => unknown>(fn: F, ms: number): F {\n  // your code\n  return fn;\n}\n```',
  referenceSolution: '```ts\nfunction debounce(fn, ms) { /* canonical */ }\n```',
  language: 'typescript',
  difficultyB: 0.5,
  discriminationA: 1.5,
  expectedDurationMinutes: 30,
  seededErrors: [],
  authoredBy: 'sme-lead@qorium.online',
};

describe('ARCHETYPES catalogue', () => {
  it('lists six archetypes per spec §4.1', () => {
    expect(ARCHETYPES).toHaveLength(6);
    const keys = ARCHETYPES.map((a) => a.key);
    expect(keys).toContain('spec_then_implement');
    expect(keys).toContain('bug_fix_with_ai');
    expect(keys).toContain('refactor_with_ai');
    expect(keys).toContain('build_from_scratch');
    expect(keys).toContain('adversarial_ai_injects_error');
    expect(keys).toContain('underspecified_task');
  });

  it('archetypeMetadata round-trips by key', () => {
    expect(archetypeMetadata('build_from_scratch')?.label).toBe('Build from scratch');
    expect(archetypeMetadata('made_up' as never)).toBe(null);
  });
});

describe('validateDraft', () => {
  it('passes a well-formed spec_then_implement draft', () => {
    const issues = validateDraft(baseDraft);
    expect(issues.filter((i) => i.severity === 'error')).toHaveLength(0);
  });

  it('rejects malformed id', () => {
    const issues = validateDraft({ ...baseDraft, id: 'AIPC-1' });
    expect(issues.find((i) => i.field === 'id' && i.severity === 'error')).toBeDefined();
  });

  it('rejects out-of-range difficulty', () => {
    const issues = validateDraft({ ...baseDraft, difficultyB: 5 });
    expect(issues.find((i) => i.field === 'difficultyB')).toBeDefined();
  });

  it('rejects out-of-range discrimination', () => {
    const issues = validateDraft({ ...baseDraft, discriminationA: 0.05 });
    expect(issues.find((i) => i.field === 'discriminationA')).toBeDefined();
  });

  it('rejects out-of-range duration', () => {
    const issues = validateDraft({ ...baseDraft, expectedDurationMinutes: 200 });
    expect(issues.find((i) => i.field === 'expectedDurationMinutes')).toBeDefined();
  });

  it('errors when adversarial archetype has no seededErrors', () => {
    const issues = validateDraft({
      ...baseDraft,
      archetype: 'adversarial_ai_injects_error',
      seededErrors: [],
    });
    expect(issues.find((i) => i.field === 'archetype-rule')?.message).toMatch(/seededError/);
  });

  it('errors when bug_fix archetype has no seededErrors', () => {
    const issues = validateDraft({
      ...baseDraft,
      archetype: 'bug_fix_with_ai',
      seededErrors: [],
    });
    expect(issues.find((i) => i.field === 'archetype-rule')?.severity).toBe('error');
  });

  it('warns when build_from_scratch starter code is too small', () => {
    const issues = validateDraft({
      ...baseDraft,
      archetype: 'build_from_scratch',
      starterCode: '// x',
    });
    const warning = issues.find((i) => i.field === 'archetype-rule');
    expect(warning?.severity).toBe('warning');
    expect(warning?.message).toMatch(/scaffold/);
  });

  it('warns when underspecified brief is too long', () => {
    const longBrief = 'x'.repeat(500);
    const issues = validateDraft({
      ...baseDraft,
      archetype: 'underspecified_task',
      brief: longBrief,
    });
    expect(issues.find((i) => i.field === 'archetype-rule')?.severity).toBe('warning');
  });

  it('warns when spec_then_implement brief is too short', () => {
    const issues = validateDraft({
      ...baseDraft,
      brief: 'short brief that is at least 30 chars',
    });
    expect(issues.find((i) => i.field === 'archetype-rule')?.severity).toBe('warning');
  });

  it('rejects empty reference solution', () => {
    const issues = validateDraft({ ...baseDraft, referenceSolution: '' });
    expect(issues.find((i) => i.field === 'referenceSolution')).toBeDefined();
  });

  it('returns ALL issues, not first-fail', () => {
    const broken: QuestionDraft = {
      ...baseDraft,
      id: 'bad',
      title: 'x',
      brief: '',
      referenceSolution: '',
      difficultyB: 99,
    };
    const issues = validateDraft(broken);
    expect(issues.length).toBeGreaterThanOrEqual(4);
  });
});

describe('isReadyForRelease', () => {
  it('returns true when only warnings (no errors) are present', () => {
    const draft: QuestionDraft = {
      ...baseDraft,
      brief: 'short brief that is at least 30 chars',
    };
    expect(isReadyForRelease(draft)).toBe(true);
  });

  it('returns false when any error issue is present', () => {
    expect(isReadyForRelease({ ...baseDraft, id: 'bad' })).toBe(false);
  });
});

describe('renderSpecYaml', () => {
  it('produces YAML with the spec §4.2 fields', () => {
    const yaml = renderSpecYaml(baseDraft);
    expect(yaml).toContain('question_id: QOR-AIPC-001');
    expect(yaml).toContain('archetype: spec_then_implement');
    expect(yaml).toContain('format: ai_pair_coding');
    expect(yaml).toContain('language: typescript');
    expect(yaml).toContain('difficulty_b: 0.5');
    expect(yaml).toContain('discrimination_a: 1.5');
    expect(yaml).toContain('expected_duration_minutes: 30');
    expect(yaml).toContain('seeded_errors_count: 0');
  });

  it('emits seeded_errors block when present', () => {
    const draft: QuestionDraft = {
      ...baseDraft,
      archetype: 'adversarial_ai_injects_error',
      seededErrors: [
        { description: 'AI suggests using == instead of ===', detectionMarker: '===' },
        { description: 'AI omits null check on result' },
      ],
    };
    const yaml = renderSpecYaml(draft);
    expect(yaml).toContain('seeded_errors:');
    expect(yaml).toContain('description:');
    expect(yaml).toContain('detection_marker:');
  });

  it('uses literal block scalars for multiline fields', () => {
    const draft: QuestionDraft = {
      ...baseDraft,
      brief:
        'first line\nsecond line\nthird line\nfourth line\nfifth line\nplus more text to make this a long enough brief for spec then implement archetype expectations',
    };
    const yaml = renderSpecYaml(draft);
    expect(yaml).toContain('brief: |\n  first line\n  second line');
  });

  it('quotes scalars with YAML special characters', () => {
    const draft: QuestionDraft = {
      ...baseDraft,
      title: 'Implement: a debounce - special: chars',
    };
    const yaml = renderSpecYaml(draft);
    expect(yaml).toContain('title: "Implement: a debounce - special: chars"');
  });
});
