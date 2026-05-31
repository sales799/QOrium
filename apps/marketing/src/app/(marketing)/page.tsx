import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, FileSearch, LibraryBig, ShieldCheck } from 'lucide-react';

import {
  CardGrid,
  EvidenceList,
  SectionBand,
  SurfaceCard,
} from '@/components/phase4/MarketingSurface';
import { MaxWidth } from '@/components/site/MaxWidth';
import { FAQPageJsonLd, WebsiteJsonLd } from '@/components/seo/JsonLd';
import { comparePages, phase4Faqs, skillLibrary, slugify } from '@/content/phase4';
import { homeCopy } from '@/content/copy/home';

export const metadata: Metadata = {
  title: {
    absolute: 'QOrium — Skills assessments built in India.',
  },
  description:
    'QOrium is an India-built skills assessment platform for evidence-first hiring, with an assessment library, DPDP-aligned buyer guidance, and evidence-gated trust claims.',
  alternates: { canonical: '/' },
};

const wedges = [
  {
    title: 'JD-Forge',
    icon: FileSearch,
    body: 'Paste a job description, draft a structured assessment, then review before publishing.',
    href: '/features/jd-forge',
  },
  {
    title: 'Assessment Library',
    icon: LibraryBig,
    body: 'Browse seeded skill pages with roles, sample questions, duration, and calibration status.',
    href: '/product/assessment-library',
  },
  {
    title: 'Audited, Indian, defensible',
    icon: ShieldCheck,
    body: 'DPDP-aligned language is live. Certifications and outcome claims wait for evidence.',
    href: '/security',
  },
];

export default function HomePage() {
  return (
    <>
      <WebsiteJsonLd />
      <FAQPageJsonLd questions={phase4Faqs} />
      <main>
        <section className="w-full border-b border-border bg-background">
          <MaxWidth
            as="div"
            className="grid min-h-[calc(100vh-4rem)] gap-10 py-16 md:grid-cols-[1.05fr_0.95fr] md:items-center"
          >
            <div>
              <p className="font-mono text-xs uppercase text-secondary">{homeCopy.hero.eyebrow}</p>
              <h1 className="mt-5 max-w-3xl text-balance text-5xl font-semibold tracking-normal md:text-7xl">
                {homeCopy.hero.headline}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                {homeCopy.hero.sub}
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
                {homeCopy.hero.proofLine}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={homeCopy.hero.primaryCta.href}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
                >
                  {homeCopy.hero.primaryCta.label}
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href={homeCopy.hero.secondaryCta.href}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-sm font-medium"
                >
                  {homeCopy.hero.secondaryCta.label}
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="grid gap-3">
                {homeCopy.proof.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-3"
                  >
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-2xl font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-md bg-muted p-4 text-sm text-muted-foreground">
                Outcome stats stay empty until instrumentation supports them. Trust badges render
                only when evidence lands.
              </div>
            </div>
          </MaxWidth>
        </section>

        <SectionBand
          title="Built for evidence-first hiring"
          description="The public homepage now reflects the Phase 4 IA without claiming backend-only capabilities as shipped."
        >
          <CardGrid>
            {wedges.map((wedge) => {
              const Icon = wedge.icon;
              return (
                <SurfaceCard key={wedge.title} title={wedge.title} href={wedge.href}>
                  <Icon className="mb-3 size-5 text-secondary" />
                  {wedge.body}
                </SurfaceCard>
              );
            })}
          </CardGrid>
        </SectionBand>

        <SectionBand title="Assessment library teaser">
          <CardGrid>
            {skillLibrary.slice(0, 6).map((skill) => (
              <SurfaceCard
                key={skill.name}
                title={`${skill.name} assessment`}
                href={`/skill/${slugify(skill.name)}`}
              >
                {skill.category} · {skill.difficulty} · {skill.duration}
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>

        <SectionBand
          title="Compare QOrium fairly"
          description="Comparison pages name competitor strengths first, then explain where QOrium is different."
        >
          <CardGrid>
            {comparePages.slice(0, 5).map((page) => (
              <SurfaceCard
                key={page.slug}
                title={`QOrium vs ${page.competitor}`}
                href={`/compare/${page.slug}`}
              >
                {page.summary}
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>

        <SectionBand title="Trust strip">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-5">
              <BadgeCheck className="mb-3 size-5 text-secondary" />
              <EvidenceList
                items={[
                  'Talpro India customer-zero',
                  'DPDP-aligned language live',
                  'Outcome stats pending evidence',
                ]}
              />
            </div>
            <div className="rounded-lg border border-border bg-card p-5 md:col-span-2">
              <h2 className="text-lg font-semibold">No unsupported public claims</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                ISO, independent bias audit, regional residency, hard outcome stats, and advanced
                API claims remain beta, roadmap, or evidence-pending until their backend and audit
                milestones are complete.
              </p>
            </div>
          </div>
        </SectionBand>

        <section className="w-full bg-muted py-16">
          <MaxWidth
            as="div"
            className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h2 className="text-3xl font-semibold tracking-normal">{homeCopy.finalCta.title}</h2>
              <p className="mt-2 text-muted-foreground">{homeCopy.finalCta.description}</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/demo"
                className="rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
              >
                Book a demo
              </Link>
              <Link
                href="/pricing"
                className="rounded-md border border-border bg-card px-5 py-3 text-sm font-medium"
              >
                See pricing
              </Link>
            </div>
          </MaxWidth>
        </section>
      </main>
    </>
  );
}
