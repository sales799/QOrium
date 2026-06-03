import type { Metadata } from 'next';

import { PlatformOverviewPage } from '@/components/marketing/PhaseTwoPages';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Platform — ReadyBank, JD-Forge & Stack-Vault',
  description:
    'Explore QOrium ReadyBank, JD-Forge, and Stack-Vault product motions for assessment content, custom JD packs, and private enterprise libraries.',
  alternates: { canonical: '/platform' },
};

export default function PlatformPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Platform', path: '/platform' },
        ]}
      />
      <PlatformOverviewPage />
    </>
  );
}
