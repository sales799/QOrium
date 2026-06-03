import type { Metadata } from 'next';

import { CardGrid, PageHero, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd, ItemListJsonLd, WebPageJsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/content/site.config';

const trySurfaces = [
  {
    title: 'JD-Forge public demo',
    href: '/try/jd-forge',
    body: 'Paste a role brief and inspect how QOrium maps it into skills, difficulty, and a defensible assessment plan.',
  },
  {
    title: 'Graded-answer viewer',
    href: '/try/graded-answer',
    body: 'Review a rubric, score breakdown, reasoning trace, and audit metadata without exposing private candidate responses.',
  },
] as const;

export const metadata: Metadata = {
  title: 'Try QOrium',
  description:
    'Open QOrium public proof surfaces for JD-Forge assessment planning and auditable graded-answer review.',
  alternates: { canonical: '/try' },
};

export default function TryHubPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Try QOrium', path: '/try' },
        ]}
      />
      <WebPageJsonLd
        name="Try QOrium"
        description={metadata.description ?? ''}
        url={`${siteConfig.url}/try`}
      />
      <ItemListJsonLd
        name="QOrium public proof surfaces"
        url={`${siteConfig.url}/try`}
        items={trySurfaces.map((surface) => ({
          name: surface.title,
          url: `${siteConfig.url}${surface.href}`,
          description: surface.body,
        }))}
      />
      <main>
        <PageHero
          eyebrow="Try QOrium"
          title="Inspect the proof surfaces before booking a walkthrough."
          description="These public demos show how QOrium turns role inputs and answer evidence into reviewable hiring artifacts. They are intentionally scoped to shipped, inspectable flows."
          cta={{ label: 'Try JD-Forge', href: '/try/jd-forge' }}
        />

        <SectionBand
          title="Public proof surfaces"
          description="Start with a job description or a scored answer and follow the evidence trail."
        >
          <CardGrid columns="md:grid-cols-2">
            {trySurfaces.map((surface) => (
              <SurfaceCard key={surface.href} title={surface.title} href={surface.href}>
                {surface.body}
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>
      </main>
    </>
  );
}
