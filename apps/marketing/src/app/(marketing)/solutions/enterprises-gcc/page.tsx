import type { Metadata } from 'next';

import { BuyerSolutionPage } from '@/components/marketing/PhaseTwoPages';
import { BreadcrumbJsonLd, WebPageJsonLd } from '@/components/seo/JsonLd';
import { solutionBuyerPages } from '@/content/copy/phase2';
import { siteConfig } from '@/content/site.config';

const solution = solutionBuyerPages['enterprises-gcc'];

export const metadata: Metadata = {
  title: 'QOrium for Enterprises and GCCs',
  description: solution.description,
  alternates: { canonical: solution.route },
};

export default function EnterprisesGccSolutionPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Solutions', path: '/solutions' },
          { name: 'Enterprises and GCCs', path: solution.route },
        ]}
      />
      <WebPageJsonLd
        name="QOrium for Enterprises and GCCs"
        description={solution.description}
        url={`${siteConfig.url}${solution.route}`}
      />
      <BuyerSolutionPage solution={solution} />
    </>
  );
}
