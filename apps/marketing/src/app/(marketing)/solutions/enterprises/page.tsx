import type { Metadata } from 'next';
import { SolutionPageLayout } from '@/components/site/SolutionPageLayout';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { enterprisesCopy } from '@/content/copy/solutions';

export const metadata: Metadata = {
  title: 'For enterprises & GCCs',
  description: enterprisesCopy.hero.sub,
};

export default function EnterprisesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Solutions', path: '/solutions/enterprises' },
          { name: 'Enterprises & GCCs', path: '/solutions/enterprises' },
        ]}
      />
      <SolutionPageLayout copy={enterprisesCopy} />
    </>
  );
}
