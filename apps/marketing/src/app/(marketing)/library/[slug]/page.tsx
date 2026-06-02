import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { GradedAnswerViewer } from '@/components/interactive-proof/GradedAnswerViewer';
import {
  CardGrid,
  EnterpriseJourneyBand,
  SectionBand,
  SurfaceCard,
} from '@/components/phase4/MarketingSurface';
import { ArticleJsonLd, BreadcrumbJsonLd, FAQPageJsonLd } from '@/components/seo/JsonLd';
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
  const faq = [
    {
      question: `Is the ${skill.name} assessment IRT-calibrated?`,
      answer:
        skill.calibration.status === 'IRT-calibrated'
          ? `${skill.name} has enough calibrated items to show an IRT-calibrated public badge.`
          : `${skill.name} is shown honestly as ${skill.calibration.status}; ${skill.calibration.label}`,
    },
    {
      question: `Can QOrium build a ${skill.name} pack for a hiring team?`,
      answer:
        'Yes. QOrium maps skill pages to roles, stacks, and sample assessment flows, then routes production packs through review and calibration gates.',
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Library', path: '/library' },
          { name: skill.name, path: skill.path },
        ]}
      />
      <ArticleJsonLd
        title={skill.seoMeta.title}
        description={skill.seoMeta.description}
        url={`${siteConfig.url}${skill.path}`}
        datePublished="2026-06-01"
        author="QOrium Content Engine"
      />
      <FAQPageJsonLd questions={faq} />
      <section className="surface-shell evidence-ledger border-b border-white/10 py-16 md:py-20">
        <MaxWidth as="div">
          <p className="font-mono text-xs font-semibold uppercase text-signal-300">
            {skill.family}
          </p>
          <h1 className="mt-4 max-w-5xl text-balance text-5xl font-semibold text-white md:text-7xl">
            {skill.name} assessment library
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-shell-muted">
            {skill.calibration.label}. Sample items below are public previews; production packs keep
            calibration and audit state attached.
          </p>
          <div className="mt-8 inline-flex rounded-lg border border-white/15 bg-white/10 px-4 py-2 font-mono text-xs font-semibold uppercase text-white">
            Calibration status: {skill.calibration.status}
          </div>
        </MaxWidth>
      </section>
      <section className="surface-product border-b border-border py-16 md:py-20">
        <MaxWidth as="div">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-normal">Sample question explorer</h2>
            <p className="mt-3 text-muted-foreground">
              One set of examples is unlocked publicly. Production packs keep full item banks gated
              to reduce harvesting risk.
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
      <SectionBand title="Graded-answer proof">
        <div className="mb-6 max-w-2xl">
          <p className="text-sm leading-6 text-muted-foreground">
            Matching exemplars are filtered by skill when QOrium has one; otherwise the viewer shows
            the closest public audit fixtures.
          </p>
        </div>
        <GradedAnswerViewer skillFilter={skill.name} embedded />
      </SectionBand>
      <EnterpriseJourneyBand
        title={`Turn ${skill.name} evidence into a defensible hiring step.`}
        description={`${skill.name} buyers should leave this page knowing the public calibration status, what signals are measured, which roles and stacks connect to the skill, and how to request a production-safe pack without exposing the full bank.`}
        proofPoints={[
          `${skill.calibration.status} status is visible instead of implied.`,
          'Public samples are limited to reduce harvesting while still showing assessment quality.',
          'Related roles, stacks, and skills keep the visitor inside a connected evaluation journey.',
        ]}
        links={[
          {
            label: 'Build from this skill',
            href: `/demo?skill=${skill.slug}`,
            body: 'Request a JD-shaped pack, calibration review, or Stack-Vault discussion.',
          },
          {
            label: 'Review anti-leak method',
            href: '/anti-leak',
            body: 'See how QOrium protects question freshness and public preview surfaces.',
          },
          {
            label: 'Open assessment library',
            href: '/library',
            body: 'Compare this page against the wider skill graph and seeded categories.',
          },
        ]}
      />
    </>
  );
}
