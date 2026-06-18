import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  ClipboardCheck,
  FileText,
  Fingerprint,
  Scale,
  ShieldCheck,
} from 'lucide-react';

import { GradedAnswerViewer } from '@/components/interactive-proof/GradedAnswerViewer';
import { FadeIn } from '@/components/motion/FadeIn';
import { Reveal } from '@/components/motion/Reveal';
import { MaxWidth } from '@/components/site/MaxWidth';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Try AI Graded Answer Viewer',
  description:
    'Audit a QOrium AI grading example with the answer, rubric, score breakdown, reasoning trace, and replay-safe metadata.',
  alternates: { canonical: '/try/graded-answer' },
};

const proofStats = [
  { value: '8', label: 'public exemplars' },
  { value: '5', label: 'audit fields' },
  { value: '0', label: 'candidate data exposed' },
] as const;

const proofFlow = [
  {
    title: 'Answer captured',
    body: 'The buyer sees the exact response being graded, not a hidden model output.',
    icon: FileText,
  },
  {
    title: 'Rubric anchored',
    body: 'Each score maps back to observable criteria and visible criterion weights.',
    icon: Scale,
  },
  {
    title: 'Reasoning exposed',
    body: 'The trace shows why the grader awarded or withheld credit.',
    icon: ClipboardCheck,
  },
  {
    title: 'Audit replayable',
    body: 'Public demo fingerprints prove the shape of replay metadata without exposing private records.',
    icon: Fingerprint,
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
      <section className="surface-shell evidence-ledger border-b border-white/10 py-16 md:py-20">
        <MaxWidth as="div">
          <FadeIn>
            <div className="max-w-5xl">
              <p className="font-mono text-xs font-semibold uppercase text-signal-300">
                AI grading proof
              </p>
              <h1 className="mt-4 text-balance text-5xl font-semibold text-white md:text-7xl">
                Audit AI grading before you trust it.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-shell-muted">
                Inspect the answer, rubric, criterion scores, reasoning trace, and privacy-safe
                audit metadata behind a QOrium grade. The demo proves the mechanism without
                publishing private candidate data.
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
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-3">
              {proofStats.map((stat) => (
                <div
                  key={stat.label}
                  className="border border-white/10 bg-white/[0.045] p-4 backdrop-blur"
                >
                  <p className="text-3xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-1 text-sm text-shell-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </MaxWidth>
      </section>

      <section id="graded-answer-demo" className="bg-background py-12 md:py-16">
        <MaxWidth as="div">
          <Reveal>
            <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_24rem] lg:items-end">
              <div>
                <p className="font-mono text-xs font-semibold uppercase text-secondary">
                  Live audit packet
                </p>
                <h2 className="mt-3 max-w-3xl text-3xl font-semibold md:text-4xl">
                  A buyer can inspect the grade, not just accept it.
                </h2>
              </div>
              <div className="border border-product-500/25 bg-product-100/60 p-4 text-sm leading-6 text-foreground">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-product-500" />
                  <p>
                    Public demo, private-safe metadata. The exemplars are synthetic and the
                    fingerprints are demo identifiers, not customer records.
                  </p>
                </div>
              </div>
            </div>
            <GradedAnswerViewer />
          </Reveal>
        </MaxWidth>
      </section>

      <section className="surface-product border-t border-border py-14 md:py-16">
        <MaxWidth as="div">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
              <div>
                <p className="font-mono text-xs font-semibold uppercase text-secondary">
                  What this proves
                </p>
                <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
                  QOrium grading is designed for review, not blind automation.
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  The page gives hiring teams a concrete way to judge the grader itself: how it
                  reads an answer, what rubric signals it rewards, what evidence it records, and
                  where human review can respond.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {proofFlow.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.title} className="border border-border bg-card p-5">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center border border-border bg-background font-mono text-xs text-secondary">
                          {index + 1}
                        </span>
                        <Icon className="size-5 text-secondary" />
                      </div>
                      <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
                    </div>
                  );
                })}
              </div>
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
