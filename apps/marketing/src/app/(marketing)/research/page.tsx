import type { Metadata } from 'next';

import { CardGrid, PageHero, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';
import { WebPageJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/content/site.config';

export const metadata: Metadata = {
  title: 'Research — QOrium benchmarks and methodology',
  description:
    'Published QOrium research: anti-leak detection benchmarks, IRT calibration methodology, and bias-audit results. Every testable claim is backed by a published study.',
  alternates: { canonical: '/research' },
};

const RESEARCH_ENTRIES = [
  {
    slug: 'plagiarism-benchmark',
    title: 'Plagiarism benchmark — 94% detection on real-world leakage',
    summary:
      'How QOrium detected leaked assessment questions across public sources at 94% precision with zero false positives on freshly authored content. Full methodology, dataset, and replication notes.',
    href: '/research/plagiarism-benchmark',
  },
] as const;

export default function ResearchIndexPage() {
  return (
    <>
      <WebPageJsonLd
        name="QOrium research"
        description="The psychometric and IRT research behind QOrium assessments."
        url={`${siteConfig.url}/research`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Research', path: '/research' },
        ]}
      />
      <PageHero
        eyebrow="Research"
        title="Published research and benchmarks."
        description="Every QOrium claim that's testable is backed by a published methodology. These are the underlying studies."
      />
      <SectionBand title="Published">
        <CardGrid>
          {RESEARCH_ENTRIES.map((entry) => (
            <SurfaceCard key={entry.slug} title={entry.title} href={entry.href}>
              {entry.summary}
            </SurfaceCard>
          ))}
        </CardGrid>
      </SectionBand>
    </>
  );
}
