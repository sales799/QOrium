import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import {
  CardGrid,
  EnterpriseJourneyBand,
  EvidenceList,
  PageHero,
  SectionBand,
  SurfaceCard,
} from '@/components/phase4/MarketingSurface';
import { ArticleJsonLd, BreadcrumbJsonLd, FAQPageJsonLd } from '@/components/seo/JsonLd';
import { getJob, jobDescriptions, phase4Faqs, skillLibrary, slugify } from '@/content/phase4';
import { siteConfig } from '@/content/site.config';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return jobDescriptions.map((job) => ({ slug: slugify(job.title) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = getJob(slug);
  if (!job) return {};
  return {
    title: `${job.title} Job Description`,
    description: `Hiring template for a ${job.title}: responsibilities, requirements, skills checklist, and QOrium assessment links.`,
    alternates: { canonical: `/resources/job-descriptions/${slug}` },
  };
}

export default async function JobDescriptionPage({ params }: Props) {
  const { slug } = await params;
  const job = getJob(slug);
  if (!job) notFound();
  const responsibilities = [
    `Own ${job.family.toLowerCase()} outcomes for the assigned role scope.`,
    'Document work clearly so reviewers can evaluate evidence, not impressions.',
    'Collaborate with hiring managers and adjacent teams on measurable deliverables.',
  ];
  const publishedSkillSlugs = new Set(skillLibrary.map((skill) => slugify(skill.name)));
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Resources', path: '/resources' },
          { name: 'Job descriptions', path: '/resources/job-descriptions' },
          { name: job.title, path: `/resources/job-descriptions/${slug}` },
        ]}
      />
      <ArticleJsonLd
        title={`${job.title} Job Description`}
        description={`Template and assessment links for hiring a ${job.title}.`}
        url={`${siteConfig.url}/resources/job-descriptions/${slug}`}
        datePublished="2026-05-31"
        author="QOrium"
      />
      <FAQPageJsonLd questions={phase4Faqs.slice(0, 2)} />
      <main>
        <PageHero
          eyebrow={`${job.family} role template`}
          title={`${job.title} Job Description`}
          description={`Use this ${job.seniority.toLowerCase()} role template to align responsibilities, requirements, and skills evidence before interviews begin.`}
          cta={{ label: 'Build assessment from this role', href: '/demo' }}
        />
        <SectionBand title="Responsibilities">
          <EvidenceList items={responsibilities} />
        </SectionBand>
        <SectionBand title="Skills checklist">
          <CardGrid columns="md:grid-cols-3">
            {job.skills.map((skill) => {
              const skillSlug = slugify(skill);
              const skillHref = publishedSkillSlugs.has(skillSlug)
                ? `/skill/${skillSlug}`
                : undefined;
              return (
                <SurfaceCard key={skill} title={skill} href={skillHref}>
                  {skillHref
                    ? 'Open the related assessment page or request a role-specific pack.'
                    : 'Queued in the taxonomy expansion backlog; request this skill during setup.'}
                </SurfaceCard>
              );
            })}
          </CardGrid>
          <Link
            href="/resources/job-descriptions"
            className="mt-8 inline-block text-sm font-medium text-secondary"
          >
            Back to job-description library
          </Link>
        </SectionBand>
        <EnterpriseJourneyBand
          title={`${job.title} hiring starts with a defensible role brief.`}
          description="This job-description page connects the buyer from role wording to skill evidence, assessment planning, and a proof run so the shortlist can be defended before interviews consume time."
          proofPoints={[
            `${job.seniority} scope is visible before the assessment is built.`,
            'Skill cards route to published assessment pages when the taxonomy already exists.',
            'Backlog skills are marked honestly instead of pretending every module is calibrated.',
          ]}
          links={[
            {
              label: 'Build from this JD',
              href: `/demo?job=${slug}`,
              body: 'Turn this job description into a JD-Forge walkthrough or pack request.',
            },
            {
              label: 'Try JD-Forge',
              href: '/try/jd-forge',
              body: 'Preview how role language becomes assessment structure.',
            },
            {
              label: 'Browse job templates',
              href: '/resources/job-descriptions',
              body: 'Compare adjacent job descriptions before finalizing the assessment scope.',
            },
          ]}
        />
      </main>
    </>
  );
}
