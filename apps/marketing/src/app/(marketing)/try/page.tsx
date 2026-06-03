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

const proofRoutes = [
  {
    title: 'JD-Forge demo',
    href: '/try/jd-forge',
    body: 'Paste a job description and see how QOrium maps it into skills, difficulty bands, and an assessment plan.',
  },
  {
    title: 'Graded-answer viewer',
    href: '/try/graded-answer',
    body: 'Inspect a public grading exemplar with rubric, score breakdown, and audit metadata.',
  },
  {
    title: 'Sample packs',
    href: '/resources/sample-packs',
    body: 'Preview public sample packs before requesting protected production content.',
  },
];

export const metadata: Metadata = {
  title: 'Try QOrium',
  description:
    'Explore QOrium public proof surfaces for JD-Forge, graded answers, and sample packs.',
  alternates: { canonical: '/try' },
};

export default function TryHubPage() {
  return (
    <>
      <WebPageJsonLd
        name="Try QOrium"
        description={metadata.description ?? ''}
        url={`${siteConfig.url}/try`}
        type="CollectionPage"
      />
      <ItemListJsonLd
        name="QOrium public proof surfaces"
        url={`${siteConfig.url}/try`}
        items={proofRoutes.map((route) => ({
          name: route.title,
          url: `${siteConfig.url}${route.href}`,
          description: route.body,
        }))}
      />
      <main>
        <PageHero
          eyebrow="Try QOrium"
          title="Proof routes you can inspect before a sales call."
          description="The public try hub collects the safe proof surfaces: JD-to-assessment mapping, grader transparency, and public sample-pack previews. It keeps private banks protected while letting buyers inspect the workflow."
          cta={{ label: 'Try JD-Forge', href: '/try/jd-forge' }}
        />

        <SectionBand
          title="Choose a public proof surface"
          description="Each route is designed to prove one buyer question without exposing private candidate data or full production banks."
        >
          <CardGrid>
            {proofRoutes.map((route) => (
              <SurfaceCard key={route.href} title={route.title} href={route.href}>
                {route.body}
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>

        <EnterpriseJourneyBand
          title="Proof should create a next decision, not a vague demo."
          description="Use the try hub to inspect the workflow, then move into trust review, sample-pack inspection, or a scoped walkthrough with your real role."
          proofPoints={[
            'JD-Forge shows the mapped plan and honest low-confidence state.',
            'The grader route exposes rubric, score, and reasoning trace.',
            'Sample packs stay bounded so private content is not leaked publicly.',
          ]}
          links={[
            {
              label: 'Review trust posture',
              href: '/trust',
              body: 'Check security, DPDP, responsible AI, and evidence-gated claims.',
            },
            {
              label: 'Open research protocol',
              href: '/research',
              body: 'See how QOrium frames benchmark evidence before publishing claims.',
            },
            {
              label: 'Book proof walkthrough',
              href: '/demo?surface=try',
              body: 'Map a real role to the right proof route and buyer motion.',
            },
          ]}
        />
      </main>
    </>
  );
}
