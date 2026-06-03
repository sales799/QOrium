import { describe, expect, it } from 'vitest';

import { dynamicParams, generateStaticParams } from '@/app/(marketing)/library/[slug]/page';
import {
  IRT_LABEL,
  competitorPages,
  getCompetitorPage,
  getLibrarySkill,
  getRolePage,
  getStackPage,
  librarySkills,
  rolePages,
  seoSitemapFamilies,
  stackPages,
} from '@/content/seo-graph';

describe('programmatic SEO role graph', () => {
  it('ships exactly the 21 canonical library skills (no fragment leak)', () => {
    // Consolidated 2026-06-03: content.skills filtered to NOT (metadata ? 'merged_into').
    // The legacy 1,000-page generator is intentionally gone.
    expect(librarySkills.length).toBe(21);
    expect(rolePages.length).toBeGreaterThanOrEqual(30);
    expect(stackPages.length).toBeGreaterThanOrEqual(12);
    expect(competitorPages.length).toBeGreaterThanOrEqual(10);
  });

  it('has no `<slug>-<n>` fragment slugs in the library', () => {
    for (const skill of librarySkills) {
      expect(skill.slug).not.toMatch(/-\d+$/);
    }
    // slugs are unique
    expect(new Set(librarySkills.map((s) => s.slug)).size).toBe(librarySkills.length);
  });

  it('uses canonical paths from the SEO factory brief', () => {
    expect(getLibrarySkill('python')?.path).toBe('/library/python');
    expect(getLibrarySkill('sap-abap')?.path).toBe('/library/sap-abap');
    expect(getRolePage('software')?.path).toBe('/solutions/role/software');
    expect(getRolePage('react-developer')?.path).toBe('/solutions/role/react-developer');
    expect(getStackPage('sap')?.path).toBe('/solutions/stack/sap');
    expect(getStackPage('sap-abap')?.path).toBe('/solutions/stack/sap-abap');
    expect(getCompetitorPage('vervoe')?.path).toBe('/vs/vervoe');
    expect(getCompetitorPage('mettl')?.path).toBe('/vs/mettl');
    expect(
      ['vervoe', 'mettl', 'imocha', 'coderbyte', 'techcurators'].every(getCompetitorPage),
    ).toBe(true);
  });

  it('keeps calibration honest on every library page', () => {
    const allowed = new Set(['IRT-calibrated', 'Beta', 'Authored']);

    for (const skill of librarySkills) {
      expect(allowed.has(skill.calibration.status)).toBe(true);
      expect(skill.calibration.label.length).toBeGreaterThan(0);
      expect(skill.sampleQuestions.length).toBeGreaterThanOrEqual(3);

      // No page may claim empirical IRT calibration without calibrated items.
      if (skill.calibration.itemCountCalibrated < 30) {
        expect(skill.calibration.status).not.toBe('IRT-calibrated');
        expect(skill.calibration.label).toBe(IRT_LABEL);
      }
    }
  });

  it('never uses banned over-claiming language on a library page', () => {
    for (const skill of librarySkills) {
      const label = skill.calibration.label.toLowerCase();
      expect(label).not.toContain('empirically calibrated');
      expect(label).not.toContain('certified');
    }
  });

  it('maps India-stack pages to India-stack skills instead of index fallbacks', () => {
    expect(getStackPage('sap')?.skills).toContain('sap-abap');
    expect(getStackPage('oracle')?.skills).toContain('oracle-hcm-cloud');
    expect(getStackPage('bfsi')?.skills).toContain('finacle-flexcube');
    expect(getRolePage('sap-abap-consultant')?.coreSkills).toContain('sap-abap');
    expect(getRolePage('core-banking-consultant')?.coreSkills).toContain('finacle-flexcube');
  });

  it('requires competitor honesty sections before a /vs page can ship', () => {
    for (const page of competitorPages) {
      expect(page.whereCompetitorIsBetter.length).toBeGreaterThanOrEqual(2);
      expect(page.qoriumEdges.length).toBeGreaterThanOrEqual(3);
      expect(page.matrix.length).toBeGreaterThanOrEqual(5);
      expect(page.sourceNote.length).toBeGreaterThan(0);
    }
  });

  it('gives the 5 priority compare pages hand-authored, sourced content', () => {
    for (const slug of ['vervoe', 'mettl', 'imocha', 'coderbyte', 'techcurators']) {
      const page = getCompetitorPage(slug);
      expect(page).toBeDefined();
      // Authored matrix rows are sourced from competitor public docs, not the generic template.
      expect(page!.matrix.every((row) => row.evidenceStatus === 'internal-source')).toBe(true);
    }
  });

  it('builds family sitemap entries for all programmatic families', () => {
    expect(seoSitemapFamilies.library).toHaveLength(librarySkills.length);
    expect(seoSitemapFamilies.roles).toHaveLength(rolePages.length);
    expect(seoSitemapFamilies.stacks).toHaveLength(stackPages.length);
    expect(seoSitemapFamilies.vs).toHaveLength(competitorPages.length);
    expect(seoSitemapFamilies.library[0]?.url).toMatch(/\/library\//);
  });

  it('prebuilds every canonical library page', () => {
    expect(dynamicParams).toBe(false);
    expect(generateStaticParams()).toHaveLength(librarySkills.length);
  });
});
