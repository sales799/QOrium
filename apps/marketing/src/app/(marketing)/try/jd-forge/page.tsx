import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  FileSearch,
  Fingerprint,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { JdForgeDemo } from '@/components/interactive-proof/JdForgeDemo';
import { FlickeringGrid } from '@/components/magicui/FlickeringGrid';
import { FadeIn } from '@/components/motion/FadeIn';
import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { BreadcrumbJsonLd, WebPageJsonLd } from '@/components/seo/JsonLd';
import { MaxWidth } from '@/components/site/MaxWidth';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/content/site.config';

const pageDescription =
  'Try QOrium JD-Forge with any job title or pasted job description and inspect the generated skills, assessment mix, confidence posture, plan evidence, and PDF handoff.';

export const metadata: Metadata = {
  title: 'Try JD-Forge - QOrium proof lab',
  description: pageDescription,
  alternates: { canonical: '/try/jd-forge' },
};

const heroStats = [
  { value: 'Any', label: 'job title or pasted JD' },
  { value: '16', label: 'visible skill slots' },
  { value: '0', label: 'candidate records required' },
] as const;

const safetyCards = [
  {
    title: 'Not limited to sample buttons',
    body: 'The public lab accepts a typed role title or a pasted JD, then publishes the draft it used to build the plan.',
    icon: Search,
  },
  {
    title: 'Honest confidence state',
    body: 'Weak input stays flagged for SME review instead of being padded with fake certainty.',
    icon: ShieldCheck,
  },
  {
    title: 'Buyer-safe handoff',
    body: 'The plan evidence uses a short fingerprint and plan ID so buyers can discuss output without exposing private records.',
    icon: LockKeyhole,
  },
] as const;

const proofPath = [
  {
    title: 'Research the role title',
    body: 'For a title-only input, JD-Forge generates a public research draft with seniority, role family, and expected skill clusters.',
    icon: Search,
  },
  {
    title: 'Parse pasted JD evidence',
    body: 'For a custom JD, it reads responsibilities, must-have skills, tools, platforms, seniority, and domain terms.',
    icon: FileSearch,
  },
  {
    title: 'Publish an assessment mix',
    body: 'The output converts extracted skills into item count, duration, format mix, weights, and coverage status.',
    icon: ClipboardCheck,
  },
  {
    title: 'Keep review visible',
    body: 'The plan preserves confidence and evidence notes so SMEs can correct the role graph before candidates see it.',
    icon: BadgeCheck,
  },
] as const;

const trustNotes = [
  'Custom JD input stays visible',
  'No candidate PII required',
  'Plan evidence is demo-safe',
] as const;

export default function TryJdForgePage() {
  return (
    <>
      <WebPageJsonLd
        name="Try QOrium JD-Forge"
        description={pageDescription}
        url={`${siteConfig.url}/try/jd-forge`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Try QOrium', path: '/try' },
          { name: 'JD-Forge', path: '/try/jd-forge' },
        ]}
      />

      <section className="surface-shell evidence-ledger relative isolate overflow-hidden border-b border-white/10">
        <FlickeringGrid
          className="absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black_0%,transparent_74%)]"
          squareSize={3}
          gridGap={7}
          flickerChance={0.1}
          maxOpacity={0.14}
          color="var(--secondary)"
        />
        <MaxWidth as="div" className="py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-end">
            <FadeIn>
              <p className="font-mono text-xs font-semibold uppercase text-signal-300">
                JD-Forge proof lab
              </p>
              <h1 className="mt-5 max-w-5xl text-balance text-5xl font-semibold text-white md:text-7xl">
                Turn any role into an assessment plan buyers can inspect.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-shell-muted">
                Enter a job title or paste a real JD. JD-Forge publishes the research draft,
                extracted skills, item mix, confidence posture, and plan evidence so the buyer can
                challenge the assessment before a candidate ever sees it.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="#jd-forge-demo">
                    Generate a plan
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/try/graded-answer">Audit a graded answer</Link>
                </Button>
              </div>
              <dl className="mt-10 grid gap-3 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="border border-white/10 bg-white/[0.045] p-4">
                    <dt className="text-3xl font-semibold text-white">{stat.value}</dt>
                    <dd className="mt-1 text-sm leading-5 text-shell-muted">{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 backdrop-blur">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-black/20 text-signal-300">
                    <Sparkles className="size-5" />
                  </span>
                  <div>
                    <p className="font-mono text-xs font-semibold uppercase text-signal-300">
                      Built for imperfect buyer input
                    </p>
                    <p className="mt-3 text-sm leading-6 text-shell-muted">
                      The demo shows both paths: role-title research when a buyer only has a title,
                      and evidence extraction when they paste a detailed JD.
                    </p>
                  </div>
                </div>
                <div className="mt-6 grid gap-3">
                  {safetyCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <div key={card.title} className="border-t border-white/10 pt-4">
                        <div className="flex items-center gap-3">
                          <Icon className="size-5 text-signal-300" />
                          <h2 className="text-base font-semibold text-white">{card.title}</h2>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-shell-muted">{card.body}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeIn>
          </div>
        </MaxWidth>
      </section>

      <section id="jd-forge-demo" className="bg-background py-14 md:py-16">
        <MaxWidth as="div">
          <Reveal>
            <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_24rem] lg:items-end">
              <div>
                <p className="font-mono text-xs font-semibold uppercase text-secondary">
                  Live assessment planner
                </p>
                <h2 className="mt-3 max-w-3xl text-3xl font-semibold md:text-5xl">
                  Paste any JD or start with just a title.
                </h2>
              </div>
              <div className="rounded-lg border border-product-500/25 bg-product-100/60 p-4 text-sm leading-6 text-foreground">
                <div className="flex items-start gap-3">
                  <Fingerprint className="mt-0.5 size-5 shrink-0 text-product-500" />
                  <p>
                    Demo-safe evidence. The plan exposes extracted skills and short fingerprints,
                    not candidate records or customer-private assessment content.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
          <JdForgeDemo />
        </MaxWidth>
      </section>

      <section className="border-t border-border bg-background py-16 md:py-20">
        <MaxWidth as="div">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <p className="font-mono text-xs font-semibold uppercase text-secondary">
                  What this proves
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-foreground md:text-5xl">
                  JD-specific tests need visible reasoning, not magic.
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  The page gives a buyer a concrete way to challenge the generated plan: what
                  evidence was read, which skills were selected, how much coverage exists, and where
                  SME review should stay active.
                </p>
              </div>

              <Stagger className="grid gap-3 sm:grid-cols-2">
                {proofPath.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <StaggerItem key={step.title}>
                      <article className="h-full rounded-lg border border-border bg-card p-5">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-md border border-border bg-background font-mono text-xs text-secondary">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <Icon className="size-5 text-secondary" />
                        </div>
                        <h3 className="mt-5 text-lg font-semibold text-foreground">{step.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
                      </article>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </div>
          </Reveal>
        </MaxWidth>
      </section>

      <section className="surface-shell border-t border-white/10 py-14 md:py-16">
        <MaxWidth as="div">
          <Reveal>
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-mono text-xs font-semibold uppercase text-signal-300">
                  Buyer next step
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
                  Bring one real role into a guided QOrium demo.
                </h2>
                <div className="mt-5 grid gap-2 text-sm text-shell-muted sm:grid-cols-3">
                  {trustNotes.map((note) => (
                    <div key={note} className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-signal-300" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button asChild size="lg">
                <Link href="/demo">
                  Book a demo
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </MaxWidth>
      </section>
    </>
  );
}
