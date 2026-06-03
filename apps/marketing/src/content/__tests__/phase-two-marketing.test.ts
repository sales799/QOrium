import * as React from 'react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import AssessmentPlatformsPage from '@/app/(marketing)/solutions/assessment-platforms/page';
import EnterprisesGccPage from '@/app/(marketing)/solutions/enterprises-gcc/page';
import StaffingFirmsPage from '@/app/(marketing)/solutions/staffing-firms/page';
import JdForgePage from '@/app/(marketing)/platform/jd-forge/page';
import SamplePacksPage from '@/app/(marketing)/resources/sample-packs/page';
import ReadyBankPage from '@/app/(marketing)/platform/readybank/page';
import ResearchHubPage from '@/app/(marketing)/research/page';
import StackVaultPage from '@/app/(marketing)/platform/stack-vault/page';
import TryHubPage from '@/app/(marketing)/try/page';
import TryJdForgePage from '@/app/(marketing)/try/jd-forge/page';
import { evidenceFlags, footerSitemap, megaMenuPanels, visibleLinks } from '@/content/marketing-ia';
import { platformProducts, solutionBuyerPages } from '@/content/copy/phase2';

Object.assign(globalThis, { React });

type JsonLdData = {
  '@type'?: string;
  itemListElement?: Array<{ name: string; item: string }>;
};

function jsonLdFor(Page: () => React.ReactNode) {
  const html = renderToStaticMarkup(createElement(Page));
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">(.+?)<\/script>/g)];

  return scripts.map(([, raw]) => {
    return JSON.parse(raw ?? '{}') as JsonLdData;
  });
}

function jsonLdTypesFor(Page: () => React.ReactNode) {
  return jsonLdFor(Page).map((data) => data['@type']);
}

describe('phase two marketing pages', () => {
  it('ships the seven core Phase 2 routes with buyer-fit content', () => {
    expect(Object.values(platformProducts).map((product) => product.route)).toEqual([
      '/platform/readybank',
      '/platform/jd-forge',
      '/platform/stack-vault',
    ]);
    expect(Object.values(solutionBuyerPages).map((solution) => solution.route)).toEqual([
      '/solutions/assessment-platforms',
      '/solutions/enterprises-gcc',
      '/solutions/staffing-firms',
    ]);

    for (const product of Object.values(platformProducts)) {
      expect(product.workflow).toHaveLength(3);
      expect(product.pricingTables.length).toBeGreaterThanOrEqual(1);
      expect(product.faq.length).toBeGreaterThanOrEqual(2);
      expect(product.proof.length).toBeGreaterThanOrEqual(3);
    }

    for (const solution of Object.values(solutionBuyerPages)) {
      expect(solution.matchedSkus).toHaveLength(3);
      expect(solution.workflow).toHaveLength(3);
      expect(solution.indiaProof.length).toBeGreaterThanOrEqual(3);
      expect(solution.description).toContain('QOrium');
    }
  });

  it('emits Product, FAQ, and breadcrumb JSON-LD on product pages', () => {
    for (const Page of [ReadyBankPage, JdForgePage, StackVaultPage]) {
      expect(jsonLdTypesFor(Page)).toEqual(
        expect.arrayContaining(['BreadcrumbList', 'Product', 'FAQPage']),
      );
    }
  });

  it('emits WebPage and breadcrumb JSON-LD on buyer solution pages', () => {
    for (const Page of [AssessmentPlatformsPage, EnterprisesGccPage, StaffingFirmsPage]) {
      const data = jsonLdFor(Page);
      const breadcrumb = data.find((entry) => entry['@type'] === 'BreadcrumbList');

      expect(data.map((entry) => entry['@type'])).toEqual(
        expect.arrayContaining(['BreadcrumbList', 'WebPage']),
      );
      expect(breadcrumb?.itemListElement?.[1]?.item).toBe('https://qorium.online/solutions');
    }
  });

  it('emits structured data on interactive proof surfaces', () => {
    expect(jsonLdTypesFor(TryHubPage)).toEqual(
      expect.arrayContaining(['BreadcrumbList', 'WebPage', 'ItemList']),
    );
    expect(jsonLdTypesFor(TryJdForgePage)).toEqual(
      expect.arrayContaining(['WebPage', 'SoftwareApplication']),
    );
    expect(jsonLdTypesFor(SamplePacksPage)).toEqual(
      expect.arrayContaining(['CollectionPage', 'ItemList']),
    );
    expect(jsonLdTypesFor(ResearchHubPage)).toEqual(
      expect.arrayContaining(['BreadcrumbList', 'WebPage', 'ItemList']),
    );
  });

  it('hides benchmark navigation until evidence is released', () => {
    expect(evidenceFlags.benchmarks).toBe(false);

    const visibleMenuLinks = megaMenuPanels.flatMap((panel) =>
      panel.columns.flatMap((column) => visibleLinks(column.links)),
    );
    const visibleFooterLinks = footerSitemap.flatMap((column) => visibleLinks(column.links));

    expect(visibleMenuLinks.some((link) => link.label.match(/benchmark/i))).toBe(false);
    expect(visibleFooterLinks.some((link) => link.label.match(/benchmark/i))).toBe(false);
  });
});
