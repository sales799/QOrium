import { describe, it, expect } from 'vitest';
import { mapRoleToSubSkills, matchSingleSkill } from '../src/role-graph/mapper.js';
import type { ParsedJobDescription } from '../src/types.js';

describe('matchSingleSkill', () => {
  it('matches Java patterns', () => {
    expect(matchSingleSkill({ skill: 'Java 21', weight: 1 }).matched_prefix).toBe('senior-java');
    expect(matchSingleSkill({ skill: 'Spring Boot', weight: 1 }).matched_prefix).toBe(
      'senior-java',
    );
  });

  it('matches Python patterns', () => {
    expect(matchSingleSkill({ skill: 'Python 3.13', weight: 1 }).matched_prefix).toBe(
      'senior-python',
    );
    expect(matchSingleSkill({ skill: 'FastAPI', weight: 1 }).matched_prefix).toBe('senior-python');
  });

  it('matches AWS patterns', () => {
    expect(matchSingleSkill({ skill: 'AWS Lambda', weight: 1 }).matched_prefix).toBe('senior-aws');
    expect(matchSingleSkill({ skill: 'DynamoDB', weight: 1 }).matched_prefix).toBe('senior-aws');
  });

  it('matches AI Prompt Engineering patterns', () => {
    expect(matchSingleSkill({ skill: 'LLM prompt engineering', weight: 1 }).matched_prefix).toBe(
      'ai-prompt-engineer-senior',
    );
    expect(matchSingleSkill({ skill: 'RAG systems', weight: 1 }).matched_prefix).toBe(
      'ai-prompt-engineer-senior',
    );
  });

  it('returns null match on unknown skill', () => {
    const m = matchSingleSkill({ skill: 'COBOL', weight: 1 });
    expect(m.matched_prefix).toBeNull();
    expect(m.matched_canonical).toBeNull();
  });
});

describe('mapRoleToSubSkills', () => {
  function jd(overrides: Partial<ParsedJobDescription> = {}): ParsedJobDescription {
    return {
      role_title: 'Test',
      role_family: 'engineering',
      seniority: 'senior',
      required_skills: [],
      nice_to_have_skills: [],
      tech_stack: [],
      domain: 'tech',
      years_of_experience: 5,
      must_haves: [],
      nice_to_haves: [],
      ...overrides,
    };
  }

  it('aggregates weights across required + nice-to-have', () => {
    const out = mapRoleToSubSkills(
      jd({
        required_skills: [
          { skill: 'Python', weight: 1.0 },
          { skill: 'FastAPI', weight: 0.9 },
        ],
        nice_to_have_skills: [{ skill: 'Pydantic', weight: 0.5 }],
      }),
    );
    expect(out.coverage).toBe(1);
    expect(out.top_prefixes).toHaveLength(1);
    expect(out.top_prefixes[0]?.prefix).toBe('senior-python');
    expect(out.top_prefixes[0]?.total_weight).toBeCloseTo(2.4, 2);
  });

  it('orders prefixes by weight desc', () => {
    const out = mapRoleToSubSkills(
      jd({
        required_skills: [
          { skill: 'Java', weight: 0.6 },
          { skill: 'Python', weight: 1.0 },
          { skill: 'AWS', weight: 0.8 },
        ],
      }),
    );
    expect(out.top_prefixes.map((p) => p.prefix)).toEqual([
      'senior-python',
      'senior-aws',
      'senior-java',
    ]);
  });

  it('reports unmatched skills separately', () => {
    const out = mapRoleToSubSkills(
      jd({
        required_skills: [
          { skill: 'Python', weight: 1 },
          { skill: 'COBOL', weight: 0.5 },
        ],
      }),
    );
    expect(out.matched.length).toBe(1);
    expect(out.unmatched.length).toBe(1);
    expect(out.coverage).toBe(0.5);
  });

  it('coverage is 0 when no skills', () => {
    const out = mapRoleToSubSkills(jd());
    expect(out.coverage).toBe(0);
    expect(out.top_prefixes).toEqual([]);
  });
});
