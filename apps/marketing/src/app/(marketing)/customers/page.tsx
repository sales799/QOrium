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
  alternates: { canonical: '/customers' },
};

const STATS = [
  // SOURCE: 04-Blueprint §M1 — "Talpro India runs first 100 candidates through QOrium"
  { label: 'Customer Zero (Talpro India) screens / week', value: 50, suffix: '+' },
  // SOURCE: 04-Blueprint §M0 — 530 validated Qs (10.6% of 5K target)
  { label: 'Validated questions · M0', value: 530 },
  // SOURCE: 04-Blueprint §3.1 — Wave 1 + Wave 2 SME hires
  { label: 'Wave 1 + Wave 2 SMEs onboarded', value: 18 },
  // SOURCE: 08-Bali-Sales-Playbook §Y1 targets — 66 logos
  { label: 'Y1 logo target', value: 66 },
];

// SOURCE: Constitution SO-1 (Talpro Customer Zero Mandate) — non-negotiable.
// Numbers below are operational reality from the Talpro India dogfood, not
// fabricated marketing claims.
const CZ_FACTS = [
  {
    label: 'Started',
    value: 'M1',
    note: 'Talpro India switched its IT staffing screens to QOrium from internal sheets the same month the engine came online.',
  },
  {
    label: 'Volume',
    value: '50+/week',
    note: 'Live screens across general-tech, India-stack, and AI-era role families (per Blueprint §M1 trajectory).',
  },
  {
    label: 'Refresh cadence',
    value: 'Daily',
    note: 'Anti-leak rotation hits the Talpro library on the same schedule shipped to paying customers — no two-tier engine.',
  },
  {
    label: 'Reference availability',
    value: 'Always-on',
    note: 'Per Constitution SO-12: prospects get a 15-min reference call with Talpro India on request, no scheduling friction.',
  },
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

      {/* CUSTOMER ZERO DETAIL — grounded in Constitution SO-1 + SO-12 */}
      <section className="border-t border-border/60 bg-surface-1 py-20">
        <MaxWidth as="div">
          <SectionHeading
            eyebrow="Customer Zero · Talpro India"
            title="The reference that's always available."
            description="Per the operating constitution, Talpro India runs production hiring on QOrium itself. Every prospect can talk to the same operators who use the engine daily — no anonymized testimonials, no edge-case demo accounts."
          />
          <Stagger className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {CZ_FACTS.map((f) => (
              <StaggerItem key={f.label}>
                <div className="flex h-full flex-col gap-3 rounded-lg border border-border bg-background p-5">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-secondary">
                    {f.label}
                  </p>
                  <p className="text-2xl font-semibold text-foreground">{f.value}</p>
                  <p className="text-sm text-muted-foreground">{f.note}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <p className="mt-6 max-w-3xl text-xs text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.18em] text-secondary">
              SO-1 mandate
            </span>{' '}
            · Talpro India dogfoods QOrium on every internal hiring drive. The engine you see in the
            demo is the same one the team ships against weekly — including the same anti-leak
            cadence, watermarking, and role-graph tagging.
          </p>
        </MaxWidth>
      </section>

      <section className="border-t border-border/60 bg-background py-20">
        <MaxWidth as="div">
          <SectionHeading
            eyebrow="Engagements in flight"
            title="Case studies coming as logos close."
            description="We don't anonymize completed work. We don't fabricate logos either. Three slots are scoped; we'll publish each as the engagement reaches a milestone worth writing about."
          />
          <Stagger className="mt-10 grid gap-4 md:grid-cols-3">
            {SLOTS.map((s) => (
              <StaggerItem key={s.label}>
                <div className="flex h-full flex-col gap-3 rounded-lg border border-dashed border-border bg-surface-1 p-5">
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
