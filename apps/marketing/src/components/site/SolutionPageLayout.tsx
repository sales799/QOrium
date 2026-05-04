import Link from 'next/link';
import { ArrowRight, AlertCircle, CircleCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MaxWidth } from '@/components/site/MaxWidth';
import { SectionHeading } from '@/components/site/SectionHeading';
import { FadeIn } from '@/components/motion/FadeIn';
import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { Spotlight } from '@/components/aceternity/Spotlight';
import type { SolutionCopy } from '@/content/copy/solutions';

export function SolutionPageLayout({ copy }: { copy: SolutionCopy }) {
  return (
    <>
      <section className="relative isolate overflow-hidden relative py-24 [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,oklch(54.65%_0.246_262.87/0.18)_100%)]">
        <Spotlight className="left-1/2 top-0 -translate-x-[60%] opacity-30" />
        <MaxWidth as="div" className="relative z-10">
          <FadeIn className="space-y-5">
            <Badge>{copy.hero.eyebrow}</Badge>
            <h1 className="max-w-4xl text-display-2 font-semibold text-balance">
              {copy.hero.title}
            </h1>
            <p className="max-w-2xl text-pretty text-muted-foreground">{copy.hero.sub}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild variant="primary" size="lg">
                <Link href="/demo">Book a demo</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href={copy.primaryCta.href}>{copy.primaryCta.label}</Link>
              </Button>
            </div>
          </FadeIn>
        </MaxWidth>
      </section>

      <section className="border-t border-border/60 bg-background py-24">
        <MaxWidth as="div">
          <Reveal>
            <SectionHeading eyebrow="Pains we hear" title="Three problems we keep solving." />
          </Reveal>
          <Stagger className="mt-10 grid gap-4 md:grid-cols-3">
            {copy.pains.map((p) => (
              <StaggerItem key={p.title}>
                <div className="flex h-full flex-col gap-3 rounded-lg border border-border bg-surface-1 p-5">
                  <AlertCircle className="size-5 text-warning" />
                  <h3 className="text-base font-semibold text-foreground">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      <section className="border-t border-border/60 bg-surface-1 py-24">
        <MaxWidth as="div">
          <Reveal>
            <SectionHeading
              eyebrow="Why QOrium"
              title="What changes once you switch."
              description={`Primary SKU: ${copy.primarySku.name}.`}
            />
          </Reveal>
          <Stagger className="mt-10 grid gap-4 md:grid-cols-3">
            {copy.why.map((w) => (
              <StaggerItem key={w.title}>
                <div className="flex h-full flex-col gap-3 rounded-lg border border-border bg-background p-5">
                  <CircleCheck className="size-5 text-positive" />
                  <h3 className="text-base font-semibold text-foreground">{w.title}</h3>
                  <p className="text-sm text-muted-foreground">{w.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      <section className="border-t border-border/60 bg-background py-24">
        <MaxWidth as="div" className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-300">Today</p>
            <p className="mt-6 font-serif text-2xl leading-relaxed text-foreground text-balance">
              {copy.proof}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">[Case study coming]</p>
          </Reveal>
        </MaxWidth>
      </section>

      <section className="border-t border-border/60 relative py-20 [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,oklch(54.65%_0.246_262.87/0.18)_100%)]">
        <MaxWidth as="div" className="text-center">
          <h2 className="text-display-2 font-semibold">Ready to see {copy.primarySku.name}?</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="primary" size="lg">
              <Link href="/demo">Book a demo</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href={copy.primarySku.href}>
                Read the deep-dive <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </MaxWidth>
      </section>
    </>
  );
}
