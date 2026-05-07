import { describe, expect, it } from 'vitest';
import {
  NOS_MAPPINGS,
  NSQF_LEVELS,
  coverage,
  findByNosCode,
  findByNsqfLevel,
  findBySector,
  findBySkill,
  getNsqfLevel,
} from '../src/index.js';

describe('NSQF level descriptors', () => {
  it('covers all 10 levels with strictly increasing level numbers', () => {
    expect(NSQF_LEVELS).toHaveLength(10);
    for (let i = 0; i < NSQF_LEVELS.length; i++) {
      expect(NSQF_LEVELS[i]?.level).toBe(i + 1);
    }
  });

  it('every level has process + knowledge + responsibility text', () => {
    for (const d of NSQF_LEVELS) {
      expect(d.process.length).toBeGreaterThan(10);
      expect(d.knowledge.length).toBeGreaterThan(10);
      expect(d.responsibility.length).toBeGreaterThan(5);
    }
  });

  it('getNsqfLevel returns the right descriptor', () => {
    expect(getNsqfLevel(7)?.process).toContain('specialised');
    expect(getNsqfLevel(11)).toBeUndefined();
  });
});

describe('NOS mappings', () => {
  it('every mapping has a structurally valid NOS code', () => {
    const re = /^[A-Z]{2,5}\/N\d{4}$/;
    for (const m of NOS_MAPPINGS) {
      expect(re.test(m.nosCode)).toBe(true);
    }
  });

  it('every NSQF level on a mapping is in 1..10', () => {
    for (const m of NOS_MAPPINGS) {
      expect(m.nsqfLevel).toBeGreaterThanOrEqual(1);
      expect(m.nsqfLevel).toBeLessThanOrEqual(10);
    }
  });

  it('every QOrium senior tech skill from Wave-1 + Wave-2 has a mapping', () => {
    const expected = [
      'senior-java',
      'senior-react',
      'senior-python',
      'senior-sql-data',
      'senior-devops-sre',
      'senior-aws',
      'senior-salesforce',
      'senior-aipe',
      'senior-sap-abap',
      'senior-oracle-hcm-cloud',
      'senior-salesforce-cpq',
      'senior-finacle-flexcube',
      'senior-embedded-automotive',
    ];
    for (const slug of expected) {
      const m = findBySkill(slug);
      expect(m, `expected mapping for ${slug}`).toBeDefined();
    }
  });

  it('all mappings start as `pending` until NSDC verification lands', () => {
    // This invariant changes intentionally when CC-02-A clears.
    for (const m of NOS_MAPPINGS) {
      expect(m.verification).toBe('pending');
    }
  });
});

describe('findBySkill', () => {
  it('returns a mapping for a known skill', () => {
    const m = findBySkill('senior-java');
    expect(m?.nosCode).toBe('SSC/N0508');
    expect(m?.nsqfLevel).toBe(7);
    expect(m?.sector).toBe('SSC');
  });

  it('returns undefined for an unknown skill', () => {
    expect(findBySkill('senior-cobol')).toBeUndefined();
  });

  it('respects sub-skill specificity when provided', () => {
    // No sub-skill-specific entries today; still must not crash, must
    // fall back to the parent-skill entry.
    const m = findBySkill('senior-java', 'java-streams');
    expect(m?.qoriumSkillId).toBe('senior-java');
  });
});

describe('reverse lookups', () => {
  it('findByNosCode returns every skill sharing a NOS code', () => {
    const sw = findByNosCode('SSC/N0508');
    expect(sw.length).toBeGreaterThanOrEqual(3);
    const slugs = sw.map((m) => m.qoriumSkillId);
    expect(slugs).toContain('senior-java');
    expect(slugs).toContain('senior-python');
  });

  it('findByNsqfLevel filters correctly', () => {
    const l8 = findByNsqfLevel(8);
    expect(l8.every((m) => m.nsqfLevel === 8)).toBe(true);
    expect(l8.length).toBeGreaterThan(0);
  });

  it('findBySector groups by sector', () => {
    expect(findBySector('BFSI').length).toBeGreaterThan(0);
    expect(findBySector('ASC').length).toBeGreaterThan(0);
    expect(findBySector('ESSCI')).toEqual([]);
  });
});

describe('coverage report', () => {
  it('totals match NOS_MAPPINGS.length', () => {
    const r = coverage();
    expect(r.totalMappings).toBe(NOS_MAPPINGS.length);
    expect(r.verified + r.pending).toBe(r.totalMappings);
  });

  it('byNsqfLevel sums to total', () => {
    const r = coverage();
    const sum = Object.values(r.byNsqfLevel).reduce((a, b) => a + b, 0);
    expect(sum).toBe(r.totalMappings);
  });

  it('bySector sums to total', () => {
    const r = coverage();
    const sum = Object.values(r.bySector).reduce((a, b) => a + b, 0);
    expect(sum).toBe(r.totalMappings);
  });
});
