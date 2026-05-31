import type { Metadata } from 'next';

import { CardGrid, PageHero, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';
import { guides } from '@/content/phase4';

export const metadata: Metadata = {
  title: 'Hiring Guides',
  description:
    'QOrium guides for skills testing, DPDP-aware vendor evaluation, and hiring operations.',
  alternates: { canonical: '/resources/guides' },
};

export default function GuidesIndexPage() {
  return (
    <main>
      <PageHero
        eyebrow="Guides"
        title="Practical guides for defensible skills-first hiring."
        description="Each guide keeps the first section open and routes templates or deeper assets through QOrium sales."
      />
      <SectionBand title="Available guides">
        <CardGrid>
          {guides.map((guide) => (
            <SurfaceCard
              key={guide.slug}
              title={guide.title}
              href={`/resources/guides/${guide.slug}`}
            >
              {guide.summary}
            </SurfaceCard>
          ))}
        </CardGrid>
      </SectionBand>
    </main>
  );
}
