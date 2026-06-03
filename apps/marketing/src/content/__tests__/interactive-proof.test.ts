import { describe, expect, it } from 'vitest';

import {
  getGraderExemplar,
  getSamplePack,
  listGraderExemplars,
  listSamplePacks,
  runJdForgeDemo,
  sampleJds,
} from '../interactive-proof';
import { getLibrarySkill, getRolePage, getStackPage } from '../seo-graph';

function slugFromPath(path: string): string {
  return path.split('/').filter(Boolean).at(-1) ?? '';
}

describe('interactive proof fixtures', () => {
  it('ships the six default JD-Forge sample JDs from the spec', () => {
    expect(sampleJds.map((sample) => sample.id)).toEqual([
      'senior-java',
      'senior-react',
      'devops-sre',
      'salesforce',
      'embedded-c',
      'sap-abap',
    ]);
  });

  it('returns a real JD-Forge assessment plan with linked skills', () => {
    const demo = runJdForgeDemo(sampleJds[0]!.body);

    expect(demo.ok).toBe(true);
    expect(demo.skills.length).toBeGreaterThanOrEqual(5);
    expect(demo.assessment.itemCount).toBe(20);
    expect(demo.audit.slaSeconds).toBe(60);
    expect(demo.audit.acceptEstimate).toBeGreaterThanOrEqual(0.7);
    expect(demo.roleMatch.seededRole).toBe('Senior Java Engineer');
    expect(demo.lowConfidenceReason).toBeUndefined();
    expect(demo.skills.every((skill) => skill.libraryHref.startsWith('/library/'))).toBe(true);
    for (const skill of demo.skills) {
      expect(getLibrarySkill(slugFromPath(skill.libraryHref))).toBeDefined();
    }
  });

  it('uses an honest low-confidence state instead of padding weak extractions', () => {
    const demo = runJdForgeDemo('We need someone flexible who can help with internal projects.');

    expect(demo.ok).toBe(true);
    expect(demo.skills.length).toBeLessThan(3);
    expect(demo.lowConfidenceReason).toMatch(/could not extract/i);
  });

  it('seeds grader exemplars with reproducible audit metadata', () => {
    const exemplars = listGraderExemplars();

    expect(exemplars.length).toBeGreaterThanOrEqual(8);
    for (const summary of exemplars) {
      const full = getGraderExemplar(summary.id);
      expect(full?.auditMeta.rubricVersion).toMatch(/^rubric-/);
      expect(full?.auditMeta.modelVersion).toBeTruthy();
      expect(full?.auditMeta.promptHash).toMatch(/^sha256:/);
      expect(full?.auditMeta.inputHash).toMatch(/^sha256:/);
    }
  });

  it('publishes all 13 sample-pack lead magnets with honest calibration badges', () => {
    const packs = listSamplePacks();

    expect(packs).toHaveLength(13);
    for (const pack of packs) {
      const full = getSamplePack(pack.slug);
      expect(full?.calibrationBadge).toMatch(/calibration pending/i);
      expect(full?.previewItems.length).toBeGreaterThanOrEqual(2);
      expect(full?.previewItems.length).toBeLessThanOrEqual(3);
      expect(full?.itemCount).toBeGreaterThan(full?.previewItems.length ?? 0);
    }
  });

  it('links every public sample-pack CTA to generated static proof pages', () => {
    for (const pack of listSamplePacks()) {
      expect(getLibrarySkill(slugFromPath(pack.libraryHref))).toBeDefined();
      expect(getRolePage(slugFromPath(pack.roleHref))).toBeDefined();
      expect(getStackPage(slugFromPath(pack.stackHref))).toBeDefined();
    }
  });
});
