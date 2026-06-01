import type { Metadata } from 'next';
import Link from 'next/link';

import { CardGrid, PageHero, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd, FAQPageJsonLd, ProductJsonLd } from '@/components/seo/JsonLd';
import { phase4Faqs, skillLibrary, slugify, taxonomyBacklog } from '@/content/phase4';
import { siteConfig } from '@/content/site.config';

export const metadata: Metadata = {
  title: 'Assessment Library',
  description:
    'Browse QOrium skill assessments by category, role, difficulty, and calibration status.',
  alternates: { canonical: '/product/assessment-library' },
};

const legacySkillToLibrarySlug: Record<string, string> = {
  aws: 'aws',
  devops: 'devops-sre',
  java: 'java',
  javascript: 'javascript',
  python: 'python',
  reactjs: 'react',
  sql: 'sql',
};

export default function AssessmentLibraryPage() {
  const categories = [...new Set(skillLibrary.map((skill) => skill.category))];
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Product', path: '/product' },
          { name: 'Assessment Library', path: '/product/assessment-library' },
        ]}
      />
      <ProductJsonLd
        name="QOrium Assessment Library"
        description="Pre-built skills assessments for India-first hiring teams."
        url={`${siteConfig.url}/product/assessment-library`}
      />
      <FAQPageJsonLd questions={phase4Faqs} />
      <main>
        <PageHero
          eyebrow="Assessment library"
          title="Skills assessments built for Indian hiring teams that need defensible evidence."
          description="Filter by category, role, difficulty, and duration. Every public page names calibration status clearly so buyers can tell what is ready, seeded, or evidence-pending."
          cta={{ label: 'Book a 20-minute demo', href: '/demo' }}
        />
        <SectionBand
          title="Filter by category"
          description="Server-rendered cards, no client-only fetch."
        >
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-border bg-card px-3 py-1 text-sm"
              >
                {category}
              </span>
            ))}
          </div>
        </SectionBand>
        <SectionBand title="Skill pages">
          <CardGrid>
            {skillLibrary.map((skill) => (
              <SurfaceCard
                key={skill.name}
                title={`${skill.name} assessment`}
                href={
                  legacySkillToLibrarySlug[slugify(skill.name)]
                    ? `/library/${legacySkillToLibrarySlug[slugify(skill.name)]}`
                    : '/library'
                }
              >
                <p>
                  {skill.category} · {skill.difficulty} · {skill.duration}
                </p>
                <p className="mt-2">Roles: {skill.roles.join(', ')}</p>
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>
        <SectionBand
          title="Taxonomy expansion queue"
          description="Queued from the competitive coverage audit; promoted to full pages as evidence lands."
        >
          <div className="flex flex-wrap gap-2">
            {taxonomyBacklog.map((skill) => (
              <Link
                key={skill}
                href="/demo"
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground hover:border-secondary"
              >
                {skill}
              </Link>
            ))}
          </div>
        </SectionBand>
      </main>
    </>
  );
}
