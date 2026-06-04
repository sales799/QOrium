import { describe, expect, it } from 'vitest';

import {
  actionNavLinks,
  directNavLinks,
  footerSitemap,
  megaMenuPanels,
  visibleLinks,
  type MegaMenuPromo,
  type NavLink,
} from '@/content/marketing-ia';
import { resolvePublicEvidenceFlag, resolvePublicEvidenceFlags } from '@/content/evidence-flags';

const SHIPPED_STATIC_ROUTES = new Set([
  '/',
  '/about',
  '/anti-leak',
  '/authoring',
  '/benchmarks',
  '/blog',
  '/changelog',
  '/compliance-dpdp',
  '/contact',
  '/customer/talpro-india',
  '/customers',
  '/demo',
  '/dpa',
  '/glossary',
  '/library',
  '/llm-info',
  '/method',
  '/platform',
  '/platform/jd-forge',
  '/platform/readybank',
  '/platform/stack-vault',
  '/press-kit',
  '/pricing',
  '/privacy',
  '/product',
  '/product/api',
  '/resources',
  '/resources/docs',
  '/resources/guides',
  '/resources/job-descriptions',
  '/resources/sample-packs',
  '/research/plagiarism-benchmark',
  '/responsible-ai',
  '/science',
  '/security',
  '/signin',
  '/solutions/assessment-platforms',
  '/solutions/enterprises-gcc',
  '/solutions/staffing-firms',
  '/terms',
  '/trust',
  '/trust/bias-audit',
  '/trust/security',
  '/trust/sub-processors',
  '/try/graded-answer',
  '/try/jd-forge',
  '/vs/coderbyte',
  '/vs/hackerrank',
  '/vs/imocha',
  '/vs/mettl',
  '/vs/techcurators',
  '/vs/vervoe',
]);

function stripHash(href: string): string {
  return href.split('#')[0] ?? href;
}

function collectVisibleLinks(): Array<NavLink | MegaMenuPromo> {
  const items: Array<NavLink | MegaMenuPromo> = [
    ...directNavLinks,
    ...actionNavLinks,
    ...megaMenuPanels.flatMap((panel) => [
      ...panel.columns.flatMap((column) => column.links),
      panel.promo,
    ]),
    ...footerSitemap.flatMap((column) => column.links),
  ];

  return items.flatMap((item) => visibleLinks([item]));
}

describe('Phase 1 marketing IA', () => {
  it('ships the locked top-level mega-menu shape', () => {
    expect(megaMenuPanels.map((panel) => panel.label)).toEqual([
      'Platform',
      'Solutions',
      'Why QOrium',
      'Resources',
    ]);
    expect(directNavLinks.map((link) => link.label)).toEqual(['Pricing']);
    expect(actionNavLinks.map((link) => link.label)).toEqual(['Book a demo', 'Sign in']);

    for (const panel of megaMenuPanels) {
      expect(panel.columns).toHaveLength(3);
      expect(panel.promo.title).toBeTruthy();
      expect(panel.promo.cta).toBeTruthy();
      expect(panel.columns.every((column) => visibleLinks(column.links).length > 0)).toBe(true);
    }
  });

  it('keeps evidence-gated proof links hidden until a flag flips', () => {
    const resourceLinks = megaMenuPanels
      .find((panel) => panel.label === 'Resources')!
      .columns.flatMap((column) => visibleLinks(column.links))
      .map((link) => link.label);

    expect(resourceLinks).toContain('Sample Packs');
    expect(resourceLinks).not.toContain('Case Studies');
    expect(resourceLinks).not.toContain('Customer Stories');
  });

  it('resolves public feature flags for client-rendered navigation', () => {
    const flags = resolvePublicEvidenceFlags({
      NEXT_PUBLIC_QORIUM_EVIDENCE_FLAG_CASE_STUDIES: 'true',
      NEXT_PUBLIC_QORIUM_EVIDENCE_FLAG_SAMPLE_PACK: 'false',
    });

    expect(flags.caseStudies).toEqual({
      enabled: true,
      source: 'env:NEXT_PUBLIC_QORIUM_EVIDENCE_FLAG_CASE_STUDIES',
    });
    expect(flags.samplePack).toEqual({
      enabled: false,
      source: 'env:NEXT_PUBLIC_QORIUM_EVIDENCE_FLAG_SAMPLE_PACK',
    });
    expect(resolvePublicEvidenceFlag('outcomeStats').enabled).toBe(false);
  });

  it('covers the full footer sitemap columns', () => {
    expect(footerSitemap.map((column) => column.heading)).toEqual([
      'Platform',
      'Solutions',
      'Why QOrium',
      'Resources',
      'Compare',
      'Company',
    ]);
  });

  it('does not expose visible static links to missing routes', () => {
    const missing = collectVisibleLinks()
      .filter((link) => !('external' in link && link.external))
      .map((link) => stripHash(link.href))
      .filter((href) => {
        if (href.startsWith('/blog/')) return false;
        if (href.startsWith('/solutions/role/')) return false;
        if (href.startsWith('/solutions/stack/')) return false;
        if (href.startsWith('/resources/guides/')) return false;
        if (href.startsWith('/resources/job-descriptions/')) return false;
        return !SHIPPED_STATIC_ROUTES.has(href);
      });

    expect([...new Set(missing)]).toEqual([]);
  });
});
