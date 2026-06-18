import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageHero, SectionBand } from '@/components/phase4/MarketingSurface';
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
    description: `${guide.summary} QOrium connects role evidence, scoring rubrics, DPDP-aware audit trails, and buyer-ready skills assessment workflows.`,
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
      <>
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
      </>
    </>
  );
}
