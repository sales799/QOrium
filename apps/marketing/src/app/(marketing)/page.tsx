import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Database,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Briefcase,
  Users,
  Zap,
} from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { MaxWidth } from '@/components/site/MaxWidth';
import { PillButton } from '@/components/site/PillButton';
import { RoiCalculator } from '@/components/site/RoiCalculator';
import { AnimatedPipeline } from '@/components/site/AnimatedPipeline';
import { Reveal } from '@/components/motion/Reveal';
import { BlurFade } from '@/components/magicui/BlurFade';
import { BorderBeam } from '@/components/magicui/BorderBeam';
import { HeroVideoDialog } from '@/components/magicui/HeroVideoDialog';
import { Marquee } from '@/components/magicui/Marquee';
import { NumberTicker } from '@/components/magicui/NumberTicker';
import { OrbitingCircles } from '@/components/magicui/OrbitingCircles';
import { ShimmerButton } from '@/components/magicui/ShimmerButton';
import { AuroraBackground } from '@/components/aceternity/AuroraBackground';

import { ReadyBankBento } from '@/components/bento/ReadyBankBento';
import { JdForgeBento } from '@/components/bento/JdForgeBento';
import { AntiLeakBento } from '@/components/bento/AntiLeakBento';
import { StackVaultBento } from '@/components/bento/StackVaultBento';

import { WebsiteJsonLd } from '@/components/seo/JsonLd';
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

const BENTO_ITEMS = [
  {
    id: 1,
    title: 'ReadyBank — shared, calibrated, fresh',
    description:
      'IRT-calibrated questions across 1,000+ skills, indexed in our role-graph. One API call returns a ready-to-import pack in HackerRank, Mettl, Codility, or QOrium-native formats.',
    content: <ReadyBankBento />,
  },
  {
    id: 2,
    title: 'JD-Forge — JD in, pack out, 30 seconds',
    description:
      'Drop a JD. Watch the parser pull role + skills + seniority, plan the format mix, draft 20 questions, self-critique each, and return a calibrated pack. AI-only or human-reviewed tier.',
    content: <JdForgeBento />,
  },
  {
    id: 3,
    title: 'Anti-Leak Engine — rotation, not claims',
    description:
      'Continuous semantic crawl across Glassdoor, Reddit, LeetCode, GeeksforGeeks. Match → AI variant → SME validate → release as v2 → original retires. 15% rotated quarterly.',
    content: <AntiLeakBento />,
  },
  {
    id: 4,
    title: 'Stack-Vault — yours, contractually',
    description:
      'Customer-exclusive private library aligned to your stack. Cryptographic per-customer watermark on every test case. If a question leaks, forensic attribution is contractual.',
    content: <StackVaultBento />,
  },
];

// Hero video src — placeholder until founder records the JD-Forge demo
// (~30 sec). Real source lands here as a single change. Until then, the
// dialog opens to an empty iframe; the play affordance is the visible asset.
// See audit/LIVE-SITE-RECONCILIATION.md §6.
const HERO_VIDEO_SRC = '';

export const metadata: Metadata = {
  title: {
    absolute: "QOrium — The world's question bank for hiring.",
  },
  description:
    "QOrium is the world's first enterprise-grade Question-Bank-as-a-Service. IRT-calibrated, anti-leak-rotated, watermark-per-candidate assessment library.",
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      <WebsiteJsonLd />
      <main className="flex flex-col items-center justify-center divide-y divide-border w-full">
        {/* HERO — Variant C Light: AuroraBackground + HeroVideoDialog right + copy left */}
        <section id="hero" className="relative w-full overflow-hidden">
          <AuroraBackground className="-z-10 h-[800px] md:h-[900px]" />
          <div className="relative z-10 flex w-full flex-col px-6">
            <div className="mx-auto grid w-full max-w-6xl gap-12 pt-28 pb-12 md:pt-32 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16">
              {/* Left column — copy + CTAs */}
              <div className="flex flex-col gap-8">
                <BlurFade delay={0.1}>
                  <p className="inline-flex h-8 w-fit items-center gap-2 rounded-full border border-border bg-card/80 px-3 text-sm shadow-sm backdrop-blur">
                    <Zap className="size-3.5 text-secondary" />
                    {homeCopy.hero.eyebrow}
                  </p>
                </BlurFade>

                <BlurFade delay={0.2}>
                  <div className="flex flex-col gap-5">
                    <h1 className="text-balance font-sans text-4xl font-medium tracking-tighter text-primary md:text-5xl lg:text-6xl">
                      {homeCopy.hero.headline}
                    </h1>
                    <p className="max-w-xl text-balance text-base font-medium leading-relaxed tracking-tight text-muted-foreground md:text-lg">
                      {homeCopy.hero.sub}
                    </p>
                  </div>
                </BlurFade>

                <BlurFade delay={0.3}>
                  <div className="flex flex-wrap items-center gap-3">
                    <ShimmerButton
                      href={homeCopy.hero.primaryCta.href}
                      background="var(--secondary)"
                      shimmerColor="var(--secondary)"
                      className="text-secondary-foreground"
                    >
                      {homeCopy.hero.primaryCta.label}
                    </ShimmerButton>
                    <PillButton href={homeCopy.hero.secondaryCta.href} variant="secondary">
                      {homeCopy.hero.secondaryCta.label}
                    </PillButton>
                  </div>
                </BlurFade>
              </div>

              {/* Right column — HeroVideoDialog framed by BorderBeam */}
              <BlurFade delay={0.35}>
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card/40 shadow-xl backdrop-blur">
                  <HeroVideoDialog videoSrc={HERO_VIDEO_SRC} className="aspect-video w-full" />
                  <BorderBeam
                    duration={12}
                    size={220}
                    colorFrom="oklch(54.65% 0.246 262.87)"
                    colorTo="oklch(0.85 0.12 220)"
                  />
                </div>
              </BlurFade>
            </div>

            {/* Hero proof bar */}
            <BlurFade
              delay={0.5}
              className="mx-auto mt-4 grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4 pb-16"
            >
              {homeCopy.proof.map((p) => (
                <div
                  key={p.label}
                  className="rounded-xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur"
                >
                  <div className="text-2xl font-semibold tracking-tight text-foreground">
                    <NumberTicker
                      value={p.value}
                      prefix={'prefix' in p ? p.prefix : ''}
                      suffix={'suffix' in p ? p.suffix : ''}
                    />
                  </div>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {p.label}
                  </p>
                </div>
              ))}
            </BlurFade>
          </div>
        </section>

        {/* COMPANY SHOWCASE / TRUST RAIL */}
        <section className="w-full py-12">
          <MaxWidth as="div">
            <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Day-0 cohort
            </p>
            <Marquee className="mt-6 [--duration:48s]" pauseOnHover>
              {homeCopy.trustRail.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-border bg-card px-4 py-2 font-mono text-sm text-muted-foreground shadow-sm"
                >
                  {label}
                </span>
              ))}
            </Marquee>
          </MaxWidth>
        </section>

        {/* BENTO (2x2) */}
        <section
          id="bento"
          className="relative flex w-full flex-col items-center justify-center px-5 md:px-10"
        >
          <div className="relative mx-5 border-x md:mx-10">
            <div className="absolute -left-4 top-0 h-full w-4 text-primary/5 [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)] [background-size:10px_10px] md:-left-14 md:w-14" />
            <div className="absolute -right-4 top-0 h-full w-4 text-primary/5 [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)] [background-size:10px_10px] md:-right-14 md:w-14" />

            <div className="w-full border-b p-10 md:p-14">
              <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-2">
                <BlurFade>
                  <h2 className="text-balance pb-1 text-center text-3xl font-medium tracking-tighter md:text-4xl">
                    {homeCopy.pillars.title}
                  </h2>
                </BlurFade>
                <BlurFade delay={0.1}>
                  <p className="text-balance text-center font-medium text-muted-foreground">
                    {homeCopy.pillars.description}
                  </p>
                </BlurFade>
              </div>
            </div>

            <div className="grid grid-cols-1 overflow-hidden md:grid-cols-2">
              {BENTO_ITEMS.map((item, i) => (
                <Reveal
                  key={item.id}
                  delay={i * 0.08}
                  direction="up"
                  className="group relative flex max-h-[420px] min-h-[480px] flex-col items-start justify-end p-0.5 before:absolute before:-left-0.5 before:top-0 before:z-10 before:h-screen before:w-px before:bg-border before:content-[''] after:absolute after:-top-0.5 after:left-0 after:z-10 after:h-px after:w-screen after:bg-border after:content-[''] md:min-h-[460px]"
                >
                  <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                    {item.content}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-6">
                    <h3 className="text-lg font-semibold tracking-tighter">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ROI CALCULATOR — between Bento and Pipeline per LIVE-SITE-RECONCILIATION §7 */}
        <section id="roi" className="relative w-full py-24">
          <MaxWidth as="div">
            <BlurFade>
              <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-secondary">
                ROI in your numbers
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl text-balance text-center text-3xl font-medium tracking-tighter md:text-4xl">
                Plug in your hiring volume. Watch the math.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-balance text-center text-muted-foreground">
                JD-Forge typically pays for itself by JD #40. Slide the inputs to see net value vs.
                an internal TA team building packs by hand.
              </p>
            </BlurFade>
            <BlurFade delay={0.1}>
              <div className="relative mt-10 overflow-hidden rounded-xl">
                <RoiCalculator />
                <BorderBeam
                  duration={16}
                  size={260}
                  colorFrom="oklch(54.65% 0.246 262.87)"
                  colorTo="oklch(0.85 0.12 220)"
                />
              </div>
            </BlurFade>
          </MaxWidth>
        </section>

        {/* 7-STAGE PIPELINE — animated with AnimatedBeam */}
        <section className="relative w-full py-24">
          <MaxWidth as="div">
            <BlurFade>
              <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-secondary">
                {homeCopy.pipeline.eyebrow}
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl text-balance text-center text-3xl font-medium tracking-tighter md:text-4xl">
                {homeCopy.pipeline.title}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-balance text-center text-muted-foreground">
                {homeCopy.pipeline.description}
              </p>
            </BlurFade>
            <BlurFade delay={0.1}>
              <AnimatedPipeline stages={homeCopy.pipeline.stages} />
            </BlurFade>
          </MaxWidth>
        </section>

        {/* ICP TRIPTYCH WITH ORBITING CIRCLES */}
        <section className="relative w-full overflow-hidden bg-card py-24">
          <MaxWidth as="div" className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <BlurFade>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-secondary">
                  {homeCopy.icps.eyebrow}
                </p>
                <h2 className="mt-3 text-balance text-3xl font-medium tracking-tighter md:text-4xl">
                  {homeCopy.icps.title}
                </h2>
              </BlurFade>

              <div className="mt-8 space-y-3">
                {homeCopy.icps.cards.map((c) => {
                  const Icon = ICP_ICONS[c.label as keyof typeof ICP_ICONS];
                  return (
                    <Link
                      key={c.href}
                      href={c.href}
                      className="group flex items-start gap-4 rounded-xl border border-border bg-background p-5 transition-all hover:border-secondary/40 hover:shadow-sm"
                    >
                      {Icon ? <Icon className="size-5 shrink-0 text-secondary" /> : null}
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-foreground">{c.label}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{c.copy}</p>
                      </div>
                      <ArrowRight className="size-4 shrink-0 -translate-x-1 self-center text-secondary opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="relative aspect-square w-full lg:col-span-7">
              <OrbitingCircles radius={120} duration={28} iconSize={44}>
                {homeCopy.pillars.cards.map((card) => {
                  const Icon = PILLAR_ICONS[card.title as keyof typeof PILLAR_ICONS];
                  return (
                    <div
                      key={card.title}
                      className="flex size-11 items-center justify-center rounded-xl border border-border bg-background shadow-md"
                    >
                      {Icon ? <Icon className="size-5 text-secondary" /> : null}
                    </div>
                  );
                })}
              </OrbitingCircles>
              <OrbitingCircles radius={200} duration={40} iconSize={36} reverse index={1}>
                {[Database, Sparkles, ShieldCheck, Users, Briefcase, Building2].map((Icon, i) => (
                  <div
                    key={i}
                    className="flex size-9 items-center justify-center rounded-lg border border-border bg-background shadow-sm"
                  >
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                ))}
              </OrbitingCircles>
              <div className="absolute left-1/2 top-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-secondary/60 shadow-xl ring-4 ring-secondary/20">
                <ShieldAlert className="size-9 text-white" />
              </div>
            </div>
          </MaxWidth>
        </section>

        {/* FAQ */}
        <section className="w-full py-24">
          <MaxWidth as="div">
            <BlurFade>
              <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-secondary">
                {homeCopy.faq.eyebrow}
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl text-balance text-center text-3xl font-medium tracking-tighter md:text-4xl">
                {homeCopy.faq.title}
              </h2>
            </BlurFade>
            <BlurFade delay={0.1} className="mx-auto mt-10 max-w-3xl">
              <Accordion type="single" collapsible>
                {homeCopy.faq.items.map((it, i) => (
                  <AccordionItem key={i} value={`q${i}`}>
                    <AccordionTrigger>{it.q}</AccordionTrigger>
                    <AccordionContent>{it.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </BlurFade>
          </MaxWidth>
        </section>

        {/* FINAL CTA */}
        <section className="relative isolate w-full overflow-hidden py-24">
          <div className="absolute inset-0 -z-10 [background:radial-gradient(125%_125%_at_50%_50%,var(--background)_30%,oklch(54.65%_0.246_262.87/0.15)_100%)]" />
          <MaxWidth as="div" className="text-center">
            <BlurFade>
              <h2 className="mx-auto max-w-2xl text-balance text-3xl font-medium tracking-tighter md:text-4xl">
                {homeCopy.finalCta.title}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-balance text-muted-foreground">
                {homeCopy.finalCta.description}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ShimmerButton
                  href={homeCopy.finalCta.primary.href}
                  background="var(--secondary)"
                  shimmerColor="var(--secondary)"
                  className="text-secondary-foreground"
                >
                  {homeCopy.finalCta.primary.label}
                </ShimmerButton>
                <PillButton href={homeCopy.finalCta.secondary.href} variant="secondary">
                  {homeCopy.finalCta.secondary.label}
                </PillButton>
              </div>
            </BlurFade>
          </MaxWidth>
        </section>
      </main>
    </>
  );
}
