import type { Metadata } from 'next';

import {
  CardGrid,
  EvidenceRuleGrid,
  PageHero,
  RelatedRoutes,
  SectionBand,
  SurfaceCard,
  WorkflowSteps,
} from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd, FAQPageJsonLd } from '@/components/seo/JsonLd';
import { phase4Faqs } from '@/content/phase4';

export const metadata: Metadata = {
  title: 'QOrium Platform API',
  description:
    'API access for QOrium is in beta. Request access for assessment-library and hiring workflow integrations.',
  alternates: { canonical: '/platform/api' },
};

export default function PlatformApiPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Platform', path: '/platform' },
          { name: 'API', path: '/platform/api' },
        ]}
      />
      <FAQPageJsonLd questions={phase4Faqs.slice(0, 2)} />
      <>
        <PageHero
          eyebrow="Platform API"
          title="QOrium API docs are in beta."
          description="The public marketing surface is ready for API interest, but full OpenAPI docs wait for backend evidence. Teams can request early access now."
          cta={{ label: 'Request API access', href: '/demo' }}
        />
        <WorkflowSteps
          eyebrow="Integration workflow"
          title="Plan the API surface before wiring production hiring flows."
          description="The API page stays premium without inventing shipped endpoints beyond the current evidence gate."
          steps={[
            {
              title: 'Name the integration intent',
              body: 'Assessment library, candidate workflow, and score evidence are separated so buyers can map needs cleanly.',
            },
            {
              title: 'Keep beta status visible',
              body: 'The page invites early access while making the docs and backend milestone status explicit.',
            },
            {
              title: 'Route to proof surfaces',
              body: 'Related links point to library, trust, and demo paths instead of unsupported technical promises.',
            },
          ]}
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
              Fetch structured scorecards and audit notes when the backend milestone ships.
            </SurfaceCard>
          </CardGrid>
        </SectionBand>
        <SectionBand title="Evidence rules">
          <EvidenceRuleGrid
            rules={[
              {
                title: 'Beta language stays visible',
                body: 'The page can collect interest without pretending the full public docs are live.',
              },
              {
                title: 'No unsupported endpoint claims',
                body: 'Endpoint-level promises wait for backend evidence and OpenAPI publication.',
              },
              {
                title: 'Canonical platform route',
                body: '/platform/api is the indexed API page; /product/api redirects here.',
              },
            ]}
          />
        </SectionBand>
        <SectionBand title="Related pages">
          <RelatedRoutes
            links={[
              {
                label: 'Assessment library',
                href: '/library',
                body: 'See the public skill pages an API consumer would browse or map.',
              },
              {
                label: 'Trust center',
                href: '/trust',
                body: 'Review the evidence and security posture behind integrations.',
              },
              {
                label: 'Demo',
                href: '/demo',
                body: 'Request early access with a concrete workflow in mind.',
              },
            ]}
          />
        </SectionBand>
      </>
    </>
  );
}
