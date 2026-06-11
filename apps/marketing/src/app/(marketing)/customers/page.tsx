import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MaxWidth } from '@/components/site/MaxWidth';
import { SectionHeading } from '@/components/site/SectionHeading';
import { FadeIn } from '@/components/motion/FadeIn';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { Spotlight } from '@/components/aceternity/Spotlight';
import { WebPageJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/content/site.config';

export const metadata: Metadata = {
  title: 'Customers',
  description: 'How our Day-0 cohort uses QOrium today, and where we go next.',
  alternates: { canonical: '/customers' },
};

// SOURCE: Constitution SO-1 (Talpro Customer Zero Mandate) — non-negotiable.
const CZ_FACTS = [
  {
    label: 'Started',
    value: 'Customer Zero',
    note: 'Talpro India switched its IT staffing screens to QOrium from internal sheets the same month the engine came online.',
  },
  {
    label: 'Scope',
    value: 'Internal hiring',
    note: 'The dogfood environment covers general-tech, India-stack, and AI-era role families before external proof is published.',
  },
  {
    label: 'Refresh cadence',
    value: 'Shared engine',
    note: 'The same anti-leak, watermarking, and role-graph mechanics are exercised internally before they are sold externally.',
  },
  {
    label: 'Reference availability',
    value: 'Operator call',
    note: 'Prospects can speak with the internal operators using QOrium rather than reading invented testimonials.',
  },
];

export default function CustomersPage() {
  return (
    <>
      <WebPageJsonLd
        name="QOrium customers"
        description="Teams using QOrium to run defensible, AI-graded skills assessments."
        url={`${siteConfig.url}/customers`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Customers', path: '/customers' },
        ]}
      />
      <section className="relative isolate overflow-hidden relative py-24 [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,oklch(54.65%_0.246_262.87/0.18)_100%)]">
        <Spotlight className="left-1/2 top-0 -translate-x-1/2 opacity-25" />
        <MaxWidth as="div" className="relative z-10">
          <FadeIn className="space-y-5">
            <Badge>Customers</Badge>
            <h1 className="max-w-3xl text-display-2 font-semibold text-balance">
              Customer Zero is us. External proof waits for evidence.
            </h1>
            <p className="max-w-2xl text-pretty text-muted-foreground">
              Talpro India runs the SKU before any external customer touches it. Our Day-0 cohort is
              internal by design; external customer stories publish only after evidence and
              permission exist.
            </p>
          </FadeIn>
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

      <section className="border-t border-border/60 relative py-20 [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,oklch(54.65%_0.246_262.87/0.18)_100%)]">
        <MaxWidth as="div" className="text-center">
          <h2 className="text-display-2 font-semibold">Become an approved reference.</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Pilot pricing is available for qualified early customers. Public logos, quantified
            outcomes, and case studies publish only after evidence and permission exist.
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
