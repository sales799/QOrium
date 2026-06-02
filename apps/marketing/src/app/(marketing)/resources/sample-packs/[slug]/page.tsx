import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SamplePackDetail } from '@/components/interactive-proof/SamplePacks';
import { EnterpriseJourneyBand } from '@/components/phase4/MarketingSurface';
import { MaxWidth } from '@/components/site/MaxWidth';
import { getSamplePack, samplePacks } from '@/content/interactive-proof';

type SamplePackPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return samplePacks.map((pack) => ({ slug: pack.slug }));
}

export async function generateMetadata({ params }: SamplePackPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pack = getSamplePack(slug);
  if (!pack) return {};

  return {
    title: pack.title,
    description: pack.summary,
    alternates: { canonical: `/resources/sample-packs/${pack.slug}` },
  };
}

export default async function SamplePackDetailPage({ params }: SamplePackPageProps) {
  const { slug } = await params;
  const pack = getSamplePack(slug);
  if (!pack) notFound();

  return (
    <>
      <section className="surface-shell evidence-ledger border-b border-white/10 py-16 md:py-20">
        <MaxWidth as="div">
          <p className="font-mono text-xs font-semibold uppercase text-signal-300">
            {pack.family} / {pack.level}
          </p>
          <h1 className="mt-4 max-w-5xl text-balance text-5xl font-semibold text-white md:text-7xl">
            {pack.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-shell-muted">{pack.summary}</p>
        </MaxWidth>
      </section>
      <section className="bg-background py-16 md:py-20">
        <MaxWidth as="div">
          <SamplePackDetail pack={pack} />
        </MaxWidth>
      </section>
      <EnterpriseJourneyBand
        title={`${pack.title} should prove item quality without leaking the bank.`}
        description="Sample-pack pages now explain the protected-content logic behind the lead capture: show enough to evaluate fit, gate enough to keep production banks fresh, and connect every pack back to library, role, and stack pages."
        proofPoints={[
          `${pack.previewItems.length} public preview items are visible before unlock.`,
          `${pack.itemCount - pack.previewItems.length} deeper items stay gated to reduce harvesting risk.`,
          'Library, role, and stack links keep the evaluator inside the full assessment graph.',
        ]}
        links={[
          {
            label: 'Unlock full pack',
            href: `/resources/sample-packs/${pack.slug}`,
            body: 'Use the form on this page to request the complete sample pack by email.',
          },
          {
            label: 'Review anti-leak posture',
            href: '/anti-leak',
            body: 'See why public previews and production content need different exposure rules.',
          },
          {
            label: 'Book sample-pack walkthrough',
            href: `/demo?sample_pack=${pack.slug}`,
            body: 'Discuss how this pack would map to your role, stack, and shortlist workflow.',
          },
        ]}
      />
    </>
  );
}
