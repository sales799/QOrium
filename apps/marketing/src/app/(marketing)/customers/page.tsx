import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MaxWidth } from '@/components/site/MaxWidth';
import { SectionHeading } from '@/components/site/SectionHeading';
import { FadeIn } from '@/components/motion/FadeIn';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { NumberTicker } from '@/components/magicui/NumberTicker';
import { Spotlight } from '@/components/aceternity/Spotlight';

export const metadata: Metadata = {
  title: 'Customers',
  description: 'How our Day-0 cohort uses QOrium today, and where we go next.',
};

const STATS = [
  { label: 'Customer Zero (Talpro India) screens / week', value: 50, suffix: '+' },
  { label: 'Validated questions · M0', value: 530 },
  { label: 'Wave 1 + Wave 2 SMEs onboarded', value: 18 },
  { label: 'Y1 logo target', value: 66 },
];

const SLOTS = [
  {
    sku: 'Stack-Vault',
    label: 'BFSI major (in scoping)',
    note: '[TBD: real customer]',
    body: 'Discovery scope: 2,000-question library across Salesforce + Oracle Banking + custom risk. Quarterly refresh, watermarked, contractually exclusive.',
  },
  {
    sku: 'ReadyBank API',
    label: 'Mid-tier assessment platform (in scoping)',
    note: '[TBD: real customer]',
    body: 'Drop-in API for 50K questions/month, monthly anti-leak scan, 500 req/min rate cap.',
  },
  {
    sku: 'JD-Forge',
    label: 'IT services hiring team (in scoping)',
    note: '[TBD: real customer]',
    body: '200 JDs/month at $99 per JD. Per-drive Standard tier with optional Reviewed upgrade for senior roles.',
  },
];

export default function CustomersPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden relative py-24 [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,oklch(54.65%_0.246_262.87/0.18)_100%)]">
        <Spotlight className="left-1/2 top-0 -translate-x-1/2 opacity-25" />
        <MaxWidth as="div" className="relative z-10">
          <FadeIn className="space-y-5">
            <Badge>Customers</Badge>
            <h1 className="max-w-3xl text-display-2 font-semibold text-balance">
              Customer Zero is us. The next ones are landing now.
            </h1>
            <p className="max-w-2xl text-pretty text-muted-foreground">
              Talpro India runs the SKU before any external customer touches it. Our Day-0 cohort is
              forming. Below: stats from production, and the engagements we're building case studies
              around.
            </p>
          </FadeIn>
        </MaxWidth>
      </section>

      <section className="border-t border-border/60 bg-background py-20">
        <MaxWidth as="div">
          <SectionHeading eyebrow="In production" title="What we measure today." />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="border-l border-border-subtle pl-4">
                <div className="text-3xl font-semibold text-foreground">
                  <NumberTicker value={s.value} suffix={s.suffix ?? ''} />
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </MaxWidth>
      </section>

      <section className="border-t border-border/60 bg-surface-1 py-20">
        <MaxWidth as="div">
          <SectionHeading
            eyebrow="Engagements in flight"
            title="Case studies coming as logos close."
            description="We don't anonymize completed work. We don't fabricate logos either. Three slots are scoped; we'll publish each as the engagement reaches a milestone worth writing about."
          />
          <Stagger className="mt-10 grid gap-4 md:grid-cols-3">
            {SLOTS.map((s) => (
              <StaggerItem key={s.label}>
                <div className="flex h-full flex-col gap-3 rounded-lg border border-dashed border-border bg-background p-5">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal-300">
                    {s.sku}
                  </p>
                  <h3 className="text-base font-semibold text-foreground">{s.label}</h3>
                  <p className="text-sm text-muted-foreground">{s.body}</p>
                  <p className="mt-auto font-mono text-[11px] uppercase tracking-[0.18em] text-warning">
                    {s.note}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      <section className="border-t border-border/60 relative py-20 [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,oklch(54.65%_0.246_262.87/0.18)_100%)]">
        <MaxWidth as="div" className="text-center">
          <h2 className="text-display-2 font-semibold">Become a Day-0 logo.</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Pilot pricing on offer for the first 10 logos in each segment. Honest pricing, honest
            timeline, honest case-study commitment when you renew.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="primary" size="lg">
              <Link href="/demo">Book a scoping call</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </MaxWidth>
      </section>
    </>
  );
}
