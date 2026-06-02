import type { Metadata } from 'next';

import { BuyerSolutionPage } from '@/components/marketing/PhaseTwoPages';
import { BreadcrumbJsonLd, WebPageJsonLd } from '@/components/seo/JsonLd';
import { solutionBuyerPages } from '@/content/copy/phase2';
import { siteConfig } from '@/content/site.config';

const solution = solutionBuyerPages['assessment-platforms'];

export const metadata: Metadata = {
  title: 'QOrium for Assessment Platforms',
  description: solution.description,
  alternates: { canonical: solution.route },
};

export default function AssessmentPlatformsSolutionPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Solutions', path: '/solutions' },
          { name: 'Assessment Platforms', path: solution.route },
        ]}
      />
      <WebPageJsonLd
        name="QOrium for Assessment Platforms"
        description={solution.description}
        url={`${siteConfig.url}${solution.route}`}
      />
      <BuyerSolutionPage solution={solution} />
    </>
  );
}
