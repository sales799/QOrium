import type { Metadata } from 'next';

import { CardGrid, PageHero, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd, FAQPageJsonLd } from '@/components/seo/JsonLd';
import { phase4Faqs } from '@/content/phase4';

export const metadata: Metadata = {
  title: 'QOrium API',
  description: 'Public-preview QOrium API documentation for live proof and demo endpoints.',
  alternates: { canonical: '/product/api' },
};

export default function ApiLandingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Product API', path: '/product/api' },
        ]}
      />
      <FAQPageJsonLd questions={phase4Faqs.slice(0, 2)} />
      <main>
        <PageHero
          eyebrow="API docs"
          title="QOrium API docs are public-preview ready."
          description="OpenAPI 3.1 contracts are published for the live public proof APIs: JD-Forge demo plans, sample-pack unlocks, grader exemplars, and trust evidence."
          cta={{ label: 'Open API documentation', href: '/resources/docs' }}
        />
        <SectionBand title="Documented surfaces">
          <CardGrid>
            <SurfaceCard title="JD-Forge demo API" href="/resources/docs">
              Generate a job-description-based assessment plan from public proof inputs.
            </SurfaceCard>
            <SurfaceCard title="Sample-pack API" href="/resources/docs">
              Preview and unlock buyer-facing sample packs with lead-gated artifacts.
            </SurfaceCard>
            <SurfaceCard title="Trust evidence API" href="/resources/docs">
              Read quality-gate, plagiarism-benchmark, and responsible-AI status metadata.
            </SurfaceCard>
          </CardGrid>
        </SectionBand>
      </main>
    </>
  );
}
