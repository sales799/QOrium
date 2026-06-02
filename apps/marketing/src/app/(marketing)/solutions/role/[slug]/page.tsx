import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CardGrid, PageHero, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd, SoftwareApplicationJsonLd } from '@/components/seo/JsonLd';
import { getLibrarySkill, getRolePage, getStackPage, rolePages } from '@/content/seo-graph';
import { siteConfig } from '@/content/site.config';

type Props = { params: Promise<{ slug: string }> };

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export const dynamicParams = true;

export function generateStaticParams() {
  return rolePages.map((role) => ({ slug: role.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const role = getRolePage(slug);
  if (!role) return {};
  return {
    title: `${role.name} Assessment Battery`,
    description: `${role.description} View core skills, recommended skills, stacks, and sample QOrium assessment flow.`,
    alternates: { canonical: role.path },
  };
}

export default async function RolePage({ params }: Props) {
  const { slug } = await params;
  const role = getRolePage(slug);
  if (!role) notFound();
  const coreSkills = role.coreSkills.map(getLibrarySkill).filter(isDefined);
  const recommendedSkills = role.recommendedSkills.map(getLibrarySkill).filter(isDefined);
  const stacks = role.stacks.map(getStackPage).filter(isDefined);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Role Solutions', path: '/solutions/role' },
          { name: role.name, path: role.path },
        ]}
      />
      <SoftwareApplicationJsonLd
        name={`QOrium ${role.name} Assessment Battery`}
        description={role.description}
        url={`${siteConfig.url}${role.path}`}
      />
      <PageHero
        eyebrow={`${role.family} role`}
        title={`${role.name} Assessment Battery`}
        description={role.description}
        cta={{ label: 'Build this battery', href: `/demo?role=${role.slug}` }}
      />
      <SectionBand
        title="Recommended skill battery"
        description={`Seniority levels covered: ${role.seniorityLevels.join(', ')}.`}
      >
        <CardGrid>
          {[...coreSkills, ...recommendedSkills].map((skill) => (
            <SurfaceCard key={skill.slug} title={skill.name} href={skill.path}>
              {skill.category} · {skill.calibration.label}
            </SurfaceCard>
          ))}
        </CardGrid>
      </SectionBand>
      <SectionBand title="Sample assessment flow">
        <CardGrid columns="md:grid-cols-2">
          <SurfaceCard title="Core screen">
            Role-critical skills first, then stack context.
          </SurfaceCard>
          <SurfaceCard title="Work sample">
            One scenario mirrors the hiring team workflow.
          </SurfaceCard>
          <SurfaceCard title="Calibration badge">
            Public report shows whether items are IRT-calibrated, pilot, or authored.
          </SurfaceCard>
          <SurfaceCard title="ReadyBank CTA" href="/platform/readybank">
            Convert this role into a reusable ReadyBank pack.
          </SurfaceCard>
        </CardGrid>
      </SectionBand>
      <SectionBand title="Stack context">
        <CardGrid>
          {stacks.map((stack) => (
            <SurfaceCard key={stack.slug} title={stack.name} href={stack.path}>
              {stack.indiaCallout}
            </SurfaceCard>
          ))}
        </CardGrid>
      </SectionBand>
    </>
  );
}
