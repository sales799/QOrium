import type { Metadata } from 'next';

import {
  CardGrid,
  EnterpriseJourneyBand,
  PageHero,
  SectionBand,
  SurfaceCard,
} from '@/components/phase4/MarketingSurface';
import { guides, jobDescriptions, slugify } from '@/content/phase4';

export const metadata: Metadata = {
  title: 'Resources',
  description: 'QOrium hiring resources, guides, job descriptions, and assessment templates.',
  alternates: { canonical: '/resources' },
};

export default function ResourcesPage() {
  return (
    <main>
      <PageHero
        eyebrow="Resources"
        title="Hiring resources for teams moving from resumes to skills evidence."
        description="Guides, templates, and role pages built for Indian hiring teams evaluating assessment vendors and improving shortlist quality."
        cta={{ label: 'Browse job descriptions', href: '/resources/job-descriptions' }}
      />
      <SectionBand title="Research and benchmarks">
        <CardGrid columns="md:grid-cols-2">
          <SurfaceCard
            title="AI Plagiarism Benchmark Protocol"
            href="/research/plagiarism-benchmark"
          >
            Public benchmark method and evidence status for QOrium anti-plagiarism claims.
          </SurfaceCard>
          <SurfaceCard title="Sample Packs" href="/resources/sample-packs">
            Preview 13 authored packs and request deeper PDFs through email capture.
          </SurfaceCard>
        </CardGrid>
      </SectionBand>
      <SectionBand title="Guides">
        <CardGrid>
          {guides.map((guide) => (
            <SurfaceCard
              key={guide.slug}
              title={guide.title}
              href={`/resources/guides/${guide.slug}`}
            >
              {guide.summary}
            </SurfaceCard>
          ))}
        </CardGrid>
      </SectionBand>
      <SectionBand title="Job-description library">
        <CardGrid>
          {jobDescriptions.slice(0, 9).map((job) => (
            <SurfaceCard
              key={job.title}
              title={job.title}
              href={`/resources/job-descriptions/${slugify(job.title)}`}
            >
              {job.family} · {job.seniority}
            </SurfaceCard>
          ))}
        </CardGrid>
      </SectionBand>
      <EnterpriseJourneyBand
        title="Resources should convert education into evaluation."
        description="The resources hub now connects guides, job descriptions, sample packs, and research to the same buyer path: learn the method, inspect the evidence, and request a scoped proof run."
        proofPoints={[
          'Guides serve high-intent evaluators who are still defining assessment requirements.',
          'Job descriptions connect role language to skills evidence and JD-Forge intent.',
          'Sample packs bridge public previews and protected production content.',
        ]}
        links={[
          {
            label: 'Open sample packs',
            href: '/resources/sample-packs',
            body: 'Inspect public previews and request deeper packs without exposing full banks.',
          },
          {
            label: 'Browse job descriptions',
            href: '/resources/job-descriptions',
            body: 'Start from a role brief and move into skill evidence.',
          },
          {
            label: 'Book resource walkthrough',
            href: '/demo?surface=resources',
            body: 'Turn a guide or template into an implementation conversation.',
          },
        ]}
      />
    </main>
  );
}
