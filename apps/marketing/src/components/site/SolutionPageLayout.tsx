import Link from 'next/link';
import { ArrowRight, AlertCircle, CircleCheck } from 'lucide-react';

import { MaxWidth } from '@/components/site/MaxWidth';
import { PillButton } from '@/components/site/PillButton';
import { SectionHeading } from '@/components/site/SectionHeading';
import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { BlurFade } from '@/components/magicui/BlurFade';
import { FlickeringGrid } from '@/components/magicui/FlickeringGrid';
import type { SolutionCopy } from '@/content/copy/solutions';

export function SolutionPageLayout({ copy }: { copy: SolutionCopy }) {
  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden py-24 [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,oklch(54.65%_0.246_262.87/0.18)_100%)]">
        <FlickeringGrid
          className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,transparent_30%,black_75%)]"
          squareSize={3}
          gridGap={4}
          flickerChance={0.16}
          maxOpacity={0.16}
          color="var(--secondary)"
        />
        <MaxWidth as="div" className="relative z-10 space-y-5">
          <BlurFade delay={0.05}>
            <p className="inline-flex h-8 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm shadow-sm">
              <span className="size-1.5 rounded-full bg-secondary" />
              {copy.hero.eyebrow}
            </p>
          </BlurFade>
          <BlurFade delay={0.15}>
            <h1 className="max-w-4xl text-balance text-3xl font-medium tracking-tighter text-primary md:text-4xl lg:text-5xl">
              {copy.hero.title}
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
              {copy.hero.sub}
            </p>
          </BlurFade>
          <BlurFade delay={0.25}>
            <div className="flex flex-wrap gap-2.5 pt-2">
              <PillButton href="/demo" variant="primary">
                Book a demo
              </PillButton>
              <PillButton href={copy.primaryCta.href} variant="secondary">
                {copy.primaryCta.label}
              </PillButton>
            </div>
          </BlurFade>
        </MaxWidth>
      </section>

      {/* PAINS */}
      <section className="border-t border-border/60 bg-background py-24">
        <MaxWidth as="div">
          <Reveal>
            <SectionHeading eyebrow="Pains we hear" title="Three problems we keep solving." />
          </Reveal>
          <Stagger className="mt-10 grid gap-4 md:grid-cols-3">
            {copy.pains.map((p) => (
              <StaggerItem key={p.title}>
                <div className="flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-5">
                  <AlertCircle className="size-5 text-warning" />
                  <h3 className="text-base font-semibold text-foreground">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      {/* WHY */}
      <section className="border-t border-border/60 bg-card py-24">
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

      {/* PROOF */}
      <section className="border-t border-border/60 bg-background py-24">
        <MaxWidth as="div" className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-secondary">Today</p>
            <p className="mt-6 text-balance text-2xl leading-relaxed text-foreground">
              {copy.proof}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">[Case study coming]</p>
          </Reveal>
        </MaxWidth>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 relative py-20 [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,oklch(54.65%_0.246_262.87/0.18)_100%)]">
        <MaxWidth as="div" className="text-center">
          <h2 className="text-balance text-3xl font-medium tracking-tighter md:text-4xl">
            Ready to see {copy.primarySku.name}?
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <PillButton href="/demo" variant="primary">
              Book a demo
            </PillButton>
            <Link
              href={copy.primarySku.href}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-medium text-foreground transition-all hover:bg-accent active:scale-95"
            >
              Read the deep-dive <ArrowRight className="size-4" />
            </Link>
          </div>
        </MaxWidth>
      </section>
    </>
  );
}
