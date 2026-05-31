import type { Metadata } from 'next';

import { CardGrid, PageHero, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd, FAQPageJsonLd } from '@/components/seo/JsonLd';
import { phase4Faqs } from '@/content/phase4';

export const metadata: Metadata = {
  title: 'QOrium API',
  description:
    'API access for QOrium is in beta. Request access for assessment-library and hiring workflow integrations.',
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
          title="QOrium API docs are in beta."
          description="The public marketing surface is ready for API interest, but full OpenAPI docs wait for the backend M20 milestone. Teams can request early access now."
          cta={{ label: 'Request API access', href: '/demo' }}
        />
        <SectionBand title="Planned surfaces">
          <CardGrid>
            <SurfaceCard title="Assessment library API">
              Browse approved skill packs and role templates.
            </SurfaceCard>
            <SurfaceCard title="Candidate workflow API">
              Create invitations and retrieve status when backend evidence lands.
            </SurfaceCard>
            <SurfaceCard title="Score evidence API">
              Fetch structured scorecards and audit notes when M20 ships.
            </SurfaceCard>
          </CardGrid>
        </SectionBand>
      </main>
    </>
  );
}
