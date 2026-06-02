import type { Metadata } from 'next';

import { BuyerSolutionPage } from '@/components/marketing/PhaseTwoPages';
import { BreadcrumbJsonLd, WebPageJsonLd } from '@/components/seo/JsonLd';
import { solutionBuyerPages } from '@/content/copy/phase2';
import { siteConfig } from '@/content/site.config';

const solution = solutionBuyerPages['staffing-firms'];

export const metadata: Metadata = {
  title: 'QOrium for Staffing Firms',
  description: solution.description,
  alternates: { canonical: solution.route },
};

export default function StaffingFirmsSolutionPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Solutions', path: '/solutions' },
          { name: 'Staffing Firms', path: solution.route },
        ]}
      />
      <WebPageJsonLd
        name="QOrium for Staffing Firms"
        description={solution.description}
        url={`${siteConfig.url}${solution.route}`}
      />
      <BuyerSolutionPage solution={solution} />
    </>
  );
}
