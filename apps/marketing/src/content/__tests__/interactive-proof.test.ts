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
    expect(demo.lowConfidenceReason).toBeUndefined();
    expect(demo.skills.every((skill) => skill.libraryHref.startsWith('/library/'))).toBe(true);
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

  it('links every public sample-pack CTA to shipped Phase 3/4 pages', () => {
    for (const pack of listSamplePacks()) {
      const librarySlug = pack.libraryHref.replace('/library/', '');
      const roleSlug = pack.roleHref.replace('/solutions/role/', '');
      const stackSlug = pack.stackHref.replace('/solutions/stack/', '');

      expect(pack.libraryHref).toMatch(/^\/library\//);
      expect(pack.roleHref).toMatch(/^\/solutions\/role\//);
      expect(pack.stackHref).toMatch(/^\/solutions\/stack\//);
      expect(getLibrarySkill(librarySlug)).toBeDefined();
      expect(getRolePage(roleSlug)).toBeDefined();
      expect(getStackPage(stackSlug)).toBeDefined();
    }
  });
});
