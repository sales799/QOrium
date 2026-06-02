import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  CardGrid,
  EnterpriseJourneyBand,
  PageHero,
  SectionBand,
  SurfaceCard,
} from '@/components/phase4/MarketingSurface';
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
      <EnterpriseJourneyBand
        title={`${stack.name} buyers need stack-specific proof, not a generic skill test.`}
        description="This stack page connects vendor context, India/GCC relevance, related roles, and skill modules so enterprise teams can see whether QOrium can model their actual work environment."
        proofPoints={[
          `Region relevance is explicit: ${stack.regionRelevance.join(', ')}.`,
          'Role and skill links keep the buyer inside a connected stack-to-assessment journey.',
          'Customer proof remains gated until reference permission and source notes exist.',
        ]}
        links={[
          {
            label: 'Plan Stack-Vault pack',
            href: `/demo?stack=${stack.slug}`,
            body: 'Scope a private stack library with review, watermark, and refresh posture.',
          },
          {
            label: 'Open Stack-Vault',
            href: '/platform/stack-vault',
            body: 'See how customer-exclusive content is positioned for enterprise buyers.',
          },
          {
            label: 'Review security posture',
            href: '/security',
            body: 'Check the public security and trust surface before a deeper vendor review.',
          },
        ]}
      />
    </>
  );
}
