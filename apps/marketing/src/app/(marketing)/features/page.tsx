import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Database, Sparkles, ShieldCheck } from 'lucide-react';

import { MaxWidth } from '@/components/site/MaxWidth';
import { SectionHeading } from '@/components/site/SectionHeading';
import { FadeIn } from '@/components/motion/FadeIn';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { Spotlight } from '@/components/aceternity/Spotlight';
import { featureIndex } from '@/content/copy/features';

export const metadata: Metadata = {
  title: 'Features',
  description: 'Three SKUs, one library: ReadyBank, JD-Forge, Stack-Vault.',
};

const ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  readybank: Database,
  'jd-forge': Sparkles,
  'stack-vault': ShieldCheck,
};

export default function FeaturesIndexPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink py-24 text-graphite-50">
        <Spotlight className="left-1/2 top-0 -translate-x-1/2 opacity-25" />
        <MaxWidth as="div" className="relative z-10">
          <FadeIn className="space-y-5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-300">Features</p>
            <h1 className="max-w-3xl text-display-2 font-semibold text-balance">
              Three SKUs, one library, one engine.
            </h1>
            <p className="max-w-2xl text-pretty text-graphite-300">
              Same content engine. Different exclusivity. Pick the SKU that matches your hiring
              volume and IP posture.
            </p>
          </FadeIn>
        </MaxWidth>
      </section>

      <section className="border-t border-border/60 bg-background py-16">
        <MaxWidth as="div">
          <SectionHeading eyebrow="Pick a SKU" title="Deep-dives below." />
          <Stagger className="mt-10 grid gap-6 md:grid-cols-3">
            {featureIndex.map((f) => {
              const Icon = ICON[f.slug];
              return (
                <StaggerItem key={f.slug}>
                  <Link
                    href={`/features/${f.slug}`}
                    className="group block h-full rounded-lg border border-border bg-surface-1 p-6 transition-colors hover:border-signal-500/50"
                  >
                    {Icon ? <Icon className="size-6 text-signal-500" /> : null}
                    <h2 className="mt-4 text-xl font-semibold text-foreground">{f.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{f.summary}</p>
                    <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-signal-300">
                      {f.accent}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-signal-300 transition-transform group-hover:translate-x-1">
                      Read deep-dive <ArrowRight className="size-4" />
                    </span>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        </MaxWidth>
      </section>
    </>
  );
}
