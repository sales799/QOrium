import { describe, expect, it } from 'vitest';

import {
  actionNavLinks,
  directNavLinks,
  evidenceFlags,
  footerSitemap,
  megaMenuPanels,
  visibleLinks,
} from '../marketing-ia';

describe('marketing IA phase 1 navigation', () => {
  it('exposes the locked top-level navigation set', () => {
    expect(megaMenuPanels.map((panel) => panel.label)).toEqual([
      'Platform',
      'Solutions',
      'Why QOrium',
      'Resources',
    ]);
    expect(directNavLinks.map((link) => link.label)).toEqual(['Pricing']);
    expect(actionNavLinks.map((link) => link.label)).toEqual(['Book a demo', 'Sign in']);
  });

  it('keeps the footer aligned to the full redesign sitemap', () => {
    expect(footerSitemap.map((column) => column.heading)).toEqual([
      'Platform',
      'Library',
      'Solutions',
      'Why QOrium',
      'Resources',
      'Compare',
      'Company',
    ]);

    const visibleFooter = footerSitemap.flatMap((column) =>
      visibleLinks(column.links).map((link) => `${column.heading}:${link.label}`),
    );

    expect(visibleFooter).toContain('Library:Skill Library');
    expect(visibleFooter).toContain('Solutions:Assessment Platforms');
    expect(visibleFooter).toContain('Why QOrium:Responsible AI');
    expect(visibleFooter).toContain('Resources:Sample Packs');
    expect(visibleFooter).toContain('Company:Cookie Policy');
  });

  it('keeps each mega-menu panel complete for desktop and mobile renderers', () => {
    for (const panel of megaMenuPanels) {
      expect(panel.columns).toHaveLength(3);
      expect(panel.promo.title).toBeTruthy();
      expect(panel.promo.cta).toBeTruthy();
      expect(panel.columns.flatMap((column) => visibleLinks(column.links)).length).toBeGreaterThan(
        0,
      );
    }
  });

  it('hides evidence-gated links entirely until their flags are enabled', () => {
    expect(evidenceFlags.caseStudies).toBe(false);
    expect(evidenceFlags.customerStories).toBe(false);
    expect(evidenceFlags.externalLogoRail).toBe(false);
    expect(evidenceFlags.outcomeStats).toBe(false);

    const resourceLinks = megaMenuPanels
      .find((panel) => panel.label === 'Resources')!
      .columns.flatMap((column) => visibleLinks(column.links).map((link) => link.label));
    const footerLinks = footerSitemap.flatMap((column) =>
      visibleLinks(column.links).map((link) => link.label),
    );

    expect(resourceLinks).not.toContain('Case Studies');
    expect(resourceLinks).not.toContain('Customer Stories');
    expect(footerLinks).not.toContain('Case Studies');
    expect(footerLinks).not.toContain('Customer Stories');
  });
});
