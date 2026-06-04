import type { Metadata } from 'next';
import { BarChart3, FileSearch, ShieldCheck, type LucideIcon } from 'lucide-react';

import { CardGrid, PageHero, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const BENCHMARKS = [
  {
    title: 'AI plagiarism benchmark protocol',
    href: '/research/plagiarism-benchmark',
    body: 'Public method for testing plagiarism detection and anti-leak response without inflating vendor claims.',
  },
  {
    title: 'Responsible AI status',
    href: '/responsible-ai',
    body: 'Shipped, beta, and roadmap status rows are resolved from explicit flags and evidence metadata.',
  },
  {
    title: 'Assessment science',
    href: '/science',
    body: 'Validity, calibration, and bias language stay separated from certification claims until evidence supports them.',
  },
] as const;

const CLAIM_POSTURE: Array<{ label: string; icon: LucideIcon }> = [
  { label: 'No fake certification badges', icon: ShieldCheck },
  { label: 'No unsupported outcome stats', icon: BarChart3 },
  { label: 'Source notes before proof modules', icon: FileSearch },
];

export const metadata: Metadata = {
  title: 'Benchmarks & Reports',
  description:
    'QOrium benchmark and report index for anti-leak, responsible AI, assessment science, and evidence-gated trust proof.',
  alternates: { canonical: '/benchmarks' },
};

export default function BenchmarksPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Resources', path: '/resources' },
          { name: 'Benchmarks & Reports', path: '/benchmarks' },
        ]}
      />
      <main>
        <PageHero
          eyebrow="Benchmarks and reports"
          title="Measurement pages only publish what the evidence can carry."
          description="This index collects QOrium benchmark methods, responsible AI status, and science notes. Outcome statistics and external proof remain hidden until approved evidence lands."
          cta={{ label: 'Open anti-leak method', href: '/research/plagiarism-benchmark' }}
        />

        <SectionBand
          title="Live report surfaces"
          description="Each card links to a shipped page with a concrete method, status table, or evidence note."
        >
          <CardGrid>
            {BENCHMARKS.map((item) => (
              <SurfaceCard key={item.href} title={item.title} href={item.href}>
                {item.body}
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>

        <SectionBand title="Claim posture">
          <div className="grid gap-4 md:grid-cols-3">
            {CLAIM_POSTURE.map(({ label, icon: Icon }) => (
              <div key={label} className="rounded-lg border border-border bg-card p-5">
                <Icon className="size-5 text-secondary" aria-hidden="true" />
                <p className="mt-4 text-sm font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </SectionBand>
      </main>
    </>
  );
}
