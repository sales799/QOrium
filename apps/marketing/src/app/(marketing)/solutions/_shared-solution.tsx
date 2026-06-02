import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  CardGrid,
  EnterpriseJourneyBand,
  PageHero,
  SectionBand,
  SurfaceCard,
} from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd, FAQPageJsonLd } from '@/components/seo/JsonLd';
import { phase4Faqs, solutionPages } from '@/content/phase4';

type Axis = (typeof solutionPages)[number]['axis'];
type Props = { params: Promise<{ slug: string }> };

export function solutionStaticParams(axis: Axis) {
  return solutionPages.filter((page) => page.axis === axis).map((page) => ({ slug: page.slug }));
}

export async function generateSolutionMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = solutionPages.find((item) => item.slug === slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.audience,
    alternates: { canonical: `/solutions/${page.axis}/${page.slug}` },
  };
}

export default async function SolutionDetailPage({ params }: Props) {
  const { slug } = await params;
  const page = solutionPages.find((item) => item.slug === slug);
  if (!page) notFound();
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Solutions', path: '/solutions/platforms' },
          { name: page.title, path: `/solutions/${page.axis}/${page.slug}` },
        ]}
      />
      <FAQPageJsonLd questions={phase4Faqs.slice(0, 2)} />
      <main>
        <PageHero
          eyebrow="Solution"
          title={page.title}
          description={page.audience}
          cta={{ label: 'Discuss this workflow', href: '/demo' }}
        />
        <SectionBand title="Why QOrium fits">
          <CardGrid>
            {page.wedges.map((wedge) => (
              <SurfaceCard key={wedge} title={wedge}>
                Built into the Phase 4 marketing surface without claiming backend-only capabilities
                as already shipped.
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>
        <EnterpriseJourneyBand
          title={`${page.title} needs a page-to-proof path.`}
          description="This solution page now closes the buyer loop from audience pain to QOrium wedge, trust review, related library evidence, and a demo path that can be scoped without unsupported public claims."
          proofPoints={[
            `Audience is named clearly: ${page.audience}`,
            'Wedges are presented as buyer decision criteria, not loose feature claims.',
            'The next action routes to a proof discussion with the page context intact.',
          ]}
          links={[
            {
              label: 'Discuss this workflow',
              href: `/demo?solution=${page.slug}`,
              body: 'Carry this solution context into a 20-minute proof walkthrough.',
            },
            {
              label: 'Review trust posture',
              href: '/trust',
              body: 'Check the public controls, method, science, and responsible AI surface.',
            },
            {
              label: 'Browse library evidence',
              href: '/library',
              body: 'Move from the solution to skills, roles, stacks, and calibration states.',
            },
          ]}
        />
      </main>
    </>
  );
}
