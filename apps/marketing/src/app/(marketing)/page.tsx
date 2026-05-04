import Link from 'next/link';
import {
  ArrowRight,
  Database,
  Sparkles,
  ShieldCheck,
  Building2,
  Briefcase,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

import { MaxWidth } from '@/components/site/MaxWidth';
import { SectionHeading } from '@/components/site/SectionHeading';
import { FadeIn } from '@/components/motion/FadeIn';
import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { NumberTicker } from '@/components/magicui/NumberTicker';
import { Marquee } from '@/components/magicui/Marquee';
import { ShimmerButton } from '@/components/magicui/ShimmerButton';
import { Spotlight } from '@/components/aceternity/Spotlight';
import { BackgroundBeams } from '@/components/aceternity/BackgroundBeams';
import { BentoGrid, BentoCard } from '@/components/aceternity/BentoGrid';

import { homeCopy } from '@/content/copy/home';

const PILLAR_ICONS = {
  ReadyBank: Database,
  'JD-Forge': Sparkles,
  'Stack-Vault': ShieldCheck,
} as const;

const ICP_ICONS = {
  Platforms: Building2,
  'Enterprises & GCCs': Briefcase,
  'Staffing firms': Users,
} as const;

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-ink text-graphite-50">
        <Spotlight className="left-1/2 top-0 -translate-x-[60%]" />
        <BackgroundBeams className="opacity-50" />
        <div className="absolute inset-0 grid-bg opacity-15" aria-hidden />

        <MaxWidth as="div" className="relative z-10 py-24 lg:py-36">
          <FadeIn className="space-y-6">
            <Badge>{homeCopy.hero.eyebrow}</Badge>
            <h1 className="font-sans text-display-1 font-semibold text-balance">
              {homeCopy.hero.headline}
            </h1>
            <p className="max-w-3xl text-pretty text-lg text-graphite-300">{homeCopy.hero.sub}</p>
          </FadeIn>

          <FadeIn delay={0.1} className="mt-10 flex flex-wrap gap-4">
            <Link href={homeCopy.hero.primaryCta.href}>
              <ShimmerButton>{homeCopy.hero.primaryCta.label}</ShimmerButton>
            </Link>
            <Button asChild variant="secondary" size="lg">
              <Link href={homeCopy.hero.secondaryCta.href}>
                {homeCopy.hero.secondaryCta.label}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </FadeIn>

          {/* Proof bar */}
          <FadeIn delay={0.2} className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {homeCopy.proof.map((p) => (
              <div key={p.label} className="border-l border-border-subtle pl-4">
                <div className="text-3xl font-semibold text-foreground">
                  <NumberTicker
                    value={p.value}
                    prefix={'prefix' in p ? p.prefix : ''}
                    suffix={'suffix' in p ? p.suffix : ''}
                  />
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {p.label}
                </p>
              </div>
            ))}
          </FadeIn>
        </MaxWidth>
      </section>

      {/* THREE-PILLAR SKU SECTION */}
      <section className="border-t border-border/60 bg-background py-24">
        <MaxWidth as="div">
          <Reveal>
            <SectionHeading
              eyebrow={homeCopy.pillars.eyebrow}
              title={homeCopy.pillars.title}
              description={homeCopy.pillars.description}
            />
          </Reveal>

          <BentoGrid className="mt-12">
            {homeCopy.pillars.cards.map((card) => {
              const Icon = PILLAR_ICONS[card.title as keyof typeof PILLAR_ICONS];
              return (
                <BentoCard
                  key={card.title}
                  href={card.href}
                  title={
                    <span className="flex items-center justify-between">
                      <span>{card.title}</span>
                      <ArrowRight className="size-4 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                    </span>
                  }
                  description={
                    <>
                      <span className="block">{card.description}</span>
                      <span className="mt-3 block font-mono text-xs uppercase tracking-[0.18em] text-signal-300">
                        {card.accent}
                      </span>
                    </>
                  }
                  icon={Icon ? <Icon className="size-6" /> : null}
                />
              );
            })}
          </BentoGrid>
        </MaxWidth>
      </section>

      {/* ICP TRIPTYCH */}
      <section className="border-t border-border/60 bg-surface-1 py-24">
        <MaxWidth as="div">
          <Reveal>
            <SectionHeading eyebrow={homeCopy.icps.eyebrow} title={homeCopy.icps.title} />
          </Reveal>
          <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
            {homeCopy.icps.cards.map((c) => {
              const Icon = ICP_ICONS[c.label as keyof typeof ICP_ICONS];
              return (
                <StaggerItem key={c.href}>
                  <Link
                    href={c.href}
                    className="group block h-full rounded-lg border border-border bg-background p-6 transition-colors hover:border-signal-500/50"
                  >
                    {Icon ? <Icon className="size-6 text-signal-500" /> : null}
                    <h3 className="mt-4 text-lg font-semibold text-foreground">{c.label}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{c.copy}</p>
                    <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-signal-300 transition-transform group-hover:translate-x-1">
                      Explore <ArrowRight className="size-4" />
                    </span>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        </MaxWidth>
      </section>

      {/* 7-STAGE CONTENT ENGINE */}
      <section className="border-t border-border/60 bg-background py-24">
        <MaxWidth as="div">
          <Reveal>
            <SectionHeading
              eyebrow={homeCopy.pipeline.eyebrow}
              title={homeCopy.pipeline.title}
              description={homeCopy.pipeline.description}
            />
          </Reveal>
          <Stagger className="mt-12 grid gap-3 md:grid-cols-7" staggerChildren={0.06}>
            {homeCopy.pipeline.stages.map((stage, i) => (
              <StaggerItem key={stage.label}>
                <div className="relative flex h-full flex-col gap-3 rounded-lg border border-border bg-surface-1 p-4">
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-sm font-semibold text-foreground">{stage.label}</h3>
                  <p className="text-xs text-muted-foreground">{stage.detail}</p>
                  {i < homeCopy.pipeline.stages.length - 1 ? (
                    <div
                      className="absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-gradient-to-r from-signal-500/40 to-transparent md:block"
                      aria-hidden
                    />
                  ) : null}
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      {/* TRUST RAIL */}
      <section className="border-t border-border/60 bg-surface-1 py-12">
        <MaxWidth as="div">
          <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Day 0 cohort
          </p>
          <Marquee className="mt-6 [--duration:48s]" pauseOnHover>
            {homeCopy.trustRail.map((label) => (
              <span
                key={label}
                className="rounded-md border border-border bg-background px-4 py-2 font-mono text-sm text-muted-foreground"
              >
                {label}
              </span>
            ))}
          </Marquee>
        </MaxWidth>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/60 bg-background py-24">
        <MaxWidth as="div">
          <Reveal>
            <SectionHeading eyebrow={homeCopy.faq.eyebrow} title={homeCopy.faq.title} />
          </Reveal>
          <FadeIn className="mx-auto mt-10 max-w-3xl">
            <Accordion type="single" collapsible>
              {homeCopy.faq.items.map((it, i) => (
                <AccordionItem key={i} value={`q${i}`}>
                  <AccordionTrigger>{it.q}</AccordionTrigger>
                  <AccordionContent>{it.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FadeIn>
        </MaxWidth>
      </section>

      {/* FINAL CTA */}
      <section className="relative isolate overflow-hidden border-t border-border/60 bg-ink py-24 text-graphite-50">
        <Spotlight className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
        <MaxWidth as="div" className="relative z-10 text-center">
          <Reveal>
            <h2 className="text-display-2 font-semibold text-balance">{homeCopy.finalCta.title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-graphite-300">
              {homeCopy.finalCta.description}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href={homeCopy.finalCta.primary.href}>
                <ShimmerButton>{homeCopy.finalCta.primary.label}</ShimmerButton>
              </Link>
              <Button asChild variant="secondary" size="lg">
                <Link href={homeCopy.finalCta.secondary.href}>
                  {homeCopy.finalCta.secondary.label}
                </Link>
              </Button>
            </div>
          </Reveal>
        </MaxWidth>
      </section>
    </>
  );
}
