import type { Metadata } from 'next';

import { CardGrid, PageHero, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd, ItemListJsonLd, ProductJsonLd } from '@/components/seo/JsonLd';
import { IRT_LABEL, librarySkills } from '@/content/seo-graph';
import { siteConfig } from '@/content/site.config';

export const metadata: Metadata = {
  title: 'Assessment Library',
  description:
    'Browse QOrium skill assessments with role mapping, stack mapping, sample questions, and explicit calibration status.',
  alternates: { canonical: '/library' },
};

export default function LibraryHubPage() {
  const featured = librarySkills;
  const categories = [...new Set(librarySkills.map((skill) => skill.category))].sort();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Library', path: '/library' },
        ]}
      />
      <ProductJsonLd
        name="QOrium Assessment Library"
        description="The 21 canonical QOrium skill assessments with an honest calibration label on every page."
        url={`${siteConfig.url}/library`}
      />
      <ItemListJsonLd
        name="Featured QOrium skill assessments"
        url={`${siteConfig.url}/library`}
        items={featured.map((skill) => ({
          name: skill.name,
          url: `${siteConfig.url}${skill.path}`,
          description: skill.seoMeta.description,
        }))}
      />
      <main>
        <PageHero
          eyebrow="Assessment library"
          title="Skill pages with calibration shown in public"
          description={`${librarySkills.length} canonical skill assessments mapped to roles, stacks, related skills, and sample questions. Every page carries the same honest item-statistics label: ${IRT_LABEL}.`}
          cta={{ label: 'Book a library walkthrough', href: '/demo?surface=library' }}
        />
        <SectionBand title="Browse by category">
          <CardGrid>
            {categories.map((category) => (
              <SurfaceCard key={category} title={category}>
                {librarySkills.filter((skill) => skill.category === category).length} public skill
                pages
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>
        <SectionBand
          title="Canonical skill assessments"
          description="The consolidated QOrium library: 21 canonical skills across tech, India-stack, AI-era, and aptitude. Calibration status is shown honestly on every page."
        >
          <CardGrid>
            {featured.map((skill) => (
              <SurfaceCard key={skill.slug} title={skill.name} href={skill.path}>
                {skill.category} · {skill.calibration.label}
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>
      </main>
    </>
  );
}
