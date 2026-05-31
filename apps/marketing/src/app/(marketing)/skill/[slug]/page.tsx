import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import {
  CardGrid,
  EvidenceList,
  MetaRow,
  PageHero,
  SectionBand,
  SurfaceCard,
} from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd, FAQPageJsonLd, ProductJsonLd } from '@/components/seo/JsonLd';
import { getSkill, jobDescriptions, phase4Faqs, skillLibrary, slugify } from '@/content/phase4';
import { siteConfig } from '@/content/site.config';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return skillLibrary.map((skill) => ({ slug: slugify(skill.name) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) return {};
  return {
    title: `${skill.name} Assessment`,
    description: `Preview the QOrium ${skill.name} assessment: skills measured, sample questions, calibration status, and matching roles.`,
    alternates: { canonical: `/skill/${slug}` },
    openGraph: {
      title: `QOrium ${skill.name} Assessment`,
      description: `${skill.category} assessment for ${skill.roles.join(', ')} roles.`,
      url: `${siteConfig.url}/skill/${slug}`,
    },
  };
}

export default async function SkillPage({ params }: Props) {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) notFound();
  const faq = [
    {
      question: `What does the QOrium ${skill.name} assessment measure?`,
      answer: `It measures applied ${skill.category.toLowerCase()} judgment for ${skill.roles.join(', ')} roles.`,
    },
    { question: 'Is the assessment fully calibrated?', answer: skill.calibration },
    ...phase4Faqs.slice(0, 1),
  ];
  const publishedJobSlugs = new Set(jobDescriptions.map((job) => slugify(job.title)));
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Assessment Library', path: '/product/assessment-library' },
          { name: skill.name, path: `/skill/${slug}` },
        ]}
      />
      <ProductJsonLd
        name={`QOrium ${skill.name} Assessment`}
        description={`${skill.name} skills assessment for ${skill.roles.join(', ')}.`}
        url={`${siteConfig.url}/skill/${slug}`}
      />
      <FAQPageJsonLd questions={faq} />
      <main>
        <PageHero
          eyebrow={`${skill.category} assessment`}
          title={`QOrium ${skill.name} Assessment`}
          description={`A practical ${skill.duration} assessment for ${skill.roles.join(', ')} hiring. It shows what is tested, sample questions, and evidence status before a team uses it externally.`}
          cta={{ label: 'Add to hiring pipeline', href: '/demo' }}
        />
        <SectionBand title="Assessment facts">
          <MetaRow
            duration={skill.duration}
            category={`${skill.category} · ${skill.difficulty}`}
            calibration={skill.calibration}
          />
        </SectionBand>
        <SectionBand
          title="Sample questions"
          description="Only three examples are shown publicly to reduce harvesting risk."
        >
          <EvidenceList items={skill.questions} />
        </SectionBand>
        <SectionBand title="Roles that use this skill">
          <CardGrid columns="md:grid-cols-2">
            {skill.roles.map((role) => {
              const roleSlug = slugify(role);
              const roleHref = publishedJobSlugs.has(roleSlug)
                ? `/resources/job-descriptions/${roleSlug}`
                : undefined;
              return (
                <SurfaceCard key={role} title={role} href={roleHref}>
                  {roleHref
                    ? 'View the role template and cross-linked skills checklist.'
                    : 'Queued role template; request a role-specific pack during the demo.'}
                </SurfaceCard>
              );
            })}
          </CardGrid>
          <Link
            href="/product/assessment-library"
            className="mt-8 inline-block text-sm font-medium text-secondary"
          >
            Back to assessment library
          </Link>
        </SectionBand>
      </main>
    </>
  );
}
