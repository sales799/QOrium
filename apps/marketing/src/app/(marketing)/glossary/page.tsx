import type { Metadata } from 'next';

import { CardGrid, PageHero, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd, ItemListJsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/content/site.config';

const TERMS = [
  {
    term: 'Anti-leak rotation',
    definition:
      'A content operation that scans for exposed items, retires compromised questions, regenerates replacements, and revalidates the bank.',
  },
  {
    term: 'Calibration pending',
    definition:
      'The honest public label for authored items before enough live candidate response data exists for empirical calibration.',
  },
  {
    term: 'IRT',
    definition:
      'Item Response Theory, a psychometric approach for interpreting item difficulty and discrimination once sufficient evidence exists.',
  },
  {
    term: 'JD-Forge',
    definition:
      'The QOrium workflow that converts a job description into a structured assessment plan with mapped skills and coverage notes.',
  },
  {
    term: 'ReadyBank',
    definition:
      'The reusable skill-wise assessment library for common hiring roles, stack pages, sample packs, and platform integrations.',
  },
  {
    term: 'Role-Graph',
    definition:
      'QOrium taxonomy linking roles, stacks, skills, difficulty, format, and evidence metadata.',
  },
  {
    term: 'Stack-Vault',
    definition:
      'A customer-exclusive question bank with content ownership boundaries, watermarking, and private release controls.',
  },
  {
    term: 'Watermark-per-candidate',
    definition:
      'A forensic marker strategy that helps attribute leaked assessment variants without publishing fake certainty.',
  },
] as const;

export const metadata: Metadata = {
  title: 'Glossary',
  description:
    'Plain-English QOrium glossary for assessment science, anti-leak operations, role-graph taxonomy, and evidence-gated trust terms.',
  alternates: { canonical: '/glossary' },
};

export default function GlossaryPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Resources', path: '/resources' },
          { name: 'Glossary', path: '/glossary' },
        ]}
      />
      <ItemListJsonLd
        name="QOrium glossary"
        url={`${siteConfig.url}/glossary`}
        items={TERMS.map((item) => ({
          name: item.term,
          url: `${siteConfig.url}/glossary#${item.term.toLowerCase().replaceAll(' ', '-')}`,
          description: item.definition,
        }))}
      />
      <main>
        <PageHero
          eyebrow="Glossary"
          title="Assessment terms without vendor fog."
          description="Short definitions for buyers comparing skills platforms, India-stack assessment depth, and defensible content operations."
          cta={{ label: 'Read the method', href: '/method' }}
        />

        <SectionBand
          title="Core terms"
          description="These definitions are intentionally conservative. QOrium does not turn roadmap claims into public proof language."
        >
          <CardGrid columns="md:grid-cols-2">
            {TERMS.map((item) => (
              <SurfaceCard key={item.term} title={item.term}>
                <span id={item.term.toLowerCase().replaceAll(' ', '-')} />
                {item.definition}
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>
      </main>
    </>
  );
}
