import type { Metadata } from 'next';

import { CardGrid, PageHero, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';
import { ArticleJsonLd, BreadcrumbJsonLd, FAQPageJsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/content/site.config';

const benchmarkFaqs = [
  {
    question: 'Does QOrium publish an AI plagiarism accuracy percentage today?',
    answer:
      'No. The benchmark surface publishes the protocol and evidence status. QOrium will publish an accuracy figure only after a completed run has reviewable evidence.',
  },
  {
    question: 'Why publish the benchmark before the final number?',
    answer:
      'Enterprise buyers need to see the test design, evidence rules, and release gate before trusting any future metric. The protocol keeps public claims evidence-gated.',
  },
  {
    question: 'What happens if the benchmark misses the release threshold?',
    answer:
      'The result blocks any Pro-tier anti-plagiarism claim until remediation and a passing re-run are complete.',
  },
];

export const metadata: Metadata = {
  title: 'AI Plagiarism Benchmark Protocol',
  description:
    'QOrium public protocol for benchmarking AI plagiarism detection before any Pro-tier customer claim.',
  alternates: { canonical: '/research/plagiarism-benchmark' },
};

export default function PlagiarismBenchmarkPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Research', path: '/research/plagiarism-benchmark' },
          { name: 'AI Plagiarism Benchmark', path: '/research/plagiarism-benchmark' },
        ]}
      />
      <ArticleJsonLd
        title="AI Plagiarism Benchmark Protocol"
        description="QOrium public protocol for benchmarking AI plagiarism detection before any Pro-tier customer claim."
        url={`${siteConfig.url}/research/plagiarism-benchmark`}
        datePublished="2026-05-31"
        author="QOrium"
      />
      <FAQPageJsonLd questions={benchmarkFaqs} />
      <main>
        <PageHero
          eyebrow="Research protocol"
          title="AI plagiarism claims stay gated until the benchmark evidence is real."
          description="QOrium publishes the benchmark method before publishing any accuracy number. The page exists so buyers, reviewers, and search crawlers can see what will be measured, what is not yet claimed, and what blocks release."
          cta={{ label: 'Request benchmark evidence', href: '/demo' }}
        />

        <SectionBand
          title="Current evidence status"
          description="The protocol is public. The first customer-facing accuracy figure remains evidence-pending."
        >
          <CardGrid>
            <SurfaceCard title="Published now">
              Benchmark design, evidence rules, release-gate criteria, and public no-fiction
              posture.
            </SurfaceCard>
            <SurfaceCard title="Not claimed yet">
              No live public accuracy percentage, customer win rate, or competitor superiority claim
              appears in the public benchmark report.
            </SurfaceCard>
            <SurfaceCard title="Release gate">
              Pro-tier anti-plagiarism claims stay blocked until the completed benchmark and review
              loop pass.
            </SurfaceCard>
          </CardGrid>
        </SectionBand>

        <SectionBand title="Benchmark method">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              [
                'Corpus design',
                'Use seeded QOrium items, controlled rewrites, AI-assisted variants, and known-negative originals so false positives and false negatives are both visible.',
              ],
              [
                'Evaluator split',
                'Separate model-assisted detection, lexical similarity checks, and human review so one tool cannot mark its own homework.',
              ],
              [
                'Decision thresholds',
                'Track precision, recall, false-positive rate, false-negative rate, and reviewer override notes before any public accuracy figure is approved.',
              ],
              [
                'Audit trail',
                'Preserve prompt versions, corpus hashes, timestamps, reviewer notes, and remediation records for every public benchmark run.',
              ],
            ].map(([title, body]) => (
              <div key={title} className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-lg font-semibold tracking-normal">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </SectionBand>

        <SectionBand
          title="Public claim rules"
          description="The benchmark page is intentionally conservative until the evidence exists."
        >
          <div className="rounded-lg border border-border bg-card p-6 text-sm leading-7 text-muted-foreground">
            <p>
              QOrium may describe the protocol, benchmark scope, and release gate now. QOrium may
              not publish a detection accuracy number, ranking claim, or enterprise-readiness claim
              until the benchmark run is complete and the evidence has passed review.
            </p>
            <p className="mt-4">
              If a run fails the release threshold, the benchmark surface remains protocol-only and
              the failed run is treated as remediation input, not as marketing proof.
            </p>
          </div>
        </SectionBand>
      </main>
    </>
  );
}
