import { describe, expect, it } from 'vitest';

import { dynamicParams, generateStaticParams } from '@/app/(marketing)/library/[slug]/page';
import {
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
  it('ships the required page-family volumes', () => {
    expect(librarySkills.length).toBeGreaterThanOrEqual(1_000);
    expect(rolePages.length).toBeGreaterThanOrEqual(30);
    expect(stackPages.length).toBeGreaterThanOrEqual(12);
    expect(competitorPages.length).toBeGreaterThanOrEqual(10);
  });

  it('uses canonical S1-S4 paths from the SEO factory brief', () => {
    expect(getLibrarySkill('javascript')?.path).toBe('/library/javascript');
    expect(getRolePage('software')?.path).toBe('/solutions/role/software');
    expect(getRolePage('react-developer')?.path).toBe('/solutions/role/react-developer');
    expect(getStackPage('sap')?.path).toBe('/solutions/stack/sap');
    expect(getStackPage('sap-abap')?.path).toBe('/solutions/stack/sap-abap');
    expect(getCompetitorPage('vervoe')?.path).toBe('/vs/vervoe');
    expect(getCompetitorPage('mettl')?.path).toBe('/vs/mettl');
    expect(['vervoe', 'hackerrank', 'mettl', 'imocha', 'coderbyte'].every(getCompetitorPage)).toBe(
      true,
    );
  });

  it('keeps calibration honest on every library page', () => {
    const allowed = new Set(['IRT-calibrated', 'Beta', 'Authored']);

    for (const skill of librarySkills) {
      expect(allowed.has(skill.calibration.status)).toBe(true);
      expect(skill.calibration.label.length).toBeGreaterThan(0);
      expect(skill.sampleQuestions.length).toBeGreaterThanOrEqual(3);

      if (skill.calibration.itemCountCalibrated < 30) {
        expect(skill.calibration.status).not.toBe('IRT-calibrated');
        expect(skill.calibration.label).toContain('calibration in progress');
      }
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
      expect(page.matrix.length).toBeGreaterThanOrEqual(8);
      expect(page.sourceNote).toContain('live review');
    }
  });

  it('builds family sitemap entries for all programmatic families', () => {
    expect(seoSitemapFamilies.library).toHaveLength(librarySkills.length);
    expect(seoSitemapFamilies.roles).toHaveLength(rolePages.length);
    expect(seoSitemapFamilies.stacks).toHaveLength(stackPages.length);
    expect(seoSitemapFamilies.vs).toHaveLength(competitorPages.length);
    expect(seoSitemapFamilies.library[0]?.url).toMatch(/\/library\//);
  });

  it('prebuilds every generated library page', () => {
    expect(dynamicParams).toBe(false);
    expect(generateStaticParams()).toHaveLength(librarySkills.length);
  });
});
