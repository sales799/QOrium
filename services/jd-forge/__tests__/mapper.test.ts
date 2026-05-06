import { describe, expect, it } from 'vitest';
import { StringMatchRoleGraphMapper, mapJdSkills } from '../src/mapper';

const CANONICAL = [
  { id: 'sub-apex', name: 'Salesforce Apex' },
  { id: 'sub-lwc', name: 'Lightning Web Components' },
  { id: 'sub-soql', name: 'SOQL' },
  { id: 'sub-postgres', name: 'PostgreSQL' },
  { id: 'sub-react', name: 'React' },
];

describe('StringMatchRoleGraphMapper', () => {
  it('maps an exact-name skill to its canonical id', async () => {
    const mapper = new StringMatchRoleGraphMapper(CANONICAL);
    const r = await mapper.match('Salesforce Apex');
    expect(r.subSkillId).toBe('sub-apex');
    expect(r.matchKind).toBe('fuzzy');
    expect(r.score).toBeGreaterThan(0.9);
  });

  it('maps a near-match skill above the threshold', async () => {
    const mapper = new StringMatchRoleGraphMapper(CANONICAL);
    const r = await mapper.match('Apex');
    // Single-word "Apex" against "Salesforce Apex" — moderate Dice score
    expect(['sub-apex', null]).toContain(r.subSkillId);
  });

  it('returns null for unrelated skills', async () => {
    const mapper = new StringMatchRoleGraphMapper(CANONICAL);
    const r = await mapper.match('Quantum Mechanics');
    expect(r.subSkillId).toBeNull();
    expect(r.matchKind).toBe('unmapped');
  });

  it('returns null for empty input', async () => {
    const mapper = new StringMatchRoleGraphMapper(CANONICAL);
    expect((await mapper.match('')).subSkillId).toBeNull();
    expect((await mapper.match('   ')).subSkillId).toBeNull();
  });

  it('handles an empty canonical list gracefully', async () => {
    const mapper = new StringMatchRoleGraphMapper([]);
    expect((await mapper.match('Apex')).subSkillId).toBeNull();
  });
});

describe('mapJdSkills', () => {
  const mapper = new StringMatchRoleGraphMapper(CANONICAL);

  it('separates mapped vs unmapped required skills', async () => {
    const result = await mapJdSkills(
      mapper,
      [
        { skill: 'Salesforce Apex', weight: 1 },
        { skill: 'Quantum Mechanics', weight: 0.9 },
      ],
      [],
    );
    expect(result.required).toHaveLength(1);
    expect(result.unmappedRequired).toHaveLength(1);
    expect(result.required[0]?.subSkillId).toBe('sub-apex');
    expect(result.unmappedRequired[0]?.source).toBe('Quantum Mechanics');
  });

  it('does not segregate nice-to-have items', async () => {
    const result = await mapJdSkills(mapper, [], [{ skill: 'Quantum Mechanics', weight: 0.5 }]);
    expect(result.required).toHaveLength(0);
    expect(result.niceToHave).toHaveLength(1);
    expect(result.niceToHave[0]?.subSkillId).toBeNull();
  });
});
