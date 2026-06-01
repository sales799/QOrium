import type { Metadata } from 'next';

import { CardGrid, PageHero, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { competitorPages } from '@/content/seo-graph';

export const metadata: Metadata = {
  title: 'QOrium Comparisons',
  description:
    'Honesty-led QOrium comparison pages with competitor strengths and evidence-gated claims.',
  alternates: { canonical: '/vs' },
};

export default function VsHubPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Compare', path: '/vs' },
        ]}
      />
      <main>
        <PageHero
          eyebrow="Comparisons"
          title="What QOrium does differently"
          description={`${competitorPages.length} comparison pages keep the competitor-better section visible and keep unsupported numeric claims out of public copy.`}
          cta={{ label: 'Talk through migration', href: '/demo?surface=vs' }}
        />
        <SectionBand title="Comparison pages">
          <CardGrid>
            {competitorPages.map((page) => (
              <SurfaceCard key={page.slug} title={`QOrium vs ${page.competitor}`} href={page.path}>
                {page.summary}
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>
      </main>
    </>
  );
}
