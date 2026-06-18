import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  CardGrid,
  ComparisonTable,
  EvidenceRuleGrid,
  EvidenceList,
  PageHero,
  RelatedRoutes,
  SectionBand,
  SurfaceCard,
} from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd, FAQPageJsonLd } from '@/components/seo/JsonLd';
import { competitorPages, getCompetitorPage, legacyCompareSlugToVsSlug } from '@/content/seo-graph';
import { phase4Faqs } from '@/content/phase4';
import { siteConfig } from '@/content/site.config';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return competitorPages.map((page) => ({ slug: `qorium-vs-${page.slug}` }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const competitorSlug = legacyCompareSlugToVsSlug(slug);
  const page = getCompetitorPage(competitorSlug);
  if (!page) return {};
  return {
    title: `QOrium vs ${page.competitor}`,
    description: `${page.summary} Review an honesty-led comparison of assessment coverage, anti-leak posture, pricing signals, buyer fit, and visible proof rules.`,
    alternates: { canonical: page.path },
  };
}

export default async function ComparePage({ params }: Props) {
  const { slug } = await params;
  const competitorSlug = legacyCompareSlugToVsSlug(slug);
  const page = getCompetitorPage(competitorSlug);
  if (!page) notFound();
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
          { name: 'Compare', path: '/compare/qorium-vs-vervoe' },
          { name: `QOrium vs ${page.competitor}`, path: page.path },
        ]}
      />
      <FAQPageJsonLd
        questions={[
          {
            question: `Is QOrium a replacement for ${page.competitor}?`,
            answer:
              'It depends on the hiring workflow. Review the public-positioning differences and book a demo for migration details.',
          },
          ...phase4Faqs.slice(0, 2),
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(comparisonJsonLd) }}
      />
      <>
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
          <EvidenceList items={page.whereCompetitorIsBetter} />
        </SectionBand>
        <SectionBand title="Where QOrium is different">
          <CardGrid>
            {page.qoriumEdges.map((edge) => (
              <SurfaceCard key={edge} title={edge}>
                QOrium's India-first, evidence-led posture.
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>
        <SectionBand
          title="Structural comparison"
          description="Rows keep competitor strengths visible and mark the evidence posture behind each claim."
        >
          <ComparisonTable
            columns={['Dimension', 'QOrium', page.competitor, 'Evidence']}
            rows={page.matrix.map((row) => [
              row.dimension,
              row.qoriumPosition,
              row.competitorPosition,
              row.evidenceStatus,
            ])}
          />
        </SectionBand>
        <SectionBand title="Evidence rules">
          <EvidenceRuleGrid
            rules={[
              {
                title: 'No unsupported customer proof',
                body: 'Customer names, metrics, and certifications stay out unless source notes and permission exist.',
              },
              {
                title: 'Competitor strengths remain visible',
                body: 'The page is written for buyers comparing options, not for unfair takedowns.',
              },
              {
                title: 'Canonical comparison IA',
                body: `${page.path} is the indexed page; legacy /vs links redirect here.`,
              },
            ]}
          />
        </SectionBand>
        <SectionBand title="Related pages">
          <RelatedRoutes
            links={[
              {
                label: 'Trust center',
                href: '/trust',
                body: 'Review the security, DPDP, and evidence posture behind public claims.',
              },
              {
                label: 'Assessment library',
                href: '/library',
                body: 'Browse visible skill calibration labels and public sample questions.',
              },
              {
                label: 'Pricing',
                href: '/pricing',
                body: 'Compare published buying motions before a migration conversation.',
              },
            ]}
          />
        </SectionBand>
        <SectionBand title="Source note">
          <SurfaceCard title="Claim discipline">{page.sourceNote}</SurfaceCard>
        </SectionBand>
      </>
    </>
  );
}
