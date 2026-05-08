import { describe, it, expect } from 'vitest';
import { buildGenerationSpec } from '../src/generation/spec-builder.js';
import type { MappingResult } from '../src/role-graph/mapper.js';

function mapping(prefixes: Array<[string, number]>): MappingResult {
  return {
    matched: [],
    unmatched: [],
    coverage: 1,
    top_prefixes: prefixes.map(([prefix, weight]) => ({
      prefix,
      total_weight: weight,
      canonical: prefix,
    })),
  };
}

describe('buildGenerationSpec — N=20 distribution (spec §3.3)', () => {
  it('default distribution sums correctly', () => {
    const spec = buildGenerationSpec(mapping([['senior-python', 1.0]]), {
      roleFamily: 'engineering',
    });
    expect(spec.total).toBe(20);
    const sumByFmt = spec.by_format.reduce((a, b) => a + b.count, 0);
    const sumBySub = spec.by_sub_skill.reduce((a, b) => a + b.count, 0);
    expect(sumByFmt).toBe(20);
    expect(sumBySub).toBe(20);
    expect(spec.questions).toHaveLength(20);
  });

  it('engineering role: design > 0, sjt = 0', () => {
    const spec = buildGenerationSpec(mapping([['senior-python', 1]]), {
      roleFamily: 'engineering',
    });
    const design = spec.by_format.find((f) => f.format === 'design');
    const sjt = spec.by_format.find((f) => f.format === 'sjt');
    expect(design?.count).toBeGreaterThan(0);
    expect(sjt).toBeUndefined();
  });

  it('sales role: sjt > 0, design = 0', () => {
    const spec = buildGenerationSpec(mapping([['senior-aws', 1]]), { roleFamily: 'sales' });
    const sjt = spec.by_format.find((f) => f.format === 'sjt');
    const design = spec.by_format.find((f) => f.format === 'design');
    expect(sjt?.count).toBeGreaterThan(0);
    expect(design).toBeUndefined();
  });

  it('40/30/20/10 default for N=20', () => {
    const spec = buildGenerationSpec(mapping([['senior-python', 1]]), {
      roleFamily: 'engineering',
    });
    const mcq = spec.by_format.find((f) => f.format === 'mcq')?.count ?? 0;
    const code =
      (spec.by_format.find((f) => f.format === 'coding-fn')?.count ?? 0) +
      (spec.by_format.find((f) => f.format === 'coding-project')?.count ?? 0);
    const designOrSjt =
      (spec.by_format.find((f) => f.format === 'design')?.count ?? 0) +
      (spec.by_format.find((f) => f.format === 'sjt')?.count ?? 0);
    const cs = spec.by_format.find((f) => f.format === 'casestudy')?.count ?? 0;
    expect(mcq).toBe(8);
    expect(code).toBe(6);
    expect(designOrSjt).toBe(4);
    expect(cs).toBe(2);
  });
});

describe('buildGenerationSpec — sub-skill weighting', () => {
  it('proportional split on largest-remainder method', () => {
    const spec = buildGenerationSpec(
      mapping([
        ['senior-python', 6],
        ['senior-aws', 4],
      ]),
      { roleFamily: 'engineering' },
    );
    const py = spec.by_sub_skill.find((s) => s.sub_skill_id === 'senior-python');
    const aws = spec.by_sub_skill.find((s) => s.sub_skill_id === 'senior-aws');
    expect(py?.count).toBe(12);
    expect(aws?.count).toBe(8);
  });

  it('caps at top 5 prefixes', () => {
    const spec = buildGenerationSpec(
      mapping([
        ['a', 7],
        ['b', 6],
        ['c', 5],
        ['d', 4],
        ['e', 3],
        ['f', 2],
        ['g', 1],
      ]),
      { roleFamily: 'engineering' },
      { total: 30 },
    );
    expect(spec.by_sub_skill.length).toBeLessThanOrEqual(5);
  });

  it('falls back to "unmapped" bucket on empty mapping', () => {
    const spec = buildGenerationSpec(mapping([]), { roleFamily: 'engineering' });
    expect(spec.by_sub_skill).toEqual([{ sub_skill_id: 'unmapped', count: 20 }]);
  });
});

describe('buildGenerationSpec — guards', () => {
  it('rejects total < 4', () => {
    expect(() =>
      buildGenerationSpec(mapping([['x', 1]]), { roleFamily: 'engineering' }, { total: 3 }),
    ).toThrow(/total/);
  });

  it('rejects total > 100', () => {
    expect(() =>
      buildGenerationSpec(mapping([['x', 1]]), { roleFamily: 'engineering' }, { total: 200 }),
    ).toThrow(/total/);
  });
});
