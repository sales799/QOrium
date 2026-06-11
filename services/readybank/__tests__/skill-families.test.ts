import { describe, it, expect } from 'vitest';
import { familyForSkill, familyName, SKILL_FAMILIES } from '../src/lib/skill-families.js';

describe('skill-families taxonomy', () => {
  it('collapses fragmented micro-skills into stable families', () => {
    const cases: Record<string, string> = {
      AWS: 'cloud-devops',
      'Amazon Web Services Senior': 'cloud-devops',
      Kubernetes: 'cloud-devops',
      'Senior Sql': 'data-databases',
      PostgreSQL: 'data-databases',
      MySQL: 'data-databases',
      'Salesforce Developer Senior': 'enterprise-erp',
      'SAP ABAP': 'enterprise-erp',
      React: 'frontend',
      'Angular Developer': 'frontend',
      Java: 'backend',
      'Node.js': 'backend',
      'React Native': 'mobile',
      Android: 'mobile',
      Selenium: 'qa-testing',
      'Machine Learning': 'data-science-ml',
      Cybersecurity: 'security',
    };
    for (const [name, fam] of Object.entries(cases)) {
      expect(familyForSkill(name), name).toBe(fam);
    }
  });

  it('falls back to "other" for unknown or empty skills', () => {
    expect(familyForSkill('Underwater Basket Weaving')).toBe('other');
    expect(familyForSkill('')).toBe('other');
  });

  it('exposes exactly 13 families with "other" terminal', () => {
    expect(SKILL_FAMILIES).toHaveLength(13);
    expect(SKILL_FAMILIES.at(-1)?.id).toBe('other');
    expect(familyName('cloud-devops')).toBe('Cloud & DevOps');
  });
});
