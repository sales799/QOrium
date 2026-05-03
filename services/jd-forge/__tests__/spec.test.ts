import { describe, expect, it } from 'vitest';
import { buildSpec } from '../src/spec';
import type { RoleGraphMapping } from '../src/types';

const mapping = (overrides: Partial<RoleGraphMapping> = {}): RoleGraphMapping => ({
  required: [
    {
      source: 'Apex',
      weight: 1,
      subSkillId: 'sub-apex',
      matchScore: 0.95,
      matchKind: 'fuzzy',
    },
    {
      source: 'LWC',
      weight: 0.9,
      subSkillId: 'sub-lwc',
      matchScore: 0.9,
      matchKind: 'fuzzy',
    },
    {
      source: 'SOQL',
      weight: 0.8,
      subSkillId: 'sub-soql',
      matchScore: 0.85,
      matchKind: 'fuzzy',
    },
  ],
  niceToHave: [
    {
      source: 'Health Cloud',
      weight: 0.6,
      subSkillId: null,
      matchScore: 0,
      matchKind: 'unmapped',
    },
  ],
  unmappedRequired: [],
  ...overrides,
});

describe('buildSpec', () => {
  it('returns 20 questions by default', () => {
    const spec = buildSpec(mapping());
    expect(spec.totalQuestions).toBe(20);
    expect(spec.items).toHaveLength(20);
  });

  it('honours a custom total', () => {
    const spec = buildSpec(mapping(), { totalQuestions: 10 });
    expect(spec.totalQuestions).toBe(10);
    expect(spec.items).toHaveLength(10);
  });

  it('clamps total at 100', () => {
    const spec = buildSpec(mapping(), { totalQuestions: 9_999 });
    expect(spec.items.length).toBeLessThanOrEqual(100);
  });

  it('falls back to default total on invalid input', () => {
    const spec = buildSpec(mapping(), { totalQuestions: -5 });
    expect(spec.totalQuestions).toBe(20);
  });

  it('format distribution sums to total', () => {
    const spec = buildSpec(mapping());
    const sum = Object.values(spec.formatDistribution).reduce((a, b) => a + b, 0);
    expect(sum).toBe(spec.totalQuestions);
  });

  it('difficulty distribution sums to total', () => {
    const spec = buildSpec(mapping());
    const sum = Object.values(spec.difficultyDistribution).reduce((a, b) => a + b, 0);
    expect(sum).toBe(spec.totalQuestions);
  });

  it('produces an empty spec when no skills are mapped or nice-to-have', () => {
    const spec = buildSpec({ required: [], niceToHave: [], unmappedRequired: [] });
    expect(spec.items).toHaveLength(0);
    expect(spec.totalQuestions).toBe(0);
  });

  it('weighted skills get more allocations than nice-to-haves', () => {
    const spec = buildSpec(mapping());
    const counts = new Map<string, number>();
    for (const item of spec.items) {
      counts.set(item.skillSource, (counts.get(item.skillSource) ?? 0) + 1);
    }
    const apexCount = counts.get('Apex') ?? 0;
    const niceCount = counts.get('Health Cloud') ?? 0;
    expect(apexCount).toBeGreaterThanOrEqual(niceCount);
  });

  it('is deterministic for identical inputs', () => {
    const a = buildSpec(mapping());
    const b = buildSpec(mapping());
    expect(a.items).toEqual(b.items);
  });
});
