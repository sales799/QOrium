import type { Metadata } from 'next';

import { CardGrid, PageHero, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';

export const metadata: Metadata = {
  title: 'Try QOrium — interactive proof surfaces',
  description:
    'Hands-on QOrium demos: JD-Forge maps a job description into a calibrated assessment plan, and the graded-answer viewer shows AI grading with full reasoning trace. No sales call required.',
  alternates: { canonical: '/try' },
};

const TRY_PAGES = [
  {
    slug: 'jd-forge',
    title: 'JD-Forge — paste a JD, get an assessment plan',
    summary:
      'Live demo: paste any job description and watch QOrium map it into a defensible assessment plan in seconds. Shows honest low-confidence state when a JD does not map cleanly.',
    href: '/try/jd-forge',
  },
  {
    slug: 'graded-answer',
    title: 'Graded-answer viewer',
    summary:
      'See a complete grading trace end to end: candidate answer in, AI score plus reasoning plus rubric anchors out. The same surface a recruiter sees, opened up.',
    href: '/try/graded-answer',
  },
] as const;

export default function TryIndexPage() {
  return (
    <main>
      <PageHero
        eyebrow="Try"
        title="QOrium proof, no sales call required."
        description="Two interactive surfaces that show how QOrium reasons about jobs and answers — without you handing over your data."
      />
      <SectionBand title="Available demos">
        <CardGrid>
          {TRY_PAGES.map((page) => (
            <SurfaceCard key={page.slug} title={page.title} href={page.href}>
              {page.summary}
            </SurfaceCard>
          ))}
        </CardGrid>
      </SectionBand>
    </main>
  );
}
