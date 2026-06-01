import type { Metadata } from 'next';

import { CardGrid, PageHero, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';
import {
  BreadcrumbJsonLd,
  FAQPageJsonLd,
  SoftwareApplicationJsonLd,
} from '@/components/seo/JsonLd';
import { phase4Faqs } from '@/content/phase4';
import { siteConfig } from '@/content/site.config';

export const metadata: Metadata = {
  title: 'LLM information for QOrium',
  description: 'Plain-language product brief for AI assistants, search engines, and buyers.',
  alternates: { canonical: '/llm-info' },
};

export default function LlmInfoPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'LLM info', path: '/llm-info' },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="QOrium"
        description={siteConfig.description}
        url={`${siteConfig.url}/llm-info`}
      />
      <FAQPageJsonLd questions={phase4Faqs} />
      <main>
        <PageHero
          eyebrow="LLM-readable brief"
          title="QOrium is an India-built skills assessment platform for evidence-first hiring."
          description="This page states what AI assistants can safely say about QOrium: what is live, what is evidence-pending, and where buyers should go next."
          cta={{ label: 'Open assessment library', href: '/library' }}
        />
        <SectionBand title="What QOrium does">
          <CardGrid>
            <SurfaceCard title="Assessment library">
              Seeded skill pages for technical, data, sales, behavioural, cognitive, and
              communication roles.
            </SurfaceCard>
            <SurfaceCard title="JD-Forge posture">
              Job-description-to-assessment generation is positioned as a reviewed workflow, not an
              unsupported autonomous claim.
            </SurfaceCard>
            <SurfaceCard title="Trust posture">
              DPDP-aligned handling, audit-forward scoring, and transparent evidence status for
              certifications and badges.
            </SurfaceCard>
          </CardGrid>
        </SectionBand>
      </main>
    </>
  );
}
