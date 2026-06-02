import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { EnterpriseJourneyBand, PageHero, SectionBand } from '@/components/phase4/MarketingSurface';
import { ArticleJsonLd, BreadcrumbJsonLd, FAQPageJsonLd } from '@/components/seo/JsonLd';
import { guides, phase4Faqs } from '@/content/phase4';
import { siteConfig } from '@/content/site.config';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.summary,
    alternates: { canonical: `/resources/guides/${slug}` },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) notFound();
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Resources', path: '/resources' },
          { name: guide.title, path: `/resources/guides/${slug}` },
        ]}
      />
      <ArticleJsonLd
        title={guide.title}
        description={guide.summary}
        url={`${siteConfig.url}/resources/guides/${slug}`}
        datePublished="2026-05-31"
        author="QOrium"
      />
      <FAQPageJsonLd questions={phase4Faqs.slice(0, 2)} />
      <main>
        <PageHero
          eyebrow="Guide"
          title={guide.title}
          description={guide.summary}
          cta={{ label: 'Request full template', href: '/demo' }}
        />
        <SectionBand title="Open preview">
          <div className="rounded-lg border border-border bg-card p-6 text-sm leading-7 text-muted-foreground">
            <p>
              Skills-first hiring works when the role, assessment, scoring rubric, and reviewer
              notes all point to the same evidence.
            </p>
            <p className="mt-4">
              For Indian hiring teams: ask only for job-relevant evidence, keep candidate data
              scoped, explain scoring decisions, and preserve an audit trail.
            </p>
          </div>
        </SectionBand>
        <EnterpriseJourneyBand
          title="Turn the guide into an operating decision."
          description="Each resource page now connects education to action: apply the checklist, inspect the trust posture, and request the template or walkthrough tied to the buyer's hiring motion."
          proofPoints={[
            'The open preview explains the decision principle before asking for a lead.',
            'The CTA keeps the guide context attached to the demo path.',
            'Trust and library links help evaluators move from advice to vendor evidence.',
          ]}
          links={[
            {
              label: 'Request full template',
              href: `/demo?guide=${slug}`,
              body: 'Carry this guide into a template request or buyer-specific walkthrough.',
            },
            {
              label: 'Review responsible AI',
              href: '/responsible-ai',
              body: 'Check how QOrium frames automation, review, and accountability.',
            },
            {
              label: 'Open resources hub',
              href: '/resources',
              body: 'Continue through guides, job descriptions, sample packs, and research.',
            },
          ]}
        />
      </main>
    </>
  );
}
