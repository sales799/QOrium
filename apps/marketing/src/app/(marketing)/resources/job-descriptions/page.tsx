import type { Metadata } from 'next';

import { CardGrid, PageHero, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';
import { jobDescriptions, slugify } from '@/content/phase4';

export const metadata: Metadata = {
  title: 'Job Description Library',
  description: 'QOrium role templates with skills checklists and assessment links.',
  alternates: { canonical: '/resources/job-descriptions' },
};

export default function JobDescriptionsIndexPage() {
  return (
    <main>
      <PageHero
        eyebrow="Job-description library"
        title="Role templates that connect job requirements to skills assessments."
        description="Each page gives hiring teams a role overview, responsibility checklist, required skills, and the next assessment path."
      />
      <SectionBand title="Role pages">
        <CardGrid>
          {jobDescriptions.map((job) => (
            <SurfaceCard
              key={job.title}
              title={job.title}
              href={`/resources/job-descriptions/${slugify(job.title)}`}
            >
              {job.family} · {job.seniority} · {job.skills.slice(0, 3).join(', ')}
            </SurfaceCard>
          ))}
        </CardGrid>
      </SectionBand>
    </main>
  );
}
