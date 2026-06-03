import type { Metadata } from 'next';

import { CardGrid, PageHero, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd, ItemListJsonLd, WebPageJsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/content/site.config';

const researchPages = [
  {
    title: 'AI Plagiarism Benchmark Protocol',
    href: '/research/plagiarism-benchmark',
    body: 'QOrium publishes the benchmark method and evidence rules before any public accuracy claim is made.',
  },
] as const;

export const metadata: Metadata = {
  title: 'QOrium Research',
  description:
    'Research protocols, benchmark methods, and evidence-gated notes for QOrium assessment integrity.',
  alternates: { canonical: '/research' },
};

export default function ResearchHubPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Research', path: '/research' },
        ]}
      />
      <WebPageJsonLd
        name="QOrium Research"
        description={metadata.description ?? ''}
        url={`${siteConfig.url}/research`}
      />
      <ItemListJsonLd
        name="QOrium research library"
        url={`${siteConfig.url}/research`}
        items={researchPages.map((page) => ({
          name: page.title,
          url: `${siteConfig.url}${page.href}`,
          description: page.body,
        }))}
      />
      <main>
        <PageHero
          eyebrow="Research"
          title="Public research pages stay evidence-gated."
          description="QOrium publishes methods, release gates, and benchmark protocols before it turns measurements into customer-facing claims."
          cta={{ label: 'Open benchmark protocol', href: '/research/plagiarism-benchmark' }}
        />

        <SectionBand
          title="Published protocols"
          description="Each page says what is known, what is not yet claimed, and what evidence is required before release."
        >
          <CardGrid columns="md:grid-cols-2">
            {researchPages.map((page) => (
              <SurfaceCard key={page.href} title={page.title} href={page.href}>
                {page.body}
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>
      </main>
    </>
  );
}
