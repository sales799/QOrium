import type { Metadata } from 'next';

import {
  CardGrid,
  EnterpriseJourneyBand,
  PageHero,
  SectionBand,
  SurfaceCard,
} from '@/components/phase4/MarketingSurface';
import { ItemListJsonLd, WebPageJsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/content/site.config';

const researchRoutes = [
  {
    title: 'AI Plagiarism Benchmark Protocol',
    href: '/research/plagiarism-benchmark',
    body: 'The public evidence protocol for anti-plagiarism claims before any customer-facing metric is published.',
  },
  {
    title: 'Science and calibration',
    href: '/science',
    body: 'How QOrium describes difficulty, discrimination, scoring posture, and release gates.',
  },
  {
    title: 'Method and role graph',
    href: '/method',
    body: 'The role, skill, stack, difficulty, and format model behind the assessment library.',
  },
];

export const metadata: Metadata = {
  title: 'QOrium Research',
  description:
    'QOrium research hub for benchmark protocols, calibration method, and evidence-gated assessment claims.',
  alternates: { canonical: '/research' },
};

export default function ResearchHubPage() {
  return (
    <>
      <WebPageJsonLd
        name="QOrium Research"
        description={metadata.description ?? ''}
        url={`${siteConfig.url}/research`}
        type="CollectionPage"
      />
      <ItemListJsonLd
        name="QOrium research and method routes"
        url={`${siteConfig.url}/research`}
        items={researchRoutes.map((route) => ({
          name: route.title,
          url: `${siteConfig.url}${route.href}`,
          description: route.body,
        }))}
      />
      <main>
        <PageHero
          eyebrow="Research"
          title="Benchmark and method routes for evidence-first assessment buyers."
          description="The research hub collects QOrium's public benchmark protocol, calibration posture, and method documentation so buyers can inspect evidence rules before trusting a claim."
          cta={{ label: 'Open benchmark protocol', href: '/research/plagiarism-benchmark' }}
        />

        <SectionBand
          title="Research surfaces"
          description="These routes explain what is measured, what is still gated, and how claims connect to the assessment engine."
        >
          <CardGrid>
            {researchRoutes.map((route) => (
              <SurfaceCard key={route.href} title={route.title} href={route.href}>
                {route.body}
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>

        <EnterpriseJourneyBand
          title="Research routes keep public claims honest."
          description="QOrium uses research pages to show the method, the evidence gate, and the current claim boundary before buyers reach commercial proof."
          proofPoints={[
            'Benchmark protocol is public before performance numbers are claimed.',
            'Science and method routes explain how assessment evidence is structured.',
            'Trust routes remain the review layer for security, privacy, and governance.',
          ]}
          links={[
            {
              label: 'Review trust shell',
              href: '/trust',
              body: 'Check security, DPDP, responsible AI, and launch evidence.',
            },
            {
              label: 'Try proof surfaces',
              href: '/try',
              body: 'Inspect JD-Forge and graded-answer workflows.',
            },
            {
              label: 'Book research walkthrough',
              href: '/demo?surface=research',
              body: 'Map research evidence to your assessment procurement questions.',
            },
          ]}
        />
      </main>
    </>
  );
}
