import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  FileText,
  Fingerprint,
  LockKeyhole,
  Scale,
  ShieldCheck,
} from 'lucide-react';

import { GradedAnswerViewer } from '@/components/interactive-proof/GradedAnswerViewer';
import { FlickeringGrid } from '@/components/magicui/FlickeringGrid';
import { FadeIn } from '@/components/motion/FadeIn';
import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { BreadcrumbJsonLd, WebPageJsonLd } from '@/components/seo/JsonLd';
import { MaxWidth } from '@/components/site/MaxWidth';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/content/site.config';

const pageDescription =
  'Audit a public QOrium AI grading packet with synthetic answers, rubric scoring, reasoning trace, feedback capture, and demo-safe audit metadata.';

export const metadata: Metadata = {
  title: 'Try AI Grading Audit - QOrium proof lab',
  description: pageDescription,
  alternates: { canonical: '/try/graded-answer' },
};

const proofStats = [
  { value: '8', label: 'public exemplars' },
  { value: '5', label: 'demo-safe audit fields' },
  { value: '0', label: 'private records exposed' },
] as const;

const reviewPath = [
  {
    title: 'Answer visible',
    body: 'The packet shows the exact synthetic answer being scored, not a hidden model summary.',
    icon: FileText,
  },
  {
    title: 'Rubric anchored',
    body: 'Each score maps back to visible criteria, weights, and evidence notes.',
    icon: Scale,
  },
  {
    title: 'Reasoning reviewable',
    body: 'The trace explains why credit was awarded or withheld so SMEs can challenge it.',
    icon: ClipboardCheck,
  },
  {
    title: 'Metadata safe',
    body: 'Demo fingerprints prove replay shape without publishing prompts, candidates, or customer records.',
    icon: Fingerprint,
  },
] as const;

const safetyCards = [
  {
    title: 'Synthetic packet only',
    body: 'The public examples are authored fixtures for buyer review. They are not real candidate submissions.',
    icon: ShieldCheck,
  },
  {
    title: 'No raw prompt leakage',
    body: 'The page shows fingerprints and release labels, not prompt bodies or private grading instructions.',
    icon: LockKeyhole,
  },
  {
    title: 'Human review stays visible',
    body: 'The feedback buttons and reasoning trace make the page about reviewer control, not blind automation.',
    icon: BadgeCheck,
  },
] as const;

const trustNotes = [
  'Synthetic public exemplars only',
  'No real candidate answer or customer prompt on this page',
  'Production records remain customer-owned and privacy controlled',
] as const;

export default function TryGradedAnswerPage() {
  return (
    <>
      <WebPageJsonLd
        name="Try QOrium AI grading audit"
        description={pageDescription}
        url={`${siteConfig.url}/try/graded-answer`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Try QOrium', path: '/try' },
          { name: 'AI grading audit', path: '/try/graded-answer' },
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
                AI grading audit lab
              </p>
              <h1 className="mt-5 max-w-5xl text-balance text-5xl font-semibold text-white md:text-7xl">
                Audit an AI grade before you trust it.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-shell-muted">
                Open a public grading packet and inspect the answer, rubric, score breakdown,
                reasoning trace, reviewer feedback loop, and demo-safe metadata. The page proves
                auditability without publishing private candidate or customer records.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="#graded-answer-demo">
                    Inspect live grade
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/try/jd-forge">Build a plan from a JD</Link>
                </Button>
              </div>
              <dl className="mt-10 grid gap-3 sm:grid-cols-3">
                {proofStats.map((stat) => (
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
                    <ShieldCheck className="size-5" />
                  </span>
                  <div>
                    <p className="font-mono text-xs font-semibold uppercase text-signal-300">
                      Safe for a marketing demo
                    </p>
                    <p className="mt-3 text-sm leading-6 text-shell-muted">
                      Buyers see how audit records are shaped, but the public page only uses
                      synthetic examples and display-safe identifiers.
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

      <section id="graded-answer-demo" className="bg-background py-14 md:py-16">
        <MaxWidth as="div">
          <Reveal>
            <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_24rem] lg:items-end">
              <div>
                <p className="font-mono text-xs font-semibold uppercase text-secondary">
                  Live audit packet
                </p>
                <h2 className="mt-3 max-w-3xl text-3xl font-semibold md:text-5xl">
                  A buyer can inspect the grade, not just accept it.
                </h2>
              </div>
              <div className="rounded-lg border border-product-500/25 bg-product-100/60 p-4 text-sm leading-6 text-foreground">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-product-500" />
                  <p>
                    Demo-safe metadata. The visible identifiers prove replay behavior without
                    exposing prompt text, real candidates, or customer records.
                  </p>
                </div>
              </div>
            </div>
            <GradedAnswerViewer />
          </Reveal>
        </MaxWidth>
      </section>

      <section className="surface-product border-t border-border py-16 md:py-20">
        <MaxWidth as="div">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <p className="font-mono text-xs font-semibold uppercase text-secondary">
                  What this proves
                </p>
                <h2 className="mt-3 text-3xl font-semibold md:text-5xl">
                  Grading must be reviewable before it can be trusted.
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  The demo lets hiring teams test the grader itself: how it reads an answer, what
                  rubric signals it rewards, where it loses confidence, and what evidence remains
                  for audit review.
                </p>
              </div>

              <Stagger className="grid gap-3 sm:grid-cols-2">
                {reviewPath.map((step, index) => {
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
                        <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
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
                  See this audit trail on a role your team is hiring for.
                </h2>
                <div className="mt-5 grid gap-2 text-sm text-shell-muted sm:grid-cols-3">
                  {trustNotes.map((note) => (
                    <div key={note} className="flex items-center gap-2">
                      <ShieldCheck className="size-4 shrink-0 text-signal-300" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Button asChild size="lg">
                  <Link href="/demo">Book a demo</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/resources/docs">View API docs</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </MaxWidth>
      </section>
    </>
  );
}
