import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CardGrid, PageHero, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd, SoftwareApplicationJsonLd } from '@/components/seo/JsonLd';
import { getLibrarySkill, getRolePage, getStackPage, stackPages } from '@/content/seo-graph';
import { siteConfig } from '@/content/site.config';

type Props = { params: Promise<{ slug: string }> };

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export const dynamicParams = true;

export function generateStaticParams() {
  return stackPages.map((stack) => ({ slug: stack.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const stack = getStackPage(slug);
  if (!stack) return {};
  return {
    title: `${stack.name} Assessment Modules`,
    description: `${stack.description} View QOrium roles, skills, and India-enterprise context for ${stack.name}.`,
    alternates: { canonical: stack.path },
  };
}

export default async function StackPage({ params }: Props) {
  const { slug } = await params;
  const stack = getStackPage(slug);
  if (!stack) notFound();
  const roles = stack.roles.map(getRolePage).filter(isDefined);
  const skills = stack.skills.map(getLibrarySkill).filter(isDefined);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Stack Solutions', path: '/solutions/stack' },
          { name: stack.name, path: stack.path },
        ]}
      />
      <SoftwareApplicationJsonLd
        name={`QOrium ${stack.name} Assessment Modules`}
        description={stack.description}
        url={`${siteConfig.url}${stack.path}`}
      />
      <main>
        <PageHero
          eyebrow={`${stack.vendor} stack`}
          title={`${stack.name} Assessment Modules`}
          description={stack.description}
          cta={{ label: 'Build Stack-Vault pack', href: `/demo?stack=${stack.slug}` }}
        />
        <SectionBand title="India enterprise context">
          <SurfaceCard title={stack.name}>{stack.indiaCallout}</SurfaceCard>
        </SectionBand>
        <SectionBand title="Roles that need this stack">
          <CardGrid columns="md:grid-cols-2">
            {roles.map((role) => (
              <SurfaceCard key={role.slug} title={role.name} href={role.path}>
                {role.description}
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>
        <SectionBand title="Skill modules">
          <CardGrid>
            {skills.map((skill) => (
              <SurfaceCard key={skill.slug} title={skill.name} href={skill.path}>
                {skill.calibration.label}
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>
        <SectionBand title="Evidence-gated case-study slot">
          <SurfaceCard title="Customer proof">
            This slot stays unclaimed until a customer reference, permission, and source note exist.
          </SurfaceCard>
        </SectionBand>
      </main>
    </>
  );
}
