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
import { competitorPages, getCompetitorPage } from '@/content/seo-graph';
import { siteConfig } from '@/content/site.config';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = true;

export function generateStaticParams() {
  return competitorPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getCompetitorPage(slug);
  if (!page) return {};
  const fullDescription = `${page.summary} Review an honesty-led comparison with QOrium edges and visible competitor strengths.`;
  const description =
    fullDescription.length <= 160
      ? fullDescription
      : `${fullDescription.slice(0, 157).replace(/\s+\S*$/, '')}…`;
  return {
    title: { absolute: `QOrium vs ${page.competitor}` },
    description,
    alternates: { canonical: page.path },
  };
}

export default async function VsPage({ params }: Props) {
  const { slug } = await params;
  const page = getCompetitorPage(slug);
  if (!page) notFound();
  const faq = [
    {
      question: `Is QOrium a direct replacement for ${page.competitor}?`,
      answer:
        'It depends on the hiring workflow. QOrium is positioned as a question-bank and evidence layer with India-stack depth.',
    },
    {
      question: `Where is ${page.competitor} better?`,
      answer: page.whereCompetitorIsBetter.join(' '),
    },
  ];
  const comparisonJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Table',
    name: `QOrium vs ${page.competitor}`,
    url: `${siteConfig.url}${page.path}`,
    about: page.matrix.map((row) => row.dimension),
  };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Compare', path: '/vs' },
          { name: `QOrium vs ${page.competitor}`, path: page.path },
        ]}
      />
      <FAQPageJsonLd questions={faq} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(comparisonJsonLd) }}
      />
      <main>
        <PageHero
          eyebrow="Comparison"
          title={`QOrium vs ${page.competitor}`}
          description={page.summary}
          cta={{ label: 'Plan a proof run', href: `/demo?from=${page.slug}` }}
        />
        <SectionBand title={`${page.competitor} is better where it is proven`}>
          <EvidenceList items={page.whereCompetitorIsBetter} />
        </SectionBand>
        <SectionBand title="Where QOrium is different">
          <CardGrid>
            {page.qoriumEdges.map((edge) => (
              <SurfaceCard key={edge} title={edge}>
                Evidence-first QOrium positioning.
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>
        <SectionBand title="Structural comparison">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead className="bg-card text-left">
                <tr>
                  <th className="border-b border-border p-4">Dimension</th>
                  <th className="border-b border-border p-4">QOrium</th>
                  <th className="border-b border-border p-4">{page.competitor}</th>
                  <th className="border-b border-border p-4">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {page.matrix.map((row) => (
                  <tr key={row.dimension}>
                    <td className="border-b border-border p-4 font-medium">{row.dimension}</td>
                    <td className="border-b border-border p-4 text-muted-foreground">
                      {row.qoriumPosition}
                    </td>
                    <td className="border-b border-border p-4 text-muted-foreground">
                      {row.competitorPosition}
                    </td>
                    <td className="border-b border-border p-4 text-muted-foreground">
                      {row.evidenceStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionBand>
        <SectionBand title="Source note">
          <SurfaceCard title="Claim discipline">{page.sourceNote}</SurfaceCard>
        </SectionBand>
      </main>
    </>
  );
}
