import type { Metadata } from 'next';
import { SolutionPageLayout } from '@/components/site/SolutionPageLayout';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { platformsCopy } from '@/content/copy/solutions';

export const metadata: Metadata = {
  title: 'For assessment platforms',
  description: platformsCopy.hero.sub,
};

export default function PlatformsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Solutions', path: '/solutions/platforms' },
          { name: 'Platforms', path: '/solutions/platforms' },
        ]}
      />
      <SolutionPageLayout copy={platformsCopy} />
    </>
  );
}
