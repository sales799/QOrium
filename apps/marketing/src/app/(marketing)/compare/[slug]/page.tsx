import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  CardGrid,
  EvidenceList,
  PageHero,
  SectionBand,
  SurfaceCard,
} from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd, FAQPageJsonLd } from '@/components/seo/JsonLd';
import { comparePages, phase4Faqs } from '@/content/phase4';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return comparePages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = comparePages.find((item) => item.slug === slug);
  if (!page) return {};
  return {
    title: `QOrium vs ${page.competitor}`,
    description: `A factual comparison of QOrium and ${page.competitor} for skills-first hiring teams.`,
    alternates: { canonical: `/compare/${slug}` },
  };
}

export default async function ComparePage({ params }: Props) {
  const { slug } = await params;
  const page = comparePages.find((item) => item.slug === slug);
  if (!page) notFound();
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Compare', path: '/compare/qorium-vs-vervoe' },
          { name: `QOrium vs ${page.competitor}`, path: `/compare/${slug}` },
        ]}
      />
      <FAQPageJsonLd
        questions={[
          {
            question: `Is QOrium a replacement for ${page.competitor}?`,
            answer:
              'It depends on the hiring workflow. Use this page for public-positioning differences and book a demo for migration details.',
          },
          ...phase4Faqs.slice(0, 2),
        ]}
      />
      <main>
        <PageHero
          eyebrow="Comparison"
          title={`QOrium vs ${page.competitor}`}
          description={page.summary}
          cta={{
            label: `Plan migration from ${page.competitor}`,
            href: `/demo?from=${page.competitor.toLowerCase().replaceAll(' ', '-')}`,
          }}
        />
        <SectionBand title={`${page.competitor} is strong where it is proven`}>
          <EvidenceList items={page.strengths} />
        </SectionBand>
        <SectionBand title="Where QOrium is different">
          <CardGrid>
            {page.qoriumEdge.map((edge) => (
              <SurfaceCard key={edge} title={edge}>
                QOrium's India-first, evidence-led wedge.
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>
      </main>
    </>
  );
}
