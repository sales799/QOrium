import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MaxWidth } from '@/components/site/MaxWidth';
import { SectionHeading } from '@/components/site/SectionHeading';
import { FadeIn } from '@/components/motion/FadeIn';
import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { ShimmerButton } from '@/components/magicui/ShimmerButton';
import { Spotlight } from '@/components/aceternity/Spotlight';
import { BackgroundBeams } from '@/components/aceternity/BackgroundBeams';
import { productCopy } from '@/content/copy/product';

export const metadata: Metadata = {
  title: 'Platform overview',
  description: productCopy.hero.sub,
  alternates: { canonical: '/product' },
};

const SECTION_NAV = [
  { id: 'problem', label: 'The problem' },
  { id: 'engine', label: 'Content engine' },
  { id: 'skus', label: 'Three SKUs' },
  { id: 'anti-leak', label: 'Anti-leak moat' },
  { id: 'role-graph', label: 'Role-graph' },
  { id: 'quality', label: 'Quality bars' },
];

export default function ProductPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden relative py-24 [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,oklch(54.65%_0.246_262.87/0.18)_100%)] lg:py-32">
        <Spotlight className="left-1/2 top-0 -translate-x-[60%] opacity-40" />
        <BackgroundBeams className="opacity-40" />
        <MaxWidth as="div" className="relative z-10">
          <FadeIn className="space-y-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-300">
              {productCopy.hero.eyebrow}
            </p>
            <h1 className="text-display-2 font-semibold text-balance">{productCopy.hero.title}</h1>
            <p className="max-w-3xl text-pretty text-lg text-muted-foreground">
              {productCopy.hero.sub}
            </p>
          </FadeIn>
          <FadeIn delay={0.1} className="mt-12 flex flex-wrap gap-3">
            {SECTION_NAV.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-pill border border-border-subtle px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-signal-500/50 hover:text-foreground"
              >
                {s.label}
              </a>
            ))}
          </FadeIn>
        </MaxWidth>
      </section>

      {/* THE PROBLEM */}
      <section id="problem" className="border-t border-border/60 bg-background py-24 scroll-mt-24">
        <MaxWidth as="div" className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Reveal>
              <SectionHeading
                eyebrow={productCopy.problem.eyebrow}
                title={productCopy.problem.title}
              />
            </Reveal>
          </div>
          <div className="md:col-span-8">
            <FadeIn className="space-y-5 font-serif text-lg leading-relaxed text-foreground/90">
              {productCopy.problem.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </FadeIn>
          </div>
        </MaxWidth>
      </section>

      {/* CONTENT ENGINE */}
      <section id="engine" className="border-t border-border/60 bg-surface-1 py-24 scroll-mt-24">
        <MaxWidth as="div">
          <Reveal>
            <SectionHeading
              eyebrow={productCopy.engine.eyebrow}
              title={productCopy.engine.title}
              description={productCopy.engine.body}
            />
          </Reveal>
          <Stagger className="mt-12 grid gap-3 md:grid-cols-7">
            {[
              'Spec in',
              'AI draft',
              'Self-critique',
              'SME review',
              'Calibrate',
              'Release',
              'Post-deploy',
            ].map((label, i) => (
              <StaggerItem key={label}>
                <div className="rounded-lg border border-border bg-background p-4">
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-2 text-sm font-semibold text-foreground">{label}</h3>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      {/* THREE SKUs */}
      <section id="skus" className="border-t border-border/60 bg-background py-24 scroll-mt-24">
        <MaxWidth as="div">
          <Reveal>
            <SectionHeading
              eyebrow={productCopy.skus.eyebrow}
              title={productCopy.skus.title}
              description={productCopy.skus.body}
            />
          </Reveal>
          <div className="mt-12 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-1">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-medium text-muted-foreground">SKU</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">What it is</th>
                  <th className="hidden px-4 py-3 font-medium text-muted-foreground md:table-cell">
                    For whom
                  </th>
                  <th className="hidden px-4 py-3 font-medium text-muted-foreground lg:table-cell">
                    Pricing
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {productCopy.skus.rows.map((r) => (
                  <tr key={r.name} className="border-b border-border last:border-0">
                    <td className="px-4 py-4 align-top">
                      <span className="font-semibold text-foreground">{r.name}</span>
                    </td>
                    <td className="px-4 py-4 align-top text-foreground/80">{r.what}</td>
                    <td className="hidden px-4 py-4 align-top text-muted-foreground md:table-cell">
                      {r.forWho}
                    </td>
                    <td className="hidden px-4 py-4 align-top font-mono text-xs text-muted-foreground lg:table-cell">
                      {r.price}
                    </td>
                    <td className="px-4 py-4 align-top text-right">
                      <Link
                        href={r.href}
                        className="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:text-signal-600"
                      >
                        Explore <ArrowRight className="size-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MaxWidth>
      </section>

      {/* ANTI-LEAK */}
      <section id="anti-leak" className="border-t border-border/60 bg-surface-1 py-24 scroll-mt-24">
        <MaxWidth as="div" className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Reveal>
              <SectionHeading
                eyebrow={productCopy.antileak.eyebrow}
                title={productCopy.antileak.title}
              />
            </Reveal>
          </div>
          <div className="md:col-span-7">
            <Stagger className="space-y-4">
              {productCopy.antileak.bullets.map((b) => (
                <StaggerItem key={b}>
                  <div className="flex gap-3 rounded-lg border border-border bg-background p-4">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-positive" />
                    <p className="text-sm text-foreground/90">{b}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </MaxWidth>
      </section>

      {/* ROLE-GRAPH */}
      <section
        id="role-graph"
        className="border-t border-border/60 bg-background py-24 scroll-mt-24"
      >
        <MaxWidth as="div" className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Reveal>
              <SectionHeading
                eyebrow={productCopy.rolegraph.eyebrow}
                title={productCopy.rolegraph.title}
                description={productCopy.rolegraph.body}
              />
            </Reveal>
          </div>
          <div className="md:col-span-7">
            <FadeIn>
              <pre className="overflow-x-auto rounded-lg border border-border bg-surface-1 p-6 font-mono text-xs leading-relaxed text-foreground/85">
                {`Senior Backend Engineer (Java Spring Boot, 5+ yrs)
├── Java 21 fundamentals (band: 3-4 · MCQ × 4, Coding × 2)
├── Spring Boot
│   ├── @Transactional propagation (band: 4 · SJT × 2, Coding × 1)
│   ├── Configuration & profiles (band: 3 · MCQ × 3)
│   └── Security & filters (band: 4 · SJT × 1, Coding × 1)
├── JPA / Hibernate
│   ├── N+1 query patterns (band: 4 · Coding × 2)
│   └── Optimistic vs pessimistic locks (band: 5 · SJT × 1)
├── PostgreSQL
│   ├── Index design (band: 4 · MCQ × 2, SQL × 1)
│   └── Explain plans (band: 5 · SQL × 2)
└── System design
    ├── Idempotency (band: 4 · SJT × 1)
    └── Rate limiting (band: 4 · SJT × 1)`}
              </pre>
            </FadeIn>
          </div>
        </MaxWidth>
      </section>

      {/* QUALITY BARS */}
      <section id="quality" className="border-t border-border/60 bg-surface-1 py-24 scroll-mt-24">
        <MaxWidth as="div">
          <Reveal>
            <SectionHeading
              eyebrow={productCopy.quality.eyebrow}
              title={productCopy.quality.title}
            />
          </Reveal>
          <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {productCopy.quality.bars.map((b) => (
              <StaggerItem key={b.label}>
                <div className="rounded-lg border border-border bg-background p-5">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {b.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-signal-300">{b.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{b.detail}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden border-t border-border/60 relative py-24 [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,oklch(54.65%_0.246_262.87/0.18)_100%)]">
        <Spotlight className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25" />
        <MaxWidth as="div" className="relative z-10 text-center">
          <Reveal>
            <h2 className="text-display-2 font-semibold text-balance">{productCopy.cta.title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
              {productCopy.cta.description}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href={productCopy.cta.primary.href}>
                <ShimmerButton>{productCopy.cta.primary.label}</ShimmerButton>
              </Link>
              <Button asChild variant="secondary" size="lg">
                <Link href={productCopy.cta.secondary.href}>{productCopy.cta.secondary.label}</Link>
              </Button>
            </div>
          </Reveal>
        </MaxWidth>
      </section>
    </>
  );
}
