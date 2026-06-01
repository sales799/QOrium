import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CardGrid, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd, ProductJsonLd } from '@/components/seo/JsonLd';
import { MaxWidth } from '@/components/site/MaxWidth';
import { getLibrarySkill, librarySkills, rolePages, stackPages } from '@/content/seo-graph';
import { siteConfig } from '@/content/site.config';

type LibraryPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return librarySkills.map((skill) => ({ slug: skill.slug }));
}

export async function generateMetadata({ params }: LibraryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const skill = getLibrarySkill(slug);
  if (!skill) return {};

  return {
    title: `${skill.name} Assessment Library`,
    description: `QOrium ${skill.name} assessment page with honest calibration status and graded-answer examples.`,
    alternates: { canonical: skill.path },
  };
}

export default async function LibrarySkillPage({ params }: LibraryPageProps) {
  const { slug } = await params;
  const skill = getLibrarySkill(slug);
  if (!skill) notFound();
  const relatedRoles = rolePages.filter((role) =>
    [...role.coreSkills, ...role.recommendedSkills].includes(skill.slug),
  );
  const relatedStacks = stackPages.filter(
    (stack) => skill.stacks.includes(stack.slug) || stack.skills.includes(skill.slug),
  );
  const relatedSkills = skill.relatedSkills
    .map((relatedSlug) => getLibrarySkill(relatedSlug))
    .filter((related): related is NonNullable<typeof related> => related !== undefined);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Library', path: '/library' },
          { name: skill.name, path: skill.path },
        ]}
      />
      <ProductJsonLd
        name={`QOrium ${skill.name} Assessment`}
        description={skill.seoMeta.description}
        url={`${siteConfig.url}${skill.path}`}
      />
      <main>
        <section className="surface-shell evidence-ledger border-b border-white/10 py-16 md:py-20">
          <MaxWidth as="div">
            <p className="font-mono text-xs font-semibold uppercase text-signal-300">
              {skill.family}
            </p>
            <h1 className="mt-4 max-w-5xl text-balance text-5xl font-semibold text-white md:text-7xl">
              {skill.name} assessment library
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-shell-muted">
              {skill.calibration.label}. Sample items below are public previews; production packs
              keep calibration and audit state attached.
            </p>
          </MaxWidth>
        </section>
        <section className="surface-product border-b border-border py-16 md:py-20">
          <MaxWidth as="div">
            <div className="mb-8 max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-normal">Sample question explorer</h2>
              <p className="mt-3 text-muted-foreground">
                One set of examples is unlocked publicly. Production packs keep full item banks
                gated to reduce harvesting risk.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {skill.sampleQuestions.map((question) => (
                <div key={question} className="rounded-lg border border-border bg-card p-5">
                  <p className="font-mono text-xs font-semibold uppercase text-secondary">Sample</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{question}</p>
                </div>
              ))}
            </div>
          </MaxWidth>
        </section>
        <SectionBand title="What this skill measures">
          <div className="grid gap-4 md:grid-cols-3">
            {skill.measures.map((measure) => (
              <SurfaceCard key={measure} title="Measured signal">
                {measure}
              </SurfaceCard>
            ))}
          </div>
        </SectionBand>
        <SectionBand title="Role mapping">
          <CardGrid columns="md:grid-cols-2">
            {(relatedRoles.length > 0 ? relatedRoles : rolePages.slice(0, 4)).map((role) => (
              <SurfaceCard key={role.slug} title={role.name} href={role.path}>
                {role.description}
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>
        <SectionBand title="Stack mapping">
          <CardGrid columns="md:grid-cols-2">
            {(relatedStacks.length > 0 ? relatedStacks : stackPages.slice(0, 4)).map((stack) => (
              <SurfaceCard key={stack.slug} title={stack.name} href={stack.path}>
                {stack.indiaCallout}
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>
        <SectionBand title="Related skills">
          <CardGrid>
            {relatedSkills.slice(0, 6).map((related) => (
              <SurfaceCard key={related.slug} title={related.name} href={related.path}>
                {related.category} · {related.calibration.status}
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>
      </main>
    </>
  );
}
