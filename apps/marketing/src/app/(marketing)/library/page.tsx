import type { Metadata } from 'next';

import { CardGrid, PageHero, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd, ItemListJsonLd, ProductJsonLd } from '@/components/seo/JsonLd';
import { librarySkills } from '@/content/seo-graph';
import { siteConfig } from '@/content/site.config';

export const metadata: Metadata = {
  title: 'Assessment Library',
  description:
    'Browse QOrium skill assessments with role mapping, stack mapping, sample questions, and explicit calibration status.',
  alternates: { canonical: '/library' },
};

export default function LibraryHubPage() {
  const featured = librarySkills.slice(0, 60);
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
        description="Programmatic skill assessment library with honesty-first calibration badges."
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
          description={`${librarySkills.length.toLocaleString('en-IN')} generated skill pages mapped to roles, stacks, related skills, and sample questions. Pages below the IRT threshold are marked as calibration in progress.`}
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
          title="Seeded skill pages"
          description="The first pages are hand-seeded from the current QOrium library and India-stack roadmap; the long tail renders as authored stubs until calibration data arrives."
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
