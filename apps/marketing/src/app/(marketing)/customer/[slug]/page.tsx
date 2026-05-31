import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { EvidenceList, PageHero, SectionBand } from '@/components/phase4/MarketingSurface';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/content/site.config';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [{ slug: 'talpro-india' }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== 'talpro-india') return {};
  return {
    title: 'Talpro India Customer Story',
    description: 'Customer-zero story for QOrium and Talpro India.',
    alternates: { canonical: '/customer/talpro-india' },
  };
}

export default async function CustomerStoryPage({ params }: Props) {
  const { slug } = await params;
  if (slug !== 'talpro-india') notFound();
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Customers', path: '/customers' },
          { name: 'Talpro India', path: '/customer/talpro-india' },
        ]}
      />
      <ArticleJsonLd
        title="Talpro India Customer-Zero Story"
        description="How Talpro India uses QOrium as the founding customer-zero workflow."
        url={`${siteConfig.url}/customer/talpro-india`}
        datePublished="2026-05-31"
        author="QOrium"
      />
      <main>
        <PageHero
          eyebrow="Customer zero"
          title="Talpro India is the founding customer-zero for QOrium."
          description="This story stays intentionally evidence-first: it names the customer-zero relationship and leaves quantified outcome claims empty until Phase 5 instrumentation lands."
          cta={{ label: 'Book a customer-zero walkthrough', href: '/demo' }}
        />
        <SectionBand title="What is live in the story">
          <EvidenceList
            items={[
              'Talpro India is the founding customer-zero context.',
              'Outcome numbers are not published yet.',
              'Pilot questions remain a founder-request item before a full public case study.',
            ]}
          />
        </SectionBand>
      </main>
    </>
  );
}
