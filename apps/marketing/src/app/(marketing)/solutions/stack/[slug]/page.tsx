import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  CardGrid,
  EvidenceRuleGrid,
  PageHero,
  RelatedRoutes,
  SectionBand,
  SurfaceCard,
  WorkflowSteps,
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
    description: `${stack.description} View QOrium roles, skills, workflow, and India-enterprise context for ${stack.name}.`,
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
          title={`${stack.name} assessment modules for real enterprise work.`}
          description={`${stack.description} Built so a hiring team can see the role mapping, skill modules, and evidence posture in one place.`}
          cta={{ label: 'Build Stack-Vault pack', href: `/demo?stack=${stack.slug}` }}
        />
        <WorkflowSteps
          eyebrow="Stack workflow"
          title="Move from vendor keyword to measurable work sample."
          description="Stack pages now carry the same enterprise architecture as role pages: buyer context, mapped signals, related routes, and no unsupported proof."
          steps={[
            {
              title: 'Start with the enterprise stack',
              body: 'Name the vendor context and the India or global hiring relevance before listing test modules.',
            },
            {
              title: 'Link the roles that use it',
              body: 'Route buyers into the roles where the stack actually matters, instead of leaving a thin keyword page.',
            },
            {
              title: 'Expose the evidence boundary',
              body: 'Case-study slots remain visible but unclaimed until customer references and source notes exist.',
            },
          ]}
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
        <SectionBand title="Evidence rules">
          <EvidenceRuleGrid
            rules={[
              {
                title: 'No vendor-logo theatre',
                body: 'Vendor names describe the stack context; they do not imply partnership or certification.',
              },
              {
                title: 'Mapped skills only',
                body: 'Skill cards link to public library pages with visible calibration language.',
              },
              {
                title: 'Case studies stay gated',
                body: 'Customer proof appears only after reference, permission, and source notes are present.',
              },
            ]}
          />
        </SectionBand>
        <SectionBand title="Related pages">
          <RelatedRoutes
            links={[
              {
                label: 'Role solutions',
                href: '/solutions/role',
                body: 'See how this stack maps into role-specific assessment batteries.',
              },
              {
                label: 'Assessment library',
                href: '/library',
                body: 'Open the individual skill pages behind this stack.',
              },
              {
                label: 'Platform API',
                href: '/platform/api',
                body: 'Review the API interest surface for workflow integrations.',
              },
            ]}
          />
        </SectionBand>
      </main>
    </>
  );
}
