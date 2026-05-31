import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CardGrid, PageHero, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';
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
      </main>
    </>
  );
}
