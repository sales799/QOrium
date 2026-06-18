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
    description: `${role.name} hiring battery with core skills, recommended skills, stack context, evidence rules, and a sample QOrium assessment flow.`,
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
      <>
        <PageHero
          eyebrow={`${role.family} role`}
          title={`${role.name} hiring, with evidence your client can trust.`}
          description={`${role.description} Built for staffing and enterprise teams that need a buyer-readable shortlist, not a generic test link.`}
          cta={{ label: 'Build this battery', href: `/demo?role=${role.slug}` }}
        />
        <WorkflowSteps
          eyebrow="Role workflow"
          title="Turn the hiring brief into a defensible shortlist."
          description="Every generated role page now follows the same proof posture as the flagship pages: clear buyer intent, visible evidence limits, and reusable next steps."
          steps={[
            {
              title: 'Map the role to skill signals',
              body: 'Core skills appear first, then adjacent skills that help separate seniority and role fit.',
            },
            {
              title: 'Attach stack context',
              body: 'The battery links to the exact stack surfaces the hiring team will recognise in the requirement.',
            },
            {
              title: 'Report only supported evidence',
              body: 'Public pages show calibration posture and suppress logos, metrics, or certifications until source notes exist.',
            },
          ]}
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
              Public report shows whether items are IRT-calibrated, beta, or authored.
            </SurfaceCard>
            <SurfaceCard title="ReadyBank CTA" href="/platform/readybank">
              Convert this role into a reusable ReadyBank pack.
            </SurfaceCard>
          </CardGrid>
        </SectionBand>
        <SectionBand title="Evidence rules">
          <EvidenceRuleGrid
            rules={[
              {
                title: 'Buyer-specific claim posture',
                body: 'The page names what the role battery can support and avoids generic assessment filler.',
              },
              {
                title: 'No fake proof',
                body: 'Customer logos, win rates, and certification claims stay out until evidence exists.',
              },
              {
                title: 'Canonical route',
                body: `${role.path} is the indexed route; duplicate suffix routes redirect to the base role page.`,
              },
            ]}
          />
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
        <SectionBand title="Related pages">
          <RelatedRoutes
            links={[
              {
                label: 'Assessment library',
                href: '/library',
                body: 'Browse the canonical skill pages that power this battery.',
              },
              {
                label: 'Stack solutions',
                href: '/solutions/stack',
                body: 'Move from the role view into vendor and enterprise-stack context.',
              },
              {
                label: 'Trust center',
                href: '/trust',
                body: 'Review DPDP, evidence, and security posture before client use.',
              },
            ]}
          />
        </SectionBand>
      </>
    </>
  );
}
