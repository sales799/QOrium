import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MaxWidth } from '@/components/site/MaxWidth';
import { SectionHeading } from '@/components/site/SectionHeading';
import { FadeIn } from '@/components/motion/FadeIn';
import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { ShimmerButton } from '@/components/magicui/ShimmerButton';
import { Spotlight } from '@/components/aceternity/Spotlight';
import { BackgroundBeams } from '@/components/aceternity/BackgroundBeams';
import type { FeaturePageCopy } from '@/content/copy/features';

interface Props {
  copy: FeaturePageCopy;
  hereVisual?: React.ReactNode;
}

export function FeaturePageLayout({ copy, hereVisual }: Props) {
  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden relative py-24 [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,oklch(54.65%_0.246_262.87/0.18)_100%)]">
        <Spotlight className="left-1/2 top-0 -translate-x-[60%] opacity-35" />
        <BackgroundBeams className="opacity-40" />
        <MaxWidth as="div" className="relative z-10 grid gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <FadeIn>
              <Badge>{copy.hero.eyebrow}</Badge>
              <h1 className="mt-4 text-display-2 font-semibold text-balance">{copy.hero.title}</h1>
              <p className="mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">
                {copy.hero.sub}
              </p>
            </FadeIn>
            <FadeIn delay={0.1} className="flex flex-wrap gap-3">
              <Link href="/demo">
                <ShimmerButton>Book a demo</ShimmerButton>
              </Link>
              <Button asChild variant="secondary" size="lg">
                <Link href="/pricing">See pricing</Link>
              </Button>
            </FadeIn>
          </div>
          <div className="lg:col-span-5">
            {hereVisual ? <FadeIn delay={0.15}>{hereVisual}</FadeIn> : null}
          </div>
        </MaxWidth>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-border/60 bg-background py-24">
        <MaxWidth as="div">
          <Reveal>
            <SectionHeading eyebrow="How it works" title="Three steps, every engagement." />
          </Reveal>
          <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
            {copy.steps.map((s, i) => (
              <StaggerItem key={s.title}>
                <div className="flex h-full flex-col gap-3 rounded-lg border border-border bg-surface-1 p-6">
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-signal-300">
                    Step {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      {/* WHAT'S INCLUDED — TABS */}
      <section className="border-t border-border/60 bg-surface-1 py-24">
        <MaxWidth as="div">
          <Reveal>
            <SectionHeading eyebrow="What's included" title="Everything you need to ship." />
          </Reveal>
          <FadeIn className="mt-10">
            <Tabs defaultValue={copy.includes[0]?.tab ?? ''}>
              <TabsList>
                {copy.includes.map((it) => (
                  <TabsTrigger key={it.tab} value={it.tab}>
                    {it.tab}
                  </TabsTrigger>
                ))}
              </TabsList>
              {copy.includes.map((it) => (
                <TabsContent key={it.tab} value={it.tab}>
                  <ul className="grid gap-2 rounded-lg border border-border bg-background p-6 font-mono text-sm">
                    {it.lines.map((line) => (
                      <li
                        key={line}
                        className="flex gap-2 text-foreground/85 before:mt-2 before:size-1.5 before:shrink-0 before:rounded-full before:bg-signal-500"
                      >
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              ))}
            </Tabs>
          </FadeIn>
        </MaxWidth>
      </section>

      {/* USE CASE */}
      <section className="border-t border-border/60 bg-background py-24">
        <MaxWidth as="div" className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-300">
              {copy.useCase.who}
            </p>
            <blockquote className="mt-6 font-serif text-2xl leading-relaxed text-foreground text-balance">
              {copy.useCase.quote}
            </blockquote>
          </Reveal>
        </MaxWidth>
      </section>

      {/* COMPARISON */}
      <section className="border-t border-border/60 bg-surface-1 py-24">
        <MaxWidth as="div">
          <Reveal>
            <SectionHeading eyebrow="Compared with" title="What you give up — and gain." />
          </Reveal>
          <div className="mt-10 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-background">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Compared to</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Their approach</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">QOrium</th>
                </tr>
              </thead>
              <tbody>
                {copy.comparison.map((c) => (
                  <tr key={c.competitor} className="border-b border-border last:border-0">
                    <td className="px-4 py-4 align-top font-medium text-foreground">
                      {c.competitor}
                    </td>
                    <td className="px-4 py-4 align-top text-muted-foreground">{c.them}</td>
                    <td className="px-4 py-4 align-top text-foreground/90">{c.us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MaxWidth>
      </section>

      {/* PRICING SLICE */}
      <section className="border-t border-border/60 bg-background py-24">
        <MaxWidth as="div">
          <Reveal>
            <SectionHeading
              eyebrow="Pricing"
              title="Pick the tier that fits your volume."
              description="All ranges. Final terms negotiated against your hiring volume and stack scope."
            />
          </Reveal>
          <Stagger className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {copy.pricing.map((p) => (
              <StaggerItem key={p.tier}>
                <div className="flex h-full flex-col gap-2 rounded-lg border border-border bg-surface-1 p-5">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {p.tier}
                  </p>
                  <p className="text-2xl font-semibold text-signal-300">{p.range}</p>
                  <p className="text-sm text-muted-foreground">{p.detail}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild variant="primary" size="lg">
              <Link href="/contact">Talk to sales</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/pricing">Compare all SKUs</Link>
            </Button>
          </div>
        </MaxWidth>
      </section>
    </>
  );
}
